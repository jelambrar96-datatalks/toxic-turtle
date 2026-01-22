# Toxic Turtle Frontend

A React-based educational game frontend for learning programming fundamentals through turtle graphics.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Game Mechanics](#game-mechanics)
- [API Integration](#api-integration)
- [Keyboard Controls](#keyboard-controls)
- [Components](#components)
- [Styling](#styling)
- [Troubleshooting](#troubleshooting)

## ✨ Features

- **User Authentication**: Login and registration with JWT tokens
- **Level Progression**: Sequential level unlocking based on completion
- **Interactive Turtle Graphics**: Canvas-based visual feedback
- **Keyboard-Driven Gameplay**: Space, Arrow Left, Arrow Right controls
- **Code Viewer**: Line-by-line code execution display
- **Certificate Generation**: Certificate download on game completion
- **Responsive Design**: Mobile-friendly interface for children

## 🛠 Tech Stack

- **Framework**: React 18.2.0
- **Routing**: React Router 6.20.0
- **HTTP Client**: Fetch API (built-in browser API)
- **Graphics**: HTML5 Canvas API
- **Audio**: Web Audio API
- **Styling**: CSS3 with CSS variables
- **Authentication**: JWT tokens (localStorage)

## 📦 Prerequisites

- Node.js 14+ and npm 6+
- Backend API running on `http://localhost:8000` (or configured via `REACT_APP_API_URL`)
- Modern web browser with ES6+ support

## 🚀 Installation

### 1. Clone the Repository

```bash
cd toxic-turtle/frontend
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` to set the API URL if your backend is not on `localhost:8000`:

```
REACT_APP_API_URL=http://your-backend-url:8000
```

### 4. Start the Development Server

```bash
npm start
```

The app will open at `http://localhost:3000`

## 🎮 Running the Application

### Development Mode

```bash
npm start
```

- Opens automatically in browser
- Hot reload enabled
- Console shows detailed logs

### Production Build

```bash
npm run build
```

Creates optimized production build in `build/` folder.

### Testing (if tests added)

```bash
npm test
```

## 📁 Project Structure

```
frontend/
├── public/
│   └── index.html              # HTML entry point
├── src/
│   ├── pages/                  # Page components
│   │   ├── LoginPage.js        # User login page
│   │   ├── RegisterPage.js     # User registration
│   │   ├── HomePage.js         # Level selection hub
│   │   ├── GamePage.js         # Main game page with canvas
│   │   └── CertificatePage.js  # Certificate display/download
│   ├── components/             # Reusable components
│   │   ├── GameCanvas.js       # Canvas rendering turtle graphics
│   │   ├── CodeViewer.js       # Code display with cursor
│   │   ├── LevelGrid.js        # Level selection grid
│   │   └── ProtectedRoute.js   # Route authentication wrapper
│   ├── styles/                 # Component stylesheets
│   │   ├── HomePage.css
│   │   ├── GamePage.css
│   │   └── CertificatePage.css
│   ├── api.js                  # API client and utilities
│   ├── App.js                  # Main app component with routing
│   ├── index.js                # React entry point
│   └── index.css               # Global styles
├── package.json                # Dependencies and scripts
├── .env.example                # Environment configuration template
└── README.md                   # This file
```

## 🎯 Game Mechanics

### Level Structure

- **Total Levels**: Configurable (default 4 based on backend)
- **Level Access**: Sequential - each level unlocks after completing the previous
- **First Level**: Always unlocked on first visit
- **Current Level**: User's highest unlocked level (shown in header)

### Gameplay Flow

1. User logs in → Home page shows level grid
2. Click level button to enter game
3. Code viewer shows commands to execute
4. Keyboard input advances cursor
5. Correct input: turtle moves, sound plays ✓
6. Incorrect input: error sound plays ✗
7. All commands executed → Level complete!
8. All levels passed → Trophy button appears

### Turtle Movement

- **Position**: Turtle starts at canvas center (250, 250)
- **Direction**: Starts facing up (0°)
- **Movement**: Forward moves 40 pixels in current direction
- **Turning**: Rotates 90° left or right

## ⌨️ Keyboard Controls

| Key | Action |
|-----|--------|
| **Space** | Move turtle forward |
| **← (Left Arrow)** | Rotate turtle left 90° |
| **→ (Right Arrow)** | Rotate turtle right 90° |
| **↓ (Down Arrow)** | Alternative forward command |

## 🔌 API Integration

### Authentication Endpoints

```javascript
// Register new user
POST /auth/register
Body: { username, email, password }

// Login existing user
POST /auth/login
Body: { email, password }

// Get current user
GET /auth/me
Headers: { Authorization: Bearer <token> }
```

### Game Endpoints

All game endpoints require `Authorization: Bearer <token>` header.

```javascript
// Get current level progress
GET /game/current_level
Response: { current_level, total_levels }

// Get level-specific data
GET /game/get_level_data?level=N
Response: { code, movements, cursor, can_play }

// Submit level completion
POST /game/pass_level
Body: { level }

// Check if all levels passed
GET /game/check_pass_all_level
Response: { all_levels_passed }

// Register certificate
POST /game/register_certificate
Body: { certificate_name }

// Get all user certificates
GET /game/get_certified_data
Response: [{ certificate_name, issued_at }, ...]

// Check if certificate exists
GET /game/check_if_certified_exist?certificate_name=X
Response: { exists }
```

## 🎨 Components

### LoginPage
- Email/password form
- Error handling with alerts
- Link to register page
- Auto-redirects to home on success

### RegisterPage
- Username/email/password form
- Client-side validation
- Auto-login after registration
- Link to login page

### HomePage
- Level progress display
- Level grid with unlock logic
- Trophy button (when all levels passed)
- Logout button

### GamePage
- Code viewer (left panel)
- Canvas display (right panel)
- Keyboard event handling
- Success/error feedback
- Auto-complete/redirect on finish

### CertificatePage
- Certificate generation form
- HTML-based certificate design
- Download functionality
- Auto-redirect to home

### GameCanvas
- HTML5 Canvas rendering
- Turtle sprite drawing
- Line drawing for movements
- Grid background (optional)

### CodeViewer
- Line-by-line code display
- Current line highlighting (yellow)
- Line numbers
- Cursor marker animation

### LevelGrid
- 5×5 responsive grid
- Lock icons for unavailable levels
- Check marks for completed levels
- Click to select level

## 🎨 Styling

### Design Philosophy

- **Child-Friendly**: Bright colors, large clickable areas
- **Readable**: Clear typography, high contrast
- **Responsive**: Works on mobile, tablet, desktop
- **Animated**: Smooth transitions, visual feedback

### CSS Variables

```css
--primary-color: #3498db (Blue)
--secondary-color: #2c3e50 (Dark)
--success-color: #2ecc71 (Green)
--error-color: #e74c3c (Red)
--warning-color: #f39c12 (Orange)
--light-bg: #ecf0f1 (Light)
--dark-text: #2c3e50 (Dark)
```

### Responsive Breakpoints

- **Desktop**: 1200px+ (full layout)
- **Tablet**: 768px - 1200px (adjusted spacing)
- **Mobile**: 480px - 768px (stacked layout)
- **Small Mobile**: < 480px (minimal spacing)

## 🐛 Troubleshooting

### Application Won't Start

**Problem**: `Port 3000 already in use`

**Solution**:
```bash
# Kill existing process on port 3000
lsof -i :3000  # macOS/Linux
kill -9 <PID>

# Or use different port
PORT=3001 npm start
```

### Can't Connect to Backend

**Problem**: `Failed to fetch` or `Network Error`

**Solution**:
1. Check backend is running: `curl http://localhost:8000/docs`
2. Verify `REACT_APP_API_URL` in `.env` matches backend URL
3. Check CORS settings in backend (should allow localhost:3000)
4. Check browser console for detailed error messages

### Login Fails / Token Issues

**Problem**: `Unauthorized` or redirected to login after reload

**Solution**:
1. Clear localStorage: Open DevTools → Application → Storage → Clear All
2. Register new account and try again
3. Check token expiration (24 hours by default)
4. Verify browser allows localStorage

### Canvas Not Rendering

**Problem**: Game page shows blank canvas

**Solution**:
1. Check browser console for errors
2. Verify Canvas support in browser (all modern browsers support)
3. Check if level data loaded (should see code in left panel)
4. Try refreshing page

### Keyboard Controls Not Working

**Problem**: Turtle doesn't move with keyboard

**Solution**:
1. Click on canvas area to focus
2. Check correct keys: Space (forward), ArrowLeft/Right (turn)
3. Verify game not completed (won't accept input)
4. Check browser DevTools → Console for event listener errors

### Certificate Won't Download

**Problem**: Certificate HTML file not downloaded

**Solution**:
1. Check browser download settings
2. Try different browser
3. Check browser console for errors
4. Verify JavaScript enabled in browser

### Styling Looks Wrong

**Problem**: Colors, layout, or fonts look incorrect

**Solution**:
1. Clear browser cache: Ctrl+Shift+Delete (Windows) or Cmd+Shift+Delete (Mac)
2. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
3. Check `index.css` and component stylesheets loaded
4. Open DevTools → Inspector to debug CSS

## 🤝 Contributing

When adding features:

1. Follow existing component patterns
2. Use same CSS naming conventions
3. Add comments for complex logic
4. Test on mobile and desktop
5. Keep code simple and readable for educational purposes

## 📝 Notes

- All times in UTC (from backend)
- Levels use 1-based indexing in UI (backend uses 0-based)
- JWT tokens expire after 24 hours
- One certificate per user (prevents duplicates)
- Level data cached in API calls

## 📄 License

Educational project for learning purposes.
