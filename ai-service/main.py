import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from routes import api_router
from services.model_service import model_service

load_dotenv()

app = FastAPI(
    title="JalRakshak AI Service",
    description="AI microservice for rural water supply monitoring platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)


@app.get("/health")
async def health_check():
    model_status = model_service.get_all_model_info()
    return {
        "status": "healthy",
        "service": "jalrakshak-ai",
        "version": "1.0.0",
        "models_loaded": {
            "leak_detection": model_status["leak_detection"]["is_loaded"],
            "predictive_maintenance": model_status["predictive_maintenance"]["is_loaded"],
            "water_quality": model_status["water_quality"]["is_loaded"]
        }
    }


@app.get("/")
async def root():
    return {
        "service": "JalRakshak AI Service",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/health"
    }


if __name__ == "__main__":
    import uvicorn
    
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 8001))
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )
