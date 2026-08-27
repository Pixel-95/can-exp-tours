from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "fotos" / "original"
OUTPUT = ROOT / "assets" / "fotos" / "editiert"


def save_variant(source: Path, destination: Path, size: tuple[int, int], position: tuple[float, float]) -> None:
    with Image.open(source) as image:
        image = ImageOps.exif_transpose(image).convert("RGB")
        image = ImageOps.fit(image, size, method=Image.Resampling.LANCZOS, centering=position)
        destination.parent.mkdir(parents=True, exist_ok=True)
        image.save(destination, "WEBP", quality=82, method=6)


def save_responsive_set(name: str, aspect: tuple[int, int], position: tuple[float, float] = (0.5, 0.5)) -> None:
    source = SOURCE / f"{name}.webp"
    for width in (640, 960, 1440):
        height = round(width * aspect[1] / aspect[0])
        save_variant(source, OUTPUT / f"{name}-{width}.webp", (width, height), position)


LANDSCAPE_IMAGES = {
    "abseilen_1": (0.5, 0.48),
    "abseilen_2": (0.5, 0.48),
    "abseilen_3": (0.5, 0.5),
    "anweisung_sprung": (0.5, 0.5),
    "ausruestung": (0.5, 0.54),
    "ausruestung_ausgabe": (0.54, 0.5),
    "ausruestung_kontrolle": (0.5, 0.46),
    "einfuehrungsgespraech": (0.5, 0.44),
    "fotographieren_1": (0.5, 0.48),
    "fotographieren_2": (0.5, 0.45),
    "guide_mario_2": (0.5, 0.45),
    "guide_mario_3": (0.5, 0.45),
    "guide_tanja_2": (0.5, 0.45),
    "guide_tanja_3": (0.5, 0.45),
    "kangaroo_jump_1": (0.5, 0.48),
    "kangaroo_jump_2": (0.5, 0.48),
    "kangaroo_jump_3": (0.5, 0.48),
    "klettern_1": (0.5, 0.48),
    "merlins_world_1": (0.5, 0.5),
    "merlins_world_2": (0.5, 0.5),
    "rutsche": (0.5, 0.48),
    "schwimmen": (0.5, 0.48),
    "snack": (0.5, 0.5),
    "sprung_2": (0.5, 0.5),
    "sprung_1": (0.5, 0.48),
    "tessin_1": (0.5, 0.48),
    "tessin_2": (0.5, 0.48),
    "tessin_3": (0.5, 0.48),
    "tessin_4": (0.5, 0.48),
    "tessin_5": (0.5, 0.48),
    "tessin_6": (0.5, 0.48),
    "unterstuetzung_durch_guide": (0.52, 0.48),
    "wasserfall_zeigen": (0.5, 0.5),
    "wetter_pruefen": (0.5, 0.48),
}


PORTRAIT_IMAGES = {
    "abschlussbild_mit_guides": (0.5, 0.48),
    "guide_tanja_und_mario_2": (0.5, 0.45),
    "guide_tanja_1": (0.5, 0.42),
    "guide_mario_1": (0.5, 0.42),
}


def build_site_images() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)

    for width in (960, 1440, 1920):
        save_variant(
            SOURCE / "abschlussbild.webp",
            OUTPUT / f"hero-desktop-{width}.webp",
            (width, round(width * 9 / 16)),
            (0.5, 0.5),
        )

    for width in (640, 960):
        save_variant(
            SOURCE / "abschlussbild.webp",
            OUTPUT / f"hero-mobile-{width}.webp",
            (width, round(width * 5 / 4)),
            (0.5, 0.5),
        )

    for name, position in LANDSCAPE_IMAGES.items():
        save_responsive_set(name, (4, 3), position)

    for name, position in PORTRAIT_IMAGES.items():
        save_responsive_set(name, (4, 5), position)


def build_contact_sheet() -> None:
    files = sorted(SOURCE.glob("*.webp"))
    thumb_size = (240, 180)
    label_height = 34
    columns = 4
    rows = (len(files) + columns - 1) // columns
    sheet = Image.new("RGB", (columns * thumb_size[0], rows * (thumb_size[1] + label_height)), "white")
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default()

    for index, path in enumerate(files):
        with Image.open(path) as image:
            image = ImageOps.exif_transpose(image).convert("RGB")
            image.thumbnail(thumb_size, Image.Resampling.LANCZOS)
            x = (index % columns) * thumb_size[0]
            y = (index // columns) * (thumb_size[1] + label_height)
            sheet.paste(image, (x + (thumb_size[0] - image.width) // 2, y))
            draw.text((x + 6, y + thumb_size[1] + 8), path.stem, fill="black", font=font)

    sheet.save(ROOT / "tools" / "image-contact-sheet.jpg", quality=88)


if __name__ == "__main__":
    build_site_images()
