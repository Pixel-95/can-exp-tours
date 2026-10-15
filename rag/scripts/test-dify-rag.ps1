[CmdletBinding()]
param(
    [int]$DelaySeconds = 7,
    [string]$QuestionPattern = ''
)

$ErrorActionPreference = 'Stop'
$apiBase = 'https://api.dify.ai/v1'
$ragRoot = Split-Path -Parent $PSScriptRoot
$repositoryRoot = Split-Path -Parent $ragRoot
$envPath = Join-Path $repositoryRoot '.env'
$testCasesPath = Join-Path $ragRoot 'evaluation\testcases.json'

function Get-EnvValue {
    param([Parameter(Mandatory)][string]$Name)

    $line = Get-Content -Encoding UTF8 -LiteralPath $envPath |
        Where-Object { $_ -match "^\s*$([regex]::Escape($Name))\s*=" } |
        Select-Object -First 1
    if (-not $line) {
        throw "$Name fehlt in .env."
    }
    return (($line -split '=', 2)[1].Trim().Trim('"').Trim("'"))
}

$apiKey = Get-EnvValue -Name 'DIFY_API_KEY_APP'
$headers = @{ Authorization = "Bearer $apiKey"; 'Content-Type' = 'application/json' }
$testCases = Get-Content -Raw -Encoding UTF8 -LiteralPath $testCasesPath | ConvertFrom-Json
$forbiddenSourcePatterns = @(
    '(?i)\bQuelle(n|nangabe|nbeleg)?\s*:',
    '(?i)\.md\b',
    '(?i)\bDokumenttitel\b',
    'https?://canyon-explore-tours\.com/(touren|faq|canyoning|guides-sicherheit|rechtliches)(/|\b)'
)
if (-not [string]::IsNullOrWhiteSpace($QuestionPattern)) {
    $testCases = @($testCases | Where-Object { $_.question -match $QuestionPattern })
    if ($testCases.Count -eq 0) {
        throw "Keine Testfrage passt zu QuestionPattern: $QuestionPattern"
    }
}
$results = [System.Collections.Generic.List[object]]::new()

foreach ($testCase in $testCases) {
    $request = @{
        inputs = @{}
        query = $testCase.question
        response_mode = 'blocking'
        conversation_id = ''
        user = 'rag-regression-test'
    } | ConvertTo-Json -Depth 5

    $attempt = 0
    do {
        $attempt++
        try {
            $response = Invoke-RestMethod -Method Post -Uri "$apiBase/chat-messages" -Headers $headers -Body $request
            $rateLimited = $false
        }
        catch {
            $rateLimited = $_.Exception.Response.StatusCode -eq 403
            if (-not $rateLimited -or $attempt -ge 6) {
                throw
            }
            Write-Host "Rate-Limit aktiv, erneuter Versuch in 15 Sekunden: $($testCase.question)"
            Start-Sleep -Seconds 15
        }
    } while ($rateLimited)

    $answer = [string]$response.answer
    $failures = [System.Collections.Generic.List[string]]::new()
    foreach ($pattern in $testCase.must_match) {
        if ($answer -notmatch $pattern) {
            $failures.Add("fehlt: $pattern")
        }
    }
    foreach ($pattern in $testCase.must_not_match) {
        if ($answer -match $pattern) {
            $failures.Add("unerwünscht: $pattern")
        }
    }
    foreach ($pattern in $forbiddenSourcePatterns) {
        if ($answer -match $pattern) {
            $failures.Add("Quellenbeleg sichtbar: $pattern")
        }
    }

    $passed = $failures.Count -eq 0
    $results.Add([pscustomobject]@{
        Question = $testCase.question
        Passed = $passed
        Failures = $failures -join '; '
        Answer = $answer
    })
    Write-Host "[$(if ($passed) { 'OK' } else { 'FEHLER' })] $($testCase.question)"

    if ($testCase -ne $testCases[-1]) {
        Start-Sleep -Seconds $DelaySeconds
    }
}

$failed = @($results | Where-Object { -not $_.Passed })
Write-Host "Ergebnis: $($results.Count - $failed.Count)/$($results.Count) Tests erfolgreich."

if ($failed.Count -gt 0) {
    foreach ($failure in $failed) {
        Write-Host "`nFRAGE: $($failure.Question)"
        Write-Host "PRÜFUNG: $($failure.Failures)"
        Write-Host "ANTWORT: $($failure.Answer)"
    }
    exit 1
}
