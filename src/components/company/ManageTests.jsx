import React, { useState, useEffect } from "react";
import toast from 'react-hot-toast'
const sectors = [
  "IT",
  "Education",
  "Healthcare",
  "Finance",
  "Retail",
  "Manufacturing",
];

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
const [difficulty, setDifficulty] = useState("medium"); // default medium

  // Edit test
  const [showEditTest, setShowEditTest] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editQuestions, setEditQuestions] = useState([]);

  // View test
  const [showViewTest, setShowViewTest] = useState(false);
  const [viewQuestions, setViewQuestions] = useState([]);

  // Assign test
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [candidates, setCandidates] = useState([]);

  const [selectedCandidateIds, setSelectedCandidateIds] = useState([]);

  const toggleCandidate = (id) => {
    setSelectedCandidateIds((prev) =>
      prev.includes(id) ? prev.filter((cid) => cid !== id) : [...prev, id]
    );
  };

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

 const handleGenerate = async () => {
  setLoading(true);
  try {
    const res = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/tests/generate-ai`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          ...form,
          difficulty, // 👈 send selected difficulty
        }),
      }
    );
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
        toast.success('Test created successfully!')
        setShowCreateTest(false);
      } else {
        alert(data.message || "Failed to save test");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // fetch tests from backend
  const fetchTests = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/tests`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const data = await res.json();
      console.log("Fetched tests:", data); // 👈 ADD THIS
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

  useEffect(() => {
    fetchTests();
  }, [showCreateTest, showEditTest, showAssignModal]);

  // -------- EDIT TEST FUNCTIONS --------
  const openEditTest = async (testId) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/tests/${testId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setEditForm({
          id: data.test_id,
          name: data.title,
          role: data.job_role,
          sector: data.job_sector,
          description: data.description,
          duration: data.duration,
        });
        setEditQuestions(data.questions || []);
        setShowEditTest(true);
      } else alert(data.message || "Failed to load test");
    } catch (err) {
      console.error(err);
    }
  };
  const handleEditChange = (e) =>
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  const handleUpdate = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/tests/${editForm.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ ...editForm, questions: editQuestions }),
        }
      );
      const data = await res.json();
      if (res.ok) {
         toast.success("✅ Test updated!");
        setShowEditTest(false);
        fetchTests();
      } else alert(data.message || "Failed to update");
    } catch (err) {
      console.error(err);
    }
  };

  // -------- VIEW TEST FUNCTIONS --------
  const openViewTest = async (testId) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/tests/${testId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const data = await res.json();
      if (res.ok) {
        setViewQuestions(data.questions || []);
        setShowViewTest(true);
      } else alert(data.message || "Failed to view");
    } catch (err) {
      console.error(err);
    }
  };

  // -------- ASSIGN TEST FUNCTIONS --------
  const openAssign = async (testId) => {
    setSelectedTestId(testId);
    setShowAssignModal(true);
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/users/company-candidates`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const data = await res.json();
      if (res.ok) setCandidates(data);
      else alert(data.message || "Failed to load candidates");
    } catch (err) {
      console.error(err);
    }
  };
  const handleAssign = async () => {
    if (selectedCandidateIds.length === 0)
      return alert("Select at least one candidate");

    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/tests/${selectedTestId}/assign`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ candidateIds: selectedCandidateIds }), // ✅ send array
        }
      );
      const data = await res.json();
      if (res.ok) {
        toast.success("✅ Test assigned!");
        setShowAssignModal(false);
      } else alert(data.message || "Failed to assign");
    } catch (err) {
      console.error(err);
    }
  };

  // -------- DELETE TEST --------
  const handleDelete = async (testId) => {
    if (!window.confirm("Are you sure you want to delete this test?")) return;
    try {
      const res = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/tests/${testId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      const data = await res.json();
      if (res.ok) {
         toast.success("🗑️ Test deleted");
        fetchTests();
      } else alert(data.message || "Failed to delete");
    } catch (err) {
      console.error(err);
    }
  };

  // ------------------ MAIN RENDER -------------------
  if (showCreateTest) {
    return (
      <div className="  h-screen font-poppins  md:h-[90vh] bg-gray-50 p-4 md:p-1 flex flex-col">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-4 shrink-0">
          <h2 className="text-lg md:text-xl font-semibold text-gray-800">
            Create New Test
          </h2>
          <button
            onClick={() => setShowCreateTest(false)}
            className="text-sm px-3 py-1.5 rounded-md border border-gray-300 cursor-pointer text-gray-600 hover:bg-gray-100">
            Back
          </button>
        </div>

        {/* Main content */}
        <div className="flex-1 grid grid-cols-1 md:grid-cols-5 gap-4 min-h-0">
          {/* Form (40%) */}
          <div
            className="
            bg-white border border-gray-200 rounded-lg shadow-sm p-4 space-y-3
            md:col-span-2
            md:overflow-y-auto
          ">
            <h3 className="text-md font-medium text-gray-700 mb-2">
              Test Details
            </h3>

            {/* Test Title */}
            <label className="text-sm font-medium text-gray-600">
              Test Title
            </label>
            <input
              name="name"
              value={form.name}
              onChange={handleFormChange}
              placeholder="Enter test title"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />

            {/* Job Role */}
            <label className="text-sm font-medium text-gray-600">
              Job Role
            </label>
            <input
              name="role"
              value={form.role}
              onChange={handleFormChange}
              placeholder="Enter job role"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />

            {/* Sector */}
            <label className="text-sm font-medium text-gray-600">Sector</label>
            <select
              name="sector"
              value={form.sector}
              onChange={handleFormChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none">
              <option value="">Select Sector</option>
              {sectors.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {/* Job Description */}
            <label className="text-sm font-medium text-gray-600">
              Job Description
            </label>
            <textarea
              name="description"
              value={form.description}
              onChange={handleFormChange}
              placeholder="Enter job description"
              rows={3}
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />

            {/* Duration */}
            <label className="text-sm font-medium text-gray-600">
              Duration (minutes)
            </label>
            <input
              type="number"
              name="duration"
              value={form.duration}
              onChange={handleFormChange}
              placeholder="Enter duration in minutes"
              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
            />
<div className="flex gap-2 pt-2">
  <button
    onClick={() => setDifficulty("easy")}
    className={`flex-1 px-3 py-2 rounded-md text-sm cursor-pointer border ${
      difficulty === "easy"
        ? "bg-green-600 text-white"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }`}
  >
    Easy
  </button>
  <button
    onClick={() => setDifficulty("medium")}
    className={`flex-1 px-3 py-2 rounded-md text-sm cursor-pointer border ${
      difficulty === "medium"
        ? "bg-blue-600 text-white"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }`}
  >
    Medium
  </button>
  <button
    onClick={() => setDifficulty("hard")}
    className={`flex-1 px-3 py-2 rounded-md text-sm cursor-pointer border ${
      difficulty === "hard"
        ? "bg-red-600 text-white"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }`}
  >
    Hard
  </button>
</div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleGenerate}
                className="flex-1 px-4 py-2 cursor-pointer bg-indigo-600 text-white md:text-[10px] lg:text-sm rounded-md hover:bg-indigo-700 transition-colors">
                {loading ? "Generating..." : "Generate AI Questions"}
              </button>
              <button
                onClick={() => setQuestions([...questions, ""])}
                className="flex-1 px-4 py-2 cursor-pointer bg-gray-100 text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors">
                Add Question
              </button>
            </div>
          </div>

          {/* Questions (60%) */}
          <div
            className="
            bg-white border border-gray-200 rounded-lg shadow-sm p-4 flex flex-col overflow-hidden
            md:col-span-3
            mt-4 md:mt-0
            min-h-[60vh]
          ">
            <div className="flex items-center justify-between mb-3 shrink-0">
              <h3 className="text-md font-medium text-gray-700">Questions</h3>
              <button
                onClick={() => setQuestions([...questions, ""])}
                className="text-sm px-3 py-1 cursor-pointer rounded-md border border-gray-300 text-gray-600 hover:bg-gray-100">
                + Add
              </button>
            </div>

            {/* Scrollable Questions area */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
              {questions.length === 0 && (
                <p className="text-sm text-gray-400 italic">
                  No questions yet.
                </p>
              )}
              {questions.map((q, i) => (
                <div
                  key={i}
                  className="p-1 md:p-3 border border-gray-200 rounded-md hover:shadow-sm transition-shadow bg-gray-50">
                  <label className="block text-xs text-gray-500 mb-1">
                    Question {i + 1}
                  </label>
                  <textarea
                    value={q}
                    onChange={(e) => {
                      const updated = [...questions];
                      updated[i] = e.target.value;
                      setQuestions(updated);
                    }}
                    rows={2}
                    className="w-full border border-gray-300 rounded-md px-3 py-2 text-[10px] md:text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none"
                  />
                </div>
              ))}
            </div>

            {questions.length > 0 && (
              <div className="flex gap-2 pt-4 shrink-0">
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-green-600  cursor-pointer text-white text-sm rounded-md hover:bg-green-700 transition-colors">
                  Save Test
                </button>
                <button
                  onClick={() => setShowCreateTest(false)}
                  className="flex-1 px-4 py-2 bg-gray-100 cursor-pointer text-gray-700 text-sm rounded-md hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>

        {/* scrollbar style */}
        <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
      `}</style>
      </div>
    );
  }

  if (showEditTest) {
    return (
      <div className="p-4  ">
        <h2 className="text-xl font-semibold mb-4">✏️ Edit Test</h2>
        <h3>Test Title</h3>
        <input
          name="name"
          value={editForm.name}
          onChange={handleEditChange}
          className="border p-2 w-full mb-2"
          placeholder="Test Title"
        />
        {/* repeat for role, sector, description, duration */}
        <button
          onClick={() => setEditQuestions([...editQuestions, ""])}
          className="bg-gray-100 px-3 py-1 cursor-pointer rounded mb-2">
          + Add Question
        </button>
        <div className="space-y-2  h-[70vh] text-xs md:text-base   overflow-y-auto border p-2">
          {editQuestions.map((q, i) => (
            <textarea
              key={i}
              value={q}
              onChange={(e) => {
                const updated = [...editQuestions];
                updated[i] = e.target.value;
                setEditQuestions(updated);
              }}
              className="border p-2 w-full rounded"
            />
          ))}
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={handleUpdate}
            className="bg-green-600 text-white cursor-pointer px-4 py-2 rounded">
            Save
          </button>
          <button
            onClick={() => setShowEditTest(false)}
            className="bg-gray-300 cursor-pointer px-4 py-2 rounded">
            Cancel
          </button>
        </div>
      </div>
    );
  }

  if (showViewTest) {
    return (
      <div className="p-4">
        <h2 className="text-xl font-semibold mb-4">👀 View Questions</h2>
        <div className="space-y-2 max-h-[80vh] overflow-y-auto border p-2 rounded">
          {viewQuestions.map((q, i) => (
            <div key={i} className="p-3 border rounded bg-gray-50">
              Q{i + 1}: {q}
            </div>
          ))}
        </div>
        <button
          onClick={() => setShowViewTest(false)}
          className="mt-4 bg-gray-300 px-4 cursor-pointer py-2 rounded">
          Back
        </button>
      </div>
    );
  }

  // ------------------ DEFAULT TABLE VIEW -------------------
  return (
    <div className="p-4  md:p-8 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold font-poppins text-gray-800">🧪 Manage Tests</h1>
          <p className="text-gray-500 text-sm mt-1">
            Create and manage your tests with ease
          </p>
        </div>
        <button
          onClick={() => setShowCreateTest(true)}
          className="self-start md:self-auto cursor-pointer inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
          ➕ Create Test
        </button>
      </div>

      {/* TABLE / CARDS */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden ">
        {/* DESKTOP TABLE */}
        <table className="hidden md:table min-w-full">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                Name
              </th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                Role
              </th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                Sector
              </th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                Status
              </th>
              <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loadingTests ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : tests.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-6 text-center text-gray-500">
                  No tests found.
                </td>
              </tr>
            ) : (
              tests.map((t) => (
                <tr
                  key={t.test_id}
                  className="border-t hover:bg-gray-50  transition-colors">
                  <td className="py-4 px-6 font-poppins">{t.title}</td>
                  <td className="py-4 px-6 font-poppins">{t.job_role}</td>
                  <td className="py-4 px-6 font-poppins">{t.job_sector}</td>
                  <td className="py-4 px-6 font-poppins capitalize">{t.status}</td>
                  <td className="py-4 px-6 font-poppins flex flex-wrap gap-2">
                    <button
                      onClick={() => openEditTest(t.test_id)}
                      className="bg-blue-500 cursor-pointer text-white px-3 py-1 rounded">
                      Edit
                    </button>
                    <button
                      onClick={() => openViewTest(t.test_id)}
                      className="bg-yellow-500 cursor-pointer text-white px-3 py-1 rounded">
                      View
                    </button>
                    <button
                      onClick={() => openAssign(t.test_id)}
                      className="bg-green-500 cursor-pointer text-white px-3 py-1 rounded">
                      Assign
                    </button>
                    <button
                      onClick={() => handleDelete(t.test_id)}
                      className="bg-red-500 cursor-pointer text-white px-3 py-1 rounded">
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* MOBILE / TABLET CARDS */}
        <div className="md:hidden divide-y">
          {loadingTests ? (
            <div className="p-6 text-center text-gray-500">Loading...</div>
          ) : tests.length === 0 ? (
            <div className="p-6 text-center text-gray-500">No tests found.</div>
          ) : (
            tests.map((t) => (
              <div key={t.test_id} className="p-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  {t.title}
                </h3>
                <p className="text-sm text-gray-500 mt-1">
                  <span className="font-medium text-gray-700">Role:</span>{" "}
                  {t.job_role}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="font-medium text-gray-700">Sector:</span>{" "}
                  {t.job_sector}
                </p>
                <p className="text-sm text-gray-500">
                  <span className="font-medium text-gray-700">Status:</span>{" "}
                  {t.status}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    onClick={() => openEditTest(t.test_id)}
                    className="bg-blue-500  cursor-pointer text-white px-2 py-1 rounded">
                    Edit
                  </button>
                  <button
                    onClick={() => openViewTest(t.test_id)}
                    className="bg-yellow-500  cursor-pointer text-white px-2 py-1 rounded">
                    View
                  </button>
                  <button
                    onClick={() => openAssign(t.test_id)}
                    className="bg-green-500  cursor-pointer text-white px-2 py-1 rounded">
                    Assign
                  </button>
                  <button
                    onClick={() => handleDelete(t.test_id)}
                    className="bg-red-500  cursor-pointer text-white px-2 py-1 rounded">
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Assign Modal */}
        {showAssignModal && (
          <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Assign Test</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {candidates.map((c) => (
                  <label
                    key={c.user_id}
                    className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={selectedCandidateIds.includes(c.user_id)}
                      onChange={() => toggleCandidate(c.user_id)}
                    />
                    <span>
                      {c.name} ({c.email})
                    </span>
                  </label>
                ))}
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleAssign}
                  className="bg-green-600 text-white px-4 cursor-pointer py-2 rounded">
                  Assign
                </button>
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="bg-gray-300 px-4 cursor-pointer py-2 rounded">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageTests;
