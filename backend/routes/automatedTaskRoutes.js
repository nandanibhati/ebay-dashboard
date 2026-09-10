const express = require("express");
const router = express.Router();

const AutomatedTask = require("../models/AutomatedTask");
const upload = require("../middleware/upload");
const { protect, managerOrAdmin } = require("../middleware/auth");

router.use(protect, managerOrAdmin);

// CREATE AUTOMATED TASK
router.post("/create", upload.single("image"), async (req, res) => {
  try {
    const automatedTask = await AutomatedTask.create({
      title: req.body.title,
      description: req.body.description,
      group: req.body.group,
      assignedBy: req.body.assignedBy,
      assignedTo: req.body.assignedTo,
      priority: req.body.priority || "Medium",
      etcMinutes: req.body.etcMinutes || 0,
      l1: req.body.l1,
      l2: req.body.l2,
      trainingLink: req.body.trainingLink,
      videoLink: req.body.videoLink,
      formLink: req.body.formLink,
      formReportLink: req.body.formReportLink,
      checklistLink: req.body.checklistLink,
      image: req.file ? req.file.path : "",
      time: req.body.time,
      frequency: req.body.frequency,
      weekday:
        req.body.weekday !== undefined && req.body.weekday !== ""
          ? Number(req.body.weekday)
          : null,
      dayOfMonth:
        req.body.dayOfMonth !== undefined && req.body.dayOfMonth !== ""
          ? Number(req.body.dayOfMonth)
          : null,
    });

    res.status(201).json({
      success: true,
      message: "Automated Task Created Successfully",
      automatedTask,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// GET ALL AUTOMATED TASKS
router.get("/", async (req, res) => {
  try {
    const automatedTasks = await AutomatedTask.find().sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      automatedTasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// UPDATE AUTOMATED TASK
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const updateData = {
      title: req.body.title,
      description: req.body.description,
      group: req.body.group,
      assignedBy: req.body.assignedBy,
      assignedTo: req.body.assignedTo,
      priority: req.body.priority,
      etcMinutes: req.body.etcMinutes,
      l1: req.body.l1,
      l2: req.body.l2,
      trainingLink: req.body.trainingLink,
      videoLink: req.body.videoLink,
      formLink: req.body.formLink,
      formReportLink: req.body.formReportLink,
      checklistLink: req.body.checklistLink,
      time: req.body.time,
      frequency: req.body.frequency,
      weekday:
        req.body.weekday !== undefined && req.body.weekday !== ""
          ? Number(req.body.weekday)
          : null,
      dayOfMonth:
        req.body.dayOfMonth !== undefined && req.body.dayOfMonth !== ""
          ? Number(req.body.dayOfMonth)
          : null,
    };

    if (req.file) {
      updateData.image = req.file.path;
    }

    const automatedTask = await AutomatedTask.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json({
      success: true,
      message: "Automated Task Updated Successfully",
      automatedTask,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// TOGGLE ACTIVE
router.patch("/:id/toggle", async (req, res) => {
  try {
    const automatedTask = await AutomatedTask.findById(req.params.id);

    if (!automatedTask) {
      return res.status(404).json({
        success: false,
        message: "Automated Task Not Found",
      });
    }

    automatedTask.active = !automatedTask.active;
    await automatedTask.save();

    res.json({
      success: true,
      automatedTask,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// DELETE AUTOMATED TASK
router.delete("/:id", async (req, res) => {
  try {
    await AutomatedTask.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Automated Task Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;
