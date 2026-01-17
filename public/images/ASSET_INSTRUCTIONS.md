# Asset Instructions for Animated Landing Page

## Required Assets

### 1. floating-man.mp4 (Primary) / floating-man.webm (Optional)
**Location:** `/public/images/floating-man.mp4` and `/public/images/floating-man.webm`

**Description:**
A looping video showing a man floating/falling in the air. This should be extracted and animated from the existing `falling-engraving.jpeg` image.

**Why Video Instead of GIF:**
- Much smaller file size (up to 90% smaller)
- Better quality at same file size
- Smoother animations
- Faster loading
- Modern browsers have excellent video support

**Recommended Specifications:**
- **Primary Format:** MP4 (H.264 codec)
- **Optional Format:** WebM (VP9 codec) for better compression
- **Dimensions:** 512x512px (or maintain aspect ratio)
- **Frame Rate:** 24-30 fps
- **Duration:** 2-4 seconds (will loop seamlessly)
- **Background:** Transparent (use VP9/H.265 with alpha) or black
- **Style:** Match the engraving aesthetic from the background image
- **File Size Target:** Under 500KB

**How to Create:**

#### Option 1: Using Video Editing Software (Adobe After Effects, Premiere Pro, etc.)
1. Extract the falling man figure from `falling-engraving.jpeg`
2. Remove background (make transparent if possible)
3. Create keyframe animation with subtle up/down movement (floating effect)
4. Make it loop seamlessly (end frame should match start frame)
5. Export as MP4 with these settings:
   - Codec: H.264
   - Quality: Medium-High
   - Optimize for web

#### Option 2: Using Free Tools (Blender, DaVinci Resolve, etc.)
1. Import the man figure as a layer
2. Animate position: Start → Move up 20px → Return to start
3. Use ease-in/ease-out for smooth motion
4. Export with web optimization

#### Option 3: Convert from GIF (if you already made a GIF)
```bash
# Using ffmpeg to convert GIF to MP4
ffmpeg -i floating-man.gif -movflags faststart -pix_fmt yuv420p -vf "scale=512:512" floating-man.mp4

# Create WebM version (better compression)
ffmpeg -i floating-man.gif -c:v libvpx-vp9 -b:v 0 -crf 30 floating-man.webm
```

**Testing the Video:**
After creating the video, test it by placing it in `/public/images/` and refreshing your browser at http://localhost:3000

### 2. black-hole.png (Optional)
**Location:** `/public/images/black-hole.png`

**Description:**
A black hole image for the transition effect. This is optional as the component currently uses a CSS-generated black hole effect.

**If you want to use a custom image:**
- Format: PNG with transparency
- Dimensions: 1024x1024px recommended
- Style: Dark, mysterious, with purple/blue glow effects
- Should match the engraving aesthetic

**Current Behavior:**
The app will work without this file using the CSS-generated black hole effect in `AnimatedLanding.tsx`. If you provide this image, uncomment line 57 in `components/landing/AnimatedLanding.tsx`:

```tsx
<img src="/images/black-hole.png" alt="" className="w-full h-full object-contain" />
```

### 3. floating-man-fallback.png (Fallback)
**Location:** `/public/images/floating-man-fallback.png`

**Description:**
A static image of the falling man used as a fallback if the video fails to load (rare, but good practice).

**Specifications:**
- Format: PNG with transparency
- Dimensions: 512x512px
- Single frame from the video/animation
- This will only show if the user's browser doesn't support video

## Temporary Fallback

Until you create the video files, the component will show a broken video placeholder. The animations and transitions will still work correctly.

**To test without the video**, you can temporarily replace the video element in `components/landing/FloatingMan.tsx` with a placeholder:

```tsx
// Replace the <video> tag with a placeholder div
<div className="w-64 h-64 bg-gradient-to-br from-gray-700 to-gray-900 rounded-full flex items-center justify-center text-white font-bold text-xl">
  FLOATING MAN
</div>
```

## Quick Start: Creating Your First Video

If you have `falling-engraving.jpeg` and basic tools:

1. Extract the man figure (use Photoshop/GIMP to isolate)
2. Save as PNG with transparent background
3. Use this simple Python script to create a floating animation:

```python
# Creates a simple video with up/down motion
# Requires: pip install moviepy pillow
from moviepy.editor import ImageClip
import numpy as np

def make_float(t):
    # Sine wave for smooth up/down motion
    return (0, int(20 * np.sin(2 * np.pi * t / 3)))

clip = ImageClip("floating-man.png", duration=3)
clip = clip.set_position(make_float)
clip.write_videofile("floating-man.mp4", fps=30)
```

Or just place a static image temporarily and add video later!
