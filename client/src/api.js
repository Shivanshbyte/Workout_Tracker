import axios from "axios";

// Use environment variable in production, fallback to localhost for dev
const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3002";
const WORKOUT_URL = `${API_BASE}/api/workouts`;
const AUTH_URL = `${API_BASE}/api/auth`;

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ AUTH ROUTES
// console.log(API_BASE);
export const registerUser = (data) => axios.post(`${AUTH_URL}/register`, data);
export const loginUser = (data) => axios.post(`${AUTH_URL}/login`, data);

// ✅ WORKOUT ROUTES
export const getWorkouts = () => axios.get(WORKOUT_URL);
export const addWorkout = (data) => axios.post(WORKOUT_URL, data);
export const deleteWorkout = (id) => axios.delete(`${WORKOUT_URL}/${id}`);
export const getWorkoutById = (id) => axios.get(`${WORKOUT_URL}/${id}`);
export const updateWorkout = (id, updatedWorkout) =>
  axios.put(`${WORKOUT_URL}/${id}`, updatedWorkout);
