from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional
import re

router = APIRouter(prefix="/api/v1/ai")


class ChatRequest(BaseModel):
    message: str = Field(..., description="User message")
    context: Optional[Dict[str, Any]] = Field(default=None, description="Optional context data")

    class Config:
        json_schema_extra = {
            "example": {
                "message": "Is the water safe to drink?",
                "context": {
                    "current_quality": {
                        "pH": 7.2,
                        "TDS": 250,
                        "turbidity": 0.3,
                        "chlorine": 0.5,
                        "fluoride": 0.4,
                        "iron": 0.1,
                        "nitrate": 20,
                        "coliform": 0
                    }
                }
            }
        }


class ChatResponse(BaseModel):
    response: str
    suggestions: List[str]
    data: Optional[Dict[str, Any]] = None


class ChatAssistant:
    INTENT_PATTERNS = {
        "water_quality": {
            "keywords": ["water", "quality", "safe", "drink", "ph", "tds", "turbidity", "contamination", "pollution", "bacteria"],
            "responses": {
                "safe": "Based on the current water quality data, the water is {status}. {details}",
                "check": "I can help you check water quality. Please provide the water quality parameters or I can analyze current readings.",
                "general": "Water quality is monitored using parameters like pH, TDS, turbidity, chlorine, fluoride, iron, nitrate, and coliform levels."
            }
        },
        "pump_maintenance": {
            "keywords": ["pump", "maintenance", "health", "failure", "repair", "service", "oil", "vibration", "motor"],
            "responses": {
                "status": "Pump health status: {health_score}/100. Risk level: {risk_level}. {recommendation}",
                "list": "Here are the pumps that need maintenance attention:",
                "general": "Predictive maintenance uses sensor data to predict pump failures before they occur."
            }
        },
        "complaints": {
            "keywords": ["complaint", "issue", "problem", "report", "ticket", "status", "pending", "resolved"],
            "responses": {
                "list": "Here are the recent complaints:",
                "status": "Complaint status: {status}",
                "general": "You can view and manage complaints through the complaints management system."
            }
        },
        "leak_detection": {
            "keywords": ["leak", "leakage", "pipe", "burst", "flow", "pressure", "water loss"],
            "responses": {
                "detect": "Leak detection analysis: {result}",
                "check": "I can check for potential leaks. Please provide flow rate, pressure, and consumption data.",
                "general": "Leak detection uses flow rate, pressure, and consumption patterns to identify potential leaks."
            }
        },
        "consumption": {
            "keywords": ["consumption", "usage", "meter", "reading", "bill", "daily", "monthly"],
            "responses": {
                "check": "Current water consumption data shows: {consumption} liters",
                "general": "Water consumption is tracked daily and can be compared against historical patterns."
            }
        },
        "general": {
            "keywords": ["help", "what", "how", "can", "do", "info", "information"],
            "responses": {
                "default": "I'm JalRakshak AI assistant. I can help you with:\n- Water quality analysis\n- Pump maintenance predictions\n- Leak detection\n- Complaint management\n- Consumption monitoring"
            }
        }
    }

    def parse_intent(self, message: str) -> str:
        message_lower = message.lower()
        
        for intent, config in self.INTENT_PATTERNS.items():
            if intent == "general":
                continue
            for keyword in config["keywords"]:
                if keyword in message_lower:
                    return intent
        
        return "general"

    def generate_response(self, message: str, context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        intent = self.parse_intent(message)
        message_lower = message.lower()
        
        if intent == "water_quality":
            return self._handle_water_quality(message_lower, context)
        elif intent == "pump_maintenance":
            return self._handle_pump_maintenance(message_lower, context)
        elif intent == "complaints":
            return self._handle_complaints(message_lower, context)
        elif intent == "leak_detection":
            return self._handle_leak_detection(message_lower, context)
        elif intent == "consumption":
            return self._handle_consumption(message_lower, context)
        else:
            return self._handle_general(message)

    def _handle_water_quality(self, message: str, context: Optional[Dict]) -> Dict[str, Any]:
        quality_data = context.get("current_quality") if context else None
        
        if "safe" in message or "drink" in message:
            if quality_data:
                from services.model_service import model_service
                result = model_service.analyze_water_quality(quality_data)
                status = "safe" if result["overall_status"] == "safe" else "potentially unsafe"
                details = "; ".join(result["anomalies"][:3]) if result["anomalies"] else "All parameters within safe limits"
                response = f"Based on the current water quality data, the water is {status}. {details}"
                suggestions = ["Check detailed quality report", "View historical trends", "Test another sample"]
                data = result
            else:
                response = "To check if water is safe, I need current water quality readings. Please provide parameters like pH, TDS, turbidity, etc."
                suggestions = ["Provide water quality data", "View BIS standards", "Check historical data"]
                data = None
        elif "check" in message or "analyze" in message:
            response = "I can analyze water quality. Please provide the following parameters: pH, TDS, turbidity, chlorine, fluoride, iron, nitrate, and coliform levels."
            suggestions = ["View parameter descriptions", "Check BIS thresholds", "Enter test results"]
            data = None
        else:
            response = "Water quality is monitored using parameters like pH, TDS, turbidity, chlorine, fluoride, iron, nitrate, and coliform levels. I can analyze these against BIS standards."
            suggestions = ["Check if water is safe", "View quality thresholds", "Analyze current readings"]
            data = None
        
        return {"response": response, "suggestions": suggestions, "data": data}

    def _handle_pump_maintenance(self, message: str, context: Optional[Dict]) -> Dict[str, Any]:
        pump_data = context.get("pump_data") if context else None
        
        if "list" in message or "which" in message or "need" in message:
            if pump_data:
                from services.model_service import model_service
                pumps_needing_maintenance = []
                for pump in pump_data if isinstance(pump_data, list) else [pump_data]:
                    result = model_service.predict_maintenance(pump)
                    if result["urgent"]:
                        pumps_needing_maintenance.append({
                            "pump_id": pump.get("id", "unknown"),
                            "health_score": result["health_score"],
                            "risk_level": result["failure_risk"]
                        })
                response = f"Found {len(pumps_needing_maintenance)} pumps needing immediate attention."
                suggestions = ["View detailed report", "Schedule maintenance", "Check pump history"]
                data = {"pumps": pumps_needing_maintenance}
            else:
                response = "I can identify pumps needing maintenance. Please provide pump sensor data or select a specific pump."
                suggestions = ["View all pumps", "Check specific pump", "View maintenance schedule"]
                data = None
        elif "health" in message or "status" in message:
            if pump_data:
                from services.model_service import model_service
                result = model_service.predict_maintenance(pump_data if isinstance(pump_data, dict) else pump_data[0])
                response = f"Pump health score: {result['health_score']}/100. Risk level: {result['failure_risk']}. {result['maintenance_recommendation']}"
                suggestions = ["Schedule maintenance", "View history", "Compare with baseline"]
                data = result
            else:
                response = "Please provide pump sensor data to check its health status."
                suggestions = ["Enter pump data", "View all pumps", "Check maintenance history"]
                data = None
        else:
            response = "I can help with pump maintenance predictions. I can check pump health, identify pumps needing maintenance, and provide recommendations."
            suggestions = ["Check pump health", "List pumps needing maintenance", "View maintenance schedule"]
            data = None
        
        return {"response": response, "suggestions": suggestions, "data": data}

    def _handle_complaints(self, message: str, context: Optional[Dict]) -> Dict[str, Any]:
        complaints = context.get("complaints") if context else None
        
        if "list" in message or "show" in message:
            if complaints:
                pending = [c for c in complaints if c.get("status") == "pending"]
                resolved = [c for c in complaints if c.get("status") == "resolved"]
                response = f"There are {len(pending)} pending complaints and {len(resolved)} resolved complaints."
                suggestions = ["View pending complaints", "View resolved complaints", "File new complaint"]
                data = {"pending": len(pending), "resolved": len(resolved), "complaints": complaints}
            else:
                response = "No complaint data available. Complaints can be viewed through the complaints management system."
                suggestions = ["File new complaint", "View all complaints", "Check complaint status"]
                data = None
        elif "status" in message:
            if complaints:
                response = f"Current complaint status: {len([c for c in complaints if c.get('status') == 'pending'])} pending, {len([c for c in complaints if c.get('status') == 'resolved'])} resolved."
                suggestions = ["View pending", "View resolved", "Update status"]
                data = {"complaints": complaints}
            else:
                response = "Please provide complaint data or specify a complaint ID to check its status."
                suggestions = ["View all complaints", "Check specific complaint", "File new complaint"]
                data = None
        else:
            response = "I can help you manage complaints. You can view complaints, check their status, and file new complaints."
            suggestions = ["View complaints", "Check complaint status", "File new complaint"]
            data = None
        
        return {"response": response, "suggestions": suggestions, "data": data}

    def _handle_leak_detection(self, message: str, context: Optional[Dict]) -> Dict[str, Any]:
        leak_data = context.get("leak_data") if context else None
        
        if "detect" in message or "check" in message:
            if leak_data:
                from services.model_service import model_service
                result = model_service.predict_leak(leak_data)
                status = "leak detected" if result["leak_detected"] else "no leak detected"
                response = f"Leak detection analysis: {status}. Probability: {result['probability']*100:.1f}%. Confidence: {result['confidence']*100:.1f}%."
                suggestions = ["View detailed analysis", "Check history", "Report leak"]
                data = result
            else:
                response = "I can check for potential leaks. Please provide flow rate, pressure, and water consumption data."
                suggestions = ["Enter sensor data", "View historical leaks", "Check flow patterns"]
                data = None
        else:
            response = "Leak detection uses flow rate, pressure, and consumption patterns to identify potential leaks in the water supply system."
            suggestions = ["Check for leaks", "View leak history", "Report a leak"]
            data = None
        
        return {"response": response, "suggestions": suggestions, "data": data}

    def _handle_consumption(self, message: str, context: Optional[Dict]) -> Dict[str, Any]:
        consumption = context.get("consumption_data") if context else None
        
        if consumption:
            response = f"Current water consumption: {consumption.get('daily', 'N/A')} liters daily, {consumption.get('monthly', 'N/A')} liters monthly."
            suggestions = ["View daily breakdown", "Compare with average", "Set alerts"]
            data = consumption
        else:
            response = "Water consumption tracking shows daily and monthly usage patterns. I can help analyze consumption trends and identify anomalies."
            suggestions = ["Check current consumption", "View historical data", "Compare with previous periods"]
            data = None
        
        return {"response": response, "suggestions": suggestions, "data": data}

    def _handle_general(self, message: str) -> Dict[str, Any]:
        response = "I'm JalRakshak AI assistant for rural water supply monitoring. I can help you with:\n- Water quality analysis\n- Pump maintenance predictions\n- Leak detection\n- Complaint management\n- Consumption monitoring"
        suggestions = ["Check water quality", "Predict pump maintenance", "Detect leaks", "View complaints"]
        data = None
        
        return {"response": response, "suggestions": suggestions, "data": data}


chat_assistant = ChatAssistant()


@router.post("/chat", response_model=ChatResponse)
async def chat(request: ChatRequest):
    try:
        result = chat_assistant.generate_response(request.message, request.context)
        
        return ChatResponse(
            response=result["response"],
            suggestions=result["suggestions"],
            data=result.get("data")
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat processing failed: {str(e)}")
