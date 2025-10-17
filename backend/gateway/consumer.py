"""
Gateway Consumer
Subscribes to Redpanda topics and forwards events to AgentKit for processing
"""
import os
import time
import requests
import json
from dotenv import load_dotenv

load_dotenv()

PANDA = os.getenv("PANDA_PROXY", "http://localhost:8082")
AGENT = os.getenv("AGENTKIT_URL", "http://localhost:8000/run")
GROUP = "agent-gw"
INSTANCE = os.getenv("CONSUMER_INSTANCE", "gw-1")


def subscribe(topics: list[str]) -> str:
    """
    Subscribe to Redpanda topics using consumer groups
    Returns the base URI for polling
    """
    print(f"Creating consumer group '{GROUP}' instance '{INSTANCE}'...")
    headers = {"Content-Type": "application/vnd.kafka.v2+json"}
    try:
        r = requests.post(
            f"{PANDA}/consumers/{GROUP}",
            json={"name": INSTANCE, "format": "json"},
            headers=headers,
            timeout=10
        )
        r.raise_for_status()
        base = r.json()["base_uri"]
    except requests.exceptions.HTTPError as e:
        if e.response.status_code == 409:
            # Consumer already exists, construct base URI
            print(f"Consumer instance already exists, reusing...")
            base = f"{PANDA}/consumers/{GROUP}/instances/{INSTANCE}"
        else:
            raise

    print(f"Subscribing to topics: {topics}")
    r = requests.post(f"{base}/subscription", json={"topics": topics}, headers=headers, timeout=10)
    r.raise_for_status()
    print(f"Successfully subscribed to {topics}")
    return base


def poll(base: str, timeout_ms: int = 500) -> list:
    """
    Poll for new messages from subscribed topics
    Returns list of records
    """
    headers = {"Accept": "application/vnd.kafka.json.v2+json"}
    try:
        r = requests.get(f"{base}/records?timeout={timeout_ms}", headers=headers, timeout=10)
        if r.status_code == 204:
            return []
        r.raise_for_status()
        return r.json()
    except Exception as e:
        print(f"Error polling: {e}")
        return []


def send_to_agentkit(event: dict) -> bool:
    """
    Send event to AgentKit for processing
    Returns True if successful
    """
    try:
        print(f"Sending event {event.get('event_id')} to AgentKit...")
        r = requests.post(AGENT, json=event, timeout=30)
        r.raise_for_status()
        print(f"  ✓ AgentKit processed event {event.get('event_id')}")
        return True
    except Exception as e:
        print(f"  ✗ AgentKit error for event {event.get('event_id')}: {e}")
        return False


def send_to_dlq(event: dict, error: str = "") -> None:
    """
    Send failed event to dead letter queue
    """
    try:
        dlq_record = {
            "original_event": event,
            "error": error,
            "timestamp": time.time(),
        }
        payload = {
            "records": [
                {"key": event.get("project_id", "unknown"), "value": dlq_record}
            ]
        }
        requests.post(f"{PANDA}/topics/dlq", json=payload, timeout=5)
        print(f"  [WARN] Sent event {event.get('event_id')} to DLQ")
    except Exception as e:
        print(f"  ✗ Failed to send to DLQ: {e}")


def main():
    """Main consumer loop"""
    print("Starting Gateway Consumer...")
    print(f"  Redpanda: {PANDA}")
    print(f"  AgentKit: {AGENT}")
    print(f"  Consumer Group: {GROUP}")
    print(f"  Instance: {INSTANCE}")
    print()

    # Subscribe to topics
    topics = ["issues", "builds", "vendors"]
    base = subscribe(topics)

    print("\nPolling for events... (Ctrl+C to stop)\n")

    while True:
        try:
            records = poll(base)

            for rec in records:
                event = rec.get("value")
                if not event:
                    continue

                event_id = event.get("event_id", "unknown")
                event_type = event.get("type", "unknown")
                source = event.get("source", "unknown")

                print(f"\n[RECEIVED] {source}/{event_type} (ID: {event_id})")

                # Send to AgentKit
                success = send_to_agentkit(event)

                if not success:
                    # Send to DLQ on failure
                    send_to_dlq(event, "AgentKit processing failed")

            # Small delay between polls
            time.sleep(0.1)

        except KeyboardInterrupt:
            print("\n\nShutting down gracefully...")
            break
        except Exception as e:
            print(f"\n[ERROR] Unexpected error: {e}")
            time.sleep(5)  # Wait before retrying


if __name__ == "__main__":
    main()
