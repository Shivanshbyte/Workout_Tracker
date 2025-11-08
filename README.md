# 🏋️‍♂️ Workout Tracker App

A modern, responsive **Workout Tracking Web App** built with **React + Node.js + SQLite**, where users can **log, edit, and track their workouts** by muscle groups and exercises , all in a clean, minimal UI.

---

## 🚀 Features

✅ **User Authentication (Login / Logout)**  
✅ **Personalized Greeting** – “Hi Shivansh 👋 Your Workouts”  
✅ **Add, Edit & Delete Workouts**  
✅ **Track Muscle Groups & Exercises**  
✅ **Responsive UI** (mobile-friendly layout)  
✅ **Workout History Sorted by Date**  
✅ **SQLite Database for local persistence**  
✅ **Lucide Icons + Tailwind Styling**

---

## 🛠️ Tech Stack

| Layer | Technology |
|--------|-------------|
| **Frontend** | React, Tailwind CSS, Lucide React Icons |
| **Backend** | Node.js, Express.js |
| **Database** | SQLite (via `sqlite3` or Sequelize ORM) |
| **API Handling** | Axios |
| **Routing** | React Router DOM |

---

## 📂 Project Structure

```text
workout-tracker/
│
├── client/                  # React Frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── WorkoutList.jsx
│   │   │   ├── WorkoutForm.jsx
│   │   │   └── EditWorkout.jsx
│   │   ├── api.js
│   │   ├── App.jsx
│   │   ├── index.js
│   │   └── styles.css
│   └── package.json
│
├── server/                  # Node.js + Express Backend
│   ├── index.js
│   ├── db.js
│   ├── workouts.db
│   ├── routes/
│   │   └── workoutRoutes.js
│   └── package.json
│
└── README.md



--- ## ⚙️ Installation & Setup ### 

1️⃣ Clone the repository
bash
git clone https://github.com/yourusername/workout-tracker.git
cd workout-tracker

2️⃣ Install dependencies

Frontend

cd client
npm install

Backend

cd ../server
npm install

3️⃣ Run the app locally

Start the backend server:

npm start
(Default port: 3002)

Then start the frontend:

cd ../client
npm run dev
(Default port: 5173 or whichever Vite chooses)
