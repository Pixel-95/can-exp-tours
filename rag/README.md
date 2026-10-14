# RAG-Wissensbasis für Canyon Explore Tours

Dieser Ordner enthält die versionierte Grundlage für den öffentlichen Dify-Chatbot von Canyon Explore Tours.

## Ordner

- `knowledge/`: Kuratierte öffentliche Inhalte, die in die Dify-Wissensbasis hochgeladen werden.
- `prompts/`: Systemprompt und Verhaltensregeln des Chatbots. Diese Dateien gehören nicht in die Wissensbasis.
- `evaluation/`: Testfragen und erwartete Antworten für Retrieval- und Chatflow-Tests.
- `dify/`: Dokumentation der Dify-Konfiguration und später der exportierte Chatflow.
- `scripts/`: Lokale Prüfwerkzeuge für die Wissensdateien.
- `sources.md`: Zuordnung der öffentlichen Website-Seiten zu den Wissensdokumenten.

## Verbindliche Inhaltsgrenzen

In Dify werden ausschließlich die Markdown-Dateien aus `knowledge/` importiert. Nicht importiert werden:

- `AGENTS.md`
- Quellcode, CSS, JavaScript und Build-Werkzeuge
- interne Projekt- und SEO-Anweisungen
- Bilddateien und technische Asset-Namen
- Dify-Konfiguration, Systemprompt und Testfragen
- nicht öffentliche Planungsinformationen

Die Wissensdokumente geben den öffentlich sichtbaren Stand der Website wieder. Bei Widersprüchen sind die aktuellsten freigegebenen Website-Inhalte und die schriftliche Buchungsbestätigung maßgeblich.

## Aktualisierung

1. Öffentliche Website-Inhalte im Repo ändern.
2. Betroffene Dateien in `knowledge/` aktualisieren.
3. `powershell -ExecutionPolicy Bypass -File rag/scripts/validate-knowledge.ps1` ausführen.
4. Die geänderten Wissensdokumente in Dify aktualisieren.
5. Relevante Tests aus `evaluation/testfragen.md` erneut durchführen.

Das OpenAI-Embedding-Modell darf nach der Indexierung nicht ohne vollständige Neuindexierung gewechselt werden.
