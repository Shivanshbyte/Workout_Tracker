const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/users");
require("dotenv").config();

const router = express.Router();

const generateToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET || "supersecretkey", {
    expiresIn: "7d",
  });

// REGISTER
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "All fields are required" });

  const existingUser = await User.findOne({ email });
  if (existingUser)
    return res.status(400).json({ error: "Email already registered" });

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword });

  res.json({
    message: "User registered successfully",
    user: { id: user._id, name, email },
    token: generateToken(user._id),
  });
});

// LOGIN
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required" });

  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ error: "User not found" });

  const validPassword = await bcrypt.compare(password, user.password);
  if (!validPassword)
    return res.status(401).json({ error: "Invalid credentials" });

  res.json({
    message: "Login successful",
    user: { id: user._id, name: user.name, email: user.email },
    token: generateToken(user._id),
  });
});

module.exports = router;
