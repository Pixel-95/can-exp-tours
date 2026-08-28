import re
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


DESKTOP_NAV = '''<nav class="desktop-nav" aria-label="Hauptnavigation">
          <div class="nav-group">
            <a class="nav-group-link" href="/canyoning/">Canyoning <span aria-hidden="true">⌄</span></a>
            <div class="mega-menu">
              <p class="mega-label">Canyoning verstehen und vorbereiten</p>
              <a href="/canyoning/was-ist-canyoning/"><strong>Was ist Canyoning?</strong><span>Elemente, Voraussetzungen und erste Tour</span></a>
              <a href="/canyoning/canyoning-als-jga-idee/"><strong>Canyoning als JGA-Idee</strong><span>Passt das Erlebnis zu eurer Gruppe?</span></a>
              <a href="/canyoning/kobelache-dornbirn/"><strong>Kobelache und Dornbirn</strong><span>Schlucht, Treffpunkt und Umgebung</span></a>
              <a href="/canyoning/ablauf/"><strong>Ablauf der Tour</strong><span>Vom Ankommen bis zum Ausklang</span></a>
              <a href="/canyoning/checkliste/"><strong>Canyoning-Checkliste</strong><span>Das bringt ihr mit, das stellen wir</span></a>
            </div>
          </div>
          <a href="/touren/">Touren</a>
          <div class="nav-group">
            <a class="nav-group-link" href="/guides-sicherheit/">Guides &amp; Sicherheit <span aria-hidden="true">⌄</span></a>
            <div class="mega-menu mega-menu-small">
              <p class="mega-label">Persönlich und professionell begleitet</p>
              <a href="/guides-sicherheit/das-sind-wir/"><strong>Das sind wir</strong><span>Tanja und Mario kennenlernen</span></a>
              <a href="/guides-sicherheit/sicherheit-ausruestung/"><strong>Sicherheit und Ausrüstung</strong><span>Grundsätze, Qualifikation und Material</span></a>
            </div>
          </div>
          <a href="/faq/">FAQ</a>
          <a class="nav-cta" href="/tour-anfragen/">Tour anfragen</a>
        </nav>'''


MOBILE_NAV = '''<details class="mobile-nav">
          <summary>Menü öffnen</summary>
          <div class="mobile-menu-panel">
            <nav aria-label="Mobile Hauptnavigation">
              <details class="mobile-subnav">
                <summary>Canyoning</summary>
                <div>
                  <a href="/canyoning/">Übersicht</a>
                  <a href="/canyoning/was-ist-canyoning/">Was ist Canyoning?</a>
                  <a href="/canyoning/canyoning-als-jga-idee/">Canyoning als JGA-Idee</a>
                  <a href="/canyoning/kobelache-dornbirn/">Kobelache und Dornbirn</a>
                  <a href="/canyoning/ablauf/">Ablauf der Tour</a>
                  <a href="/canyoning/checkliste/">Canyoning-Checkliste</a>
                </div>
              </details>
              <a href="/touren/">Touren vergleichen</a>
              <details class="mobile-subnav">
                <summary>Guides &amp; Sicherheit</summary>
                <div>
                  <a href="/guides-sicherheit/">Übersicht</a>
                  <a href="/guides-sicherheit/das-sind-wir/">Das sind wir</a>
                  <a href="/guides-sicherheit/sicherheit-ausruestung/">Sicherheit und Ausrüstung</a>
                </div>
              </details>
              <a href="/faq/">FAQ</a>
              <a class="mobile-menu-cta" href="/tour-anfragen/">Tour anfragen</a>
            </nav>
          </div>
        </details>'''


COMPARISON = '''<div class="comparison-scroll" role="region" aria-label="Touren im Vergleich, horizontal scrollbar" tabindex="0">
        <div class="comparison-grid">
          <div class="comparison-labels" aria-hidden="true">
            <div class="comparison-labels-head"><span>Vergleich</span></div>
            <div><img src="/assets/icons/difficulty.png" alt="" /><span>Schwierigkeit</span></div>
            <div><img src="/assets/icons/duration.png" alt="" /><span>Dauer</span></div>
            <div><img src="/assets/icons/abseilen.png" alt="" /><span>Abseilen</span></div>
            <div><img src="/assets/icons/jump.png" alt="" /><span>Sprünge</span></div>
            <div><img src="/assets/icons/slide.png" alt="" /><span>Rutschen</span></div>
            <div><img src="/assets/icons/swim.png" alt="" /><span>Schwimmen</span></div>
            <div><img src="/assets/icons/price.png" alt="" /><span>Preis</span></div>
          </div>
          <article class="tour-plan">
            <header><p class="plan-kicker">Für Einsteiger</p><h3>Merlins World</h3><p>Optimaler Einstieg ins Canyoning mit abwechslungsreichen Elementen.</p><a href="/touren/merlins-world/">Tour ansehen</a></header>
            <dl><div><dt>Schwierigkeit</dt><dd>2 von 5</dd></div><div><dt>Dauer</dt><dd>ca. 4 Stunden</dd></div><div><dt>Abseilen</dt><dd>bis 12 m</dd></div><div><dt>Sprünge</dt><dd>bis 7 m, freiwillig</dd></div><div><dt>Rutschen</dt><dd>bis 5 m</dd></div><div><dt>Schwimmen</dt><dd>bis 10 m</dd></div><div><dt>Preis</dt><dd><strong>100 € p. P.</strong></dd></div></dl>
          </article>
          <article class="tour-plan tour-plan-featured">
            <header><p class="plan-kicker">Unsere Empfehlung</p><h3>Kangaroo Jump</h3><p>Die ausgewogene Mischung aus Action und machbarer Herausforderung.</p><a href="/touren/kangaroo-jump/">Tour ansehen</a></header>
            <dl><div><dt>Schwierigkeit</dt><dd>3 von 5</dd></div><div><dt>Dauer</dt><dd>ca. 4 Stunden</dd></div><div><dt>Abseilen</dt><dd>bis 20 m</dd></div><div><dt>Sprünge</dt><dd>bis 10 m, freiwillig</dd></div><div><dt>Rutschen</dt><dd>bis 6 m</dd></div><div><dt>Schwimmen</dt><dd>bis 30 m</dd></div><div><dt>Preis</dt><dd><strong>100 € p. P.</strong></dd></div></dl>
          </article>
          <article class="tour-plan">
            <header><p class="plan-kicker">Für sehr Sportliche</p><h3>Kobelache Intensiv</h3><p>Die lange, konditionell fordernde Tour durch die Kobelache.</p><a href="/touren/kobelache-intensiv/">Tour ansehen</a></header>
            <dl><div><dt>Schwierigkeit</dt><dd>4 von 5</dd></div><div><dt>Dauer</dt><dd>ca. 5,5 Stunden</dd></div><div><dt>Abseilen</dt><dd>bis 20 m</dd></div><div><dt>Sprünge</dt><dd>bis 10 m, freiwillig</dd></div><div><dt>Rutschen</dt><dd>bis 6 m</dd></div><div><dt>Schwimmen</dt><dd>bis 30 m</dd></div><div><dt>Preis</dt><dd><strong>150 € p. P.</strong></dd></div></dl>
          </article>
          <article class="tour-plan">
            <header><p class="plan-kicker">Individuelle Spezialtour</p><h3>Tessin</h3><p>Für sehr ambitionierte Gruppen, passend zur gewählten Schlucht geplant.</p><a href="/touren/canyoning-tessin/">Tour ansehen</a></header>
            <dl><div><dt>Schwierigkeit</dt><dd>4 von 5</dd></div><div><dt>Dauer</dt><dd>je nach Tour</dd></div><div><dt>Abseilen</dt><dd>bis 80 m</dd></div><div><dt>Sprünge</dt><dd>bis 20 m, freiwillig</dd></div><div><dt>Rutschen</dt><dd>bis 20 m</dd></div><div><dt>Schwimmen</dt><dd>bis 50 m</dd></div><div><dt>Preis</dt><dd><strong>auf Anfrage</strong></dd></div></dl>
          </article>
        </div>
      </div>
      <p class="comparison-note">Auf kleinen Bildschirmen horizontal wischen. Die Merkmale bleiben dabei sichtbar.</p>'''


ELEMENT_CARDS = '''<div class="element-cards">
          <article class="split-card"><picture><img src="/assets/fotos/editiert/abseilen_2-960.webp" srcset="/assets/fotos/editiert/abseilen_2-640.webp 640w, /assets/fotos/editiert/abseilen_2-960.webp 960w" sizes="(max-width: 760px) calc(100vw - 32px), 50vw" width="960" height="720" alt="Teilnehmer beim Abseilen in der Kobelache" loading="lazy" /></picture><div><img class="content-icon" src="/assets/icons/abseilen.png" alt="" /><h3>Abseilen</h3><p>An steileren Stufen werdet ihr am Seil abgelassen oder seilt euch nach Einweisung selbstständig ab.</p></div></article>
          <article class="split-card split-card-reverse"><picture><img src="/assets/fotos/editiert/rutsche-960.webp" srcset="/assets/fotos/editiert/rutsche-640.webp 640w, /assets/fotos/editiert/rutsche-960.webp 960w" sizes="(max-width: 760px) calc(100vw - 32px), 50vw" width="960" height="720" alt="Natürliche Wasserrutsche beim Canyoning" loading="lazy" /></picture><div><img class="content-icon" src="/assets/icons/slide.png" alt="" /><h3>Rutschen</h3><p>Geeignete, vom Wasser geformte Felsrinnen können kontrolliert als natürliche Rutschen genutzt werden.</p></div></article>
          <article class="split-card"><picture><img src="/assets/fotos/editiert/sprung_2-960.webp" srcset="/assets/fotos/editiert/sprung_2-640.webp 640w, /assets/fotos/editiert/sprung_2-960.webp 960w" sizes="(max-width: 760px) calc(100vw - 32px), 50vw" width="960" height="720" alt="Freiwilliger Sprung beim Canyoning" loading="lazy" /></picture><div><img class="content-icon" src="/assets/icons/jump.png" alt="" /><h3>Freiwillig springen</h3><p>Sprünge sorgen für Action, sind bei unseren Touren aber immer freiwillig. Jede Sprungstelle kann umgangen werden.</p></div></article>
          <article class="split-card split-card-reverse"><picture><img src="/assets/fotos/editiert/schwimmen-960.webp" srcset="/assets/fotos/editiert/schwimmen-640.webp 640w, /assets/fotos/editiert/schwimmen-960.webp 960w" sizes="(max-width: 760px) calc(100vw - 32px), 50vw" width="960" height="720" alt="Schwimmen durch eine Wasserpassage in der Kobelache" loading="lazy" /></picture><div><img class="content-icon" src="/assets/icons/swim.png" alt="" /><h3>Schwimmen und abklettern</h3><p>Tiefere Gumpen werden schwimmend durchquert. Dazwischen bewegt ihr euch trittsicher über nassen Fels und durch flache Wasserpassagen.</p></div></article>
        </div>'''


def parent_link(path: Path) -> str:
    rel = path.relative_to(ROOT).as_posix()
    if rel.startswith("canyoning/") and rel != "canyoning/index.html":
        return '<a class="mobile-parent-link" href="/canyoning/">‹ Canyoning</a>'
    if rel.startswith("guides-sicherheit/") and rel != "guides-sicherheit/index.html":
        return '<a class="mobile-parent-link" href="/guides-sicherheit/">‹ Guides &amp; Sicherheit</a>'
    if rel.startswith("touren/") and rel != "touren/index.html":
        return '<a class="mobile-parent-link" href="/touren/">‹ Touren</a>'
    return ""


def update(path: Path) -> None:
    text = path.read_text(encoding="utf-8")
    text = re.sub(r'<nav class="desktop-nav".*?</nav>', DESKTOP_NAV, text, count=1, flags=re.S)
    text = re.sub(r'<details class="mobile-nav">.*?</details>\s*</div>\s*</header>', MOBILE_NAV + '\n      </div>\n    </header>', text, count=1, flags=re.S)
    text = re.sub(r'\s*<nav class="breadcrumbs".*?</nav>', "", text, count=1, flags=re.S)
    back = parent_link(path)
    if back:
        text = text.replace('<main class="site-main" id="inhalt">', back + '\n    <main class="site-main" id="inhalt">', 1)
    path.write_text(text, encoding="utf-8", newline="\n")


if __name__ == "__main__":
    pages = [p for p in ROOT.rglob("index.html") if not any(part in {"jga-canyoning", "jga-ratgeber", "sicherheit-guides"} for part in p.parts)]
    for page in pages:
        update(page)

    tours = ROOT / "touren" / "index.html"
    text = tours.read_text(encoding="utf-8")
    text = re.sub(r'<div class="comparison-scroll".*?<p class="comparison-note">.*?</p>', COMPARISON, text, count=1, flags=re.S)
    tours.write_text(text, encoding="utf-8", newline="\n")

    canyoning = ROOT / "canyoning" / "was-ist-canyoning" / "index.html"
    text = canyoning.read_text(encoding="utf-8")
    text = re.sub(r'<dl>\s*<dt>Gehen und Abklettern</dt>.*?</dl>', ELEMENT_CARDS, text, count=1, flags=re.S)
    canyoning.write_text(text, encoding="utf-8", newline="\n")
