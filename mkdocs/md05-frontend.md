
# 5. 🖥️ Frontend Architecture (Presentation Layer)

### 1️⃣ Component-Based UI (React)

The frontend is built using **React**, following a **component-driven architecture**.

Each screen is isolated as a component:

```
src/
├── pages/
│   ├── Login.jsx
│   ├── Register.jsx
│   ├── Home.jsx
│   ├── Game.jsx
│   └── Certificate.jsx
│
├── components/
│   ├── LevelGrid.jsx
│   ├── TurtleCanvas.jsx
│   ├── CodeViewer.jsx
│   ├── TrophyButton.jsx
│   └── CertificateModal.jsx
```

### Why this matters

* Each feature is self-contained
* Easy to modify or replace
* Ideal for AI-assisted generation

---

### 2️⃣ Routing Layer

**React Router** manages navigation:

| Route          | Purpose              |
| -------------- | -------------------- |
| `/login`       | User login           |
| `/register`    | User registration    |
| `/home`        | Level selection      |
| `/game/:level` | Gameplay             |
| `/certificate` | Certificate download |

Routing ensures:

* No page reloads
* Clear separation of responsibilities

---

## 🎮 Game Engine Architecture (Frontend Logic)

The **game engine lives entirely on the frontend**, but it is **data-driven by the backend**.

### Core Principle

> The frontend never invents game rules.
> It only **executes instructions received from the backend**.

---

### 🧠 Game State Model

```
Game State
├── currentLevel
├── expectedMovements[]
├── currentStep
├── turtlePosition { x, y }
├── turtleDirection (0°, 90°, 180°, 270°)
├── drawnPaths[]
└── canPlay
```

This makes the game:

* Deterministic
* Easy to debug
* Predictable for children

---

### ⌨️ Input → Validation → Rendering Flow

```
Keyboard Input
      ↓
Validate against expected movement
      ↓
Correct? ── Yes ──► Update turtle state
      │
      └─ No ──► Play error feedback
```

This loop reinforces **computational thinking**:

* Sequence
* Conditionals
* State transitions

---

## 🎨 Canvas Rendering Architecture

The **HTML5 Canvas** acts as a mini rendering engine.

### Canvas Responsibilities

* Draw turtle
* Draw path lines
* Rotate turtle
* Maintain coordinate system

### Separation of Concerns

| Module          | Responsibility       |
| --------------- | -------------------- |
| Turtle State    | Position & direction |
| Canvas Renderer | Visual output        |
| Game Logic      | Rules & validation   |

This mirrors **real game engine design**, simplified for education.

---

## 🧠 Code Visualization Architecture

The **Code Viewer** is a read-only educational element.

```
KTurtle Code
├── forward 10
├── forward 20
├── turnleft 90
```

* Cursor highlights current line
* Moves only on correct action
* Teaches code → behavior mapping

---

## 🏠 Home & Progress Architecture

### Level Unlock Logic

Backend provides:

```
current_level
total_levels
```

Frontend applies deterministic rules:

* Passed levels → unlocked
* Next level → unlocked
* Others → locked

This ensures:

* Progress integrity
* No cheating
* Clear learning path

---

## 🏆 Certificate Architecture

Certificate flow is **event-driven**:

```
All Levels Completed
        ↓
Trophy Activated
        ↓
Certificate Check
        ↓
Modal (First Time Only)
        ↓
Download Certificate
```

The frontend is responsible for:

* UI
* Modals
* Download handling

Backend handles:

* Validation
* Storage
* Identity binding

---