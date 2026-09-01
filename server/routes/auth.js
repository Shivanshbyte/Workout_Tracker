const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/users");
const auth = require("../middleware/auth");
const { sendOTPEmail } = require("../services/emailService");

require("dotenv").config();

const router = express.Router();

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET || "supersecretkey", {
    expiresIn: "7d",
  });

// ==================================================
// REGISTER
// ==================================================

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // Validate fields
    if (!name || !email || !password) {
      return res.status(400).json({
        error: "All fields are required",
      });
    }

    // Validate password
    if (password.length < 6) {
      return res.status(400).json({
        error: "Password must be at least 6 characters",
      });
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      // If account exists but isn't verified,
      // generate and send a new OTP
      if (!existingUser.isVerified) {
        const otp = crypto.randomInt(100000, 1000000).toString();

        const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

        existingUser.otpHash = otpHash;

        existingUser.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

        await existingUser.save();

        await sendOTPEmail(normalizedEmail, otp);

        return res.json({
          message: "Verification code sent",
          requiresVerification: true,
          email: normalizedEmail,
        });
      }

      return res.status(400).json({
        error: "Email already registered",
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();

    // Hash OTP before storing
    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    // OTP expires after 10 minutes
    const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // Create unverified user
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      password: hashedPassword,

      isVerified: false,

      otpHash,
      otpExpiresAt,
    });

    // Send OTP email
    await sendOTPEmail(normalizedEmail, otp);

    res.json({
      message: "Verification code sent",
      requiresVerification: true,
      email: normalizedEmail,
    });
  } catch (err) {
    console.error("Registration error:", err);

    res.status(500).json({
      error: "Failed to register user",
    });
  }
});

// ==================================================
// VERIFY OTP
// ==================================================

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        error: "Email and OTP are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    // Already verified
    if (user.isVerified) {
      return res.status(400).json({
        error: "Email is already verified",
      });
    }

    // Check expiration
    if (!user.otpExpiresAt || user.otpExpiresAt < new Date()) {
      return res.status(400).json({
        error: "OTP has expired. Please request a new one.",
      });
    }

    // Hash submitted OTP
    const submittedOtpHash = crypto
      .createHash("sha256")
      .update(otp.toString())
      .digest("hex");

    // Compare OTP
    if (submittedOtpHash !== user.otpHash) {
      return res.status(400).json({
        error: "Invalid OTP",
      });
    }

    // Mark email as verified
    user.isVerified = true;

    // Remove OTP data
    user.otpHash = null;
    user.otpExpiresAt = null;

    await user.save();

    // Generate JWT
    const token = generateToken(user._id);

    res.json({
      message: "Email verified successfully",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },

      token,
    });
  } catch (err) {
    console.error("OTP verification error:", err);

    res.status(500).json({
      error: "Failed to verify OTP",
    });
  }
});

// ==================================================
// RESEND OTP
// ==================================================

router.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: "Email is required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    if (user.isVerified) {
      return res.status(400).json({
        error: "Email is already verified",
      });
    }

    // Generate new OTP
    const otp = crypto.randomInt(100000, 1000000).toString();

    const otpHash = crypto.createHash("sha256").update(otp).digest("hex");

    user.otpHash = otpHash;

    user.otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await user.save();

    // Send new OTP
    await sendOTPEmail(normalizedEmail, otp);

    res.json({
      message: "A new verification code has been sent",
    });
  } catch (err) {
    console.error("Resend OTP error:", err);

    res.status(500).json({
      error: "Failed to resend OTP",
    });
  }
});

// ==================================================
// LOGIN
// ==================================================

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({
        error: "Invalid credentials",
      });
    }

    // Email must be verified
    if (!user.isVerified) {
      return res.status(403).json({
        error: "Please verify your email before logging in",

        requiresVerification: true,

        email: user.email,
      });
    }

    res.json({
      message: "Login successful",

      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },

      token: generateToken(user._id),
    });
  } catch (err) {
    console.error("Login error:", err);

    res.status(500).json({
      error: "Server error",
    });
  }
});

// ==================================================
// GET CURRENT USER
// ==================================================

router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name email");

    if (!user) {
      return res.status(404).json({
        error: "User not found",
      });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({
      error: "Server error",
    });
  }
});

module.exports = router;
