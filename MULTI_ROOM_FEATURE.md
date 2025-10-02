# Multi-Room Progression System

## Overview
The game now features a multi-room progression system where players explore 5 different haunted chambers in Bhangarh Fort. Each room contains hidden objects that must be found before a door opens to the next chamber.

## Features

### 🚪 Room Progression
- **5 Unique Rooms**: The Entrance Hall, The Living Room, The Study, The Attic, and The Final Chamber
- **Progressive Difficulty**: Each room contains 3-5 hidden objects
- **Dynamic Backgrounds**: Each room has its own atmospheric background image

### 🎬 Door Animations
- When all objects in a room are found, a door appears and animates open
- Smooth rotation animation (2 seconds) with easing
- Door automatically transitions player to the next room after opening
- No door in the final room (game ends after finding all objects)

### 🌟 Room Transitions
- Fade to black transition effect between rooms
- Room name display with dramatic entrance animation
- Smooth background texture swapping
- Objects are hidden/shown based on current room

### 📊 Progress Indicator
- Visual dots at the bottom of the screen show room progress
- Green dots = completed rooms
- Orange pulsing dot = current room
- Gray dots = upcoming rooms

### 🏆 Victory Screen
- Enhanced victory message: "You've Conquered the Shadows of Bhangarh!"
- Trophy icons and celebratory styling
- Displays total score with emphasis
- Victory animation on completion

## Room Configuration

### Room 1: The Entrance Hall
- **Objects**: Candlestick, Vase, Rake, Telephone, Oil Lamp
- **Background**: Main haunted room
- **Door Position**: Center of view

### Room 2: The Living Room
- **Objects**: Horse, Spider, Group Photo, Teapot, Wood
- **Background**: Alternative haunted space
- **Door Position**: Right side

### Room 3: The Study
- **Objects**: Clock, Bucket, Book, Lamp, Teddy Bear
- **Background**: Study room
- **Door Position**: Left side

### Room 4: The Attic
- **Objects**: Bat, Ball, Poster, Old Clock, Old Frame
- **Background**: Attic space
- **Door Position**: Center-right

### Room 5: The Final Chamber
- **Objects**: Frame, Cup, Lock
- **Background**: Final room
- **No Door**: Game ends after completion

## Technical Implementation

### Key Functions
- `loadRoom(roomIndex)` - Loads a specific room with its objects and background
- `createDoor(position, rotation)` - Creates a 3D door mesh in the scene
- `showDoorAnimation()` - Animates the door opening
- `transitionToNextRoom()` - Handles fade transition between rooms
- `showRoomTransition(roomName)` - Displays room name overlay
- `updateRoomProgress()` - Updates the progress indicator dots

### Game Flow
1. Player starts in Room 1 (The Entrance Hall)
2. Find all objects in the room (clues guide the player)
3. Door appears and opens with animation
4. Fade to black transition
5. Next room loads with new background and objects
6. Repeat until all 5 rooms are completed
7. Victory screen displays

## Customization

### Adding More Rooms
Edit the `rooms` array in `panoram.js`:

```javascript
rooms = [
  {
    name: 'Your Room Name',
    background: 'path/to/background.jpg',
    objects: ['Object1', 'Object2', 'Object3'],
    doorPosition: { x: 0, y: -50, z: -250 },
    doorRotation: { x: 0, y: 0, z: 0 }
  }
];
```

### Adjusting Door Appearance
Modify `createDoor()` function to change:
- Door size (PlaneGeometry dimensions)
- Door color (material color)
- Frame styling

### Changing Transition Speed
Adjust timing in `transitionToNextRoom()`:
- Fade duration: `fadeOverlay.style.transition`
- Room load delay: `setTimeout` values

## CSS Classes
- `.room-transition-overlay` - Black fade overlay
- `.room-name-display` - Room name text styling
- `.room-progress` - Progress indicator container
- `.room-progress-dot` - Individual progress dots
- `.victory-message` - Victory screen animation

## Notes
- Doors are hidden until all room objects are found
- Players cannot interact during transitions (`isTransitioning` flag)
- Room progress persists through the game session
- Restart button resets to Room 1
- Score accumulates across all rooms
