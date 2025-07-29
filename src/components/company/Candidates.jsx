
import React, { useEffect, useState } from "react";
import toast from 'react-hot-toast'
const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  // Fetch candidates
  const fetchCandidates = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/company-candidates`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setCandidates(data);
      else toast.error(data.message || "Failed to load candidates");
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  // Handle input changes
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Register candidate
  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/users/register-by-company`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        toast.success("✅ Candidate registered!");
        setShowModal(false);
        setForm({ name: "", email: "", password: "" });
        fetchCandidates();
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">👥 Candidates</h2>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white cursor-pointer  rounded-lg hover:bg-gradient-to-r hover:from-purple-600 hover:to-indigo-600  hover:shadow-lg hover:scale-[1.02] transition-all duration-200 "
        >
          ➕ Register Candidate
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full text-left text-gray-700">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-4">Name</th>
              <th className="py-2 px-4">Email</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((c) => (
              <tr key={c.user_id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4">{c.name}</td>
                <td className="py-2 px-4">{c.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal for registering candidate */}
      {showModal && (
        <div className="fixed inset-0  bg-black/10 backdrop-blur-sm  flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Register Candidate</h2>
            <form onSubmit={handleRegister} className="space-y-4">
              <input
                name="name"
                placeholder="Name"
                value={form.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
              <input
                name="password"
                type="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded"
                required
              />
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 cursor-pointer bg-gray-200 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 cursor-pointer bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  {loading ? "Saving..." : "Register"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Candidates;
