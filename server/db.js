const sqlite3 = require("sqlite3").verbose();
const path = require("path");
const fs = require("fs"); 

// const dbPath = path.resolve(__dirname, "workouts.db");
// const db = new sqlite3.Database(dbPath);

// Define folder for database (persistent on Render)
const dataDir = path.join(__dirname, "data");

// Ensure /data directory exists
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Use /data/workouts.db for Render, same works locally
const dbPath = path.join(dataDir, "workouts.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) console.error("❌ Error connecting to database:", err);
});

db.serialize(() => {
  // USERS TABLE
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL
    )
  `);

  // WORKOUTS TABLE (linked to user)
  db.run(`
    CREATE TABLE IF NOT EXISTS workouts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      date TEXT NOT NULL,
      muscle_group TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  // EXERCISES TABLE (linked to workouts)
  db.run(`
    CREATE TABLE IF NOT EXISTS exercises (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_id INTEGER,
      name TEXT,
      total_sets INTEGER,
      FOREIGN KEY (workout_id) REFERENCES workouts(id) ON DELETE CASCADE
    )
  `);

  // SETS TABLE (linked to exercises)
  db.run(`
    CREATE TABLE IF NOT EXISTS sets (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      exercise_id INTEGER,
      count INTEGER,
      weight REAL,
      reps INTEGER,
      FOREIGN KEY (exercise_id) REFERENCES exercises(id) ON DELETE CASCADE
    )
  `);
});

module.exports = db;
