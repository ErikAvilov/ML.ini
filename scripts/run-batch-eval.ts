/**
 * Dev-only CLI: compare PARALLEL_ISOLATED vs SINGLE_BATCH evaluation.
 *
 * Usage:
 *   npx tsx --env-file=.env scripts/run-batch-eval.ts
 *   npx tsx --env-file=.env scripts/run-batch-eval.ts --mission mission-03
 *   npx tsx --env-file=.env scripts/run-batch-eval.ts --prompt m03-terrible
 *   npx tsx --env-file=.env scripts/run-batch-eval.ts --json out/batch-eval.json
 */

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createMission02 } from "../src/data/missions/mission-02";
import { createMission03 } from "../src/data/missions/mission-03";
import {
  compareIsolatedVsBatch,
  formatComparisonMarkdown,
  type ComparisonReport,
} from "../src/lib/eval/batch-compare";
import {
  BATCH_EVAL_PROMPTS,
  promptsForMission,
} from "../src/lib/eval/prompt-fixtures";
import { EVAL_MODEL } from "../src/lib/ai-client";
import type { MissionDefinition } from "../src/lib/types";

function parseArgs(argv: string[]) {
  const out: {
    mission?: string;
    prompt?: string;
    json?: string;
    markdown?: string;
  } = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--mission") out.mission = argv[++i];
    else if (a === "--prompt") out.prompt = argv[++i];
    else if (a === "--json") out.json = argv[++i];
    else if (a === "--markdown") out.markdown = argv[++i];
  }
  return out;
}

function loadMission(id: string): MissionDefinition {
  if (id === "mission-02") return createMission02("en");
  if (id === "mission-03") return createMission03("en");
  throw new Error(`Unsupported mission for batch eval: ${id}`);
}

async function main() {
  if (!process.env.OPENAI_API_KEY?.trim()) {
    console.error("OPENAI_API_KEY missing. Load .env via --env-file=.env");
    process.exit(1);
  }

  const args = parseArgs(process.argv.slice(2));
  let fixtures = BATCH_EVAL_PROMPTS;
  if (args.mission) {
    fixtures = promptsForMission(args.mission);
  }
  if (args.prompt) {
    fixtures = fixtures.filter((f) => f.id === args.prompt);
  }
  if (fixtures.length === 0) {
    console.error("No matching prompt fixtures.");
    process.exit(1);
  }

  console.log(`Eval model: ${EVAL_MODEL}`);
  console.log(`Prompts: ${fixtures.map((f) => f.id).join(", ")}`);
  console.log("");

  const reports: ComparisonReport[] = [];

  for (const fixture of fixtures) {
    for (const missionId of fixture.missionIds) {
      if (args.mission && missionId !== args.mission) continue;
      const mission = loadMission(missionId);
      console.log(`→ ${fixture.id} / ${missionId} …`);
      const report = await compareIsolatedVsBatch({
        mission,
        instruction: fixture.instruction,
        promptId: fixture.id,
        promptLabel: fixture.label,
        locale: fixture.locale,
      });
      reports.push(report);
      console.log(
        `  isolated ${report.isolated.passed}/${report.isolated.total} (${report.isolated.latencyMs}ms) | batch ${report.batch.passed}/${report.batch.total} (${report.batch.latencyMs}ms) | suiteFalsePass=${report.suiteFalsePass} | FALSE_PASS=[${report.falsePassTestIds.join(",")}]`
      );
      // Cool down between prompts (provider rate limits).
      await new Promise((r) => setTimeout(r, 1500));
    }
  }

  const mdParts = [
    `# Batch eval run`,
    ``,
    `- Generated: ${new Date().toISOString()}`,
    `- Model: \`${EVAL_MODEL}\``,
    `- OPENAI_MODEL env: \`${process.env.OPENAI_MODEL ?? "(unset → default)"}\``,
    `- OPENAI_EVAL_MODEL env: \`${process.env.OPENAI_EVAL_MODEL ?? "(unset → EVAL_MODEL=MODEL)"}\``,
    ``,
    ...reports.map(formatComparisonMarkdown),
  ];
  const markdown = mdParts.join("\n");

  const mdPath = resolve(
    args.markdown ?? "docs/_generated/batch-eval-latest.md"
  );
  mkdirSync(dirname(mdPath), { recursive: true });
  writeFileSync(mdPath, markdown, "utf8");
  console.log(`\nWrote ${mdPath}`);

  if (args.json) {
    const jsonPath = resolve(args.json);
    mkdirSync(dirname(jsonPath), { recursive: true });
    writeFileSync(jsonPath, JSON.stringify(reports, null, 2), "utf8");
    console.log(`Wrote ${jsonPath}`);
  }

  const suiteFalsePasses = reports.filter((r) => r.suiteFalsePass);
  const anyFalsePass = reports.filter((r) => r.falsePassTestIds.length > 0);
  console.log("\n=== SUMMARY ===");
  console.log(`Comparisons: ${reports.length}`);
  console.log(`Suite FALSE_PASS count: ${suiteFalsePasses.length}`);
  console.log(
    `Comparisons with ≥1 per-test FALSE_PASS: ${anyFalsePass.length}`
  );
  for (const r of anyFalsePass) {
    console.log(
      `  - ${r.promptId}: isolated ${r.isolated.passed}/${r.isolated.total} → batch ${r.batch.passed}/${r.batch.total} · tests ${r.falsePassTestIds.join(", ")}`
    );
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
