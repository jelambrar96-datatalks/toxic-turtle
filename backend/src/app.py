"""Main FastAPI application."""

from contextlib import asynccontextmanager
from uuid import UUID

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware

from src.database import engine, create_db_and_tables
from src.config import settings
from src.routes.auth_routes import auth_routes
from src.routes.game_routes import router as game_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage application lifespan - create tables on startup."""
    # Startup: Create tables
    await create_db_and_tables()
    yield
    # Shutdown: Close engine
    await engine.dispose()


# Create FastAPI app
app = FastAPI(
    title=settings.API_TITLE,
    version=settings.API_VERSION,
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL, "http://localhost:8000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes)
app.include_router(game_router)


# Health check
@app.get("/health", tags=["health"])
async def health_check():
    """Health check endpoint."""
    return {"status": "ok", "app": settings.API_TITLE}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "src.app:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
    )
