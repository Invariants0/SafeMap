from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from typing import List
from app.database.databaseConfig import get_db, init_db
from app.models.dataModels import Report
from app.models.apiSchemas import ReportInput, ReportResponse, Hotspot, HotspotInsight, Stats
from app.utils.privacyUtils import fuzz_coordinates
from app.services.geminiService import gemini_service
from app.services.hotspotService import hotspot_service
from app.config.appConfig import settings
from collections import Counter
import os
import json

print(f"DEBUG: Frontend URL setting: {settings.frontend_url}")
print(f"DEBUG: Database URL: {settings.database_url[:50] if settings.database_url else 'None'}...")

app = FastAPI(title="SafeMap API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url, "http://localhost:5173", "https://safemap-evorozon.vercel.app"],
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    try:
        init_db()
    except Exception as e:
        print(f"Warning: Database initialization failed on startup: {e}")
        print("Database will be initialized on first request.")


@app.get("/health")
@app.head("/health")
def health_check():
    return {"status": "healthy", "service": "safemap-api"}


@app.post("/api/report", response_model=ReportResponse)
def create_report(report_input: ReportInput, db: Session = Depends(get_db)):
    """
    Submit an anonymous safety incident report.
    Parses text with Gemini AI, applies privacy fuzzing, and stores structured data.
    Note: In dummy mode, this still works but writes to the live database.
    """
    try:
        parsed = gemini_service.parse_incident(report_input.text)
    except Exception as e:
        print(f"Gemini parsing error: {e}")
        # Fallback to default values if Gemini fails
        parsed = None
    
    if not parsed:
        # Use fallback values when Gemini fails
        from app.models.apiSchemas import IncidentParsed
        parsed = IncidentParsed(
            incident_type="other",
            hour_estimate=None,
            severity="moderate"
        )
    
    fuzzed_lat, fuzzed_lng = fuzz_coordinates(report_input.lat, report_input.lng)
    
    db_report = Report(
        incident_type=parsed.incident_type,
        severity=parsed.severity,
        hour_estimate=parsed.hour_estimate,
        lat=fuzzed_lat,
        lng=fuzzed_lng
    )
    
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    
    return db_report


@app.get("/api/hotspots", response_model=List[Hotspot])
def get_hotspots(db: Session = Depends(get_db)):
    """
    Get all safety hotspots using DBSCAN Clustering.
    """
    if settings.use_dummy_data:
        path = os.path.join(os.path.dirname(__file__), "../dummy/hotspots.json")
        with open(path, "r", encoding="utf-8") as f:
            return json.load(f)
    hotspots = hotspot_service.get_hotspots(db)
    return hotspots


@app.get("/api/hotspots/{hotspot_id}/insight", response_model=HotspotInsight)
def get_hotspot_insight(hotspot_id: str, db: Session = Depends(get_db)):
    """
    Get AI-generated safety insights for a specific hotspot.
    """
    if settings.use_dummy_data:
        path = os.path.join(os.path.dirname(__file__), "../dummy/insights.json")
        with open(path, "r", encoding="utf-8") as f:
            insights = json.load(f)
        if hotspot_id not in insights:
            raise HTTPException(status_code=404, detail="Hotspot not found")
        return insights[hotspot_id]
    hotspot_data = hotspot_service.get_hotspot_by_id(db, hotspot_id)
    
    if not hotspot_data:
        raise HTTPException(status_code=404, detail="Hotspot not found")
    
    insight = gemini_service.generate_insight(hotspot_data)
    
    if not insight:
        raise HTTPException(status_code=500, detail="Failed to generate insight")
    
    return insight


@app.get("/api/stats", response_model=Stats)
def get_stats(db: Session = Depends(get_db)):
    """
    Get dashboard statistics.
    """
    if settings.use_dummy_data:
        path = os.path.join(os.path.dirname(__file__), "../dummy/incidents.json")
        with open(path, "r", encoding="utf-8") as f:
            incidents = json.load(f)

        hotspots_path = os.path.join(os.path.dirname(__file__), "../dummy/hotspots.json")
        with open(hotspots_path, "r", encoding="utf-8") as f:
            total_hotspots = len(json.load(f))
            
        total_reports = len(incidents)
        incident_counts = Counter(i["incident_type"] for i in incidents)
        most_common_incident = incident_counts.most_common(1)[0][0] if incident_counts else "None"
        hour_counts = Counter(i["hour_estimate"] for i in incidents if i.get("hour_estimate") is not None)
        peak_reporting_hour = hour_counts.most_common(1)[0][0] if hour_counts else 0
        return Stats(
            total_reports=total_reports,
            total_hotspots=total_hotspots,
            most_common_incident=most_common_incident,
            peak_reporting_hour=peak_reporting_hour
        )
    
    total_reports = db.query(func.count(Report.id)).scalar() or 0
    
    hotspots = hotspot_service.get_hotspots(db)
    total_hotspots = len(hotspots)
    
    most_common = db.query(
        Report.incident_type,
        func.count(Report.incident_type).label('count')
    ).group_by(Report.incident_type).order_by(desc('count')).first()
    
    most_common_incident = most_common[0] if most_common else "None"
    
    peak_hour = db.query(
        Report.hour_estimate,
        func.count(Report.hour_estimate).label('count')
    ).filter(Report.hour_estimate.isnot(None)).group_by(
        Report.hour_estimate
    ).order_by(desc('count')).first()
    
    peak_reporting_hour = peak_hour[0] if peak_hour else 0
    
    return Stats(
        total_reports=total_reports,
        total_hotspots=total_hotspots,
        most_common_incident=most_common_incident,
        peak_reporting_hour=peak_reporting_hour
    )
