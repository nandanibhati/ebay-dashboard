const mongoose = require("mongoose");

// Tells every open browser tab which collection just changed, so pages can
// reload their own data without a manual refresh. Hooked into Mongoose
// itself (not individual routes) so writes from schedulers and order/stock
// syncs are covered too. Only the collection name is broadcast, never the
// data, so this leaks nothing; each page refetches through its normal
// authenticated API.
//
// Must be required before any model is compiled — mongoose.plugin() only
// applies to schemas created after it runs.

let io = null;

// A sync can write hundreds of documents in a burst; send one event per
// collection per second at most.
const DEBOUNCE_MS = 1000;
const pending = new Map();

function notify(collection) {
  if (!io || !collection || pending.has(collection)) return;

  pending.set(
    collection,
    setTimeout(() => {
      pending.delete(collection);
      io.emit("dataChanged", { resource: collection });
    }, DEBOUNCE_MS)
  );
}

// `this` is a document, a query, or a model depending on the hook.
function collectionOf(ctx) {
  return ctx?.model?.collection?.name || ctx?.collection?.name || null;
}

function onWrite() {
  notify(collectionOf(this));
}

mongoose.plugin((schema) => {
  schema.post("save", onWrite);
  schema.post(["updateOne", "deleteOne"], { document: true, query: true }, onWrite);
  schema.post(
    [
      "findOneAndUpdate",
      "findOneAndDelete",
      "findOneAndReplace",
      "replaceOne",
      "updateMany",
      "deleteMany",
    ],
    onWrite
  );
  schema.post("insertMany", onWrite);
  schema.post("bulkWrite", onWrite);
});

function setLiveUpdatesIo(socketServer) {
  io = socketServer;
}

module.exports = { setLiveUpdatesIo };
