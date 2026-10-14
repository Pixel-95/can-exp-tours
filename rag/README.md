# RAG-Wissensbasis für Canyon Explore Tours

Dieser Ordner enthält die versionierte Grundlage für den öffentlichen Dify-Chatbot von Canyon Explore Tours.

## Ordner

- `knowledge/`: Kuratierte öffentliche Inhalte, die in die Dify-Wissensbasis hochgeladen werden.
- `prompts/`: Systemprompt und Verhaltensregeln des Chatbots. Diese Dateien gehören nicht in die Wissensbasis.
- `evaluation/`: Testfragen und erwartete Antworten für Retrieval- und Chatflow-Tests.
- `dify/`: Dokumentation, exportierter Chatflow und generierte Dify-Importdateien.
- `scripts/`: Lokale Prüfwerkzeuge für die Wissensdateien.
- `sources.md`: Zuordnung der öffentlichen Website-Seiten zu den Wissensdokumenten.

## Verbindliche Inhaltsgrenzen

Die fachliche Quelle sind ausschließlich die Markdown-Dateien aus `knowledge/`. Für Dify werden daraus zehn retrieval-optimierte Dateien in `dify/import/` erzeugt. Jeder Abschnitt wird als ein zusammenhängender Absatz ausgegeben. Dadurch bleiben Fragen, Überschriften und zugehörige Antworten im selben Chunk. Nicht importiert werden:

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
4. `powershell -ExecutionPolicy Bypass -File rag/scripts/build-dify-import.ps1` ausführen.
5. Die generierten Dateien aus `dify/import/` in Dify aktualisieren. Als benutzerdefinierte Chunk-Trennung wird eine Leerzeile verwendet.
6. Relevante Tests aus `evaluation/testfragen.md` erneut durchführen.

Die Schritte 4 und 5 können mit `pwsh -File rag/scripts/update-dify-knowledge.ps1` ausgeführt werden. Der veröffentlichte Chatflow lässt sich mit `pwsh -File rag/scripts/test-dify-rag.ps1` gegen die maschinenlesbaren Kernfälle aus `evaluation/testcases.json` prüfen. Beide Skripte lesen die benötigten Schlüssel lokal aus `.env` und geben sie nicht aus.

Das OpenAI-Embedding-Modell darf nach der Indexierung nicht ohne vollständige Neuindexierung gewechselt werden.
