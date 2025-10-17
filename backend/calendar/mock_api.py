"""
Mock Calendar API
Simulates calendar and notification services for testing
"""
import os
import time
from fastapi import FastAPI
from pydantic import BaseModel
from typing import Optional

app = FastAPI()


class MeetingRequest(BaseModel):
    """Meeting creation request"""
    title: str
    participants: list[str]
    start_at: str  # ISO 8601 timestamp
    duration_min: int = 30


class NudgeRequest(BaseModel):
    """Nudge/notification request"""
    to: str
    message: str
    priority: Optional[str] = "normal"


@app.get("/health")
async def health():
    """Health check"""
    return {"status": "ok", "service": "mock-calendar-api"}


@app.post("/api/meetings")
async def create_meeting(meeting: MeetingRequest):
    """
    Create a meeting/calendar event
    Returns meeting ID and ICS link
    """
    meeting_id = f"mtg-{int(time.time())}"

    print(f"\n[CALENDAR] Creating meeting")
    print(f"   Title: {meeting.title}")
    print(f"   Participants: {', '.join(meeting.participants)}")
    print(f"   Start: {meeting.start_at}")
    print(f"   Duration: {meeting.duration_min} minutes")
    print(f"   ID: {meeting_id}")

    return {
        "id": meeting_id,
        "title": meeting.title,
        "participants": meeting.participants,
        "start_at": meeting.start_at,
        "duration_min": meeting.duration_min,
        "ics": f"https://calendar.example.com/ics/{meeting_id}",
        "status": "scheduled",
    }


@app.post("/api/nudges")
async def send_nudge(nudge: NudgeRequest):
    """
    Send a nudge/notification
    Returns nudge ID
    """
    nudge_id = f"nudge-{int(time.time())}"

    print(f"\n[NOTIFICATION] Sending nudge")
    print(f"   To: {nudge.to}")
    print(f"   Message: {nudge.message}")
    print(f"   Priority: {nudge.priority}")
    print(f"   ID: {nudge_id}")

    return {
        "id": nudge_id,
        "to": nudge.to,
        "message": nudge.message,
        "priority": nudge.priority,
        "status": "sent",
    }


@app.get("/api/meetings/{meeting_id}")
async def get_meeting(meeting_id: str):
    """Get meeting details"""
    return {
        "id": meeting_id,
        "status": "scheduled",
        "title": "Mock Meeting",
    }


@app.get("/api/nudges/{nudge_id}")
async def get_nudge(nudge_id: str):
    """Get nudge details"""
    return {
        "id": nudge_id,
        "status": "sent",
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("CALENDAR_PORT", "7300"))
    print(f"Starting Mock Calendar API on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port)
