
import React, { useEffect, useState } from "react";

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
      else alert(data.message || "Failed to load candidates");
    } catch (err) {
      console.error(err);
      alert("Server error");
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
        alert("✅ Candidate registered!");
        setShowModal(false);
        setForm({ name: "", email: "", password: "" });
        fetchCandidates();
      } else {
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
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">👥 Candidates</h2>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-indigo-600 cursor-pointer text-white rounded-lg hover:bg-indigo-700"
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
        <div className="fixed inset-0  bg-opacity-50 flex items-center justify-center">
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
                  className="px-4 py-2 bg-gray-200 rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
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
