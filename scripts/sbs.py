"""Compose two screenshots side by side (same width, top-aligned): python3 scripts/sbs.py local.png orig.png out.png"""
import sys
from PIL import Image, ImageDraw

a, b, out = sys.argv[1:4]
ia, ib = Image.open(a).convert('RGB'), Image.open(b).convert('RGB')
w = max(ia.width, ib.width)
h = max(ia.height, ib.height)
gap = 20
sheet = Image.new('RGB', (w * 2 + gap, h + 30), (60, 60, 60))
d = ImageDraw.Draw(sheet)
d.text((10, 8), f'LOCAL {ia.size}', fill=(255, 255, 255))
d.text((w + gap + 10, 8), f'ORIGINAL {ib.size}', fill=(255, 255, 255))
sheet.paste(ia, (0, 30))
sheet.paste(ib, (w + gap, 30))
sheet.save(out)
