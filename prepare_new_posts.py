"""
Add a second batch of r/AskPhysics posts to labels.csv.

    python prepare_new_posts.py prepare   # askphysics_new_posts.csv -> new_labels.csv
    python prepare_new_posts.py merge     # new_labels.csv (labelled) -> labels.csv

`prepare` drops posts already in labels.csv and keeps the first 200, with
blank label/note columns and the URL so you can check each one on Reddit.
`merge` refuses to run until every row has one of the four labels, then
appends text/label/note to labels.csv.
"""

import csv
import sys

LABELS = {"scenario", "mechanism", "claim_check", "guidance_request"}
NEW_BATCH = 200


def read_rows(path):
    with open(path, encoding="utf-8-sig", newline="") as f:
        return [{k.strip(): (v or "").strip() for k, v in row.items()}
                for row in csv.DictReader(f)]


def write_rows(path, fields, rows, mode="w"):
    with open(path, mode, encoding="utf-8", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fields, extrasaction="ignore")
        if mode == "w":
            writer.writeheader()
        writer.writerows(rows)


def normalize(text):
    return " ".join(text.split()).lower()


def prepare():
    seen = {normalize(r["text"]) for r in read_rows("labels.csv")}
    fresh = []
    for row in read_rows("askphysics_new_posts.csv"):
        key = normalize(row["text"])
        if key not in seen:
            seen.add(key)
            fresh.append({"text": row["text"], "label": "", "note": "",
                          "url": row["url"]})
    batch = fresh[:NEW_BATCH]
    write_rows("new_labels.csv", ["text", "label", "note", "url"], batch)
    print(f"{len(fresh)} posts not already in labels.csv; "
          f"wrote {len(batch)} to new_labels.csv.")
    if len(batch) < NEW_BATCH:
        print("Fewer than 200. Re-run the browser script later for more.")


def merge():
    rows = read_rows("new_labels.csv")
    bad = [i + 1 for i, r in enumerate(rows) if r["label"] not in LABELS]
    if bad:
        sys.exit(f"Posts with a missing or misspelled label (1 = first post): "
                 f"{bad[:20]}{' ...' if len(bad) > 20 else ''}")
    existing = {normalize(r["text"]) for r in read_rows("labels.csv")}
    rows = [r for r in rows if normalize(r["text"]) not in existing]
    with open("labels.csv", "rb") as f:
        f.seek(-1, 2)
        needs_newline = f.read(1) not in (b"\n", b"\r")
    if needs_newline:
        with open("labels.csv", "a", encoding="utf-8", newline="") as f:
            f.write("\r\n")
    write_rows("labels.csv", ["text", "label", "note"], rows, mode="a")
    print(f"Appended {len(rows)} rows to labels.csv.")


if __name__ == "__main__":
    {"prepare": prepare, "merge": merge}.get(
        sys.argv[1] if len(sys.argv) > 1 else "",
        lambda: sys.exit(__doc__))()
