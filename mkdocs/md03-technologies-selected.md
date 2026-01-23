# 3. Technologies and architecure

This project is a **full-stack educational web game** designed to teach programming fundamentals to children through KTurtle-inspired gameplay. Each technology was carefully selected to balance **simplicity, maintainability, educational value, and scalability**.

---

## 🔧 Technology Stack

### Backend
| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | FastAPI | 0.104.1 |
| ORM | SQLAlchemy | 2.0.23 |
| Database | SQLite  or Postgrest| (with aiosqlite) |
| Authentication | fastapi-users | 15.0.3 |
| JWT | python-jose | latest |
| Password Hashing | passlib | latest |
| Environment | python-dotenv | latest |

### Frontend
| Component | Technology | Version |
|-----------|-----------|---------|
| Framework | React | 18.2.0 |
| Routing | React Router | 6.20.0 |
| HTTP Client | Fetch API | (native) |
| Graphics | Canvas API | (native) |
| Audio | Web Audio API | (native) |
| Storage | localStorage | (native) |
| Styling | CSS3 | (native) |
| Build Tool | Create React App | latest |

------

## 🌐 Frontend Technologies

### ⚛️ React (React 18)

**Role:** Frontend framework
**Purpose:**

* Builds the interactive user interface of the game
* Manages pages such as Login, Register, Home, Game, and Certificate
* Handles state changes (current level, user input, progress)

**Why React?**

* Component-based structure makes the UI modular and reusable
* Large ecosystem and strong community support
* Ideal for interactive applications like games
* Easy to reason about state changes, which is important for game logic

---

### 🧭 React Router

**Role:** Client-side routing
**Purpose:**

* Enables navigation between pages without reloading the browser
* Manages routes like `/login`, `/register`, `/home`, `/game/:level`, `/certificate`

**Why it matters:**

* Creates a smooth, app-like experience
* Keeps navigation logic clean and declarative

---

### 🎨 HTML5 Canvas API

**Role:** Graphics rendering engine
**Purpose:**

* Draws the turtle
* Draws lines when the turtle moves forward
* Handles rotation when turning left or right

**Why Canvas?**

* Perfect match for turtle graphics (Logo / KTurtle style)
* Low-level enough to teach concepts like coordinates and direction
* Lightweight and runs directly in the browser (no extra libraries)

---

### 🎧 Web Audio API

**Role:** Sound feedback
**Purpose:**

* Plays positive sounds on correct actions
* Plays soft error sounds on incorrect input

**Educational value:**

* Immediate feedback reinforces learning
* Keeps children engaged without distractions

---

### 🎨 CSS3

**Role:** Styling and layout
**Purpose:**

* Defines child-friendly UI (colors, spacing, fonts)
* Creates the split-screen layout (code on left, canvas on right)
* Styles level grid (5×5), buttons, modals, and trophy view

**Why plain CSS?**

* No abstraction barriers for beginners
* Easy to customize and understand
* Keeps the project lightweight

---

### 🧠 Browser APIs (Keyboard, LocalStorage)

**Role:** Native browser functionality
**Purpose:**

* Captures keyboard input (Space, Arrow keys)
* Stores authentication tokens and user session data

**Why native APIs?**

* Reduces dependencies
* Makes the learning experience more transparent

---

## 🖥️ Backend Technologies

### 🚀 FastAPI

**Role:** Backend web framework
**Purpose:**

* Exposes REST APIs used by the frontend
* Manages authentication, levels, progress, and certificates

**Why FastAPI?**

* Extremely fast and modern
* Automatic API documentation (Swagger)
* Strong typing encourages clean API contracts
* Excellent for educational and production use

---

### 🗄️ SQLAlchemy (Async)

**Role:** ORM (Object Relational Mapper)
**Purpose:**

* Defines database models (User, Progress, Certificate)
* Handles database queries in Pythonic way

**Why SQLAlchemy?**

* Abstracts raw SQL while remaining powerful
* Encourages good data modeling practices
* Async support improves performance

---

### 🐘 SQLite (with aiosqlite)

**Role:** Database
**Purpose:**

* Stores users, progress, and certificates

**Why SQLite?**

* Zero configuration
* Ideal for learning and small deployments
* Easy to replace with PostgreSQL in production

---

### 🔐 JWT (JSON Web Tokens)

**Role:** Authentication mechanism
**Purpose:**

* Secures API endpoints
* Identifies users across requests

**Why JWT?**

* Stateless and scalable
* Widely used industry standard
* Simple to understand for learners

---

### 🔑 OAuth (Google / Facebook)

**Role:** Optional authentication provider
**Purpose:**

* Allows users to log in using external accounts

**Why OAuth?**

* Demonstrates real-world authentication patterns
* Improves user experience

---

## 🤖 AI & Development Tools

### 🧠 ChatGPT (GPT-4.1)

**Role:** Large Language Model (LLM)
**Purpose:**

* Assists in frontend and backend code generation
* Helps design game logic and architecture
* Generates documentation and prompts

**Why GPT-4.1?**

* Strong reasoning and code generation
* Consistent output when guided with instructions
* Excellent for structured, multi-file projects

---

### 🧩 MCP (Model Context Protocol)

**Role:** AI integration protocol
**Purpose:**

* Allows AI models to interact with project context
* Connects tools like GitHub, VS Code, and documentation

**Benefits:**

* Keeps AI output aligned with project structure
* Reduces hallucinations
* Enables multi-agent collaboration

---

### 🧠 AGENTS.md

**Role:** AI behavior specification
**Purpose:**

* Defines responsibilities for each AI “agent” (UI, game logic, canvas, API, etc.)
* Ensures consistent and predictable code generation

**Why it matters:**

* Turns AI into a reliable team member
* Prevents overengineering
* Aligns output with educational goals

---

### 📜 copilot-instruction.md

**Role:** LLM instruction file
**Purpose:**

* Sets coding standards, tone, and constraints
* Guides AI toward beginner-friendly code

---

### 🧑‍💻 VS Code

**Role:** Development environment
**Purpose:**

* Main IDE for frontend and backend development
* Hosts AI integrations and extensions

**Why VS Code?**

* Industry standard
* Excellent AI tooling support
* Strong debugging and extension ecosystem

---

### 🔌 Context7, Microsoft Playground, GitHub MCP

**Role:** AI-assisted development tools
**Purpose:**

* Provide live project context to the LLM
* Enable repository-aware code generation
* Improve accuracy and consistency

---

## 🐳 Deployment & Infrastructure

### 🐳 Docker

**Role:** Containerization
**Purpose:**

* Packages frontend and backend consistently
* Simplifies deployment and onboarding

---

### 🧩 Docker Compose

**Role:** Multi-container orchestration
**Purpose:**

* Runs frontend, backend, and database together
* One-command startup for the full system

---

## 🎯 Summary

Each technology in this project was chosen to:

* Support **learning and clarity**
* Encourage **good software architecture**
* Remain **approachable for beginners**
* Scale toward real-world applications


