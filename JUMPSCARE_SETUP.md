# Jumpscare Setup for Shadows of Bhangarh

## 🎬 Jumpscare Feature

The game now includes a **surprise jumpscare** that triggers exactly **1 minute** after gameplay begins, adding an intense horror element to keep players on edge!

## 📁 Video File Setup

### Create the jumpscare directory
Create a folder called `jumpscare` in the game root directory (same level as `index.html`).

### Add jumpscare video file:

**Video file requirements:**
- **Primary file**: `jumpscare.mp4` (recommended)
- **Backup file**: `jumpscare.webm` (for browser compatibility)
- **Location**: `jumpscare/jumpscare.mp4` and `jumpscare/jumpscare.webm`

## Directory Structure
```
game2/
├── index.html
├── landing.html
├── css/
├── js/
├── assets/
├── audio/
└── jumpscare/         ← Create this folder
    ├── jumpscare.mp4  ← Add this file (primary)
    └── jumpscare.webm ← Add this file (backup)
```

## 🎯 Jumpscare Specifications

### **Timing**
- Triggers **exactly 1 minute** after game starts
- Only happens **once per game session**
- Resets when player restarts the game

### **Video Requirements**
- **Duration**: 2-8 seconds recommended (max 10 seconds)
- **Resolution**: Any (will scale to fullscreen)
- **Audio**: Include scary sound effects in the video
- **Format**: MP4 (primary) + WebM (fallback)

### **Behavior**
- **Fullscreen takeover**: Video covers entire game screen
- **Audio**: Plays at 80% volume (unmuted during jumpscare)
- **Background music**: Pauses during jumpscare, resumes after
- **Auto-hide**: Disappears when video ends
- **Fallback**: If video fails to load, shows black screen for 3 seconds

## 🎨 Visual Effects

### **Flash Animation**
- Quick red flash when jumpscare appears
- Smooth fade-in effect
- Black background behind video

### **Fullscreen Coverage**
- Video scales to cover entire viewport
- Maintains aspect ratio with `object-fit: cover`
- High z-index (9999) to appear above everything

## 🔧 Technical Details

### **Video Loading**
- Videos are preloaded when game initializes
- Graceful fallback if files are missing
- Console logging for debugging

### **Timer System**
- Starts counting when game begins (after first clue appears)
- Clears timer on game restart or menu navigation
- Prevents multiple jumpscares in same session

### **Audio Integration**
- Respects mute button (won't play if audio disabled)
- Temporarily pauses background music
- Resumes background music after jumpscare ends

## 🎬 Recommended Video Content

### **Effective Jumpscares**
- **Sudden appearance**: Ghost, monster, or scary face
- **Quick movement**: Something rushing toward camera
- **Loud sound**: Screaming, banging, or sudden noise
- **Brief duration**: 2-5 seconds for maximum impact

### **Video Tips**
- **High contrast**: Dark to bright sudden change
- **Loud audio**: Include scary sound effects
- **Quick cut**: Abrupt start and end
- **Startling imagery**: Unexpected scary visuals

## 🧪 Testing

1. **Add video files** to `jumpscare/` folder
2. **Start game** from landing page
3. **Wait 1 minute** (or modify timer for testing)
4. **Verify jumpscare** appears fullscreen
5. **Check audio** plays during jumpscare
6. **Confirm auto-hide** when video ends

### **Testing Timer (Optional)**
To test faster, temporarily change line in `panoram.js`:
```javascript
// Change from 60000 (1 minute) to 5000 (5 seconds) for testing
}, 5000); // 5 seconds for testing
```

## 🎮 Player Experience

- **Surprise element**: Unexpected timing keeps players tense
- **Brief interruption**: Quick scare doesn't break gameplay flow  
- **Atmospheric enhancement**: Adds to horror theme
- **One-time event**: Doesn't become annoying with repetition

The jumpscare system adds a thrilling horror element that will genuinely surprise players exactly when they're getting comfortable with the game!
