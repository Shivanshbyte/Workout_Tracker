const mongoose = require("mongoose");

const setSchema = new mongoose.Schema({
  count: Number,
  weight: Number,
  reps: Number,
});

const exerciseSchema = new mongoose.Schema({
  name: String,
  totalSets: Number,
  sets: [setSchema],
});

const workoutSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    date: Date,
    muscle_group: [String],
    exercises: [exerciseSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Workout", workoutSchema);
