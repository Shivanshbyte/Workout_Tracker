import { Routes, Route } from "react-router-dom";
import WorkoutList from "./pages/WorkoutList";
import AddWorkout from "./pages/WorkoutForm";
import Login from "./pages/login";
import Register from "./pages/register";
import PrivateRoute from "./components/privateRoutes";

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Private Routes */}
      <Route
        path="/"
        element={
          <PrivateRoute>
            <WorkoutList />
          </PrivateRoute>
        }
      />
      <Route
        path="/add"
        element={
          <PrivateRoute>
            <AddWorkout />
          </PrivateRoute>
        }
      />
      <Route
        path="/edit/:id"
        element={
          <PrivateRoute>
            <AddWorkout />
          </PrivateRoute>
        }
      />
    </Routes>
  );
}

export default App;
