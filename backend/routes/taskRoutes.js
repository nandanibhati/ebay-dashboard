const express = require("express");
const router = express.Router();

const Task = require("../models/Task");
const upload = require("../middleware/upload");
const { protect } = require("../middleware/auth");

router.use(protect);

// CREATE TASK
router.post(
  "/create",
  upload.single("screenshot"),
  async (req, res) => {
    try {
      const task = await Task.create({
        title: req.body.title,
        description: req.body.description,
        assignedBy: req.body.assignedBy,
        assignedTo: req.body.assignedTo,
        priority: req.body.priority,
        status: req.body.status,
        startDate: req.body.startDate,
        dueDate: req.body.dueDate,
        progress: req.body.progress || 0,
        screenshot: req.file ? req.file.path : "",
        group: req.body.group || "",
        etcMinutes: req.body.etcMinutes || 0,
        atcMinutes: req.body.atcMinutes || 0,
        l1: req.body.l1 || "",
        l2: req.body.l2 || "",
        trainingLink: req.body.trainingLink || "",
        videoLink: req.body.videoLink || "",
        formLink: req.body.formLink || "",
        formReportLink: req.body.formReportLink || "",
        checklistLink: req.body.checklistLink || "",
      });

      res.status(201).json({
        success: true,
        message: "Task Created Successfully",
        task,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// GET ARCHIVED (SOFT-DELETED) TASKS
router.get("/archived", async (req, res) => {
  try {
    const filter = { isDeleted: true };

    if (req.query.name) {
      filter.$or = [
        { assignedTo: req.query.name },
        { assignedBy: req.query.name },
      ];
    }

    const tasks = await Task.find(filter).sort({
      deletedAt: -1,
    });

    res.json({
      success: true,
      tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// RESTORE ARCHIVED TASK
router.put("/:id/restore", async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { isDeleted: false, deletedBy: "", deletedAt: null },
      { new: true }
    );

    res.json({
      success: true,
      message: "Task Restored Successfully",
      task,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// GET MY TASKS (Employee ke liye)
router.get("/my-tasks/:name", async (req, res) => {
  try {
    const tasks = await Task.find({
      isDeleted: { $ne: true },
      $or: [
        { assignedTo: req.params.name },
        { assignedBy: req.params.name },
      ],
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// GET TASKS ASSIGNED TO EMPLOYEE
router.get("/employee/:name", async (req, res) => {
  try {
    const tasks = await Task.find({
      isDeleted: { $ne: true },
      assignedTo: req.params.name,
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// GET ALL TASKS (Admin ke liye)
router.get("/", async (req, res) => {
  try {
    const tasks = await Task.find({ isDeleted: { $ne: true } }).sort({
      createdAt: -1,
    });

    res.json({
      success: true,
      tasks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// UPDATE TASK
router.put(
  "/:id",
  upload.single("screenshot"),
  async (req, res) => {
    try {
      const updateData = {
        title: req.body.title,
        description: req.body.description,
        assignedTo: req.body.assignedTo,
        assignedBy: req.body.assignedBy,
        priority: req.body.priority,
        status: req.body.status,
        startDate: req.body.startDate,
        dueDate: req.body.dueDate,
        progress: req.body.progress,
        group: req.body.group,
        etcMinutes: req.body.etcMinutes,
        atcMinutes: req.body.atcMinutes,
        l1: req.body.l1,
        l2: req.body.l2,
        trainingLink: req.body.trainingLink,
        videoLink: req.body.videoLink,
        formLink: req.body.formLink,
        formReportLink: req.body.formReportLink,
        checklistLink: req.body.checklistLink,
      };

      if (req.file) {
        updateData.screenshot = req.file.path;
      }

      const task = await Task.findByIdAndUpdate(
        req.params.id,
        updateData,
        { new: true }
      );

      res.json({
        success: true,
        message: "Task Updated Successfully",
        task,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message,
      });
    }
  }
);

// DELETE TASK (soft delete — moves it to Archived Tasks)
router.delete("/:id", async (req, res) => {
  try {
    await Task.findByIdAndUpdate(req.params.id, {
      isDeleted: true,
      deletedBy: req.body?.deletedBy || "Unknown",
      deletedAt: new Date(),
    });

    res.json({
      success: true,
      message: "Task Deleted Successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// PERMANENTLY DELETE AN ARCHIVED TASK
router.delete("/:id/permanent", async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Task Permanently Deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

module.exports = router;