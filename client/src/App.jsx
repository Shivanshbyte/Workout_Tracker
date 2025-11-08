import { Routes, Route } from "react-router-dom";
import WorkoutList from "./components/WorkoutList";
import WorkoutForm from "./components/WorkoutForm";

function App() {
  return (
    <Routes>
      <Route path="/" element={<WorkoutList />} />
      <Route path="/:id" element={<WorkoutForm />} />
      <Route path="/edit/:id" element={<WorkoutForm />} />
    </Routes>
  );
}

export default App;
