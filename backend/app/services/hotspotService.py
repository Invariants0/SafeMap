from sqlalchemy.orm import Session
from app.models.dataModels import Report
from app.models.apiSchemas import Hotspot
from sklearn.cluster import DBSCAN
from typing import List
import numpy as np


class HotspotService:

    def __init__(self):
        pass

    def get_hotspots(self, db: Session, min_reports: int = 3) -> List[Hotspot]:
        """
        Generate hotspots by grouping nearby reports into clusters using DBSCAN.
        """
        reports = db.query(Report).all()
        
        if not reports:
            return []
        
        hotspots = []

        coords = np.array([[r.lat, r.lng] for r in reports])
        
        model = DBSCAN(eps= 0.5 / 6371.0, min_samples= min_reports, metric="haversine", algorithm= "ball_tree")
        
        labels = model.fit_predict(np.radians(coords))

        #generate hotspots:
        for cluster_id in np.unique(labels):
            if cluster_id == -1:
                continue
            cluster_reports = [ r for r,l in zip(reports,labels) if l==cluster_id]
        
            if len(cluster_reports) < min_reports:
                continue

            avg_lat = sum(r.lat for r in cluster_reports) / len(cluster_reports)
            avg_lng = sum(r.lng for r in cluster_reports) / len(cluster_reports)
            
            incident_counts = {}
            severity_scores = {"low": 1, "moderate": 2, "high": 3}
            total_severity = 0

            for report in cluster_reports:
                incident_counts[report.incident_type] = incident_counts.get(report.incident_type, 0) + 1
                total_severity += severity_scores.get(report.severity, 2) # pyright: ignore[reportCallIssue, reportArgumentType]
            
            dominant_incident = max(incident_counts.items(), key=lambda x: x[1])[0]
            avg_severity_score = total_severity / len(cluster_reports)

            name = self._generate_hotspot_name(avg_lat, avg_lng, dominant_incident) # type: ignore

            hotspot = Hotspot(
                id=str(cluster_id),
                name=name,
                lat=avg_lat, # type: ignore
                lng=avg_lng, # type: ignore
                report_count=len(cluster_reports),
                dominant_incident=dominant_incident,
                severity_score=avg_severity_score
            )
            
            hotspots.append(hotspot)
        
        return sorted(hotspots, key=lambda h: h.report_count, reverse=True)

        
    
    def get_hotspot_by_id(self, db: Session, hotspot_id: str) -> dict | None:
        """
        Get detailed hotspot data for insight generation.
        """
        hotspots = self.get_hotspots(db)
        
        for hotspot in hotspots:
            if hotspot.id == hotspot_id:
                return {
                    "id": hotspot.id,
                    "name": hotspot.name,
                    "lat": hotspot.lat,
                    "lng": hotspot.lng,
                    "report_count": hotspot.report_count,
                    "dominant_incident": hotspot.dominant_incident,
                    "severity_score": hotspot.severity_score
                }
        
        return None
    
    def _generate_hotspot_name(self, lat: float, lng: float, incident_type: str) -> str:
        """
        Generate a descriptive name for the hotspot.
        """
        incident_label = incident_type.replace("_", " ").title()
        return f"{incident_label} Area ({lat:.3f}, {lng:.3f})"


hotspot_service = HotspotService()
