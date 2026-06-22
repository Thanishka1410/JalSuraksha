import os
from typing import Dict, Any, Optional
import joblib
from models.leak_detection import LeakDetectionModel
from models.predictive_maintenance import PredictiveMaintenanceModel
from models.water_quality import WaterQualityAnalyzer


class ModelService:
    _instance: Optional["ModelService"] = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        
        self.model_dir = os.getenv("MODEL_DIR", "./saved_models")
        os.makedirs(self.model_dir, exist_ok=True)
        
        self.leak_model = LeakDetectionModel(self.model_dir)
        self.maintenance_model = PredictiveMaintenanceModel(self.model_dir)
        self.quality_model = WaterQualityAnalyzer(self.model_dir)
        
        self._load_models()
        self._initialized = True

    def _load_models(self):
        try:
            self.leak_model.load()
        except Exception as e:
            print(f"Warning: Could not load leak detection model: {e}")
        
        try:
            self.maintenance_model.load()
        except Exception as e:
            print(f"Warning: Could not load maintenance model: {e}")
        
        try:
            self.quality_model.load()
        except Exception as e:
            print(f"Warning: Could not load water quality model: {e}")

    def predict_leak(self, features: Dict[str, float]) -> Dict[str, Any]:
        if self.leak_model.model is None:
            raise ValueError("Leak detection model not loaded. Please train the model first.")
        return self.leak_model.predict(features)

    def train_leak_model(self, X, y) -> Dict[str, Any]:
        return self.leak_model.train(X, y)

    def predict_maintenance(self, features: Dict[str, float]) -> Dict[str, Any]:
        if self.maintenance_model.health_model is None or self.maintenance_model.risk_model is None:
            raise ValueError("Maintenance models not loaded. Please train the models first.")
        return self.maintenance_model.predict(features)

    def train_maintenance_model(self, X_health, y_health, X_risk, y_risk) -> Dict[str, Any]:
        return self.maintenance_model.train(X_health, y_health, X_risk, y_risk)

    def analyze_water_quality(self, params: Dict[str, float]) -> Dict[str, Any]:
        return self.quality_model.analyze(params)

    def analyze_quality_trend(self, history) -> Dict[str, Any]:
        return self.quality_model.analyze_trend(history)

    def get_quality_thresholds(self) -> Dict[str, Any]:
        return self.quality_model.get_thresholds()

    def get_all_model_info(self) -> Dict[str, Any]:
        return {
            "leak_detection": self.leak_model.get_model_info(),
            "predictive_maintenance": self.maintenance_model.get_model_info(),
            "water_quality": self.quality_model.get_model_info()
        }

    def save_model(self, model: Any, path: str) -> bool:
        try:
            os.makedirs(os.path.dirname(path), exist_ok=True)
            joblib.dump(model, path)
            return True
        except Exception as e:
            print(f"Error saving model: {e}")
            return False

    def load_model(self, path: str) -> Any:
        try:
            if os.path.exists(path):
                return joblib.load(path)
        except Exception as e:
            print(f"Error loading model: {e}")
        return None


model_service = ModelService()
