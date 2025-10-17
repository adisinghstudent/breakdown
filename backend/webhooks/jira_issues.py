"""
Jira Issues webhook receiver
Receives Jira issue webhooks and publishes normalized events to Redpanda
"""
import requests
import os
from fastapi import FastAPI, HTTPException, Request
from dotenv import load_dotenv

load_dotenv()

PANDA = os.getenv("PANDA_PROXY", "http://localhost:8082")
JIRA_PATH_TOKEN = os.getenv("JIRA_PATH_TOKEN", "")
PROJECT_ID = os.getenv("PROJECT_ID", "alpha")

app = FastAPI()


def produce_to_redpanda(topic: str, key: str, value: dict) -> None:
    """Produce a message to Redpanda via Pandaproxy"""
    payload = {"records": [{"key": key, "value": value}]}
    headers = {"Content-Type": "application/vnd.kafka.json.v2+json"}
    r = requests.post(f"{PANDA}/topics/{topic}", json=payload, headers=headers, timeout=5)
    r.raise_for_status()


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "ok", "service": "jira-webhook-receiver"}


@app.post("/jira/issues/{token}")
async def jira_issues(request: Request, token: str):
    """
    Jira issues webhook handler (path-token protected)
    Receives issue events and publishes them to the 'issues' topic
    """
    # Verify path token if configured
    if JIRA_PATH_TOKEN and token != JIRA_PATH_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid token")

    payload = await request.json()
    webhook_event = payload.get("webhookEvent", "")

    # Only process issue events
    if not webhook_event.startswith("jira:issue_"):
        return {"ok": True, "ignored": webhook_event}

    issue = payload.get("issue", {})
    if not issue:
        return {"ok": True, "ignored": "no_issue_data"}

    fields = issue.get("fields", {})
    issue_type = fields.get("issuetype", {}).get("name", "")

    # Map Jira event to our schema
    event_type_map = {
        "jira:issue_created": "issue_created",
        "jira:issue_updated": "issue_updated",
    }
    event_type = event_type_map.get(webhook_event, "issue_updated")

    # Map priority
    priority_obj = fields.get("priority", {})
    priority = priority_obj.get("name", "") if priority_obj else ""

    # Get assignee
    assignee_obj = fields.get("assignee", {})
    assignee = assignee_obj.get("displayName", "") if assignee_obj else None

    # Normalize to our event schema
    event = {
        "event_id": f"jira-{issue.get('id')}",
        "project_id": PROJECT_ID,
        "source": "jira",
        "type": event_type,
        "issue_key": issue.get("key", ""),
        "title": fields.get("summary", ""),
        "url": issue.get("self", ""),
        "labels": fields.get("labels", []),
        "assignee": assignee,
        "priority": priority,
        "status": fields.get("status", {}).get("name", ""),
        "issue_type": issue_type,
        "created_at": fields.get("created", ""),
        "updated_at": fields.get("updated", ""),
        "due_at": fields.get("duedate", ""),
        "body_preview": (fields.get("description", "") or "")[:280],
    }

    # Publish to Redpanda
    produce_to_redpanda("issues", event["project_id"], event)

    return {"ok": True, "event_id": event["event_id"]}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("JIRA_WEBHOOK_PORT", "7001"))
    uvicorn.run(app, host="0.0.0.0", port=port)
