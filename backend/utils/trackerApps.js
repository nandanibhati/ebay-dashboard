// Helpers for the tracker's app & website usage: deriving a website name
// from a browser window title, and classifying apps/sites as productive
// or unproductive using admin-defined rules.

const BROWSER_RE = /\b(chrome|chromium|edge|firefox|brave|opera|safari|vivaldi|arc)\b/i;
const SEPARATORS = /\s+[-–—|·]\s+/;
const PROFILE_RE = /^(profile \d+|personal|work|default)$/i;

function isBrowser(app) {
  return BROWSER_RE.test(app || "");
}

// "Song name - YouTube - Google Chrome"  → "YouTube"
// "Inbox (3) - me@x.com - Gmail - Google Chrome" → "Gmail"
// "Seller Hub | eBay — Mozilla Firefox" → "eBay"
// Titles carry no URL, so this is a best guess: the site's own name is
// usually the last part of the page title.
function siteFromWindow(app, title) {
  if (!isBrowser(app) || !title) return null;

  const parts = title
    // Edge puts a zero-width space in "Microsoft​ Edge".
    .replace(/[​-‍﻿]/g, "")
    .replace(/ and \d+ more pages?/i, "")
    .split(SEPARATORS)
    .map((p) => p.trim())
    .filter(Boolean);

  while (parts.length > 1 && (BROWSER_RE.test(parts[parts.length - 1]) || PROFILE_RE.test(parts[parts.length - 1]))) {
    parts.pop();
  }
  if (parts.length === 0) return null;

  // Drop unread counts like "(3) ".
  let site = parts[parts.length - 1].replace(/^\(\d+\+?\)\s*/, "").trim();
  if (BROWSER_RE.test(site) && parts.length === 1) return null; // new tab etc.
  if (site.length > 60) site = `${site.slice(0, 57)}…`;
  return site || null;
}

const CATEGORIES = ["productive", "neutral", "unproductive"];

// Rules: [{ pattern, category }]. A rule matches when its pattern appears
// (case-insensitive) in the app name or site name; the longest matching
// pattern wins, so "youtube studio" can override "youtube".
function classify(rules, app, site) {
  const haystacks = [app, site].filter(Boolean).map((s) => s.toLowerCase());
  let best = null;
  for (const rule of rules) {
    const pattern = (rule.pattern || "").toLowerCase();
    if (!pattern) continue;
    if (haystacks.some((h) => h.includes(pattern)) && (!best || pattern.length > best.pattern.length)) {
      best = { pattern, category: rule.category };
    }
  }
  return best ? best.category : "neutral";
}

const SUGGESTED_UNPRODUCTIVE = [
  "YouTube",
  "Netflix",
  "Prime Video",
  "Hotstar",
  "Instagram",
  "Facebook",
  "Snapchat",
  "Reddit",
  "Spotify",
  "Steam",
];

module.exports = { siteFromWindow, classify, isBrowser, CATEGORIES, SUGGESTED_UNPRODUCTIVE };
