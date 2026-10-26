"""Render 120 story backgrounds with the exact chapter crop math for visual QA.

This is an asset-level preview, not an Expo screen or device test.
"""

import json
import re
from itertools import combinations
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFont, ImageStat


ROOT = Path(__file__).resolve().parents[1]
PROVIDER = ROOT / "apps/api/src/providers/library-image.provider.ts"
ASSETS = ROOT / "apps/mobile/assets/stories/v3"
OUTPUT = ROOT / "output/crop-audit"
CROPS = [(0.38, 0.5, 1.18), (0.63, 0.42, 1.27), (0.44, 0.64, 1.32), (0.65, 0.6, 1.2)]
PATTERN = re.compile(r"^  ([A-Z0-9_]+): \{\s*backgroundUri: 'asset://stories/v3/([^']+\.jpg)'", re.M)


def layout(source_width, source_height, frame_width, frame_height, crop):
    focus_x, focus_y, zoom = crop
    scale = max(frame_width / source_width, frame_height / source_height) * max(1, zoom)
    width, height = source_width * scale, source_height * scale
    left = max(frame_width - width, min(0, frame_width / 2 - focus_x * width))
    top = max(frame_height - height, min(0, frame_height / 2 - focus_y * height))
    return width, height, left, top


def preview(source, frame_width, frame_height, crop):
    width, height, left, top = layout(source.width, source.height, frame_width, frame_height, crop)
    scaled = source.resize((round(width), round(height)), Image.Resampling.LANCZOS)
    canvas = Image.new("RGB", (frame_width, frame_height))
    canvas.paste(scaled, (round(left), round(top)))
    return canvas


def main():
    matches = PATTERN.findall(PROVIDER.read_text(encoding="utf-8"))
    if len(matches) != 120 or len({story_id for story_id, _ in matches}) != 120:
        raise SystemExit(f"Expected 120 unique image mappings; found {len(matches)}")
    OUTPUT.mkdir(parents=True, exist_ok=True)
    records = []
    font = ImageFont.load_default()
    for offset in range(0, len(matches), 20):
        sheet = Image.new("RGB", (660, 20 * 220), "#10141d")
        draw = ImageDraw.Draw(sheet)
        for row, (story_id, filename) in enumerate(matches[offset : offset + 20]):
            path = ASSETS / filename
            if not path.exists():
                raise SystemExit(f"Missing background: {path}")
            with Image.open(path) as original:
                source = original.convert("RGB")
            cards = []
            for index, crop in enumerate(CROPS):
                # 320px UI card aspect ratio: 64x93; enlarge only for the review sheet.
                card = preview(source, 128, 186, crop)
                sheet.paste(card, (8 + index * 162, row * 220 + 20))
                cards.append(card)
            draw.text((8, row * 220 + 3), f"{offset + row + 1:03d} {story_id}", fill="#f4d28b", font=font)
            # Check all six pairs: non-adjacent cards must differ as well.
            pair_diffs = []
            for first, second in combinations(range(4), 2):
                reduced_a = cards[first].resize((16, 24), Image.Resampling.BILINEAR)
                reduced_b = cards[second].resize((16, 24), Image.Resampling.BILINEAR)
                diff = ImageChops.difference(reduced_a, reduced_b)
                pair_diffs.append({
                    "pair": [first + 1, second + 1],
                    "meanRgbDifference": round(sum(ImageStat.Stat(diff).mean) / 3, 2),
                })
            records.append({"id": story_id, "background": filename, "pairMeanDifference": pair_diffs})
        sheet.save(OUTPUT / f"contact-{offset // 20 + 1:02d}.jpg", quality=88)
    (OUTPUT / "metrics.json").write_text(json.dumps(records, indent=2), encoding="utf-8")
    near = [
        record for record in records
        if min(pair["meanRgbDifference"] for pair in record["pairMeanDifference"]) < 5
    ]
    print(f"Rendered {len(records)} stories, four card crops each, to {OUTPUT}")
    print(f"Near-identical crop pairs among all four cards (<5 mean RGB levels): {len(near)}")
    for record in near:
        print(record["id"], record["pairMeanDifference"])


if __name__ == "__main__":
    main()
