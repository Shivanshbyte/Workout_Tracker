const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("../db"); // adjust path if needed
require("dotenv").config();

const router = express.Router();

// Helper to generate JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET || "supersecretkey", {
    expiresIn: "7d",
  });
};

// ---------------------- REGISTER ----------------------
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password)
    return res.status(400).json({ error: "All fields are required" });

  try {
    // check if email exists
   
    db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
      if (err) return res.status(500).json({ error: err.message });
      if (user)
        return res.status(400).json({ error: "Email already registered" });

      // hash password
      const hashedPassword = await bcrypt.hash(password, 10);

      // insert user
      db.run(
        "INSERT INTO users (name, email, password) VALUES (?, ?, ?)",
        [name, email, hashedPassword],
        function (err2) {
          if (err2) return res.status(500).json({ error: err2.message });

          const token = generateToken(this.lastID);
          res.json({
            message: "User registered successfully",
            user: { id: this.lastID, name, email },
            token,
          });
        }
      );
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ---------------------- LOGIN ----------------------
router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Email and password are required" });

  db.get("SELECT * FROM users WHERE email = ?", [email], async (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: "User not found" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword)
      return res.status(401).json({ error: "Invalid credentials" });

    const token = generateToken(user.id);
    res.json({
      message: "Login successful",
      user: { id: user.id, name: user.name, email: user.email },
      token,
    });
  });
});

module.exports = router;
