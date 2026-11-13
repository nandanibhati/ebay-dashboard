const test = require("node:test");
const assert = require("node:assert/strict");
const { ActivityTracker } = require("../lib/tracker");

const MIN = 60 * 1000;
const T0 = Date.UTC(2026, 10, 13, 4, 30); // 10:00 IST
const at = (minutes) => T0 + minutes * MIN;
const short = (segs) =>
  segs.map((s) => `${s.markedAsWork ? "work" : s.state} ${(s.start - T0) / MIN}-${(s.end - T0) / MIN}`);

function make() {
  const events = { states: [], idleEnded: [] };
  const tracker = new ActivityTracker({
    idleThresholdSeconds: 300,
    onStateChange: (s) => events.states.push(s),
    onIdleEnded: (p) => events.idleEnded.push(p),
  });
  return { tracker, events };
}

test("active time is reported up to now", () => {
  const { tracker } = make();
  tracker.start(at(0));
  tracker.sample(at(1), 2);
  assert.deepEqual(short(tracker.drain(at(1)).segments), ["active 0-1"]);
});

test("short pauses below the threshold stay active", () => {
  const { tracker } = make();
  tracker.start(at(0));
  tracker.sample(at(4), 240); // 4 min without input < 5 min
  assert.equal(tracker.state, "active");
});

test("idle is backdated to the last input once the threshold passes", () => {
  const { tracker, events } = make();
  tracker.start(at(0));
  tracker.sample(at(7), 300); // last input at minute 2
  assert.equal(tracker.state, "idle");
  assert.deepEqual(short(tracker.drain(at(8)).segments), ["active 0-2", "idle 2-8"]);
  assert.deepEqual(events.states, ["active", "idle"]);
});

test("idle overwrites active that was already uploaded", () => {
  const { tracker } = make();
  tracker.start(at(0));
  tracker.commit(tracker.drain(at(6))); // server has active 0-6
  tracker.sample(at(7), 300); // idle since minute 2
  // Re-sends 2-8 as idle; the server replaces its active 2-6.
  assert.deepEqual(short(tracker.drain(at(8)).segments), ["idle 2-8"]);
});

test("coming back ends idle and offers the idle period", () => {
  const { tracker, events } = make();
  tracker.start(at(0));
  tracker.sample(at(7), 300);
  tracker.sample(at(12), 1); // input again ~minute 12
  assert.equal(tracker.state, "active");
  const end = at(12) - 1000;
  assert.deepEqual(events.idleEnded, [{ start: at(2), end }]);
});

test("'I was working' is queued after the idle so it wins on the server", () => {
  const { tracker, events } = make();
  tracker.start(at(0));
  tracker.sample(at(7), 300);
  tracker.sample(at(12), 0);
  tracker.markAsWork(events.idleEnded[0]);
  assert.deepEqual(short(tracker.drain(at(13)).segments), ["active 0-2", "idle 2-12", "work 2-12", "active 12-13"]);
});

test("a state change during an upload isn't skipped by commit", () => {
  const { tracker } = make();
  tracker.start(at(0));
  const batch = tracker.drain(at(6)); // upload in flight: active 0-6
  tracker.sample(at(7), 300); // meanwhile: idle since minute 2
  tracker.commit(batch);
  // The idle segment must still be sent from minute 2. (Active 0-2 is
  // re-sent too; the server already has it, so that's a harmless no-op.)
  assert.deepEqual(short(tracker.drain(at(8)).segments), ["active 0-2", "idle 2-8"]);
});

test("a failed upload loses nothing", () => {
  const { tracker } = make();
  tracker.start(at(0));
  tracker.drain(at(1)); // upload failed: no commit
  tracker.sample(at(7), 300);
  assert.deepEqual(short(tracker.drain(at(8)).segments), ["active 0-2", "idle 2-8"]);
});

test("a big offline backlog is sent in batches, in order", () => {
  const { tracker } = make();
  for (let i = 0; i < 950; i++) tracker.restore([{ start: at(i), end: at(i + 1), state: "active" }]);
  tracker.start(at(1000));

  const sent = [];
  for (;;) {
    const batch = tracker.drain(at(1001));
    sent.push(...batch.segments);
    tracker.commit(batch);
    if (!batch.more) break;
  }
  assert.equal(sent.length, 951);
  assert.ok(sent.every((s, i) => i === 0 || s.start >= sent[i - 1].start));
  assert.equal(tracker.drain(at(1001)).segments.length, 0);
});

test("stop closes the open segment", () => {
  const { tracker } = make();
  tracker.start(at(0));
  tracker.stop(at(3));
  assert.equal(tracker.state, "stopped");
  assert.deepEqual(short(tracker.drain(at(5)).segments), ["active 0-3"]);
});
