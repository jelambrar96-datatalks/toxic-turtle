# 14. Reproducitibilty

## Quick Start with Docker

```bash
# 1. Navigate to project root
cd toxic-turtle

# 2. Create environment file
cp .env.example .env

# 3. Start all services
docker-compose up -d

# 4. Access application
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# API Docs: http://localhost:8000/docs
```


## Running without docker 

```bash
# Terminal 1: Backend
cd backend
cp ../.env.example .env
pip install -r requirements.txt
python -m uvicorn src.app:app --reload

# Terminal 2: Frontend
cd frontend
cp ../.env.example .env
npm install
npm start
```
