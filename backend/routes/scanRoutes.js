const express = require("express");
const router = express.Router();

const Device = require("../models/Device");
const ScanBatch = require("../models/ScanBatch");
const Stock = require("../models/Stock");
const Vendor = require("../models/Vendor");
const User = require("../models/User");
const SupplierLedgerEntry = require("../models/SupplierLedgerEntry");
const { protect, managerOrAdmin } = require("../middleware/auth");

// Scan In: receive devices from a vendor by scanning each IMEI/serial with
// a barcode scanner (which just types the code + Enter). Every scan:
//   - records the device (IMEI, product, vendor, date, cost, who scanned)
//   - adds 1 to Stock for its SKU
//   - updates the batch's Invoice in the vendor's Supplier Ledger.

router.use(protect, managerOrAdmin);

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const round2 = (n) => Number(Math.round(`${Number(n) || 0}e2`) + "e-2");

// Luhn check digit, used by 15-digit IMEIs.
function luhnValid(digits) {
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    let d = Number(digits[digits.length - 1 - i]);
    if (i % 2 === 1) {
      d *= 2;
      if (d > 9) d -= 9;
    }
    sum += d;
  }
  return sum % 10 === 0;
}

// Returns { code } or { error, warning } — a warning can be overridden by
// the user ("add anyway"), an error can't.
function checkCode(raw) {
  const code = String(raw || "").replace(/\s+/g, "").toUpperCase();
  if (!code) return { error: "Nothing scanned" };
  if (!/^[A-Z0-9\-/]+$/.test(code) || code.length < 5 || code.length > 30) {
    return { error: `"${code}" doesn't look like an IMEI or serial number` };
  }
  if (/^\d+$/.test(code)) {
    if ([8, 12, 13].includes(code.length)) {
      return { code, warning: "This looks like the box's product barcode (EAN/UPC), not the IMEI. Scan the IMEI barcode instead." };
    }
    if (code.length === 15 && !luhnValid(code)) {
      return { code, warning: "This IMEI's check digit is wrong — it may be a misread. Please scan it again." };
    }
  }
  return { code };
}

// Stock follows the same master-SKU logic orders use
// (utils/stockAdjustment.js): a listing SKU with a masterSku moves the
// master's quantity by packQty per unit; otherwise the item itself moves.
async function adjustStock(sku, units) {
  if (!sku || !units) return;
  const item = await Stock.findOne({ sku: sku.trim() });
  if (!item) return;
  const master = item.masterSku ? await Stock.findOne({ sku: item.masterSku.trim() }) : null;
  if (master) {
    await Stock.updateOne({ _id: master._id }, { $inc: { quantity: Number(item.packQty || 1) * units } });
  } else {
    await Stock.updateOne({ _id: item._id }, { $inc: { quantity: units } });
  }
}

// Recount the batch and mirror its total into the vendor's ledger as one
// Invoice entry (created on the first device, removed if it empties).
async function syncBatch(batch) {
  const [totals] = await Device.aggregate([
    { $match: { batch: batch._id } },
    { $group: { _id: null, count: { $sum: 1 }, cost: { $sum: "$cost" } } },
  ]);
  batch.deviceCount = totals?.count || 0;
  batch.totalCost = round2(totals?.cost || 0);

  const fields = {
    supplier: batch.vendor,
    type: "Invoice",
    date: batch.date,
    amount: batch.totalCost,
    reference: batch.reference || `Scan-in ${batch.date}`,
    notes: `${batch.deviceCount} device(s) scanned in — managed from Scan In, edit there`,
    createdBy: batch.createdBy,
  };

  if (batch.deviceCount === 0) {
    if (batch.ledgerEntry) await SupplierLedgerEntry.findByIdAndDelete(batch.ledgerEntry);
    batch.ledgerEntry = null;
  } else if (batch.ledgerEntry && (await SupplierLedgerEntry.exists({ _id: batch.ledgerEntry }))) {
    await SupplierLedgerEntry.findByIdAndUpdate(batch.ledgerEntry, fields);
  } else {
    batch.ledgerEntry = (await SupplierLedgerEntry.create(fields))._id;
  }

  await batch.save();
  return batch;
}

async function scannerName(req) {
  const user = await User.findById(req.user.id).select("name");
  return user?.name || req.user.email || "";
}

function fail(res, error, status = 500) {
  return res.status(status).json({ success: false, message: error.message || error });
}

// Vendor names (the Supplier Ledger itself is admin-only).
router.get("/vendors", async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({ name: 1 }).select("name");
    res.json({ success: true, vendors: vendors.map((v) => v.name) });
  } catch (error) {
    fail(res, error);
  }
});

router.get("/batches", async (req, res) => {
  try {
    const filter = req.query.status === "open" ? { status: "open" } : {};
    const batches = await ScanBatch.find(filter).sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, batches });
  } catch (error) {
    fail(res, error);
  }
});

router.post("/batches", async (req, res) => {
  try {
    const vendor = String(req.body.vendor || "").trim();
    const date = req.body.date;
    if (!vendor || !(await Vendor.exists({ name: vendor }))) {
      return fail(res, "Choose a vendor from the list (add new vendors in Supplier Ledger)", 400);
    }
    if (!DATE_RE.test(date || "")) return fail(res, "Choose a date", 400);

    const batch = await ScanBatch.create({
      vendor,
      date,
      reference: String(req.body.reference || "").slice(0, 100),
      createdBy: await scannerName(req),
    });
    res.status(201).json({ success: true, batch });
  } catch (error) {
    fail(res, error);
  }
});

router.get("/batches/:id", async (req, res) => {
  try {
    const batch = await ScanBatch.findById(req.params.id);
    if (!batch) return fail(res, "Batch not found", 404);
    const devices = await Device.find({ batch: batch._id }).sort({ createdAt: -1 });
    res.json({ success: true, batch, devices });
  } catch (error) {
    fail(res, error);
  }
});

// Edit reference/date, or close/reopen the batch.
router.patch("/batches/:id", async (req, res) => {
  try {
    const batch = await ScanBatch.findById(req.params.id);
    if (!batch) return fail(res, "Batch not found", 404);

    if (req.body.reference !== undefined) batch.reference = String(req.body.reference).slice(0, 100);
    if (["open", "closed"].includes(req.body.status)) batch.status = req.body.status;
    if (req.body.date !== undefined) {
      if (!DATE_RE.test(req.body.date)) return fail(res, "Invalid date", 400);
      batch.date = req.body.date;
      await Device.updateMany({ batch: batch._id }, { receivedDate: batch.date });
    }

    await syncBatch(batch);
    res.json({ success: true, batch });
  } catch (error) {
    fail(res, error);
  }
});

// Only an empty batch can be deleted (remove its devices first).
router.delete("/batches/:id", async (req, res) => {
  try {
    const batch = await ScanBatch.findById(req.params.id);
    if (!batch) return fail(res, "Batch not found", 404);
    if (await Device.exists({ batch: batch._id })) {
      return fail(res, "Remove the scanned devices first", 400);
    }
    if (batch.ledgerEntry) await SupplierLedgerEntry.findByIdAndDelete(batch.ledgerEntry);
    await batch.deleteOne();
    res.json({ success: true });
  } catch (error) {
    fail(res, error);
  }
});

// SCAN — one device into a batch.
router.post("/batches/:id/devices", async (req, res) => {
  try {
    const batch = await ScanBatch.findById(req.params.id);
    if (!batch) return fail(res, "Batch not found", 404);
    if (batch.status !== "open") return fail(res, "This batch is closed. Reopen it to scan more.", 400);

    const check = checkCode(req.body.imei);
    if (check.error) return res.status(400).json({ success: false, message: check.error });
    if (check.warning && req.body.force !== true) {
      return res.status(409).json({ success: false, warning: true, message: check.warning, code: check.code });
    }

    const existing = await Device.findOne({ imei: check.code });
    if (existing) {
      return res.status(409).json({
        success: false,
        duplicate: true,
        message: `Already scanned in on ${existing.receivedDate} from ${existing.vendor}${existing.product ? ` (${existing.product})` : ""}.`,
        device: existing,
      });
    }

    const sku = String(req.body.sku || "").trim();
    const stockItem = sku ? await Stock.findOne({ sku }) : null;

    let device;
    try {
      device = await Device.create({
        imei: check.code,
        sku,
        product: String(req.body.product || stockItem?.product || "").slice(0, 200),
        vendor: batch.vendor,
        receivedDate: batch.date,
        cost: Math.max(0, round2(req.body.cost)),
        batch: batch._id,
        scannedBy: await scannerName(req),
      });
    } catch (error) {
      // Two scanners scanning the same device at the same moment.
      if (error.code === 11000) return fail(res, "This device was just scanned in.", 409);
      throw error;
    }

    await adjustStock(sku, 1);
    await syncBatch(batch);

    res.status(201).json({ success: true, device, batch });
  } catch (error) {
    fail(res, error);
  }
});

// Undo a scan: removes the device, takes it back out of Stock, updates
// the vendor invoice.
router.delete("/batches/:id/devices/:deviceId", async (req, res) => {
  try {
    const batch = await ScanBatch.findById(req.params.id);
    if (!batch) return fail(res, "Batch not found", 404);
    const device = await Device.findOneAndDelete({ _id: req.params.deviceId, batch: batch._id });
    if (!device) return fail(res, "Device not found in this batch", 404);

    await adjustStock(device.sku, -1);
    await syncBatch(batch);
    res.json({ success: true, batch });
  } catch (error) {
    fail(res, error);
  }
});

// Search received devices by IMEI, product, SKU or vendor.
router.get("/devices", async (req, res) => {
  try {
    const q = String(req.query.search || "").trim();
    const filter = {};
    if (q) {
      const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      filter.$or = [{ imei: re }, { product: re }, { sku: re }, { vendor: re }];
    }
    if (DATE_RE.test(req.query.from || "")) filter.receivedDate = { ...filter.receivedDate, $gte: req.query.from };
    if (DATE_RE.test(req.query.to || "")) filter.receivedDate = { ...filter.receivedDate, $lte: req.query.to };

    const devices = await Device.find(filter).sort({ createdAt: -1 }).limit(500);
    res.json({ success: true, devices });
  } catch (error) {
    fail(res, error);
  }
});

module.exports = router;
module.exports.checkCode = checkCode;
