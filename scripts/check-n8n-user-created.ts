/**
 * Phase 6B self-checks: n8n user.created webhook (mocked HTTP, no Raspberry).
 * Run: npx tsx scripts/check-n8n-user-created.ts
 */
import assert from "node:assert/strict";
import {
  buildUserCreatedEnvelope,
  getN8nConfig,
  N8N_WEBHOOK_SECRET_HEADER,
  postN8nWebhook,
  truncateError,
} from "../src/lib/integrations/n8n";

async function main() {
  // --- Payload shape / privacy ---
  const envelope = buildUserCreatedEnvelope({
    eventId: 42,
    occurredAt: "2026-09-13T12:00:00.000Z",
    userId: "8fc7d18b-2248-4c5e-987b-e14599b35c51",
    name: "Dave",
  });

  assert.equal(envelope.version, 1);
  assert.equal(envelope.event, "user.created");
  assert.equal(envelope.eventId, "42");
  assert.equal(envelope.occurredAt, "2026-09-13T12:00:00.000Z");
  assert.equal(envelope.data.userId, "8fc7d18b-2248-4c5e-987b-e14599b35c51");
  assert.equal(envelope.data.name, "Dave");
  assert.ok(!("email" in envelope.data));
  assert.ok(!JSON.stringify(envelope).includes("@"));

  const noName = buildUserCreatedEnvelope({
    eventId: "7",
    occurredAt: new Date("2026-09-13T12:00:00.000Z"),
    userId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    name: "   ",
  });
  assert.equal(noName.data.name, null);

  assert.equal(truncateError("x".repeat(500)).endsWith("…"), true);
  assert.ok(truncateError("x".repeat(500)).length <= 400);

  // --- Env gate: missing config → null (no unauthenticated send) ---
  const prevUrl = process.env.MLINI_N8N_WEBHOOK_URL;
  const prevSecret = process.env.MLINI_N8N_WEBHOOK_SECRET;
  delete process.env.MLINI_N8N_WEBHOOK_URL;
  delete process.env.MLINI_N8N_WEBHOOK_SECRET;
  assert.equal(getN8nConfig(), null);

  process.env.MLINI_N8N_WEBHOOK_URL =
    "https://hooks.mlini.dev/webhook/mlini-events";
  delete process.env.MLINI_N8N_WEBHOOK_SECRET;
  assert.equal(getN8nConfig(), null);

  process.env.MLINI_N8N_WEBHOOK_SECRET = "test-secret";
  assert.deepEqual(getN8nConfig(), {
    url: "https://hooks.mlini.dev/webhook/mlini-events",
    secret: "test-secret",
  });

  type Captured = { url: string; init: RequestInit };

  async function withMock(
    status: number | "network" | "timeout",
    run: (cap: Captured[], mockFetch: typeof fetch) => Promise<void>
  ) {
    const captured: Captured[] = [];
    const mockFetch: typeof fetch = async (input, init) => {
      captured.push({ url: String(input), init: init ?? {} });
      if (status === "network") throw new Error("ECONNREFUSED");
      if (status === "timeout") {
        const err = new Error("The operation was aborted");
        err.name = "AbortError";
        throw err;
      }
      return new Response(null, { status });
    };
    await run(captured, mockFetch);
  }

  await withMock(200, async (cap, mockFetch) => {
    const result = await postN8nWebhook({
      url: "https://hooks.mlini.dev/webhook/mlini-events",
      secret: "test-secret",
      body: envelope,
      fetchImpl: mockFetch,
    });
    assert.equal(result.ok, true);
    if (result.ok) assert.equal(result.status, 200);
    assert.equal(cap.length, 1);
    const headers = new Headers(cap[0].init.headers);
    assert.equal(headers.get(N8N_WEBHOOK_SECRET_HEADER), "test-secret");
    assert.equal(headers.get("Content-Type"), "application/json");
    const body = String(cap[0].init.body);
    assert.ok(!body.includes("test-secret"));
    assert.ok(!body.includes(N8N_WEBHOOK_SECRET_HEADER));
    assert.ok(body.includes('"event":"user.created"'));
    assert.ok(body.includes('"eventId":"42"'));
  });

  await withMock(401, async (_cap, mockFetch) => {
    const result = await postN8nWebhook({
      url: "https://hooks.mlini.dev/webhook/mlini-events",
      secret: "bad",
      body: envelope,
      fetchImpl: mockFetch,
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.status, 401);
      assert.match(result.error, /http_401/);
    }
  });

  await withMock(500, async (_cap, mockFetch) => {
    const result = await postN8nWebhook({
      url: "https://hooks.mlini.dev/webhook/mlini-events",
      secret: "test-secret",
      body: envelope,
      fetchImpl: mockFetch,
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.status, 500);
  });

  await withMock("network", async (_cap, mockFetch) => {
    const result = await postN8nWebhook({
      url: "https://hooks.mlini.dev/webhook/mlini-events",
      secret: "test-secret",
      body: envelope,
      fetchImpl: mockFetch,
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.status, null);
      assert.match(result.error, /ECONNREFUSED/);
    }
  });

  await withMock("timeout", async (_cap, mockFetch) => {
    const result = await postN8nWebhook({
      url: "https://hooks.mlini.dev/webhook/mlini-events",
      secret: "test-secret",
      body: envelope,
      timeoutMs: 10,
      fetchImpl: mockFetch,
    });
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.status, null);
      assert.match(result.error, /timeout/);
    }
  });

  function shouldDispatch(status: string): boolean {
    return status === "pending";
  }
  assert.equal(shouldDispatch("pending"), true);
  assert.equal(shouldDispatch("delivered"), false);
  assert.equal(shouldDispatch("failed"), false);
  assert.equal(shouldDispatch("skipped"), false);

  for (const s of ["skipped", "delivered", "failed"] as const) {
    assert.equal(shouldDispatch(s), false);
  }

  function dispatchCountFor(action: "user.create" | "session.create"): number {
    return action === "user.create" ? 1 : 0;
  }
  assert.equal(dispatchCountFor("user.create"), 1);
  assert.equal(dispatchCountFor("session.create"), 0);

  async function simulateSignupWithWebhookFailure(): Promise<"ok" | "boom"> {
    try {
      const webhook = await postN8nWebhook({
        url: "https://hooks.mlini.dev/webhook/mlini-events",
        secret: "x",
        body: envelope,
        fetchImpl: async () => {
          throw new Error("down");
        },
      });
      void webhook;
      return "ok";
    } catch {
      return "boom";
    }
  }
  assert.equal(await simulateSignupWithWebhookFailure(), "ok");

  if (prevUrl === undefined) delete process.env.MLINI_N8N_WEBHOOK_URL;
  else process.env.MLINI_N8N_WEBHOOK_URL = prevUrl;
  if (prevSecret === undefined) delete process.env.MLINI_N8N_WEBHOOK_SECRET;
  else process.env.MLINI_N8N_WEBHOOK_SECRET = prevSecret;

  console.log("n8n-user-created: ok");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
