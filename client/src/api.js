import axios from "axios";

// Use environment variable in production, fallback to localhost for dev
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:3002";

const WORKOUT_URL = `${API_BASE}/api/workouts`;
const AUTH_URL = `${API_BASE}/api/auth`;
const AI_URL = `${API_BASE}/api/ai`;
const DAY_STATUS_URL =
  `${API_BASE}/api/day-status`;

// Add JWT token to every request
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ==================================================
// AUTH ROUTES
// ==================================================

export const getMe = () => axios.get(`${AUTH_URL}/me`);

export const registerUser = (data) => axios.post(`${AUTH_URL}/register`, data);

export const loginUser = (data) => axios.post(`${AUTH_URL}/login`, data);

// ==================================================
// WORKOUT ROUTES
// ==================================================

export const getWorkouts = () => axios.get(WORKOUT_URL);

export const addWorkout = (data) => axios.post(WORKOUT_URL, data);

export const deleteWorkout = (id) => axios.delete(`${WORKOUT_URL}/${id}`);

export const getWorkoutById = (id) => axios.get(`${WORKOUT_URL}/${id}`);

export const updateWorkout = (id, updatedWorkout) =>
  axios.put(`${WORKOUT_URL}/${id}`, updatedWorkout);

// ==================================================
// AI ROUTES
// ==================================================

export const getAIInsights = () => axios.get(`${AI_URL}/insights`);

//Day staus 

export const getDayStatuses = () =>
  axios.get(DAY_STATUS_URL);

export const markRestDay = (date) =>
  axios.put(`${DAY_STATUS_URL}/${date}`);

export const removeRestDay = (date) =>
  axios.delete(`${DAY_STATUS_URL}/${date}`);



export const verifyOTP = (data) =>
  axios.post(`${AUTH_URL}/verify-otp`, data);

export const resendOTP = (data) =>
  axios.post(`${AUTH_URL}/resend-otp`, data);
