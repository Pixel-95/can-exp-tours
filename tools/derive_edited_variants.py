from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
DIRECTORY = ROOT / "assets" / "fotos" / "editiert"
NAMES = (
    "wetter_pruefen",
    "abseilen_1",
    "guide_mario_1",
    "guide_tanja_1",
    "guide_tanja_2",
    "rutsche",
    "sprung_2",
    "tessin_1",
    "tessin_2",
    "tessin_4",
    "tessin_5",
    "wasserfall_zeigen",
)


for name in NAMES:
    source = DIRECTORY / f"{name}-1440.webp"
    if not source.exists():
        raise FileNotFoundError(source)

    with Image.open(source) as image:
        image = image.convert("RGB")
        for width in (960, 640):
            height = round(width * image.height / image.width)
            destination = DIRECTORY / f"{name}-{width}.webp"
            image.resize((width, height), Image.Resampling.LANCZOS).save(
                destination,
                "WEBP",
                quality=82,
                method=6,
            )
