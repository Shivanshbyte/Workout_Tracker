const calculateWorkoutStats = (workouts) => {
  const now = new Date();

  const last30DaysDate = new Date();
  last30DaysDate.setDate(now.getDate() - 30);

  const last7DaysDate = new Date();
  last7DaysDate.setDate(now.getDate() - 7);

  let workoutsLast30Days = 0;
  let workoutsLast7Days = 0;

  let totalSets = 0;
  let totalVolume = 0;

  const muscleGroups = {};
  const exerciseStats = {};

  const workoutDates = new Set();

  workouts.forEach((workout) => {
    const workoutDate = new Date(workout.date);

    // ------------------------------------------
    // Workout frequency
    // ------------------------------------------

    if (workoutDate >= last30DaysDate) {
      workoutsLast30Days++;
    }

    if (workoutDate >= last7DaysDate) {
      workoutsLast7Days++;
    }

    workoutDates.add(
      workoutDate.toISOString().split("T")[0]
    );

    // ------------------------------------------
    // Muscle groups
    // ------------------------------------------

    (workout.muscle_group || []).forEach(
      (muscle) => {
        muscleGroups[muscle] =
          (muscleGroups[muscle] || 0) + 1;
      }
    );

    // ------------------------------------------
    // Exercises
    // ------------------------------------------

    (workout.exercises || []).forEach(
      (exercise) => {
        const exerciseName = exercise.name;

        if (!exerciseName) return;

        if (!exerciseStats[exerciseName]) {
          exerciseStats[exerciseName] = {
            sessions: 0,
            totalSets: 0,
            totalVolume: 0,
            maxWeight: 0,
            maxReps: 0,
            bestSet: null,
          };
        }

        const stats =
          exerciseStats[exerciseName];

        stats.sessions++;

        // --------------------------------------
        // Sets
        // --------------------------------------

        (exercise.sets || []).forEach((set) => {
          const count = Number(set.count || 0);
          const weight = Number(set.weight || 0);
          const reps = Number(set.reps || 0);

          stats.totalSets += count;

          totalSets += count;

          // Volume = weight × reps × count
          const volume =
            weight * reps * count;

          stats.totalVolume += volume;
          totalVolume += volume;

          // Maximum weight
          if (weight > stats.maxWeight) {
            stats.maxWeight = weight;
          }

          // Maximum reps
          if (reps > stats.maxReps) {
            stats.maxReps = reps;
          }

          // Best set based on weight × reps
          const setScore =
            weight * reps;

          if (
            !stats.bestSet ||
            setScore >
              stats.bestSet.score
          ) {
            stats.bestSet = {
              weight,
              reps,
              score: setScore,
            };
          }
        });
      }
    );
  });

  // ------------------------------------------
  // Remove internal score before sending to AI
  // ------------------------------------------

  Object.values(exerciseStats).forEach(
    (exercise) => {
      if (exercise.bestSet) {
        delete exercise.bestSet.score;
      }
    }
  );

  // ------------------------------------------
  // Most / least trained muscle
  // ------------------------------------------

  const sortedMuscles = Object.entries(
    muscleGroups
  ).sort((a, b) => b[1] - a[1]);

  const mostTrainedMuscle =
    sortedMuscles.length > 0
      ? {
          name: sortedMuscles[0][0],
          sessions: sortedMuscles[0][1],
        }
      : null;

  const leastTrainedMuscle =
    sortedMuscles.length > 0
      ? {
          name:
            sortedMuscles[
              sortedMuscles.length - 1
            ][0],
          sessions:
            sortedMuscles[
              sortedMuscles.length - 1
            ][1],
        }
      : null;

  return {
    overview: {
      totalWorkouts: workouts.length,
      workoutsLast30Days,
      workoutsLast7Days,
      totalWorkoutDays:
        workoutDates.size,
      totalSets,
      totalVolume,
    },

    muscleGroups,

    mostTrainedMuscle,

    leastTrainedMuscle,

    exercises: exerciseStats,
  };
};

module.exports = {
  calculateWorkoutStats,
};