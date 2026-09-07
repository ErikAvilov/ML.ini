# Batch LLM Evaluation Experiment

**Status:** experimental only — production still uses one isolated classify call per mission test (sequential in the playground UI).  
**Date:** 2026-09-07  
**Model used:** `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning`  
**Pinning:** `OPENAI_EVAL_MODEL` unset → eval harness reused `OPENAI_MODEL` / default (`gpt-4o-mini`).

Raw machine output for this run:

- `docs/_generated/batch-eval-latest.md` (Mission 03)
- `docs/_generated/batch-eval.json`
- `docs/_generated/batch-eval-m02.md` / `.json` (Mission 02 spot-check)

---

## Goal

Determine whether evaluating all mission tests in **one** LLM request (`SINGLE_BATCH`) produces materially different pedagogical results versus **independent** requests (`PARALLEL_ISOLATED`).

Primary risk under study: **FALSE PASSES** — weak player instructions that fail in isolation but pass when the model sees every test case at once (policy / format leakage across items).

---

## Modes

### A. `PARALLEL_ISOLATED`

- Same message shape as production `/api/ai/classify`
- One request per test
- Independent application of the player instruction
- Wall-clock: concurrent pool of **2** (NIM worker limits; retries on 429/503/abort)
- Validators: existing `evaluateMissionTest` on each raw string

### B. `SINGLE_BATCH`

- One request containing player instruction + all `{ testId, customerMessage }`
- System instructions require item-independence and forbid cross-item rule invention
- Outer wrapper only (structured JSON):

```json
{
  "results": [
    { "testId": "t1", "rawOutput": "..." }
  ]
}
```

- `rawOutput` is **not** forced into `SENTIMENT:` / `PRIORITY:` by the wrapper schema
- Same deterministic validators run on each `rawOutput`

Production evaluator was **not** switched.

---

## How to reproduce

```bash
# Mission 03 full fixture set
npm run eval:batch -- --mission mission-03 \
  --json docs/_generated/batch-eval.json \
  --markdown docs/_generated/batch-eval-latest.md

# Optional Mission 02
npx tsx --env-file=.env scripts/run-batch-eval.ts --mission mission-02

# Dev-only HTTP (404 outside development)
curl -s http://localhost:3000/api/dev/batch-eval | jq
curl -s -X POST http://localhost:3000/api/dev/batch-eval \
  -H 'content-type: application/json' \
  -d '{"missionId":"mission-03","promptId":"m03-terrible"}' | jq
```

Optional env:

| Variable | Role |
| --- | --- |
| `OPENAI_MODEL` | Playground / production model |
| `OPENAI_EVAL_MODEL` | Pinned model for eval harness only (falls back to `OPENAI_MODEL`) |

Code:

- `src/lib/eval/batch-compare.ts` — runners + comparison
- `src/lib/eval/prompt-fixtures.ts` — prompt set
- `scripts/run-batch-eval.ts` — CLI
- `src/app/api/dev/batch-eval/route.ts` — DEV-only API

---

## Methodology

1. Fix mission definition + locale (`en`) and the player instruction under test.
2. Run `PARALLEL_ISOLATED`, then `SINGLE_BATCH` (sequential modes to avoid NIM storms).
3. Score each raw string with the **same** mission validators (Mission 03: CONTENT + OUTPUT CONTRACT).
4. Log per-test pass/fail, content/contract flags, latency, token usage.
5. Flag:
   - **per-test FALSE_PASS:** isolated FAIL, batch PASS
   - **suite FALSE_PASS:** isolated suite incomplete, batch `allPassed`

Temperature `0` in both modes. Isolated `max_tokens: 80` (prod parity). Batch `max_tokens` scales with test count.

---

## Prompts tested

| Id | Intent |
| --- | --- |
| `m03-terrible` | `"Analyze the message."` |
| `m03-vague-priority-only` | Return only URGENT/NORMAL |
| `m03-partial-policy` | Veyra priority policy, no sentiment / format |
| `m03-complete-policy` | Sentiment + priority policies, soft format |
| `m03-complete-format` | Policies + exact two-line machine format |
| `m03-owner-partial-format` | Owner manual: format cue without allowed values / full policy |
| `m03-owner-structured` | Owner canonical structured prompt + policies |
| `m02-terrible` / `m02-complete-policy` | Mission 02 spot-check |

---

## Results — Mission 03

Model: `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning`

| Prompt | Isolated | Batch | Latency I / B (ms) | Tokens total I / B | Suite false pass | Per-test FALSE_PASS |
| --- | --- | --- | --- | --- | --- | --- |
| `m03-terrible` | 0/6 | 0/6 | 25363 / 24274 | 2324 / 1290 | no | — |
| `m03-vague-priority-only` | 0/6 | 0/6 | 10245 / 16361 | 1108 / 1152 | no | — |
| `m03-partial-policy` | 0/6 | 0/6 | 6242 / 9451 | 900 / 1340* | no | — |
| `m03-complete-policy` | 1/6 | 0/6 | 15976 / 24385 | ~ / ~ | no | — |
| `m03-complete-format` | **5/6** | **6/6** | 10837 / 18715 | 2600-ish / ~ | **yes** | **t4** |
| `m03-owner-partial-format` | 0/6 | 0/6 | 14562 / 9749 | 1843 / 1612 | no | — |
| `m03-owner-structured` | 5/6 | 5/6 | 8526 / 19524 | 2606 / 1640 | no | — |

\*Exact token rows are in `docs/_generated/batch-eval-latest.md`.

### Observed false pass (critical)

**Prompt:** `m03-complete-format` (strong policy + exact format)

| | Isolated | Batch |
| --- | --- | --- |
| Suite | 5/6 FAIL | 6/6 PASS |
| `t4` raw | `SENTIMENT: NEUTRAL` / `PRIORITY: URGENT` | `SENTIMENT: NEGATIVE` / `PRIORITY: URGENT` |

Expected for `t4` (duplicate transaction): `NEGATIVE` + `URGENT`.

Interpretation: with all cases visible, the batch response for `t4` flipped from NEUTRAL → NEGATIVE and created a **suite false pass**. That is exactly the failure mode this experiment was designed to catch.

On `m03-owner-structured`, both modes agreed on `t4` FAIL (`NEUTRAL`), so leakage is **stochastic / prompt-sensitive**, not guaranteed every run — but **one clear suite false pass is enough to block a production switch**.

### Format preservation (Mission 03 pedagogy)

For `m03-terrible`, both modes returned prose analyses. Validators correctly marked **OUTPUT CONTRACT ✕**. Batch did **not** silently rewrite answers into `SENTIMENT:` / `PRIORITY:` lines. Outer JSON wrapper behaved as intended.

### Weak prompts

Vague / partial prompts failed in both modes. Batch did not magically grant a full Mission 03 pass from `"Analyze the message."` in this run.

---

## Results — Mission 02 (spot-check)

| Prompt | Isolated | Batch | Suite false pass |
| --- | --- | --- | --- |
| `m02-terrible` | 0/8 | 0/8 | no |
| `m02-complete-policy` | 8/8 | 8/8 | no |

No false passes observed on this small M02 set.

---

## Latency & tokens

- **Tokens:** Batch often reduces *input* duplication (one system/user envelope vs N). Isolated totals can be higher because each call repeats pedagogical constraints + instruction.
- **Latency:** Isolated wall-clock with concurrency 2 was often **similar or faster** than a single large batch generation on this reasoning model. Batch is not automatically “faster for UX” here.
- **Reliability:** Aggressive parallelism hit NIM `ResourceExhausted (16/16)`; harness uses pool=2 + retries. Production playground remains sequential and is safer under the same quota.

---

## Recommendation

**Do not switch production evaluation to `SINGLE_BATCH`.**

Reasons:

1. Documented **suite FALSE_PASS** on a near-complete Mission 03 instruction (`m03-complete-format`, test `t4`).
2. Pedagogical integrity requires that missing player rules stay missing — seeing sibling tests can supply labels/policy by analogy.
3. Latency gains are unclear on the current model; token savings alone do not justify weaker assessment fidelity.
4. Wrapper design is sound for experiments (preserves raw player-driven output), but independence instructions are not a reliable substitute for true isolation.

Keep production on **isolated classify-per-test**. Keep this harness for future pinned-model (`NVIDIA_EVAL_MODEL`) regressions before any batch adoption.

### Optional next experiments

- Repeat `m03-complete-format` N times to estimate false-pass rate.
- Pin a model via `OPENAI_EVAL_MODEL`.
- Try batch with **shuffled / anonymized** test ids and adversarially ordered cases.
- Compare against true sequential isolated (concurrency 1) to separate quota noise from pedagogy.

---

## Explicit non-goals completed

- Production `/api/ai/classify` unchanged.
- Mission playground RUN path unchanged.
- No product UI for this debugger (DEV API returns 404 outside `development`).
