const jwt = require("jsonwebtoken");

function getToken(req) {
  const header = req.headers.authorization;

  if (header && header.startsWith("Bearer ")) {
    return header.split(" ")[1];
  }

  if (req.query.token) {
    return req.query.token;
  }

  return null;
}

exports.protect = (req, res, next) => {
  const token = getToken(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, no token",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Desktop-tracker tokens live on employee PCs for months; they may only
    // report tracker data, never use the rest of the API.
    if (decoded.scope === "tracker" && !req.originalUrl.startsWith("/api/tracker/agent/")) {
      return res.status(403).json({
        success: false,
        message: "This token can only be used by the desktop tracker",
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Not authorized, invalid or expired token",
    });
  }
};

exports.adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access required",
    });
  }

  next();
};

exports.managerOrAdmin = (req, res, next) => {
  if (!req.user || (req.user.role !== "admin" && req.user.role !== "manager")) {
    return res.status(403).json({
      success: false,
      message: "Manager or admin access required",
    });
  }

  next();
};
