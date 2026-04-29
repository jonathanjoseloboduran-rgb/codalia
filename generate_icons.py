"""Genera íconos PNG simples para la PWA de Codalia."""
from PIL import Image, ImageDraw, ImageFont
import os

os.makedirs("public/icons", exist_ok=True)

def make_icon(size, path):
    img = Image.new("RGB", (size, size), color="#0F172A")
    draw = ImageDraw.Draw(img)

    # Círculo de fondo azul
    margin = size // 8
    draw.ellipse([margin, margin, size - margin, size - margin], fill="#1E40AF")

    # Texto 🐍 o "Py" si no hay emoji support
    font_size = size // 3
    try:
        # Intentar con emoji font
        font = ImageFont.truetype("seguiemj.ttf", font_size)
        text = "🐍"
    except Exception:
        try:
            font = ImageFont.truetype("arial.ttf", font_size)
        except Exception:
            font = ImageFont.load_default()
        text = "Py"

    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    x = (size - tw) // 2
    y = (size - th) // 2
    draw.text((x, y), text, fill="white", font=font)

    img.save(path)
    print(f"OK {path}")

make_icon(192, "public/icons/icon-192.png")
make_icon(512, "public/icons/icon-512.png")
print("Iconos generados.")
