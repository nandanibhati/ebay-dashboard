// Accumulates "which app / window was in front" time, in 10-minute buckets.
//
// Only active time counts. Idle is detected after the fact (backdated by
// the idle threshold), so recent ticks are held back as `pending` until
// they're older than the threshold; if idle turns out to have started
// earlier, dropAfter() discards them.
//
// Uploads send each bucket's full total (not a delta), so a retried
// upload can't double-count: the server just overwrites.

const BUCKET_MS = 10 * 60 * 1000;
const KEEP_SENT_MS = 2 * 60 * 60 * 1000;

class UsageRecorder {
  constructor() {
    this.pending = []; // { start, end, app, title }
    this.buckets = new Map(); // key -> { bucket, app, title, ms, rev, sentRev }
  }

  // Foreground window `win` was in use from `start` to `end`.
  tick(start, end, win) {
    if (!win || !win.app || end <= start) return;
    this.pending.push({ start, end, app: win.app, title: win.title || "" });
  }

  // Idle actually began at `t`: anything after it wasn't active use.
  dropAfter(t) {
    this.pending = this.pending
      .filter((p) => p.start < t)
      .map((p) => (p.end > t ? { ...p, end: t } : p));
  }

  // Move ticks that can no longer be reclassified into buckets.
  settle(now, holdMs) {
    const cutoff = now - holdMs;
    const keep = [];
    for (const p of this.pending) {
      if (p.end <= cutoff) this._add(p);
      else keep.push(p);
    }
    this.pending = keep;
  }

  _add({ start, end, app, title }) {
    // A tick can straddle a bucket boundary; split it.
    let cursor = start;
    while (cursor < end) {
      const bucket = Math.floor(cursor / BUCKET_MS) * BUCKET_MS;
      const pieceEnd = Math.min(end, bucket + BUCKET_MS);
      const key = `${bucket}\u0000${app}\u0000${title}`;
      const entry = this.buckets.get(key) || { bucket, app, title, ms: 0, rev: 0, sentRev: 0 };
      entry.ms += pieceEnd - cursor;
      entry.rev += 1;
      this.buckets.set(key, entry);
      cursor = pieceEnd;
    }
  }

  // Buckets changed since they were last accepted by the server.
  drain(limit = 500) {
    const items = [];
    for (const [key, e] of this.buckets) {
      if (e.rev === e.sentRev) continue;
      items.push({ key, rev: e.rev, bucket: e.bucket, app: e.app, title: e.title, seconds: Math.round(e.ms / 1000) });
      if (items.length >= limit) break;
    }
    return items;
  }

  commit(items, now) {
    for (const item of items) {
      const e = this.buckets.get(item.key);
      if (e) e.sentRev = Math.max(e.sentRev, item.rev);
    }
    // Forget old buckets the server already has.
    for (const [key, e] of this.buckets) {
      if (e.rev === e.sentRev && e.bucket < now - KEEP_SENT_MS) this.buckets.delete(key);
    }
  }

  // For saving to disk; restore() treats everything as unsent.
  snapshot() {
    return {
      pending: this.pending,
      buckets: [...this.buckets.values()].filter((e) => e.rev !== e.sentRev),
    };
  }

  restore(saved) {
    if (!saved) return;
    (saved.buckets || []).forEach((e) => {
      const key = `${e.bucket}\u0000${e.app}\u0000${e.title}`;
      this.buckets.set(key, { ...e, rev: e.rev || 1, sentRev: 0 });
    });
    (saved.pending || []).forEach((p) => this._add(p));
  }
}

module.exports = { UsageRecorder, BUCKET_MS };
