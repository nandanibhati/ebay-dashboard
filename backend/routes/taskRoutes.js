const express = require("express");
const router = express.Router();

const Task = require("../models/Task");

// CREATE TASK
router.post("/create", async (req, res) => {
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
});

// GET MY TASKS (Employee ke liye)
router.get("/my-tasks/:name", async (req, res) => {
  try {
    const tasks = await Task.find({
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
    const tasks = await Task.find().sort({
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
router.put("/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        description: req.body.description,
        assignedTo: req.body.assignedTo,
        priority: req.body.priority,
        status: req.body.status,
        startDate: req.body.startDate,
        dueDate: req.body.dueDate,
        progress: req.body.progress,
      },
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
});

// DELETE TASK
router.delete("/:id", async (req, res) => {
  try {
    await Task.findByIdAndDelete(req.params.id);

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

module.exports = router;