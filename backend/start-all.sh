#!/bin/bash
# Start all backend services for Undergoing Project agent

set -e

echo "🚀 Starting Undergoing Project Agent Backend"
echo "============================================="
echo ""

# Check if .env exists
if [ ! -f backend/.env ]; then
    echo "⚠️  No .env file found. Copying from .env.example..."
    cp backend/.env.example backend/.env
    echo "   Please edit backend/.env with your configuration"
    echo ""
fi

# Load environment
export $(grep -v '^#' backend/.env | xargs)

# Start Redpanda
echo "1️⃣  Starting Redpanda..."
docker compose -f backend/docker/docker-compose.yml up -d
echo "   Waiting for Redpanda to be ready..."
sleep 5

# Create topics
echo ""
echo "2️⃣  Creating Redpanda topics..."
bash backend/docker/setup-topics.sh

# Start services in background
echo ""
echo "3️⃣  Starting backend services..."

# Calendar API
echo "   Starting Mock Calendar API (port 7300)..."
python3 backend/calendar/mock_api.py > logs/calendar.log 2>&1 &
echo $! > logs/calendar.pid

# AgentKit Mock
echo "   Starting Mock AgentKit Agent (port 8000)..."
python3 backend/agentkit/mock_agent.py > logs/agentkit.log 2>&1 &
echo $! > logs/agentkit.pid

# GitHub Webhook Receiver
echo "   Starting GitHub Webhook Receiver (port 7000)..."
python3 backend/webhooks/github_issues.py > logs/github_webhook.log 2>&1 &
echo $! > logs/github_webhook.pid

# Gateway Consumer
echo "   Starting Gateway Consumer..."
python3 backend/gateway/consumer.py > logs/gateway.log 2>&1 &
echo $! > logs/gateway.pid

sleep 2

echo ""
echo "✅ All services started!"
echo ""
echo "Service Status:"
echo "  - Redpanda Proxy:       http://localhost:8082"
echo "  - Calendar API:         http://localhost:7300"
echo "  - AgentKit Agent:       http://localhost:8000"
echo "  - GitHub Webhook:       http://localhost:7000"
echo "  - Gateway Consumer:     Running"
echo ""
echo "Logs are in the logs/ directory"
echo "To stop all services: bash backend/stop-all.sh"
echo ""
