const express = require("express");
const router = express.Router();

const Note = require("../models/Notes");
const upload = require("../middleware/upload");

/* Create Note */
router.post(
  "/create",
  upload.single("screenshot"),
  async (req, res) => {
    try {
      const note = await Note.create({
        title: req.body.title,
        content: req.body.content,
        status: req.body.status,
        createdBy: req.body.createdBy,
        screenshot: req.file ? req.file.path : "",
      });

      res.status(201).json({
        success: true,
        message: "Note Created Successfully",
        note,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/* Get All Notes */
router.get("/", async (req, res) => {
  try {
    const notes = await Note.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      notes,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/* Update Note */
router.put(
  "/:id",
  upload.single("screenshot"),
  async (req, res) => {
    try {
      const updateData = {
        title: req.body.title,
        content: req.body.content,
        status: req.body.status,
        createdBy: req.body.createdBy,
      };

      if (req.file) {
        updateData.screenshot = req.file.path;
      }

      const note = await Note.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      res.json({
        success: true,
        message: "Note Updated",
        note,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

/* Delete Note */
router.delete("/:id", async (req, res) => {
  try {
    await Note.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Note Deleted",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;