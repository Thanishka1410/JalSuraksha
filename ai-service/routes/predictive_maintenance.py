from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any

router = APIRouter(prefix="/api/v1/ai")


class MaintenancePredictionRequest(BaseModel):
    running_hours: float = Field(..., description="Total running hours of pump")
    voltage: float = Field(..., description="Supply voltage in volts")
    temperature: float = Field(..., description="Operating temperature in Celsius")
    power_consumption: float = Field(..., description="Power consumption in kW")
    vibration: float = Field(..., description="Vibration level in mm/s")
    oil_level: float = Field(..., description="Oil level percentage")
    last_maintenance_days: float = Field(..., description="Days since last maintenance")

    class Config:
        json_schema_extra = {
            "example": {
                "running_hours": 8500,
                "voltage": 230,
                "temperature": 65,
                "power_consumption": 5.5,
                "vibration": 2.5,
                "oil_level": 60,
                "last_maintenance_days": 120
            }
        }


class MaintenancePredictionResponse(BaseModel):
    health_score: float
    failure_risk: str
    risk_probability: float
    maintenance_recommendation: str
    estimated_days_to_failure: int
    urgent: bool


class TrainRequest(BaseModel):
    use_sample_data: bool = Field(default=True, description="Use generated sample data for training")
    n_samples: int = Field(default=1000, ge=100, le=10000, description="Number of samples for training")


@router.post("/maintenance-predict", response_model=MaintenancePredictionResponse)
async def predict_maintenance(request: MaintenancePredictionRequest):
    from services.model_service import model_service
    
    try:
        features = {
            "running_hours": request.running_hours,
            "voltage": request.voltage,
            "temperature": request.temperature,
            "power_consumption": request.power_consumption,
            "vibration": request.vibration,
            "oil_level": request.oil_level,
            "last_maintenance_days": request.last_maintenance_days
        }
        
        result = model_service.predict_maintenance(features)
        
        return MaintenancePredictionResponse(
            health_score=result["health_score"],
            failure_risk=result["failure_risk"],
            risk_probability=result["risk_probability"],
            maintenance_recommendation=result["maintenance_recommendation"],
            estimated_days_to_failure=result["estimated_days_to_failure"],
            urgent=result["urgent"]
        )
    except ValueError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


@router.post("/maintenance-train")
async def train_maintenance_model(request: TrainRequest):
    from services.model_service import model_service
    
    try:
        if request.use_sample_data:
            model = model_service.maintenance_model
            df = model.generate_training_data(request.n_samples)
            X = df.drop(["health_score", "failure_risk"], axis=1)
            y_health = df["health_score"]
            y_risk = df["failure_risk"]
            metrics = model.train(X, y_health, X, y_risk)
        else:
            raise HTTPException(status_code=400, detail="Custom data training not implemented. Use sample data.")
        
        return {
            "status": "success",
            "message": "Predictive maintenance models trained successfully",
            "metrics": metrics
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Training failed: {str(e)}")


@router.get("/maintenance-model-info")
async def get_maintenance_model_info():
    from services.model_service import model_service
    
    try:
        info = model_service.maintenance_model.get_model_info()
        return {
            "status": "success",
            "model_info": info
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get model info: {str(e)}")
