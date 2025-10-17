"""
Mock AgentKit Agent Server
Simulates an AgentKit agent for testing the Undergoing Project flow
"""
import os
import time
import requests
from fastapi import FastAPI, Request
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()

PANDA = os.getenv("PANDA_PROXY", "http://localhost:8082")
CALENDAR_API = os.getenv("CALENDAR_API_BASE", "http://localhost:7300/api")


def produce_to_redpanda(topic: str, key: str, value: dict) -> None:
    """Produce a message to Redpanda via Pandaproxy"""
    try:
        payload = {"records": [{"key": key, "value": value}]}
        headers = {"Content-Type": "application/vnd.kafka.json.v2+json"}
        r = requests.post(f"{PANDA}/topics/{topic}", json=payload, headers=headers, timeout=5)
        r.raise_for_status()
    except Exception as e:
        print(f"Error producing to Redpanda: {e}")


def apply_undergoing_policy(event: dict) -> dict:
    """
    Apply Undergoing Project policies to determine action

    Policies:
    - bug + (p0|highest) → escalate_owner to team:platform
    - frontend → assign_owner:alice
    - due_today|overdue → schedule_unblocker 15min with assignee
    - default → post_nudge to triage
    """
    labels = event.get("labels", [])
    priority = event.get("priority", "")
    assignee = event.get("assignee")
    due_at = event.get("due_at", "")

    # Check for high priority bugs
    if "bug" in labels and (priority in ["P0", "Highest", "highest"] or "p0" in labels):
        return {
            "action": "escalate_owner",
            "target": "team:platform",
            "rationale": "High priority bug requires immediate platform team attention"
        }

    # Check for frontend issues
    if "frontend" in labels:
        return {
            "action": "assign_owner",
            "target": "owner:alice",
            "rationale": "Frontend issue assigned to frontend specialist Alice"
        }

    # Check for overdue or due today
    if due_at or "overdue" in labels:
        target = f"owner:{assignee}" if assignee else "team:triage"
        return {
            "action": "schedule_unblocker",
            "target": target,
            "rationale": "Issue has approaching deadline, scheduling unblocker meeting"
        }

    # Default: post nudge
    return {
        "action": "post_nudge",
        "target": "team:triage",
        "rationale": "New issue needs triage"
    }


def execute_action(event: dict, decision: dict) -> dict:
    """
    Execute the decided action using domain tools
    Returns outcome with risk delta
    """
    action = decision["action"]
    target = decision["target"]

    outcome = {
        "event_id": f"o-{int(time.time())}",
        "project_id": event.get("project_id", "alpha"),
        "risk_delta": 0.0,
        "ack": False,
    }

    try:
        if action == "assign_owner":
            # Simulate owner assignment
            print(f"  ✓ Assigned to {target}")
            outcome["risk_delta"] = -0.1
            outcome["ack"] = True

        elif action == "escalate_owner":
            # Simulate escalation
            print(f"  ✓ Escalated to {target}")
            outcome["risk_delta"] = -0.3
            outcome["ack"] = True

        elif action == "schedule_unblocker":
            # Call calendar API
            meeting_data = {
                "title": f"Unblocker: {event.get('title', 'Issue')}",
                "participants": [target],
                "start_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime(time.time() + 3600)),
                "duration_min": 15,
            }
            r = requests.post(f"{CALENDAR_API}/meetings", json=meeting_data, timeout=5)
            r.raise_for_status()
            result = r.json()
            print(f"  ✓ Scheduled meeting: {result.get('id')}")
            outcome["risk_delta"] = -0.2
            outcome["ack"] = True

        elif action == "post_nudge":
            # Call calendar/notification API
            nudge_data = {
                "to": target,
                "message": f"Please triage issue: {event.get('title', 'New Issue')} - {event.get('url', '')}",
            }
            r = requests.post(f"{CALENDAR_API}/nudges", json=nudge_data, timeout=5)
            r.raise_for_status()
            result = r.json()
            print(f"  ✓ Sent nudge: {result.get('id')}")
            outcome["risk_delta"] = -0.05
            outcome["ack"] = True

    except Exception as e:
        print(f"  ✗ Action execution failed: {e}")
        outcome["risk_delta"] = 0.1  # Risk increased due to failure
        outcome["ack"] = False

    return outcome


@app.get("/health")
async def health():
    """Health check"""
    return {"status": "ok", "service": "mock-agentkit-agent"}


@app.post("/run")
async def process_event(request: Request):
    """
    Main AgentKit endpoint - processes events and takes actions
    """
    event = await request.json()

    event_id = event.get("event_id", "unknown")
    event_type = event.get("type", "unknown")
    print(f"\n[AGENT] AgentKit processing: {event_type} (ID: {event_id})")

    # Apply policy to decide action
    decision = apply_undergoing_policy(event)
    print(f"  → Decision: {decision['action']} - {decision['rationale']}")

    # Record the action
    action_record = {
        "event_id": f"a-{int(time.time())}",
        "project_id": event.get("project_id", "alpha"),
        "action": decision["action"],
        "target": decision["target"],
        "rationale": decision["rationale"],
        "source_ref": event.get("url", ""),
    }
    produce_to_redpanda("actions", action_record["project_id"], action_record)

    # Execute the action
    outcome = execute_action(event, decision)
    produce_to_redpanda("outcomes", outcome["project_id"], outcome)

    print(f"  → Outcome: risk_delta={outcome['risk_delta']}, ack={outcome['ack']}")

    return {
        "status": "processed",
        "event_id": event_id,
        "action": decision["action"],
        "outcome": outcome,
    }


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("AGENTKIT_PORT", "8000"))
    print(f"Starting Mock AgentKit Agent on port {port}...")
    uvicorn.run(app, host="0.0.0.0", port=port)
