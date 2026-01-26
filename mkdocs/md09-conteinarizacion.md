# Docker Deployment Guide

## Overview

This guide explains how to deploy the Toxic Turtle application using Docker and Docker Compose.

## Files Added/Modified

### New Files
- **docker-compose.yaml** - Complete Docker Compose configuration for full stack deployment
- **.env.example** - Environment variables template for Docker configuration

### Modified Files
- **INDEX.md** - Updated to reference Docker files and deployment
- **INTEGRATION_GUIDE.md** - Added comprehensive Docker section
- **PROJECT_SUMMARY.md** - Updated with Docker deployment options
- **QUICK_START.md** - Added Docker setup option (Option B)
- **Dockerfiles** - Backend and Frontend Dockerfiles already in place

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

## Architecture

### Docker Compose Services


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
frontend (Node 18-alpine + React)
    ↓ (HTTP: port 3000)
    
backend (Python 3.12-alpine + FastAPI)
    ↓ (HTTP: port 8000)
    
postgres (PostgreSQL 16-alpine)
    ↓ (TCP: port 5432)
```

### Network
- All services connected via `toxic-turtle-network` bridge network
- Services communicate using service names (not localhost)

### Volumes
- PostgreSQL data persisted in `postgres_data` volume

## Environment Configuration

Key environment variables in `.env`:

```env
# Database
DB_USER=postgres
DB_PASSWORD=your-password
DB_NAME=toxic_turtle
DB_PORT=5432

# Backend
BACKEND_PORT=8000
SECRET_KEY=your-secret-key
API_TITLE=Toxic Turtle API
API_VERSION=0.1.0

# Frontend
FRONTEND_PORT=3000
REACT_APP_DEBUG=false
```

## Common Docker Commands

```bash
# Start services in background
docker-compose up -d

# View running services
docker-compose ps

# View logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Stop services
docker-compose stop

# Stop and remove containers
docker-compose down

# Remove everything including volumes
docker-compose down -v

# Rebuild images
docker-compose build

# Force rebuild without cache
docker-compose build --no-cache

# Access backend shell
docker exec -it toxic-turtle-backend sh

# Access frontend shell
docker exec -it toxic-turtle-frontend sh

# Run backend tests
docker exec toxic-turtle-backend pytest test/ -v
```

## Production Deployment

### Environment Setup
1. Create `.env` with production values
2. Use strong passwords for database
3. Generate new SECRET_KEY for backend
4. Set `BACKEND_DEBUG=False`
5. Set `REACT_APP_DEBUG=false`

### Building Production Images

```bash
docker-compose build --no-cache
docker-compose up -d
```

### Deployment to Cloud Platforms

#### AWS ECS
```bash
# Push images to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com
docker tag toxic-turtle-backend <account>.dkr.ecr.us-east-1.amazonaws.com/toxic-turtle-backend:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/toxic-turtle-backend:latest
```

#### Heroku
```bash
heroku container:login
heroku container:push web
heroku container:release web
```

#### DigitalOcean App Platform
1. Connect GitHub repository
2. Select docker-compose.yaml
3. Configure environment variables
4. Deploy

#### Docker Swarm
```bash
docker swarm init
docker stack deploy -c docker-compose.yaml toxic-turtle
```

#### Kubernetes
```bash
# Convert docker-compose to Kubernetes manifests
kompose convert -f docker-compose.yaml -o k8s/

# Deploy
kubectl apply -f k8s/
```

## Troubleshooting

### Ports Already in Use
Edit `.env`:
```env
BACKEND_PORT=8001
FRONTEND_PORT=3001
```

### Services Won't Start
```bash
# Check logs for errors
docker-compose logs

# Rebuild from scratch
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Cannot Connect to Backend
```bash
# Verify services running
docker-compose ps

# Check backend logs
docker-compose logs backend

# Wait 30 seconds (services need initialization time)
sleep 30
curl http://localhost:8000/docs
```

### Database Connection Issues
```bash
# Reset database
docker-compose down -v
docker-compose up -d

# Wait for database to initialize
sleep 10
```

### Frontend Cannot Reach Backend
- In Docker: Backend URL is `http://backend:8000`
- In local dev: Backend URL is `http://localhost:8000`
- Check `docker-compose.yaml` REACT_APP_API_URL setting

## Performance Tips

1. Use Alpine Linux images (smaller, faster)
2. Multi-stage builds for frontend
3. Bind mount only necessary directories
4. Use named volumes for data persistence
5. Configure resource limits in docker-compose.yaml

## Security Best Practices

1. Never commit `.env` with real values
2. Use strong passwords (min 32 characters for SECRET_KEY)
3. Change default database password
4. Enable HTTPS in production
5. Use secrets management (Docker Secrets, AWS Secrets Manager, etc.)
6. Keep images updated
7. Scan images for vulnerabilities

## Monitoring

```bash
# Monitor resource usage
docker stats

# View container inspect details
docker inspect toxic-turtle-backend

# Check logs with timestamps
docker-compose logs --timestamps

# Follow logs in real-time
docker-compose logs -f --tail=100
```

## Backup and Restore

### Backup Database
```bash
docker exec toxic-turtle-postgres pg_dump -U postgres toxic_turtle > backup.sql
```

### Restore Database
```bash
docker exec -i toxic-turtle-postgres psql -U postgres toxic_turtle < backup.sql
```

## References

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [FastAPI Docker](https://fastapi.tiangolo.com/deployment/docker/)
- [Node.js Docker Best Practices](https://nodejs.org/en/docs/guides/nodejs-docker-webapp/)
- [PostgreSQL Docker](https://hub.docker.com/_/postgres)

