# TakeMeter

> ### 👋 Start here
>
> **New to this repo? Read [RUNNING.md](RUNNING.md) first** — setup, the
> notebook, the baseline, and what to do when something breaks.
>
> Once `python test.py` passes:
>
> ```bash
> head -5 data/practice_labels.csv     # the shape your labels.csv needs
> ```
>
> Then open `takemeter.ipynb` **in this folder** — in VS Code, or with
> `jupyter notebook` if you prefer. Pick the kernel: the `.venv` inside this
> project. Run section 1, which reports the hardware you'll be training on.
> Everything else waits until you have data.
>
> Nothing to upload, nothing to connect, no accounts and no keys. The notebook
> runs on your machine and writes next to your code.
>
> **The rest of this file is your submission.** Fill it in as you go.

---

<!-- ─────────────────────────────────────────────────────────────────────────
     HOW TO USE THIS FILE

     Unit 5 asks for the first five sections. Unit 6 adds the five below them.

     Everything is pasted as TEXT. No screenshots, no images.

     ⚠️ The confusion matrix especially. The notebook prints one as a markdown
     table, ready to copy. A screenshot of a matrix earns nothing. Paste the
     table.
     ───────────────────────────────────────────────────────────────────────── -->

<!-- ═══════════════════════ UNIT 5 — THE BUILD ═══════════════════════ -->

## What This Does

This project uses public text submissions from r/AskPhysics. The classifier
sorts each submission by its main intent: exploring a scenario, understanding
a physical mechanism, checking a claim, or asking the community for practical
guidance. Each example's `text` field contains the post title and body together.

---

## Label Taxonomy

<!-- Each label: a one-sentence definition and two real examples from your
     reading. Then your decision rule for the hardest boundary.

     The decision rule is worth a point on its own and it's the thing most
     people leave out. Every taxonomy has a hardest boundary. Name yours. -->

### `scenario`

**Definition:** Asks what would happen in a specific hypothetical or applied
physical situation.

**Example 1:**
> "In zero gravity, liquids create a sphere. If a small cube suddenly appeared
> with the mass of the Earth, would the cube act like a magnet?"

**Example 2:**
> "Could a hollow black hole or neutron sphere exist, and if so, what would be
> interesting or useful about it?"

### `mechanism`

**Definition:** Asks how or why a known physical phenomenon or concept works.

**Example 1:**
> "How can it be true that gravity and light in a vacuum travel at the same
> speed if gravity can affect and consume light?"

**Example 2:**
> "How does the hydrogen 21cm spin-flip transition happen?"

### `claim_check`

**Definition:** Asks whether a specific physics claim, explanation, or line of
reasoning is correct.

**Example 1:**
> "I think one part of The Speed of Light just clicked for me, but I still
> can't wrap my head around the other."

**Example 2:**
> "Are position eigenstates actually genuine (non-normal) states in the
> algebraic quantum framework?"

### `guidance_request`

**Definition:** Asks for recommendations, resources, advice, or practical help
with learning, a project, or a career, rather than primarily asking for a
physics explanation or claim check.

**Example 1:**
> "Physics project"

**Example 2:**
> "How to study physics"

### Boundary rules

**Hardest boundary — `mechanism` vs `claim_check`:** If the post asks whether
its own or someone else's specific explanation or claim is correct, use
`claim_check`. If it asks how or why the physics works without making
correctness of a stated claim the central question, use `mechanism`.

For `guidance_request`, label the post by its main requested outcome: advice,
learning resources, or practical direction belongs to `guidance_request`;
asking for the physics concept itself to be explained belongs to `mechanism`.
For an explicit what-if setup, use `scenario`. If a post genuinely straddles
two categories, use the category that best matches its main question.

---

## The Dataset

<!-- Where you collected from, how you labelled, your counts, and three hard
     cases. -->

**Where the posts came from:** Public text submissions from the r/AskPhysics
feed. Each `text` value combines the submission title and full body; comments
and replies are excluded.

**How I labelled them:** 20 posts were labelled cold before using AI. The
remaining 180 were initially AI-pre-labelled. After adding `guidance_request`,
27 AI-pre-labelled examples were moved from the original three categories to
that label; their `note` values record the reclassification. I reviewed and
approved all 180 AI-assisted labels against the written rules. Each AI-assisted
row's `note` retains its original annotation and marks that review.

**Counts per label:**

| Label | Count | Share |
|---|---|---|
| `scenario` | 44 | 22.0% |
| `mechanism` | 76 | 38.0% |
| `claim_check` | 53 | 26.5% |
| `guidance_request` | 27 | 13.5% |
| **Total** | **200** | **100%** |

**Planned expansion:** I expect to label about 200 more r/AskPhysics posts in
the future, roughly doubling the dataset. More training examples should help
the model learn the smaller labels. A larger test split would also make
results vary less between seeds, especially for `guidance_request`, which
currently has only 4 test examples.

**Three hard cases**

<!-- Any post that made you pause: what it was, which two labels it could have
     been, and what you chose. These are worth more than the easy 190. -->

**1.**
> *The post:* "I think one part of The Speed of Light just clicked for me, but
> I still can't wrap my head around the other."
>
> *Could have been:* `claim_check` or `mechanism`
>
> *I chose, because:* `claim_check` — the writer asks readers to correct a
> proposed explanation, so correctness of a stated claim is central.

**2.**
> *The post:* "How can it be true that gravity and light in a vacuum travel at
> the same speed if gravity can affect and consume light?"
>
> *Could have been:* `mechanism` or `claim_check`
>
> *I chose, because:* `mechanism` — it asks how the relationship works; it
> does not primarily ask readers to judge a proposed explanation as correct.

**3.**
> *The post:* "Settle a bet: How quickly does heat escape from open oven"
>
> *Could have been:* `claim_check` or `scenario`
>
> *I chose, because:* `claim_check` — it asks readers to resolve a concrete
> disagreement about an observed situation, rather than posing a hypothetical.

---

## The Training Run

<!-- Your starting model, your settings, and anything you changed and why. -->

**Base model:** `distilbert-base-uncased`

**Settings:** 3 epochs, learning rate `2e-5`, batch size 8, max length 256 tokens, seed 42

**Anything I changed from the defaults, and why:** I raised `MAX_LENGTH` from 128 to 256 to retain more of the longer text posts in the input. I reduced `BATCH_SIZE` from 16 to 8 to use less memory with the 256-token inputs on my 8 GB RTX 3060 Ti. I installed CUDA-enabled PyTorch `2.14.1+cu126`; `python test.py` confirms CUDA detection on my NVIDIA GeForce RTX 3060 Ti.

**Split sizes:** <!-- train / val / test, and per-label counts in the test
split. If a label had fewer than about 8 in test, say so — it explains a lot
of next unit's variance. -->

Stratified 70/15/15 split with seed 42: **train 139 · val 31 · test 30**.

| Label | Train | Val | Test |
|---|---|---|---|
| `scenario` | 30 | 7 | 7 |
| `mechanism` | 53 | 12 | 11 |
| `claim_check` | 37 | 8 | 8 |
| `guidance_request` | 19 | 4 | 4 |

`scenario` (7) and `guidance_request` (4) have fewer than 8 test examples, so
their per-label metrics will move a lot between seeds. One `guidance_request`
post changes that label's recall by 25 points.


---

## How I Used AI

<!-- Two specific moments — what you asked, what came back, what you changed.

     ⚠️ Plus disclosure of any pre-labelling. If you had a model pre-label a
     batch and then read and corrected every one, say that. It's an allowed
     workflow and disclosing it costs you nothing. Not disclosing it is the
     problem. -->

**Moment 1**

- *What I asked for:* Help identifying a fourth label for the kinds of
  r/AskPhysics posts that did not fit the original three intent labels.
- *What came back:* `guidance_request` for posts asking for study resources,
  project/career advice, or other practical direction.
- *What I changed:* Added that label and moved 27 AI-prelabelled rows into it;
  I reviewed and approved each changed row against the definition.

**Moment 2**

- *What I asked for:* Help reviewing borderline labels and setting measurable
  criteria for the four-label dataset.
- *What came back:* Suggested boundaries between `guidance_request` and
  physics-explanation labels, plus adjusted class-balance and F1 targets for
  the smaller fourth class.
- *What I changed:* Wrote the boundary rules and revised `criteria.md` before
  training; I reviewed the AI-assisted labels against those rules.

**Pre-labelling disclosure:** 180 posts were initially pre-labelled with AI.
I reviewed and approved all 180 labels before training. The original AI
annotation notes and the review status are recorded in `labels.csv`. In
unit 6, the 30 staff-set labels in `my_staff_labels.csv` were also produced by
AI rather than by me; see the Agreement Report. The 124 posts added for the
unit 6 improvement were also AI-pre-labelled, then reviewed and approved by
me; see The Improvement.

<!-- ═══════════════════════ UNIT 6 — THE TEST ═══════════════════════

     Don't fill these in during unit 5.
     ═══════════════════════════════════════════════════════════════════ -->

---

## Baseline vs. Trained

<!-- Both models on the same posts. `python baseline.py --trained results.json`
     prints this table for you. -->

| Measure | Baseline | Trained | Difference |
|---|---|---|---|
| Overall accuracy | 0.667 | 0.400 | -0.267 |
| Macro F1 | 0.534 | 0.238 | -0.297 |
| F1 — `scenario` | 0.750 | 0.000 | -0.750 |
| F1 — `mechanism` | 0.720 | 0.550 | -0.170 |
| F1 — `claim_check` | 0.667 | 0.000 | -0.667 |
| F1 — `guidance_request` | 0.000 | 0.400 | +0.400 |

**What I predicted before I looked:**
I expected the trained model to improve F1 on `claim_check` and
`guidance_request`, where learning from labelled examples could help it
distinguish those intents. This sentence is being recorded after the trained
results were already shared, so it is a retrospective prediction, not a valid
before-looking prediction.

**What the gap actually means:**
On the same 30 held-out posts, the zero-shot baseline scored higher overall
(0.667 accuracy and 0.534 macro F1) than the trained model (0.400 and 0.238).
The trained model correctly identified some `guidance_request` posts, where
the baseline scored zero F1, but it predicted `mechanism` for 29 of 30 posts;
that left its `scenario` and `claim_check` F1 at zero. On this small test set,
fine-tuning did not improve overall performance, though more evaluation would
be needed before generalizing beyond these posts.

As a prompt check, I also ran the baseline on these same 30 posts without
`label_definitions.txt`, using bare label names. Accuracy was 0.333 and macro
F1 was 0.308, compared with 0.667 and 0.534 using the definitions. On this
sample, the definitions improved accuracy by 0.334 and macro F1 by 0.226.
The bare-label run is not the primary baseline comparison; it measures the
effect of removing the definitions. Its results are saved in
`baseline_bare_labels_results.json`.

---

## Run Log — Before

<!-- Five criteria across three seeds. The notebook's section 6 prints the
     spread table; the Target and Verdict columns are yours. -->

| Criterion | Target | Seed 42 | Seed 7 | Seed 2024 | Verdict |
|---|---|---|---|---|---|
| 1. Overall accuracy | >= 0.55 each seed | 0.400 | 0.367 | 0.367 | MISSED |
| 2. Macro F1 | >= 0.50 each seed | 0.238 | 0.134 | 0.134 | MISSED |
| 3. Per-label F1 (S/M/C >= 0.45; G >= 0.30) | All label floors each seed | S 0.000; M 0.550; C 0.000; G 0.400 | S 0.000; M 0.537; C 0.000; G 0.000 | S 0.000; M 0.537; C 0.000; G 0.000 | MISSED |
| 4. Label balance in 200 posts | Each label 10%-50% | S 22%; M 38%; C 26.5%; G 13.5% | Same dataset | Same dataset | MET |
| 5. Confidence accuracy (top/low third; gap) | Top >= 0.60 and gap >= 0.10 each seed | 0.600 / 0.300; +0.300 | 0.600 / 0.000; +0.600 | 0.600 / 0.100; +0.500 | MET |

Accuracy ranged from 0.367 to 0.400, a spread of 0.033 (3.3 percentage
points), which is below the 0.10 instability threshold. That stability is
misleading: seeds 7 and 2024 predicted `mechanism` for all 30 test posts, and
0.367 is exactly the `mechanism` share of the test split (11 of 30). Seed 42
differs only by getting one `guidance_request` post right. The seeds agree
because the model collapsed to the majority label each time, not because it
learned the task consistently. Macro F1 moved 0.103 and `guidance_request` F1
moved 0.400, because that label has only 4 test posts and one correct
prediction is the whole difference.

### Confusion matrix

<!-- ⚠️ TYPED AS A MARKDOWN TABLE. The notebook prints one ready to paste.
     An image of a matrix earns nothing. -->

Seed 42, 30 held-out posts. Rows are true labels; columns are predictions.

| true \ predicted | scenario | mechanism | claim_check | guidance_request |
|---|---|---|---|---|
| **scenario** | 0 | 7 | 0 | 0 |
| **mechanism** | 0 | 11 | 0 | 0 |
| **claim_check** | 0 | 8 | 0 | 0 |
| **guidance_request** | 0 | 3 | 0 | 1 |

**My biggest off-diagonal number, and what it means:**
<!-- Not "the model made mistakes" — WHICH boundary it didn't learn, and which
     direction. "7 real analysis posts were called hot_take and only 3 went the
     other way" is a direction, not just an error rate. -->
Eight real `claim_check` posts were called `mechanism`, while zero real
`mechanism` posts were called `claim_check`; the model strongly favors
`mechanism` on this boundary.

---

## Verdicts and Diagnoses

<!-- MET or MISSED against LAST UNIT's target. The target has to hold across
     all three seeds, not turn up sometimes. -->

| # | Criterion | Target | Verdict | How I decided |
|---|---|---|---|---|
| 1 | Held-out accuracy | >= 0.55 on each seed | MISSED | All three were below 0.55 (0.400, 0.367, 0.367). |
| 2 | Macro F1 | >= 0.50 on each seed | MISSED | All three were below 0.50 (0.238, 0.134, 0.134). |
| 3 | Per-label F1 | S/M/C >= 0.45 and G >= 0.30 on each seed | MISSED | `scenario` and `claim_check` were 0.000 on every seed; `guidance_request` also missed on seeds 7 and 2024. |
| 4 | Label balance | Every label 10%-50% of 200 posts | MET | Counts were scenario 44 (22%), mechanism 76 (38%), claim_check 53 (26.5%), guidance_request 27 (13.5%). |
| 5 | Confidence calibration | Top third >= 0.60 and >= 0.10 above bottom third on each seed | MET | Top-third accuracy was 0.600 each seed; gaps over bottom-third accuracy were 0.300, 0.600, and 0.500. |

**Diagnoses**

<!-- For each miss: the cause, and how you know. The four common causes are:
     too few examples for a label, a boundary you applied inconsistently, a
     genuinely hard label pair, and a task the model can't reach from this
     much data.

     ⚠️ Use your agreement report as evidence. It is the only instrument you
     have that can tell a LABELLING problem from a MODEL problem, and this
     section is graded on whether you used it that way. -->

**Miss 1 — overall accuracy (0.400, 0.367, 0.367 vs ≥ 0.55).**
*Cause:* a task the model can't reach from this much data and training. The
model never got past predicting the majority label.
*How I know:* on seeds 7 and 2024 the model predicted `mechanism` for all 30
test posts, and 0.367 is exactly the `mechanism` share of the test split
(11 of 30). Validation accuracy was 0.387 after every epoch on every seed.
That is 12 of 31, the `mechanism` share of the validation split, so it never
improved during training. Final training loss was 1.28, 1.29 and 1.28, barely
below 1.39, the loss of a uniform guess over four labels. With 139 training
posts at batch size 8, three epochs is only about 54 optimisation steps.

**Miss 2 — macro F1 (0.238, 0.134, 0.134 vs ≥ 0.50).**
*Cause:* the same majority-label collapse, made worse by too few examples in
the smallest label.
*How I know:* macro F1 averages the four labels equally, and three of them
score 0.000 when everything is called `mechanism`. Seed 42 scored higher only
because one of the 4 `guidance_request` test posts was predicted correctly.
One post moved macro F1 by about 0.10 (0.238 vs 0.134), which shows how small
the test support is.

**Miss 3 — per-label F1 (`scenario` and `claim_check` 0.000 on every seed;
`guidance_request` 0.400, 0.000, 0.000).**
*Cause:* mainly the model problem above, not a labelling problem I can show.
*How I know:* the confusion matrix sends every `scenario` (7) and
`claim_check` (8) post and 3 of 4 `guidance_request` posts to `mechanism`.
If the cause were my hardest boundary (`mechanism` vs `claim_check`), I would
expect `claim_check` to be confused with `mechanism` while `scenario` and
`guidance_request` were mostly right. Instead every label collapses into
`mechanism`, which points at the model and data, not one boundary.

The agreement report cannot settle the labelling question. My 100% on the
staff set came from AI-applied labels on a clearly structured set with tight
rules, so it is not evidence about how consistently I applied my own
`mechanism`/`claim_check` rule. That cause remains possible but unproven:
the model never learned enough to expose an inconsistent boundary.
`guidance_request` has only 19 training and 4 test posts, so even a model
that learned the task would give that label a noisy F1.

**What these diagnoses point to:** more training data. A larger dataset gives
the model more steps and more examples of the smaller labels, and a larger
test split makes per-label F1 less sensitive to a single post.



---

## Agreement Report

<!-- Your rate against the staff set, and every disagreement adjudicated.

     Remember you labelled these 30 under the STAFF taxonomy in
     data/staff_taxonomy.md, not your own — so every argument below is made
     from those definitions and those decision rules. -->

**How my 30 labels were made:** The labels in `my_staff_labels.csv` were
produced by an AI assistant (Claude) applying the definitions and decision
rules in `data/staff_taxonomy.md`, before `data/staff_labels.csv` was opened.
I did not label these 30 myself. This rate therefore measures the AI's
application of the staff rules, not mine, and it is weaker evidence about the
consistency of my own 200 labels than a self-labelled set would be.

**Agreement rate:** 30 / 30 = 100%

<!-- Nobody grades this number. A 60% who argues every disagreement from the
     stated rules beats a 95% who wrote "staff was right" nine times. Several
     of the 30 were chosen because they're genuinely ambiguous — you should be
     winning some of these. -->

**Disagreements**

<!-- Three lines each: the post, both labels, and who you think is right and
     why — grounded in the staff definitions you were both applying.

     Then sort each into one of three piles:
       (a) the rule covered it and I applied it loosely → a consistency problem
       (b) the rule genuinely doesn't say               → a gap in the definitions
       (c) the rule is ambiguous here and my reading is defensible → argue it.
           This is a legitimate win.

     Pile (a) is the one that matters most for your diagnosis: if you applied a
     written rule two different ways on 30 posts, that is direct evidence about
     what you did across your own 200. -->

There were no disagreements, so there is nothing to sort into piles. Staff
flagged 7 of the 30 as hard. All 7 matched, and each one is decided by a
specific written rule:

| Post | Label | The rule that decides it |
|---|---|---|
| sp_005 "Carbon plates aren't the whole story..." | `analysis` | Rule 1: the opening clause sounds like a hot take, but the two 2% drops are what the claim rests on. |
| sp_010 "Three of us ran the same session..." | `analysis` | Rule 1: the hedged conclusion rests on a checkable observation (within 10 seconds over 5 miles). |
| sp_014 "Times are down about 3%... so obviously..." | `hot_take` | Rule 1: the 3% is decoration. This is nearly the taxonomy's own example. |
| sp_019 "Nobody actually enjoys the long run..." | `hot_take` | Rule 2: reflective in tone, but a general claim about everyone. |
| sp_020 "Every injury thread... is the same injury..." | `hot_take` | Rule 1: checkable in principle, but no count is given. |
| sp_028 "Third DNF this year..." | `reaction` | Rule 3: "third" is countable, but nothing is argued from it. |
| sp_029 "...the shoes I set every PB in... wrong size" | `reaction` | Rule 2: the writer's own realisation, not a claim about shoes in general. |

**What the pattern in my disagreements tells me:**

I think the result says more about how clear this set is than about my
consistency. The rules are tight: every hard case resolves cleanly once you
ask rule 1's question (does the fact carry the argument?) or rule 2's (is it
about the writer or the world?). The set is also structured: the posts run in
blocks of ten per label (sp_001–010 `analysis`, sp_011–020 `hot_take`,
sp_021–030 `reaction`), which makes a clean score easier. And as stated
above, these 30 labels were applied by AI, not by me.

So this 100% is not evidence that my own 200 labels were consistent. My own
taxonomy has a looser hardest boundary (`mechanism` vs `claim_check`, decided
by whether "correctness of a stated claim is central"), and the trained model
sent all 8 test `claim_check` posts to `mechanism`. The staff taxonomy
suggests what would help: a rule that names one observable test, the way rule
1 does with "is the fact load-bearing", instead of a judgment about what is
"central".



---

## The Improvement

**What I changed:** I added 124 more r/AskPhysics posts to `labels.csv`,
taking it from 200 to 324 rows. Nothing else changed: same model, same
settings (3 epochs, lr `2e-5`, batch size 8, 256 tokens) and the same three
seeds. The new posts were collected with `collect_askphysics_more.js`, with
posts already in the dataset removed by `prepare_new_posts.py`. They were
AI-pre-labelled under my existing definitions and boundary rules, then
reviewed and approved by me; each row's `note` records this.

| Label | Before | Added | After |
|---|---|---|---|
| `scenario` | 44 | 36 | 80 |
| `mechanism` | 76 | 38 | 114 |
| `claim_check` | 53 | 26 | 79 |
| `guidance_request` | 27 | 24 | 51 |
| **Total** | **200** | **124** | **324** |

This is broader than "thirty more of the thinnest label": it adds examples to
every label, because my diagnosis found the whole model under-trained, not
one weak label. The split grew from 139 / 31 / 30 to 226 / 49 / 49
(train / val / test), so `guidance_request` now has 8 test posts instead of 4.

**Which diagnosis pointed at it:** Misses 1–3. Before the change, the model
collapsed to `mechanism`: validation accuracy stayed flat at 0.387 through
every epoch on every seed, after only about 54 training steps on 139 posts.
That is a too-little-data problem, so more labelled data was the one change
to make.

### Run Log — After

| Criterion | Target | Seed 42 | Seed 7 | Seed 2024 | Verdict |
|---|---|---|---|---|---|
| 1. Overall accuracy | >= 0.55 each seed | 0.571 | 0.429 | 0.612 | MISSED |
| 2. Macro F1 | >= 0.50 each seed | 0.504 | 0.262 | 0.548 | MISSED |
| 3. Per-label F1 (S/M/C >= 0.45; G >= 0.30) | All label floors each seed | S 0.588; M 0.630; C 0.000; G 0.800 | S 0.500; M 0.548; C 0.000; G 0.000 | S 0.667; M 0.667; C 0.000; G 0.857 | MISSED |
| 4. Label balance (now 324 posts) | Each label 10%-50% | S 24.7%; M 35.2%; C 24.4%; G 15.7% | Same dataset | Same dataset | MET |
| 5. Confidence accuracy (top/low third; gap) | Top >= 0.60 and gap >= 0.10 each seed | 0.625 / 0.500; +0.125 | 0.625 / 0.188; +0.437 | 0.750 / 0.438; +0.312 | MET |

Criterion 4's original wording names a 200-post dataset. I applied the same
10%–50% range to the 324-post dataset the after run trained on; the original
200 posts also met it (see Run Log — Before).

**Before and after, side by side:**

| Measure | Before (42 / 7 / 2024) | After (42 / 7 / 2024) |
|---|---|---|
| Overall accuracy | 0.400 / 0.367 / 0.367 | 0.571 / 0.429 / 0.612 |
| Macro F1 | 0.238 / 0.134 / 0.134 | 0.504 / 0.262 / 0.548 |
| F1 — `scenario` | 0.000 / 0.000 / 0.000 | 0.588 / 0.500 / 0.667 |
| F1 — `mechanism` | 0.550 / 0.537 / 0.537 | 0.630 / 0.548 / 0.667 |
| F1 — `claim_check` | 0.000 / 0.000 / 0.000 | 0.000 / 0.000 / 0.000 |
| F1 — `guidance_request` | 0.400 / 0.000 / 0.000 | 0.800 / 0.000 / 0.857 |
| Accuracy spread across seeds | 0.033 | 0.184 |

**Confusion matrix after (seed 42, 49 held-out posts):**

| true \ predicted | scenario | mechanism | claim_check | guidance_request |
|---|---|---|---|---|
| **scenario** | 5 | 7 | 0 | 0 |
| **mechanism** | 0 | 17 | 0 | 0 |
| **claim_check** | 0 | 11 | 0 | 1 |
| **guidance_request** | 0 | 2 | 0 | 6 |

**Did it help, and how do I know:**

Yes, partly. The verdicts did not change: criteria 1–3 are still missed and
4–5 are still met. But the model is now learning the task instead of guessing
the majority label:

- **The model learns during training now.** Validation accuracy rose every
  epoch on every seed (seed 42: 0.347 → 0.469 → 0.490; seed 2024: 0.347 →
  0.408 → 0.551), where before it was flat at 0.387.
- **Two of three seeds came close to or passed the targets.** Seeds 42 and
  2024 passed the accuracy target (0.571, 0.612) and the macro F1 target
  (0.504, 0.548). `scenario` went from 0.000 to 0.500–0.667 on every seed,
  and `guidance_request` reached 0.800 and 0.857 on two seeds.
- **Seed 7 still mostly collapsed.** It called 45 of 49 posts `mechanism`
  (accuracy 0.429). That is why every criterion with an "each seed" target
  still misses. The accuracy spread grew from 0.033 to 0.184, past the
  10-point instability line. Before, the low spread came from every seed
  collapsing the same way; now the result depends on which posts land in
  training. That instability is itself a finding: 324 posts is still too few
  for a stable measure.
- **`claim_check` did not improve at all.** It is 0.000 on every seed, and no
  seed predicted `claim_check` for a single post. With 26 more `claim_check`
  examples, the other three labels improved and this one didn't. That rules
  out "too few examples" as the main cause for this label and points at my
  hardest boundary: `mechanism` vs `claim_check` is either a genuinely hard
  pair or one my labels apply inconsistently. 11 of the 12 test
  `claim_check` posts were called `mechanism` on seed 42, and none went the
  other way.

One caveat on the comparison: adding data also changed the test split, from
30 posts to 49, so before and after are not scored on identical posts. The
three-seed pattern and the training curves are the stronger evidence that the
change helped.



---

## What's Still Broken

<!-- For each criterion still missed: what you'd do, and why you stopped. -->



**The gap between what I meant my labels to capture and what the model
learned:**
<!-- Two sentences. Your confusion matrix is the evidence. -->



<!-- ═════════════════════════════════════════════════════════════════════

     SUBMISSION CHECKLIST — unit 5

       [ ] criteria.md has five numbered criteria, each naming a NUMBER
       [ ] Each has a reason underneath tied to your data or taxonomy
       [ ] labels.csv: at least 150 rows, text/label/note, ONE file not split
       [ ] No label above 70%
       [ ] All five unit 5 sections have real content
       [ ] Label Taxonomy includes the decision rule for your hardest boundary
       [ ] The Dataset includes three hard cases
       [ ] results.json and test_split.csv committed (the notebook does this)
       [ ] At least four new commits
       [ ] Repository URL submitted — WRITE IT DOWN

     SUBMISSION CHECKLIST — unit 6

       [ ] Baseline vs. Trained table, with your prediction written beforehand
       [ ] Run Log — Before, five criteria across three seeds
       [ ] Confusion matrix TYPED AS A MARKDOWN TABLE
       [ ] A verdict on every criterion
       [ ] A diagnosis for every miss, using the agreement report as evidence
       [ ] Agreement Report with every disagreement adjudicated
       [ ] One improvement, with Run Log — After
       [ ] What's Still Broken
       [ ] results_three_seeds_before.json, results_three_seeds_after.json,
           baseline_results.json and
           agreement_results.json committed
       [ ] At least four new commits
       [ ] The SAME repository URL as last unit

     Do not delete and recreate this repository.
     ═════════════════════════════════════════════════════════════════════ -->

---

📖 **How to run this project: [RUNNING.md](RUNNING.md)**
