import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import { findUserById } from "../data/users.js";

dotenv.config();

// Enforces secure JWT Secret retrieval with zero insecure fallbacks
export const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret || typeof secret !== "string" || secret.trim().length === 0) {
    throw new Error(
      "FATAL: Missing JWT_SECRET environment variable. Backend cannot start securely without a configured JWT secret."
    );
  }
  if (secret.trim().length < 32) {
    throw new Error(
      "FATAL: JWT_SECRET must be at least 32 characters long for cryptographic security."
    );
  }
  return secret.trim();
};

// Fail-fast configuration validation at backend startup
export const validateAuthConfig = () => {
  return getJwtSecret();
};

// Backwards-compatible export that dynamically queries the configured secret
export const JWT_SECRET = process.env.JWT_SECRET ? process.env.JWT_SECRET.trim() : "";

// Supported signing and verification algorithm
export const JWT_ALGORITHM = "HS256";

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
    const secret = getJwtSecret();

    // Enforce explicit algorithm verification (rejects 'none' or asymmetric key confusion attacks)
    const decoded = jwt.verify(token, secret, {
      algorithms: [JWT_ALGORITHM],
    });

    if (!decoded || !decoded.id) {
      return res.status(401).json({
        success: false,
        message: "Malformed token claims. Please log in again.",
      });
    }

    // Always fetch authoritative user profile and role from the server
    const user = findUserById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User session invalid or expired. Please log in again.",
      });
    }

    // Attach server-verified user info to request (never trust client-supplied roles)
    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Your session has expired. Please log in again.",
      });
    }

    // Malformed, invalid signature, or algorithm mismatch
    return res.status(401).json({
      success: false,
      message: "Invalid or malformed authentication token. Please log in again.",
    });
  }
};

// Middleware to strictly enforce Admin role (Returns 403 Forbidden for non-admins)
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
