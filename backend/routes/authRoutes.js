const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const router = express.Router();
const User = require("../models/User");
const { protect, adminOnly, managerOrAdmin } = require("../middleware/auth");

// Best-effort: if a valid admin/manager token is attached, treat this as a
// staff-created account (Employees.jsx) rather than a public signup request.
function getRequesterRole(req) {
  const header = req.headers.authorization;
  const token = header && header.startsWith("Bearer ") ? header.split(" ")[1] : null;

  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET).role;
  } catch {
    return null;
  }
}

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

    const orConditions = [{ email }];
    if (employeeId) orConditions.push({ employeeId });

    const existingUser = await User.findOne(
      orConditions.length > 1 ? { $or: orConditions } : orConditions[0]
    );

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

    const requesterRole = getRequesterRole(req);
    const isStaffCreated = requesterRole === "admin" || requesterRole === "manager";

    // Public signups can never self-assign a role, and a manager can only
    // create regular employees — only an admin can grant the manager role.
    const finalRole = isStaffCreated
      ? requesterRole === "admin"
        ? role || "employee"
        : "employee"
      : "employee";

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: finalRole,
      status: isStaffCreated ? "approved" : "pending",
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
      message: isStaffCreated
        ? "Account Created Successfully"
        : "Signup request submitted. An admin or manager needs to approve your account before you can log in.",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// PENDING SIGNUPS (admin/manager review queue)
router.get("/pending", protect, managerOrAdmin, async (req, res) => {
  try {
    const pendingUsers = await User.find({ status: "pending" })
      .select("name email createdAt")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      pendingUsers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// APPROVE SIGNUP
router.put("/approve/:id", protect, managerOrAdmin, async (req, res) => {
  try {
    // A manager may only approve regular employees; only an admin can grant
    // the manager role at approval time.
    const requestedRole = req.body.role;
    const role =
      req.user.role === "admin" && requestedRole ? requestedRole : "employee";

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "approved", role },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Signup request not found",
      });
    }

    res.json({
      success: true,
      message: "Account Approved",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// REJECT SIGNUP
router.put("/reject/:id", protect, managerOrAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { status: "rejected" },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Signup request not found",
      });
    }

    res.json({
      success: true,
      message: "Signup Request Rejected",
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

    if (typeof email !== "string" || typeof password !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid email or password",
      });
    }

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

    if (user.status === "pending") {
      return res.status(403).json({
        success: false,
        message: "Your account is awaiting admin/manager approval.",
      });
    }

    if (user.status === "rejected") {
      return res.status(403).json({
        success: false,
        message: "Your signup request was rejected. Contact an admin.",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        email: user.email,
      },
      process.env.JWT_SECRET,
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
// GET ALL USERS FOR CHAT
router.get("/employees", protect, async (req, res) => {
  try {
    const users = await User.find({
      role: { $in: ["admin", "employee"] },
    }).select("-password");

    const isAdmin = req.user?.role === "admin";

    const updatedUsers = users.map((user) => {
      let salaryDate = null;

      if (user.joiningDate) {
        salaryDate = new Date(user.joiningDate);
        salaryDate.setDate(salaryDate.getDate() + 15);
      }

      const userObj = { ...user.toObject(), salaryDate };

      if (!isAdmin) {
        delete userObj.monthlySalary;
        delete userObj.hourlyRate;
        delete userObj.basicSalary;
        delete userObj.lastSalaryPaidMonth;
        delete userObj.lastSalaryPaidYear;
        delete userObj.salaryDate;
      }

      return userObj;
    });

    res.json({
      success: true,
      employees: updatedUsers,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

// GET SINGLE EMPLOYEE
router.get("/employee/:email", protect, async (req, res) => {
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
router.put("/employee/:id", protect, adminOnly, async (req, res) => {
  try {
   

    const updateData = {};

if (req.body.name !== undefined)
  updateData.name = req.body.name;

if (req.body.email !== undefined)
  updateData.email = req.body.email;

if (req.body.role !== undefined)
  updateData.role = req.body.role;

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
router.delete("/employee/:id", protect, adminOnly, async (req, res) => {
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

module.exports = router;