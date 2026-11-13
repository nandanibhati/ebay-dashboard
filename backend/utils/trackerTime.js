// Business-day helpers for the time tracker. The team works on India time
// (same as taskScheduler.js / attendanceRoutes.js). Asia/Kolkata has no
// daylight saving, so a fixed +05:30 offset is exact.
const IST_OFFSET_MS = (5 * 60 + 30) * 60 * 1000;

// YYYY-MM-DD of the business day a moment falls in.
function businessDate(date) {
  return new Date(new Date(date).getTime() + IST_OFFSET_MS).toISOString().slice(0, 10);
}

// The instant the business day containing `date` ends.
function nextBusinessMidnight(date) {
  const shifted = new Date(new Date(date).getTime() + IST_OFFSET_MS);
  return new Date(
    Date.UTC(shifted.getUTCFullYear(), shifted.getUTCMonth(), shifted.getUTCDate() + 1) - IST_OFFSET_MS
  );
}

// Split [start, end) at each business midnight it crosses, so every piece
// belongs to exactly one business date.
function splitAtBusinessMidnight(start, end) {
  const pieces = [];
  let cursor = new Date(start);
  const stop = new Date(end);

  while (cursor < stop) {
    const boundary = nextBusinessMidnight(cursor);
    const pieceEnd = boundary < stop ? boundary : stop;
    pieces.push({ start: cursor, end: pieceEnd, date: businessDate(cursor) });
    cursor = pieceEnd;
  }

  return pieces;
}

module.exports = { businessDate, nextBusinessMidnight, splitAtBusinessMidnight };
