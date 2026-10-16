# Acceptance criteria — TakeMeter

Five criteria that say what "working" means for this classifier, written in
unit 5 **before** anything was trained.

**All five are yours this time.** None are given. You've had two projects of
practice. These criteria were updated before training when the taxonomy was
expanded from three labels to four.

An acceptance criterion names a number. *"The model is accurate"* is an
opinion. *"Every label has an F1 of at least 0.60 on the held-out set"* is a
criterion.

Under each, write a sentence or two on **why that number**. A reason that says
something about your data or your taxonomy earns credit — for example, a lower
F1 floor for `guidance_request` because it has only 27 examples and about four
will land in the test split. A reason that could be attached to any project
does not.

> Missing your own targets next unit costs you nothing. Setting a target so
> easy you can't miss it does.

---

## Pick numbers you can defend

Not numbers that sound impressive. Four labels means a balanced random guess
gets about 25%, so a target of 0.40 is barely a target. Your number should sit
somewhere you'd honestly call useful.

**Cover at least three of these five areas.** They're here as prompts, not as a
form to fill in — a criterion that fits none of them is fine if it names a
number.

| Area | A question it could answer |
|---|---|
| Overall accuracy | How often does it need to be right to be worth using? |
| Per-label performance | Is one label allowed to be much worse than the others? |
| Balance | How lopsided can your label counts get before it's a problem? |
| Consistency | If someone else labelled the same posts, how often should you agree? |
| Confidence | Should a confident prediction be right more often than an unsure one? |

Two things worth knowing before you pick numbers, because both will affect
whether you hit them:

- **Your smallest label will have the jumpiest score.** `guidance_request` has
  27 examples, so about 4 land in a 15% test split. An F1 computed on so few
  examples moves a lot between seeds. Its target should be looser than one for
  your biggest label, and saying so is a good reason.
- **Unit 6 tests across three seeds, and the target has to hold across all
  three.** A target of 0.65 against results of 0.71, 0.62, 0.68 is a **miss**.
  Pick with that in mind — it is stricter than it first sounds.

---

## 1.

Across each of the three seeds, held-out overall accuracy is at least 0.55.



**Why this target:** With four labels, a balanced random guess is near 0.25 accuracy. A 0.55 target is a clear improvement while allowing for overlap between question intents and the smaller `guidance_request` class. Requiring it on every seed avoids calling a lucky split a success.



---

## 2.

Across each of the three seeds, macro F1 is at least 0.50.



**Why this target:** Macro F1 gives each label equal weight, so a large label cannot hide poor performance on a smaller one. I set it below the accuracy target because the four categories are not equally common and `guidance_request` has fewer examples.



---

## 3.

Across each of the three seeds, F1 is at least 0.45 for `scenario`, `mechanism`, and `claim_check`, and at least 0.30 for `guidance_request`.



**Why this target:** Each category needs to contribute useful predictions, not just inflate an aggregate score. `guidance_request` has only 27 examples, so roughly four land in a 15% test split; its lower threshold acknowledges that very small support makes F1 jumpy across seeds.



---

## 4.

In my 200-post dataset, each label makes up at least 10% and no more than 50% of all labeled posts.



**Why this target:** If a label is too rare, the model will have few examples to learn from and very few in the test split; if one label dominates, overall accuracy can look good while the model neglects the others. I set a 10% floor for the narrower `guidance_request` class, which still requires at least 20 examples in this 200-post dataset; the current 27 examples clear it.



---

## 5.

Across each of the three seeds, accuracy on the model's most-confident third of held-out posts is at least 0.60 and is at least 0.10 higher than accuracy on its least-confident third.



**Why this target:** A useful confidence score should identify a group of predictions that is more reliable than the model's least-sure predictions. The test split is small, so the 0.10 gap is a modest but checkable improvement; requiring at least 0.60 accuracy in the most-confident group keeps that improvement from being meaningful only in relative terms.



---

<!-- ─────────────────────────────────────────────────────────────────────────
     UNIT 6 — read this before you change anything above.

     If a criterion turns out to be BROKEN rather than merely unmet, you can
     revise it, and that earns credit. But never delete or edit the original
     line. Add the revision underneath, like this:

         ## 2. Every label performs acceptably

         The model performs well on all labels.

         **Why this target:** ...

         > **Revised in unit 6:** Every label has an F1 of at least 0.60 on
         > the held-out set.
         >
         > **Why revised:** "performs well" gave me nothing to check. I
         > couldn't produce a verdict from it at all.

     That's a revision because the criterion couldn't be MEASURED.

     Lowering a target because you missed it is not a revision, and it costs
     you the point:

         ✗ "Overall accuracy of at least 0.65" → "at least 0.55", because
            0.65 turned out to be optimistic for 200 examples.

     A number you missed stays where it is, gets diagnosed, and gets a fix
     attempted. That's where the points are.
     ───────────────────────────────────────────────────────────────────────── -->
