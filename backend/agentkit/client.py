"""
AgentKit Client
Simple client for sending events to AgentKit agent
"""
import requests
import os
from dotenv import load_dotenv

load_dotenv()

AGENTKIT_URL = os.getenv("AGENTKIT_URL", "http://localhost:8000/run")


def send_event(event: dict, timeout: int = 30) -> dict:
    """
    Send an event to AgentKit for processing

    Args:
        event: Event dictionary with normalized schema
        timeout: Request timeout in seconds

    Returns:
        Response from AgentKit
    """
    response = requests.post(AGENTKIT_URL, json=event, timeout=timeout)
    response.raise_for_status()
    return response.json()


if __name__ == "__main__":
    # Simple test
    test_event = {
        "event_id": "test-123",
        "project_id": "alpha",
        "source": "github",
        "type": "issue_opened",
        "repo": "org/repo",
        "issue_number": 42,
        "title": "Test Issue",
        "url": "https://github.com/org/repo/issues/42",
        "labels": ["bug", "p0"],
    }

    print(f"Sending test event to {AGENTKIT_URL}...")
    try:
        result = send_event(test_event)
        print(f"Success: {result}")
    except Exception as e:
        print(f"Error: {e}")
