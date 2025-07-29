import React, { useEffect, useState, useMemo } from "react";
import toast from "react-hot-toast";

const AssignedTests = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const token = localStorage.getItem("token");

  // Fetch all assignments
  const fetchAssignments = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/tests/assigned`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setAssignments(data);
      } else {
        toast.error(data.message || "Failed to load assignments");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  // ✅ Filtered & searched assignments
  const filteredAssignments = useMemo(() => {
    return assignments.filter((a) => {
      const matchesSearch =
        a.user?.name?.toLowerCase().includes(search.toLowerCase()) ||
        a.user?.email?.toLowerCase().includes(search.toLowerCase()) ||
        a.test_master?.title?.toLowerCase().includes(search.toLowerCase()) ||
        String(a.test_id).includes(search);
      const matchesStatus =
        statusFilter === "all" ? true : a.status.toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [assignments, search, statusFilter]);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <h2 className="text-2xl font-bold text-gray-800">
          📋 Assigned Tests <span className="text-sm text-gray-500">({filteredAssignments.length})</span>
        </h2>
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <input
            type="text"
            placeholder="Search by name, email, test…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border px-3 py-2 rounded-md w-full md:w-64 focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border px-3 py-2 rounded-md focus:ring-2 focus:ring-indigo-400 focus:outline-none"
          >
            <option value="all">All Status</option>
            <option value="scheduled">Scheduled</option>
            <option value="in_progress">In Progress</option>
            <option value="passed">Passed</option>
            <option value="failed">Failed</option>
            <option value="under_review">Under Review</option>
          </select>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full text-left text-gray-700">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-3 px-4">#</th>
              <th className="py-3 px-4">Test Name</th>
              <th className="py-3 px-4">Candidate</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Start</th>
              <th className="py-3 px-4">End</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4">Score</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className="py-6 text-center text-gray-500">
                  Loading assignments…
                </td>
              </tr>
            ) : filteredAssignments.length === 0 ? (
              <tr>
                <td colSpan="8" className="py-6 text-center text-gray-500">
                  No assignments found.
                </td>
              </tr>
            ) : (
              filteredAssignments.map((a, idx) => (
                <tr key={a.test_id} className="border-b hover:bg-gray-50 transition-colors">
                  <td className="py-2 px-4">{idx + 1}</td>
                  <td className="py-2 px-4 font-medium">
                    {a.test_master?.title || "—"}{" "}
                    {/* <span className="text-xs text-gray-500">({a.master_test_id})</span> */}
                  </td>
                  <td className="py-2 px-4">{a.user?.name}</td>
                  <td className="py-2 px-4">{a.user?.email}</td>
                  <td className="py-2 px-4">
                    {a.test_master?.scheduled_start
                      ? new Date(a.test_master.scheduled_start).toLocaleString()
                      : "—"}
                  </td>
                  <td className="py-2 px-4">
                    {a.test_master?.scheduled_end
                      ? new Date(a.test_master.scheduled_end).toLocaleString()
                      : "—"}
                  </td>
                  <td className="py-2 px-4 capitalize">{a.status}</td>
                  <td className="py-2 px-4">{a.total_score ?? "—"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden space-y-4">
        {loading ? (
          <p className="text-center text-gray-500">Loading assignments…</p>
        ) : filteredAssignments.length === 0 ? (
          <p className="text-center text-gray-500">No assignments found.</p>
        ) : (
          filteredAssignments.map((a, idx) => (
            <div
              key={a.test_id}
              className="bg-white rounded-lg shadow p-4 space-y-2 border"
            >
              <div className="flex justify-between">
                <span className="font-semibold text-indigo-600">#{idx + 1}</span>
                {/* <span className="text-xs text-gray-500">ID: {a.master_test_id}</span> */}
              </div>
              <div className="font-medium">{a.test_master?.title}</div>
              <div className="text-sm text-gray-600">
                👤 {a.user?.name} | ✉️ {a.user?.email}
              </div>
              <div className="text-sm text-gray-600">
                🕒 Start:{" "}
                {a.test_master?.scheduled_start
                  ? new Date(a.test_master.scheduled_start).toLocaleString()
                  : "—"}
              </div>
              <div className="text-sm text-gray-600">
                ⏳ End:{" "}
                {a.test_master?.scheduled_end
                  ? new Date(a.test_master.scheduled_end).toLocaleString()
                  : "—"}
              </div>
              <div className="flex justify-between items-center text-sm mt-2">
                <span
                  className={`px-2 py-1 rounded-full text-white text-xs ${
                    a.status === "scheduled"
                      ? "bg-blue-500"
                      : a.status === "in_progress"
                      ? "bg-yellow-500"
                      : a.status === "passed"
                      ? "bg-green-500"
                      : a.status === "failed"
                      ? "bg-red-500"
                      : "bg-gray-500"
                  }`}
                >
                  {a.status}
                </span>
                <span className="font-semibold">Score: {a.total_score ?? "—"}</span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AssignedTests;
