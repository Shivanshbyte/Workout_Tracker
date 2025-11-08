const express = require("express");
const cors = require("cors");
const workoutsRouter = require("./routes/workouts");
const authRouter = require("./routes/auth");

const app = express();
const PORT = 3002;

// ✅ Middleware setup
app.use(cors());
app.use(express.json()); // use built-in JSON parser

// ✅ Routes
app.use("/api/auth", authRouter);
app.use("/api/workouts", workoutsRouter);

// ✅ Root route
app.get("/", (req, res) => res.json({ message: "BillionaireFit API running" }));

// ✅ Server start
app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
