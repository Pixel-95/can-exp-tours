# Dify-Konfiguration

Status: eingerichtet, getestet und veröffentlicht am 14. Oktober 2026

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
- Top K: 8
- Score Threshold: zunächst deaktiviert
- Reranker: zunächst deaktiviert
- Maximale Chunk-Länge: ungefähr 1024 Tokens
- Overlap: ungefähr 50 Zeichen
- Bevorzugte Trennstellen: Überschriften und Absatzgrenzen

### Produktive Wissensbasis

- Name: `Canyon Explore Tours - Websitewissen`
- Dataset-ID: `fc7c1c4c-c528-48f0-9030-a72b77c7a213`
- Dokumente: 10 von 10 möglichen Dokumenten im Free-Plan
- Inhalt: alle 19 Markdown-Quelldateien aus `rag/knowledge/`
- Free-Plan-Anpassung: Dateien 01 bis 08 wurden einzeln importiert, 09 bis 14 sowie 15 bis 19 wurden jeweils in einem Dify-Dokument zusammengefasst. Die Quelldateien im Repository bleiben unverändert.
- Indizierungsstatus: vollständig abgeschlossen

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

## Produktive Anwendung

- Name: `Canyon Explore Tours Assistent`
- App-ID: `49aeab8b-57c9-440f-85a7-9b7ccb726dec`
- Modus: Advanced Chat beziehungsweise Chatflow
- Dify-Web-App: https://udify.app/chat/WnPIdLi1CLFKFtIw
- Iframe-URL: https://udify.app/chatbot/WnPIdLi1CLFKFtIw
- API-Endpunkt: https://api.dify.ai/v1
- App-API-Schlüssel: ausschließlich lokal in `.env` als `DIFY_API_KEY_APP`
- Wissens-API-Schlüssel: ausschließlich lokal in `.env` als `DIFY_API_KEY_KNOWLEDGE`

## Veröffentlichung

Abgeschlossen:

1. Chatflow veröffentlichen.
2. Dify-Web-App aktivieren.
3. Website-Embed erzeugen.
4. Chatflow-DSL ohne Secrets exportieren und in diesem Ordner versionieren.

Der Chatflow wurde über die Dify-Web-App und über `POST /v1/chat-messages` erfolgreich getestet. Der API-Test erkannte die richtige App, erstellte eine Konversation und beantwortete eine Preis- und Leistungsfrage aus der Wissensbasis korrekt.

Der exportierte DSL-Dateiname soll `chatflow.dsl.yml` lauten. Die Datei wird erst nach dem realen Export angelegt, nicht als ungültiger Platzhalter.
