import React, { useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";

const Homepage = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log({ name, email, password });
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />

      {/* Main content below navbar, full height minus navbar */}
      <div className="flex-grow mt-16">
        <div className="md:flex h-[calc(100vh-64px)]">
          {/* LEFT PANEL */}
          <div className="relative md:w-1/2 flex items-center justify-center p-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 animate-gradient-xy"></div>
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
            <div className="relative z-10 text-center md:text-left max-w-lg">
              <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-md leading-tight">
                Conduct Exams <br /> Seamlessly & Securely
              </h1>
              <p className="mt-4 text-white/90 text-sm md:text-base leading-relaxed">
                Join thousands of educators using <strong>Qhashai Exams</strong>
                . Manage, monitor, and host online exams with ease. Access your
                dashboard anywhere, anytime, on any device.
              </p>
            </div>
          </div>

          {/* RIGHT PANEL */}
          <div className="relative md:w-1/2 flex items-center justify-center overflow-hidden ">
            {/* Gradient background for right side */}
            <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-white to-indigo-400"></div>
            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>

            {/* Glassmorphism login card */}
            <div className="relative z-10 w-full max-w-md rounded-2xl bg-white/80 backdrop-blur-xl shadow-2xl p-8 transition-all hover:shadow-[0_0_30px_rgba(99,102,241,0.4)]">
              <h2 className="text-3xl font-bold text-center text-gray-800">
                Login
              </h2>
              <p className="text-center text-sm text-gray-500 mt-2 mb-8">
                Access your exam dashboard
              </p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
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
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    required
                  />
                </div>

              <Link 
  to="/instructions"  
  className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-transform transform hover:scale-[1.02] duration-300 shadow-md text-center"
>
  Login
</Link>

              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Gradient animation keyframes */}
      <style>{`
        @keyframes gradient-xy {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-xy {
          background-size: 200% 200%;
          animation: gradient-xy 6s ease infinite;
        }
      `}</style>
    </div>
  );
};

export default Homepage;
