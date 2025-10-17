export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { isRedpandaConfigured, sendToTopic } from "@/lib/redpanda";

type TelemetryEvent = {
  type: string;
  workflowId?: string;
  userId?: string;
  toolName?: string;
  data?: Record<string, unknown>;
  ts?: number;
};

function ok(payload: unknown, headers?: Record<string, string>): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { "Content-Type": "application/json", ...(headers || {}) },
  });
}

function badRequest(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status: 400,
    headers: { "Content-Type": "application/json" },
  });
}

export async function POST(req: Request): Promise<Response> {
  let body: TelemetryEvent | null = null;
  try {
    const text = await req.text();
    body = text ? (JSON.parse(text) as TelemetryEvent) : null;
  } catch {
    return badRequest({ error: "Invalid JSON" });
  }

  if (!body || !body.type) {
    return badRequest({ error: "Missing event type" });
  }

  // No-op gracefully if not configured
  if (!isRedpandaConfigured()) {
    return ok({ status: "disabled" });
  }

  const topic = process.env.REDPANDA_TELEMETRY_TOPIC || "chatkit_telemetry";
  const ts = body.ts || Date.now();
  const cookieHeader = req.headers.get("cookie") || "";
  const cookieUserId = getCookieValue(cookieHeader, "chatkit_session_id");
  const userId = body.userId || cookieUserId || undefined;

  try {
    await sendToTopic(topic, [
      {
        key: userId ? String(userId) : undefined,
        value: JSON.stringify({ ...body, ts, userId }),
        timestamp: String(ts),
      },
    ]);
    return ok({ status: "ok" });
  } catch (err) {
    console.error("Telemetry produce error", err);
    return new Response(JSON.stringify({ error: "Produce failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function GET(): Promise<Response> {
  return badRequest({ error: "Method Not Allowed" });
}

function getCookieValue(cookieHeader: string, name: string): string | null {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(";");
  for (const cookie of cookies) {
    const [rawName, ...rest] = cookie.split("=");
    if (!rawName || rest.length === 0) continue;
    if (rawName.trim() === name) return decodeURIComponent(rest.join("=").trim());
  }
  return null;
}
