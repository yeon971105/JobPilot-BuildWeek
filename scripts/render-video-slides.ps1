$ErrorActionPreference = "Stop"
Add-Type -AssemblyName System.Drawing

$projectRoot = Split-Path -Parent $PSScriptRoot
$slideDir = Join-Path $projectRoot "build-week\video\slides"
if (-not (Test-Path $slideDir)) { New-Item -ItemType Directory -Path $slideDir | Out-Null }
$ivory = [System.Drawing.Color]::FromArgb(251, 247, 237)
$forest = [System.Drawing.Color]::FromArgb(23, 61, 45)
$sage = [System.Drawing.Color]::FromArgb(237, 244, 234)
$gold = [System.Drawing.Color]::FromArgb(161, 116, 45)
$muted = [System.Drawing.Color]::FromArgb(88, 112, 100)
$white = [System.Drawing.Color]::FromArgb(255, 253, 247)
$border = [System.Drawing.Color]::FromArgb(215, 223, 211)

function New-Slide([string]$eyebrow, [string]$title, [string]$subtitle) {
  $bitmap = New-Object System.Drawing.Bitmap 1920, 1080
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
  $graphics.Clear($ivory)
  $graphics.DrawString("JobPilot", (New-Object System.Drawing.Font("Georgia", 24, [System.Drawing.FontStyle]::Bold)), (New-Object System.Drawing.SolidBrush($forest)), 70, 45)
  $graphics.DrawString("BUILD WEEK 2026  /  LOCAL-FIRST AI", (New-Object System.Drawing.Font("Segoe UI", 15, [System.Drawing.FontStyle]::Bold)), (New-Object System.Drawing.SolidBrush($gold)), 1450, 55)
  $graphics.DrawString($eyebrow.ToUpperInvariant(), (New-Object System.Drawing.Font("Segoe UI", 18, [System.Drawing.FontStyle]::Bold)), (New-Object System.Drawing.SolidBrush($gold)), 75, 145)
  $graphics.DrawString($title, (New-Object System.Drawing.Font("Georgia", 54, [System.Drawing.FontStyle]::Bold)), (New-Object System.Drawing.SolidBrush($forest)), (New-Object System.Drawing.RectangleF(70, 195, 1760, 150)))
  $graphics.DrawString($subtitle, (New-Object System.Drawing.Font("Segoe UI", 23)), (New-Object System.Drawing.SolidBrush($muted)), (New-Object System.Drawing.RectangleF(75, 340, 1700, 110)))
  return @{ Bitmap = $bitmap; Graphics = $graphics }
}

function Draw-Card($graphics, [float]$x, [float]$y, [float]$width, [float]$height, [string]$title, [string]$body, [string]$accent) {
  $graphics.FillRectangle((New-Object System.Drawing.SolidBrush($white)), $x, $y, $width, $height)
  $graphics.DrawRectangle((New-Object System.Drawing.Pen($border, 2)), $x, $y, $width, $height)
  $graphics.DrawString($accent, (New-Object System.Drawing.Font("Segoe UI", 13, [System.Drawing.FontStyle]::Bold)), (New-Object System.Drawing.SolidBrush($gold)), ($x + 28), ($y + 24))
  $titleRect = New-Object System.Drawing.RectangleF -ArgumentList ($x + 28), ($y + 60), ($width - 56), 80
  $bodyRect = New-Object System.Drawing.RectangleF -ArgumentList ($x + 28), ($y + 145), ($width - 56), ($height - 170)
  $graphics.DrawString($title, (New-Object System.Drawing.Font("Georgia", 26, [System.Drawing.FontStyle]::Bold)), (New-Object System.Drawing.SolidBrush($forest)), $titleRect)
  $graphics.DrawString($body, (New-Object System.Drawing.Font("Segoe UI", 18)), (New-Object System.Drawing.SolidBrush($muted)), $bodyRect)
}

function Draw-Pill($graphics, [float]$x, [float]$y, [float]$width, [string]$label) {
  $graphics.FillRectangle((New-Object System.Drawing.SolidBrush($sage)), $x, $y, $width, 48)
  $graphics.DrawString($label, (New-Object System.Drawing.Font("Segoe UI", 15, [System.Drawing.FontStyle]::Bold)), (New-Object System.Drawing.SolidBrush($forest)), $x + 18, $y + 12)
}

function Save-Slide($slide, [string]$name) {
  $path = Join-Path $slideDir $name
  $slide.Bitmap.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
  $slide.Graphics.Dispose()
  $slide.Bitmap.Dispose()
}

$slide1 = New-Slide "The trust problem" "Opaque AI scores are hard to trust." "JobPilot starts from a simple premise: every career decision should be inspectable, evidence-backed, and honest about uncertainty."
Draw-Pill $slide1.Graphics 75 505 275 "LOCAL-FIRST AI"
Draw-Pill $slide1.Graphics 370 505 340 "EVIDENCE-FIRST"
Draw-Pill $slide1.Graphics 730 505 365 "NO HIRING-PROBABILITY CLAIM"
$slide1.Graphics.FillRectangle((New-Object System.Drawing.SolidBrush($forest)), 75, 630, 1770, 300)
$slide1.Graphics.DrawString("Know why a job fits before you apply.", (New-Object System.Drawing.Font("Georgia", 52, [System.Drawing.FontStyle]::Bold)), (New-Object System.Drawing.SolidBrush($white)), (New-Object System.Drawing.RectangleF(135, 710, 1600, 100)))
$slide1.Graphics.DrawString("Synthetic public demo  |  No login  |  No application submission", (New-Object System.Drawing.Font("Segoe UI", 22)), (New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(220,235,225))), 140, 845)
Save-Slide $slide1 "01-trust-problem.png"

$slide2 = New-Slide "Local-first hybrid architecture" "The right system owns the right decision." "Gemma handles primary semantic work locally. Versioned code calculates every point. GPT-5.6 is optional and bounded."
Draw-Card $slide2.Graphics 75 500 530 390 "Gemma 4 12B" "Ambiguous requirements, capability groups, semantic candidate profile, batched evidence matching, grounded summary, and uncertainty." "PRIMARY LOCAL SEMANTIC MODEL"
Draw-Card $slide2.Graphics 695 500 530 390 "Deterministic V2.2" "Exact 100-point budget, timelines, caps, constraints, priority, Evidence Quality, and reproducible Score Receipt." "OWNS EVERY POINT"
Draw-Card $slide2.Graphics 1315 500 530 390 "GPT-5.6 Terra" "Application strategy, independent critique, difficult ambiguity, and comparing two strategies only." "OPTIONAL HEAVY REASONING"
$slide2.Graphics.DrawString("No model generates the final score.", (New-Object System.Drawing.Font("Segoe UI", 22, [System.Drawing.FontStyle]::Bold)), (New-Object System.Drawing.SolidBrush($forest)), 75, 955)
Save-Slide $slide2 "02-architecture.png"

$slide3 = New-Slide "Synthetic judge catalog" "Six roles. Six different evidence stories." "The no-key judge flow uses frozen synthetic jobs and prepared Gemma provenance. Search and filters remain fully interactive."
$jobs = @(
  @("Northstar Labs", "Applied AI Solutions Engineer", "97"), @("Alder Systems", "Data Platform Engineer", "70"),
  @("Harbor Analytics", "Product Data Analyst", "99"), @("Meridian Robotics", "ML Infrastructure Engineer", "52"),
  @("Juniper Works", "Customer AI Enablement Lead", "92"), @("Mosaic Compute", "Junior Software Engineer", "INSUFFICIENT EVIDENCE")
)
for ($index = 0; $index -lt $jobs.Count; $index++) {
  $column = $index % 3; $row = [Math]::Floor($index / 3)
  $x = 75 + ($column * 590); $y = 490 + ($row * 245)
  Draw-Card $slide3.Graphics $x $y 530 205 $jobs[$index][1] $jobs[$index][0] ("FROZEN SYNTHETIC ROLE / FIT {0}" -f $jobs[$index][2])
}
Save-Slide $slide3 "03-catalog.png"

$slide4 = New-Slide "Evidence detail" "Every match stays tied to its source." "Required versus preferred, candidate evidence IDs, uncertainty, relevant experience, practical constraints, and point math remain visible."
$detailPath = Join-Path $projectRoot "build-week\bw3\browser-desktop-detail.png"
$detailImage = [System.Drawing.Image]::FromFile($detailPath)
$slide4.Graphics.DrawImage($detailImage, (New-Object System.Drawing.Rectangle(810, 470, 1035, 520)), 0, 0, 1425, 870, [System.Drawing.GraphicsUnit]::Pixel)
$detailImage.Dispose()
Draw-Card $slide4.Graphics 75 500 650 140 "Prepared analysis" "Local Gemma - Prepared Analysis, never labeled live or fresh." "TRUTHFUL PROVIDER LABEL"
Draw-Card $slide4.Graphics 75 675 650 140 "Evidence IDs" "Every model-supported finding must cite a validated frozen requirement and candidate evidence ID." "GROUNDED"
Draw-Card $slide4.Graphics 75 850 650 140 "Practical constraints" "Work mode and travel affect priority only. They never alter technical-fit points." "NO SCORE LEAKAGE"
Save-Slide $slide4 "04-evidence.png"

$slide5 = New-Slide "Score proof" "The receipt changes because the input changed." "See a Score Change recomputes one isolated synthetic scenario. Unrelated capability points remain identical."
Draw-Card $slide5.Graphics 75 500 760 360 "Original: 97 / 100" "Applied AI Workflow Delivery`nSTRONG EQUIVALENT`n`nReceipt: 62fdbaaf...96a6b7e" "ORIGINAL FROZEN EVIDENCE"
Draw-Card $slide5.Graphics 1085 500 760 360 "Recomputed: 100 / 100" "Same evidence independently verified as MATCHED`nAffected points: +2.57`nUnrelated points changed: 0`nReceipt: efd4e83b...8cc9d2c" "ONE CLASSIFICATION CHANGED"
$slide5.Graphics.DrawString("This demonstrates score sensitivity. It does not recommend adding experience you do not have.", (New-Object System.Drawing.Font("Segoe UI", 20, [System.Drawing.FontStyle]::Bold)), (New-Object System.Drawing.SolidBrush($gold)), (New-Object System.Drawing.RectangleF(170, 930, 1600, 70)))
Save-Slide $slide5 "05-score-change.png"

$slide6 = New-Slide "Bounded heavy reasoning" "No key? The core demo still works." "Prepared output is explicit. With a server-side key and one feature flag, the same controls activate live GPT-5.6 heavy reasoning without source changes."
Draw-Pill $slide6.Graphics 75 500 390 "PREPARED DEMONSTRATION OUTPUT"
Draw-Card $slide6.Graphics 75 585 820 310 "Build My Application Strategy" "Apply / review / skip rationale, strongest evidence, truthful gaps, resume emphasis, interview preparation, research questions, and constraints." "USER-INVOKED"
Draw-Card $slide6.Graphics 1025 585 820 310 "Challenge This Analysis" "Supported findings, questionable matches, disagreements, exact evidence IDs, and uncertainty. Critique cannot silently mutate the score." "INDEPENDENT REVIEW"
$slide6.Graphics.DrawString("Input is bounded. Output is schema-validated. Chain of thought is not stored.", (New-Object System.Drawing.Font("Segoe UI", 21, [System.Drawing.FontStyle]::Bold)), (New-Object System.Drawing.SolidBrush($forest)), 75, 960)
Save-Slide $slide6 "06-heavy-reasoning.png"

$slide7 = New-Slide "Trust Lab and release" "Inspect the boundary before you trust the result." "Gemma is primary. Deterministic code owns every point. Fixtures keep public judging reliable. GPT-5.6 stays optional."
Draw-Card $slide7.Graphics 75 500 400 300 "AI divided" "Four explicit lanes with no hidden provider switching." "ARCHITECTURE"
Draw-Card $slide7.Graphics 520 500 400 300 "Score proved" "26 tests plus property, cap, experience, mutation, and receipt proof." "DETERMINISTIC"
Draw-Card $slide7.Graphics 965 500 400 300 "Privacy" "Synthetic public data. Private-user analysis stays local by design." "LOCAL-FIRST"
Draw-Card $slide7.Graphics 1410 500 400 300 "Limitations" "Policy-based score, no hiring-outcome calibration, no auto-apply." "HONEST"
$slide7.Graphics.FillRectangle((New-Object System.Drawing.SolidBrush($forest)), 75, 875, 1735, 115)
$slide7.Graphics.DrawString("JobPilot: know why a job fits before you apply.", (New-Object System.Drawing.Font("Georgia", 38, [System.Drawing.FontStyle]::Bold)), (New-Object System.Drawing.SolidBrush($white)), 175, 908)
Save-Slide $slide7 "07-closing.png"

Write-Output "SLIDES_RENDERED=7"
