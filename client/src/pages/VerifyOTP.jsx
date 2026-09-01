import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { verifyOTP, resendOTP } from "../api.js";

const VerifyOTP = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!email) return;

    const sendNewOTP = async () => {
      try {
        await resendOTP({ email });
        setMessage("A new verification code has been sent to your email.");
      } catch (err) {
        setError(
          err.response?.data?.error || "Unable to send verification code",
        );
      }
    };

    sendNewOTP();
  }, [email]);

  const handleVerify = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP");
      return;
    }

    try {
      setLoading(true);

      const response = await verifyOTP({
        email,
        otp,
      });

      const { token, user } = response.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setMessage("Email verified successfully!");

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      setError(err.response?.data?.error || "Invalid or expired OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError("");
    setMessage("");

    try {
      setResending(true);

      const response = await resendOTP({
        email,
      });

      setMessage(
        response.data.message || "A new OTP has been sent to your email",
      );
    } catch (err) {
      setError(err.response?.data?.error || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950 px-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <h1 className="text-2xl! font-bold text-center text-sky-400 mb-2">
          Verify Your Email
        </h1>

        <p className="text-slate-400 text-sm text-center mb-6">
          We've sent a 6-digit verification code to
        </p>

        <p className="text-white text-center font-medium mb-6 break-all">
          {email}
        </p>

        <form onSubmit={handleVerify}>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
            placeholder="Enter 6-digit OTP"
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white text-center text-xl tracking-[0.5em] outline-none focus:border-sky-400"
          />

          {error && (
            <p className="text-red-400 text-sm text-center mt-3">{error}</p>
          )}

          {message && (
            <p className="text-emerald-400 text-sm text-center mt-3">
              {message}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="w-full mt-5 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 font-semibold py-3 rounded-xl transition"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </button>
        </form>

        <button
          onClick={handleResend}
          disabled={resending}
          className="w-full mt-4 text-sky-400 hover:text-sky-300 text-sm"
        >
          {resending ? "Sending..." : "Didn't receive the code? Resend OTP"}
        </button>

        <button
          onClick={() => navigate("/login")}
          className="w-full mt-3 text-slate-500 hover:text-slate-300 text-sm"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

export default VerifyOTP;
