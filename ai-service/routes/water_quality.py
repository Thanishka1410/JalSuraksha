from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional

router = APIRouter(prefix="/api/v1/ai")


class WaterQualityParams(BaseModel):
    pH: float = Field(..., description="pH level (6.5-8.5)")
    TDS: float = Field(..., description="Total Dissolved Solids in mg/L")
    turbidity: float = Field(..., description="Turbidity in NTU")
    chlorine: float = Field(..., description="Free chlorine in mg/L")
    fluoride: float = Field(..., description="Fluoride in mg/L")
    iron: float = Field(..., description="Iron in mg/L")
    nitrate: float = Field(..., description="Nitrate in mg/L")
    coliform: float = Field(..., description="Coliform count in MPN/100ml")

    class Config:
        json_schema_extra = {
            "example": {
                "pH": 7.2,
                "TDS": 250,
                "turbidity": 0.5,
                "chlorine": 0.5,
                "fluoride": 0.4,
                "iron": 0.1,
                "nitrate": 20,
                "coliform": 0
            }
        }


class WaterQualityResponse(BaseModel):
    overall_status: str
    parameter_status: Dict[str, Any]
    anomalies: List[str]
    recommendations: List[str]
    severity_score: float
    contamination_trend: str


class TrendRequest(BaseModel):
    history: List[Dict[str, Any]] = Field(..., description="List of historical water quality readings")

    class Config:
        json_schema_extra = {
            "example": {
                "history": [
                    {"pH": 7.0, "TDS": 220, "turbidity": 0.3, "chlorine": 0.5, "fluoride": 0.4, "iron": 0.1, "nitrate": 18, "coliform": 0},
                    {"pH": 7.1, "TDS": 235, "turbidity": 0.4, "chlorine": 0.45, "fluoride": 0.42, "iron": 0.12, "nitrate": 19, "coliform": 0},
                    {"pH": 7.0, "TDS": 240, "turbidity": 0.5, "chlorine": 0.4, "fluoride": 0.45, "iron": 0.15, "nitrate": 21, "coliform": 0}
                ]
            }
        }


class TrendResponse(BaseModel):
    trend: str
    rising_contamination: bool
    unsafe_readings: int
    total_readings: int
    abnormal_values: List[str]
    recommendations: List[str]
    data_points: int
    analysis_period: str


@router.post("/quality-analyze", response_model=WaterQualityResponse)
async def analyze_water_quality(request: WaterQualityParams):
    from services.model_service import model_service
    
    try:
        params = {
            "pH": request.pH,
            "TDS": request.TDS,
            "turbidity": request.turbidity,
            "chlorine": request.chlorine,
            "fluoride": request.fluoride,
            "iron": request.iron,
            "nitrate": request.nitrate,
            "coliform": request.coliform
        }
        
        result = model_service.analyze_water_quality(params)
        
        return WaterQualityResponse(
            overall_status=result["overall_status"],
            parameter_status=result["parameter_status"],
            anomalies=result["anomalies"],
            recommendations=result["recommendations"],
            severity_score=result["severity_score"],
            contamination_trend=result["contamination_trend"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")


@router.post("/quality-trend", response_model=TrendResponse)
async def analyze_quality_trend(request: TrendRequest):
    from services.model_service import model_service
    
    try:
        result = model_service.analyze_quality_trend(request.history)
        
        return TrendResponse(
            trend=result["trend"],
            rising_contamination=result["rising_contamination"],
            unsafe_readings=result["unsafe_readings"],
            total_readings=result["total_readings"],
            abnormal_values=result["abnormal_values"],
            recommendations=result["recommendations"],
            data_points=result["data_points"],
            analysis_period=result["analysis_period"]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Trend analysis failed: {str(e)}")


@router.get("/quality-thresholds")
async def get_quality_thresholds():
    from services.model_service import model_service
    
    try:
        thresholds = model_service.get_quality_thresholds()
        return {
            "status": "success",
            "thresholds": thresholds
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get thresholds: {str(e)}")
