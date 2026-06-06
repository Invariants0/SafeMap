import google.generativeai as genai
from app.config.appConfig import settings
from app.models.apiSchemas import IncidentParsed, HotspotInsight
import json
from typing import Optional
import time

genai.configure(api_key=settings.gemini_api_key)


class GeminiService:
    def __init__(self):
        self.model = genai.GenerativeModel('gemini-1.5-flash')
        self.max_retries = 3
        self.retry_delay = 1
    
    def parse_incident(self, text: str) -> Optional[IncidentParsed]:
        """
        Parse incident report text using Gemini AI.
        Extract incident type, severity, and estimated hour.
        """
        prompt = f"""Analyze this incident report and extract structured information.

Report: {text}

Extract:
1. incident_type: Main type of incident (e.g., "theft", "assault", "harassment", "accident", "suspicious_activity", "vandalism", "other")
2. hour_estimate: Estimated hour when incident occurred (0-23), or null if not mentioned
3. severity: Rate as "low", "moderate", or "high"

Respond with valid JSON only in this exact format:
{{
  "incident_type": "string",
  "hour_estimate": number or null,
  "severity": "low" or "moderate" or "high"
}}"""

        for attempt in range(self.max_retries):
            try:
                response = self.model.generate_content(prompt)
                text_response = response.text.strip()
                
                if text_response.startswith("```json"):
                    text_response = text_response[7:]
                if text_response.endswith("```"):
                    text_response = text_response[:-3]
                text_response = text_response.strip()
                
                data = json.loads(text_response)
                
                return IncidentParsed(**data)
            
            except json.JSONDecodeError as e:
                if attempt < self.max_retries - 1:
                    time.sleep(self.retry_delay)
                    continue
                return IncidentParsed(
                    incident_type="other",
                    hour_estimate=None,
                    severity="moderate"
                )
            
            except Exception as e:
                if attempt < self.max_retries - 1:
                    time.sleep(self.retry_delay)
                    continue
                return None
        
        return None
    
    def generate_insight(self, hotspot_data: dict) -> Optional[HotspotInsight]:
        """
        Generate AI insights for a hotspot based on aggregated data.
        """
        cache_key = f"{hotspot_data['id']}_{hotspot_data['report_count']}"
        
        prompt = f"""Analyze this safety hotspot and provide insights.

Hotspot: {hotspot_data['name']}
Total Reports: {hotspot_data['report_count']}
Dominant Incident Type: {hotspot_data['dominant_incident']}
Severity Score: {hotspot_data['severity_score']:.2f}

Provide:
1. summary: Brief 2-3 sentence summary of safety concerns
2. recommended_action: Specific actionable recommendations for users
3. risk_level: Overall risk assessment ("low", "moderate", or "high")

Respond with valid JSON only in this exact format:
{{
  "summary": "string",
  "recommended_action": "string",
  "risk_level": "low" or "moderate" or "high"
}}"""

        for attempt in range(self.max_retries):
            try:
                response = self.model.generate_content(prompt)
                text_response = response.text.strip()
                
                if text_response.startswith("```json"):
                    text_response = text_response[7:]
                if text_response.endswith("```"):
                    text_response = text_response[:-3]
                text_response = text_response.strip()
                
                data = json.loads(text_response)
                
                return HotspotInsight(**data)
            
            except json.JSONDecodeError as e:
                if attempt < self.max_retries - 1:
                    time.sleep(self.retry_delay)
                    continue
                return HotspotInsight(
                    summary="Multiple safety incidents reported in this area.",
                    recommended_action="Exercise caution and remain aware of your surroundings.",
                    risk_level="moderate"
                )
            
            except Exception as e:
                if attempt < self.max_retries - 1:
                    time.sleep(self.retry_delay)
                    continue
                return None
        
        return None


gemini_service = GeminiService()
