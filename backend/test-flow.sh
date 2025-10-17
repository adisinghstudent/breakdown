#!/bin/bash
# Test the complete event flow

set -e

echo "🧪 Testing Undergoing Project Event Flow"
echo "========================================"
echo ""

# Load environment
export $(grep -v '^#' backend/.env | xargs 2>/dev/null || true)
PANDA_PROXY=${PANDA_PROXY:-http://localhost:8082}

echo "Test 1: P0 Bug (should escalate to platform team)"
echo "---------------------------------------------------"
python3 backend/events/publish.py --topic issues --file backend/samples/issue_bug_p0.json
sleep 2

echo ""
echo "Test 2: Frontend Issue (should assign to Alice)"
echo "---------------------------------------------------"
python3 backend/events/publish.py --topic issues --file backend/samples/issue_frontend.json
sleep 2

echo ""
echo "Test 3: Overdue Jira Issue (should schedule unblocker)"
echo "---------------------------------------------------"
python3 backend/events/publish.py --topic issues --file backend/samples/issue_jira_overdue.json
sleep 2

echo ""
echo "Test 4: Documentation Issue (should send nudge)"
echo "---------------------------------------------------"
python3 backend/events/publish.py --topic issues --file backend/samples/issue_triage.json
sleep 2

echo ""
echo "✅ All test events published!"
echo ""
echo "Check the following to verify:"
echo "  1. Gateway logs:    tail -f logs/gateway.log"
echo "  2. AgentKit logs:   tail -f logs/agentkit.log"
echo "  3. Calendar logs:   tail -f logs/calendar.log"
echo ""
echo "Or consume from Redpanda topics:"
echo "  docker compose -f backend/docker/docker-compose.yml exec rpk rpk topic consume actions -n 4"
echo "  docker compose -f backend/docker/docker-compose.yml exec rpk rpk topic consume outcomes -n 4"
