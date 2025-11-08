const sqlite3 = require("sqlite3").verbose();
const path = require("path");

const dbPath = path.resolve(__dirname, "workouts.db");
const db = new sqlite3.Database(dbPath);

db.serialize(() => {
  // Table for workouts
  db.run(`
    CREATE TABLE IF NOT EXISTS workouts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  date TEXT NOT NULL,
  muscle_group TEXT
)
  `);

  // Table for exercises linked to each workout
  db.run(`
    CREATE TABLE IF NOT EXISTS exercises (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  workout_id INTEGER,
  name TEXT,
  total_sets INTEGER,
  FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
)
  `);

  db.run(`
    CREATE TABLE IF NOT EXISTS sets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  exercise_id INTEGER,
  count INTEGER,
  weight REAL,
  reps INTEGER,
  FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
);
  `);
});

module.exports = db;
