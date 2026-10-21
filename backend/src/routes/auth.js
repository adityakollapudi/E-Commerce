import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { findUserByEmail, createUser } from "../data/users.js";
import { authenticateToken, JWT_SECRET } from "../middleware/auth.js";

const router = express.Router();

// Helper to generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

// POST /api/auth/login
router.post("/login", (req, res) => {
  try {
    const { email, password, roleHint } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const user = findUserByEmail(email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password.",
      });
    }

    // Optional check if logging in via admin tab specifically
    if (roleHint === "admin" && user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "This account does not have administrator privileges. Please use the Customer login.",
      });
    }

    const token = generateToken(user);

    res.json({
      success: true,
      message: `Welcome back, ${user.name}!`,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/auth/register
router.post("/register", (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email, and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    // Role defaults to 'user' unless explicitly requested and permitted
    const assignedRole = role === "admin" ? "admin" : "user";

    const newUser = createUser({
      name,
      email,
      password,
      role: assignedRole,
    });

    const token = generateToken(newUser);

    res.status(201).json({
      success: true,
      message: "Account created successfully!",
      token,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
});

// GET /api/auth/me (Verify session)
router.get("/me", authenticateToken, (req, res) => {
  res.json({
    success: true,
    user: req.user,
  });
});

// GET /api/auth/demo-accounts (Returns pre-configured demo logins for convenience)
router.get("/demo-accounts", (req, res) => {
  res.json({
    success: true,
    accounts: {
      admin: {
        email: "admin@shop.co",
        password: "admin123",
        role: "admin",
        label: "Store Administrator",
      },
      user: {
        email: "user@shop.co",
        password: "user123",
        role: "user",
        label: "Regular Customer",
      },
    },
  });
});

export default router;
