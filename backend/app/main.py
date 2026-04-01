from fastapi import FastAPI, Header, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Import routers
from app.routers import auth, trains, hotels, packages, places, budget, weather
from app.database import create_tables, Base, engine


# Create tables on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    create_tables()
    print("Database tables created successfully")
    yield
    # Shutdown
    print("Application shutting down")


# Initialize FastAPI app
app = FastAPI(
    title="TravelHarbor Hub API",
    description="A comprehensive travel booking backend API",
    version="1.0.0",
    lifespan=lifespan,
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "*",
    ],  # Allow frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

static_dir = os.path.join(os.path.dirname(__file__), "..", "static")
os.makedirs(static_dir, exist_ok=True)
app.mount("/static", StaticFiles(directory=static_dir), name="static")


# Include routers
app.include_router(auth.router)
app.include_router(trains.router)
app.include_router(hotels.router)
app.include_router(packages.router)
app.include_router(places.router)
app.include_router(budget.router)
app.include_router(weather.router)


# Root endpoint
@app.get("/")
def read_root():
    """Welcome to TravelHarbor Hub API"""
    return {
        "message": "Welcome to TravelHarbor Hub API",
        "version": "1.0.0",
        "docs": "/docs",
        "redoc": "/redoc",
    }


# Health check endpoint
@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn

    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))

    uvicorn.run("app.main:app", host=host, port=port, reload=True)
