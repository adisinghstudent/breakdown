let _producer: any = null;
let _kafka: any = null;

function readCaCert(): string[] | undefined {
  const pem = process.env.REDPANDA_CA_CERT?.trim();
  if (pem) return [pem];
  const b64 = process.env.REDPANDA_CA_CERT_BASE64?.trim();
  if (b64) {
    try {
      const decoded = Buffer.from(b64, "base64").toString("utf-8");
      if (decoded) return [decoded];
    } catch {
      // ignore
    }
  }
  return undefined;
}

export function isRedpandaConfigured(): boolean {
  return Boolean(
    process.env.REDPANDA_BROKERS &&
      process.env.REDPANDA_SASL_USERNAME &&
      process.env.REDPANDA_SASL_PASSWORD
  );
}

export async function getProducer(): Promise<any> {
  if (_producer) return _producer;

  const { Kafka, logLevel } = await import("kafkajs");

  const brokers = (process.env.REDPANDA_BROKERS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (!brokers.length) {
    throw new Error("REDPANDA_BROKERS is not set");
  }

  const sslCa = readCaCert();
  const sasl = {
    mechanism: (process.env.REDPANDA_SASL_MECHANISM || "scram-sha-256") as
      | "scram-sha-256"
      | "scram-sha-512",
    username: process.env.REDPANDA_SASL_USERNAME || "",
    password: process.env.REDPANDA_SASL_PASSWORD || "",
  } as const;

  _kafka = new Kafka({
    clientId: process.env.REDPANDA_CLIENT_ID || "chatkit-app",
    brokers,
    ssl: sslCa ? { ca: sslCa } : true,
    sasl,
    logLevel: logLevel.NOTHING,
  });

  _producer = _kafka.producer({ allowAutoTopicCreation: false });
  await _producer.connect();
  return _producer;
}

export async function sendToTopic(
  topic: string,
  messages: Array<{ key?: string; value: string; timestamp?: string }>
): Promise<void> {
  const producer = await getProducer();
  await producer.send({ topic, messages });
}

export async function disconnectProducer(): Promise<void> {
  if (_producer) {
    try {
      await _producer.disconnect();
    } catch {
      // ignore
    } finally {
      _producer = null;
    }
  }
}
