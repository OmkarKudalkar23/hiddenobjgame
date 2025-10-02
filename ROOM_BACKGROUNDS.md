# Room Background Configuration

## Current Room Setup

### Room 1: The Entrance Hall
- **Background**: `assets/bg.jpg`
- **Objects**: Candlestick, Vase, Rake, Telephone, Oil Lamp (5 objects)

### Room 2: The Living Room
- **Background**: `assets/bg2.jpg`
- **Objects**: Horse, Spider, Group, Teapot, Wood (5 objects)

### Room 3: The Study
- **Background**: `assets/items/bg1.png`
- **Objects**: Clock, Bucket, Book, Lamp, Teddy (5 objects)

### Room 4: The Attic
- **Background**: `assets/bg.jpg` (same as Room 1)
- **Objects**: Bat, Ball, Poster, Old clock, Old frame (5 objects)

### Room 5: The Final Chamber
- **Background**: `assets/items/bg.png`
- **Objects**: Frame, Cup, Lock (3 objects)

## Available Background Files

Based on the assets directory:
- `assets/bg.jpg` - Main haunted room
- `assets/bg2.jpg` - Alternative room (Living Room)
- `assets/items/bg.png` - Another background
- `assets/items/bg1.png` - Study room

## Testing Instructions

1. Go to `http://localhost:8000/landing.html`
2. Click on each room button to test:
   - **Room 1** → Should show `bg.jpg`
   - **Room 2** → Should show `bg2.jpg` (DIFFERENT from Room 1)
   - **Room 3** → Should show `bg1.png` (DIFFERENT from Rooms 1 & 2)
   - **Room 4** → Should show `bg.jpg` (same as Room 1)
   - **Room 5** → Should show `bg.png` (DIFFERENT)

## Console Verification

When you click a room, check the browser console (F12) for:
```
loadRoom called with index: 1
Total rooms: 5
Loading room: The Living Room
Loading background texture: assets/bg2.jpg
Background texture loaded successfully for: assets/bg2.jpg
```

The background path should change for each room!

## If Backgrounds Don't Change

1. **Hard refresh** the page (Ctrl+Shift+R)
2. **Clear browser cache**
3. **Check console** for any texture loading errors
4. **Verify files exist** in the assets folder
