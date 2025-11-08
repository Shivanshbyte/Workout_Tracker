import axios from "axios";

const API_URL = "http://localhost:3002/api/workouts";

export const getWorkouts = () => axios.get(API_URL);
export const addWorkout = (data) => axios.post(API_URL, data);
export const deleteWorkout = (id) => axios.delete(`${API_URL}/${id}`);
export const getWorkoutById = (id) =>
  axios.get(`${API_URL}/${id}`);
export const updateWorkout = (id, updatedWorkout) =>
  axios.put(`${API_URL}/${id}`, updatedWorkout);
