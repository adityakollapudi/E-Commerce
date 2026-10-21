import jwt from "jsonwebtoken";
import { findUserById } from "../data/users.js";

export const JWT_SECRET = process.env.JWT_SECRET || "shop_ecommerce_jwt_super_secret_key_2025";

// Middleware to authenticate JWT token
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Authentication token missing. Please log in.",
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User session invalid or expired. Please log in again.",
      });
    }

    // Attach user info to request
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      message: "Invalid or expired session token. Please log in again.",
    });
  }
};

// Middleware to strictly enforce Admin role
export const requireAdmin = (req, res, next) => {
  authenticateToken(req, res, () => {
    if (req.user && req.user.role === "admin") {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: "Access denied. Administrator privileges are required to perform this action.",
      });
    }
  });
};
