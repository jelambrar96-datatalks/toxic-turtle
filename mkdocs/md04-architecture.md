
# 4. 📊 Architecture Overview

This project follows a **modular, layered, full-stack architecture**, designed to be:

* ✅ Easy to understand
* ✅ Educationally sound
* ✅ Scalable
* ✅ Friendly for AI-assisted development

The architecture cleanly separates **presentation**, **game logic**, **backend services**, **data storage**, and **AI tooling**, ensuring that each concern is isolated and maintainable.

---

## 🧩 High-Level Architecture

```
┌───────────────────────────────────────┐
│              Frontend (Web)           │
│  React + Canvas + Keyboard Input      │
│                                       │
│  - Auth Pages                         │
│  - Home / Level Grid                  │
│  - Game Engine (KTurtle)              │
│  - Certificate UI                     │
└───────────────▲───────────────────────┘
                │ REST API (JSON)
┌───────────────┴───────────────────────┐
│               Backend API             │
│            FastAPI (Python)           │
│                                       │
│  - Auth & Users                       │
│  - Game Progress                      │
│  - Level Data                         │
│  - Certificate Logic                  │
└───────────────▲───────────────────────┘
                │ ORM
┌───────────────┴───────────────────────┐
│               Database                │
│           SQLite / PostgreSQL         │
│                                       │
│  - Users                              │
│  - Levels                             │
│  - Progress                           │
│  - Certificates                       │
└───────────────────────────────────────┘
```



## 🎯 Architectural Philosophy

This architecture is intentionally:

* **Educational-first**
* **Data-driven**
* **Deterministic**
* **AI-compatible**
* **Scalable**

It teaches:

* Programming logic
* Game design fundamentals
* Software architecture
* Modern development workflows

All while feeling like a **game**, not a lesson 🐢🎮

---

If you want, I can:

* Create an **architecture diagram**
* Write a **technical paper-style version**
* Adapt this for **academic submission**
* Simplify it for **children or parents**
* Map it to **Clean Architecture / Hexagonal**


## 🐳 Deployment Architecture

```
Docker Compose
├── frontend container
├── backend container
└── database container
```

Benefits:

* Reproducible setup
* Easy onboarding
* Classroom-friendly


```
┌─────────────────────────────────────────────────────┐
│           Docker Network: toxic-turtle-network      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────────┐         ┌──────────────────┐  │
│  │     Frontend     │         │    Backend API   │  │
│  │   Node:18-alpine │ <─────> │ Python:3.12-alpine  │
│  │   Port: 3000     │         │ Port: 8000       │  │
│  │ (React + Serve)  │         │ (FastAPI)        │  │
│  └──────────────────┘         └─────────┬────────┘  │
│                                         │           │
│                          ┌──────────────┘           │
│                          │                          │
│                  ┌───────▼─────────┐                │
│                  │   PostgreSQL    │                │
│                  │  Port: 5432     │                │
│                  │ (Alpine Linux)  │                │
│                  └─────────────────┘                │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## 🔌 API Communication

### Authentication Flow

```
User enters credentials in Frontend
  ↓
POST http://localhost:8000/auth/register
Body: {"username": "...", "email": "...", "password": "..."}
  ↓
Backend validates and hashes password
  ↓
Backend creates User record in SQLite
  ↓
Response: 201 Created + User data
  ↓
Frontend stores JWT token in localStorage
  ↓
Subsequent requests include:
Authorization: Bearer eyJ0eXAi...
```


```
┌─────────────────────────────────────────────────────────┐
│                     Web Browser                         │
│  http://localhost:3000                                  │
│  ┌────────────────────────────────────────────────────┐ │
│  │          React Frontend (SPA)                      │ │
│  │  - LoginPage / RegisterPage                        │ │
│  │  - HomePage (Level Grid)                           │ │
│  │  - GamePage (Canvas + Keyboard)                    │ │
│  │  - CertificatePage                                 │ │
│  └───────────────┬────────────────────────────────────┘ │
└──────────────────┼──────────────────────────────────────┘
                   │ HTTP Requests (JSON)
                   │ JWT Authorization
                   ▼
        ┌──────────────────────┐
        │   Backend API        │
        │ http://localhost:8000│
        │                      │
        │ FastAPI Server       │
        │ ┌──────────────────┐ │
        │ │ Auth Routes      │ │
        │ │ - register       │ │
        │ │ - login          │ │
        │ │ - me             │ │
        │ └──────────────────┘ │
        │                      │
        │ ┌──────────────────┐ │
        │ │ Game Routes      │ │
        │ │ - current_level  │ │
        │ │ - get_level_data │ │
        │ │ - pass_level     │ │
        │ │ - certificates   │ │
        │ └──────────────────┘ │
        │                      │
        │ ┌──────────────────┐ │
        │ │ Database         │ │
        │ │ SQLite + Async   │ │
        │ │ ┌──────────────┐ │ │
        │ │ │ Users        │ │ │
        │ │ │ Progress     │ │ │
        │ │ │ Certificates │ │ │
        │ │ └──────────────┘ │ │
        │ └──────────────────┘ │
        └──────────────────────┘
```



### Game Flow

```
Frontend requests level data
  ↓
GET http://localhost:8000/game/get_level_data?level=1
Headers: Authorization: Bearer eyJ0eXAi...
  ↓
Backend validates user and level access
  ↓
Response: 200 OK
Body: {
  "code": "forward 50\nright 90",
  "movements": ["space", "right"],
  "cursor": [0, 1],
  "can_play": true
}
  ↓
Frontend displays code and waits for input
  ↓
User presses Space (correct)
  ↓
Frontend updates turtle state
  ↓
All moves done?
  ↓
POST http://localhost:8000/game/pass_level
Headers: Authorization: Bearer eyJ0eXAi...
Body: {"level": 1}
  ↓
Backend records Progress entry
  ↓
Response: 201 Created + Progress data
```

