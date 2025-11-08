export const customSelectStyles = {
  control: (provided) => ({
    ...provided,
    backgroundColor: "#1e293b", // dark background
    color: "#f1f5f9",
    borderRadius: "10px",
    borderColor: "#334155",
    minHeight: "40px",
    boxShadow: "none",
    "&:hover": { borderColor: "#38bdf8" },
  }),
  menu: (provided) => ({
    ...provided,
    backgroundColor: "#1e293b",
    color: "#f1f5f9",
  }),
  menuList: (provided) => ({
    ...provided,
    minHeight: "50px", // 👈 set minimum height for the dropdown list
    maxHeight: "170px", // optional: limit max height for better UX
    overflowY: "auto",
  }),
  option: (provided, state) => ({
    ...provided,
    backgroundColor: state.isFocused
      ? "#334155" // darker slate when hovered
      : "#1e293b", // normal background
    color: state.isFocused ? "#00fafc" : "#e2e8f0", // readable text
    cursor: "pointer",
    "&:active": {
      backgroundColor: "#38bdf8", // highlight when clicked
      color: "#0f172a",
    },
  }),
  placeholder: (provided) => ({
    ...provided,
    color: "#94a3b8",
  }),
  singleValue: (provided) => ({
    ...provided,
    color: "#f8fafc",
  }),
  input: (provided) => ({
  ...provided,
  color: "#fffff", // 👈 controls typing text color
}),
};

export const muscleOptions = [
  { value: "Chest", label: "Chest" },
  { value: "Back", label: "Back" },
  { value: "Shoulders", label: "Shoulders" },
  { value: "Biceps", label: "Biceps" },
  { value: "Triceps", label: "Triceps" },
  { value: "Legs", label: "Legs" },
  { value: "Abs", label: "Abs / Core" },
];

export const exercisesByMuscle = {
  Chest: [
    { value: "Barbell Bench Press", label: "Barbell Bench Press" },
    { value: "Incline Dumbbell Press", label: "Incline Dumbbell Press" },
    { value: "Flat Dumbbell Press", label: "Flat Dumbbell Press" },
    { value: "Incline Barbell Press", label: "Incline Barbell Press" },
    { value: "Chest Dips", label: "Chest Dips" },
    { value: "Cable Crossover", label: "Cable Crossover" },
    { value: "Machine Chest Press", label: "Machine Chest Press" },
    { value: "Decline Bench Press", label: "Decline Bench Press" },
    { value: "Push-ups", label: "Push-ups" },
    { value: "Pec Deck Fly", label: "Pec Deck Fly" },
  ],

  Back: [
    { value: "Deadlift", label: "Deadlift" },
    { value: "Pull-Ups", label: "Pull-Ups" },
    { value: "Lat Pulldown", label: "Lat Pulldown" },
    { value: "Barbell Row", label: "Barbell Row" },
    { value: "Seated Cable Row", label: "Seated Cable Row" },
    { value: "T-Bar Row", label: "T-Bar Row" },
    { value: "Single Arm Dumbbell Row", label: "Single Arm Dumbbell Row" },
    { value: "Chest Supported Row", label: "Chest Supported Row" },
    { value: "Straight Arm Pulldown", label: "Straight Arm Pulldown" },
    { value: "Inverted Row", label: "Inverted Row" },
  ],

  Shoulders: [
    { value: "Overhead Press", label: "Overhead Press" },
    { value: "Dumbbell Shoulder Press", label: "Dumbbell Shoulder Press" },
    { value: "Arnold Press", label: "Arnold Press" },
    { value: "Lateral Raise", label: "Lateral Raise" },
    { value: "Front Raise", label: "Front Raise" },
    { value: "Rear Delt Fly", label: "Rear Delt Fly" },
    { value: "Cable Lateral Raise", label: "Cable Lateral Raise" },
    { value: "Face Pull", label: "Face Pull" },
    { value: "Upright Row", label: "Upright Row" },
    {
      value: "Seated Machine Shoulder Press",
      label: "Seated Machine Shoulder Press",
    },
  ],

  Biceps: [
    { value: "Barbell Curl", label: "Barbell Curl" },
    { value: "Dumbbell Alternate Curl", label: "Dumbbell Alternate Curl" },
    { value: "Hammer Curl", label: "Hammer Curl" },
    { value: "Preacher Curl", label: "Preacher Curl" },
    { value: "Concentration Curl", label: "Concentration Curl" },
    { value: "Cable Curl", label: "Cable Curl" },
    { value: "Incline Dumbbell Curl", label: "Incline Dumbbell Curl" },
    { value: "Zottman Curl", label: "Zottman Curl" },
    { value: "Spider Curl", label: "Spider Curl" },
    { value: "Machine Bicep Curl", label: "Machine Bicep Curl" },
  ],

  Triceps: [
    { value: "Close Grip Bench Press", label: "Close Grip Bench Press" },
    { value: "Tricep Dips", label: "Tricep Dips" },
    { value: "Tricep Rope Pushdown", label: "Tricep Rope Pushdown" },
    {
      value: "Overhead Dumbbell Extension",
      label: "Overhead Dumbbell Extension",
    },
    { value: "Skull Crushers", label: "Skull Crushers" },
    { value: "Cable Overhead Extension", label: "Cable Overhead Extension" },
    { value: "One Arm Cable Pushdown", label: "One Arm Cable Pushdown" },
    { value: "Kickbacks", label: "Kickbacks" },
    { value: "Bench Dips", label: "Bench Dips" },
    { value: "Machine Tricep Extension", label: "Machine Tricep Extension" },
  ],

  Legs: [
    { value: "Barbell Back Squat", label: "Barbell Back Squat" },
    { value: "Leg Press", label: "Leg Press" },
    { value: "Walking Lunges", label: "Walking Lunges" },
    { value: "Romanian Deadlift", label: "Romanian Deadlift" },
    { value: "Hack Squat", label: "Hack Squat" },
    { value: "Leg Extension", label: "Leg Extension" },
    { value: "Lying Leg Curl", label: "Lying Leg Curl" },
    { value: "Bulgarian Split Squat", label: "Bulgarian Split Squat" },
    { value: "Front Squat", label: "Front Squat" },
    { value: "Step Ups", label: "Step Ups" },
  ],

  Abs: [
    { value: "Hanging Leg Raise", label: "Hanging Leg Raise" },
    { value: "Cable Crunch", label: "Cable Crunch" },
    { value: "Weighted Sit-Up", label: "Weighted Sit-Up" },
    { value: "Plank", label: "Plank" },
    { value: "Russian Twist", label: "Russian Twist" },
    { value: "Ab Wheel Rollout", label: "Ab Wheel Rollout" },
    { value: "Mountain Climbers", label: "Mountain Climbers" },
    { value: "V-Ups", label: "V-Ups" },
    { value: "Side Plank", label: "Side Plank" },
    { value: "Toe Touches", label: "Toe Touches" },
  ],
};
