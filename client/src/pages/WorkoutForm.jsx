import { useState, useEffect } from "react";
import { addWorkout, getWorkoutById, updateWorkout } from "../api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate, useParams } from "react-router-dom";
import CreatableSelect from "react-select/creatable";
import { Plus, Minus, Dumbbell, ArrowLeft, X } from "lucide-react";
import {
  muscleOptions,
  exercisesByMuscle,
  customSelectStyles,
} from "./WorkoutConfig";

const AddWorkout = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const isEditMode = Boolean(id);

  const today = new Date();

  /* ==================================================
     FORM STATE
  ================================================== */

  const [form, setForm] = useState({
    date: today,
    muscle_group: [],
  });

  const initialExercise = {
    name: "",
    totalSets: "",
    sets: [
      {
        count: "",
        weight: "",
        reps: "",
      },
    ],
  };

  const [exercises, setExercises] = useState([initialExercise]);

  const [errors, setErrors] = useState([]);

  /* ==================================================
     LOAD EXISTING WORKOUT
  ================================================== */

  useEffect(() => {
    if (!id) return;

    const loadWorkout = async () => {
      try {
        const existingWorkout = await getWorkoutById(id);
        const existingData = existingWorkout?.data;

        setForm({
          date: new Date(existingData.date),
          muscle_group: (existingData.muscle_group || []).map((muscle) => ({
            value: muscle,
            label: muscle,
          })),
        });

        setExercises(existingData.exercises || []);
      } catch (error) {
        console.error("Failed to fetch workout for edit:", error);
      }
    };

    loadWorkout();
  }, [id]);

  /* ==================================================
     EXERCISE OPTIONS
  ================================================== */

  const getExerciseOptions = (selectedMuscles) => {
    let options = [];

    selectedMuscles.forEach((muscle) => {
      options = [...options, ...(exercisesByMuscle[muscle.value] || [])];
    });

    return options;
  };

  /* ==================================================
     EXERCISE HANDLERS
  ================================================== */

  const handleExerciseChange = (index, field, value) => {
    setExercises((prev) => {
      const updated = [...prev];

      updated[index] = {
        ...updated[index],
        [field]: value,
      };

      return updated;
    });

    if (field === "totalSets") {
      setTimeout(() => validateSets(index), 0);
    }
  };

  const addExercise = () => {
    setExercises((prev) => [
      ...prev,
      {
        name: "",
        totalSets: "",
        sets: [
          {
            count: "",
            weight: "",
            reps: "",
          },
        ],
      },
    ]);
  };

  const removeExercise = (index) => {
    setExercises((prev) => prev.filter((_, i) => i !== index));

    setErrors((prev) => prev.filter((_, i) => i !== index));
  };

  /* ==================================================
     SET HANDLERS
  ================================================== */

  const handleSetChange = (exerciseIndex, setIndex, field, value) => {
    setExercises((prev) => {
      const updated = [...prev];

      const updatedSets = [...(updated[exerciseIndex].sets || [])];

      updatedSets[setIndex] = {
        ...updatedSets[setIndex],
        [field]: value,
      };

      updated[exerciseIndex] = {
        ...updated[exerciseIndex],
        sets: updatedSets,
      };

      return updated;
    });

    if (field === "count") {
      setTimeout(() => validateSets(exerciseIndex), 0);
    }
  };

  const addSet = (exerciseIndex) => {
    setExercises((prev) => {
      const updated = [...prev];

      updated[exerciseIndex] = {
        ...updated[exerciseIndex],
        sets: [
          ...(updated[exerciseIndex].sets || []),
          {
            count: "",
            weight: "",
            reps: "",
          },
        ],
      };

      return updated;
    });
  };

  const removeSet = (exerciseIndex, setIndex) => {
    setExercises((prev) => {
      const updated = [...prev];

      const sets = [...(updated[exerciseIndex].sets || [])];

      // Keep at least one set row
      if (sets.length === 1) {
        return prev;
      }

      sets.splice(setIndex, 1);

      updated[exerciseIndex] = {
        ...updated[exerciseIndex],
        sets,
      };

      return updated;
    });

    setTimeout(() => validateSets(exerciseIndex), 0);
  };

  /* ==================================================
     VALIDATION
  ================================================== */

  const validateSets = (exerciseIndex) => {
    const exercise = exercises[exerciseIndex];

    if (!exercise) return;

    const totalSets = Number(exercise.totalSets || 0);

    const sumCounts = (exercise.sets || []).reduce(
      (sum, set) => sum + Number(set.count || 0),
      0,
    );

    setErrors((prev) => {
      const updated = [...prev];

      updated[exerciseIndex] =
        totalSets > 0 && sumCounts > totalSets
          ? "Set count is greater than total sets."
          : "";

      return updated;
    });
  };

  /* ==================================================
     SUBMIT
  ================================================== */

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate all exercises before submitting
    let hasError = false;

    exercises.forEach((_, index) => {
      validateSets(index);

      const exercise = exercises[index];

      const totalSets = Number(exercise.totalSets || 0);

      const sumCounts = (exercise.sets || []).reduce(
        (sum, set) => sum + Number(set.count || 0),
        0,
      );

      if (totalSets > 0 && sumCounts > totalSets) {
        hasError = true;
      }
    });

    if (hasError) {
      return;
    }

    const payload = {
      date: form.date,

      muscle_group: form.muscle_group.map((muscle) => muscle.value),

      exercises: exercises.map((exercise) => ({
        name: exercise.name,
        totalSets: exercise.totalSets,

        sets: (exercise.sets || []).map((set) => ({
          count: set.count,
          weight: set.weight,
          reps: set.reps,
        })),
      })),
    };

    try {
      if (id) {
        await updateWorkout(id, payload);
      } else {
        await addWorkout(payload);
      }

      navigate("/");
    } catch (error) {
      console.error("Error saving workout:", error);
    }
  };

  /* ==================================================
     UI
  ================================================== */

  return (
    <div
      className="
        min-h-[100dvh]
        w-full
        bg-slate-950
        text-slate-100
        overflow-x-hidden
      "
    >
      {/* ==================================================
          CENTERED APP SHELL
      ================================================== */}

      <div
        className="
          min-h-[100dvh]
          w-full
          flex
          justify-center
        "
      >
        <div
          className="
            w-full
            max-w-[480px]
            min-w-0
            min-h-[100dvh]
            px-4
            sm:px-6
            py-5
            pb-8
            box-border
          "
        >
          {/* ==================================================
              HEADER
          ================================================== */}

          <header className="mb-6">
            <button
              type="button"
              onClick={() => navigate("/")}
              className="
                inline-flex
                items-center
                gap-1.5
                text-xs
                text-slate-500
                hover:text-slate-300
                transition
                mb-4
              "
            >
              <ArrowLeft size={15} />

              <span>Back to workouts</span>
            </button>

            <div className="flex items-center gap-3">
              <div
                className="
                  w-10
                  h-10
                  shrink-0
                  rounded-xl
                  bg-sky-400/10
                  flex
                  items-center
                  justify-center
                "
              >
                <Dumbbell size={20} className="text-sky-400" />
              </div>

              <div className="min-w-0">
                <h1 className="text-xl font-semibold text-white">
                  {isEditMode ? "Edit Workout" : "New Workout"}
                </h1>

                <p className="text-xs text-slate-500 mt-0.5">
                  {isEditMode
                    ? "Update your workout details"
                    : "Log your training session"}
                </p>
              </div>
            </div>
          </header>

          {/* ==================================================
              FORM
          ================================================== */}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* ==================================================
                BASIC DETAILS
            ================================================== */}

            <section>
              <div className="mb-2">
                <p className="text-[10px] uppercase tracking-wider text-slate-600 font-medium">
                  Workout details
                </p>
              </div>

              <div
                className="
                  bg-slate-900/60
                  border
                  border-slate-800
                  rounded-2xl
                  p-4
                  space-y-4
                "
              >
                {/* Date */}

                <div>
                  <label
                    htmlFor="workout-date"
                    className="
                      block
                      text-xs
                      font-medium
                      text-slate-400
                      mb-1.5
                    "
                  >
                    Date
                  </label>

                  <DatePicker
                    id="workout-date"
                    selected={form.date}
                    onChange={(date) =>
                      setForm({
                        ...form,
                        date,
                      })
                    }
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Select date"
                    maxDate={today}
                    popperPlacement="bottom"
                    showPopperArrow={false}
                    className="
                      w-full
                      h-10
                      box-border
                      bg-slate-800/70
                      border
                      border-slate-700
                      text-slate-200
                      rounded-xl
                      px-3
                      text-sm
                      outline-none
                      focus:border-sky-500/60
                      focus:ring-2
                      focus:ring-sky-500/10
                      transition
                    "
                  />
                </div>

                {/* Muscle groups */}

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">
                    Muscle groups
                  </label>

                  <CreatableSelect
                    isMulti
                    options={muscleOptions}
                    value={form.muscle_group}
                    onChange={(selected) =>
                      setForm({
                        ...form,
                        muscle_group: selected || [],
                      })
                    }
                    placeholder="Chest, back, legs..."
                    styles={customSelectStyles}
                    className="w-full"
                  />
                </div>
              </div>
            </section>

            {/* ==================================================
                EXERCISES
            ================================================== */}

            <section>
              <div className="flex items-end justify-between mb-2">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-600 font-medium">
                    Exercises
                  </p>

                  <p className="text-xs text-slate-500 mt-0.5">
                    Add the exercises and sets you completed
                  </p>
                </div>

                <span className="text-[10px] text-slate-600">
                  {exercises.length}{" "}
                  {exercises.length === 1 ? "exercise" : "exercises"}
                </span>
              </div>

              <div className="space-y-3">
                {exercises.map((exercise, exIndex) => (
                  <div
                    key={exIndex}
                    className="
                        bg-slate-900/60
                        border
                        border-slate-800
                        rounded-2xl
                        overflow-hidden
                      "
                  >
                    {/* ==================================================
                          EXERCISE HEADER
                      ================================================== */}

                    <div className="p-3.5">
                      <div className="flex items-center gap-2">
                        <div
                          className="
                              w-7
                              h-7
                              shrink-0
                              rounded-lg
                              bg-slate-800
                              flex
                              items-center
                              justify-center
                              text-[11px]
                              font-medium
                              text-slate-500
                            "
                        >
                          {exIndex + 1}
                        </div>

                        <div className="flex-1 min-w-0">
                          <CreatableSelect
                            options={getExerciseOptions(form.muscle_group)}
                            value={
                              exercise.name
                                ? {
                                    value: exercise.name,
                                    label: exercise.name,
                                  }
                                : null
                            }
                            onChange={(selected) =>
                              handleExerciseChange(
                                exIndex,
                                "name",
                                selected?.value || "",
                              )
                            }
                            placeholder="Choose exercise..."
                            styles={customSelectStyles}
                            className="w-full"
                          />
                        </div>

                        {exercises.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeExercise(exIndex)}
                            className="
                                w-8
                                h-8
                                shrink-0
                                rounded-full
                                flex
                                items-center
                                justify-center
                                text-slate-600
                                hover:text-red-400
                                hover:bg-red-400/10
                                transition
                              "
                            title="Remove exercise"
                          >
                            <X size={15} />
                          </button>
                        )}
                      </div>

                      {/* Total sets */}

                      <div className="mt-3 flex items-center justify-between">
                        <label className="text-xs text-slate-500">
                          Total sets
                        </label>

                        <input
                          type="number"
                          min="1"
                          placeholder="e.g. 3"
                          value={exercise.totalSets}
                          onChange={(e) =>
                            handleExerciseChange(
                              exIndex,
                              "totalSets",
                              e.target.value,
                            )
                          }
                          className="
                              w-20
                              h-8
                              bg-slate-800/70
                              border
                              border-slate-700
                              text-slate-200
                              rounded-lg
                              px-2
                              text-center
                              text-xs
                              outline-none
                              focus:border-sky-500/60
                              focus:ring-2
                              focus:ring-sky-500/10
                              transition
                            "
                        />
                      </div>
                    </div>

                    {/* ==================================================
                          SETS
                      ================================================== */}

                    <div
                      className="
                          border-t
                          border-slate-800
                          px-3.5
                          py-3
                          bg-slate-950/20
                        "
                    >
                      {/* Table heading */}

                      <div
                        className="
                            grid
                            grid-cols-[34px_0.8fr_1.2fr_1fr_48px]
                            items-center
                            gap-2
                            px-2
                            mb-1.5
                            text-[9px]
                            uppercase
                            tracking-wider
                            text-slate-600
                          "
                      >
                        <span>#</span>

                        <span className="text-center">Count</span>

                        <span className="text-center">Weight</span>

                        <span className="text-center">Reps</span>

                        <span />
                      </div>

                      {/* Set rows */}

                      <div className="space-y-1.5">
                        {exercise.sets.map((set, setIndex) => (
                          <div
                            key={setIndex}
                            className="
                                  grid
                                  grid-cols-[34px_0.8fr_1.2fr_1fr_48px]
                                  items-center
                                  gap-2
                                  bg-slate-900/70
                                  rounded-xl
                                  px-2
                                  py-1.5
                                "
                          >
                            {/* Set number */}

                            <div
                              className="
                                    w-6
                                    h-6
                                    rounded-md
                                    bg-slate-800
                                    flex
                                    items-center
                                    justify-center
                                    text-[10px]
                                    text-slate-500
                                  "
                            >
                              {setIndex + 1}
                            </div>

                            {/* Count */}

                            <input
                              type="number"
                              min="1"
                              inputMode="numeric"
                              placeholder="—"
                              value={set.count}
                              onChange={(e) => {
                                const value = e.target.value;

                                if (value === "" || Number(value) > 0) {
                                  handleSetChange(
                                    exIndex,
                                    setIndex,
                                    "count",
                                    value,
                                  );
                                }
                              }}
                              className="
                                    w-full
                                    h-8
                                    bg-transparent
                                    border
                                    border-transparent
                                    hover:border-slate-700
                                    focus:border-sky-500/60
                                    rounded-lg
                                    text-center
                                    text-xs
                                    text-slate-200
                                    outline-none
                                    transition
                                  "
                            />

                            {/* Weight */}

                            <div className="relative">
                              <input
                                type="number"
                                min="0.01"
                                step="0.01"
                                inputMode="decimal"
                                placeholder="—"
                                value={set.weight || ""}
                                onChange={(e) => {
                                  const value = e.target.value;

                                  if (value === "" || Number(value) > 0) {
                                    handleSetChange(
                                      exIndex,
                                      setIndex,
                                      "weight",
                                      value,
                                    );
                                  }
                                }}
                                className="
                                      w-full
                                      h-8
                                      bg-transparent
                                      border
                                      border-transparent
                                      hover:border-slate-700
                                      focus:border-sky-500/60
                                      rounded-lg
                                      text-center
                                      text-xs
                                      text-slate-200
                                      outline-none
                                      pr-7
                                      transition
                                    "
                              />

                              <span
                                className="
                                      absolute
                                      right-2
                                      top-1/2
                                      -translate-y-1/2
                                      text-[9px]
                                      text-slate-600
                                      pointer-events-none
                                    "
                              >
                                kg
                              </span>
                            </div>

                            {/* Reps */}

                            <div className="relative">
                              <input
                                type="number"
                                min="1"
                                inputMode="numeric"
                                placeholder="—"
                                value={set.reps}
                                onChange={(e) => {
                                  const value = e.target.value;

                                  if (value === "" || Number(value) > 0) {
                                    handleSetChange(
                                      exIndex,
                                      setIndex,
                                      "reps",
                                      value,
                                    );
                                  }
                                }}
                                className="
                                      w-full
                                      h-8
                                      bg-transparent
                                      border
                                      border-transparent
                                      hover:border-slate-700
                                      focus:border-sky-500/60
                                      rounded-lg
                                      text-center
                                      text-xs
                                      text-slate-200
                                      outline-none
                                      pr-7
                                      transition
                                    "
                              />

                              <span
                                className="
                                      absolute
                                      right-2
                                      top-1/2
                                      -translate-y-1/2
                                      text-[9px]
                                      text-slate-600
                                      pointer-events-none
                                    "
                              >
                                reps
                              </span>
                            </div>

                            {/* Set controls */}

                            <div className="flex items-center justify-end gap-0.5">
                              <button
                                type="button"
                                onClick={() => addSet(exIndex)}
                                className="
                                      w-7
                                      h-7
                                      rounded-lg
                                      flex
                                      items-center
                                      justify-center
                                      text-slate-500
                                      hover:text-sky-400
                                      hover:bg-sky-400/10
                                      transition
                                    "
                                title="Add set"
                              >
                                <Plus size={14} />
                              </button>

                              <button
                                type="button"
                                onClick={() => removeSet(exIndex, setIndex)}
                                disabled={exercise.sets.length === 1}
                                className="
                                      w-7
                                      h-7
                                      rounded-lg
                                      flex
                                      items-center
                                      justify-center
                                      text-slate-600
                                      hover:text-red-400
                                      hover:bg-red-400/10
                                      disabled:opacity-20
                                      disabled:cursor-not-allowed
                                      transition
                                    "
                                title="Remove set"
                              >
                                <Minus size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Validation */}

                      {errors[exIndex] && (
                        <p className="text-[11px] text-red-400 mt-2 px-1">
                          {errors[exIndex]}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* ==================================================
                  ADD EXERCISE
              ================================================== */}

              <button
                type="button"
                onClick={addExercise}
                className="
                  w-full
                  mt-3
                  h-10
                  rounded-xl
                  border
                  border-dashed
                  border-slate-700
                  text-slate-500
                  hover:text-sky-400
                  hover:border-sky-500/40
                  hover:bg-sky-400/5
                  flex
                  items-center
                  justify-center
                  gap-2
                  text-xs
                  font-medium
                  transition
                "
              >
                <Plus size={15} />
                Add another exercise
              </button>
            </section>

            {/* ==================================================
                ACTIONS
            ================================================== */}

            <section className="pt-1">
              <button
                type="submit"
                className="
                  w-full
                  h-11
                  rounded-xl
                  bg-sky-500
                  hover:bg-sky-400
                  active:scale-[0.99]
                  text-white
                  text-sm
                  font-semibold
                  shadow-lg
                  shadow-sky-500/10
                  transition
                "
              >
                {isEditMode ? "Update Workout" : "Save Workout"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/")}
                className="
                  w-full
                  mt-2
                  h-9
                  rounded-xl
                  text-xs
                  text-slate-600
                  hover:text-slate-300
                  transition
                "
              >
                Cancel
              </button>
            </section>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddWorkout;
