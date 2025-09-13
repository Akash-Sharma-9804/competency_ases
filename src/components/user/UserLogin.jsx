import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Navbar from "../user/Navbar";
import { authAPI } from "../../utils/api";
import PasswordInput from "../common/PasswordInput";
import toast from "react-hot-toast";

const UserLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const credentials = { email, password };
      const data = await authAPI.userLogin(credentials);

      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("role", "user");
        navigate("/user-dashboard/");
      }
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");
    if (token && role === "user") {
      navigate("/user-dashboard/");
    }
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      <div className="flex-grow mt-16">
        <div className="md:flex h-[calc(100vh-64px)]">
          {/* LEFT PANEL */}
          <div className="relative md:w-1/2 flex items-center justify-center p-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 animate-gradient-xy"></div>
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
            <div className="relative z-10 text-center md:text-left max-w-lg transition-all duration-500">
              <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-md leading-tight">
                Welcome Back, Candidate!
              </h1>
              <p className="mt-4 text-white/90 text-sm md:text-base leading-relaxed">
                Sign in to take your scheduled exams, check results, and
                access your dashboard.
              </p>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="relative md:w-1/2 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-white to-indigo-400"></div>
            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>

            <div className="relative z-10 w-full max-w-md rounded-2xl bg-white/80 backdrop-blur-xl shadow-2xl p-8">
              <h2 className="text-3xl font-bold text-center text-gray-800">
                User Login
              </h2>
              <p className="text-center text-sm text-gray-500 mt-2 mb-8">
                Access your user dashboard
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <PasswordInput
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="border-gray-300 text-sm"
                    inputProps={{ required: true }}
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="block w-full cursor-pointer bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-transform transform hover:scale-[1.02] duration-300 shadow-md text-center flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </button>
              </form>
{/*               
              <p className="text-center text-sm text-gray-600 mt-4">
                Don't have an account?{" "}
                <button
                  onClick={() => navigate("/user-signup")}
                  className="text-indigo-600 cursor-pointer font-semibold hover:underline"
                  type="button"
                >
                  Sign up here
                </button>
              </p> */}
            </div>
          </div>
        </div>
      </div>

      {/* Gradient animation */}
      <style>{`
        @keyframes gradient-xy {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient-xy {
          background-size: 400% 400%;
          animation: gradient-xy 6s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default UserLogin;