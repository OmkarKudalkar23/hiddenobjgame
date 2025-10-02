# Room Locking & Scoring System

## ✅ Features Implemented

### 🔒 Room Locking System
- **Only Room 1 is unlocked initially**
- Players MUST complete rooms in sequential order
- Attempting to access locked rooms redirects to Room 1
- Room unlock status persists using localStorage
- Security: URL parameter validation prevents skipping rooms

### 📊 Per-Room Scoring
- Each room tracks its own score separately
- Scores accumulate across all rooms
- Room scores displayed in victory screen breakdown

### 🏆 Victory Screen Enhancements
- Shows total cumulative score
- Displays individual score for each room
- Color-coded scores (green for positive, red for negative)
- Room-by-room breakdown with room names

### 💾 Progress Persistence
- Unlocked rooms saved to browser localStorage
- Progress persists between sessions
- "Reset Progress" button to start fresh

## 🎮 How It Works

### Initial State
```
Room 1: 🔓 Unlocked (The Entrance Hall)
Room 2: 🔒 Locked (The Living Room)
Room 3: 🔒 Locked (The Study)
Room 4: 🔒 Locked (The Attic)
Room 5: 🔒 Locked (The Final Chamber)
```

### After Completing Room 1
```
Room 1: ✅ Completed (Score: +50)
Room 2: 🔓 Unlocked (The Living Room)
Room 3: 🔒 Locked
Room 4: 🔒 Locked
Room 5: 🔒 Locked
```

### Progression
- Complete Room 1 → Unlock Room 2
- Complete Room 2 → Unlock Room 3
- Complete Room 3 → Unlock Room 4
- Complete Room 4 → Unlock Room 5
- Complete Room 5 → Victory!

## 🔐 Security Features

### URL Parameter Validation
```javascript
// User tries: index.html?room=3 (but only rooms 0-1 are unlocked)
// System redirects to: index.html (Room 0)
```

### Landing Page Protection
- Locked room buttons are disabled
- Visual indication (🔒 Locked)
- Grayed out appearance
- Cannot be clicked

## 📈 Scoring System

### Score Tracking
- **Correct object**: +10 points (added to current room score)
- **Wrong click**: -5 points (subtracted from current room score)
- **Room score**: Sum of all points earned in that room
- **Total score**: Sum of all room scores

### Victory Screen Display
```
You've Conquered the Shadows of Bhangarh!

Room Scores:
The Entrance Hall: +50 points
The Living Room: +45 points
The Study: +40 points
The Attic: +35 points
The Final Chamber: +30 points

Total Score: 200
```

## 🔄 Reset Progress

### How to Reset
1. Go to landing page
2. Click "Reset Progress" button
3. Confirm the action
4. All rooms except Room 1 will be locked again
5. Page refreshes automatically

### What Gets Reset
- ✅ Room unlock status (back to 1)
- ✅ Visual lock indicators on landing page
- ❌ Current game session scores (only on restart)

## 🎯 Testing

### Test Room Locking
1. Start fresh (or reset progress)
2. Only Room 1 should be accessible
3. Try clicking Room 2 button - should be disabled
4. Complete Room 1 by finding all 5 objects
5. Return to landing page
6. Room 2 should now be unlocked

### Test URL Security
1. Manually type: `http://localhost:8000/index.html?room=3`
2. Should redirect to Room 0 (first room)
3. Console shows: "⚠️ Room 3 is locked! Starting with room 0"

### Test Score Tracking
1. Play through all 5 rooms
2. Note your score in each room
3. Complete final room
4. Victory screen shows breakdown of all room scores
5. Total score = sum of all room scores

## 💡 Tips for Players

- **Sequential gameplay**: You must complete rooms in order
- **Score matters**: Try to maximize your score in each room
- **No skipping**: Can't jump ahead to later rooms
- **Progress saved**: Your unlocked rooms persist even if you close the browser
- **Fresh start**: Use "Reset Progress" to start over

## 🛠️ Technical Details

### LocalStorage Keys
- `roomsUnlocked`: Number of rooms unlocked (1-5)

### Global Variables
- `roomsUnlocked`: Current number of unlocked rooms
- `roomScores[]`: Array of scores for each room
- `totalScore`: Cumulative score across all rooms
- `currentRoom`: Currently active room (0-4)

### Functions
- `loadRoom(index)`: Validates room access before loading
- `transitionToNextRoom()`: Unlocks next room and saves to localStorage
- `endGame()`: Displays room-by-room score breakdown
- `restartGame()`: Resets to Room 1 with locked rooms
