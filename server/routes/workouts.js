const express = require("express");
const Workout = require("../models/workouts");
const auth = require("../middleware/auth");

const router = express.Router();

// GET all workouts
router.get("/", auth, async (req, res) => {
  const workouts = await Workout.find({ userId: req.user.id }).sort({
    date: -1,
  });
  res.json(workouts);
});

// ADD workout
router.post("/", auth, async (req, res) => {
  const workout = await Workout.create({
    userId: req.user.id,
    ...req.body,
  });

  res.json({ message: "Workout added", id: workout._id });
});

// GET single workout
router.get("/:id", auth, async (req, res) => {
  const workout = await Workout.findOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  if (!workout)
    return res.status(404).json({ error: "Workout not found" });

  res.json(workout);
});

// UPDATE workout
router.put("/:id", auth, async (req, res) => {
  const workout = await Workout.findOneAndUpdate(
    { _id: req.params.id, userId: req.user.id },
    req.body,
    { new: true }
  );

  if (!workout)
    return res.status(404).json({ error: "Workout not found" });

  res.json({ message: "Workout updated" });
});

// DELETE workout
router.delete("/:id", auth, async (req, res) => {
  const result = await Workout.deleteOne({
    _id: req.params.id,
    userId: req.user.id,
  });

  res.json({ deleted: result.deletedCount });
});

module.exports = router;
