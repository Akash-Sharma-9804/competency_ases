import React, { useState } from "react";
import { testAPI, fileAPI } from "../../utils/api";
import toast from "react-hot-toast";

const UserCreateTest = () => {
 const [form, setForm] = useState({
  name: "",
  role: "",
  sector: "",
  description: "",
  duration: "",
  startMode: "instant", // "instant" or "schedule"
  scheduledStart: "",
  scheduledEnd: ""
});

  const [difficulty, setDifficulty] = useState("easy");
  const [sourceMode, setSourceMode] = useState("blend");
  const [files, setFiles] = useState([]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
const [uploadedFileIds, setUploadedFileIds] = useState([]);

  const sectors = ["IT", "Finance", "Marketing", "HR", "Healthcare"];

  const handleFormChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

 const handleUploadFiles = async () => {
  if (files.length === 0) {
    alert("Please select files first!");
    return;
  }
  setLoading(true);
  try {
    const data = await fileAPI.uploadFiles(files);
    console.log("✅ Uploaded file info:", data);

    setUploadedFiles((prev) => [...prev, ...data.files]);
    setUploadedFileIds((prev) => [...prev, ...data.files.map(f => f.file_id)]);
    setFiles([]); // clear local selection
  } catch (err) {
    console.error("❌ File upload error:", err);
    alert(err.message || "File upload failed");
  } finally {
    setLoading(false);
  }
};


 const handleGenerate = async () => {
  if (!form.role || !form.description) {
    alert("Please fill out job role and description.");
    return;
  }

  setLoading(true);
  try {
    const data = await testAPI.generateAIQuestions({
      role: form.role,
      sector: form.sector,
      description: form.description,
      difficulty,
      fileIds: uploadedFileIds,
      sourceMode,
    });

    setQuestions(data.questions || []);
  } catch (err) {
    console.error(err);
    alert(err.message || "Failed to generate questions");
  } finally {
    setLoading(false);
  }
};


const handleSave = async () => {
  if (!form.role || !form.description || questions.length === 0) {
    toast.error("Please fill in job role, description and generate questions first.");
    return;
  }

  try {
  await testAPI.createTest({
  ...form,
  questions,
  difficulty,
  sourceMode,
  fileIds: uploadedFileIds,
  scheduledStart: form.startMode === "schedule" ? form.scheduledStart : null,
  scheduledEnd: form.startMode === "schedule" ? form.scheduledEnd : null,
  startInstantly: form.startMode === "instant", // used to decide if `started_at` should be set
});


    toast.success("Test created successfully!");
    // setShowCreateTest(false);
  } catch (err) {
    console.error("❌ Failed to save test:", err);
    toast.error(err.message || "Failed to save test");
  }
};


  return (
    <div className="min-h-screen font-poppins bg-gray-50 p-4 flex flex-col">

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-800">Create Your Mock Test</h2>
      </div>

     <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">

        <div className="bg-white border rounded-lg shadow-sm p-4 space-y-3 md:col-span-2">
          <h3 className="text-md font-medium text-gray-700 mb-2">Test Details</h3>

          <label className="text-sm font-medium text-gray-600">Test Title</label>
          <input
            name="name"
            value={form.name}
            onChange={handleFormChange}
            placeholder="Enter test title"
            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500"
          />

          <label className="text-sm font-medium text-gray-600">Job Role</label>
          <input
            name="role"
            value={form.role}
            onChange={handleFormChange}
            placeholder="Enter job role"
            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500"
          />

          <label className="text-sm font-medium text-gray-600">Sector</label>
          <select
            name="sector"
            value={form.sector}
            onChange={handleFormChange}
            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">Select Sector</option>
            {sectors.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <label className="text-sm font-medium text-gray-600">Job Description</label>
          <textarea
            name="description"
            value={form.description}
            onChange={handleFormChange}
            rows={3}
            placeholder="Enter description"
            className="w-full border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500"
          />

          <label className="text-sm font-medium text-gray-600">Duration (minutes)</label>
<input
  type="number"
  name="duration"
  value={form.duration}
  onChange={handleFormChange}
  placeholder="Enter duration"
  className="w-full border rounded-md px-3 py-2 text-sm focus:ring-1 focus:ring-indigo-500"
/>

<label className="text-sm font-medium text-gray-600 mt-2">Start Mode</label>
<div className="flex gap-3 mt-1">
  {["instant", "schedule"].map((mode) => (
    <label key={mode} className="flex items-center gap-2 text-sm text-gray-700">
      <input
        type="radio"
        name="startMode"
        value={mode}
        checked={form.startMode === mode}
        onChange={handleFormChange}
      />
      {mode === "instant" ? "Start Instantly" : "Schedule for Later"}
    </label>
  ))}
</div>

{form.startMode === "schedule" && (
  <>
    <label className="text-sm font-medium text-gray-600 mt-2">Scheduled Start</label>
    <input
      type="datetime-local"
      name="scheduledStart"
      value={form.scheduledStart}
      onChange={handleFormChange}
      className="w-full border rounded-md px-3 py-2 text-sm"
    />

    <label className="text-sm font-medium text-gray-600 mt-2">Scheduled End</label>
    <input
      type="datetime-local"
      name="scheduledEnd"
      value={form.scheduledEnd}
      onChange={handleFormChange}
      className="w-full border rounded-md px-3 py-2 text-sm"
    />
  </>
)}
 

          <div className="flex gap-2 pt-2">
            {["easy", "medium", "hard"].map((level) => (
              <button
                key={level}
                onClick={() => setDifficulty(level)}
                className={`flex-1 px-3 py-2 rounded-md text-sm border cursor-pointer ${
                  difficulty === level
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {level.charAt(0).toUpperCase() + level.slice(1)}
              </button>
            ))}
          </div>

          <label className="text-sm font-medium text-gray-600">
            Upload Reference Files
          </label>
          <input
            type="file"
            multiple
            onChange={(e) => setFiles(Array.from(e.target.files))}
            className="w-full border rounded-md px-3 py-2 text-sm"
          />

          {files.length > 0 && (
            <ul className="text-xs text-gray-600 list-disc list-inside space-y-1 mt-2">
              {files.map((f, idx) => (
                <li key={idx}>{f.name}</li>
              ))}
            </ul>
          )}

          <button
            onClick={handleUploadFiles}
            disabled={loading || files.length === 0}
            className="mt-3 px-4 py-2 bg-indigo-600 text-white text-sm rounded-md hover:bg-indigo-700 disabled:opacity-50"
          >
            {loading ? "Uploading..." : "Upload Files"}
          </button>

          <div className="mt-3">
            <label className="text-sm font-medium text-gray-600">Question Source</label>
            <div className="flex gap-3 mt-1">
              {["blend", "jobOnly", "fileOnly"].map((mode) => (
                <label key={mode} className="flex items-center gap-1 text-sm text-gray-700">
                  <input
                    type="radio"
                    name="sourceMode"
                    value={mode}
                    checked={sourceMode === mode}
                    onChange={(e) => setSourceMode(e.target.value)}
                  />
                  {mode === "blend"
                    ? "Blend"
                    : mode === "jobOnly"
                    ? "Job Only"
                    : "Files Only"}
                </label>
              ))}
            </div>
          </div>

         <div className="flex gap-2 pt-2">
  <button
    onClick={handleGenerate}
    className="flex-1 px-4 py-2 cursor-pointer hover:bg-gradient-to-r hover:from-purple-600 hover:to-indigo-600 bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:scale-[1.02] transition-all duration-200 md:text-[10px] lg:text-sm rounded-md"
  >
    {loading ? (
      <div className="flex items-center justify-center gap-2">
        <svg
          className="animate-spin h-4 w-4 text-white"
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
            d="M4 12a8 8 0 018-8v8H4z"
          ></path>
        </svg>
        <span className="animate-pulse">Generating…</span>
      </div>
    ) : (
      "Generate AI Questions"
    )}
  </button>
</div>
        </div>

       <div className="bg-white border rounded-lg shadow-sm p-4 flex flex-col md:col-span-2 lg:col-span-3">
  <h3 className="text-md font-medium text-gray-700 mb-3">Questions</h3>

  <div className="max-h-[80vh] overflow-y-auto space-y-3 custom-scrollbar transition-opacity duration-300">
    {loading && (
      <div className="flex flex-col items-center justify-center h-48 relative">
        <div className="relative w-16 h-16 mb-6">
          <div className="absolute inset-0 rounded-full border-2 border-gray-200 border-t-indigo-500 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-2 border-gray-100 border-r-purple-400 animate-slow-reverse-spin"></div>
          <div className="absolute inset-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 animate-gentle-pulse"></div>

          <div className="absolute -inset-4">
            <div className="absolute top-0 left-1/2 w-1 h-1 bg-indigo-300 rounded-full animate-subtle-float-1 opacity-60"></div>
            <div className="absolute top-1/4 right-0 w-1 h-1 bg-purple-300 rounded-full animate-subtle-float-2 opacity-60"></div>
            <div className="absolute bottom-1/4 left-0 w-1 h-1 bg-indigo-300 rounded-full animate-subtle-float-3 opacity-60"></div>
            <div className="absolute bottom-0 right-1/4 w-1 h-1 bg-purple-300 rounded-full animate-subtle-float-4 opacity-60"></div>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm font-medium text-gray-700 mb-3">
            Generating questions...
          </p>
          <div className="flex justify-center space-x-1">
            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
            <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
          </div>
        </div>
      </div>
    )}

    {!loading &&
      questions.map((q, i) => (
        <div key={i} className="p-1 md:p-3 border border-gray-200 rounded-md hover:shadow-sm transition-shadow bg-gray-50 animate-fadeIn">
          <label className="block text-xs text-gray-500 mb-1">Question {i + 1}</label>
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

  {questions.length > 0 && !loading && (
    <div className="flex gap-2 pt-4">
      <button
        onClick={handleSave}
        className="flex-1 px-4 py-2 bg-green-600 cursor-pointer text-white text-sm rounded-md hover:bg-green-700"
      >
        Save Test
      </button>
    </div>
  )}
</div>
      </div>
      <style>
        {
          `
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

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(5px); }
  to { opacity: 1; transform: translateY(0); }
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

          
          `
        }
      </style>
    </div>
  );
};

export default UserCreateTest;
