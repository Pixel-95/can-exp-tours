from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
COMPONENT = (ROOT / "assets" / "components" / "tourvergleich.html").read_text(encoding="utf-8").strip()
START = "<!-- tourvergleich:start -->"
END = "<!-- tourvergleich:end -->"

for relative in ("index.html", "touren/index.html"):
    path = ROOT / relative
    text = path.read_text(encoding="utf-8")
    start = text.index(START) + len(START)
    end = text.index(END)
    path.write_text(text[:start] + "\n" + COMPONENT + "\n" + text[end:], encoding="utf-8", newline="\n")
