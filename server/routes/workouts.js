const express = require("express");
const router = express.Router();
const db = require("../db");
const auth = require("../middleware/auth"); // ✅ import JWT middleware

// 🧠 Get all workouts for the logged-in user (with exercises + sets)
router.get("/", auth, (req, res) => {
  const userId = req.user.id; // ✅ from JWT

  const query = `
    SELECT 
      w.id AS workout_id,
      w.date,
      w.muscle_group,
      e.id AS exercise_id,
      e.name AS exercise_name,
      e.total_sets,
      s.id AS set_id,
      s.count,
      s.weight,
      s.reps
    FROM workouts w
    LEFT JOIN exercises e ON w.id = e.workout_id
    LEFT JOIN sets s ON e.id = s.exercise_id
    WHERE w.user_id = ?   -- ✅ only user's workouts
    ORDER BY w.date DESC, w.id DESC, e.id, s.count
  `;

  db.all(query, [userId], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });

    const workoutsMap = {};

    rows.forEach((row) => {
      if (!workoutsMap[row.workout_id]) {
        workoutsMap[row.workout_id] = {
          id: row.workout_id,
          date: row.date,
          muscle_group: JSON.parse(row.muscle_group || "[]"),
          exercises: [],
        };
      }

      let workout = workoutsMap[row.workout_id];

      if (row.exercise_id) {
        let exercise = workout.exercises.find((e) => e.id === row.exercise_id);
        if (!exercise) {
          exercise = {
            id: row.exercise_id,
            name: row.exercise_name,
            totalSets: row.total_sets,
            sets: [],
          };
          workout.exercises.push(exercise);
        }

        if (row.set_id) {
          exercise.sets.push({
            id: row.set_id,
            count: row.count,
            weight: row.weight,
            reps: row.reps,
          });
        }
      }
    });

    res.json(Object.values(workoutsMap));
  });
});

// 🏋️‍♂️ Add a new workout (for logged-in user)
router.post("/", auth, (req, res) => {
  const userId = req.user.id; // ✅ attach user_id
  const { date, muscle_group, exercises } = req.body;

  if (!date || !muscle_group || !Array.isArray(exercises)) {
    return res.status(400).json({ error: "Invalid payload" });
  }

  const dateString = new Date(date).toISOString();
  const muscleGroupStr = JSON.stringify(muscle_group);

  db.serialize(() => {
    db.run(
      `INSERT INTO workouts (user_id, date, muscle_group) VALUES (?, ?, ?)`,
      [userId, dateString, muscleGroupStr],
      function (err) {
        if (err) return res.status(500).json({ error: err.message });

        const workoutId = this.lastID;

        // Insert exercises and sets
        exercises.forEach((ex) => {
          db.run(
            `INSERT INTO exercises (workout_id, name, total_sets) VALUES (?, ?, ?)`,
            [workoutId, ex.name, ex.totalSets],
            function (err2) {
              if (err2) console.error("Exercise insert error:", err2.message);
              const exerciseId = this.lastID;

              (ex.sets || []).forEach((set, index) => {
                db.run(
                  `INSERT INTO sets (exercise_id, count, weight, reps) VALUES (?, ?, ?, ?)`,
                  [exerciseId, index + 1, set.weight, set.reps],
                  (err3) => {
                    if (err3) console.error("Set insert error:", err3.message);
                  }
                );
              });
            }
          );
        });

        res.json({ id: workoutId, message: "Workout added successfully" });
      }
    );
  });
});

// ✏️ Update a workout (only if it belongs to user)
router.put("/:id", auth, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const { date, muscle_group, exercises } = req.body;

  // Check ownership
  db.get(`SELECT * FROM workouts WHERE id = ? AND user_id = ?`, [id, userId], (err, workout) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!workout) return res.status(404).json({ error: "Workout not found or not yours" });

    db.serialize(() => {
      db.run(
        `UPDATE workouts SET date = ?, muscle_group = ? WHERE id = ?`,
        [date, JSON.stringify(muscle_group), id],
        (err2) => {
          if (err2) return res.status(500).json({ error: err2.message });

          db.run(`DELETE FROM exercises WHERE workout_id = ?`, [id], (err3) => {
            if (err3) return res.status(500).json({ error: err3.message });

            exercises.forEach((ex) => {
              db.run(
                `INSERT INTO exercises (workout_id, name, total_sets) VALUES (?, ?, ?)`,
                [id, ex.name, ex.totalSets],
                function (err4) {
                  if (err4)
                    console.error("Exercise insert error:", err4.message);
                  const exerciseId = this.lastID;

                  (ex.sets || []).forEach((set, index) => {
                    db.run(
                      `INSERT INTO sets (exercise_id, count, weight, reps) VALUES (?, ?, ?, ?)`,
                      [exerciseId, index + 1, set.weight, set.reps],
                      (err5) => {
                        if (err5)
                          console.error("Set insert error:", err5.message);
                      }
                    );
                  });
                }
              );
            });

            res.json({ message: "Workout updated successfully" });
          });
        }
      );
    });
  });
});

// 🧠 Get a single workout by ID (only if owned by user)
router.get("/:id", auth, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  db.get(`SELECT * FROM workouts WHERE id = ? AND user_id = ?`, [id, userId], (err, workout) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!workout) return res.status(404).json({ error: "Workout not found or not yours" });

    try {
      workout.muscle_group = JSON.parse(workout.muscle_group);
    } catch {
      workout.muscle_group = [];
    }

    db.all(`SELECT * FROM exercises WHERE workout_id = ?`, [id], (err2, exercises) => {
      if (err2) return res.status(500).json({ error: err2.message });

      const exerciseIds = exercises.map((ex) => ex.id);
      if (exerciseIds.length === 0) {
        workout.exercises = [];
        return res.json(workout);
      }

      db.all(
        `SELECT * FROM sets WHERE exercise_id IN (${exerciseIds.map(() => "?").join(",")})`,
        exerciseIds,
        (err3, sets) => {
          if (err3) return res.status(500).json({ error: err3.message });

          const formattedExercises = exercises.map((ex) => {
            const exSets = sets
              .filter((s) => s.exercise_id === ex.id)
              .map((set) => ({
                count: set.count,
                weight: set.weight,
                reps: set.reps,
              }));

            return {
              name: ex.name,
              totalSets: ex.total_sets,
              sets: exSets.length > 0
                ? exSets
                : [{ count: "", weight: "", reps: "" }],
            };
          });

          workout.exercises = formattedExercises;
          res.json(workout);
        }
      );
    });
  });
});

// 🗑 Delete a workout (only if owned by user)
router.delete("/:id", auth, (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  db.get("SELECT * FROM workouts WHERE id = ? AND user_id = ?", [id, userId], (err, workout) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!workout) return res.status(404).json({ error: "Workout not found or not yours" });

    db.run(`DELETE FROM workouts WHERE id = ?`, [id], function (err2) {
      if (err2) return res.status(500).json({ error: err2.message });
      res.json({ deleted: this.changes });
    });
  });
});

module.exports = router;
