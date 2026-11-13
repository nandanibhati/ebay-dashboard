const test = require("node:test");
const assert = require("node:assert/strict");
const { UsageRecorder, BUCKET_MS } = require("../lib/usage");

const S = 1000;
const MIN = 60 * S;
const T0 = 1000 * BUCKET_MS; // a bucket boundary
const excel = { app: "Microsoft Excel", title: "Stock.xlsx" };
const chrome = { app: "Google Chrome", title: "YouTube - Google Chrome" };

// Feed 5-second ticks for `minutes` of one window.
function use(u, from, minutes, win) {
  for (let t = from; t < from + minutes * MIN; t += 5 * S) u.tick(t, t + 5 * S, win);
}
const totals = (items) => Object.fromEntries(items.map((i) => [`${i.app}@${(i.bucket - T0) / MIN}`, i.seconds]));

test("time per app lands in 10-minute buckets", () => {
  const u = new UsageRecorder();
  use(u, T0, 3, excel);
  use(u, T0 + 3 * MIN, 2, chrome);
  u.settle(T0 + 60 * MIN, 0);
  assert.deepEqual(totals(u.drain()), { "Microsoft Excel@0": 180, "Google Chrome@0": 120 });
});

test("ticks crossing a bucket boundary are split", () => {
  const u = new UsageRecorder();
  u.tick(T0 + 9 * MIN, T0 + 11 * MIN, excel);
  u.settle(T0 + 60 * MIN, 0);
  assert.deepEqual(totals(u.drain()), { "Microsoft Excel@0": 60, "Microsoft Excel@10": 60 });
});

test("recent ticks are held back until idle can't claim them", () => {
  const u = new UsageRecorder();
  use(u, T0, 8, excel);
  u.settle(T0 + 8 * MIN, 5 * MIN); // only the first 3 minutes are certain
  assert.deepEqual(totals(u.drain()), { "Microsoft Excel@0": 180 });
});

test("idle backdated into held ticks removes them", () => {
  const u = new UsageRecorder();
  use(u, T0, 8, excel); // window stayed open but last input was at minute 3
  u.dropAfter(T0 + 3 * MIN);
  u.settle(T0 + 8 * MIN, 0);
  assert.deepEqual(totals(u.drain()), { "Microsoft Excel@0": 180 });
});

test("resending sends full totals, and only changed buckets", () => {
  const u = new UsageRecorder();
  use(u, T0, 2, excel);
  u.settle(T0 + 2 * MIN, 0);
  const first = u.drain();
  u.commit(first, T0 + 2 * MIN);
  assert.equal(u.drain().length, 0);

  use(u, T0 + 2 * MIN, 1, excel);
  u.settle(T0 + 3 * MIN, 0);
  assert.deepEqual(totals(u.drain()), { "Microsoft Excel@0": 180 }); // total, not +60
});

test("a change during an upload isn't lost by commit", () => {
  const u = new UsageRecorder();
  use(u, T0, 1, excel);
  u.settle(T0 + MIN, 0);
  const inFlight = u.drain();
  use(u, T0 + MIN, 1, excel);
  u.settle(T0 + 2 * MIN, 0);
  u.commit(inFlight, T0 + 2 * MIN);
  assert.deepEqual(totals(u.drain()), { "Microsoft Excel@0": 120 });
});

test("snapshot / restore keeps unsent and pending time", () => {
  const u = new UsageRecorder();
  use(u, T0, 2, excel);
  u.settle(T0 + 2 * MIN, 0);
  use(u, T0 + 2 * MIN, 1, chrome); // still pending
  const saved = JSON.parse(JSON.stringify(u.snapshot()));

  const v = new UsageRecorder();
  v.restore(saved);
  assert.deepEqual(totals(v.drain()), { "Microsoft Excel@0": 120, "Google Chrome@0": 60 });
});
