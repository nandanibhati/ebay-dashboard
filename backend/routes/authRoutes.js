const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();

const User = require("../models/User");

// SIGNUP
router.post("/signup", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role,
      joiningDate,
      basicSalary,
      employeeId,
    } = req.body;

    const existingUser = await User.findOne({
      $or: [
        { email },
        { employeeId }
      ],
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email or Employee ID already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

 const user = await User.create({
  name,
  email,
  password: hashedPassword,
  role: role || "employee",
  joiningDate,
  basicSalary,
  employeeId,
});

    res.status(201).json({
      success: true,
      message: "Account Created Successfully",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
// GET ALL EMPLOYEES
router.get("/employees", async (req, res) => {
  try {
    const employees = await User.find({
      role: "employee",
    }).select("-password");

    res.json({
      success: true,
      employees,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// DELETE EMPLOYEE
router.delete("/employee/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: "Employee Deleted",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});


// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid Password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      "secretkey",
      {
        expiresIn: "7d",
      }
    );

    res.json({
      success: true,
      token,
      role: user.role,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// CREATE ADMIN
// CREATE ADMIN
router.get("/create-admin", async (req, res) => {
  try {
    const existingAdmin = await User.findOne({
      email: "penkraft.ltd@gmail.com",
    });

    if (existingAdmin) {
      return res.json({
        success: true,
        message: "Admin already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(
      "Temp@12345",
      10
    );

    const admin = await User.create({
      name: "Admin",
      email: "penkraft.ltd@gmail.com",
      password: hashedPassword,
      role: "admin",
    });

    res.json({
      success: true,
      message: "Admin Created Successfully",
      admin,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
router.put("/employee/:id", async (req, res) => {
  try {
    const employee = await User.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        email: req.body.email,
        employeeId: req.body.employeeId,
        joiningDate: req.body.joiningDate,
        hourlyRate: req.body.hourlyRate,
        basicSalary: req.body.basicSalary,
        monthlyHours: req.body.monthlyHours,
      },
      { new: true }
    );

    res.json({
      success: true,
      employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
router.get("/employee/:email", async (req, res) => {
  try {
    const employee = await User.findOne({
      email: req.params.email,
    }).select("-password");

    res.json({
      success: true,
      employee,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});
module.exports = router;    