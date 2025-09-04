import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import Lottie from "lottie-react";
import { testAPI, userAPI, fileAPI } from "../../utils/api";
// import magicLoading from "../assets/magic-loading.json";
import { motion, AnimatePresence } from "framer-motion";
 
 import ViewTest from "../common/ViewTest";

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
  // at the top of your component
  const [files, setFiles] = useState([]); // local selected files
  const [sourceMode, setSourceMode] = useState("blend"); // "blend" | "fileOnly" | "jobOnly"

  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]); // store file objects returned from backend
  const [uploadedFileIds, setUploadedFileIds] = useState([]);

  // Edit test
  const [showEditTest, setShowEditTest] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [editQuestions, setEditQuestions] = useState([]);

  // View test
  const [showViewTest, setShowViewTest] = useState(false);
  const [viewQuestions, setViewQuestions] = useState([]);
   
const [viewTestData, setViewTestData] = useState(null);
const [searchQuery, setSearchQuery] = useState("");

const filteredQuestions = viewQuestions.filter((q) =>
  q.toLowerCase().includes(searchQuery.toLowerCase())
);

  // Assign test
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedTestId, setSelectedTestId] = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [startDateTime, setStartDateTime] = useState("");
  const [endDateTime, setEndDateTime] = useState("");

  const [selectedCandidateIds, setSelectedCandidateIds] = useState([]);

  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [selectedScheduleTestId, setSelectedScheduleTestId] = useState(null);
  const [scheduleStart, setScheduleStart] = useState("");
  const [scheduleEnd, setScheduleEnd] = useState("");

  const openScheduleModal = (testId) => {
    setSelectedScheduleTestId(testId);
    setShowScheduleModal(true);
  };

  const handleScheduleSave = async () => {
    if (!scheduleStart || !scheduleEnd) return alert("Select start & end time");
    try {
      await testAPI.updateSchedule(selectedScheduleTestId, {
        startDateTime: scheduleStart,
        endDateTime: scheduleEnd,
      });
      toast.success("✅ Schedule updated!");
      setShowScheduleModal(false);
      fetchTests(); // refresh table
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to update schedule");
    }
  };

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
      const data = await testAPI.generateAIQuestions({
        ...form,
        difficulty, // 👈 send selected difficulty
        fileIds: uploadedFileIds, // 👈 send the uploaded file IDs
        sourceMode, // 👈 send the selected mode
      });
      setQuestions(data.questions || []);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to generate questions");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadFiles = async () => {
    if (files.length === 0) {
      alert("Please select files first!");
      return;
    }
    setUploading(true);
    try {
      const data = await fileAPI.uploadFiles(files);
      console.log("✅ Uploaded file info:", data);

      // ⬇️ Append instead of replace
      setUploadedFiles((prev) => [...prev, ...data.files]);
      setUploadedFileIds((prev) => [
        ...prev,
        ...data.files.map((f) => f.file_id),
      ]);

      setFiles([]); // clear local selection
    } catch (err) {
      console.error("❌ File upload error:", err);
      alert(err.message || "File upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    try {
      await testAPI.createTest({ ...form, questions });
      toast.success("Test created successfully!");
      setShowCreateTest(false);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to save test");
    }
  };

  // fetch tests from backend
  const fetchTests = async () => {
    try {
      const data = await testAPI.getTests();
      console.log("Fetched tests:", data); // 👈 ADD THIS
      setTests(data);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to load tests");
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
      const data = await testAPI.getTest(testId);
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
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to load test");
    }
  };
  const handleEditChange = (e) =>
    setEditForm({ ...editForm, [e.target.name]: e.target.value });

  const handleUpdate = async () => {
    try {
      await testAPI.updateTest(editForm.id, { ...editForm, questions: editQuestions });
      toast.success("✅ Test updated!");
      setShowEditTest(false);
      fetchTests();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to update");
    }
  };

  // -------- VIEW TEST FUNCTIONS --------
 
  const openViewTest = async (testId) => {
      try {
        const data = await testAPI.getTest(testId);
        // console.log("🔍 Test API response:", data); // <-- add this
        setViewTestData(data); // store the full object
        setViewQuestions(data.questions || []);
        setShowViewTest(true);
      } catch (err) {
        console.error(err);
        alert(err.message || "Failed to view");
      }
    };
  // -------- ASSIGN TEST FUNCTIONS --------
  const openAssign = async (testId) => {
    setSelectedTestId(testId);
    setShowAssignModal(true);
    try {
      const data = await userAPI.getCompanyCandidates();
      setCandidates(data);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to load candidates");
    }
  };
  const handleAssign = async () => {
    if (selectedCandidateIds.length === 0)
      return alert("Select at least one candidate");

    try {
      await testAPI.assignTest(selectedTestId, selectedCandidateIds);
      toast.success("✅ Test assigned!");
      setShowAssignModal(false);
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to assign");
    }
  };

  // -------- DELETE TEST --------
  const handleDelete = async (testId) => {
    if (!window.confirm("Are you sure you want to delete this test?")) return;
    try {
      await testAPI.deleteTest(testId);
      toast.success("🗑️ Test deleted");
      fetchTests();
    } catch (err) {
      console.error(err);
      alert(err.message || "Failed to delete");
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
                }`}>
                Easy
              </button>
              <button
                onClick={() => setDifficulty("medium")}
                className={`flex-1 px-3 py-2 rounded-md text-sm cursor-pointer border ${
                  difficulty === "medium"
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}>
                Medium
              </button>
              <button
                onClick={() => setDifficulty("hard")}
                className={`flex-1 px-3 py-2 rounded-md text-sm cursor-pointer border ${
                  difficulty === "hard"
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}>
                Hard
              </button>
            </div>
            <div>
              {/* File Upload */}
              <label className="text-sm font-medium text-gray-600">
                Upload Reference Files (PDF, Word, etc.)
              </label>
              <input
                type="file"
                multiple
                onChange={(e) => setFiles(Array.from(e.target.files))}
                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
              />

              {/* Show selected files BEFORE upload */}
              {files.length > 0 && (
                <div className="mt-2">
                  <p className="text-xs font-medium text-gray-500 mb-1">
                    Selected files:
                  </p>
                  <ul className="text-xs text-gray-600 list-disc list-inside space-y-1">
                    {files.map((f, idx) => (
                      <li key={idx}>{f.name}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                onClick={handleUploadFiles}
                disabled={uploading || files.length === 0}
                className="mt-3 px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 transition-colors cursor-pointer disabled:opacity-50">
                {uploading ? "Uploading..." : "Upload Files"}
              </button>

              {/* Show uploaded files AFTER upload */}
              {uploadedFiles.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-medium text-green-700 mb-1">
                    ✅ Uploaded files:
                  </p>
                  <ul className="text-xs text-green-700 list-disc list-inside space-y-1">
                    {uploadedFiles.map((f) => (
                      <li key={f.file_id}>
                        {f.original_filename}
                        {/* <span className="text-gray-400"> (ID: {f.file_id})</span> */}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            <label className="text-sm font-medium text-gray-600">
              Question Source
            </label>
            <div className="flex gap-3 mt-1 mb-3">
              <label className="flex items-center gap-1 text-sm text-gray-700">
                <input
                  type="radio"
                  name="sourceMode"
                  value="blend"
                  checked={sourceMode === "blend"}
                  onChange={(e) => setSourceMode(e.target.value)}
                />
                Blend Job Details + Files
              </label>
              <label className="flex items-center gap-1 text-sm text-gray-700">
                <input
                  type="radio"
                  name="sourceMode"
                  value="jobOnly"
                  checked={sourceMode === "jobOnly"}
                  onChange={(e) => setSourceMode(e.target.value)}
                />
                Job Details Only
              </label>
              <label className="flex items-center gap-1 text-sm text-gray-700">
                <input
                  type="radio"
                  name="sourceMode"
                  value="fileOnly"
                  checked={sourceMode === "fileOnly"}
                  onChange={(e) => setSourceMode(e.target.value)}
                />
                Files Only
              </label>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleGenerate}
                className="flex-1 px-4 py-2 cursor-pointer  hover:bg-gradient-to-r hover:from-purple-600 hover:to-indigo-600 bg-gradient-to-r from-indigo-600 to-purple-600 text-white   hover:shadow-lg hover:scale-[1.02] transition-all duration-200 md:text-[10px] lg:text-sm rounded-md  ">
                {loading ? (
                  <div className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-4 w-4 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v8H4z"></path>
                    </svg>
                    <span className="animate-pulse">Generating…</span>
                  </div>
                ) : (
                  "Generate AI Questions"
                )}
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
            <div
              className={`flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar transition-opacity duration-300 ${
                loading ? "opacity-50" : "opacity-100"
              }`}>
              {loading && (
                <div className="flex flex-col items-center justify-center h-48 relative">
                  {/* Minimal Circle Animation */}
                  <div className="relative w-16 h-16 mb-6">
                    {/* Outer ring */}
                    <div className="absolute inset-0 rounded-full border-2 border-gray-200 border-t-indigo-500 animate-spin"></div>

                    {/* Middle ring - slower rotation */}
                    <div className="absolute inset-2 rounded-full border-2 border-gray-100 border-r-purple-400 animate-slow-reverse-spin"></div>

                    {/* Inner pulsing dot */}
                    <div className="absolute inset-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 animate-gentle-pulse"></div>

                    {/* Subtle floating particles */}
                    <div className="absolute -inset-4">
                      <div className="absolute top-0 left-1/2 w-1 h-1 bg-indigo-300 rounded-full animate-subtle-float-1 opacity-60"></div>
                      <div className="absolute top-1/4 right-0 w-1 h-1 bg-purple-300 rounded-full animate-subtle-float-2 opacity-60"></div>
                      <div className="absolute bottom-1/4 left-0 w-1 h-1 bg-indigo-300 rounded-full animate-subtle-float-3 opacity-60"></div>
                      <div className="absolute bottom-0 right-1/4 w-1 h-1 bg-purple-300 rounded-full animate-subtle-float-4 opacity-60"></div>
                    </div>
                  </div>

                  {/* Professional Text */}
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-700 mb-3">
                      Generating questions...
                    </p>

                    {/* Progress dots */}
                    <div className="flex justify-center space-x-1">
                      <div
                        className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}></div>
                      <div
                        className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}></div>
                      <div
                        className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}></div>
                    </div>
                  </div>
                </div>
              )}

              {/* When not loading, or after loading finishes, show the questions list as usual */}
              {!loading && questions.length === 0 && (
                <p className="text-sm text-gray-400 italic">
                  No questions yet.
                </p>
              )}

              {questions.map((q, i) => (
                <div
                  key={i}
                  className="p-1 md:p-3 border border-gray-200 rounded-md hover:shadow-sm transition-shadow bg-gray-50 animate-fadeIn">
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

@keyframes slow-reverse-spin {
  from { transform: rotate(360deg); }
  to { transform: rotate(0deg); }
}

@keyframes gentle-pulse {
  0%, 100% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.1); opacity: 1; }
}

@keyframes subtle-float-1 {
  0%, 100% { transform: translate(0, 0); opacity: 0.4; }
  50% { transform: translate(-8px, -12px); opacity: 0.8; }
}

@keyframes subtle-float-2 {
  0%, 100% { transform: translate(0, 0); opacity: 0.4; }
  50% { transform: translate(10px, -8px); opacity: 0.8; }
}

@keyframes subtle-float-3 {
  0%, 100% { transform: translate(0, 0); opacity: 0.4; }
  50% { transform: translate(-10px, 8px); opacity: 0.8; }
}

@keyframes subtle-float-4 {
  0%, 100% { transform: translate(0, 0); opacity: 0.4; }
  50% { transform: translate(8px, 12px); opacity: 0.8; }
}

.animate-slow-reverse-spin {
  animation: slow-reverse-spin 3s linear infinite;
}

.animate-gentle-pulse {
  animation: gentle-pulse 2s ease-in-out infinite;
}

.animate-subtle-float-1 {
  animation: subtle-float-1 3s ease-in-out infinite;
}

.animate-subtle-float-2 {
  animation: subtle-float-2 2.8s ease-in-out infinite;
}

.animate-subtle-float-3 {
  animation: subtle-float-3 3.2s ease-in-out infinite;
}

.animate-subtle-float-4 {
  animation: subtle-float-4 2.9s ease-in-out infinite;
}

        @keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.4s ease-in forwards;
}

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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4 }}
      className="relative w-full h-[95vh] bg-gradient-to-br from-slate-50 via-white to-blue-50/30 rounded-2xl shadow-xl border border-gray-200/60 overflow-hidden"
    >
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(120,119,198,0.1),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.1),transparent_50%)]"></div>

      {/* Header */}
      <div className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200/60 p-4 sm:p-6">
        <div className="flex items-center justify-between">
          <motion.button
            onClick={() => setShowViewTest(false)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </motion.button>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`px-4 py-2 rounded-xl text-sm font-semibold shadow-lg ${
              viewTestData?.status === "active"
                ? "bg-gradient-to-r from-emerald-500 to-green-500 text-white"
                : viewTestData?.status === "draft"
                ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white"
                : "bg-gradient-to-r from-gray-400 to-gray-500 text-white"
            }`}
          >
            {viewTestData?.status?.toUpperCase() || "UNKNOWN"}
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="relative p-4 sm:p-6 h-full overflow-y-auto ">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-4 shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-gray-800 via-blue-700 to-purple-700 bg-clip-text text-transparent mb-2">
            {viewTestData?.title || "Untitled Assessment"}
          </h1>
          <p className="text-gray-600">Assessment Overview</p>
        </motion.div>

        {/* Info Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          {[
            { 
              label: "Job Role", 
              value: viewTestData?.job_role || "Not specified",
              gradient: "from-blue-500 to-cyan-500",
              icon: <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z" /></svg>
            },
            { 
              label: "Job Sector", 
              value: viewTestData?.job_sector || "Not specified",
              gradient: "from-emerald-500 to-teal-500",
              icon: <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
            },
            { 
              label: "Duration", 
              value: `${viewTestData?.duration || 0} min`,
              gradient: "from-orange-500 to-red-500",
              icon: <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            },
            {
              label: "Created",
              value: viewTestData?.created_at
                ? new Date(viewTestData.created_at).toLocaleDateString()
                : "Unknown",
              gradient: "from-purple-500 to-pink-500",
              icon: <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              whileHover={{ y: -2, scale: 1.02 }}
              className="group p-5 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/60 shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-9 h-9 bg-gradient-to-r ${item.gradient} rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200`}>
                  {item.icon}
                </div>
                <span className="text-xs text-gray-600 font-semibold uppercase tracking-wide">{item.label}</span>
              </div>
              <p className="font-bold text-gray-900 text-lg">{item.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Schedule Info */}
        {(viewTestData?.scheduled_start || viewTestData?.scheduled_end) && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8"
          >
            {viewTestData?.scheduled_start && (
              <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200/60 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8" />
                    </svg>
                  </div>
                  <span className="font-semibold text-green-700">Start Time</span>
                </div>
                <p className="text-green-800 font-medium">
                  {new Date(viewTestData.scheduled_start).toLocaleString()}
                </p>
              </div>
            )}
            {viewTestData?.scheduled_end && (
              <div className="p-5 bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-200/60 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-rose-600 rounded-lg flex items-center justify-center shadow-md">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3" />
                    </svg>
                  </div>
                  <span className="font-semibold text-red-700">End Time</span>
                </div>
                <p className="text-red-800 font-medium">
                  {new Date(viewTestData.scheduled_end).toLocaleString()}
                </p>
              </div>
            )}
          </motion.div>
        )}

        {/* Description */}
        {viewTestData?.description && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mb-8 p-5 bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-xl border border-slate-200/60 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-slate-600 to-gray-700 rounded-lg flex items-center justify-center shadow-md">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-slate-800 text-lg">Description</h3>
            </div>
            <p className="text-slate-700 leading-relaxed">
              {viewTestData.description}
            </p>
          </motion.div>
        )}

        {/* Questions Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/60 shadow-xl p-5 mb-16 sm:p-6"
        >
          {/* Questions Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-xl">Questions</h3>
                <p className="text-slate-600 mt-1">
                  {filteredQuestions.length} of {viewQuestions.length} questions
                </p>
              </div>
            </div>

            {/* Enhanced Search */}
            <div className="relative w-full lg:w-80">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl text-slate-700 placeholder-slate-400 shadow-lg focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400 outline-none transition-all duration-300"
              />
            </div>
          </div>

          {/* Questions List */}
          <div className="max-h-96 overflow-y-auto space-y-3">
            {filteredQuestions.length > 0 ? (
              filteredQuestions.map((q, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  whileHover={{ scale: 1.01, x: 4 }}
                  className="p-4 bg-gradient-to-r from-white to-slate-50/50 rounded-xl border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300"
                >
                  <div className="flex gap-4">
                    <div className="flex-shrink-0 w-7 h-7 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg">
                      {i + 1}
                    </div>
                    <p className="text-slate-800 leading-relaxed font-medium">
                      {q}
                    </p>
                  </div>
                </motion.div>
              ))
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-slate-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <p className="text-slate-600 font-semibold text-lg">No questions found</p>
                <p className="text-slate-400">Try adjusting your search terms</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
    // <ViewTest />
  );
}


  // ------------------ DEFAULT TABLE VIEW -------------------
  return (
    <div className="p-4  md:p-8 bg-gray-50 min-h-screen">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold font-poppins text-gray-800">
            🧪 Manage Tests
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Create and manage your tests with ease
          </p>
        </div>
        <button
          onClick={() => setShowCreateTest(true)}
          className="self-start md:self-auto cursor-pointer inline-flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl shadow-md hover:bg-gradient-to-r hover:from-purple-600 hover:to-indigo-600 hover:shadow-lg hover:scale-[1.02] transition-all duration-200">
          ➕ Create Test
        </button>
      </div>

      {/* TABLE / CARDS */}
      <div className="bg-white rounded-2xl shadow-md overflow-hidden ">
        {/* DESKTOP TABLE */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
  <table className="hidden md:table min-w-full">
    <thead className="bg-gray-100">
      <tr>
        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Name</th>
        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Role</th>
        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Sector</th>
        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Status</th>
        <th className="text-center py-4 px-6 text-sm font-semibold text-gray-600">Actions</th>
        <th className="text-left py-4 px-6 text-sm font-semibold text-gray-600">Schedule</th>
      </tr>
    </thead>
    <tbody>
      {loadingTests ? (
        <tr>
          <td colSpan={6} className="py-6 text-center text-gray-500">Loading...</td>
        </tr>
      ) : tests.length === 0 ? (
        <tr>
          <td colSpan={6} className="py-6 text-center text-gray-500">No tests found.</td>
        </tr>
      ) : (
        tests.map((t) => (
          <tr
            key={t.test_id}
            className="border-t hover:bg-gray-50 transition-colors"
          >
            {/* Name */}
            <td className="py-4 px-6 font-poppins">{t.title}</td>

            {/* Role */}
            <td className="py-4 px-6 font-poppins">{t.job_role}</td>

            {/* Sector */}
            <td className="py-4 px-6 font-poppins">{t.job_sector}</td>

            {/* Status */}
            <td className="py-4 px-6 font-poppins capitalize">{t.status}</td>

            {/* Actions */}
            <td className="py-4 px-6 font-poppins">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => openScheduleModal(t.test_id)}
                  className="bg-purple-500 cursor-pointer text-white px-3 py-1 rounded"
                >
                  Set Schedule
                </button>
                <button
                  onClick={() => openEditTest(t.test_id)}
                  className="bg-blue-500 cursor-pointer text-white px-3 py-1 rounded"
                >
                  Edit
                </button>
                <button
                  onClick={() => openViewTest(t.test_id)}
                  className="bg-yellow-500 cursor-pointer text-white px-3 py-1 rounded"
                >
                  View
                </button>
                <button
                  onClick={() => openAssign(t.test_id)}
                  className="bg-green-500 cursor-pointer text-white px-3 py-1 rounded"
                >
                  Assign
                </button>
                <button
                  onClick={() => handleDelete(t.test_id)}
                  className="bg-red-500 cursor-pointer text-white px-3 py-1 rounded"
                >
                  Delete
                </button>
              </div>
            </td>

            {/* Schedule */}
            <td className="py-4 px-6 font-poppins text-sm text-gray-700">
              {t.scheduled_start ? (
                <>
                  <div>
                    <span className="font-medium">Start:</span>{" "}
                    {new Date(t.scheduled_start).toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">End:</span>{" "}
                    {new Date(t.scheduled_end).toLocaleString()}
                  </div>
                </>
              ) : (
                <span className="italic text-gray-400">Not scheduled</span>
              )}
            </td>
          </tr>
        ))
      )}
    </tbody>
  </table>
</div>


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
                    onClick={() => openScheduleModal(t.test_id)}
                    className="bg-purple-500 cursor-pointer text-white px-3 py-1 rounded">
                    Set Schedule
                  </button>
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
                 <p className="text-sm text-gray-500">
  <span className="font-medium text-gray-700">Start:</span>{" "}
  {t.scheduled_start ? new Date(t.scheduled_start).toLocaleString() : "Not set"}
</p>
<p className="text-sm text-gray-500">
  <span className="font-medium text-gray-700">End:</span>{" "}
  {t.scheduled_end ? new Date(t.scheduled_end).toLocaleString() : "Not set"}
</p>

                </div>
              </div>
            ))
          )}
        </div>

        {showScheduleModal && (
          <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">Set Test Schedule</h3>

              <label className="text-sm font-medium text-gray-600">
                Start Date & Time
              </label>
              <input
                type="datetime-local"
                value={scheduleStart}
                onChange={(e) => setScheduleStart(e.target.value)}
                className="w-full border rounded px-3 py-2 mb-3"
              />

              <label className="text-sm font-medium text-gray-600">
                End Date & Time
              </label>
              <input
                type="datetime-local"
                value={scheduleEnd}
                onChange={(e) => setScheduleEnd(e.target.value)}
                className="w-full border rounded px-3 py-2 mb-3"
              />

              <div className="mt-4 flex gap-2">
                <button
                  onClick={handleScheduleSave}
                  className="bg-purple-600 cursor-pointer text-white px-4 py-2 rounded">
                  Save Schedule
                </button>
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="bg-gray-300 cursor-pointer px-4 py-2 rounded">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

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
