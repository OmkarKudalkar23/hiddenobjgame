# Audio Setup for Shadows of Bhangarh

## Required Audio Files

To enable sound effects in the game, you need to add two audio files to the `audio/` directory:

### 1. Create the audio directory
Create a folder called `audio` in the game root directory (same level as `index.html`).

### 2. Add these audio files:

**For correct clicks (when player finds the right object):**
- File name: `correct.mp3`
- Location: `audio/correct.mp3`
- Suggested sound: A positive chime, bell, or success sound
- Duration: 0.5-2 seconds recommended

**For wrong clicks (when player clicks wrong object or empty space):**
- File name: `wrong.mp3` 
- Location: `audio/wrong.mp3`
- Suggested sound: A negative buzz, error sound, or spooky sound effect
- Duration: 0.5-1.5 seconds recommended

**For background music (continuous atmospheric music):**
- File name: `background.mp3`
- Location: `audio/background.mp3`
- Suggested sound: Horror ambient music, creepy atmosphere, dark instrumental
- Duration: Any length (will loop automatically)
- Volume: Set to 30% automatically

## Directory Structure
```
game2/
├── index.html
├── landing.html
├── css/
├── js/
├── assets/
└── audio/          ← Create this folder
    ├── correct.mp3 ← Add this file
    ├── wrong.mp3   ← Add this file
    └── background.mp3 ← Add this file
```

## Audio Settings
- Correct sound volume: 70% (0.7)
- Wrong sound volume: 50% (0.5)
- Background music volume: 30% (0.3)
- Background music loops automatically
- All sounds will restart from beginning on each play
- If audio files are missing, the game will continue to work without sound effects

## Audio Controls
- **Mute/Unmute button**: 🔊/🔇 button in top-left (next to Back to Menu)
- **Mute toggles**: All audio including background music and sound effects
- **Background music**: Starts automatically when game begins, stops when returning to menu

## Recommended Audio Types
- **Correct sound**: Magical chime, success bell, positive ding
- **Wrong sound**: Horror-themed buzz, creepy sound, error tone  
- **Background music**: Dark ambient, horror atmosphere, creepy instrumental music

## Testing
1. Add the audio files to the `audio/` folder
2. Start the game from `landing.html`
3. Test both correct and wrong clicks to hear the sound effects
4. Check browser console for any audio loading errors

The game will automatically detect and load the audio files when initialized.
