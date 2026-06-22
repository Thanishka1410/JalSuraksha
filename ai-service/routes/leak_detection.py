from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any
import pandas as pd

router = APIRouter(prefix="/api/v1/ai")


class LeakDetectionRequest(BaseModel):
    flow_rate: float = Field(..., description="Water flow rate in liters per minute")
    pressure: float = Field(..., description="Water pressure in PSI")
    water_consumption: float = Field(..., description="Daily water consumption in liters")
    hours: float = Field(default=24.0, description="Hours of operation")

    class Config:
        json_schema_extra = {
            "example": {
                "flow_rate": 12.5,
                "pressure": 45.0,
                "water_consumption": 400.0,
                "hours": 24.0
            }
        }


class LeakDetectionResponse(BaseModel):
    leak_detected: bool
    probability: float
    confidence: float
    risk_level: str


class TrainRequest(BaseModel):
    use_sample_data: bool = Field(default=True, description="Use generated sample data for training")
    n_samples: int = Field(default=1000, ge=100, le=10000, description="Number of samples for training")


@router.post("/leak-detect", response_model=LeakDetectionResponse)
async def detect_leak(request: LeakDetectionRequest):
    from services.model_service import model_service
    
    try:
        features = {
            "flow_rate": request.flow_rate,
            "pressure": request.pressure,
            "water_consumption": request.water_consumption,
            "hours": request.hours
        }
        
        result = model_service.predict_leak(features)
        
        return LeakDetectionResponse(
            leak_detected=result["leak_detected"],
            probability=result["probability"],
            confidence=result["confidence"],
            risk_level=result["risk_level"]
        )
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.post("/leak-train")
async def train_leak_model(request: TrainRequest):
    from services.model_service import model_service
    
    try:
        if request.use_sample_data:
            model = model_service.leak_model
            df = model.generate_training_data(request.n_samples)
            X = df.drop("leak_detected", axis=1)
            y = df["leak_detected"]
            metrics = model.train(X, y)
        else:
            raise HTTPException(status_code=400, detail="Custom data training not implemented. Use sample data.")
        
        return {
            "status": "success",
            "message": "Leak detection model trained successfully",
            "metrics": metrics
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")


@router.get("/leak-model-info")
async def get_leak_model_info():
    from services.model_service import model_service
    
    try:
        info = model_service.leak_model.get_model_info()
        return {
            "status": "success",
            "model_info": info
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get model info: {str(e)}")
