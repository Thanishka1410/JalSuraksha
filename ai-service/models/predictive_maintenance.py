import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, accuracy_score, r2_score
import joblib
import os
from typing import Dict, Any, Optional


class PredictiveMaintenanceModel:
    def __init__(self, model_dir: str = "./saved_models"):
        self.model_dir = model_dir
        self.health_model: Optional[RandomForestRegressor] = None
        self.risk_model: Optional[RandomForestClassifier] = None
        self.health_model_path = os.path.join(model_dir, "maintenance_health_model.pkl")
        self.risk_model_path = os.path.join(model_dir, "maintenance_risk_model.pkl")
        self.features = [
            "running_hours", "voltage", "temperature", "power_consumption",
            "vibration", "oil_level", "last_maintenance_days"
        ]
        self.health_accuracy: Optional[float] = None
        self.risk_accuracy: Optional[float] = None
        self.feature_importances: Optional[Dict[str, float]] = None

    def generate_training_data(self, n_samples: int = 1000) -> pd.DataFrame:
        np.random.seed(42)
        
        running_hours = np.random.uniform(100, 15000, n_samples)
        voltage = np.random.uniform(200, 250, n_samples)
        temperature = np.random.uniform(20, 90, n_samples)
        power_consumption = np.random.uniform(0.5, 10, n_samples)
        vibration = np.random.uniform(0.1, 5, n_samples)
        oil_level = np.random.uniform(10, 100, n_samples)
        last_maintenance_days = np.random.uniform(1, 365, n_samples)
        
        health_score = (
            100 
            - 0.003 * running_hours
            - 0.1 * (temperature - 40).clip(0)
            - 5 * (vibration - 1).clip(0)
            - 0.05 * last_maintenance_days
            + 0.1 * oil_level
            + np.random.normal(0, 5, n_samples)
        )
        health_score = np.clip(health_score, 0, 100)
        
        failure_prob = (
            0.3 * (running_hours > 10000).astype(float) +
            0.25 * (temperature > 70).astype(float) +
            0.2 * (vibration > 3).astype(float) +
            0.15 * (last_maintenance_days > 180).astype(float) +
            0.1 * (oil_level < 30).astype(float) +
            np.random.uniform(0, 0.15, n_samples)
        )
        
        failure_risk = np.where(failure_prob < 0.3, 0,
                       np.where(failure_prob < 0.5, 1,
                       np.where(failure_prob < 0.7, 2, 3)))
        
        df = pd.DataFrame({
            "running_hours": running_hours,
            "voltage": voltage,
            "temperature": temperature,
            "power_consumption": power_consumption,
            "vibration": vibration,
            "oil_level": oil_level,
            "last_maintenance_days": last_maintenance_days,
            "health_score": health_score,
            "failure_risk": failure_risk
        })
        
        return df

    def train(self, X_health: pd.DataFrame, y_health: pd.Series, 
              X_risk: pd.DataFrame, y_risk: pd.Series) -> Dict[str, Any]:
        X_h_train, X_h_test, y_h_train, y_h_test = train_test_split(
            X_health, y_health, test_size=0.2, random_state=42
        )
        
        self.health_model = RandomForestRegressor(
            n_estimators=100,
            max_depth=12,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )
        self.health_model.fit(X_h_train, y_h_train)
        
        y_h_pred = self.health_model.predict(X_h_test)
        self.health_accuracy = r2_score(y_h_test, y_h_pred)
        health_mse = mean_squared_error(y_h_test, y_h_pred)
        
        X_r_train, X_r_test, y_r_train, y_r_test = train_test_split(
            X_risk, y_risk, test_size=0.2, random_state=42, stratify=y_risk
        )
        
        self.risk_model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )
        self.risk_model.fit(X_r_train, y_r_train)
        
        y_r_pred = self.risk_model.predict(X_r_test)
        self.risk_accuracy = accuracy_score(y_r_test, y_r_pred)
        
        self.feature_importances = dict(zip(self.features, self.health_model.feature_importances_))
        
        self.save()
        
        return {
            "health_model_r2": self.health_accuracy,
            "health_model_mse": health_mse,
            "risk_model_accuracy": self.risk_accuracy,
            "feature_importances": self.feature_importances,
            "train_size": len(X_h_train),
            "test_size": len(X_h_test)
        }

    def predict(self, features: Dict[str, float]) -> Dict[str, Any]:
        if self.health_model is None or self.risk_model is None:
            self.load()
        
        if self.health_model is None or self.risk_model is None:
            raise ValueError("Models not trained. Please train the models first.")
        
        input_data = pd.DataFrame([{
            "running_hours": features["running_hours"],
            "voltage": features["voltage"],
            "temperature": features["temperature"],
            "power_consumption": features["power_consumption"],
            "vibration": features["vibration"],
            "oil_level": features["oil_level"],
            "last_maintenance_days": features["last_maintenance_days"]
        }])
        
        health_score = float(self.health_model.predict(input_data)[0])
        health_score = max(0, min(100, health_score))
        
        risk_pred = int(self.risk_model.predict(input_data)[0])
        risk_proba = self.risk_model.predict_proba(input_data)[0]
        
        risk_levels = {0: "low", 1: "medium", 2: "high", 3: "critical"}
        failure_risk = risk_levels.get(risk_pred, "unknown")
        
        recommendation = self._get_recommendation(health_score, failure_risk, features)
        estimated_days = self._estimate_days_to_failure(features, health_score)
        
        return {
            "health_score": round(health_score, 2),
            "failure_risk": failure_risk,
            "risk_probability": round(float(max(risk_proba)), 4),
            "maintenance_recommendation": recommendation,
            "estimated_days_to_failure": estimated_days,
            "urgent": failure_risk in ["high", "critical"]
        }

    def _get_recommendation(self, health_score: float, risk_level: str, features: Dict) -> str:
        if health_score < 30 or risk_level == "critical":
            return "Immediate maintenance required. Shut down pump and schedule emergency repair."
        elif health_score < 50 or risk_level == "high":
            return "Schedule maintenance within 1-2 days. Check oil level and vibration."
        elif health_score < 70 or risk_level == "medium":
            return "Schedule routine maintenance within 1 week. Monitor performance closely."
        elif features.get("last_maintenance_days", 0) > 180:
            return "Preventive maintenance recommended. Last service was over 6 months ago."
        else:
            return "Pump is operating normally. Continue regular monitoring."

    def _estimate_days_to_failure(self, features: Dict, health_score: float) -> int:
        base_days = int(health_score * 10)
        
        if features.get("vibration", 0) > 3:
            base_days = int(base_days * 0.5)
        if features.get("temperature", 0) > 70:
            base_days = int(base_days * 0.7)
        if features.get("running_hours", 0) > 10000:
            base_days = int(base_days * 0.6)
        
        return max(1, base_days)

    def save(self):
        os.makedirs(self.model_dir, exist_ok=True)
        
        health_data = {
            "model": self.health_model,
            "accuracy": self.health_accuracy,
            "features": self.features,
            "feature_importances": self.feature_importances
        }
        joblib.dump(health_data, self.health_model_path)
        
        risk_data = {
            "model": self.risk_model,
            "accuracy": self.risk_accuracy,
            "features": self.features
        }
        joblib.dump(risk_data, self.risk_model_path)

    def load(self) -> bool:
        try:
            if os.path.exists(self.health_model_path) and os.path.exists(self.risk_model_path):
                health_data = joblib.load(self.health_model_path)
                self.health_model = health_data["model"]
                self.health_accuracy = health_data["accuracy"]
                self.feature_importances = health_data.get("feature_importances")
                self.features = health_data["features"]
                
                risk_data = joblib.load(self.risk_model_path)
                self.risk_model = risk_data["model"]
                self.risk_accuracy = risk_data["accuracy"]
                return True
        except Exception as e:
            print(f"Error loading models: {e}")
        return False

    def get_model_info(self) -> Dict[str, Any]:
        return {
            "health_model_type": "RandomForestRegressor",
            "risk_model_type": "RandomForestClassifier",
            "features": self.features,
            "health_model_r2": self.health_accuracy,
            "risk_model_accuracy": self.risk_accuracy,
            "feature_importances": self.feature_importances,
            "is_loaded": self.health_model is not None and self.risk_model is not None,
            "health_model_path": self.health_model_path,
            "risk_model_path": self.risk_model_path
        }
