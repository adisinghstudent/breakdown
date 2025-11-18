# Breakdown

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
![NextJS](https://img.shields.io/badge/Built_with-NextJS-blue)
![OpenAI API](https://img.shields.io/badge/Powered_by-OpenAI_API-orange)

AI-powered project coordination system with Next.js ChatKit interface and event-driven backend agent for automated GitHub/Jira issue management.

## Frontend: ChatKit Interface

### Features

- Next.js application with ChatKit web component
- Session management via `/api/create-session`
- Configurable prompts, themes, and UI elements
- Optional Redpanda telemetry integration

### Setup

```bash
npm install
cp .env.example .env.local
```

Configure `.env.local`:
- `OPENAI_API_KEY` - API key from same org/project as Agent Builder
- `NEXT_PUBLIC_CHATKIT_WORKFLOW_ID` - Workflow ID starting with `wf_`
- `CHATKIT_API_BASE` - (Optional) Custom API endpoint

Start development server:
```bash
npm run dev
```

Access at `http://localhost:3000`. Customize in `lib/config.ts` and `components/ChatKitPanel.tsx`.

### Deployment

```bash
npm run build
```

Add deployment domain to [Domain allowlist](https://platform.openai.com/settings/organization/security/domain-allowlist).

### Redpanda Telemetry (Optional)

Install KafkaJS:
```bash
npm i kafkajs
```

Configure in `.env.local`:
- `REDPANDA_BROKERS` - Broker list
- `REDPANDA_SASL_USERNAME` / `REDPANDA_SASL_PASSWORD` - Credentials
- `REDPANDA_SASL_MECHANISM` - `scram-sha-256` or `scram-sha-512`
- `REDPANDA_CA_CERT` - PEM certificate
- `REDPANDA_TELEMETRY_TOPIC` - Topic name (default: `chatkit_telemetry`)

Test telemetry:
```bash
curl -s http://localhost:3000/api/telemetry \
  -H 'content-type: application/json' \
  -d '{"type":"smoke_test","data":{"hello":"world"}}'
```

---

## Backend: Reactive Project Agent

Event-driven agent system for automated project coordination via GitHub/Jira webhooks.

### Architecture

```
GitHub/Jira → Redpanda (issues) → Gateway → AgentKit → Actions
                                                ↓
                                    Calendar/Notifications
                                                ↓
                                    Redpanda (actions/outcomes)
```

### Agent Capabilities

- Monitors GitHub/Jira issue events
- Applies policy-based routing:
  - P0 bugs escalate to platform team
  - Frontend issues assign to specialists
  - Overdue tasks schedule unblocker meetings
  - New issues send triage nudges
- Records actions and outcomes for observability

### Directory Structure

```
backend/
├── webhooks/    # GitHub/Jira receivers
├── gateway/     # Event consumer
├── agentkit/    # Mock agent implementation
├── calendar/    # Mock calendar/notification API
├── events/      # Test event publisher
├── samples/     # Sample event files
└── docker/      # Redpanda Docker Compose
```

### Quick Start

Install dependencies:
```bash
pip install -r backend/requirements.txt
```

Configure environment:
```bash
cp backend/.env.example backend/.env
```

Required variables:
- `PANDA_PROXY` - Redpanda Pandaproxy URL
- `AGENTKIT_URL` - AgentKit endpoint
- `CALENDAR_API_BASE` - Calendar service URL
- `GITHUB_WEBHOOK_SECRET` - Webhook secret

Start all services:
```bash
bash backend/start-all.sh
```

Services started:
- Mock Calendar API (port 7300)
- Mock AgentKit Agent (port 8000)
- GitHub Webhook Receiver (port 7000)
- Gateway Consumer (background)
- Redpanda (ports 8082, 19092)

Test event flow:
```bash
bash backend/test-flow.sh
```

Monitor logs:
```bash
tail -f logs/gateway.log
tail -f logs/agentkit.log
tail -f logs/calendar.log
```

Monitor Redpanda topics:
```bash
docker compose -f backend/docker/docker-compose.yml exec rpk rpk topic consume actions -n 10
docker compose -f backend/docker/docker-compose.yml exec rpk rpk topic consume outcomes -n 10
```

Stop services:
```bash
bash backend/stop-all.sh
```

### Manual Testing

Publish event:
```bash
python3 backend/events/publish.py --topic issues --file backend/samples/issue_bug_p0.json
```

Test webhook:
```bash
curl -X POST http://localhost:7000/github/issues \
  -H "X-GitHub-Event: issues" \
  -H "X-GitHub-Delivery: test-123" \
  -H "Content-Type: application/json" \
  -d @backend/samples/issue_bug_p0.json
```

### Message Schemas

**Issues Topic:**
```json
{
  "event_id": "unique-id",
  "project_id": "alpha",
  "source": "github|jira",
  "type": "issue_opened|issue_created|issue_updated",
  "repo": "org/repo",
  "issue_number": 123,
  "title": "Bug description",
  "url": "https://...",
  "labels": ["bug", "p0"],
  "assignee": "username",
  "priority": "P0|Highest",
  "status": "Open",
  "created_at": "2025-10-17T19:22:11Z"
}
```

**Actions Topic:**
```json
{
  "event_id": "a-timestamp",
  "project_id": "alpha",
  "action": "assign_owner|post_nudge|schedule_unblocker|escalate_owner",
  "target": "owner:alice|team:platform",
  "rationale": "Reason for action",
  "source_ref": "https://github.com/org/repo/issues/123"
}
```

**Outcomes Topic:**
```json
{
  "event_id": "o-timestamp",
  "project_id": "alpha",
  "risk_delta": -0.2,
  "ack": true
}
```

### Integration

Frontend and backend share the same Redpanda cluster:
- Frontend uses `chatkit_telemetry` topic
- Backend uses `issues`, `actions`, `outcomes` topics

### Redpanda Cloud

Update `backend/.env`:
```bash
PANDA_CLOUD_BROKERS="cluster.cloud.redpanda.com:9092"
PANDA_CLOUD_USERNAME="username"
PANDA_CLOUD_PASSWORD="password"
```

Modify `backend/gateway/consumer.py` and webhook receivers to use KafkaJS instead of Pandaproxy REST API.

### Customization

Edit `backend/agentkit/mock_agent.py` function `apply_undergoing_policy()` to modify:
- Escalation vs assignment logic
- Team member routing by label
- Notification thresholds
- Meeting durations

Replace mock agent with production AgentKit by updating `AGENTKIT_URL` in `backend/.env`.

### Troubleshooting

Check Redpanda logs:
```bash
docker compose -f backend/docker/docker-compose.yml logs redpanda
```

Verify topics:
```bash
docker compose -f backend/docker/docker-compose.yml exec rpk rpk topic list
```

Check consumer lag:
```bash
docker compose -f backend/docker/docker-compose.yml exec rpk rpk group describe agent-gw
```

Verify webhook secret in `backend/.env` matches GitHub configuration.

---

## References

- [ChatKit JavaScript Library](http://openai.github.io/chatkit-js/)
- [Redpanda Documentation](https://docs.redpanda.com/)
- [AgentKit Documentation](https://github.com/BCG-X-Official/agentkit)
