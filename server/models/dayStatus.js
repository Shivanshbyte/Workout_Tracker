const mongoose = require("mongoose");

const dayStatusSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    date: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["rest"],
      required: true,
      default: "rest",
    },
  },
  {
    timestamps: true,
  }
);

// One status per user per date
dayStatusSchema.index(
  { userId: 1, date: 1 },
  { unique: true }
);

module.exports = mongoose.model(
  "DayStatus",
  dayStatusSchema
);