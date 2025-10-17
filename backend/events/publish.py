#!/usr/bin/env python3
"""
Event Publisher CLI
Publish sample events to Redpanda topics for testing
"""
import argparse
import json
import os
import sys
import requests
from dotenv import load_dotenv

load_dotenv()

PANDA = os.getenv("PANDA_PROXY", "http://localhost:8082")


def publish_event(topic: str, key: str, value: dict) -> None:
    """Publish an event to Redpanda via Pandaproxy"""
    payload = {"records": [{"key": key, "value": value}]}
    headers = {"Content-Type": "application/vnd.kafka.json.v2+json"}
    try:
        r = requests.post(f"{PANDA}/topics/{topic}", json=payload, headers=headers, timeout=5)
        r.raise_for_status()
        print(f"✓ Published to '{topic}' with key '{key}'")
        print(f"  Event ID: {value.get('event_id', 'N/A')}")
    except Exception as e:
        print(f"✗ Failed to publish: {e}")
        sys.exit(1)


def main():
    parser = argparse.ArgumentParser(description="Publish events to Redpanda")
    parser.add_argument("--topic", required=True, help="Topic to publish to (issues, builds, vendors)")
    parser.add_argument("--file", help="JSON file containing event data")
    parser.add_argument("--key", help="Partition key (defaults to project_id from event)")
    parser.add_argument("--inline", help="Inline JSON event data")

    args = parser.parse_args()

    # Load event data
    if args.file:
        with open(args.file, "r") as f:
            event = json.load(f)
    elif args.inline:
        event = json.loads(args.inline)
    else:
        print("Error: Must provide --file or --inline")
        sys.exit(1)

    # Determine partition key
    key = args.key or event.get("project_id", "alpha")

    print(f"\nPublishing to Redpanda:")
    print(f"  Proxy: {PANDA}")
    print(f"  Topic: {args.topic}")
    print(f"  Key: {key}")
    print(f"  Event: {json.dumps(event, indent=2)[:200]}...")
    print()

    # Publish
    publish_event(args.topic, key, event)


if __name__ == "__main__":
    main()
