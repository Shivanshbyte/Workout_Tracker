import { useState, useEffect } from "react";
import { loginUser } from "../api";
import { useNavigate, Link } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");

  // ✅ Redirect to workout list if already logged in
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/");
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await loginUser(form);
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      navigate("/"); // ✅ Redirect to Workout List page
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-slate-900 text-white">
      <div className="bg-slate-800 p-6 rounded-2xl w-[90%] max-w-sm border border-slate-700 shadow-md">
        <h1 className="text-2xl font-semibold mb-4 text-center">Login</h1>
        {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
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
            Login
          </button>
        </form>
        <p className="text-slate-400 text-sm text-center mt-3">
          Don’t have an account?{" "}
          <Link to="/register" className="text-sky-400">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
