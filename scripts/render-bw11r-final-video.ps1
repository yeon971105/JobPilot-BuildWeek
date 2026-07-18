$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$captureDir = Join-Path $projectRoot "build-week\bw11r\screenshots"
$videoDir = Join-Path $projectRoot "build-week\video"
$voiceoverPath = Join-Path $videoDir "jobpilot-final-product-voiceover.md"
$captionsPath = Join-Path $videoDir "jobpilot-final-product-captions.srt"
$audioPath = Join-Path $videoDir "jobpilot-final-product-voiceover.tmp.wav"
$outputPath = Join-Path $videoDir "jobpilot-final-product-rc1.mp4"
$thumbnailPath = Join-Path $videoDir "jobpilot-final-product-thumbnail.png"
$manifestPath = Join-Path $videoDir "jobpilot-final-product-recording-manifest.json"

$segments = @(
  @{ File = "landing-certified-1440x900.png"; Duration = 14; Story = "Application fatigue" },
  @{ File = "for-you-certified-1440x900.png"; Duration = 20; Story = "Landing and For You shortlist" },
  @{ File = "jobs-certified-1440x900.png"; Duration = 20; Story = "Visible rationale and profile-aware discovery" },
  @{ File = "detail-overview-certified-1440x900.png"; Duration = 26; Story = "Visual role decision" },
  @{ File = "detail-evidence-expanded-certified-1440x900.png"; Duration = 16; Story = "Evidence on demand" },
  @{ File = "detail-score-proof-certified-1440x900.png"; Duration = 8; Story = "Visual Score Proof" },
  @{ File = "receipt-valid-certified-1440x900.png"; Duration = 7; Story = "Independent receipt verifier" },
  @{ File = "employer-destination-certified-1440x900.png"; Duration = 14; Story = "Direct employer destination" },
  @{ File = "tracker-populated-certified-1440x900.png"; Duration = 13; Story = "Browser-local tracker" },
  @{ File = "trust-lab-certified-1440x900.png"; Duration = 19; Story = "Gemma, deterministic score, GPT-5.6, and Codex" },
  @{ File = "landing-certified-1440x900.png"; Duration = 18; Story = "Impact, limitations, and closing" }
)

foreach ($segment in $segments) {
  $capturePath = Join-Path $captureDir $segment.File
  if (-not (Test-Path -LiteralPath $capturePath)) { throw "Missing certified capture: $capturePath" }
}

Add-Type -AssemblyName System.Speech
$voiceoverText = [System.IO.File]::ReadAllText($voiceoverPath, [System.Text.Encoding]::UTF8)
$voiceoverText = [System.Text.RegularExpressions.Regex]::Replace($voiceoverText, "(?m)^#.*$", "")
$voiceoverText = [System.Text.RegularExpressions.Regex]::Replace($voiceoverText, "\s+", " ").Trim()
$speaker = New-Object System.Speech.Synthesis.SpeechSynthesizer
$speaker.Rate = -1
$speaker.Volume = 100
$speaker.SetOutputToWaveFile($audioPath)
$speaker.Speak($voiceoverText)
$speaker.Dispose()

$audioDuration = [double](& ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $audioPath)
$targetNarration = 173.0
$tempo = $audioDuration / $targetNarration
if ($tempo -lt 0.5 -or $tempo -gt 2.0) { throw "Narration tempo $tempo is outside FFmpeg atempo bounds." }
$tempoText = $tempo.ToString("0.000000", [System.Globalization.CultureInfo]::InvariantCulture)

$ffmpegArgs = @("-y")
foreach ($segment in $segments) {
  $ffmpegArgs += @("-loop", "1", "-framerate", "30", "-t", [string]$segment.Duration, "-i", (Join-Path $captureDir $segment.File))
}
$ffmpegArgs += @("-i", $audioPath, "-i", $captionsPath)
$filters = for ($index = 0; $index -lt $segments.Count; $index += 1) {
  "[$index`:v]scale=1920:1080:force_original_aspect_ratio=decrease,pad=1920:1080:(ow-iw)/2:(oh-ih)/2:color=0xfbf7ed,setsar=1,setpts=PTS-STARTPTS,format=yuv420p[v$index]"
}
$concatInputs = (0..($segments.Count - 1) | ForEach-Object { "[v$_]" }) -join ""
$audioIndex = $segments.Count
$captionIndex = $segments.Count + 1
$filterComplex = ($filters -join ";") + ";" + $concatInputs + "concat=n=$($segments.Count):v=1:a=0,format=yuv420p[v];[$audioIndex`:a]atempo=$tempoText,apad=pad_dur=175[a]"
$ffmpegArgs += @(
  "-filter_complex", $filterComplex,
  "-map", "[v]", "-map", "[a]", "-map", "$captionIndex`:0",
  "-c:v", "libx264", "-preset", "fast", "-crf", "22", "-r", "30", "-pix_fmt", "yuv420p",
  "-c:a", "aac", "-b:a", "160k", "-metadata:s:a:0", "language=eng",
  "-c:s", "mov_text", "-metadata:s:s:0", "language=eng",
  "-metadata", "title=JobPilot Final Product RC1",
  "-metadata", "comment=Certified synthetic product captures; zero OpenAI API calls; no personal data or application submission",
  "-t", "175", "-movflags", "+faststart", $outputPath
)
& ffmpeg @ffmpegArgs
if ($LASTEXITCODE -ne 0) { throw "FFmpeg failed with exit code $LASTEXITCODE." }

& ffmpeg -y -i (Join-Path $captureDir "landing-certified-1440x900.png") -vf "scale=1280:720:force_original_aspect_ratio=decrease,pad=1280:720:(ow-iw)/2:(oh-ih)/2:color=0xfbf7ed" -frames:v 1 $thumbnailPath
if ($LASTEXITCODE -ne 0) { throw "Thumbnail rendering failed." }

$probe = (& ffprobe -v error -show_entries format=duration -show_streams -of json $outputPath) | ConvertFrom-Json
$duration = [double]$probe.format.duration
$videoStream = $probe.streams | Where-Object { $_.codec_type -eq "video" } | Select-Object -First 1
$audioStream = $probe.streams | Where-Object { $_.codec_type -eq "audio" } | Select-Object -First 1
$captionStream = $probe.streams | Where-Object { $_.codec_type -eq "subtitle" } | Select-Object -First 1
if ($duration -lt 165 -or $duration -gt 175.1) { throw "Video duration $duration is outside 165-175 seconds." }
if ($videoStream.width -ne 1920 -or $videoStream.height -ne 1080 -or $videoStream.codec_name -ne "h264" -or $audioStream.codec_name -ne "aac" -or -not $captionStream) { throw "Required H.264 video, AAC audio, or embedded caption stream is missing." }

$segmentManifest = foreach ($segment in $segments) {
  $capturePath = Join-Path $captureDir $segment.File
  [ordered]@{ file = $segment.File; durationSeconds = $segment.Duration; story = $segment.Story; sha256 = (Get-FileHash -Algorithm SHA256 -LiteralPath $capturePath).Hash.ToLowerInvariant() }
}
$manifest = [ordered]@{
  schemaVersion = "jobpilot.final-product-video.v1"
  generatedAt = [DateTimeOffset]::UtcNow.ToString("o")
  commitAtRender = (& git -C $projectRoot rev-parse HEAD).Trim()
  output = "build-week/video/jobpilot-final-product-rc1.mp4"
  durationSeconds = [Math]::Round($duration, 3)
  resolution = "1920x1080"
  videoCodec = $videoStream.codec_name
  audioCodec = $audioStream.codec_name
  captionsCodec = $captionStream.codec_name
  captionsLanguage = "eng"
  narrationLanguage = "English"
  music = $false
  actualCertifiedProductCaptures = $true
  publicSafeSynthetic = $true
  privateData = $false
  thirdPartyLogos = $false
  openAiApiRequests = 0
  openAiApiCostUsd = 0
  applicationSubmissions = 0
  humanStudyResultsClaimed = $false
  videoSha256 = (Get-FileHash -Algorithm SHA256 -LiteralPath $outputPath).Hash.ToLowerInvariant()
  thumbnailSha256 = (Get-FileHash -Algorithm SHA256 -LiteralPath $thumbnailPath).Hash.ToLowerInvariant()
  segments = $segmentManifest
  result = "PASS"
}
[System.IO.File]::WriteAllText($manifestPath, ($manifest | ConvertTo-Json -Depth 8) + "`n", [System.Text.UTF8Encoding]::new($false))
if (Test-Path -LiteralPath $audioPath) { Remove-Item -LiteralPath $audioPath }
Write-Output ("VOICEOVER_SOURCE_SECONDS={0:N3}" -f $audioDuration)
Write-Output ("VIDEO_SECONDS={0:N3}" -f $duration)
Write-Output "VIDEO_FILE=$outputPath"
