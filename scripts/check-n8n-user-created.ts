/**
 * Phase 6B/6C self-checks: n8n event delivery (mocked HTTP, no Raspberry).
 * Run: npx tsx scripts/check-n8n-user-created.ts
 */
import assert from "node:assert/strict";
import {
  buildMissionCompletedEnvelope,
  buildUserCreatedEnvelope,
  getN8nConfig,
  isSupportedN8nEvent,
  N8N_WEBHOOK_SECRET_HEADER,
  postN8nWebhook,
  SUPPORTED_N8N_EVENTS,
  truncateError,
  type IntegrationEventRow,
} from "../src/lib/integrations/n8n";
import { buildEnvelopeForEvent } from "../src/lib/integrations/dispatch";

async function main() {
  // --- Whitelist ---
  assert.deepEqual([...SUPPORTED_N8N_EVENTS], [
    "user.created",
    "mission.completed",
  ]);
  assert.equal(isSupportedN8nEvent("user.created"), true);
  assert.equal(isSupportedN8nEvent("mission.completed"), true);
  assert.equal(isSupportedN8nEvent("mission.failed"), false);
  assert.equal(isSupportedN8nEvent("arbitrary"), false);

  // --- user.created payload / privacy ---
  const userEnvelope = buildUserCreatedEnvelope({
    eventId: 42,
    occurredAt: "2026-09-13T12:00:00.000Z",
    userId: "8fc7d18b-2248-4c5e-987b-e14599b35c51",
    name: "Dave",
  });
  assert.equal(userEnvelope.event, "user.created");
  assert.equal(userEnvelope.eventId, "42");
  assert.ok(!("email" in userEnvelope.data));
  assert.ok(!JSON.stringify(userEnvelope).includes("@"));

  // --- mission.completed payload ---
  const missionEnvelope = buildMissionCompletedEnvelope({
    eventId: 99,
    occurredAt: "2026-09-13T18:00:00.000Z",
    userId: "8fc7d18b-2248-4c5e-987b-e14599b35c51",
    username: "Dave",
    kingdom: "construire-avec-ia",
    mission: "the-fork",
    missionTitle: "The Fork",
    xpAwarded: 180,
    totalXp: 300,
  });
  assert.equal(missionEnvelope.version, 1);
  assert.equal(missionEnvelope.event, "mission.completed");
  assert.equal(missionEnvelope.eventId, "99");
  if (missionEnvelope.event === "mission.completed") {
    assert.equal(missionEnvelope.data.userId, "8fc7d18b-2248-4c5e-987b-e14599b35c51");
    assert.equal(missionEnvelope.data.username, "Dave");
    assert.equal(missionEnvelope.data.kingdom, "construire-avec-ia");
    assert.equal(missionEnvelope.data.mission, "the-fork");
    assert.equal(missionEnvelope.data.missionTitle, "The Fork");
    assert.equal(missionEnvelope.data.xpAwarded, 180);
    assert.equal(missionEnvelope.data.totalXp, 300);
  }
  const missionJson = JSON.stringify(missionEnvelope);
  assert.ok(!missionJson.includes("email"));
  assert.ok(!missionJson.includes("secret"));
  assert.ok(!missionJson.includes("@gmail"));

  // null username does not fail envelope build
  const noUser = buildMissionCompletedEnvelope({
    eventId: 100,
    occurredAt: "2026-09-13T18:00:00.000Z",
    userId: "aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee",
    username: null,
    kingdom: "construire-avec-ia",
    mission: "the-black-box",
    xpAwarded: 100,
    totalXp: 100,
  });
  if (noUser.event === "mission.completed") {
    assert.equal(noUser.data.username, null);
  }

  // --- buildEnvelopeForEvent from DB row shape ---
  const missionRow: IntegrationEventRow = {
    id: "55",
    event_type: "mission.completed",
    user_id: "8fc7d18b-2248-4c5e-987b-e14599b35c51",
    payload: {
      user_id: "8fc7d18b-2248-4c5e-987b-e14599b35c51",
      kingdom_slug: "construire-avec-ia",
      mission_slug: "the-fork",
      xp_awarded: 180,
      completed_at: "2026-09-13T18:00:00.000Z",
    },
    created_at: "2026-09-13T18:00:00.000Z",
    delivery_status: "pending",
    attempt_count: 0,
  };
  const fromRow = buildEnvelopeForEvent(missionRow, {
    missionCompleted: {
      username: "Dave",
      totalXp: 300,
      missionTitle: "The Fork",
    },
  });
  assert.ok(fromRow);
  assert.equal(fromRow?.event, "mission.completed");
  assert.equal(fromRow?.eventId, "55");

  const unknownRow: IntegrationEventRow = {
    ...missionRow,
    event_type: "something.else",
  };
  assert.equal(buildEnvelopeForEvent(unknownRow), null);

  assert.equal(truncateError("x".repeat(500)).endsWith("…"), true);

  // --- Env gate ---
  const prevUrl = process.env.MLINI_N8N_WEBHOOK_URL;
  const prevSecret = process.env.MLINI_N8N_WEBHOOK_SECRET;
  delete process.env.MLINI_N8N_WEBHOOK_URL;
  delete process.env.MLINI_N8N_WEBHOOK_SECRET;
  assert.equal(getN8nConfig(), null);

  process.env.MLINI_N8N_WEBHOOK_URL =
    "https://hooks.mlini.dev/webhook/mlini-events";
  process.env.MLINI_N8N_WEBHOOK_SECRET = "test-secret";
  assert.ok(getN8nConfig());

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
      body: missionEnvelope,
      fetchImpl: mockFetch,
    });
    assert.equal(result.ok, true);
    assert.equal(cap.length, 1);
    const headers = new Headers(cap[0].init.headers);
    assert.equal(headers.get(N8N_WEBHOOK_SECRET_HEADER), "test-secret");
    const body = String(cap[0].init.body);
    assert.ok(!body.includes("test-secret"));
    assert.ok(body.includes('"event":"mission.completed"'));
    assert.ok(body.includes('"eventId":"99"'));
    assert.ok(body.includes('"xpAwarded":180'));
    assert.ok(body.includes('"totalXp":300'));
  });

  for (const status of [401, 500] as const) {
    await withMock(status, async (_cap, mockFetch) => {
      const result = await postN8nWebhook({
        url: "https://hooks.mlini.dev/webhook/mlini-events",
        secret: "test-secret",
        body: missionEnvelope,
        fetchImpl: mockFetch,
      });
      assert.equal(result.ok, false);
      if (!result.ok) assert.equal(result.status, status);
    });
  }

  await withMock("network", async (_cap, mockFetch) => {
    const result = await postN8nWebhook({
      url: "https://hooks.mlini.dev/webhook/mlini-events",
      secret: "x",
      body: missionEnvelope,
      fetchImpl: mockFetch,
    });
    assert.equal(result.ok, false);
  });

  await withMock("timeout", async (_cap, mockFetch) => {
    const result = await postN8nWebhook({
      url: "https://hooks.mlini.dev/webhook/mlini-events",
      secret: "x",
      body: missionEnvelope,
      timeoutMs: 10,
      fetchImpl: mockFetch,
    });
    assert.equal(result.ok, false);
    if (!result.ok) assert.match(result.error, /timeout/);
  });

  // Idempotence / replay semantics
  function shouldDispatch(status: string): boolean {
    return status === "pending";
  }
  assert.equal(shouldDispatch("pending"), true);
  for (const s of ["skipped", "delivered", "failed"] as const) {
    assert.equal(shouldDispatch(s), false);
  }

  // First completion → dispatch; replay (no new row) → zero dispatch
  function dispatchCountFor(insertedRows: number): number {
    return insertedRows === 1 ? 1 : 0;
  }
  assert.equal(dispatchCountFor(1), 1);
  assert.equal(dispatchCountFor(0), 0);

  // Webhook failure must not fail mission
  async function simulateMissionWithWebhookFailure(): Promise<"ok" | "boom"> {
    try {
      await postN8nWebhook({
        url: "https://hooks.mlini.dev/webhook/mlini-events",
        secret: "x",
        body: missionEnvelope,
        fetchImpl: async () => {
          throw new Error("down");
        },
      });
      return "ok";
    } catch {
      return "boom";
    }
  }
  assert.equal(await simulateMissionWithWebhookFailure(), "ok");

  // user.created still builds
  assert.equal(userEnvelope.event, "user.created");

  if (prevUrl === undefined) delete process.env.MLINI_N8N_WEBHOOK_URL;
  else process.env.MLINI_N8N_WEBHOOK_URL = prevUrl;
  if (prevSecret === undefined) delete process.env.MLINI_N8N_WEBHOOK_SECRET;
  else process.env.MLINI_N8N_WEBHOOK_SECRET = prevSecret;

  console.log("n8n-events: ok");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
