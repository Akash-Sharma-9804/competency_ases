import React, { useState,useEffect } from "react";

// Dummy test data
const tests = [
  { id: 1, name: "Frontend Dev Test", role: "Frontend Developer", sector: "IT", status: "Active" },
  { id: 2, name: "Backend Dev Test", role: "Backend Developer", sector: "IT", status: "Closed" },
];

const sectors = ["IT", "Education", "Healthcare", "Finance", "Retail", "Manufacturing"];

const ManageTests = () => {
  const [showCreateTest, setShowCreateTest] = useState(false);
  const [form, setForm] = useState({
    name: "",
    role: "",
    sector: "",
    description: "",
    duration: 60,
  });
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
    const [tests, setTests] = useState([]);
  const [loadingTests, setLoadingTests] = useState(true);
  // const [showCreateTest, setShowCreateTest] = useState(false);

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/tests/generate-ai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        setQuestions(data.questions || []);
      } else {
        alert(data.message || "Failed to generate questions");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/tests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ ...form, questions }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("✅ Test created successfully!");
        setShowCreateTest(false);
      } else {
        alert(data.message || "Failed to save test");
      }
    } catch (err) {
      console.error(err);
    }
  };


  // fetch tests from backend
  useEffect(() => {
    const fetchTests = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/tests`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await res.json();
        if (res.ok) {
          setTests(data);
        } else {
          alert(data.message || "Failed to load tests");
        }
      } catch (err) {
        console.error(err);
        alert("Server error while fetching tests");
      } finally {
        setLoadingTests(false);
      }
    };
    fetchTests();
  }, []);



  // ------------------ MAIN RENDER -------------------
  if (showCreateTest) {
    return (
     <div className="space-y-6 animate-fade-in">
    {/* Header */}
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold text-indigo-700 flex items-center gap-2">
        ➕ Create New Test
      </h2>
      <button
        onClick={() => setShowCreateTest(false)}
        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
      >
        ← Back
      </button>
    </div>

    {/* Form */}
    <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
      <input
        name="name"
        value={form.name}
        onChange={handleFormChange}
        placeholder="Test Title"
        className="w-full border px-4 py-3 rounded-lg focus:ring focus:ring-indigo-200"
      />
      <input
        name="role"
        value={form.role}
        onChange={handleFormChange}
        placeholder="Job Role (required for AI)"
        className="w-full border px-4 py-3 rounded-lg focus:ring focus:ring-indigo-200"
      />
      <select
        name="sector"
        value={form.sector}
        onChange={handleFormChange}
        className="w-full border px-4 py-3 rounded-lg focus:ring focus:ring-indigo-200"
      >
        <option value="">Select Sector (required for AI)</option>
        {sectors.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>
      <textarea
        name="description"
        value={form.description}
        onChange={handleFormChange}
        placeholder="Job Description (required for AI)"
        rows={3}
        className="w-full border px-4 py-3 rounded-lg focus:ring focus:ring-indigo-200"
      />
      <input
        type="number"
        name="duration"
        value={form.duration}
        onChange={handleFormChange}
        placeholder="Duration (minutes)"
        className="w-full border px-4 py-3 rounded-lg focus:ring focus:ring-indigo-200"
      />

      {/* Action Buttons */}
      <div className="flex flex-col md:flex-row gap-3">
        <button
          onClick={handleGenerate}
          className="flex-1 px-4 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          {loading ? "⏳ Generating..." : "✨ Generate Questions with AI"}
        </button>
        <button
          onClick={() => setQuestions([...questions, ""])}
          className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          ➕ Add Question Manually
        </button>
      </div>
    </div>

    {/* Questions Section */}
    {questions.length > 0 && (
      <div className="bg-white p-6 rounded-xl shadow-lg space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold text-gray-800">📝 Questions</h3>
          <button
            onClick={() => setQuestions([...questions, ""])}
            className="px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
          >
            ➕ Add Question
          </button>
        </div>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {questions.map((q, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="text-gray-500 mt-2">{i + 1}.</span>
              <textarea
                value={q}
                onChange={(e) => {
                  const newQs = [...questions];
                  newQs[i] = e.target.value;
                  setQuestions(newQs);
                }}
                rows={2}
                className="flex-1 border px-3 py-2 rounded-lg focus:ring focus:ring-indigo-200"
              />
            </div>
          ))}
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            ✅ Save Test
          </button>
          <button
            onClick={() => setShowCreateTest(false)}
            className="px-4 py-2 bg-gray-400 text-white rounded-lg hover:bg-gray-500"
          >
            ❌ Cancel
          </button>
        </div>
      </div>
    )}
  </div>
    );
  }

  // ------------------ DEFAULT TABLE VIEW -------------------
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">🧪 Manage Tests</h2>
        <button
          onClick={() => setShowCreateTest(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
        >
          ➕ Create Test
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full text-left text-gray-700 hidden md:table">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="py-2 px-4">Name</th>
              <th className="py-2 px-4">Role</th>
              <th className="py-2 px-4">Sector</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
  {loadingTests ? (
    <tr>
      <td colSpan={5} className="py-4 text-center text-gray-500">
        Loading...
      </td>
    </tr>
  ) : tests.length === 0 ? (
    <tr>
      <td colSpan={5} className="py-4 text-center text-gray-500">
        No tests found.
      </td>
    </tr>
  ) : (
    tests.map((t) => (
      <tr key={t.test_id} className="border-b hover:bg-gray-50">
        <td className="py-2 px-4">{t.title}</td>
        <td className="py-2 px-4">{t.job_role}</td>
        <td className="py-2 px-4">{t.job_sector}</td>
        <td className="py-2 px-4 capitalize">{t.status}</td>
        <td className="py-2 px-4 space-x-2">
          <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">Edit</button>
          <button className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
          <button className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600">Assign</button>
        </td>
      </tr>
    ))
  )}
</tbody>
        </table>

        {/* Mobile cards */}
        <div className="md:hidden divide-y">
          {tests.map((t) => (
            <div key={t.id} className="p-4">
              <h3 className="text-lg font-semibold">{t.title}</h3>
              <p className="text-sm text-gray-500">Role: {t.job_role}</p>
              <p className="text-sm text-gray-500">Sector: {t.job_sector}</p>
              <p className="text-sm text-gray-500">Status: {t.status}</p>
              <div className="mt-2 flex space-x-2">
                <button className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600">Edit</button>
                <button className="px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600">Delete</button>
                <button className="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600">Assign</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ManageTests;
