from app.database.databaseConfig import SessionLocal, init_db
from app.models.dataModels import Report
from datetime import datetime
import json
import os
'''
Generate Dummy data. 
Used when USE_DUMMY_DATA=true
'''
init_db()

db = SessionLocal()

choice = str(input("Clear existing data? (Y/N)\n"))

if choice.lower()=='y':
    db.query(Report).delete()
    db.commit()


incidents_path = os.path.join(os.path.dirname(__file__), "incidents.json")
with open(incidents_path, "r", encoding="utf-8") as f:
    incidents = json.load(f)

for incident in incidents:
    created_at = datetime.fromisoformat(incident["created_at"].replace("Z", "+00:00"))

    report = Report(
        incident_type=incident["incident_type"],
        severity=incident["severity"],
        hour_estimate=incident["hour_estimate"],
        lat=incident["lat"],
        lng=incident["lng"],
        created_at=created_at
    )
    db.add(report)

db.commit()
print(f"Seeded {len(incidents)} incidents successfully.")
db.close()
