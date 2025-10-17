"""
GitHub Issues webhook receiver
Receives GitHub issue webhooks and publishes normalized events to Redpanda
"""
import hmac
import hashlib
import requests
import os
from fastapi import FastAPI, Header, HTTPException, Request
from dotenv import load_dotenv

load_dotenv()

PANDA = os.getenv("PANDA_PROXY", "http://localhost:8082")
GITHUB_SECRET = os.getenv("GITHUB_WEBHOOK_SECRET", "")
PROJECT_ID = os.getenv("PROJECT_ID", "alpha")

app = FastAPI()


def verify_signature(secret: str, body: bytes, signature: str | None) -> bool:
    """Verify GitHub webhook signature"""
    if not signature:
        return False
    try:
        algo, sig = signature.split("=")
        mac = hmac.new(secret.encode(), body, hashlib.sha256)
        return hmac.compare_digest(mac.hexdigest(), sig)
    except Exception:
        return False


def produce_to_redpanda(topic: str, key: str, value: dict) -> None:
    """Produce a message to Redpanda via Pandaproxy"""
    payload = {"records": [{"key": key, "value": value}]}
    headers = {"Content-Type": "application/vnd.kafka.json.v2+json"}
    r = requests.post(f"{PANDA}/topics/{topic}", json=payload, headers=headers, timeout=5)
    r.raise_for_status()


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "ok", "service": "github-webhook-receiver"}


@app.post("/github/issues")
async def github_issues(
    request: Request,
    x_github_event: str = Header(None),
    x_hub_signature_256: str = Header(None),
    x_github_delivery: str = Header(None),
):
    """
    GitHub issues webhook handler
    Receives issue events and publishes them to the 'issues' topic
    """
    body = await request.body()

    # Verify webhook signature if secret is configured
    if GITHUB_SECRET and not verify_signature(GITHUB_SECRET, body, x_hub_signature_256):
        raise HTTPException(status_code=401, detail="Invalid signature")

    # Only process 'issues' events
    if x_github_event != "issues":
        return {"ok": True, "ignored": x_github_event}

    payload = await request.json()
    action = payload.get("action")

    # Only process 'opened' actions for now
    if action not in ["opened", "reopened", "labeled"]:
        return {"ok": True, "ignored_action": action}

    issue = payload["issue"]
    repo = payload["repository"]
    sender = payload["sender"]

    # Normalize to our event schema
    event = {
        "event_id": x_github_delivery or f"gh-{issue['id']}",
        "project_id": PROJECT_ID,
        "source": "github",
        "type": f"issue_{action}",
        "repo": repo["full_name"],
        "issue_number": issue["number"],
        "title": issue["title"],
        "url": issue["html_url"],
        "labels": [l["name"] for l in issue.get("labels", [])],
        "assignee": (issue.get("assignee") or {}).get("login") if issue.get("assignee") else None,
        "author": sender["login"],
        "created_at": issue["created_at"],
        "updated_at": issue.get("updated_at"),
        "state": issue.get("state", "open"),
        "body_preview": (issue.get("body") or "")[:280],
    }

    # Publish to Redpanda
    produce_to_redpanda("issues", event["project_id"], event)

    return {"ok": True, "event_id": event["event_id"]}


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("WEBHOOK_PORT", "7000"))
    uvicorn.run(app, host="0.0.0.0", port=port)
