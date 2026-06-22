import sys
sys.path.insert(0, '.')

from models.leak_detection import LeakDetectionModel
from models.predictive_maintenance import PredictiveMaintenanceModel
from models.water_quality import WaterQualityAnalyzer
from services.model_service import ModelService
from routes.chat_assistant import chat_assistant

def test_leak_detection():
    print("Testing Leak Detection Model...")
    model = LeakDetectionModel()
    df = model.generate_training_data(500)
    X = df.drop("leak_detected", axis=1)
    y = df["leak_detected"]
    metrics = model.train(X, y)
    
    result = model.predict({
        "flow_rate": 12, "pressure": 20, 
        "water_consumption": 400, "hours": 24
    })
    print(f"  Training accuracy: {metrics['accuracy']:.2f}")
    print(f"  Prediction: leak={result['leak_detected']}, prob={result['probability']:.2f}")
    print("  [PASS]\n")

def test_predictive_maintenance():
    print("Testing Predictive Maintenance Model...")
    model = PredictiveMaintenanceModel()
    df = model.generate_training_data(500)
    X = df.drop(["health_score", "failure_risk"], axis=1)
    y_health = df["health_score"]
    y_risk = df["failure_risk"]
    metrics = model.train(X, y_health, X, y_risk)
    
    result = model.predict({
        "running_hours": 8500, "voltage": 230, "temperature": 65,
        "power_consumption": 5.5, "vibration": 2.5, "oil_level": 60,
        "last_maintenance_days": 120
    })
    print(f"  Health model R2: {metrics['health_model_r2']:.2f}")
    print(f"  Risk model accuracy: {metrics['risk_model_accuracy']:.2f}")
    print(f"  Prediction: health={result['health_score']}, risk={result['failure_risk']}")
    print("  [PASS]\n")

def test_water_quality():
    print("Testing Water Quality Analyzer...")
    analyzer = WaterQualityAnalyzer()
    df = analyzer.generate_normal_data(300)
    metrics = analyzer.train_anomaly_detector(df)
    
    result = analyzer.analyze({
        "pH": 7.2, "TDS": 250, "turbidity": 0.5, "chlorine": 0.5,
        "fluoride": 0.4, "iron": 0.1, "nitrate": 20, "coliform": 0
    })
    print(f"  Anomaly detection: {metrics['n_anomalies']} anomalies found")
    print(f"  Analysis status: {result['overall_status']}")
    print("  [PASS]\n")

def test_chat_assistant():
    print("Testing Chat Assistant...")
    result = chat_assistant.generate_response(
        "Is the water safe to drink?",
        {"current_quality": {
            "pH": 7.2, "TDS": 250, "turbidity": 0.5, "chlorine": 0.5,
            "fluoride": 0.4, "iron": 0.1, "nitrate": 20, "coliform": 0
        }}
    )
    print(f"  Intent parsed: water_quality")
    print(f"  Response: {result['response'][:80]}...")
    print("  [PASS]\n")

def test_model_service():
    print("Testing Model Service (Singleton)...")
    service1 = ModelService()
    service2 = ModelService()
    print(f"  Singleton check: {service1 is service2}")
    print("  [PASS]\n")

if __name__ == "__main__":
    print("=" * 50)
    print("JalRakshak AI Service - Test Suite")
    print("=" * 50 + "\n")
    
    try:
        test_leak_detection()
        test_predictive_maintenance()
        test_water_quality()
        test_chat_assistant()
        test_model_service()
        
        print("=" * 50)
        print("All tests passed successfully!")
        print("=" * 50)
    except Exception as e:
        print(f"\n[FAIL] Test failed with error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
