import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../user/Navbar";

const CompanyRegister = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    contact_email: "",
    password: "",
    sector_id: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/companies/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
  // backend should return a token (update backend registerCompany to also generate token like login)
  if (data.token) {
    localStorage.setItem("token", data.token);
  }
  alert("✅ Company registered successfully!");
  navigate("/company-dashboard");
}
 else {
        alert(data.message || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      <div className="flex-grow mt-16">
        <div className="md:flex h-[calc(100vh-64px)]">
          {/* LEFT PANEL (gradient) */}
          <div className="relative md:w-1/2 hidden md:flex items-center justify-center p-8 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 animate-gradient-xy"></div>
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
            <div className="relative z-10 text-center md:text-left max-w-lg">
              <h1 className="text-4xl md:text-5xl font-extrabold text-white drop-shadow-md leading-tight">
                Register Your <br /> Company Account
              </h1>
              <p className="mt-4 text-white/90 text-sm md:text-base leading-relaxed">
                Create your company profile and start managing users and exams today.
              </p>
            </div>
          </div>

          {/* RIGHT PANEL (form) */}
          <div className="relative md:w-1/2 flex items-center justify-center overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-pink-400 via-white to-indigo-400"></div>
            <div className="absolute inset-0 bg-white/40 backdrop-blur-sm"></div>

            <div className="relative z-10 w-full max-w-md rounded-2xl bg-white/90 backdrop-blur-xl shadow-2xl p-8">
              <h2 className="text-3xl font-bold text-center text-gray-800 mb-6">
                Company Registration
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Company Name
                  </label>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Enter company name"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Contact Email
                  </label>
                  <input
                    name="contact_email"
                    type="email"
                    value={form.contact_email}
                    onChange={handleChange}
                    placeholder="Enter contact email"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    required
                  />
                </div>

                <div>
                  <label className="block mb-1 text-sm font-medium text-gray-700">
                    Password
                  </label>
                  <input
                    name="password"
                    type="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
                    required
                  />
                </div>

                <div>
  <label className="block mb-1 text-sm font-medium text-gray-700">
    Sector
  </label>
  <select
    name="sector_id"
    value={form.sector_id}
    onChange={handleChange}
    className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
    required
  >
    <option value="">Select a sector</option>
    <option value="1">Information Technology</option>
    <option value="2">Education</option>
    <option value="3">Healthcare</option>
    <option value="4">Finance</option>
    <option value="5">Retail</option>
    <option value="6">Manufacturing</option>
  </select>
</div>


               {/* Address (optional) */}
  <div>
    <label className="block mb-1 text-sm font-medium text-gray-700">
      Address (optional)
    </label>
    <input
      name="address"
      value={form.address}
      onChange={handleChange}
      placeholder="Enter company address"
      className="w-full px-4 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
    />
  </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-lg transition-transform transform hover:scale-[1.02] duration-300 shadow-md text-center"
                >
                  {loading ? "Registering..." : "Register Company"}
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

export default CompanyRegister;
