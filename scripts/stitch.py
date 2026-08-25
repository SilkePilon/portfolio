"""Stitch viewport screenshots into one tall image: python3 scripts/stitch.py parts.json out.png"""
import json, sys
from PIL import Image
spec = json.load(open(sys.argv[1]))
w, total = spec['width'], spec['total']
sheet = Image.new('RGB', (w, total), (14, 14, 14))
y = 0
for part in spec['parts']:
    im = Image.open(part['file']).convert('RGB')
    if part['top']:
        im = im.crop((0, part['top'], im.width, im.height))
    sheet.paste(im, (0, y))
    y += im.height
sheet.save(sys.argv[2])
