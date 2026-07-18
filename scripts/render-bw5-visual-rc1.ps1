$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$shots = Join-Path $projectRoot "build-week\bw5\screenshots"
$videoDir = Join-Path $projectRoot "build-week\video"
$sourceVideo = Join-Path $videoDir "hybrid-final-demo.mp4"
$outputVideo = Join-Path $videoDir "hybrid-visual-rc1-demo.mp4"

$segments = @(
  @{ File = "post-landing-1440x900.jpg"; Duration = 15 },
  @{ File = "post-landing-1440x900.jpg"; Duration = 20 },
  @{ File = "post-jobs-1440x900.jpg"; Duration = 30 },
  @{ File = "video-evidence-1440x900.jpg"; Duration = 20 },
  @{ File = "video-constraints-1440x900.jpg"; Duration = 15 },
  @{ File = "post-score-receipt-1440x900.jpg"; Duration = 9 },
  @{ File = "post-score-change-1440x900.jpg"; Duration = 9 },
  @{ File = "video-strategy-1440x900.jpg"; Duration = 22 },
  @{ File = "post-trust-1440x900.jpg"; Duration = 20 },
  @{ File = "post-landing-1440x900.jpg"; Duration = 10 }
)

$ffmpegArgs = @("-y")
foreach ($segment in $segments) {
  $ffmpegArgs += @("-loop", "1", "-framerate", "30", "-t", [string]$segment.Duration, "-i", (Join-Path $shots $segment.File))
}
$ffmpegArgs += @("-i", $sourceVideo)

$filters = for ($index = 0; $index -lt $segments.Count; $index += 1) {
  "[$index`:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0xfbf7ed,setpts=PTS-STARTPTS,format=yuv420p[v$index]"
}
$concatInputs = (0..($segments.Count - 1) | ForEach-Object { "[v$_]" }) -join ""
$filterComplex = ($filters -join ";") + ";" + $concatInputs + "concat=n=$($segments.Count):v=1:a=0,format=yuv420p[v]"

$sourceIndex = $segments.Count
$ffmpegArgs += @(
  "-filter_complex", $filterComplex,
  "-map", "[v]",
  "-map", "$sourceIndex`:a:0",
  "-map", "$sourceIndex`:s:0",
  "-c:v", "libx264",
  "-preset", "fast",
  "-crf", "23",
  "-r", "30",
  "-c:a", "copy",
  "-c:s", "copy",
  "-metadata:s:s:0", "language=eng",
  "-t", "170",
  "-movflags", "+faststart",
  $outputVideo
)

& ffmpeg @ffmpegArgs
if ($LASTEXITCODE -ne 0) { throw "FFmpeg failed with exit code $LASTEXITCODE." }

$duration = [double](& ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $outputVideo)
if ($duration -ge 180) { throw "Video duration $duration is not below 180 seconds." }

Write-Output ("VIDEO_SECONDS={0:N3}" -f $duration)
Write-Output "VIDEO_FILE=$outputVideo"
