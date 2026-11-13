// Turns "seconds since last keyboard/mouse input" samples into active and
// idle segments. Pure logic with no Electron dependency, so it can be
// tested on its own.
//
// Idle can only be detected after the fact: once input has stopped for
// the idle threshold, the idle period is backdated to the last input.
// Time already reported as active from then on gets overwritten — the
// server applies segments in the order sent and newer ones replace
// whatever they overlap. So segments must always be sent in the order
// they were learned, which is the order of `queue`.

const MAX_QUEUE = 20000; // ≈ two weeks offline at one segment per minute

class ActivityTracker {
  constructor({ idleThresholdSeconds = 300, onIdleEnded = () => {}, onStateChange = () => {} } = {}) {
    this.idleThresholdMs = idleThresholdSeconds * 1000;
    this.onIdleEnded = onIdleEnded;
    this.onStateChange = onStateChange;

    // While tracking: { state, start, sentFrom }. `sentFrom` is where the
    // next upload of this open segment begins.
    this.current = null;
    // Closed segments not yet acknowledged by the server, oldest first.
    this.queue = [];
  }

  get tracking() {
    return this.current !== null;
  }

  get state() {
    return this.current ? this.current.state : "stopped";
  }

  setIdleThreshold(seconds) {
    if (seconds > 0) this.idleThresholdMs = seconds * 1000;
  }

  start(now) {
    if (this.current) return;
    this.current = { state: "active", start: now, sentFrom: now };
    this.onStateChange("active");
  }

  stop(now) {
    if (!this.current) return;
    this._close(now);
    this.current = null;
    this.onStateChange("stopped");
  }

  // Feed one sample: `idleSeconds` = time since the last user input.
  sample(now, idleSeconds) {
    if (!this.current) return;
    const idleMs = idleSeconds * 1000;
    const lastInputAt = Math.max(now - idleMs, this.current.start);

    if (this.current.state === "active" && idleMs >= this.idleThresholdMs) {
      this._close(lastInputAt);
      this.current = { state: "idle", start: lastInputAt, sentFrom: lastInputAt };
      this.onStateChange("idle");
    } else if (this.current.state === "idle" && idleMs < this.idleThresholdMs) {
      const idleStart = this.current.start;
      this._close(lastInputAt);
      this.current = { state: "active", start: lastInputAt, sentFrom: lastInputAt };
      this.onStateChange("active");
      if (lastInputAt > idleStart) this.onIdleEnded({ start: idleStart, end: lastInputAt });
    }
  }

  // Employee says an idle period was work.
  markAsWork({ start, end }) {
    if (end > start) this._push({ start, end, state: "idle", markedAsWork: true });
  }

  // What to upload now. Pass the result to commit() once the server has
  // accepted it. On failure do nothing: the next drain() resends it all.
  // Never have two uploads in flight at once.
  // At most `limit` segments (the server accepts 500 per request); after a
  // long offline spell, call again until `more` is false.
  drain(now, limit = 400) {
    const segments = this.queue.slice(0, limit);
    const more = this.queue.length > limit;
    const includeOpen = !more && this.current && now > this.current.sentFrom;
    if (includeOpen) {
      segments.push({ start: this.current.sentFrom, end: now, state: this.current.state });
    }
    return {
      segments,
      queued: segments.length - (includeOpen ? 1 : 0),
      current: includeOpen ? this.current : null,
      until: now,
      more,
    };
  }

  commit(batch) {
    this.queue.splice(0, batch.queued);
    // Only if the open segment is still the one that was sent: if the
    // state changed meanwhile (e.g. idle was backdated into the span just
    // sent), the new segment must still send from its own start.
    if (this.current && this.current === batch.current) {
      this.current.sentFrom = Math.max(this.current.sentFrom, batch.until);
    }
  }

  // For saving to disk on quit / restoring on start.
  snapshot(now) {
    return this.drain(now, Infinity).segments;
  }

  restore(segments) {
    if (Array.isArray(segments)) segments.forEach((s) => this._push(s));
  }

  _close(end) {
    if (end > this.current.sentFrom) {
      this._push({ start: this.current.sentFrom, end, state: this.current.state });
    }
  }

  _push(segment) {
    this.queue.push(segment);
    if (this.queue.length > MAX_QUEUE) this.queue.splice(0, this.queue.length - MAX_QUEUE);
  }
}

module.exports = { ActivityTracker };
