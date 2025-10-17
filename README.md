# ChatKit Starter Template

[![MIT License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
![NextJS](https://img.shields.io/badge/Built_with-NextJS-blue)
![OpenAI API](https://img.shields.io/badge/Powered_by-OpenAI_API-orange)

This repository is the simplest way to bootstrap a [ChatKit](http://openai.github.io/chatkit-js/) application. It ships with a minimal Next.js UI, the ChatKit web component, and a ready-to-use session endpoint so you can experiment with OpenAI-hosted workflows built using [Agent Builder](https://platform.openai.com/agent-builder).

## What You Get

- Next.js app with `<openai-chatkit>` web component and theming controls
- API endpoint for creating a session at [`app/api/create-session/route.ts`](app/api/create-session/route.ts)
- Config file for starter prompts, theme, placeholder text, and greeting message

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Create your environment file

Copy the example file and fill in the required values:

```bash
cp .env.example .env.local
```

You can get your workflow id from the [Agent Builder](https://platform.openai.com/agent-builder) interface, after clicking "Publish":

<img src="./public/docs/workflow.jpg" width=500 />

You can get your OpenAI API key from the [OpenAI API Keys](https://platform.openai.com/api-keys) page.

### 3. Configure ChatKit credentials

Update `.env.local` with the variables that match your setup.

- `OPENAI_API_KEY` — This must be an API key created **within the same org & project as your Agent Builder**. If you already have a different `OPENAI_API_KEY` env variable set in your terminal session, that one will take precedence over the key in `.env.local` one (this is how a Next.js app works). So, **please run `unset OPENAI_API_KEY` (`set OPENAI_API_KEY=` for Windows OS) beforehand**.
- `NEXT_PUBLIC_CHATKIT_WORKFLOW_ID` — This is the ID of the workflow you created in [Agent Builder](https://platform.openai.com/agent-builder), which starts with `wf_...`
- (optional) `CHATKIT_API_BASE` - This is a customizable base URL for the ChatKit API endpoint

> Note: if your workflow is using a model requiring organization verification, such as GPT-5, make sure you verify your organization first. Visit your [organization settings](https://platform.openai.com/settings/organization/general) and click on "Verify Organization".

### 4. Run the app

```bash
npm run dev
```

Visit `http://localhost:3000` and start chatting. Use the prompts on the start screen to verify your workflow connection, then customize the UI or prompt list in [`lib/config.ts`](lib/config.ts) and [`components/ChatKitPanel.tsx`](components/ChatKitPanel.tsx).

### 5. Deploy your app

```bash
npm run build
```

Before deploying your app, you need to verify the domain by adding it to the [Domain allowlist](https://platform.openai.com/settings/organization/security/domain-allowlist) on your dashboard.

## Customization Tips

- Adjust starter prompts, greeting text, [chatkit theme](https://chatkit.studio/playground), and placeholder copy in [`lib/config.ts`](lib/config.ts).
- Update the event handlers inside [`components/.tsx`](components/ChatKitPanel.tsx) to integrate with your product analytics or storage.

## Optional: Redpanda Telemetry

This starter can emit chat telemetry (response start/end, tool calls, thread changes, and widget errors) to a Redpanda/Kafka topic using `kafkajs`.

1) Install the dependency:

```bash
npm i kafkajs
```

2) Configure environment variables in `.env.local` (see `.env.example` for all options):

- `REDPANDA_BROKERS` — Comma-separated broker list from your Redpanda Cloud cluster overview.
- `REDPANDA_SASL_USERNAME` / `REDPANDA_SASL_PASSWORD` — API key and secret.
- `REDPANDA_SASL_MECHANISM` — `scram-sha-256` (default) or `scram-sha-512`.
- `REDPANDA_CA_CERT` — Paste the PEM CA certificate content, or use `REDPANDA_CA_CERT_BASE64`.
- `REDPANDA_TELEMETRY_TOPIC` — Defaults to `chatkit_telemetry`.

3) Run the app and interact with the chat. The client sends events to `POST /api/telemetry`, and the server publishes them to your topic. If Redpanda env vars are not set, the endpoint no-ops and returns `{ status: "disabled" }`.

4) Quick test without the UI:

```bash
curl -s http://localhost:3000/api/telemetry \
  -H 'content-type: application/json' \
  -d '{"type":"smoke_test","data":{"hello":"world"}}'
```

Messages include: `type`, `workflowId`, `userId` (from the session cookie), `data`, and `ts`.

---

## Undergoing Project Agent Backend

This project includes a Python-based **Undergoing Project Agent** that provides real-time reactive coordination for ongoing software projects. The agent monitors GitHub/Jira issues, applies intelligent policies, and takes automated actions.

### Architecture

```
GitHub/Jira Webhooks → Redpanda (issues topic) → Gateway Consumer → AgentKit Agent
                                                                          ↓
                                                        Actions (assign, nudge, schedule)
                                                                          ↓
                                                  Calendar/Notification APIs + Redpanda (actions/outcomes topics)
```

### What the Agent Does

The Undergoing Project agent automatically:
- **Monitors** issue events from GitHub and Jira
- **Applies policies** to determine appropriate actions:
  - High-priority bugs (P0) → escalate to platform team
  - Frontend issues → assign to specialists
  - Overdue tasks → schedule unblocker meetings
  - New issues → send triage nudges
- **Takes actions** via calendar and notification APIs
- **Records outcomes** to Redpanda for observability

### Backend Directory Structure

```
backend/
├── webhooks/           # GitHub/Jira webhook receivers
├── gateway/            # Consumer that processes events
├── agentkit/           # AgentKit integration + mock agent
├── calendar/           # Mock calendar/notification API
├── events/             # Event publisher CLI for testing
├── samples/            # Sample event JSON files
└── docker/             # Redpanda Docker Compose setup
```

### Quick Start

#### 1. Install Python Dependencies

```bash
pip install -r backend/requirements.txt
```

#### 2. Configure Environment

```bash
cp backend/.env.example backend/.env
# Edit backend/.env with your configuration
```

Key variables:
- `PANDA_PROXY` - Redpanda Pandaproxy URL (default: http://localhost:8082)
- `AGENTKIT_URL` - Your AgentKit agent endpoint
- `CALENDAR_API_BASE` - Calendar service URL
- `GITHUB_WEBHOOK_SECRET` - GitHub webhook secret

#### 3. Start All Services

```bash
bash backend/start-all.sh
```

This will:
1. Start local Redpanda via Docker Compose
2. Create required topics (issues, builds, vendors, actions, outcomes, dlq)
3. Launch all backend services:
   - Mock Calendar API (port 7300)
   - Mock AgentKit Agent (port 8000)
   - GitHub Webhook Receiver (port 7000)
   - Gateway Consumer (background)

#### 4. Test the Event Flow

```bash
bash backend/test-flow.sh
```

This publishes sample events and demonstrates:
- P0 bug → escalation to platform team
- Frontend issue → assignment to Alice
- Overdue Jira issue → unblocker meeting scheduled
- Documentation issue → triage nudge sent

#### 5. Monitor Activity

Check logs:
```bash
tail -f logs/gateway.log    # Gateway consumer processing
tail -f logs/agentkit.log   # Agent decisions and actions
tail -f logs/calendar.log   # Calendar API calls
```

Or consume from Redpanda topics:
```bash
# View actions taken by the agent
docker compose -f backend/docker/docker-compose.yml exec rpk rpk topic consume actions -n 10

# View outcomes and risk deltas
docker compose -f backend/docker/docker-compose.yml exec rpk rpk topic consume outcomes -n 10
```

#### 6. Stop All Services

```bash
bash backend/stop-all.sh
```

### Manual Testing

Publish individual events:
```bash
python3 backend/events/publish.py --topic issues --file backend/samples/issue_bug_p0.json
```

Test webhook endpoint:
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
  "title": "Bug: login fails",
  "url": "https://...",
  "labels": ["bug", "p0"],
  "assignee": "alice",
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
  "rationale": "High priority bug requires immediate attention",
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

### Integration with ChatKit Frontend

The backend agent works alongside your ChatKit chat interface:

1. **Chat Interface** (`localhost:3000`) - For conversational interactions with your agent
2. **Backend Agent** - For automated reactive coordination of ongoing work

Both can share the same Redpanda cluster. The chat interface uses the `chatkit_telemetry` topic, while the backend agent uses `issues`, `actions`, and `outcomes` topics.

### Connecting to Redpanda Cloud

To use your existing Redpanda Cloud cluster instead of local Docker:

1. Update `backend/.env`:
```bash
PANDA_CLOUD_BROKERS="your-cluster.cloud.redpanda.com:9092"
PANDA_CLOUD_USERNAME="your-username"
PANDA_CLOUD_PASSWORD="your-password"
```

2. Modify `backend/gateway/consumer.py` and webhook receivers to use KafkaJS client instead of Pandaproxy REST API.

### Customizing Agent Policies

Edit `backend/agentkit/mock_agent.py` function `apply_undergoing_policy()` to customize:
- When to escalate vs assign
- Which team members handle which labels
- Notification thresholds
- Calendar meeting durations

For production, replace the mock agent with your real AgentKit endpoint by updating `AGENTKIT_URL` in `backend/.env`.

### Troubleshooting

**Redpanda not starting:**
```bash
docker compose -f backend/docker/docker-compose.yml logs redpanda
```

**Consumer not receiving messages:**
```bash
# Check topic exists
docker compose -f backend/docker/docker-compose.yml exec rpk rpk topic list

# Check consumer lag
docker compose -f backend/docker/docker-compose.yml exec rpk rpk group describe agent-gw
```

**Webhook signature failures:**
Ensure `GITHUB_WEBHOOK_SECRET` in `backend/.env` matches your GitHub webhook configuration.

---

## References

- [ChatKit JavaScript Library](http://openai.github.io/chatkit-js/)
- [Advanced Self-Hosting Examples](https://github.com/openai/openai-chatkit-advanced-samples)
- [Redpanda Documentation](https://docs.redpanda.com/)
- [AgentKit Documentation](https://github.com/BCG-X-Official/agentkit)
