from moviepy import ImageClip, TextClip, CompositeVideoClip, concatenate_videoclips
from pathlib import Path

# =========================
# Configuration
# =========================
LOGO = "logo.png"   # your Nexasec logo
OUTPUT = "nexasec_intro.mp4"
BRAND_COLOR = "#00FFFF"  # cyan
TEXT_COLOR = "white"
FPS = 30
RESOLUTION = (1280, 720)
DEFAULT_FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"

# =========================
# Helper function: make a text clip
# =========================

def make_text(txt, fontsize=60, duration=5, color="white"):
    """
    Generate text as a TextClip using MoviePy's TextClip (needs ImageMagick or a PIL backend).
    """
    return (
        TextClip(text=txt, font_size=fontsize, color=color, font=DEFAULT_FONT)
        .with_duration(duration)
        .with_position("center")
    )

# =========================
# Scenes
# =========================
# 1. Intro
logo = (
    ImageClip(LOGO)
    .with_duration(5)
    .resized(height=250)
    .with_position("center")
)

intro_text = make_text("Welcome to Nexasec", fontsize=70, duration=5, color=BRAND_COLOR).with_position(("center", 500))

scene1 = CompositeVideoClip([logo, intro_text], size=RESOLUTION)

# 2. Who we are
scene2_text1 = make_text("Affordable VAPT & Network Monitoring", fontsize=50, duration=10, color=TEXT_COLOR).with_position(("center", 350))
scene2_text2 = make_text("Advanced Cybersecurity for East Africa", fontsize=45, duration=10, color=BRAND_COLOR).with_position(("center", 450))

scene2 = CompositeVideoClip([scene2_text1, scene2_text2], size=RESOLUTION)

# 3. Our Services
services = [
    "🛡 Threat Prevention",
    "🔒 Data Protection",
    "🌐 Infrastructure Security",
    "👥 Security Training",
]
service_clips = [make_text(s, fontsize=50, duration=3, color=TEXT_COLOR) for s in services]
scene3 = concatenate_videoclips(service_clips, method="compose")

# 4. Why Choose Us
reasons = [
    "✅ Local Expertise",
    "✅ AI-Powered Solutions",
    "✅ 24/7 Monitoring",
    "✅ Scalable Services",
]
reason_clips = [make_text(r, fontsize=50, duration=3, color=BRAND_COLOR) for r in reasons]
scene4 = concatenate_videoclips(reason_clips, method="compose")

# 5. Call to Action
cta_text1 = make_text("Protect Your Business Today", fontsize=60, duration=7, color=BRAND_COLOR).with_position(("center", 400))
cta_text2 = make_text("Start with Nexasec", fontsize=50, duration=7, color=TEXT_COLOR).with_position(("center", 500))

scene5 = CompositeVideoClip([
    logo.with_duration(7),
    cta_text1,
    cta_text2,
], size=RESOLUTION)

# 6. Outro
outro_text = make_text("nexasec.com | info@nexasec.com", fontsize=40, duration=5, color=BRAND_COLOR).with_position(("center", 500))
scene6 = CompositeVideoClip([
    logo.with_duration(5),
    outro_text,
], size=RESOLUTION)

# =========================
# Final Video
# =========================
final = concatenate_videoclips(
    [scene1, scene2, scene3, scene4, scene5, scene6],
    method="compose",
)

final.write_videofile(OUTPUT, fps=FPS, codec="libx264", audio=False)
