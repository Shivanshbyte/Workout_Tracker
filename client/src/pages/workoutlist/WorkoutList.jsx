import { useEffect, useMemo, useState } from "react";
import { getWorkouts, deleteWorkout } from "../../api.js";
import { useNavigate } from "react-router-dom";
import Skeleton from "../../components/skeleton.jsx";
import {
  Plus,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  CalendarDays,
  Pencil,
  ChevronDown,
  ChevronUp,
  Trash2,
} from "lucide-react";
import "../../styles.css";
import { useAuth } from "../../components/AuthContext.jsx";
import AIInsights from "../../components/aiInsights.jsx";
import { getDayStatuses, markRestDay, removeRestDay } from "../../api.js";

const WorkoutList = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [expandedWorkout, setExpandedWorkout] = useState(null);
  const [dayStatuses, setDayStatuses] = useState({});
  const [expandedDayStatus, setExpandedDayStatus] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const navigate = useNavigate();
  const { user } = useAuth();

  /* ==================================================
     FETCH WORKOUTS
  ================================================== */

  const fetchWorkouts = async () => {
    try {
      setLoading(true);

      const res = await getWorkouts();

      setWorkouts(res.data || []);
    } catch (err) {
      console.error("Error fetching workouts:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchDayStatuses = async () => {
    try {
      const res = await getDayStatuses();

      const statusMap = {};

      (res.data || []).forEach((item) => {
        statusMap[item.date] = item.status;
      });

      setDayStatuses(statusMap);
    } catch (err) {
      console.error("Error fetching day statuses:", err);
    }
  };

  useEffect(() => {
    fetchWorkouts();
    fetchDayStatuses();
  }, []);

  // Day status

  const unmarkSelectedDayAsRest = async () => {
    try {
      setStatusLoading(true);

      const selectedKey = dateKey(selectedDate);

      await removeRestDay(selectedKey);

      setDayStatuses((prev) => {
        const updated = { ...prev };

        delete updated[selectedKey];

        return updated;
      });
    } catch (err) {
      console.error("Error removing rest day:", err);
    } finally {
      setStatusLoading(false);
    }
  };

  const markSelectedDayAsRest = async () => {
    try {
      setStatusLoading(true);

      const selectedKey = dateKey(selectedDate);

      await markRestDay(selectedKey);

      setDayStatuses((prev) => ({
        ...prev,
        [selectedKey]: "rest",
      }));

      setExpandedDayStatus(true);
    } catch (err) {
      console.error("Error marking rest day:", err);
    } finally {
      setStatusLoading(false);
    }
  };

  /* ==================================================
     DATE HELPERS
  ================================================== */

  const normalizeDate = (date) => {
    const d = new Date(date);

    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  };

  const dateKey = (date) => {
    const d = normalizeDate(date);

    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0",
    )}-${String(d.getDate()).padStart(2, "0")}`;
  };

  const today = normalizeDate(new Date());

  const isToday = (date) => {
    return dateKey(date) === dateKey(today);
  };

  const isFutureDate = (date) => {
    return normalizeDate(date) > today;
  };

  /* ==================================================
     WORKOUTS BY DATE
  ================================================== */

  const workoutsByDate = useMemo(() => {
    const map = {};

    workouts.forEach((workout) => {
      const key = dateKey(workout.date);

      if (!map[key]) {
        map[key] = [];
      }

      map[key].push(workout);
    });

    return map;
  }, [workouts]);

  const getWorkoutsForDate = (date) => {
    return workoutsByDate[dateKey(date)] || [];
  };

  /* ==================================================
     CALENDAR GENERATION
  ================================================== */

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    // Monday = 0 ... Sunday = 6
    let startDay = firstDay.getDay();

    startDay = startDay === 0 ? 6 : startDay - 1;

    const days = [];

    // Empty cells before the first day
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // Days of current month
    for (let day = 1; day <= lastDay.getDate(); day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  }, [currentMonth]);

  /* ==================================================
     MONTH NAVIGATION
  ================================================== */

  const goToPreviousMonth = () => {
    setCurrentMonth(
      new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1),
    );
  };

  const goToNextMonth = () => {
    const nextMonth = new Date(
      currentMonth.getFullYear(),
      currentMonth.getMonth() + 1,
      1,
    );

    const currentYear = today.getFullYear();
    const currentMonthNumber = today.getMonth();

    const nextYear = nextMonth.getFullYear();
    const nextMonthNumber = nextMonth.getMonth();

    // Do not allow navigating into future months
    if (
      nextYear < currentYear ||
      (nextYear === currentYear && nextMonthNumber <= currentMonthNumber)
    ) {
      setCurrentMonth(nextMonth);
    }
  };

  const isCurrentMonth =
    currentMonth.getFullYear() === today.getFullYear() &&
    currentMonth.getMonth() === today.getMonth();

  /* ==================================================
     SELECTED DATE
  ================================================== */

  const selectedWorkouts = getWorkoutsForDate(selectedDate);

  const toggleWorkout = (id) => {
    setExpandedWorkout((prev) => (prev === id ? null : id));
  };

  /* ==================================================
     MONTHLY STATISTICS
  ================================================== */

  const currentMonthWorkouts = workouts.filter((workout) => {
    const date = normalizeDate(workout.date);

    return (
      date.getFullYear() === currentMonth.getFullYear() &&
      date.getMonth() === currentMonth.getMonth()
    );
  });

  // Unique workout days instead of number of workout records
  const uniqueWorkoutDays = new Set(
    currentMonthWorkouts.map((workout) => dateKey(workout.date)),
  ).size;

  /* ==================================================
     MUSCLE GROUPS
  ================================================== */

  const getMuscleGroups = (workout) => {
    if (!workout?.muscle_group) {
      return [];
    }

    if (Array.isArray(workout.muscle_group)) {
      return workout.muscle_group;
    }

    try {
      return JSON.parse(workout.muscle_group || "[]");
    } catch {
      return [workout.muscle_group];
    }
  };

  /* ==================================================
     DELETE WORKOUT
  ================================================== */

  const handleDelete = async (id) => {
    try {
      await deleteWorkout(id);
      await fetchWorkouts();
    } catch (err) {
      console.error("Error deleting workout:", err);
    }
  };

  /* ==================================================
     LOGOUT
  ================================================== */

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login");
  };

  /* ==================================================
     FORMATTERS
  ================================================== */

  const monthName = currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const selectedDateText = selectedDate.toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  /* ==================================================
     UI
  ================================================== */

  return (
    <div className="min-h-[100dvh] w-full bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* ==================================================
          CENTERED APP CONTAINER
      ================================================== */}

      <div className="min-h-[100dvh] w-full flex justify-center">
        <div
          className="
            relative
            w-full
            max-w-[480px]
            min-w-0
            min-h-[100dvh]
            px-4
            sm:px-6
            py-5
            pb-24
            box-border
          "
        >
          {/* ==================================================
              HEADER
          ================================================== */}

          <header className="w-full mb-5">
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs sm:text-sm text-slate-500">
                  Good to see you
                </p>

                <h1 className="!text-[28px] sm:!text-[30px] !font-semibold !text-white truncate">
                  {user?.name || "Athlete"} 👋
                </h1>
              </div>

              <button
                onClick={handleLogout}
                className="
                  shrink-0
                  text-xs
                  text-slate-500
                  hover:text-red-400
                  transition
                "
              >
                Logout
              </button>
            </div>
          </header>

          {/* ==================================================
              LOADING
          ================================================== */}

          {loading ? (
            <div className="w-full">
              <Skeleton />
            </div>
          ) : (
            <main className="w-full">
              {/* ==================================================
                  MONTH HEADER
              ================================================== */}

              <section className="mb-4">
                <div className="flex items-center justify-between">
                  {/* Previous month */}

                  <button
                    onClick={goToPreviousMonth}
                    className="
                      w-9
                      h-9
                      sm:w-10
                      sm:h-10
                      shrink-0
                      flex
                      items-center
                      justify-center
                      rounded-full
                      bg-slate-900
                      border
                      border-slate-800
                      hover:bg-slate-800
                      active:scale-95
                      transition
                    "
                    aria-label="Previous month"
                  >
                    <ChevronLeft size={18} />
                  </button>

                  {/* Month */}

                  <div className="text-center px-3 min-w-0">
                    <h2 className="text-lg sm:text-xl font-semibold text-white">
                      {monthName}
                    </h2>

                    <p className="text-[11px] sm:text-xs text-slate-500 mt-0.5">
                      {uniqueWorkoutDays} workout
                      {uniqueWorkoutDays !== 1 ? "s" : ""} this month
                    </p>
                  </div>

                  {/* Next month */}

                  <button
                    onClick={goToNextMonth}
                    disabled={isCurrentMonth}
                    className="
                      w-9
                      h-9
                      sm:w-10
                      sm:h-10
                      shrink-0
                      flex
                      items-center
                      justify-center
                      rounded-full
                      bg-slate-900
                      border
                      border-slate-800
                      hover:bg-slate-800
                      active:scale-95
                      transition
                      disabled:opacity-25
                      disabled:cursor-not-allowed
                    "
                    aria-label="Next month"
                  >
                    <ChevronRight size={18} />
                  </button>
                </div>
              </section>

              {/* ==================================================
                  CALENDAR
              ================================================== */}

              <section
                className="
                  w-full
                  bg-slate-900/70
                  border
                  border-slate-800
                  rounded-[22px]
                  p-3
                  sm:p-4
                  shadow-xl
                  box-border
                "
              >
                {/* Week days */}

                <div className="grid grid-cols-7 w-full mb-2">
                  {["M", "T", "W", "T", "F", "S", "S"].map((day, index) => (
                    <div
                      key={index}
                      className="
                          w-full
                          text-center
                          text-[10px]
                          sm:text-[11px]
                          font-medium
                          text-slate-600
                        "
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar days */}

                <div className="grid grid-cols-7 w-full gap-y-1">
                  {calendarDays.map((date, index) => {
                    if (!date) {
                      return (
                        <div
                          key={`empty-${index}`}
                          className="w-full aspect-square"
                        />
                      );
                    }

                    const key = dateKey(date);

                    const dayWorkouts = workoutsByDate[key] || [];

                    const hasWorkout = dayWorkouts.length > 0;

                    const future = isFutureDate(date);

                    const todayDate = isToday(date);

                    const selected = dateKey(date) === dateKey(selectedDate);

                    const dateKeyValue = dateKey(date);
                    const dateStatus = dayStatuses[dateKeyValue];
                    // const hasWorkout = workoutDates.has(dateKeyValue);

                    let statusClass = "";

                    if (hasWorkout) {
                      statusClass = "bg-emerald-400";
                    } else if (dateStatus === "rest") {
                      statusClass = "bg-violet-400";
                    } else if (!future) {
                      statusClass = "bg-red-400/50";
                    }

                    return (
                      <button
                        key={key}
                        onClick={() => setSelectedDate(date)}
                        className="
                          relative
                          w-full
                          aspect-square
                          flex
                          items-center
                          justify-center
                          touch-manipulation
                        "
                        aria-label={date.toDateString()}
                      >
                        {/* Selected background */}

                        {selected && !todayDate && (
                          <span
                            className="
                              absolute
                              w-[76%]
                              h-[76%]
                              rounded-full
                              bg-slate-800
                            "
                          />
                        )}

                        {/* Date */}

                        <span
                          className={`
                            relative
                            z-10
                            w-[76%]
                            h-[76%]
                            rounded-full
                            flex
                            items-center
                            justify-center
                            text-xs
                            sm:text-sm
                            transition-all

                            ${
                              todayDate
                                ? "bg-sky-500 text-white font-semibold shadow-lg shadow-sky-500/20"
                                : future
                                  ? "text-slate-700"
                                  : "text-slate-300"
                            }
                          `}
                        >
                          {date.getDate()}
                        </span>

                        {/* Workout / Rest indicator */}

                        {!future && (
                          <span
                            className={`
    absolute
    bottom-[5%]
    z-20
    w-1.5
    h-1.5
    rounded-full
    ${statusClass}
  `}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* ==================================================
                    LEGEND
                ================================================== */}

                {/* <div
                  className="
                    flex
                    items-center
                    justify-center
                    gap-4
                    sm:gap-6
                    mt-3
                    pt-3
                    border-t
                    border-slate-800
                  "
                >

                 

                  <div className="flex items-center gap-1.5">

                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />

                    <span className="text-[10px] sm:text-[11px] text-slate-500">
                      Workout
                    </span>

                  </div>

                  

                  <div className="flex items-center gap-1.5">

                    <span className="w-1.5 h-1.5 rounded-full bg-red-400/50" />

                    <span className="text-[10px] sm:text-[11px] text-slate-500">
                      Rest
                    </span>

                  </div>

                  

                  <div className="flex items-center gap-1.5">

                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />

                    <span className="text-[10px] sm:text-[11px] text-slate-500">
                      Today
                    </span>

                  </div>

                </div> */}
              </section>

              <AIInsights />

              {/* ==================================================
                  SELECTED DAY
              ================================================== */}

              <section className="mt-5">
                {/* Selected date heading */}

                <div className="flex items-center justify-between mb-3">
                  <div className="min-w-0">
                    <p className="text-[10px] sm:text-xs text-slate-600 uppercase tracking-wide">
                      Selected day
                    </p>

                    <h3 className="text-base sm:text-lg font-semibold text-white mt-0.5 truncate">
                      {selectedDateText}
                    </h3>
                  </div>

                  {selectedWorkouts.length > 0 && (
                    <div
                      className="
                        w-9
                        h-9
                        shrink-0
                        rounded-full
                        bg-emerald-400/10
                        flex
                        items-center
                        justify-center
                        ml-3
                      "
                    >
                      <Dumbbell size={17} className="text-emerald-400" />
                    </div>
                  )}
                </div>

                {/* ==================================================
                    NO WORKOUT
                ================================================== */}

                {/* ==================================================
    NO WORKOUT
================================================== */}

                {selectedWorkouts.length === 0
                  ? (() => {
                      const selectedKey = dateKey(selectedDate);

                      const future = isFutureDate(selectedDate);

                      const isRestDay = dayStatuses[selectedKey] === "rest";

                      return (
                        <div
                          className="
          w-full
          bg-slate-900/60
          border
          border-slate-800
          rounded-2xl
          overflow-hidden
          box-border
        "
                        >
                          {/* ==========================================
            STATUS HEADER
        ========================================== */}

                          <button
                            type="button"
                            disabled={future}
                            onClick={() =>
                              !future && setExpandedDayStatus((prev) => !prev)
                            }
                            className={`
            w-full
            px-4
            py-3.5
            flex
            items-center
            gap-3
            text-left
            transition
            ${future ? "cursor-default" : "hover:bg-slate-800/30"}
          `}
                          >
                            {/* Status icon */}

                            <div
                              className={`
              w-9
              h-9
              shrink-0
              rounded-full
              flex
              items-center
              justify-center
              ${
                future
                  ? "bg-slate-800"
                  : isRestDay
                    ? "bg-emerald-400/10"
                    : "bg-red-400/10"
              }
            `}
                            >
                              <span
                                className={`
                w-2
                h-2
                rounded-full
                ${
                  future
                    ? "bg-slate-600"
                    : isRestDay
                      ? "bg-emerald-400"
                      : "bg-red-400"
                }
              `}
                              />
                            </div>

                            {/* Status text */}

                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-300">
                                {future
                                  ? "Upcoming day"
                                  : isRestDay
                                    ? "Rest day"
                                    : "Missed day"}
                              </p>

                              <p className="text-[11px] text-slate-600 mt-0.5">
                                {future
                                  ? "No workout planned yet"
                                  : isRestDay
                                    ? "Recovery day"
                                    : "No workout recorded"}
                              </p>
                            </div>

                            {/* Chevron */}

                            {!future &&
                              (expandedDayStatus ? (
                                <ChevronUp
                                  size={16}
                                  className="text-slate-600"
                                />
                              ) : (
                                <ChevronDown
                                  size={16}
                                  className="text-slate-600"
                                />
                              ))}
                          </button>

                          {/* ==========================================
            REST DAY OPTIONS
        ========================================== */}

                          {!future && expandedDayStatus && (
                            <div
                              className="
              border-t
              border-slate-800
              px-4
              py-3
            "
                            >
                              <p
                                className="
                text-[10px]
                uppercase
                tracking-wider
                text-slate-600
                mb-2.5
              "
                              >
                                Day status
                              </p>

                              <div className="grid grid-cols-2 gap-2">
                                {/* MISSED */}

                                <button
                                  type="button"
                                  disabled={statusLoading}
                                  onClick={
                                    isRestDay
                                      ? unmarkSelectedDayAsRest
                                      : undefined
                                  }
                                  className={`
                  rounded-xl
                  px-3
                  py-2.5
                  border
                  text-xs
                  transition
                  ${
                    !isRestDay
                      ? "bg-red-400/10 border-red-400/20 text-red-400"
                      : "bg-slate-800/40 border-slate-800 text-slate-500 hover:text-red-400"
                  }
                  ${statusLoading ? "opacity-50 cursor-not-allowed" : ""}
                `}
                                >
                                  <div className="flex items-center justify-center gap-2">
                                    <span
                                      className={`
                      w-1.5
                      h-1.5
                      rounded-full
                      ${!isRestDay ? "bg-red-400" : "bg-slate-600"}
                    `}
                                    />
                                    Missed
                                  </div>
                                </button>

                                {/* REST DAY */}

                                <button
                                  type="button"
                                  disabled={statusLoading || isRestDay}
                                  onClick={
                                    !isRestDay
                                      ? markSelectedDayAsRest
                                      : undefined
                                  }
                                  className={`
                  rounded-xl
                  px-3
                  py-2.5
                  border
                  text-xs
                  transition
                  ${
                    isRestDay
                      ? "bg-emerald-400/10 border-emerald-400/20 text-emerald-400"
                      : "bg-slate-800/40 border-slate-800 text-slate-500 hover:text-emerald-400"
                  }
                  ${statusLoading ? "opacity-50 cursor-not-allowed" : ""}
                `}
                                >
                                  <div className="flex items-center justify-center gap-2">
                                    <span
                                      className={`
                      w-1.5
                      h-1.5
                      rounded-full
                      ${isRestDay ? "bg-emerald-400" : "bg-slate-600"}
                    `}
                                    />
                                    Rest Day
                                  </div>
                                </button>
                              </div>

                              {!isRestDay && (
                                <p className="text-[10px] text-slate-600 mt-2 text-center">
                                  Mark this day as a recovery day if you
                                  intentionally didn't train.
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })()
                  : /* ==================================================
                     WORKOUT CARD
                  ================================================== */

                    selectedWorkouts.map((workout) => (
                      <div
                        key={workout._id}
                        className="
      w-full
      bg-slate-900/70
      border
      border-slate-800
      rounded-2xl
      overflow-hidden
      box-border
    "
                      >
                        {/* ==================================================
        WORKOUT HEADER
    ================================================== */}

                        <div className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {/* Clickable workout area */}

                            <button
                              type="button"
                              onClick={() => toggleWorkout(workout._id)}
                              className="
            flex-1
            min-w-0
            text-left
            rounded-xl
            px-1
            py-1
            hover:bg-slate-800/30
            active:bg-slate-800/40
            transition
          "
                            >
                              <div className="flex items-center gap-2">
                                {/* Muscle groups */}

                                <div className="flex flex-wrap gap-1.5 min-w-0">
                                  {getMuscleGroups(workout).map(
                                    (muscle, index) => (
                                      <span
                                        key={index}
                                        className="
                      text-[10px]
                      px-2
                      py-1
                      rounded-full
                      bg-sky-400/10
                      text-sky-400
                      whitespace-nowrap
                    "
                                      >
                                        {muscle}
                                      </span>
                                    ),
                                  )}
                                </div>
                              </div>

                              {/* Exercise count + collapse icon */}

                              <div className="flex items-center gap-1.5 mt-1.5">
                                <p className="text-[11px] text-slate-600">
                                  {workout.exercises?.length || 0}{" "}
                                  {workout.exercises?.length === 1
                                    ? "exercise"
                                    : "exercises"}
                                </p>

                                {expandedWorkout === workout._id ? (
                                  <ChevronUp
                                    size={14}
                                    className="text-slate-600"
                                  />
                                ) : (
                                  <ChevronDown
                                    size={14}
                                    className="text-slate-600"
                                  />
                                )}
                              </div>
                            </button>

                            {/* ==================================================
            EDIT / DELETE
        ================================================== */}

                            <div
                              className="
            flex
            items-center
            gap-1
            shrink-0
          "
                            >
                              <button
                                type="button"
                                onClick={() => navigate(`/edit/${workout._id}`)}
                                className="
              w-8
              h-8
              flex
              items-center
              justify-center
              rounded-full
              hover:bg-slate-800
              active:scale-95
              transition
            "
                                title="Edit workout"
                              >
                                <Pencil size={15} className="text-sky-400" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDelete(workout._id)}
                                className="
              w-8
              h-8
              flex
              items-center
              justify-center
              rounded-full
              hover:bg-red-500/10
              active:scale-95
              transition
            "
                                title="Delete workout"
                              >
                                <Trash2 size={15} className="text-red-400" />
                              </button>
                            </div>
                          </div>
                        </div>

                        {/* ==================================================
        COLLAPSIBLE WORKOUT DETAILS
    ================================================== */}

                        {expandedWorkout === workout._id && (
                          <div
                            className="
          border-t
          border-slate-800
          px-3
          sm:px-4
          py-3
          bg-slate-950/20
        "
                          >
                            {/* ==================================================
            TABLE

            Exercise gets most of the space.
            Sets / Weight / Reps stay compact.
        ================================================== */}

                            <div className="w-full overflow-x-auto">
                              <div className="min-w-[360px]">
                                {/* TABLE HEADER */}

                                <div
                                  className="
                grid
                grid-cols-[minmax(150px,2.5fr)_0.65fr_1fr_0.8fr]
                items-center
                gap-2
                px-3
                pb-2
                text-[9px]
                sm:text-[10px]
                uppercase
                tracking-wider
                text-slate-600
              "
                                >
                                  <span>Exercise</span>

                                  <span className="text-center">Sets</span>

                                  <span className="text-center">Weight</span>

                                  <span className="text-center">Reps</span>
                                </div>

                                {/* TABLE BODY */}

                                <div
                                  className="
                rounded-xl
                border
                border-slate-800
                overflow-hidden
              "
                                >
                                  {workout.exercises?.map(
                                    (exercise, exerciseIndex) => (
                                      <div key={exerciseIndex}>
                                        {exercise.sets?.map((set, setIndex) => {
                                          const hasWeight =
                                            set.weight !== undefined &&
                                            set.weight !== null &&
                                            set.weight !== "";

                                          const hasReps =
                                            set.reps !== undefined &&
                                            set.reps !== null &&
                                            set.reps !== "";

                                          const hasCount =
                                            set.count !== undefined &&
                                            set.count !== null &&
                                            set.count !== "";

                                          return (
                                            <div
                                              key={setIndex}
                                              className={`
                              grid
                              grid-cols-[minmax(150px,2.5fr)_0.65fr_1fr_0.8fr]
                              items-center
                              gap-2
                              px-3
                              py-2
                              text-[11px]
                              sm:text-xs
                              ${
                                exerciseIndex > 0 && setIndex === 0
                                  ? "border-t border-slate-800"
                                  : ""
                              }
                            `}
                                            >
                                              {/* ==================================
                                EXERCISE
                            ================================== */}

                                              <div className="min-w-0">
                                                {setIndex === 0 ? (
                                                  <>
                                                    <p
                                                      className="
                                      text-slate-300
                                      font-medium
                                      truncate
                                    "
                                                    >
                                                      {exercise.name}
                                                    </p>

                                                    <p
                                                      className="
                                      text-[9px]
                                      text-slate-600
                                      mt-0.5
                                    "
                                                    >
                                                      {exercise.totalSets ||
                                                        exercise.sets?.length ||
                                                        0}{" "}
                                                      {(exercise.totalSets ||
                                                        exercise.sets?.length ||
                                                        0) === 1
                                                        ? "set"
                                                        : "sets"}
                                                    </p>
                                                  </>
                                                ) : (
                                                  <span className="block h-3" />
                                                )}
                                              </div>

                                              {/* ==================================
                                SETS
                            ================================== */}

                                              <span
                                                className="
                                text-center
                                text-slate-400
                              "
                                              >
                                                {hasCount ? set.count : "-"}
                                              </span>

                                              {/* ==================================
                                WEIGHT
                            ================================== */}

                                              <span
                                                className="
                                text-center
                                text-slate-300
                                font-medium
                                whitespace-nowrap
                              "
                                              >
                                                {hasWeight
                                                  ? `${set.weight} kg`
                                                  : "-"}
                                              </span>

                                              {/* ==================================
                                REPS
                            ================================== */}

                                              <span
                                                className="
                                text-center
                                text-slate-300
                                font-medium
                                whitespace-nowrap
                              "
                                              >
                                                {hasReps ? set.reps : "-"}
                                              </span>
                                            </div>
                                          );
                                        })}
                                      </div>
                                    ),
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
              </section>
            </main>
          )}
        </div>
      </div>

      {/* ==================================================
          FLOATING ADD BUTTON
          Positioned relative to the centered 480px app
      ================================================== */}

      <button
        onClick={() => navigate("/add")}
        aria-label="Add workout"
        className="
          fixed
          z-50

          bottom-5

          right-[max(1rem,calc((100vw-480px)/2+1rem))]

          w-14
          h-14

          rounded-full

          bg-sky-500
          hover:bg-sky-400

          text-white

          flex
          items-center
          justify-center

          shadow-xl
          shadow-sky-500/20

          active:scale-95
          transition-all
        "
      >
        <Plus size={24} strokeWidth={2.5} />
      </button>
    </div>
  );
};

export default WorkoutList;
