import html
import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]

HEADER = '''<a class="skip-link" href="#inhalt">Zum Inhalt springen</a>
    <header class="site-header">
      <div class="nav-shell">
        <a class="brand" href="/" aria-label="Canyon Explore Tours, Startseite">
          <img src="/assets/logos/Canyon-Explore_Logo_light_blackBack_32.png" width="38" height="38" alt="" />
          <span>Canyon Explore<br />Tours</span>
        </a>
        <nav class="desktop-nav" aria-label="Hauptnavigation">
          <a href="/canyoning/">Canyoning</a>
          <a href="/touren/">Touren</a>
          <a href="/guides-sicherheit/">Guides &amp; Sicherheit</a>
          <a href="/faq/">FAQ</a>
          <a class="nav-cta" href="/tour-anfragen/">Tour anfragen</a>
        </nav>
        <details class="mobile-nav">
          <summary>Menü öffnen</summary>
          <div>
            <a href="/canyoning/">Canyoning</a>
            <a href="/touren/">Touren</a>
            <a href="/guides-sicherheit/">Guides &amp; Sicherheit</a>
            <a href="/faq/">FAQ</a>
            <a href="/tour-anfragen/">Tour anfragen</a>
          </div>
        </details>
      </div>
    </header>'''

FOOTER = '''<footer class="site-footer">
      <div class="footer-shell">
        <div>
          <h2>Ein JGA, der euch bleibt.</h2>
          <p>Private Canyoning-Touren in der Kobelache bei Dornbirn, persönlich geführt von Tanja und Mario.</p>
        </div>
        <nav aria-label="Kontakt">
          <a href="https://wa.me/4916097939577" target="_blank" rel="noopener noreferrer">WhatsApp: +49 160 97 93 95 77</a>
          <a href="mailto:info@canyon-explore-tours.com">info@canyon-explore-tours.com</a>
          <a href="/tour-anfragen/">Tour unverbindlich anfragen</a>
        </nav>
        <nav aria-label="Rechtliches">
          <a href="/rechtliches/impressum/">Impressum</a>
          <a href="/rechtliches/datenschutz/">Datenschutz</a>
          <a href="/rechtliches/agb/">AGB</a>
          <a href="/rechtliches/widerruf-storno/">Widerruf &amp; Storno</a>
        </nav>
      </div>
    </footer>
    <a class="floating-whatsapp" href="https://wa.me/4916097939577" aria-label="Canyon Explore Tours per WhatsApp kontaktieren" target="_blank" rel="noopener noreferrer">WhatsApp</a>'''


def page_class(path: Path) -> str:
    relative = path.relative_to(ROOT).as_posix()
    if relative == "index.html":
        return "page-home"
    if relative == "touren/index.html":
        return "page-tours"
    if relative == "canyoning/ablauf/index.html":
        return "page-flow"
    if relative.startswith("rechtliches/"):
        return "page-legal"
    if relative == "faq/index.html":
        return "page-faq"
    if relative == "tour-anfragen/index.html":
        return "page-request"
    return "page-content"


def responsive_picture(name: str, alt: str, portrait: bool = False, eager: bool = False) -> str:
    height = 1800 if portrait else 1080
    loading = "eager" if eager else "lazy"
    priority = ' fetchpriority="high"' if eager else ""
    return (
        f'<picture><img src="/assets/fotos/editiert/{name}-960.webp" '
        f'srcset="/assets/fotos/editiert/{name}-640.webp 640w, /assets/fotos/editiert/{name}-960.webp 960w, '
        f'/assets/fotos/editiert/{name}-1440.webp 1440w" '
        f'sizes="(max-width: 680px) calc(100vw - 32px), (max-width: 1220px) calc(100vw - 40px), 1180px" '
        f'width="1440" height="{height}" alt="{html.escape(alt, quote=True)}" loading="{loading}"{priority} /></picture>'
    )


def hero_picture(alt: str) -> str:
    return (
        '<picture>'
        '<source media="(max-width: 680px)" '
        'srcset="/assets/fotos/editiert/hero-mobile-640.webp 640w, /assets/fotos/editiert/hero-mobile-960.webp 960w" '
        'sizes="calc(100vw - 16px)" />'
        '<img src="/assets/fotos/editiert/hero-desktop-1440.webp" '
        'srcset="/assets/fotos/editiert/hero-desktop-960.webp 960w, /assets/fotos/editiert/hero-desktop-1440.webp 1440w, /assets/fotos/editiert/hero-desktop-1920.webp 1920w" '
        'sizes="(max-width: 1220px) calc(100vw - 40px), 1180px" width="1920" height="1080" '
        f'alt="{html.escape(alt, quote=True)}" loading="eager" fetchpriority="high" />'
        '</picture>'
    )


def choose_image(alt: str) -> tuple[str, bool]:
    lower = alt.lower()
    if "tanja und mario" in lower:
        return "guide_tanja_und_mario_2", True
    if "tanja" in lower and ("portrait" in lower or "schluchtenführerin" in lower):
        return "guide_tanja_1", True
    if "mario" in lower and ("portrait" in lower or "schluchtenführer" in lower):
        return "guide_mario_1", True
    if "tessin" in lower:
        return "tessin_1", False
    if "kangaroo" in lower:
        return "kangaroo_jump_2", False
    if "merlins" in lower or "felsrutsche" in lower:
        return "merlins_world_2", False
    if "ausrüstung" in lower or "checkliste" in lower:
        return "ausruestung", False
    if "einweisung" in lower or "begrüßung" in lower:
        return "einfuehrungsgespraech", False
    if "fotografiert" in lower:
        return "fotographieren_2", False
    if "abseilen" in lower or "intensiv" in lower:
        return "abseilen_2", False
    if "rutschen" in lower:
        return "rutsche", False
    if "snack" in lower or "getränke" in lower:
        return "snack", False
    if "kobelache" in lower or "gruppe" in lower:
        return "fotographieren_2", False
    return "wasserfall_zeigen", False


def replace_figure(match: re.Match[str]) -> str:
    block = match.group(0)
    image = re.search(r'<img[^>]*alt="([^"]*)"[^>]*>', block, flags=re.S)
    if not image:
        return block
    alt = image.group(1)
    if "Private JGA Canyoning-Tour in der Kobelache bei Dornbirn" in alt:
        picture = hero_picture(alt)
        class_name = "hero-media"
    else:
        name, portrait = choose_image(alt)
        picture = responsive_picture(name, alt, portrait)
        class_name = "media-card portrait" if portrait else "media-card"
    return f'<figure class="{class_name}">\n        {picture}\n      </figure>'


COMPARISON = '''<div class="comparison-scroll" role="region" aria-label="Tourvergleich, horizontal scrollbar" tabindex="0">
        <table class="comparison-table">
          <caption>Private JGA Canyoning-Touren im Vergleich</caption>
          <thead>
            <tr><th scope="col">Merkmal</th><th scope="col">Merlins World</th><th scope="col">Kangaroo Jump<br /><small>Empfehlung</small></th><th scope="col">Kobelache Intensiv</th><th scope="col">Tessin</th></tr>
          </thead>
          <tbody>
            <tr><th scope="row">Schwierigkeit</th><td>2 von 5</td><td>3 von 5</td><td>4 von 5</td><td>4 von 5</td></tr>
            <tr><th scope="row">Dauer</th><td>ca. 4 Stunden</td><td>ca. 4 Stunden</td><td>ca. 5,5 Stunden</td><td>je nach Tour</td></tr>
            <tr><th scope="row">Abseilen</th><td>bis 12 m</td><td>bis 20 m</td><td>bis 20 m</td><td>bis 80 m</td></tr>
            <tr><th scope="row">Sprünge</th><td>bis 7 m</td><td>bis 10 m</td><td>bis 10 m</td><td>bis 20 m</td></tr>
            <tr><th scope="row">Rutschen</th><td>bis 5 m</td><td>bis 6 m</td><td>bis 6 m</td><td>bis 20 m</td></tr>
            <tr><th scope="row">Schwimmen</th><td>bis 10 m</td><td>bis 30 m</td><td>bis 30 m</td><td>bis 50 m</td></tr>
            <tr><th scope="row">Preis</th><td><strong>100 € p. P.</strong></td><td><strong>100 € p. P.</strong></td><td><strong>150 € p. P.</strong></td><td><strong>auf Anfrage</strong></td></tr>
          </tbody>
        </table>
      </div>
      <p class="comparison-note">Tipp: Auf kleinen Bildschirmen horizontal wischen. Die Merkmals-Spalte bleibt sichtbar.</p>'''


def update_html(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    text = re.sub(r'<link rel="stylesheet" href="[^"]*image-placeholders\.css" />', '<link rel="stylesheet" href="/assets/css/site.css" />', text)
    if "/assets/js/site.js" not in text:
        text = text.replace("  </head>", '    <script src="/assets/js/site.js" defer></script>\n  </head>')
    text = re.sub(r'<body(?: class="[^"]*")?>', f'<body class="{page_class(path)}">', text, count=1)
    text = re.sub(r'\s*<header>.*?</header>', "\n    " + HEADER, text, count=1, flags=re.S)
    text = re.sub(r'<nav aria-label="Brotkrumen">', '<nav class="breadcrumbs" aria-label="Brotkrumen">', text)
    text = re.sub(r'<main>', '<main class="site-main" id="inhalt">', text, count=1)
    text = re.sub(r'<figure>.*?</figure>', replace_figure, text, flags=re.S)
    text = re.sub(r'\s*<footer>.*?</footer>\s*<a href="https://wa\.me/4916097939577".*?</a>', "\n    " + FOOTER, text, count=1, flags=re.S)

    if path.relative_to(ROOT).as_posix() == "index.html":
        hero_end = text.index('<section aria-labelledby="jga-vorteile">')
        main_start = text.index('<main class="site-main" id="inhalt">') + len('<main class="site-main" id="inhalt">')
        hero = '''
      <section class="hero">
        <p class="eyebrow">Private JGA-Tour · Kobelache bei Dornbirn</p>
        <h1>Ein JGA, den ihr gemeinsam erlebt.</h1>
        <p class="lead">Eure private Canyoning-Tour ohne fremde Teilnehmer, persönlich geführt von Tanja und Mario. Ausrüstung, Schuhe, Transfer, Fotos, Videos und Ausklang sind organisiert.</p>
        <div class="hero-actions">
          <a href="/tour-anfragen/">Unverbindlich per WhatsApp anfragen</a>
          <a href="/touren/">Touren vergleichen</a>
        </div>
        <figure class="hero-media">''' + hero_picture("Private JGA Canyoning-Tour in der Kobelache bei Dornbirn") + '''</figure>
        <div class="trust-strip" aria-label="Leistungen auf einen Blick">
          <div><strong>100 % privat</strong><span>Nur eure Gruppe</span></div>
          <div><strong>Ab 100 €</strong><span>pro Person</span></div>
          <div><strong>Alles inklusive</strong><span>Auch Schuhe &amp; Medien</span></div>
          <div><strong>Persönlich</strong><span>Mit Tanja &amp; Mario</span></div>
        </div>
        <p><strong>Von den Machern der beliebtesten Canyoning-App.</strong></p>
      </section>
      '''
        text = text[:main_start] + hero + text[hero_end:]
        text = re.sub(r'\s*<section aria-labelledby="jga-kundenstimmen">.*?</section>', "", text, flags=re.S)

    if path.relative_to(ROOT).as_posix() == "touren/index.html":
        text = re.sub(r'<table>.*?</table>', COMPARISON, text, count=1, flags=re.S)

    path.write_text(text, encoding="utf-8", newline="\n")
if __name__ == "__main__":
    for html_path in sorted(ROOT.rglob("index.html")):
        update_html(html_path)
