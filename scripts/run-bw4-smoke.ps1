$ErrorActionPreference = "Stop"

if (Get-NetTCPConnection -State Listen -LocalPort 3100 -ErrorAction SilentlyContinue) {
    throw "Port 3100 is already in use."
}

New-Item -ItemType Directory -Path ".jobpilot-logs" -Force | Out-Null

$env:BUILD_WEEK_DEMO_MODE = "true"
$env:AI_RUNTIME_MODE = "LOCAL_FIRST"
$env:BUILD_WEEK_USE_CACHED_GEMMA_ANALYSES = "true"
$env:BUILD_WEEK_ALLOW_LOCAL_GEMMA_REANALYSIS = "false"
$env:OPENAI_HEAVY_FEATURES_ENABLED = "false"
$env:BUILD_WEEK_ALLOW_LIVE_GPT56 = "false"
$env:OLLAMA_ENABLED = "false"

$server = Start-Process `
    -FilePath "node.exe" `
    -ArgumentList @("node_modules/next/dist/bin/next", "start", "-p", "3100") `
    -WorkingDirectory (Get-Location).Path `
    -WindowStyle Hidden `
    -RedirectStandardOutput ".jobpilot-logs/bw4-smoke.out.log" `
    -RedirectStandardError ".jobpilot-logs/bw4-smoke.err.log" `
    -PassThru

$passedCycles = 0
$requestCount = 0

try {
    $ready = $false
    for ($attempt = 0; $attempt -lt 30; $attempt++) {
        try {
            $response = Invoke-WebRequest -Uri "http://127.0.0.1:3100/api/health" -UseBasicParsing -TimeoutSec 2
            if ($response.StatusCode -eq 200) {
                $ready = $true
                break
            }
        } catch {
            Start-Sleep -Milliseconds 500
        }
    }

    if (-not $ready) {
        throw "The production server did not become ready."
    }

    $data = Get-Content -LiteralPath "build-week/demo-data/cached-gemma-analyses.json" -Raw | ConvertFrom-Json
    $routes = @(
        "/",
        "/demo",
        "/demo/jobs",
        "/demo/tracker",
        "/demo/trust",
        "/api/health",
        "/api/provider-status"
    ) + @($data.analyses | ForEach-Object { "/demo/jobs/$($_.jobId)" })

    for ($cycle = 1; $cycle -le 20; $cycle++) {
        $cyclePassed = $true
        foreach ($route in $routes) {
            try {
                $response = Invoke-WebRequest -Uri "http://127.0.0.1:3100$route" -UseBasicParsing -TimeoutSec 10
                $requestCount++
                if ($response.StatusCode -ne 200) {
                    $cyclePassed = $false
                }
            } catch {
                $cyclePassed = $false
            }
        }
        if ($cyclePassed) {
            $passedCycles++
        }
    }

    if ($passedCycles -ne 20) {
        throw "Only $passedCycles of 20 smoke cycles passed."
    }

    Write-Output "LOCAL_SMOKE_CYCLES=20"
    Write-Output "LOCAL_SMOKE_PASSED=$passedCycles"
    Write-Output "LOCAL_SMOKE_REQUESTS=$requestCount"
    Write-Output "LOCAL_SMOKE_ROUTES_PER_CYCLE=$($routes.Count)"
} finally {
    if ($server -and -not $server.HasExited) {
        Stop-Process -Id $server.Id
        Wait-Process -Id $server.Id -ErrorAction SilentlyContinue
    }

    Remove-Item Env:BUILD_WEEK_DEMO_MODE -ErrorAction SilentlyContinue
    Remove-Item Env:AI_RUNTIME_MODE -ErrorAction SilentlyContinue
    Remove-Item Env:BUILD_WEEK_USE_CACHED_GEMMA_ANALYSES -ErrorAction SilentlyContinue
    Remove-Item Env:BUILD_WEEK_ALLOW_LOCAL_GEMMA_REANALYSIS -ErrorAction SilentlyContinue
    Remove-Item Env:OPENAI_HEAVY_FEATURES_ENABLED -ErrorAction SilentlyContinue
    Remove-Item Env:BUILD_WEEK_ALLOW_LIVE_GPT56 -ErrorAction SilentlyContinue
    Remove-Item Env:OLLAMA_ENABLED -ErrorAction SilentlyContinue
}

Write-Output "PORT_3100_LISTENING=$([bool](Get-NetTCPConnection -State Listen -LocalPort 3100 -ErrorAction SilentlyContinue))"
