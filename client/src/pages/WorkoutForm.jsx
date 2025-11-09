import { useState, useEffect } from "react";
import { addWorkout, getWorkoutById, updateWorkout } from "../api";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import CreatableSelect from "react-select/creatable";
import { Plus, Minus, Dumbbell, ArrowLeft, X } from "lucide-react";
import { muscleOptions } from "./WorkoutConfig";
import { exercisesByMuscle } from "./WorkoutConfig";
import { customSelectStyles } from "./WorkoutConfig";
import { useParams } from "react-router-dom";

const AddWorkout = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id && !isNaN(Number(id));
  console.log("id",id);

  useEffect(() => {
    if (id) {
      (async () => {
        try {
          const existingWorkout = await getWorkoutById(id);
          const existingdata = existingWorkout?.data;

          setForm({
            date: new Date(existingdata.date),
            muscle_group: existingdata.muscle_group.map((m) => ({
              value: m,
              label: m,
            })),
          });
          setExercises(existingdata.exercises);
        } catch (error) {
          console.error("Failed to fetch workout for edit:", error);
        }
      })();
    }
  }, [id]);

  const today = new Date();

  const [form, setForm] = useState({
    date: today,
    muscle_group: [],
    exercises: [],
  });

  const initialExercise = {
    name: "",
    totalSets: null,
    sets: [{ count: "", weight: "", reps: "" }],
  };

  const [exercises, setExercises] = useState([initialExercise]);
  const [errors, setErrors] = useState([]);

  const getExerciseOptions = (selectedMuscles) => {
    let options = [];
    selectedMuscles.forEach((muscle) => {
      options = [...options, ...(exercisesByMuscle[muscle.value] || [])];
    });
    return options;
  };

  const handleExerciseChange = (index, field, value) => {
    const newExercises = [...exercises];
    newExercises[index][field] = value;
    setExercises(newExercises);
  };

  const handleSetChange = (exerciseIndex, setIndex, field, value) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].sets[setIndex][field] = value;
    setExercises(newExercises);
    validateSets(exerciseIndex);
  };

  const addSet = (exerciseIndex) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].sets.push({ count: "", weight: "", reps: "" });
    setExercises(newExercises);
  };

  const removeSet = (exerciseIndex, setIndex) => {
    const newExercises = [...exercises];
    newExercises[exerciseIndex].sets.splice(setIndex, 1);
    setExercises(newExercises);
    validateSets(exerciseIndex);
  };

  const addExercise = () => {
    setExercises([
      ...exercises,
      { name: "", totalSets: 0, sets: [{ count: "", weight: "", reps: "" }] },
    ]);
  };
  const removeExercise = (index) => {
    const updatedExercises = [...exercises];
    updatedExercises.splice(index, 1);
    setExercises(updatedExercises);
  };

  const validateSets = (exerciseIndex) => {
    const totalSets = Number(exercises[exerciseIndex].totalSets || 0);
    const sumCounts = exercises[exerciseIndex].sets.reduce(
      (sum, s) => sum + Number(s.count || 0),
      0
    );
    const newErrors = [...errors];
    newErrors[exerciseIndex] =
      sumCounts > totalSets ? "Sum of counts exceeds total sets!" : "";
    setErrors(newErrors);
  };
  const handleSubmit = async (e) => {
    e.preventDefault();

    const payload = {
      date: form.date,
      muscle_group: form.muscle_group.map((m) => m.value),
      exercises: exercises.map((ex) => ({
        name: ex.name,
        totalSets: ex.totalSets,
        sets: ex.sets.map((s) => ({
          count: s.count,
          weight: s.weight,
          reps: s.reps,
        })),
      })),
    };

    console.log("payload ",payload)

    try {
      if (id) {
        await updateWorkout(id, payload);
      } else {
        await addWorkout(payload);
      }
      setForm({ date: "", muscle_group: [], exercises: [] });
      setExercises([initialExercise]);
      navigate("/");
    } catch (error) {
      console.error("Error saving workout:", error);
    }
  };

  // const handleSubmit = async (e) => {
  //   e.preventDefault();
  //   const payload = {
  //     date: form.date,
  //     muscle_group: form.muscle_group.map((m) => m.value),
  //     exercises: exercises.map((ex) => ({
  //       name: ex.name,
  //       totalSets: ex.totalSets,
  //       sets: ex.sets.map((s) => ({
  //         count: s.count,
  //         weight: s.weight,
  //         reps: s.reps,
  //       })),
  //     })),
  //   };
  //   try {
  //     await addWorkout(payload);
  //     setForm({ date: "", muscle_group: [], exercises: [] });
  //     setExercises([initialExercise]);
  //     navigate("/");
  //   } catch (error) {
  //     console.error("Error adding workout:", error);
  //   }
  // };

  return (
    <div className="w-screen min-h-screen bg-slate-900 flex items-center justify-center px-4 py-6">
      <div className="bg-slate-800 w-full max-w-2xl p-6 rounded-2xl shadow-lg border border-slate-700 overflow-y-auto max-h-[95vh]">
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <h2 className="text-2xl font-semibold text-center text-white mb-2">
             {isEditMode ? "Edit Workout" : "Add New Workout"}
          </h2>

          {/* Date */}
          <DatePicker
            selected={form.date}
            onChange={(date) => setForm({ ...form, date })}
            dateFormat="dd/MM/yyyy"
            placeholderText="Select Date"
            maxDate={today} // ✅ restrict to today and before
            className="border mb-2 border-slate-600 bg-slate-700 text-white rounded-lg px-3 py-2 w-full focus:outline-none focus:ring-2 focus:ring-sky-500"
            popperPlacement="bottom"
            showPopperArrow={false}
            calendarClassName="bg-slate-800 text-white rounded-lg"
          />

          {/* Muscle Group */}
          <CreatableSelect
            isMulti
            options={muscleOptions}
            value={form.muscle_group}
            onChange={(selected) =>
              setForm({ ...form, muscle_group: selected })
            }
            placeholder="Select or enter muscle group..."
            styles={customSelectStyles}
            className="w-full"
          />

          {/* Add Exercise Button */}
          <button
            type="button"
            onClick={addExercise}
            className="self-end bg-sky-700 hover:bg-sky-600 text-white rounded-lg px-2 py-1 text-sm transition-all"
          >
            Add Exercise
          </button>

          {/* Exercises */}
          {exercises?.map((exercise, exIndex) => (
            <div
              key={exIndex}
              className="w-full bg-slate-700 p-3 rounded-xl flex flex-col gap-3"
            >
              {/* Exercise header */}
              <div className="flex flex-wrap items-center gap-2">
                <CreatableSelect
                  options={getExerciseOptions(form.muscle_group)}
                  value={
                    exercise.name
                      ? { value: exercise.name, label: exercise.name }
                      : null
                  }
                  onChange={(selected) =>
                    handleExerciseChange(exIndex, "name", selected?.value)
                  }
                  placeholder="Select or enter exercises..."
                  className="flex-1"
                  styles={customSelectStyles}
                />
                <button
                  type="button"
                  onClick={() => removeExercise(exIndex)} // ← create this handler
                  className="bg-transparent! text-red-400 hover:text-red-500 transition"
                  title="Remove Exercise"
                >
                  <X size={14} />
                </button>
              </div>
              <div className="flex flex-col md:flex-row items-start md:items-center gap-3 w-full">
                {/* Total Sets Input */}
                <input
                  type="number"
                  placeholder="Total Sets"
                  value={exercise.totalSets}
                  onChange={(e) => {
                    handleExerciseChange(exIndex, "totalSets", e.target.value),
                      validateSets(exIndex);
                  }}
                  className="w-[90%] md:w-32 md:me-4 me-6 border border-slate-600 bg-slate-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />

                {/* Sets Container */}
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4 w-full">
                  {/* Sets Container */}
                  <div className="flex flex-col gap-2 w-full">
                    {exercise.sets.map((set, setIndex) => (
                      <div
                        key={setIndex}
                        className="flex items-center justify-between"
                      >
                        {/* Count */}
                        <input
                          type="number"
                          placeholder="Count"
                          min="1"
                          value={set.count}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "" || Number(value) > 0) {
                              handleSetChange(
                                exIndex,
                                setIndex,
                                "count",
                                value
                              );
                            }
                          }}
                          className="w-[20%] sm:w-[18%] border border-slate-600 bg-slate-800 text-white rounded-lg px-2 py-1 text-center text-sm focus:ring-1 focus:ring-sky-500"
                        />

                        {/* Weight */}
                        <input
                          type="number"
                          placeholder="Weight"
                          min="1"
                          value={set.weight}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "" || Number(value) > 0) {
                              handleSetChange(
                                exIndex,
                                setIndex,
                                "weight",
                                value
                              );
                            }
                          }}
                          className="w-[20%] sm:w-[18%] border border-slate-600 bg-slate-800 text-white rounded-lg px-2 py-1 text-center text-sm focus:ring-1 focus:ring-sky-500"
                        />

                        {/* Reps */}
                        <input
                          type="number"
                          placeholder="Reps"
                          min="1"
                          value={set.reps}
                          onChange={(e) => {
                            const value = e.target.value;
                            if (value === "" || Number(value) > 0) {
                              handleSetChange(exIndex, setIndex, "reps", value);
                            }
                          }}
                          className="w-[20%] sm:w-[18%] border border-slate-600 bg-slate-800 text-white rounded-lg px-2 py-1 text-center text-sm focus:ring-1 focus:ring-sky-500"
                        />

                        {/* Buttons */}
                        <div className="flex ms-2 gap-2 w-[18%]! justify-end!">
                          <button
                            type="button"
                            onClick={() => addSet(exIndex)}
                            className="p-1.5 rounded-lg hover:bg-sky-500 transition-all"
                          >
                            <Plus size={10} className="md:size-5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeSet(exIndex, setIndex)}
                            className="p-1.5 rounded-lg hover:bg-red-500 transition-all"
                          >
                            <Minus size={10} className="md:size-5"  />
                          </button>
                        </div>
                      </div>
                    ))}

                    {errors[exIndex] && (
                      <div className="text-red-400 text-sm mt-1">
                        {errors[exIndex]}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Submit */}
          <button
            type="submit"
            onClick={(e) => handleSubmit(e)}
            className="mt-3 bg-sky-600 hover:bg-sky-500 text-white font-semibold py-2 rounded-lg transition-all shadow-md"
          >
            
            {isEditMode ? "Update Workout" : "Save Workout"}
          </button>

          {/* Back */}
          <button
            type="button"
            onClick={() => navigate("/")}
            className="text-slate-400 hover:text-sky-400 flex items-center justify-center gap-1 py-1 text-sm transition-all"
          >
            <ArrowLeft size={16} /> Back to List
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddWorkout;
