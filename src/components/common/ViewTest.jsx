import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";

const ViewTest = ({ isVisible, onClose, testData, testAPI }) => {
  const [viewQuestions, setViewQuestions] = useState([]);
  const [viewTestData, setViewTestData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Filter questions based on search query
  const filteredQuestions = viewQuestions.filter((q) =>
    q.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Load test data when component becomes visible or testData changes
  useEffect(() => {
    if (isVisible && testData?.id) {
      loadTestData(testData.id);
    }
  }, [isVisible, testData]);

  // Function to load test data
  const loadTestData = async (testId) => {
    if (!testAPI?.getTest) {
      console.error("testAPI.getTest is not available");
      setError("API not available");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await testAPI.getTest(testId);
      console.log("🔍 Test API response:", data);
      setViewTestData(data);
      setViewQuestions(data.questions || []);
    } catch (err) {
      console.error("Error loading test:", err);
      setError(err.message || "Failed to load test data");
    } finally {
      setLoading(false);
    }
  };

  // Handle close
  const handleClose = () => {
    setSearchQuery(""); // Reset search when closing
    setError(null);
    onClose();
  };

  // Don't render if not visible
  if (!isVisible) return null;

  // Loading state
  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-2xl p-8 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <span className="text-gray-700">Loading test data...</span>
          </div>
        </div>
      </motion.div>
    );
  }

  // Error state
  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="bg-white rounded-2xl p-8 shadow-xl max-w-md">
          <div className="text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-6 h-6 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Error Loading Test
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <div className="flex gap-3 justify-center">
              <button
                onClick={() => testData?.id && loadTestData(testData.id)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                Retry
              </button>
              <button
                onClick={handleClose}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors">
                Close
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.4 }}
      className="relative w-full h-[95vh]  bg-gradient-to-br from-slate-50 via-white to-blue-50/30 rounded-2xl shadow-xl border border-gray-200/60 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(120,119,198,0.1),transparent_50%),radial-gradient(circle_at_80%_20%,rgba(255,119,198,0.1),transparent_50%)]"></div>

      {/* Header */}
      <div className="relative z-10 bg-white/80 backdrop-blur-sm border-b border-gray-200/60 p-4 sm:px-6 sm:py-4">
        <div className="flex items-center justify-between">
          <motion.button
            onClick={handleClose}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center cursor-pointer gap-2 px-4 py-2 bg-gradient-to-r from-gray-800 to-gray-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
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
            }`}>
            {viewTestData?.status?.toUpperCase() || "UNKNOWN"}
          </motion.div>
        </div>
      </div>

      {/* Content */}
      <div className="relative p-4 sm:px-6 h-full overflow-y-auto ">
        {/* Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center mb-4">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl mb-4 shadow-lg">
            <svg
              className="w-6 h-6 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
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
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {[
            {
              label: "Job Role",
              value: viewTestData?.job_role || "Not specified",
              gradient: "from-blue-500 to-cyan-500",
              icon: (
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2z"
                  />
                </svg>
              ),
            },
            {
              label: "Job Sector",
              value: viewTestData?.job_sector || "Not specified",
              gradient: "from-emerald-500 to-teal-500",
              icon: (
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              ),
            },
            {
              label: "Duration",
              value: `${viewTestData?.duration || 0} min`,
              gradient: "from-orange-500 to-red-500",
              icon: (
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              ),
            },
            {
              label: "Created",
              value: viewTestData?.created_at
                ? new Date(viewTestData.created_at).toLocaleDateString()
                : "Unknown",
              gradient: "from-purple-500 to-pink-500",
              icon: (
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              ),
            },
          ].map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + idx * 0.1 }}
              whileHover={{ y: -2, scale: 1.02 }}
              className="group px-5 py-3 bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/60 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`w-9 h-9 bg-gradient-to-r ${item.gradient} rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform duration-200`}>
                  {item.icon}
                </div>
                <span className="text-xs text-gray-600 font-semibold uppercase tracking-wide">
                  {item.label}
                </span>
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
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            {viewTestData?.scheduled_start && (
              <div className="px-5 py-3 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200/60 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h8"
                      />
                    </svg>
                  </div>
                  <span className="font-semibold text-green-700">
                    Start Time
                  </span>
                </div>
                <p className="text-green-800 font-medium">
                  {new Date(viewTestData.scheduled_start).toLocaleString()}
                </p>
              </div>
            )}
            {viewTestData?.scheduled_end && (
              <div className="px-5 py-3  bg-gradient-to-br from-red-50 to-rose-50 rounded-xl border border-red-200/60 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-8 h-8 bg-gradient-to-r from-red-500 to-rose-600 rounded-lg flex items-center justify-center shadow-md">
                    <svg
                      className="w-4 h-4 text-white"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3"
                      />
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
            className="mb-4 px-5 py-3  bg-gradient-to-br from-slate-50 to-blue-50/50 rounded-xl border border-slate-200/60 shadow-lg">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 bg-gradient-to-r from-slate-600 to-gray-700 rounded-lg flex items-center justify-center shadow-md">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
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
          className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-200/60 shadow-xl p-5 mb-16 sm:p-6">
          {/* Questions Header */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-5 h-5 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
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
                <svg
                  className="w-5 h-5 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
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
                  className="p-4 w-[98%] mx-auto bg-gradient-to-r from-white to-slate-50/50 rounded-xl border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300">
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
                className="text-center py-16">
                <div className="w-16 h-16 bg-gradient-to-r from-slate-400 to-gray-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <svg
                    className="w-8 h-8 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                <p className="text-slate-600 font-semibold text-lg">
                  No questions found
                </p>
                <p className="text-slate-400">
                  Try adjusting your search terms
                </p>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ViewTest;
