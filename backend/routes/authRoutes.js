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
  monthlySalary,
  monthlyHours,
  employeeId,
} = req.body;

    const existingUser = await User.findOne({
      $or: [{ email }, { employeeId }],
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

    const hourlyRate =
  monthlySalary > 0
    ? Number((monthlySalary / (8 * 6 * 4.33)).toFixed(2))
    : 0;

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || "employee",
      joiningDate,
      monthlySalary,
monthlyHours,
hourlyRate,
lastSalaryPaidMonth: 0,
lastSalaryPaidYear: 0,
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

// GET ALL EMPLOYEES
router.get("/employees", async (req, res) => {
  try {
    const employees = await User.find({
      role: "employee",
    }).select("-password");

    const updatedEmployees = employees.map((emp) => {
      const salaryDate = new Date(emp.joiningDate);
      salaryDate.setDate(
        salaryDate.getDate() + 15
      );

      return {
        ...emp.toObject(),
        salaryDate,
      };
    });

    res.json({
      success: true,
      employees: updatedEmployees,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// GET SINGLE EMPLOYEE
router.get("/employee/:email", async (req, res) => {
  try {
    const employee = await User.findOne({
      email: req.params.email,
    }).select("-password");

    if (!employee) {
      return res.status(404).json({
        success: false,
        message: "Employee not found",
      });
    }

    const salaryDate = new Date(
      employee.joiningDate
    );

    salaryDate.setDate(
      salaryDate.getDate() + 15
    );

    res.json({
      success: true,
      employee: {
        ...employee.toObject(),
        salaryDate,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// UPDATE EMPLOYEE
router.put("/employee/:id", async (req, res) => {
  try {
   

    const updateData = {};

if (req.body.name !== undefined)
  updateData.name = req.body.name;

if (req.body.email !== undefined)
  updateData.email = req.body.email;

if (req.body.employeeId !== undefined)
  updateData.employeeId = req.body.employeeId;

if (req.body.joiningDate !== undefined)
  updateData.joiningDate = req.body.joiningDate;

if (req.body.monthlySalary !== undefined) {
  updateData.monthlySalary = req.body.monthlySalary;

  updateData.hourlyRate = Number(
    (
      req.body.monthlySalary /
      (8 * 6 * 4.33)
    ).toFixed(2)
  );
}

if (req.body.monthlyHours !== undefined)
  updateData.monthlyHours = req.body.monthlyHours;

if (req.body.lastSalaryPaidMonth !== undefined)
  updateData.lastSalaryPaidMonth =
    req.body.lastSalaryPaidMonth;

if (req.body.lastSalaryPaidYear !== undefined)
  updateData.lastSalaryPaidYear =
    req.body.lastSalaryPaidYear;

const employee = await User.findByIdAndUpdate(
  req.params.id,
  updateData,
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

// DELETE EMPLOYEE
router.delete("/employee/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(
      req.params.id
    );

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

// CREATE ADMIN
router.get("/create-admin", async (req, res) => {
  try {
    const existingAdmin =
      await User.findOne({
        email: "penkraft.ltd@gmail.com",
      });

    if (existingAdmin) {
      return res.json({
        success: true,
        message: "Admin already exists",
      });
    }

    const hashedPassword =
      await bcrypt.hash(
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

module.exports = router;