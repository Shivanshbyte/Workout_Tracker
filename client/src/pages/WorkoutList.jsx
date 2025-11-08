import { useEffect, useState } from "react";
import { getWorkouts, deleteWorkout } from "../api.js";
import { useNavigate } from "react-router-dom";
import {
  PlusCircle,
  Trash2,
  Dumbbell,
  CalendarDays,
  Pencil,
} from "lucide-react";
import "../styles.css";

const WorkoutList = () => {
  const [workouts, setWorkouts] = useState([]);
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUserName(parsedUser.name || parsedUser.username || "");
      } catch (error) {
        console.error("Error parsing user from localStorage:", error);
      }
    }

    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      const res = await getWorkouts();
      setWorkouts(res.data || []);
    } catch (err) {
      console.error("Error fetching workouts:", err);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteWorkout(id);
      fetchWorkouts();
    } catch (err) {
      console.error("Error deleting workout:", err);
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit/${id}`);
  };
  const handleAddClick = () => {
    navigate("/add");
  };

  return (
    <div className="min-h-screen min-w-screen  bg-slate-900 text-slate-100 flex flex-col items-center justify-center px-4 py-8">
      {/* Header */}
      <div className="w-full max-w-2xl flex justify-between items-center mb-6">
        <h1 className="flex flex-col items-start md:items-start gap-1 text-sky-300 font-bold">
          {userName ? (
            <>
              {/* 👋 Greeting line */}
              <span className="text-lg md:text-xl font-medium  text-sky-400">
                Hi {userName.charAt(0).toUpperCase() + userName.slice(1)} 👋
              </span>

              {/* 🏋️ Main heading */}
              <span className="text-xl md:text-4xl flex items-center gap-2  text-sky-400">
                Your Workouts
                <Dumbbell className="text-sky-400" size={25} />
              </span>
            </>
          ) : (
            <span className="text-xl md:text-4xl flex items-center gap-2">
              Your Workouts
              <Dumbbell className="text-sky-400" size={25} />
            </span>
          )}
        </h1>

        <button
          onClick={handleAddClick}
          className="flex items-center me-1! bg-sky-600 hover:bg-sky-500 transition text-white px-4 py-2 rounded-xl font-medium shadow-md"
        >
          <PlusCircle size={20} />
          <span className="hidden sm:block">Add New</span>
        </button>

        <button
          onClick={() => {
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate("/login");
          }}
          className="text-red-400 hover:text-red-500 transition"
        >
          Logout
        </button>
      </div>

      {/* Workout List */}
      <ul className="w-full max-w-2xl space-y-4">
        {workouts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[60vh] w-full border border-slate-700 rounded-xl bg-slate-800/40">
            <Dumbbell size={42} className="text-sky-400 mb-3 animate-pulse" />
            <p className="text-slate-400 text-center text-lg">
              No workouts yet! Start your fitness journey 💪
            </p>
            <button
              onClick={handleAddClick}
              className="mt-4 bg-sky-600 hover:bg-sky-500 text-white px-5 py-2 rounded-lg shadow-md transition-all"
            >
              Add First Workout
            </button>
          </div>
        ) : (
          [...workouts] // create a copy so we don't mutate state
            .sort((a, b) => new Date(b.date) - new Date(a.date)) // 🔹 Sort: latest first
            .map((w) => (
              <li
                key={w.id}
                className="bg-slate-800/70 p-4 rounded-2xl border border-slate-700 hover:border-sky-500 transition shadow-md"
              >
                {/* Workout Header */}
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h2 className="text-lg font-semibold flex items-center gap-2">
                      <CalendarDays className="text-sky-400" size={18} />
                      {new Date(w.date).toLocaleDateString()}
                    </h2>
                    <p className="text-sm text-slate-400">
                      <span className="font-medium text-slate-300">
                        Muscle Group:
                      </span>{" "}
                      {Array.isArray(w.muscle_group)
                        ? w.muscle_group.join(", ")
                        : JSON.parse(w.muscle_group || "[]").join(", ")}
                    </p>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    {/* 🗑️ Delete Button */}
                    <button
                      onClick={() => handleDelete(w.id)}
                      className="text-red-400 hover:text-red-500 transition"
                      title="Delete workout"
                    >
                      <Trash2 size={20} />
                    </button>

                    {/* ✏️ Update Button */}
                    <button
                      onClick={() => handleEdit(w.id)}
                      className="text-sky-400 hover:text-sky-500 transition"
                      title="Edit workout"
                    >
                      <Pencil size={18} />
                    </button>
                  </div>
                </div>

                {/* Exercises */}
                {w.exercises && w.exercises.length > 0 && (
                  <div className="mt-3 space-y-3">
                    {w.exercises.map((ex, exIndex) => (
                      <div
                        key={exIndex}
                        className="bg-slate-700/60 p-3 rounded-xl border border-slate-600"
                      >
                        <p className="font-semibold text-slate-200 flex items-center justify-between">
                          {ex.name}
                          <span className="text-sm text-slate-400">
                            ({ex.totalSets} sets)
                          </span>
                        </p>

                        {ex.sets && ex.sets.length > 0 && (
                          <div className="mt-1 ml-3 space-y-1">
                            {ex.sets.map((set, setIndex) => (
                              <div
                                key={setIndex}
                                className="text-sm text-slate-300 flex flex-wrap gap-4"
                              >
                                <span>
                                  {set.count} set{set.count > 1 ? "s" : ""}
                                </span>
                                <span>Weight: {set.weight} kg</span>
                                <span>Reps: {set.reps}</span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </li>
            ))
        )}
      </ul>
    </div>
  );
};

export default WorkoutList;
