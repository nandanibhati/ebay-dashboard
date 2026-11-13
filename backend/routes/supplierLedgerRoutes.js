const express = require("express");
const router = express.Router();

const SupplierLedgerEntry = require("../models/SupplierLedgerEntry");
const Vendor = require("../models/Vendor");
const documentUpload = require("../middleware/documentUpload");
const { protect, adminOnly } = require("../middleware/auth");

router.use(protect, adminOnly);

// Turn multer/Cloudinary errors (bad file type, too large) into a JSON
// response instead of Express's default HTML error page.
const uploadFile = (req, res, next) => {
  documentUpload.single("file")(req, res, (error) => {
    if (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
    next();
  });
};

function entryFields(body) {
  return {
    supplier: body.supplier,
    type: body.type,
    date: body.date,
    // Stored to the penny so totals add up exactly.
    amount:
      body.amount === undefined || body.amount === ""
        ? body.amount
        : // Exponent form rounds 1.005 → 1.01 (plain *100 gives 1.00).
          Number(Math.round(`${Number(body.amount)}e2`) + "e-2"),
    reference: body.reference || "",
    notes: body.notes || "",
  };
}

function vendorFields(body) {
  return {
    name: (body.name || "").trim(),
    contactPerson: body.contactPerson || "",
    phone: body.phone || "",
    email: body.email || "",
    notes: body.notes || "",
  };
}

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Case-insensitive, so "Acme" and "acme " can't both exist.
function findVendorByName(name, excludeId) {
  const filter = { name: new RegExp(`^${escapeRegex(name)}$`, "i") };
  if (excludeId) filter._id = { $ne: excludeId };
  return Vendor.findOne(filter);
}

// GET ALL VENDORS
router.get("/vendors", async (req, res) => {
  try {
    const vendors = await Vendor.find().sort({ name: 1 });

    res.json({
      success: true,
      vendors,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// CREATE VENDOR
router.post("/vendors", async (req, res) => {
  try {
    const fields = vendorFields(req.body);

    if (!fields.name) {
      return res.status(400).json({
        success: false,
        message: "Vendor name is required",
      });
    }

    if (await findVendorByName(fields.name)) {
      return res.status(400).json({
        success: false,
        message: `A vendor named "${fields.name}" already exists`,
      });
    }

    const vendor = await Vendor.create(fields);

    res.status(201).json({
      success: true,
      message: "Vendor Added",
      vendor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// UPDATE VENDOR (a rename also renames its ledger entries)
router.put("/vendors/:id", async (req, res) => {
  try {
    const fields = vendorFields(req.body);

    if (!fields.name) {
      return res.status(400).json({
        success: false,
        message: "Vendor name is required",
      });
    }

    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    if (await findVendorByName(fields.name, vendor._id)) {
      return res.status(400).json({
        success: false,
        message: `A vendor named "${fields.name}" already exists`,
      });
    }

    const oldName = vendor.name;
    Object.assign(vendor, fields);
    await vendor.save();

    if (oldName !== vendor.name) {
      await SupplierLedgerEntry.updateMany(
        { supplier: oldName },
        { supplier: vendor.name }
      );
    }

    res.json({
      success: true,
      message: "Vendor Updated",
      vendor,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// DELETE VENDOR (only when it has no ledger entries, so no balance is lost)
router.delete("/vendors/:id", async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: "Vendor not found",
      });
    }

    const entryCount = await SupplierLedgerEntry.countDocuments({
      supplier: vendor.name,
    });

    if (entryCount > 0) {
      return res.status(400).json({
        success: false,
        message: `${vendor.name} has ${entryCount} ledger ${entryCount === 1 ? "entry" : "entries"}. Delete those first.`,
      });
    }

    await vendor.deleteOne();

    res.json({
      success: true,
      message: "Vendor Deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// GET ALL ENTRIES
router.get("/", async (req, res) => {
  try {
    const entries = await SupplierLedgerEntry.find().sort({
      date: -1,
      createdAt: -1,
    });

    res.json({
      success: true,
      entries,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// CREATE ENTRY
router.post("/", uploadFile, async (req, res) => {
  try {
    const entry = await SupplierLedgerEntry.create({
      ...entryFields(req.body),
      file: req.file ? req.file.path : "",
      fileName: req.file ? req.file.originalname : "",
      createdBy: req.body.createdBy || "",
    });

    res.status(201).json({
      success: true,
      message: "Entry Added",
      entry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// UPDATE ENTRY
router.put("/:id", uploadFile, async (req, res) => {
  try {
    const updateData = entryFields(req.body);

    if (req.file) {
      updateData.file = req.file.path;
      updateData.fileName = req.file.originalname;
    } else if (req.body.removeFile === "true") {
      updateData.file = "";
      updateData.fileName = "";
    }

    const entry = await SupplierLedgerEntry.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    if (!entry) {
      return res.status(404).json({
        success: false,
        message: "Entry not found",
      });
    }

    res.json({
      success: true,
      message: "Entry Updated",
      entry,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// DELETE ENTRY
router.delete("/:id", async (req, res) => {
  try {
    await SupplierLedgerEntry.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Entry Deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
