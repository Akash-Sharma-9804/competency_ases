import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { authAPI } from "../../utils/api";

const UserSignup = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.userRegister(form);
      alert("✅ User registered successfully! Please login.");
      navigate("/"); // go back to login page
    } catch (err) {
      console.error(err);
      alert(err.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-grow mt-16">
        <div className="md:flex h-[calc(100vh-64px)]">
          {/* LEFT PANEL */}
          <div className="relative md:w-1/2 hidden md:flex items-center justify-center p-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 animate-gradient-xy"></div>
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
            <div className="relative z-10 text-center md:text-left max-w-lg">
              <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-md leading-tight">
                Create Your Account
              </h1>
              <p className="mt-4 text-white/90 text-sm md:text-base leading-relaxed">
                Sign up now and start your journey with <strong> Exams</strong>.
              </p>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="relative md:w-1/2 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-white to-indigo-400"></div>
            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>

            <div className="relative z-10 w-full max-w-md rounded-2xl bg-white/80 backdrop-blur-xl shadow-2xl p-8">
              <h2 className="text-3xl font-bold text-center text-gray-800">User Signup</h2>
              <p className="text-center text-sm text-gray-500 mt-2 mb-8">
                Create your account to access exams
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter your name"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter your email"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter a secure password"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-transform transform hover:scale-[1.02] duration-300 shadow-md text-center flex items-center justify-center"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing up...
                    </>
                  ) : (
                    "Sign Up"
                  )}
                </button>
              </form>

              <p className="text-center text-sm text-gray-600 mt-4">
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/")}
                  className="text-indigo-600 cursor-pointer font-semibold hover:underline"
                  type="button"
                >
                  Login here
                </button>
              </p>
            </div>
          </div>
        </div>
      </div>

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

export default UserSignup;
