# Batch eval run

- Generated: 2026-09-07T15:30:34.548Z
- Model: `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning`
- NVIDIA_MODEL env: `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning`
- NVIDIA_EVAL_MODEL env: `(unset → EVAL_MODEL=MODEL)`

### M02 terrible (`m02-terrible`)

- Model: `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning`
- Isolated: **0/8** in 17443ms · tokens in/out/total: 703/1264/1967 · requests: 8
- Batch: **0/8** in 18238ms · tokens in/out/total: 536/1015/1551 · requests: 1
- Suite false pass (isolated fail → batch pass): **false**
- Per-test FALSE_PASS: none
- Per-test FALSE_FAIL: none

| Test | Isolated | Batch | Content I/B | Contract I/B | Kind |
| --- | --- | --- | --- | --- | --- |
| t1 | FAIL | FAIL | —/— | —/— | FAIL_AGREE |
| t2 | FAIL | FAIL | —/— | —/— | FAIL_AGREE |
| t3 | FAIL | FAIL | —/— | —/— | FAIL_AGREE |
| t4 | FAIL | FAIL | —/— | —/— | FAIL_AGREE |
| t5 | FAIL | FAIL | —/— | —/— | FAIL_AGREE |
| t6 | FAIL | FAIL | —/— | —/— | FAIL_AGREE |
| t7-hidden | FAIL | FAIL | —/— | —/— | FAIL_AGREE |
| t8-hidden | FAIL | FAIL | —/— | —/— | FAIL_AGREE |

<details><summary>Raw outputs</summary>

**t1**

Isolated:
```
Yes, this is urgent. Please provide your order number so I can investigate the delay.
```
Batch:
```
Yes
```
**t2**

Isolated:
```
Is this urgent?
```
Batch:
```
No
```
**t3**

Isolated:
```
Yes, it’s urgent.
```
Batch:
```
Yes
```
**t4**

Isolated:
```
Yes, it appears urgent.
```
Batch:
```
No
```
**t5**

Isolated:
```
Yes, this is urgent.
```
Batch:
```
Yes
```
**t6**

Isolated:
```
Yes, this is urgent.
```
Batch:
```
Yes
```
**t7-hidden**

Isolated:
```
No, it’s not urgent.
```
Batch:
```
No
```
**t8-hidden**

Isolated:
```
Yes, it is urgent.
```
Batch:
```
Yes
```
</details>

### M02 complete policy (`m02-complete-policy`)

- Model: `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning`
- Isolated: **8/8** in 6658ms · tokens in/out/total: 1471/609/2080 · requests: 8
- Batch: **8/8** in 18736ms · tokens in/out/total: 632/859/1491 · requests: 1
- Suite false pass (isolated fail → batch pass): **false**
- Per-test FALSE_PASS: none
- Per-test FALSE_FAIL: none

| Test | Isolated | Batch | Content I/B | Contract I/B | Kind |
| --- | --- | --- | --- | --- | --- |
| t1 | PASS | PASS | —/— | —/— | PASS_AGREE |
| t2 | PASS | PASS | —/— | —/— | PASS_AGREE |
| t3 | PASS | PASS | —/— | —/— | PASS_AGREE |
| t4 | PASS | PASS | —/— | —/— | PASS_AGREE |
| t5 | PASS | PASS | —/— | —/— | PASS_AGREE |
| t6 | PASS | PASS | —/— | —/— | PASS_AGREE |
| t7-hidden | PASS | PASS | —/— | —/— | PASS_AGREE |
| t8-hidden | PASS | PASS | —/— | —/— | PASS_AGREE |

<details><summary>Raw outputs</summary>

**t1**

Isolated:
```
NORMAL
```
Batch:
```
NORMAL
```
**t2**

Isolated:
```
URGENT
```
Batch:
```
URGENT
```
**t3**

Isolated:
```
NORMAL
```
Batch:
```
NORMAL
```
**t4**

Isolated:
```
URGENT
```
Batch:
```
URGENT
```
**t5**

Isolated:
```
NORMAL
```
Batch:
```
NORMAL
```
**t6**

Isolated:
```
URGENT
```
Batch:
```
URGENT
```
**t7-hidden**

Isolated:
```
URGENT
```
Batch:
```
URGENT
```
**t8-hidden**

Isolated:
```
NORMAL
```
Batch:
```
NORMAL
```
</details>
