// Run in the browser DevTools Console while on any www.reddit.com page
// (e.g. https://www.reddit.com/r/AskPhysics/).
// Downloads askphysics_new_posts.csv with 300 whole r/AskPhysics submission posts
// (title + full body in `text`) and each post's URL. prepare_new_posts.py
// then drops any already in labels.csv and keeps 200 to label.
// Uses Reddit's public JSON listings, so bodies come back complete and
// untruncated. Comments/replies are not included.

(async () => {
  const SUBREDDIT = "AskPhysics";
  const TARGET_POSTS = 300;   // extra headroom: some will duplicate posts already in labels.csv
  const MIN_BODY_CHARS = 1;   // raise (e.g. 40) to skip title-only/near-empty posts
  const WAIT_MS = 1500;       // pause between requests to stay under rate limits
  // Listings tried in order until TARGET_POSTS is reached. Each pages up to ~1000 posts.
  const LISTINGS = ["new", "hot", "top?t=week", "top?t=month", "top?t=year",
    "top?t=all", "controversial?t=year"];

  if (!location.hostname.endsWith("reddit.com")) {
    throw new Error("Open https://www.reddit.com/r/AskPhysics/ before running this script.");
  }

  const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
  const posts = new Map();   // id -> { text, url }

  function keep(p) {
    const body = (p.selftext || "").trim();
    return p.is_self &&
      !p.stickied &&
      !p.promoted &&
      !p.over_18 &&
      !p.removed_by_category &&
      body !== "[removed]" &&
      body !== "[deleted]" &&
      body.length >= MIN_BODY_CHARS;
  }

  async function fetchPage(listing, after) {
    const sep = listing.includes("?") ? "&" : "?";
    const url = `/r/${SUBREDDIT}/${listing}.json${sep}limit=100&raw_json=1` +
      (after ? `&after=${after}` : "");
    for (let attempt = 0; attempt < 5; attempt++) {
      try {
        const res = await fetch(url, { credentials: "include" });
        if (res.ok) return res.json();
        console.warn(`${res.status} on ${url}, retrying...`);
      } catch (err) {
        console.warn(`${err.message} on ${url}, retrying...`);
      }
      await wait(5000 * (attempt + 1));   // back off: 5s, 10s, 15s, ...
    }
    console.warn(`Giving up on ${url}; moving to the next listing.`);
    return null;
  }

  for (const listing of LISTINGS) {
    let after = null;
    do {
      const json = await fetchPage(listing, after);
      if (!json?.data?.children) break;
      for (const { data: p } of json.data.children) {
        if (posts.size >= TARGET_POSTS) break;
        if (posts.has(p.id) || !keep(p)) continue;
        posts.set(p.id, {
          text: `${p.title.trim()}\n\n${p.selftext.trim()}`,
          url: `https://www.reddit.com${p.permalink}`,
        });
      }
      after = json.data.after;
      console.info(`[${listing}] collected ${posts.size}/${TARGET_POSTS}`);
      await wait(WAIT_MS);
    } while (after && posts.size < TARGET_POSTS);
    if (posts.size >= TARGET_POSTS) break;
  }

  const rows = [...posts.values()];
  if (!rows.length) throw new Error("No AskPhysics submissions found.");
  if (rows.length < TARGET_POSTS) {
    console.warn(`Only found ${rows.length}/${TARGET_POSTS} posts. Downloading what ` +
      "was collected; wait a minute and re-run to try again.");
  }

  const escapeCsv = value => `"${String(value).replace(/"/g, '""')}"`;
  function download(name, header, records) {
    const lines = [header, ...records].map(r => r.map(escapeCsv).join(","));
    const csv = `﻿${lines.join("\r\n")}\r\n`;
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  }

  // Text plus source link, so you can check any post on Reddit while labelling.
  download("askphysics_new_posts.csv", ["text", "url"],
    rows.map(r => [r.text, r.url]));

  console.info(
    `Downloaded ${rows.length} posts to askphysics_new_posts.csv ` +
    "in your browser's download folder. Move it into the repo, then run " +
    "python prepare_new_posts.py prepare"
  );
})();
