


import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { userAPI } from "../../utils/api";
import { motion } from "framer-motion";

const UserHome = () => {
  const navigate = useNavigate();
  const [assignedTests, setAssignedTests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch assigned tests for this user
  const fetchAssignedTests = async () => {
    try {
      const data = await userAPI.getAssignedTests();
      setAssignedTests(data);
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to load assigned tests");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignedTests();
    const interval = setInterval(() => {
      // Force rerender every minute for timer updates
      setAssignedTests((prev) => [...prev]);
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const calculateTimeLeft = (startTime) => {
    if (!startTime) return null;
    const now = new Date();
    const start = new Date(startTime);
    const diff = start - now;
    if (diff <= 0) return "Already started";
    const mins = Math.floor((diff / 1000 / 60) % 60);
    const hours = Math.floor((diff / 1000 / 60 / 60) % 24);
    const days = Math.floor(diff / 1000 / 60 / 60 / 24);
    return `${days > 0 ? days + "d " : ""}${hours > 0 ? hours + "h " : ""}${mins}m left`;
  };

  return (
   <div className="p-6 space-y-6">
  <h2 className="text-2xl font-bold text-gray-800 mb-4">
    📌 Assigned & Upcoming Tests
  </h2>

  {loading ? (
    <p className="text-center text-gray-500">Loading your tests...</p>
   ) : (() => {
    const upcomingTests = assignedTests.filter((t) => {
      const now = new Date();
      const startTime = new Date(t.test_master?.scheduled_start);
      const endTime = new Date(t.test_master?.scheduled_end);
      return (
        t.status === "scheduled" &&
        (!endTime || endTime > now)
      );
    });

    if (upcomingTests.length === 0) {
      return (
    <motion.div
  className="text-center text-gray-500 flex flex-col items-center justify-center mt-12"
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.5 }}
>
  <motion.img
    src="./empty-box.png"
    alt="No Tests"
    className="w-48 h-48 mb-6"
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ scale: 1, opacity: 1 }}
    transition={{ duration: 0.6, ease: "easeOut" }}
  />
  <p className="text-lg font-medium">No upcoming tests assigned.</p>
  <p className="text-sm text-gray-400 mt-2">
    Please check back later or contact your administrator.
  </p>
</motion.div>

      );
    }

    return (
      <div className="grid md:grid-cols-2 gap-4">
        {upcomingTests.map((t) => {
          const startTime = t.test_master?.scheduled_start;
          const endTime = t.test_master?.scheduled_end;
          const timeLeft = calculateTimeLeft(startTime);

          return (
            <div
              key={t.test_id}
              className="bg-white rounded-xl shadow-sm p-4 hover:shadow-md transition flex flex-col gap-2"
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-medium text-gray-800">
                    {t.test_master?.title}
                  </p>
                  <p className="text-sm text-gray-500">
                    Company: {t.company?.name}
                  </p>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    t.status === "scheduled"
                      ? "bg-blue-100 text-blue-700"
                      : t.status === "in_progress"
                      ? "bg-yellow-100 text-yellow-700"
                      : "bg-green-100 text-green-700"
                  }`}
                >
                  {t.status.replace("_", " ")}
                </span>
              </div>

              <p className="text-sm text-gray-600">
                🕒 Starting On:{" "}
                {startTime
                  ? new Date(startTime).toLocaleString()
                  : "—"}
              </p>

              {startTime && (
                <p className="text-sm font-medium text-indigo-600">
                  ⏰ {timeLeft}
                </p>
              )}

              {t.status === "scheduled" &&
                timeLeft !== "Already started" && (
                  <button
                    onClick={() => navigate(`/instructions`)}
                    className="mt-3 px-4 py-2 bg-indigo-600 text-white cursor-pointer rounded-lg hover:bg-indigo-700 text-sm font-medium self-start"
                  >
                    Start Test
                  </button>
                )}
            </div>
          );
        })}
      </div>
    );
  })()}

         
</div>

  );
};

export default UserHome;
