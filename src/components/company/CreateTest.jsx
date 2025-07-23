import React, { useState } from "react";

const sectors = ["IT", "Education", "Healthcare", "Finance", "Retail", "Manufacturing"];

const CreateTest = () => {
  const [form, setForm] = useState({
    name: "",
    role: "",
    sector: "",
    description: "",
    duration: 60, // default minutes
  });
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      // Call your backend AI endpoint
      const res = await fetch("http://localhost:5000/api/tests/generate-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
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
      const res = await fetch("http://localhost:5000/api/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: JSON.stringify({ ...form, questions }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("✅ Test created successfully!");
      } else {
        alert(data.message || "Failed to save test");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">➕ Create New Test</h2>
      <div className="bg-white p-6 rounded-lg shadow space-y-4">
        <input
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Test Name"
          className="w-full border px-3 py-2 rounded"
        />
        <input
          name="role"
          value={form.role}
          onChange={handleChange}
          placeholder="Job Role"
          className="w-full border px-3 py-2 rounded"
        />
        <select
          name="sector"
          value={form.sector}
          onChange={handleChange}
          className="w-full border px-3 py-2 rounded"
        >
          <option value="">Select Sector</option>
          {sectors.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Job Description (optional)"
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="number"
          name="duration"
          value={form.duration}
          onChange={handleChange}
          placeholder="Duration (minutes)"
          className="w-full border px-3 py-2 rounded"
        />
        <button
          onClick={handleGenerate}
          className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
        >
          {loading ? "Generating..." : "✨ Generate Questions with AI"}
        </button>
      </div>

      {questions.length > 0 && (
        <div className="bg-white p-6 rounded-lg shadow space-y-4">
          <h3 className="text-lg font-semibold">AI Generated Questions</h3>
          {questions.map((q, i) => (
            <div key={i} className="flex space-x-2">
              <input
                value={q}
                onChange={(e) => {
                  const newQuestions = [...questions];
                  newQuestions[i] = e.target.value;
                  setQuestions(newQuestions);
                }}
                className="flex-1 border px-3 py-2 rounded"
              />
            </div>
          ))}
          <button
            onClick={() => setQuestions([...questions, ""])}
            className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
          >
            ➕ Add Question
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 mt-4"
          >
            ✅ Save Test
          </button>
        </div>
      )}
    </div>
  );
};

export default CreateTest;
