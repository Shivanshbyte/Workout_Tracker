const express = require("express");
const cors = require("cors");
const workoutsRouter = require("./routes/workouts");
const authRouter = require("./routes/auth");
const connectDB = require("./config/db");
require("dotenv").config();

const app = express();
const PORT = 3002;

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/workouts", workoutsRouter);

app.get("/", (req, res) =>
  res.json({ message: "BillionaireFit API running" })
);

app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);
