# Batch eval run

- Generated: 2026-09-07T15:29:25.773Z
- Model: `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning`
- NVIDIA_MODEL env: `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning`
- NVIDIA_EVAL_MODEL env: `(unset → EVAL_MODEL=MODEL)`

### 1. Terrible instruction (`m03-terrible`)

- Model: `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning`
- Isolated: **0/6** in 25363ms · tokens in/out/total: 523/1801/2324 · requests: 6
- Batch: **0/6** in 24274ms · tokens in/out/total: 460/830/1290 · requests: 1
- Suite false pass (isolated fail → batch pass): **false**
- Per-test FALSE_PASS: none
- Per-test FALSE_FAIL: none

| Test | Isolated | Batch | Content I/B | Contract I/B | Kind |
| --- | --- | --- | --- | --- | --- |
| t1 | FAIL | FAIL | ?/? | ✕/✕ | FAIL_AGREE |
| t2 | FAIL | FAIL | ?/? | ✕/✕ | FAIL_AGREE |
| t3 | FAIL | FAIL | ?/? | ✕/✕ | FAIL_AGREE |
| t4 | FAIL | FAIL | ?/? | ✕/✕ | FAIL_AGREE |
| t5 | FAIL | FAIL | ?/? | ✕/✕ | FAIL_AGREE |
| t6-hidden | FAIL | FAIL | ?/? | ✕/✕ | FAIL_AGREE |

<details><summary>Raw outputs</summary>

**t1**

Isolated:
```
**Sentiment:** Positive  
**Intent:** Express gratitude and confirm satisfaction with the service and delivery.  
**Key phrases:** “Amazing service,” “thank you,” “Everything arrived perfectly.”  
**Overall assessment:** The customer is highly pleased with the experience and is providing positive feedback.
```
Batch:
```
The customer expresses gratitude and satisfaction with the service and delivery.
```
**t2**

Isolated:
```
**Analysis of the customer message**

- **Sentiment:** Negative  
- **Primary emotions:** Frustration, disappointment, irritation  
- **Underlying issue:** Perceived repeated delay of a package, indicating a reliability problem  
- **Customer intent:** To express dissatisfaction and likely seek a resolution (e.g., explanation, expedited delivery, compensation)  
- **Suggested response focus:** Empathize with the frustration, acknowledge the repeated delay, provide a clear explanation or status update, and outline steps to prevent future delays or remedy the current situation.
```
Batch:
```
The customer expresses frustration and disappointment about a late package.
```
**t3**

Isolated:
```
The customer is inquiring about the expected delivery time of their package.
```
Batch:
```
The customer asks about the expected arrival time of the package.
```
**t4**

Isolated:
```
I’m sorry you’re seeing a duplicate charge. To investigate this, could you please provide a few more details?

1. **Exact transaction date(s)** – when did the charge appear on your statement?
2. **Amount** – is the amount the same for both entries?
3. **Merchant name** – how is the transaction described on the statement (e.g., “ABC Store,” “XYZ Services”)?
4. **Payment method** – was this charged to a credit card, debit card, bank account, or another method?
5. **Any reference or authorization codes** – sometimes the statement includes additional identifiers that can help locate the original authorization.

With that information I can guide you on how to verify whether the two entries are truly duplicates or if one might be an authorized pending transaction that will drop off. If you prefer, you can also contact the merchant directly using the details on your receipt or their website, and ask them to confirm whether two separate purchases were made. 

Let me know the details above, and I’ll help you take the next steps.
```
Batch:
```
The customer reports a duplicate transaction on their statement.
```
**t5**

Isolated:
```
**Analysis of the customer message**

- **Primary concern:** The customer reports an unrecognized payment, indicating possible fraudulent activity.
- **Emotional tone:** Worried and anxious, suggesting a high level of urgency.
- **Implicit request:** Assistance in verifying the legitimacy of the payment and securing the account from unauthorized access.
- **Key issues to address:**
  1. Confirmation of the disputed transaction (date, amount, merchant).
  2. Review of recent account activity for any suspicious behavior.
  3. Guidance on steps to protect the account (e.g., password reset, two‑factor authentication).
  4. Information on next steps for dispute resolution or charge reversal.
```
Batch:
```
The customer reports an unrecognized payment and expresses concern about account security.
```
**t6-hidden**

Isolated:
```
The customer is requesting a refund for a damaged item and expresses dissatisfaction with its quality, indicating a negative sentiment and a clear intent to seek compensation.
```
Batch:
```
The customer requests a refund for a damaged item and expresses dissatisfaction with quality.
```
</details>

### 2. Vague instruction (priority labels only) (`m03-vague-priority-only`)

- Model: `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning`
- Isolated: **0/6** in 10245ms · tokens in/out/total: 577/531/1108 · requests: 6
- Batch: **0/6** in 16361ms · tokens in/out/total: 469/683/1152 · requests: 1
- Suite false pass (isolated fail → batch pass): **false**
- Per-test FALSE_PASS: none
- Per-test FALSE_FAIL: none

| Test | Isolated | Batch | Content I/B | Contract I/B | Kind |
| --- | --- | --- | --- | --- | --- |
| t1 | FAIL | FAIL | ?/? | ✕/✕ | FAIL_AGREE |
| t2 | FAIL | FAIL | ✕/? | ✕/✕ | FAIL_AGREE |
| t3 | FAIL | FAIL | ?/? | ✕/✕ | FAIL_AGREE |
| t4 | FAIL | FAIL | ✕/✕ | ✕/✕ | FAIL_AGREE |
| t5 | FAIL | FAIL | ?/? | ✕/✕ | FAIL_AGREE |
| t6-hidden | FAIL | FAIL | ✕/✕ | ✕/✕ | FAIL_AGREE |

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
NORMAL
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
NORMAL
```
Batch:
```
NORMAL
```
**t5**

Isolated:
```
URGENT
```
Batch:
```
URGENT
```
**t6-hidden**

Isolated:
```
URGENT
```
Batch:
```
URGENT
```
</details>

### 3. Partially specified (policy, no format) (`m03-partial-policy`)

- Model: `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning`
- Isolated: **0/6** in 6242ms · tokens in/out/total: 985/413/1398 · requests: 6
- Batch: **0/6** in 9451ms · tokens in/out/total: 537/578/1115 · requests: 1
- Suite false pass (isolated fail → batch pass): **false**
- Per-test FALSE_PASS: none
- Per-test FALSE_FAIL: none

| Test | Isolated | Batch | Content I/B | Contract I/B | Kind |
| --- | --- | --- | --- | --- | --- |
| t1 | FAIL | FAIL | ?/? | ✕/✕ | FAIL_AGREE |
| t2 | FAIL | FAIL | ?/? | ✕/✕ | FAIL_AGREE |
| t3 | FAIL | FAIL | ?/? | ✕/✕ | FAIL_AGREE |
| t4 | FAIL | FAIL | ?/? | ✕/✕ | FAIL_AGREE |
| t5 | FAIL | FAIL | ?/? | ✕/✕ | FAIL_AGREE |
| t6-hidden | FAIL | FAIL | ?/? | ✕/✕ | FAIL_AGREE |

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
NORMAL
```
Batch:
```
NORMAL
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
URGENT
```
Batch:
```
URGENT
```
**t6-hidden**

Isolated:
```
NORMAL
```
Batch:
```
NORMAL
```
</details>

### 4. Complete policy instruction (no exact format) (`m03-complete-policy`)

- Model: `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning`
- Isolated: **1/6** in 15976ms · tokens in/out/total: 1525/1229/2754 · requests: 6
- Batch: **0/6** in 24385ms · tokens in/out/total: 627/1409/2036 · requests: 1
- Suite false pass (isolated fail → batch pass): **false**
- Per-test FALSE_PASS: none
- Per-test FALSE_FAIL: t3

| Test | Isolated | Batch | Content I/B | Contract I/B | Kind |
| --- | --- | --- | --- | --- | --- |
| t1 | FAIL | FAIL | ✓/✓ | ✕/✕ | FAIL_AGREE |
| t2 | FAIL | FAIL | ✓/✓ | ✕/✕ | FAIL_AGREE |
| t3 | PASS | FAIL | ✓/✓ | ✓/✕ | FALSE_FAIL |
| t4 | FAIL | FAIL | ✕/✕ | ✓/✕ | FAIL_AGREE |
| t5 | FAIL | FAIL | ✓/✕ | ✕/✕ | FAIL_AGREE |
| t6-hidden | FAIL | FAIL | ✓/✓ | ✕/✕ | FAIL_AGREE |

<details><summary>Raw outputs</summary>

**t1**

Isolated:
```
Sentiment: POSITIVE, Priority: NORMAL
```
Batch:
```
POSITIVE NORMAL
```
**t2**

Isolated:
```
NEGATIVE
NORMAL
```
Batch:
```
NEGATIVE NORMAL
```
**t3**

Isolated:
```
Sentiment: NEUTRAL  
Priority: NORMAL
```
Batch:
```
NEUTRAL NORMAL
```
**t4**

Isolated:
```
Sentiment: NEUTRAL  
Priority: URGENT
```
Batch:
```
NEUTRAL URGENT
```
**t5**

Isolated:
```
SENTIMENT: NEGATIVE, PRIORITY: URGENT
```
Batch:
```
NEUTRAL URGENT
```
**t6-hidden**

Isolated:
```
NEGATIVE, NORMAL
```
Batch:
```
NEGATIVE NORMAL
```
</details>

### 5. Complete policy + exact formatting (`m03-complete-format`)

- Model: `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning`
- Isolated: **5/6** in 10837ms · tokens in/out/total: 1753/1014/2767 · requests: 6
- Batch: **6/6** in 18715ms · tokens in/out/total: 665/1149/1814 · requests: 1
- Suite false pass (isolated fail → batch pass): **true**
- Per-test FALSE_PASS: t4
- Per-test FALSE_FAIL: none

| Test | Isolated | Batch | Content I/B | Contract I/B | Kind |
| --- | --- | --- | --- | --- | --- |
| t1 | PASS | PASS | ✓/✓ | ✓/✓ | PASS_AGREE |
| t2 | PASS | PASS | ✓/✓ | ✓/✓ | PASS_AGREE |
| t3 | PASS | PASS | ✓/✓ | ✓/✓ | PASS_AGREE |
| t4 | FAIL | PASS | ✕/✓ | ✓/✓ | FALSE_PASS |
| t5 | PASS | PASS | ✓/✓ | ✓/✓ | PASS_AGREE |
| t6-hidden | PASS | PASS | ✓/✓ | ✓/✓ | PASS_AGREE |

<details><summary>Raw outputs</summary>

**t1**

Isolated:
```
SENTIMENT: POSITIVE
PRIORITY: NORMAL
```
Batch:
```
SENTIMENT: POSITIVE
PRIORITY: NORMAL
```
**t2**

Isolated:
```
SENTIMENT: NEGATIVE
PRIORITY: NORMAL
```
Batch:
```
SENTIMENT: NEGATIVE
PRIORITY: NORMAL
```
**t3**

Isolated:
```
SENTIMENT: NEUTRAL
PRIORITY: NORMAL
```
Batch:
```
SENTIMENT: NEUTRAL
PRIORITY: NORMAL
```
**t4**

Isolated:
```
SENTIMENT: NEUTRAL
PRIORITY: URGENT
```
Batch:
```
SENTIMENT: NEGATIVE
PRIORITY: URGENT
```
**t5**

Isolated:
```
SENTIMENT: NEGATIVE
PRIORITY: URGENT
```
Batch:
```
SENTIMENT: NEGATIVE
PRIORITY: URGENT
```
**t6-hidden**

Isolated:
```
SENTIMENT: NEGATIVE
PRIORITY: NORMAL
```
Batch:
```
SENTIMENT: NEGATIVE
PRIORITY: NORMAL
```
</details>

### Owner: partial format cue (manual playtest) (`m03-owner-partial-format`)

- Model: `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning`
- Isolated: **0/6** in 14562ms · tokens in/out/total: 727/1116/1843 · requests: 6
- Batch: **0/6** in 9749ms · tokens in/out/total: 494/1118/1612 · requests: 1
- Suite false pass (isolated fail → batch pass): **false**
- Per-test FALSE_PASS: none
- Per-test FALSE_FAIL: none

| Test | Isolated | Batch | Content I/B | Contract I/B | Kind |
| --- | --- | --- | --- | --- | --- |
| t1 | FAIL | FAIL | ?/? | ✕/✕ | FAIL_AGREE |
| t2 | FAIL | FAIL | ?/? | ✕/✕ | FAIL_AGREE |
| t3 | FAIL | FAIL | ?/? | ✕/✕ | FAIL_AGREE |
| t4 | FAIL | FAIL | ?/? | ✕/✕ | FAIL_AGREE |
| t5 | FAIL | FAIL | ?/? | ✕/✕ | FAIL_AGREE |
| t6-hidden | FAIL | FAIL | ?/? | ✕/✕ | FAIL_AGREE |

<details><summary>Raw outputs</summary>

**t1**

Isolated:
```
SENTIMENT: Positive
PRIORITY: Low
```
Batch:
```
SENTIMENT: Positive
PRIORITY: Low
```
**t2**

Isolated:
```
SENTIMENT:
NEGATIVE
PRIORITY:
HIGH
```
Batch:
```
SENTIMENT: Negative
PRIORITY: High
```
**t3**

Isolated:
```
SENTIMENT: neutral
PRIORITY: low
```
Batch:
```
SENTIMENT: Neutral
PRIORITY: Medium
```
**t4**

Isolated:
```
SENTIMENT: Negative
PRIORITY: High
```
Batch:
```
SENTIMENT: Negative
PRIORITY: High
```
**t5**

Isolated:
```
SENTIMENT: Negative
PRIORITY: High
```
Batch:
```
SENTIMENT: Negative
PRIORITY: High
```
**t6-hidden**

Isolated:
```
SENTIMENT:
Negative
PRIORITY:
High
```
Batch:
```
SENTIMENT: Negative
PRIORITY: High
```
</details>

### Owner: structured expectation (manual playtest) (`m03-owner-structured`)

- Model: `nvidia/nemotron-3-nano-omni-30b-a3b-reasoning`
- Isolated: **5/6** in 8526ms · tokens in/out/total: 1759/847/2606 · requests: 6
- Batch: **5/6** in 19524ms · tokens in/out/total: 666/974/1640 · requests: 1
- Suite false pass (isolated fail → batch pass): **false**
- Per-test FALSE_PASS: none
- Per-test FALSE_FAIL: none

| Test | Isolated | Batch | Content I/B | Contract I/B | Kind |
| --- | --- | --- | --- | --- | --- |
| t1 | PASS | PASS | ✓/✓ | ✓/✓ | PASS_AGREE |
| t2 | PASS | PASS | ✓/✓ | ✓/✓ | PASS_AGREE |
| t3 | PASS | PASS | ✓/✓ | ✓/✓ | PASS_AGREE |
| t4 | FAIL | FAIL | ✕/✕ | ✓/✓ | FAIL_AGREE |
| t5 | PASS | PASS | ✓/✓ | ✓/✓ | PASS_AGREE |
| t6-hidden | PASS | PASS | ✓/✓ | ✓/✓ | PASS_AGREE |

<details><summary>Raw outputs</summary>

**t1**

Isolated:
```
SENTIMENT: POSITIVE
PRIORITY: NORMAL
```
Batch:
```
SENTIMENT: POSITIVE
PRIORITY: NORMAL
```
**t2**

Isolated:
```
SENTIMENT: NEGATIVE
PRIORITY: NORMAL
```
Batch:
```
SENTIMENT: NEGATIVE
PRIORITY: NORMAL
```
**t3**

Isolated:
```
SENTIMENT: NEUTRAL
PRIORITY: NORMAL
```
Batch:
```
SENTIMENT: NEUTRAL
PRIORITY: NORMAL
```
**t4**

Isolated:
```
SENTIMENT: NEUTRAL
PRIORITY: URGENT
```
Batch:
```
SENTIMENT: NEUTRAL
PRIORITY: URGENT
```
**t5**

Isolated:
```
SENTIMENT: NEGATIVE
PRIORITY: URGENT
```
Batch:
```
SENTIMENT: NEGATIVE
PRIORITY: URGENT
```
**t6-hidden**

Isolated:
```
SENTIMENT: NEGATIVE
PRIORITY: NORMAL
```
Batch:
```
SENTIMENT: NEGATIVE
PRIORITY: NORMAL
```
</details>
