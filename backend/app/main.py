from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .database.session import init_db
from .api.endpoints import router as api_router
from .api.auth import router as auth_router

# Initialize database tables and self-healing migrations
init_db()

app = FastAPI(
    title="AegisPulse AI API",
    description="Autonomous Attack Surface Intelligence & AI Threat Triage Engine",
    version="2.0.0"
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount API routes
app.include_router(auth_router, prefix="/api")
app.include_router(api_router, prefix="/api")

@app.get("/")
def root():
    return {
        "message": "AegisPulse AI SecOps Engine is running.",
        "documentation": "/docs",
        "api_prefix": "/api"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
