$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$videoDir = Join-Path $projectRoot "build-week\video"
$proofDir = Join-Path $projectRoot "build-week\bw3"
$voiceoverPath = Join-Path $videoDir "hybrid-final-voiceover.md"
$audioPath = Join-Path $videoDir "hybrid-final-voiceover.wav"
$outputPath = Join-Path $videoDir "hybrid-final-demo.mp4"
$captionsPath = Join-Path $videoDir "hybrid-final-captions.srt"
& powershell.exe -NoProfile -ExecutionPolicy Bypass -File (Join-Path $projectRoot "scripts\render-video-slides.ps1")
if ($LASTEXITCODE -ne 0) { throw "Slide rendering failed with exit code $LASTEXITCODE." }

Add-Type -AssemblyName System.Speech
$voiceoverText = [System.IO.File]::ReadAllText($voiceoverPath, [System.Text.Encoding]::UTF8)
$voiceoverText = [System.Text.RegularExpressions.Regex]::Replace($voiceoverText, "(?m)^#.*$", "")
$voiceoverText = [System.Text.RegularExpressions.Regex]::Replace($voiceoverText, "\s+", " ").Trim()
$speaker = New-Object System.Speech.Synthesis.SpeechSynthesizer
$speaker.Rate = -2
$speaker.Volume = 100
$speaker.SetOutputToWaveFile($audioPath)
$speaker.Speak($voiceoverText)
$speaker.Dispose()

$audioDuration = [double](& ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $audioPath)
$targetNarration = 168.0
$tempo = $audioDuration / $targetNarration
if ($tempo -lt 0.5 -or $tempo -gt 2.0) { throw "Narration tempo $tempo is outside FFmpeg atempo bounds." }
$tempoText = $tempo.ToString("0.000000", [System.Globalization.CultureInfo]::InvariantCulture)

$slideDir = Join-Path $videoDir "slides"
$slides = @("01-trust-problem.png", "02-architecture.png", "03-catalog.png", "04-evidence.png", "05-score-change.png", "06-heavy-reasoning.png", "07-closing.png") | ForEach-Object { Join-Path $slideDir $_ }
$ffmpegArgs = @(
  "-y",
  "-loop", "1", "-framerate", "30", "-t", "15", "-i", $slides[0],
  "-loop", "1", "-framerate", "30", "-t", "20", "-i", $slides[1],
  "-loop", "1", "-framerate", "30", "-t", "25", "-i", $slides[2],
  "-loop", "1", "-framerate", "30", "-t", "30", "-i", $slides[3],
  "-loop", "1", "-framerate", "30", "-t", "30", "-i", $slides[4],
  "-loop", "1", "-framerate", "30", "-t", "25", "-i", $slides[5],
  "-loop", "1", "-framerate", "30", "-t", "25", "-i", $slides[6],
  "-i", $audioPath,
  "-i", $captionsPath,
  "-filter_complex", "[0:v]setpts=PTS-STARTPTS,format=yuv420p[v0];[1:v]setpts=PTS-STARTPTS,format=yuv420p[v1];[2:v]setpts=PTS-STARTPTS,format=yuv420p[v2];[3:v]setpts=PTS-STARTPTS,format=yuv420p[v3];[4:v]setpts=PTS-STARTPTS,format=yuv420p[v4];[5:v]setpts=PTS-STARTPTS,format=yuv420p[v5];[6:v]setpts=PTS-STARTPTS,format=yuv420p[v6];[v0][v1][v2][v3][v4][v5][v6]concat=n=7:v=1:a=0,format=yuv420p[v];[7:a]atempo=$tempoText,apad=pad_dur=170[a]",
  "-map", "[v]", "-map", "[a]", "-map", "8:0",
  "-c:v", "libx264", "-preset", "fast", "-crf", "23", "-r", "30",
  "-c:a", "aac", "-b:a", "160k", "-c:s", "mov_text", "-metadata:s:s:0", "language=eng",
  "-t", "170", "-movflags", "+faststart", $outputPath
)
& ffmpeg @ffmpegArgs
if ($LASTEXITCODE -ne 0) { throw "FFmpeg failed with exit code $LASTEXITCODE." }

$videoDuration = [double](& ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 $outputPath)
if ($videoDuration -lt 160 -or $videoDuration -gt 175) { throw "Rendered video duration $videoDuration is outside the required 160-175 second range." }
Write-Output ("VOICEOVER_SECONDS={0:N3}" -f $audioDuration)
Write-Output ("VIDEO_SECONDS={0:N3}" -f $videoDuration)
Write-Output "VIDEO_FILE=$outputPath"
