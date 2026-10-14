[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'
$ragRoot = Split-Path -Parent $PSScriptRoot
$knowledgeRoot = Join-Path $ragRoot 'knowledge'
$outputRoot = Join-Path $ragRoot 'dify\import'
$chunkSeparator = "`n`n"

$bundles = [ordered]@{
    '01-unternehmen-und-kontakt.md' = @('01-unternehmen-und-kontakt.md')
    '02-jga-angebot.md' = @('02-jga-angebot.md')
    '03-tourauswahl-und-vergleich.md' = @('03-tourauswahl-und-vergleich.md')
    '04-tour-merlins-world.md' = @('04-tour-merlins-world.md')
    '05-tour-kangaroo-jump.md' = @('05-tour-kangaroo-jump.md')
    '06-tour-kobelache-intensiv.md' = @('06-tour-kobelache-intensiv.md')
    '07-tour-tessin.md' = @('07-tour-tessin.md')
    '08-leistungen-und-sorglos-paket.md' = @('08-leistungen-und-sorglos-paket.md')
    '09-14-grundlagen-ablauf-sicherheit-und-guides.md' = @(
        '09-canyoning-grundlagen.md',
        '10-kobelache-dornbirn-und-treffpunkt.md',
        '11-ablauf-und-vorbereitung.md',
        '12-sicherheit-und-ausruestung.md',
        '13-teilnahmevoraussetzungen-und-gesundheit.md',
        '14-guides-und-qualifikationen.md'
    )
    '15-19-faq-buchung-recht-und-datenschutz.md' = @(
        '15-haeufige-fragen.md',
        '16-anfrage-buchung-und-zahlung.md',
        '17-buchungsbedingungen.md',
        '18-widerruf-umbuchung-und-storno.md',
        '19-datenschutzinformationen.md'
    )
}

function ConvertTo-RetrievalChunks {
    param([Parameter(Mandatory)][string]$Path)

    $raw = (Get-Content -Raw -Encoding UTF8 -LiteralPath $Path).Replace("`r`n", "`n")
    $frontmatter = [regex]::Match($raw, '(?s)\A---\n(?<meta>.*?)\n---\n')
    if (-not $frontmatter.Success) {
        throw "YAML-Frontmatter fehlt: $Path"
    }

    $metadata = $frontmatter.Groups['meta'].Value
    $title = [regex]::Match($metadata, '(?m)^title:\s*(.+?)\s*$').Groups[1].Value
    $sourceUrl = [regex]::Match($metadata, '(?m)^source_url:\s*(\S+)').Groups[1].Value
    $body = $raw.Substring($frontmatter.Length).Trim()
    $body = [regex]::Replace($body, '(?m)^#\s+.+?\s*$', '').Trim()

    $sectionMatches = [regex]::Matches($body, '(?m)^##\s+(?<heading>.+?)\s*$')
    $chunks = [System.Collections.Generic.List[string]]::new()

    for ($index = 0; $index -lt $sectionMatches.Count; $index++) {
        $match = $sectionMatches[$index]
        $contentStart = $match.Index + $match.Length
        $contentEnd = if ($index + 1 -lt $sectionMatches.Count) { $sectionMatches[$index + 1].Index } else { $body.Length }
        $section = $body.Substring($contentStart, $contentEnd - $contentStart).Trim()
        $section = [regex]::Replace($section, '(?m)^Quelle:\s*https://\S+\s*$', '').Trim()
        $section = [regex]::Replace($section, '(?m)^#{1,6}\s+(.+?)\s*$', 'Unterthema: $1')
        $section = [regex]::Replace($section, '\s+', ' ').Trim()
        if ([string]::IsNullOrWhiteSpace($section)) {
            continue
        }

        $heading = $match.Groups['heading'].Value.Trim()
        $queryHints = switch -Regex ($heading) {
            '^Tourdaten$' {
                "Typische Fragen: Wie lange dauert $title? Was kostet $title? Wo ist der Treffpunkt für $title? Wie schwierig ist $title?"
                break
            }
            '^(Inklusive|Enthaltene Leistungen)$' {
                'Typische Fragen: Was ist im Preis enthalten? Werden Canyoning-Schuhe gestellt? Ist der Transfer enthalten? Sind Fotos und Videos inklusive?'
                break
            }
            default { '' }
        }
        $chunk = "Dokument: $title. Thema: $heading. $queryHints Inhalt: $section Quelle: $sourceUrl"
        $chunks.Add($chunk.Trim())
    }

    if ($chunks.Count -eq 0) {
        throw "Keine H2-Abschnitte gefunden: $Path"
    }

    return $chunks
}

New-Item -ItemType Directory -Path $outputRoot -Force | Out-Null

foreach ($bundle in $bundles.GetEnumerator()) {
    $chunks = [System.Collections.Generic.List[string]]::new()
    foreach ($sourceName in $bundle.Value) {
        $sourcePath = Join-Path $knowledgeRoot $sourceName
        foreach ($chunk in (ConvertTo-RetrievalChunks -Path $sourcePath)) {
            $chunks.Add($chunk)
        }
    }

    $outputPath = Join-Path $outputRoot $bundle.Key
    $content = $chunks -join $chunkSeparator
    [IO.File]::WriteAllText($outputPath, $content + "`n", [Text.UTF8Encoding]::new($false))
}

Write-Host "Dify-Import erstellt: $($bundles.Count) Dokumente in $outputRoot" -ForegroundColor Green
