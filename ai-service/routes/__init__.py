from fastapi import APIRouter
from .leak_detection import router as leak_router
from .predictive_maintenance import router as maintenance_router
from .water_quality import router as quality_router
from .chat_assistant import router as chat_router

api_router = APIRouter()
api_router.include_router(leak_router, tags=["Leak Detection"])
api_router.include_router(maintenance_router, tags=["Predictive Maintenance"])
api_router.include_router(quality_router, tags=["Water Quality"])
api_router.include_router(chat_router, tags=["Chat Assistant"])
