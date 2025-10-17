# Undergoing Project Agent - Quick Start

## TL;DR - Get Running in 2 Minutes

```bash
# 1. Install dependencies
pip install -r backend/requirements.txt

# 2. Start everything
bash backend/start-all.sh

# 3. Test the flow
bash backend/test-flow.sh

# 4. Watch it work
tail -f logs/gateway.log
```

## What Just Happened?

You started an intelligent project coordination agent that:
1. Receives issue events (GitHub/Jira)
2. Decides what action to take based on policies
3. Executes actions (assigns owners, schedules meetings, sends nudges)
4. Records everything to Redpanda for observability

## Service Endpoints

| Service | URL | Purpose |
|---------|-----|---------|
| Redpanda Proxy | http://localhost:8082 | Message broker REST API |
| AgentKit Agent | http://localhost:8000 | Mock agent (replace with real) |
| Calendar API | http://localhost:7300 | Mock calendar service |
| GitHub Webhook | http://localhost:7000 | Receives GitHub webhooks |

## Event Flow

```
1. Issue opened on GitHub
   ↓
2. Webhook → backend/webhooks/github_issues.py
   ↓
3. Publish to Redpanda 'issues' topic
   ↓
4. Gateway consumer polls topic
   ↓
5. Send event to AgentKit agent
   ↓
6. Agent applies policy & decides action
   ↓
7. Execute action (calendar/notification API)
   ↓
8. Record action + outcome to Redpanda
```

## Agent Policies (Customizable)

| Condition | Action | Target |
|-----------|--------|--------|
| `bug` + `p0` labels | escalate_owner | team:platform |
| `frontend` label | assign_owner | owner:alice |
| Overdue/due today | schedule_unblocker | assignee (15min) |
| Default | post_nudge | team:triage |

Edit policies in: `backend/agentkit/mock_agent.py` → `apply_undergoing_policy()`

## Testing Commands

### Publish test events
```bash
# High priority bug
python3 backend/events/publish.py --topic issues --file backend/samples/issue_bug_p0.json

# Frontend issue
python3 backend/events/publish.py --topic issues --file backend/samples/issue_frontend.json

# Overdue Jira issue
python3 backend/events/publish.py --topic issues --file backend/samples/issue_jira_overdue.json
```

### Check Redpanda topics
```bash
# List all topics
docker compose -f backend/docker/docker-compose.yml exec rpk rpk topic list

# Consume actions
docker compose -f backend/docker/docker-compose.yml exec rpk rpk topic consume actions -n 10

# Consume outcomes
docker compose -f backend/docker/docker-compose.yml exec rpk rpk topic consume outcomes -n 10

# Check consumer lag
docker compose -f backend/docker/docker-compose.yml exec rpk rpk group describe agent-gw
```

### Monitor logs
```bash
# All services
ls -lh logs/

# Gateway (event processing)
tail -f logs/gateway.log

# Agent (decision making)
tail -f logs/agentkit.log

# Calendar (action execution)
tail -f logs/calendar.log
```

## Configuration

Edit `backend/.env`:

```bash
# Required for production
AGENTKIT_URL="https://your-agentkit-endpoint/run"
GITHUB_WEBHOOK_SECRET="your-github-webhook-secret"

# Optional
CALENDAR_API_BASE="https://your-calendar-api"
PROJECT_ID="your-project-id"
```

## Stop Everything

```bash
bash backend/stop-all.sh
```

## Troubleshooting

### Redpanda not starting
```bash
docker compose -f backend/docker/docker-compose.yml logs redpanda
```

### No events being processed
```bash
# Check if topics exist
docker compose -f backend/docker/docker-compose.yml exec rpk rpk topic list

# Check gateway is running
ps aux | grep consumer.py

# Restart gateway
kill $(cat logs/gateway.pid) && python3 backend/gateway/consumer.py &
```

### Services not starting
```bash
# Check Python version (need 3.10+)
python3 --version

# Check dependencies
pip list | grep -E "fastapi|requests|uvicorn"

# Check ports are available
lsof -i :7000,7300,8000,8082
```

## Next Steps

1. **Connect real GitHub webhook**: Expose port 7000 via ngrok/localhost.run
2. **Replace mock agent**: Point `AGENTKIT_URL` to your real AgentKit deployment
3. **Integrate real calendar**: Update `CALENDAR_API_BASE` to Google/Microsoft API
4. **Add more policies**: Edit `apply_undergoing_policy()` in `mock_agent.py`
5. **Deploy**: Run services as systemd units or in containers

## Architecture Diagram

```
┌─────────────┐
│   GitHub    │
│  Webhooks   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│ GitHub Webhook  │◄─── Port 7000
│    Receiver     │
└────────┬────────┘
         │
         ▼
    ┌────────────┐
    │  Redpanda  │◄─── Ports 8082, 19092
    │  (issues)  │
    └──────┬─────┘
           │
           ▼
    ┌──────────────┐
    │   Gateway    │
    │   Consumer   │
    └──────┬───────┘
           │
           ▼
    ┌──────────────┐
    │  AgentKit    │◄─── Port 8000 (mock)
    │    Agent     │
    └──────┬───────┘
           │
           ├──────────────┐
           ▼              ▼
    ┌──────────┐   ┌──────────┐
    │ Calendar │   │ Redpanda │
    │   API    │   │(actions) │
    │          │   │(outcomes)│
    └──────────┘   └──────────┘
       Port            Topics
       7300
```

## File Reference

| File | Purpose |
|------|---------|
| `backend/webhooks/github_issues.py` | GitHub webhook → Redpanda |
| `backend/webhooks/jira_issues.py` | Jira webhook → Redpanda |
| `backend/gateway/consumer.py` | Polls Redpanda → AgentKit |
| `backend/agentkit/mock_agent.py` | Policy engine + action execution |
| `backend/calendar/mock_api.py` | Mock calendar/notification service |
| `backend/events/publish.py` | CLI to publish test events |
| `backend/start-all.sh` | Start all services |
| `backend/stop-all.sh` | Stop all services |
| `backend/test-flow.sh` | Run end-to-end test |

## Sample Events

Located in `backend/samples/`:
- `issue_bug_p0.json` - High priority bug (escalation policy)
- `issue_frontend.json` - Frontend issue (assignment policy)
- `issue_jira_overdue.json` - Overdue task (unblocker policy)
- `issue_triage.json` - Regular issue (nudge policy)

---

**Questions?** Check the main [README.md](../README.md) for detailed documentation.
