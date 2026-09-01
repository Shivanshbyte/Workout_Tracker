const express = require("express");

const Workout = require("../models/workouts");
const auth = require("../middleware/auth");
const { calculateWorkoutStats } = require("../services/workoutAnalytics");
const { generateWorkoutInsights } = require("../services/aiService");

const router = express.Router();

/*
  GET AI workout statistics

  This endpoint:
  1. Authenticates the user
  2. Gets only that user's workouts
  3. Calculates analytics
  4. Returns the analytics

  Gemini will be connected after we verify this works.
*/

router.get("/stats", auth, async (req, res) => {
  try {
    // Get ONLY the logged-in user's workouts
    const workouts = await Workout.find({
      userId: req.user.id,
    }).sort({
      date: -1,
    });

    // Calculate statistics
    const stats = calculateWorkoutStats(workouts);

    res.json({
      success: true,
      stats,
    });
  } catch (error) {
    console.error("AI stats error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to calculate workout statistics",
    });
  }
});

router.get("/insights", auth, async (req, res) => {
  try {
    // Get only the logged-in user's workouts
    const workouts = await Workout.find({
      userId: req.user.id,
    }).sort({
      date: -1,
    });

    // Calculate statistics
    const stats = calculateWorkoutStats(workouts);

    // Ask Gemini to analyze the statistics
    const insights = await generateWorkoutInsights(stats);

    res.json({
      success: true,
      insights,
    });
  } catch (error) {
    console.error("AI insights error:", error);

    res.status(500).json({
      success: false,
      error: "Failed to generate AI insights",
    });
  }
});

module.exports = router;
