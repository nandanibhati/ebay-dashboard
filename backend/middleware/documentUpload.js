const multer = require("multer");
const path = require("path");
const cloudinary = require("../config/cloudinary");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

// Like upload.js but also accepts PDFs, for invoices. PDFs go up as "raw"
// files because Cloudinary blocks PDF delivery from the image pipeline on
// many accounts by default.
const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    if (file.mimetype === "application/pdf") {
      const base = path
        .basename(file.originalname, path.extname(file.originalname))
        .replace(/[^a-zA-Z0-9_-]/g, "_")
        .slice(0, 60);

      return {
        folder: "ebay-dashboard/invoices",
        resource_type: "raw",
        public_id: `${Date.now()}-${base}.pdf`,
      };
    }

    return {
      folder: "ebay-dashboard/invoices",
      allowed_formats: ["jpg", "jpeg", "png", "webp"],
    };
  },
});

const documentUpload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf" || IMAGE_TYPES.includes(file.mimetype)) {
      return cb(null, true);
    }
    cb(new Error("Only PDF, JPG, PNG or WEBP files are allowed"));
  },
});

module.exports = documentUpload;
