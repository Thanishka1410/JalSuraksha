import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib
import os
from typing import Dict, Any, List, Optional


class WaterQualityAnalyzer:
    BIS_THRESHOLDS = {
        "pH": {"min": 6.5, "max": 8.5, "unit": "pH units"},
        "TDS": {"min": 0, "max": 500, "unit": "mg/L"},
        "turbidity": {"min": 0, "max": 1, "unit": "NTU"},
        "chlorine": {"min": 0.2, "max": 1.0, "unit": "mg/L"},
        "fluoride": {"min": 0, "max": 1.0, "unit": "mg/L"},
        "iron": {"min": 0, "max": 0.3, "unit": "mg/L"},
        "nitrate": {"min": 0, "max": 45, "unit": "mg/L"},
        "coliform": {"min": 0, "max": 0, "unit": "MPN/100ml"}
    }
    
    PARAMETER_WEIGHTS = {
        "pH": 0.15,
        "TDS": 0.12,
        "turbidity": 0.15,
        "chlorine": 0.15,
        "fluoride": 0.12,
        "iron": 0.12,
        "nitrate": 0.10,
        "coliform": 0.09
    }
    
    def __init__(self, model_dir: str = "./saved_models"):
        self.model_dir = model_dir
        self.anomaly_model: Optional[IsolationForest] = None
        self.scaler: Optional[StandardScaler] = None
        self.model_path = os.path.join(model_dir, "water_quality_anomaly_model.pkl")
        self.scaler_path = os.path.join(model_dir, "water_quality_scaler.pkl")
        self.parameters = list(self.BIS_THRESHOLDS.keys())

    def generate_normal_data(self, n_samples: int = 500) -> pd.DataFrame:
        np.random.seed(42)
        
        data = {
            "pH": np.random.normal(7.2, 0.3, n_samples),
            "TDS": np.random.normal(250, 50, n_samples),
            "turbidity": np.random.exponential(0.3, n_samples),
            "chlorine": np.random.normal(0.5, 0.15, n_samples),
            "fluoride": np.random.normal(0.4, 0.15, n_samples),
            "iron": np.random.exponential(0.1, n_samples),
            "nitrate": np.random.normal(20, 8, n_samples),
            "coliform": np.zeros(n_samples)
        }
        
        df = pd.DataFrame(data)
        df = df.clip(lower=0)
        df["pH"] = df["pH"].clip(6.5, 8.5)
        df["TDS"] = df["TDS"].clip(50, 450)
        df["turbidity"] = df["turbidity"].clip(0, 0.9)
        df["chlorine"] = df["chlorine"].clip(0.2, 0.9)
        df["fluoride"] = df["fluoride"].clip(0.1, 0.9)
        df["iron"] = df["iron"].clip(0, 0.25)
        df["nitrate"] = df["nitrate"].clip(5, 40)
        
        return df

    def train_anomaly_detector(self, X: pd.DataFrame) -> Dict[str, Any]:
        self.scaler = StandardScaler()
        X_scaled = self.scaler.fit_transform(X)
        
        self.anomaly_model = IsolationForest(
            n_estimators=100,
            contamination=0.1,
            max_samples='auto',
            random_state=42,
            n_jobs=-1
        )
        self.anomaly_model.fit(X_scaled)
        
        self.save()
        
        predictions = self.anomaly_model.predict(X_scaled)
        n_anomalies = (predictions == -1).sum()
        
        return {
            "n_samples": len(X),
            "n_anomalies": int(n_anomalies),
            "anomaly_ratio": round(n_anomalies / len(X), 4),
            "features": self.parameters
        }

    def analyze(self, params: Dict[str, float]) -> Dict[str, Any]:
        parameter_status = {}
        anomalies = []
        recommendations = []
        severity_scores = []
        
        for param in self.parameters:
            value = params.get(param, 0)
            threshold = self.BIS_THRESHOLDS[param]
            
            if value < threshold["min"]:
                status = "below_safe"
                anomalies.append(f"{param} ({value} {threshold['unit']}) is below minimum safe level ({threshold['min']} {threshold['unit']})")
                recommendations.append(f"Increase {param} level to meet BIS standards")
                severity_scores.append(0.8)
            elif value > threshold["max"]:
                status = "above_safe"
                anomalies.append(f"{param} ({value} {threshold['unit']}) exceeds safe limit ({threshold['max']} {threshold['unit']})")
                recommendations.append(f"Reduce {param} level to meet BIS standards")
                severity_scores.append(0.9 if param == "coliform" else 0.7)
            else:
                status = "safe"
                severity_scores.append(0)
            
            parameter_status[param] = {
                "value": value,
                "status": status,
                "min_safe": threshold["min"],
                "max_safe": threshold["max"],
                "unit": threshold["unit"]
            }
        
        if self.anomaly_model and self.scaler:
            input_data = pd.DataFrame([{p: params.get(p, 0) for p in self.parameters}])
            input_scaled = self.scaler.transform(input_data)
            anomaly_score = float(self.anomaly_model.decision_function(input_scaled)[0])
            is_anomaly = self.anomaly_model.predict(input_scaled)[0] == -1
            
            if is_anomaly:
                anomalies.append(f"Overall water quality anomaly detected (score: {anomaly_score:.4f})")
                severity_scores.append(0.6)
        
        avg_severity = np.mean(severity_scores) if severity_scores else 0
        if avg_severity > 0.7 or any(a.startswith("coliform") for a in anomalies):
            overall_status = "unsafe"
        elif anomalies or avg_severity > 0.3:
            overall_status = "warning"
        else:
            overall_status = "safe"
        
        if not recommendations:
            recommendations.append("Water quality meets all BIS standards")
        
        return {
            "overall_status": overall_status,
            "parameter_status": parameter_status,
            "anomalies": anomalies,
            "recommendations": recommendations,
            "severity_score": round(avg_severity, 4),
            "contamination_trend": "stable"
        }

    def analyze_trend(self, history: List[Dict[str, Any]]) -> Dict[str, Any]:
        if not history:
            return {
                "trend": "insufficient_data",
                "rising_contamination": False,
                "unsafe_readings": 0,
                "total_readings": 0,
                "abnormal_values": [],
                "recommendations": ["Collect more data points for trend analysis"]
            }
        
        df = pd.DataFrame(history)
        rising_contamination = False
        unsafe_readings = 0
        abnormal_values = []
        recommendations = []
        
        for param in self.parameters:
            if param not in df.columns:
                continue
            
            values = df[param].values
            threshold = self.BIS_THRESHOLDS[param]
            
            if len(values) >= 3:
                recent_avg = np.mean(values[-3:])
                earlier_avg = np.mean(values[:3]) if len(values) > 3 else np.mean(values)
                
                if param == "pH":
                    trend = recent_avg - earlier_avg
                    if abs(trend) > 0.5:
                        rising_contamination = True
                        abnormal_values.append(f"{param} shows significant trend ({trend:+.2f})")
                else:
                    trend = recent_avg - earlier_avg
                    if trend > 0.1 * threshold["max"]:
                        rising_contamination = True
                        abnormal_values.append(f"{param} shows increasing trend ({trend:+.2f})")
            
            unsafe_mask = (values < threshold["min"]) | (values > threshold["max"])
            unsafe_count = int(unsafe_mask.sum())
            unsafe_readings += unsafe_count
            
            if unsafe_count > len(values) * 0.2:
                abnormal_values.append(f"{param} has {unsafe_count} unsafe readings out of {len(values)}")
        
        total_readings = len(df)
        unsafe_ratio = unsafe_readings / (total_readings * len(self.parameters)) if total_readings > 0 else 0
        
        if unsafe_ratio > 0.3:
            contamination_trend = "critical"
            recommendations.append("Immediate action required: Multiple parameters showing unsafe levels")
        elif rising_contamination:
            contamination_trend = "rising"
            recommendations.append("Monitor closely: Contamination levels are increasing")
        elif unsafe_ratio > 0.1:
            contamination_trend = "concerning"
            recommendations.append("Investigate sources of contamination")
        else:
            contamination_trend = "stable"
            recommendations.append("Water quality remains within acceptable limits")
        
        if total_readings < 5:
            recommendations.append("Collect more data points for reliable trend analysis")
        
        return {
            "trend": contamination_trend,
            "rising_contamination": rising_contamination,
            "unsafe_readings": unsafe_readings,
            "total_readings": total_readings,
            "abnormal_values": abnormal_values,
            "recommendations": recommendations,
            "data_points": total_readings,
            "analysis_period": f"{total_readings} readings"
        }

    def get_thresholds(self) -> Dict[str, Any]:
        return {
            "source": "BIS 10500:2012",
            "parameters": self.BIS_THRESHOLDS,
            "description": "Bureau of Indian Standards Drinking Water Specifications"
        }

    def save(self):
        os.makedirs(self.model_dir, exist_ok=True)
        if self.anomaly_model:
            joblib.dump(self.anomaly_model, self.model_path)
        if self.scaler:
            joblib.dump(self.scaler, self.scaler_path)

    def load(self) -> bool:
        try:
            if os.path.exists(self.model_path) and os.path.exists(self.scaler_path):
                self.anomaly_model = joblib.load(self.model_path)
                self.scaler = joblib.load(self.scaler_path)
                return True
        except Exception as e:
            print(f"Error loading water quality models: {e}")
        return False

    def get_model_info(self) -> Dict[str, Any]:
        return {
            "model_type": "IsolationForest",
            "features": self.parameters,
            "is_loaded": self.anomaly_model is not None,
            "model_path": self.model_path,
            "thresholds_source": "BIS 10500:2012"
        }
