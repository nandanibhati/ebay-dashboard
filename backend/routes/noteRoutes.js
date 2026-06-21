const express = require("express");
const router = express.Router();

const Note = require("../models/Notes");

/* Create Note */
router.post("/create", async (req, res) => {
  try {
    const note = new Note(req.body);

    await note.save();

    res.status(201).json({
      success: true,
      message: "Note Created Successfully",
      note,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

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
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/* Update Note */
router.put("/:id", async (req, res) => {
  try {
    const note =
      await Note.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true }
      );

    res.json({
      success: true,
      message: "Note Updated",
      note,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

/* Delete Note */
router.delete("/:id", async (req, res) => {
  try {
    await Note.findByIdAndDelete(
      req.params.id
    );

    res.json({
      success: true,
      message: "Note Deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;