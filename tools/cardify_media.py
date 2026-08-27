from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
EXCLUDED = {
    "fotographieren_2", "abseilen_1", "abschlussbild_mit_guides",
    "abseilen_3", "sprung_1", "kangaroo_jump_2", "tessin_1",
}
COPY = {
    "wetter_pruefen": "Wetter, Wasserstand und Gewitterrisiko prüfen wir vor jeder Tour mehrfach.",
    "ausruestung": "Die vollständige, geprüfte Canyoning-Ausrüstung ist für jeden Teilnehmer inklusive.",
    "einfuehrungsgespraech": "Vor dem Einstieg erklären wir jeden Ablauf klar und in Ruhe.",
    "fotographieren_1": "Ausgewählte Gruppen-, Natur- und Actionmomente halten wir für euch fest.",
    "fotographieren_2": "Private Gruppen erleben die Kobelache ohne fremde Teilnehmer.",
    "abseilen_2": "Jede technische Stelle wird durch den Guide vorbereitet und gesichert.",
    "snack": "Nach der Tour lassen wir das gemeinsame Erlebnis entspannt ausklingen.",
    "guide_tanja_und_mario_2": "Tanja und Mario begleiten euch persönlich und professionell.",
    "guide_tanja_1": "Tanja begleitet Gruppen ruhig, aufmerksam und mit viel Erfahrung.",
    "guide_mario_1": "Mario verbindet klare Planung mit langjähriger Canyoning-Erfahrung.",
}

pattern = re.compile(r'<figure class="media-card(?P<classes>[^"]*)">(?P<body>.*?)</figure>', re.S)

for page in ROOT.rglob("index.html"):
    if any(part in {"jga-canyoning", "jga-ratgeber", "sicherheit-guides"} for part in page.parts):
        continue
    text = page.read_text(encoding="utf-8")

    def replace(match: re.Match[str]) -> str:
        classes, body = match.group("classes"), match.group("body")
        if "media-story" in classes or "guide-detail" in classes:
            return match.group(0)
        source = re.search(r'/assets/fotos/editiert/([a-z0-9_]+)-\d+\.webp', body)
        if not source or source.group(1) in EXCLUDED:
            return match.group(0)
        name = source.group(1)
        if page.relative_to(ROOT).as_posix() == "touren/index.html" and name in {"merlins_world_2", "abseilen_2"}:
            return match.group(0)
        copy = COPY.get(name, "Persönlich begleitet, sorgfältig vorbereitet und ganz auf eure Gruppe abgestimmt.")
        return f'<figure class="media-card media-story{classes}">{body}<figcaption>{copy}</figcaption></figure>'

    page.write_text(pattern.sub(replace, text), encoding="utf-8", newline="\n")
