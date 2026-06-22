import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os
from typing import Dict, Any, Optional


class LeakDetectionModel:
    def __init__(self, model_dir: str = "./saved_models"):
        self.model_dir = model_dir
        self.model: Optional[RandomForestClassifier] = None
        self.model_path = os.path.join(model_dir, "leak_detection_model.pkl")
        self.features = ["flow_rate", "pressure", "water_consumption", "flow_pressure_ratio", "consumption_per_hour"]
        self.accuracy: Optional[float] = None
        self.feature_importances: Optional[Dict[str, float]] = None

    def generate_training_data(self, n_samples: int = 1000) -> pd.DataFrame:
        np.random.seed(42)
        
        flow_rate = np.random.uniform(0.5, 15.0, n_samples)
        pressure = np.random.uniform(10, 80, n_samples)
        water_consumption = np.random.uniform(5, 500, n_samples)
        flow_pressure_ratio = flow_rate / (pressure + 1e-6)
        consumption_per_hour = water_consumption / np.random.uniform(1, 24, n_samples)
        
        leak_probability = (
            0.3 * (flow_rate > 12).astype(float) +
            0.25 * (pressure < 25).astype(float) +
            0.2 * (water_consumption > 350).astype(float) +
            0.15 * (flow_pressure_ratio > 0.5).astype(float) +
            0.1 * (consumption_per_hour > 25).astype(float) +
            np.random.uniform(0, 0.15, n_samples)
        )
        
        leak_detected = (leak_probability > 0.45).astype(int)
        
        df = pd.DataFrame({
            "flow_rate": flow_rate,
            "pressure": pressure,
            "water_consumption": water_consumption,
            "flow_pressure_ratio": flow_pressure_ratio,
            "consumption_per_hour": consumption_per_hour,
            "leak_detected": leak_detected
        })
        
        return df

    def train(self, X: pd.DataFrame, y: pd.Series) -> Dict[str, Any]:
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
        
        self.model = RandomForestClassifier(
            n_estimators=100,
            max_depth=10,
            min_samples_split=5,
            min_samples_leaf=2,
            random_state=42,
            n_jobs=-1
        )
        
        self.model.fit(X_train, y_train)
        
        y_pred = self.model.predict(X_test)
        self.accuracy = accuracy_score(y_test, y_pred)
        
        self.feature_importances = dict(zip(self.features, self.model.feature_importances_))
        
        self.save()
        
        report = classification_report(y_test, y_pred, output_dict=True)
        
        return {
            "accuracy": self.accuracy,
            "train_size": len(X_train),
            "test_size": len(X_test),
            "feature_importances": self.feature_importances,
            "classification_report": report
        }

    def predict(self, features: Dict[str, float]) -> Dict[str, Any]:
        if self.model is None:
            self.load()
        
        if self.model is None:
            raise ValueError("Model not trained. Please train the model first.")
        
        input_data = pd.DataFrame([{
            "flow_rate": features["flow_rate"],
            "pressure": features["pressure"],
            "water_consumption": features["water_consumption"],
            "flow_pressure_ratio": features["flow_rate"] / (features["pressure"] + 1e-6),
            "consumption_per_hour": features["water_consumption"] / max(features.get("hours", 1), 0.1)
        }])
        
        prediction = self.model.predict(input_data)[0]
        probability = self.model.predict_proba(input_data)[0]
        
        leak_prob = float(probability[1])
        confidence = float(max(probability))
        
        return {
            "leak_detected": bool(prediction),
            "probability": round(leak_prob, 4),
            "confidence": round(confidence, 4),
            "risk_level": self._get_risk_level(leak_prob)
        }

    def _get_risk_level(self, probability: float) -> str:
        if probability < 0.2:
            return "low"
        elif probability < 0.4:
            return "medium"
        elif probability < 0.6:
            return "high"
        else:
            return "critical"

    def save(self):
        os.makedirs(self.model_dir, exist_ok=True)
        model_data = {
            "model": self.model,
            "accuracy": self.accuracy,
            "feature_importances": self.feature_importances,
            "features": self.features
        }
        joblib.dump(model_data, self.model_path)

    def load(self) -> bool:
        if os.path.exists(self.model_path):
            model_data = joblib.load(self.model_path)
            self.model = model_data["model"]
            self.accuracy = model_data["accuracy"]
            self.feature_importances = model_data["feature_importances"]
            self.features = model_data["features"]
            return True
        return False

    def get_model_info(self) -> Dict[str, Any]:
        return {
            "model_type": "RandomForestClassifier",
            "features": self.features,
            "accuracy": self.accuracy,
            "feature_importances": self.feature_importances,
            "is_loaded": self.model is not None,
            "model_path": self.model_path
        }
