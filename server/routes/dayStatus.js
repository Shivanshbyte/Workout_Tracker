const express = require("express");

const DayStatus = require("../models/dayStatus");
const Workout = require("../models/workouts");
const auth = require("../middleware/auth");

const router = express.Router();


// ==================================================
// GET ALL DAY STATUSES FOR LOGGED-IN USER
// ==================================================

router.get("/", auth, async (req, res) => {
  try {
    const statuses = await DayStatus.find({
      userId: req.user.id,
    }).select("date status -_id");

    res.json(statuses);
  } catch (err) {
    console.error("Error fetching day statuses:", err);

    res.status(500).json({
      error: "Failed to fetch day statuses",
    });
  }
});


// ==================================================
// MARK A DAY AS REST
// ==================================================

router.put("/:date", auth, async (req, res) => {
  try {
    const { date } = req.params;

    // ----------------------------------------------
    // Basic date validation
    // ----------------------------------------------

    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      return res.status(400).json({
        error: "Invalid date format",
      });
    }

    // ----------------------------------------------
    // Don't allow marking a future date as rest
    // ----------------------------------------------

    const selectedDate = new Date(`${date}T00:00:00`);
    const today = new Date();

    const todayKey = [
      today.getFullYear(),
      String(today.getMonth() + 1).padStart(2, "0"),
      String(today.getDate()).padStart(2, "0"),
    ].join("-");

    if (date > todayKey) {
      return res.status(400).json({
        error: "Future dates cannot be marked as rest days",
      });
    }

    // ----------------------------------------------
    // Don't allow rest status if workout exists
    // ----------------------------------------------

    const startOfDay = new Date(`${date}T00:00:00`);
    const endOfDay = new Date(`${date}T23:59:59.999`);

    const workoutExists = await Workout.exists({
      userId: req.user.id,
      date: {
        $gte: startOfDay,
        $lte: endOfDay,
      },
    });

    if (workoutExists) {
      return res.status(400).json({
        error: "A workout already exists for this date",
      });
    }

    // ----------------------------------------------
    // Create or update rest status
    // ----------------------------------------------

    const dayStatus = await DayStatus.findOneAndUpdate(
      {
        userId: req.user.id,
        date,
      },
      {
        userId: req.user.id,
        date,
        status: "rest",
      },
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );

    res.json(dayStatus);
  } catch (err) {
    console.error("Error marking rest day:", err);

    res.status(500).json({
      error: "Failed to mark rest day",
    });
  }
});


// ==================================================
// REMOVE REST STATUS
// DAY BECOMES MISSED AGAIN
// ==================================================

router.delete("/:date", auth, async (req, res) => {
  try {
    const { date } = req.params;

    await DayStatus.deleteOne({
      userId: req.user.id,
      date,
    });

    res.json({
      message: "Rest day removed",
    });
  } catch (err) {
    console.error("Error removing rest day:", err);

    res.status(500).json({
      error: "Failed to remove rest day",
    });
  }
});


module.exports = router;