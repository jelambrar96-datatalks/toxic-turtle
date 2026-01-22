# Frontend Architecture & Data Flow

## Component Hierarchy

```
App (Main Router)
├── ProtectedRoute
│   ├── LoginPage
│   │   └── Form (email, password)
│   │       └── authAPI.login()
│   │
│   ├── RegisterPage
│   │   └── Form (username, email, password)
│   │       └── authAPI.register() → authAPI.login()
│   │
│   ├── HomePage
│   │   ├── LevelGrid
│   │   │   └── Level Buttons (1-25)
│   │   │       └── onClick → navigate to /game/:level
│   │   │
│   │   └── gameAPI.getCurrentLevel()
│   │       gameAPI.checkPassAllLevel()
│   │
│   ├── GamePage
│   │   ├── CodeViewer
│   │   │   └── Code lines with cursor highlight
│   │   │
│   │   └── GameCanvas
│   │       ├── Canvas rendering
│   │       ├── Turtle sprite
│   │       └── Line drawing
│   │
│   └── CertificatePage
│       ├── Certificate form (get name)
│       ├── gameAPI.registerCertificate()
│       └── HTML certificate download
│
└── index.css (Global styles)
```

## Data Flow Diagram

### 1. Authentication Flow

```
┌─────────────┐
│ User Input  │
└──────┬──────┘
       │
       ▼
┌──────────────────┐
│ Form Validation  │
└──────┬───────────┘
       │
       ▼
┌──────────────────────────┐        ┌────────────────┐
│ authAPI.login()          │───────▶│ Backend Auth   │
│ authAPI.register()       │        │ Endpoint       │
└──────┬───────────────────┘        └────────┬───────┘
       │                                     │
       │◀───────────────────────────────────┘
       │ JWT Token
       ▼
┌──────────────────────────┐
│ localStorage.setItem()   │
│ "token" → JWT            │
└──────┬───────────────────┘
       │
       ▼
┌──────────────────────────┐
│ Navigate to /home        │
└──────────────────────────┘
```

### 2. Game Flow

```
┌─────────────────┐
│ HomePage        │
│ Load Progress   │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│ gameAPI.getCurrentLevel()           │
│ gameAPI.checkPassAllLevel()         │
└────────┬────────────────────────────┘
         │ {current_level, total_levels}
         ▼
┌─────────────────────────────────────┐
│ Display LevelGrid                   │
│ Show locked/unlocked levels         │
└────────┬────────────────────────────┘
         │
         │ Click Level
         ▼
┌─────────────────────────────────────┐
│ GamePage (/game/:level)             │
│ gameAPI.getLevelData(level)         │
└────────┬────────────────────────────┘
         │ {code, movements, cursor}
         ▼
┌──────────────┬────────────────────┐
│ CodeViewer   │ GameCanvas         │
│ Display code │ Render turtle      │
└────────┬─────┴────────┬───────────┘
         │              │
         │ Cursor       │ Turtle
         │ Highlight    │ Position
         │              │
         ▼──────────────▼
┌─────────────────────────────────────┐
│ Keyboard Event Listener             │
│ Space / ArrowLeft / ArrowRight      │
└────────┬────────────────────────────┘
         │
         ▼ Is correct?
    ┌────┴────┐
    │          │
   YES        NO
    │          │
    ▼          ▼
Success    playSound('error')
playSound
('success')
    │
    ▼
Update cursor
Update turtle
Redraw canvas
    │
    │ All commands done?
    ▼
┌─────────────────────────────────────┐
│ gameAPI.passLevel(level)            │
│ Record completion                   │
└────────┬────────────────────────────┘
         │
         ▼
    Navigate to /home
```

### 3. Certificate Flow

```
┌────────────────────────────────┐
│ HomePage                       │
│ Trophy Button                  │
│ (all_levels_passed === true)   │
└────────┬───────────────────────┘
         │ Click
         ▼
┌────────────────────────────────┐
│ CertificatePage                │
└────────┬───────────────────────┘
         │
         ▼
┌────────────────────────────────┐
│ Check existing certificate     │
│ gameAPI.checkIfCertificateExists│
└────────┬───────────────────────┘
         │
    ┌────┴─────────┐
    │              │
EXISTS           NOT EXISTS
    │              │
    ▼              ▼
Auto-download   Show modal
              for name input
                  │
                  ▼
            User enters name
                  │
                  ▼
         gameAPI.registerCertificate()
                  │
                  ▼
         Generate HTML cert
                  │
                  ▼
         Browser download
                  │
                  ▼
         Navigate to /home
```

## API Integration

### Request Flow

```
┌─────────────────────────────────┐
│ React Component                 │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ api.js functions                │
│ - authAPI.login()               │
│ - gameAPI.getCurrentLevel()     │
│ - gameAPI.passLevel()           │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Fetch API                       │
│ Add headers:                    │
│ - Content-Type: application/json│
│ - Authorization: Bearer TOKEN   │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ HTTP Request                    │
│ POST/GET http://localhost:8000/ │
│ auth/game endpoints             │
└────────┬────────────────────────┘
         │
         ▼ Backend processes
         │
         ▼
┌─────────────────────────────────┐
│ HTTP Response                   │
│ 200 OK + JSON body              │
│ 401 Unauthorized                │
│ 403 Forbidden                   │
│ 404 Not Found                   │
│ 500 Server Error                │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Response Handler                │
│ - Parse JSON                    │
│ - Check status code             │
│ - Handle errors                 │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│ Return to Component             │
│ Update state with data          │
│ Render UI                       │
└─────────────────────────────────┘
```

## State Management

### Token Storage

```
┌──────────────────────────────────────┐
│ localStorage (Browser Storage)       │
├──────────────────────────────────────┤
│ Key: "token"                         │
│ Value: JWT Token string              │
│                                      │
│ Persists across:                     │
│ ✓ Page refreshes                     │
│ ✓ Browser closures                   │
│ ✗ Private/Incognito windows          │
│ ✗ Different browsers                 │
└──────────────────────────────────────┘

    │
    ├─ setAuthToken(token) ───▶ store in localStorage
    │
    ├─ getAuthToken() ─────────▶ retrieve from localStorage
    │
    ├─ clearAuthToken() ───────▶ delete from localStorage
    │
    └─ Used in every API call headers
       Authorization: Bearer {token}
```

### Component State

```
App.js
├── Authentication State
│   └── Token checked on mount
│       - If present → allow access
│       - If missing → redirect to /login
│
HomePage.js
├── useState({
│     currentLevel: number,
│     totalLevels: number,
│     allLevelsPassed: boolean,
│     loading: boolean,
│     error: string
│   })
│
GamePage.js
├── useState({
│     levelData: object,
│     cursor: number (0-N),
│     completed: boolean,
│     turtleState: {
│       x: number,
│       y: number,
│       direction: degrees (0/90/180/270)
│     }
│   })
│   └── lineData: useRef([]) - persists across renders
│
CertificatePage.js
├── useState({
│     fullName: string,
│     loading: boolean,
│     error: string,
│     success: boolean,
│     showModal: boolean
│   })
```

## Canvas Coordinate System

```
Traditional Canvas (Default)
┌─────────────────────────┐
│ (0,0)              (500,0)
│   ▲
│   │ Y increases ▼
│   │
│ (0,500)          (500,500)
└─────────────────────────┘

Turtle Game (Center Origin)
         N (UP, 0°)
         │
    ◀────●────▶ 90°
         │ 270°
         S
       180°

Canvas Translation:
- Center: (250, 250)
- Turtle Direction: 0° = UP (North)
  * 0°   = -Y direction (up)
  * 90°  = +X direction (right)
  * 180° = +Y direction (down)
  * 270° = -X direction (left)

Position Calculation:
newX = x + distance * cos(direction)
newY = y - distance * sin(direction)  // Negative because Y inverted
```

## Component Lifecycle

### GamePage Lifecycle

```
Mount
  ↓
Load level data (useEffect)
  ↓
Initialize canvas
  ↓
Ready for input
  ↓
User presses key
  ↓
Validate input
  ├─ Correct → Update turtle → Redraw
  └─ Wrong → Play error sound
  ↓
Check if completed
  ├─ No → Await next input
  └─ Yes → Save progress → Redirect
  ↓
Unmount (cleanup listeners)
```

## Sound Generation

```
┌────────────────────────────────────┐
│ playSound(type)                    │
│ Called on: correct/incorrect input │
└────────┬─────────────────────────────┘
         │
         ▼
    ┌────┴─────────┐
    │              │
 type='success'  type='error'
    │              │
    ▼              ▼
800 Hz beep    300 Hz beep
100ms duration  50ms duration
    │              │
    └──────┬───────┘
           │
           ▼
Web Audio API Oscillator
      │
      ▼
Browser Speaker
      │
      ▼
✓ Success sound    ✗ Error sound
```

## Error Handling Chain

```
API Call
  │
  ▼
Network Error?
  ├─ Yes → "Failed to connect to server"
  └─ No → Continue
  │
  ▼
HTTP Error Status?
  ├─ 401 → "Session expired. Please login."
  ├─ 403 → "Access denied. Complete previous levels."
  ├─ 404 → "Level not found."
  └─ 500 → "Server error. Try again later."
  │
  ▼
JSON Parse Error?
  ├─ Yes → "Invalid response from server"
  └─ No → Continue
  │
  ▼
Validation Error?
  ├─ Yes → Display field errors
  └─ No → Continue
  │
  ▼
✓ Success
```

## Performance Optimization

```
Code Splitting
├── pages/ (lazy loaded)
│   ├── LoginPage (only on /login)
│   ├── GamePage (only on /game/:level)
│   └── CertificatePage (only on /certificate)
│
CSS-in-JS vs CSS Files
├── ✓ Separate CSS files (better performance)
│
Image Optimization
├── Turtle drawn via Canvas (no image file needed)
├── Emojis used for icons (no image files)
│
State Optimization
├── useRef for canvas (no re-render)
├── useRef for lineData (persist across renders)
│
Network Optimization
├── Fetch API (same as axios, no extra library)
├── Compress JSON responses
└── Cache level data after first load
```

