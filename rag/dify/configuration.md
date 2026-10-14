# Dify-Konfiguration

Status: vorbereitet, noch nicht in Dify eingerichtet

## Bereitstellung

- Plattform: Dify Cloud
- Plan: Free beziehungsweise Sandbox
- Anwendungstyp: Chatflow
- Öffentliche Zugänge: Dify-Web-App und Website-Embed
- Eigener Server: nicht erforderlich

## Modelle

- Chatmodell: `gpt-5-mini`
- Embedding-Modell: `text-embedding-3-small`
- Maximum Output: 2048 Tokens
- Reasoning Effort: low
- Verbosity: low
- Streaming: aktiviert
- Vision: deaktiviert
- Structured Output: deaktiviert

## Wissensbasis

- Zu importierende Dateien: ausschließlich `rag/knowledge/*.md`
- Chunk-Struktur: General
- Indexierung: High Quality
- Retrieval: Vector Search
- Top K: 5
- Score Threshold: zunächst deaktiviert
- Reranker: zunächst deaktiviert
- Maximale Chunk-Länge: ungefähr 1024 Tokens
- Overlap: ungefähr 50 Zeichen
- Bevorzugte Trennstellen: Überschriften und Absatzgrenzen

Das Embedding-Modell darf nach der Indexierung nicht geändert werden. Ein Modellwechsel erfordert eine vollständige Neuindexierung.

## Chatflow

```text
Start -> Knowledge Retrieval -> LLM -> Answer
```

- `Start.query` wird an Knowledge Retrieval übergeben.
- Das Retrieval-Ergebnis wird als Kontext an den LLM-Node gebunden.
- Die Nutzerfrage wird als User Message an den LLM-Node übergeben.
- `LLM.text` wird im Answer-Node ausgegeben.
- Gesprächsgedächtnis: fünf Nutzer-Assistent-Runden.

## Veröffentlichung

Nach bestandenen Tests:

1. Chatflow veröffentlichen.
2. Dify-Web-App aktivieren.
3. Website-Embed erzeugen.
4. Chatflow-DSL ohne Secrets exportieren und in diesem Ordner versionieren.

Der exportierte DSL-Dateiname soll `chatflow.dsl.yml` lauten. Die Datei wird erst nach dem realen Export angelegt, nicht als ungültiger Platzhalter.
