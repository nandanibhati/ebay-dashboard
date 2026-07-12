const express = require("express");
const router = express.Router();

const Template = require("../models/Template");
const { protect } = require("../middleware/auth");

router.use(protect);

router.get("/", async (req, res) => {
  try {
    const templates = await Template.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      templates,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.post("/", async (req, res) => {
  try {
    const template = await Template.create({
      title: req.body.title,
      content: req.body.content,
      category: req.body.category || "General",
      createdBy: req.body.createdBy,
    });

    res.status(201).json({
      success: true,
      template,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const template = await Template.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        content: req.body.content,
        category: req.body.category,
      },
      { new: true }
    );

    res.json({
      success: true,
      template,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    await Template.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Template Deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
