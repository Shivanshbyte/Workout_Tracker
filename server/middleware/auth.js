const jwt = require("jsonwebtoken");
require("dotenv").config();

const auth = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header)
    return res.status(401).json({ error: "Authorization token missing" });

  const token = header.split(" ")[1]; // "Bearer <token>"
  if (!token) return res.status(401).json({ error: "Invalid token format" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretkey");
    req.user = decoded; // contains { id: userId }
    next();
  } catch (err) {
    console.error("JWT Error:", err.message);
    res.status(401).json({ error: "Invalid or expired token" });
  }
};

module.exports = auth;
