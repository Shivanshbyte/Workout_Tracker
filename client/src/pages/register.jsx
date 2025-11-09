import { useState, useEffect } from "react";
import { registerUser } from "../api";
import { useNavigate, Link } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");

  // ✅ Redirect logged-in users to workout list
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/");
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (!emailRegex.test(form.email)) {
        alert("Please enter a valid email address");
        return;
      }
      await registerUser(form);
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    }
  };

  return (
    <div className="w-screen min-h-screen flex flex-col justify-center items-center bg-slate-900 text-white">
      <div className="bg-slate-800 p-6 rounded-2xl w-[90%] max-w-sm border border-slate-700 shadow-md">
        <h1 className="text-2xl font-semibold mb-4 text-center">Register</h1>
        {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="text"
            placeholder="name"
            className="p-2 rounded bg-slate-700 border border-slate-600"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            className="p-2 rounded bg-slate-700 border border-slate-600"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            className="p-2 rounded bg-slate-700 border border-slate-600"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <button
            type="submit"
            className="bg-sky-600 hover:bg-sky-500 p-2 rounded font-semibold"
          >
            Register
          </button>
        </form>
        <p className="text-slate-400 text-sm text-center mt-3">
          Already have an account?{" "}
          <Link to="/login" className="text-sky-400">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
