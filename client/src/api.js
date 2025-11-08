import axios from "axios";

const API_BASE = "http://localhost:3002/api";
const WORKOUT_URL = `${API_BASE}/workouts`;
const AUTH_URL = `${API_BASE}/auth`;

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ✅ AUTH ROUTES
export const registerUser = (data) => axios.post(`${AUTH_URL}/register`, data);
export const loginUser = (data) => axios.post(`${AUTH_URL}/login`, data);

// ✅ WORKOUT ROUTES
export const getWorkouts = () => axios.get(WORKOUT_URL);
export const addWorkout = (data) => axios.post(WORKOUT_URL, data);
export const deleteWorkout = (id) => axios.delete(`${WORKOUT_URL}/${id}`);
export const getWorkoutById = (id) => axios.get(`${WORKOUT_URL}/${id}`);
export const updateWorkout = (id, updatedWorkout) =>
  axios.put(`${WORKOUT_URL}/${id}`, updatedWorkout);
