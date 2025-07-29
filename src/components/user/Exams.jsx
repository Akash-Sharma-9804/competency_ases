import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { userAPI } from "../../utils/api";
import { useNavigate } from "react-router-dom";

const Exams = () => {
  const [exams, setExams] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Fetch from backend
  const fetchExams = async () => {
    try {
      const data = await userAPI.getAssignedTests();
      setExams(data);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to load exams");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleStartMockTest = async (testId) => {
  try {
    await userAPI.startTestNow(testId);
    toast.success("Mock test started!");
    fetchExams(); // refresh the list
  } catch (err) {
    console.error(err);
    toast.error(err.message || "Failed to start test");
  }
};


  // Countdown calculation
  const getCountdown = (startTime) => {
    const now = new Date();
    const start = new Date(startTime);
    const diff = start - now;
    if (diff <= 0) return null;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    return `${hours}h ${minutes}m`;
  };

  const filtered = exams.filter(
    (e) =>
      e.test_master?.title.toLowerCase().includes(search.toLowerCase()) ||
      e.company?.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <h3 className="text-2xl font-bold text-gray-800">
          📘 My Exams ({filtered.length})
        </h3>
        <input
          type="text"
          placeholder="Search by company or test..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full md:w-64 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="text-gray-500">Loading exams…</p>
        ) : filtered.length === 0 ? (
          <p className="text-gray-500">No exams found.</p>
        ) : (
          filtered.map((exam) => {
            const countdown = getCountdown(exam.test_master?.scheduled_start);
            return (
              <div
                key={exam.test_id}
                className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition flex flex-col">
                <h4 className="font-semibold text-lg text-gray-800">
                  {exam.test_master?.title || "Untitled Test"}
                </h4>
                <p className="text-sm text-gray-500 mt-1">
                  Source:{" "}
                  <span className="font-medium">
                    {exam.company?.name || "Mock Test"}
                  </span>
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  Start:{" "}
                  {exam.test_master?.scheduled_start
                    ? new Date(
                        exam.test_master.scheduled_start
                      ).toLocaleString()
                    : "—"}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  End:{" "}
                  {exam.test_master?.scheduled_end
                    ? new Date(exam.test_master.scheduled_end).toLocaleString()
                    : "—"}
                </p>

                {/* Countdown */}
                {countdown && (
                  <p className="mt-2 text-sm font-medium text-indigo-600">
                    ⏳ Starts in {countdown}
                  </p>
                )}

                {/* Status Badge */}
                <div className="mt-3">
                  {/* Start Now button for mock tests */}
{!exam.company && exam.status === "scheduled" && (
  <button
      onClick={() => navigate(`/instructions`)}
    className="mt-3 px-4 py-2 bg-indigo-600 text-white rounded-md text-sm hover:bg-indigo-700"
  >
    Start Now
  </button>
)}

                  {exam.status === "in_progress" && (
                    <span className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full font-medium">
                      In Progress
                    </span>
                  )}
                  {exam.status === "passed" && (
                    <span className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full font-medium">
                      Passed
                    </span>
                  )}
                  {exam.status === "failed" && (
                    <span className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-full font-medium">
                      Failed
                    </span>
                  )}
                  {exam.status === "under_review" && (
                    <span className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-full font-medium">
                      Under Review
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Exams;
