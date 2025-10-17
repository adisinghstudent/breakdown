#!/bin/bash
# Stop all backend services

echo "🛑 Stopping Undergoing Project Agent Backend"
echo "============================================="
echo ""

# Stop Python services
if [ -f logs/calendar.pid ]; then
    echo "Stopping Calendar API..."
    kill $(cat logs/calendar.pid) 2>/dev/null || true
    rm logs/calendar.pid
fi

if [ -f logs/agentkit.pid ]; then
    echo "Stopping AgentKit Agent..."
    kill $(cat logs/agentkit.pid) 2>/dev/null || true
    rm logs/agentkit.pid
fi

if [ -f logs/github_webhook.pid ]; then
    echo "Stopping GitHub Webhook Receiver..."
    kill $(cat logs/github_webhook.pid) 2>/dev/null || true
    rm logs/github_webhook.pid
fi

if [ -f logs/gateway.pid ]; then
    echo "Stopping Gateway Consumer..."
    kill $(cat logs/gateway.pid) 2>/dev/null || true
    rm logs/gateway.pid
fi

# Stop Redpanda
echo "Stopping Redpanda..."
docker compose -f backend/docker/docker-compose.yml down

echo ""
echo "✅ All services stopped"
