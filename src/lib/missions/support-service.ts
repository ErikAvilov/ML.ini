/**
 * Deterministic Support service mock for Kingdom I (Missions 07–10).
 * No network — records calls for validation / RUN display.
 */

export type SupportActionName =
  | "create_ticket"
  | "queue_message"
  | "manual_review";

export type SupportCall = {
  action: SupportActionName;
  args: Record<string, string>;
};

export type SupportService = {
  readonly calls: SupportCall[];
  create_ticket: (message: string, priority: string) => void;
  queue_message: (message: string) => void;
  manual_review: (message: string, reason: string) => void;
  /** Force next create_ticket / queue_message to throw (Mission 09/10). */
  failNextAction: (fail?: boolean) => void;
  reset: () => void;
};

export function createSupportService(): SupportService {
  const calls: SupportCall[] = [];
  let failNext = false;

  function maybeFail() {
    if (!failNext) return;
    failNext = false;
    throw new Error("SUPPORT_ACTION_FAILED");
  }

  return {
    get calls() {
      return calls;
    },
    create_ticket(message: string, priority: string) {
      maybeFail();
      calls.push({
        action: "create_ticket",
        args: { message, priority },
      });
    },
    queue_message(message: string) {
      maybeFail();
      calls.push({
        action: "queue_message",
        args: { message },
      });
    },
    manual_review(message: string, reason: string) {
      calls.push({
        action: "manual_review",
        args: { message, reason },
      });
    },
    failNextAction(fail = true) {
      failNext = fail;
    },
    reset() {
      calls.length = 0;
      failNext = false;
    },
  };
}

/** Human-readable ACTION SENT report for the workspace. */
export function formatSupportActionReport(call: SupportCall): string {
  const lines = [`ACTION SENT`, ``, `support.${call.action}`, ``];
  for (const [key, value] of Object.entries(call.args)) {
    lines.push(`${key}:`);
    lines.push(`"${value}"`);
    lines.push(``);
  }
  return lines.join("\n").trimEnd();
}

export function expectedActionForRoute(
  route: string
): "create_ticket" | "queue_message" {
  return route === "HUMAN_REVIEW" ? "create_ticket" : "queue_message";
}

/**
 * Simulate the correct Mission 07 program once blanks are verified.
 * Does not re-interpret player source — gate is code-fill check.
 */
export function simulateServiceAction(
  support: SupportService,
  fixture: { route: string; priority: string; message: string }
): SupportCall {
  support.reset();
  if (fixture.route === "HUMAN_REVIEW") {
    support.create_ticket(fixture.message, fixture.priority);
  } else {
    support.queue_message(fixture.message);
  }
  const call = support.calls[0];
  if (!call) throw new Error("support simulation produced no call");
  return call;
}

export function matchSupportCall(
  call: SupportCall,
  expected: {
    action: SupportActionName;
    message: string;
    priority?: string;
    reason?: string;
  }
): boolean {
  if (call.action !== expected.action) return false;
  if (call.args.message !== expected.message) return false;
  if (
    expected.priority !== undefined &&
    call.args.priority !== expected.priority
  ) {
    return false;
  }
  if (expected.reason !== undefined && call.args.reason !== expected.reason) {
    return false;
  }
  return true;
}
