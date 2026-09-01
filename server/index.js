require("dotenv").config();
const express = require("express");
const cors = require("cors");
const workoutsRouter = require("./routes/workouts");
const authRouter = require("./routes/auth");
const aiRouter = require("./routes/ai");
const connectDB = require("./config/db");
const { testGemini } = require("./services/aiService");
const dayStatusRouter = require("./routes/dayStatus");

const app = express();
const PORT = 3002;

connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/auth", authRouter);
app.use("/api/workouts", workoutsRouter);
app.use("/api/ai", aiRouter);
app.use("/api/day-status", dayStatusRouter);

app.get("/", (req, res) => res.json({ message: "BillionaireFit API running" }));

app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`),
);

// testGemini()
//   .then((result) => {
//     console.log("Gemini response:");
//     console.log(result);
//   })
//   .catch((error) => {
//     console.error("Gemini error:", error);
//   });
