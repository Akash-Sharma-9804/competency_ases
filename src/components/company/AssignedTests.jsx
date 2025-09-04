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
  <div className="min-h-screen w-full bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4 sm:p-6 lg:p-8">
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
            <span className="text-white text-lg">📋</span>
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
              Assigned Tests
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {filteredAssignments.length} assignment{filteredAssignments.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>
        
        {/* Search and Filter Controls */}
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, email, test…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full sm:w-64 pl-10 pr-4 py-3 bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200 placeholder-gray-400"
            />
          </div>
          
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="appearance-none bg-white/70 backdrop-blur-sm border border-white/20 rounded-xl px-4 py-3 pr-10 focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition-all duration-200 cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="in_progress">In Progress</option>
              <option value="passed">Passed</option>
              <option value="failed">Failed</option>
              <option value="under_review">Under Review</option>
            </select>
            <svg className="absolute right-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">#</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Test Name</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Candidate</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Email</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Start Time</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">End Time</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Status</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700 text-sm uppercase tracking-wider">Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center">
                      <div className="flex items-center justify-center gap-3">
                        <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        <span className="text-gray-500">Loading assignments…</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredAssignments.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="py-12 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                        <span className="text-gray-500">No assignments found</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAssignments.map((a, idx) => (
                    <tr key={a.test_id} className="group hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 transition-all duration-200">
                      <td className="py-4 px-6">
                        <span className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-sm font-semibold text-indigo-600">
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-gray-900">{a.test_master?.title || "—"}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center">
                            <span className="text-indigo-600 font-semibold text-xs">
                              {a.user?.name?.charAt(0)?.toUpperCase() || "?"}
                            </span>
                          </div>
                          <span className="font-medium text-gray-900">{a.user?.name || "—"}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-gray-600">{a.user?.email || "—"}</td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {a.test_master?.scheduled_start
                          ? new Date(a.test_master.scheduled_start).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : "—"}
                      </td>
                      <td className="py-4 px-6 text-sm text-gray-600">
                        {a.test_master?.scheduled_end
                          ? new Date(a.test_master.scheduled_end).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })
                          : "—"}
                      </td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${
                          a.status === "scheduled" ? "bg-blue-100 text-blue-800" :
                          a.status === "in_progress" ? "bg-yellow-100 text-yellow-800" :
                          a.status === "passed" ? "bg-green-100 text-green-800" :
                          a.status === "failed" ? "bg-red-100 text-red-800" :
                          a.status === "under_review" ? "bg-purple-100 text-purple-800" :
                          "bg-gray-100 text-gray-800"
                        }`}>
                          {a.status?.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-semibold text-gray-900">
                          {a.total_score !== null ? `${a.total_score}%` : "—"}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Card View */}
      <div className="lg:hidden space-y-4">
        {loading ? (
          <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-8 text-center">
            <div className="flex items-center justify-center gap-3">
              <div className="w-6 h-6 border-2 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
              <span className="text-gray-500">Loading assignments…</span>
            </div>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="text-gray-500">No assignments found</p>
          </div>
        ) : (
          filteredAssignments.map((a, idx) => (
            <div
              key={a.test_id}
              className="bg-white/70 backdrop-blur-sm rounded-xl shadow-lg border border-white/20 p-5 hover:shadow-xl transition-all duration-300"
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center text-sm font-semibold text-indigo-600">
                    {idx + 1}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium capitalize ${
                    a.status === "scheduled" ? "bg-blue-100 text-blue-800" :
                    a.status === "in_progress" ? "bg-yellow-100 text-yellow-800" :
                    a.status === "passed" ? "bg-green-100 text-green-800" :
                    a.status === "failed" ? "bg-red-100 text-red-800" :
                    a.status === "under_review" ? "bg-purple-100 text-purple-800" :
                    "bg-gray-100 text-gray-800"
                  }`}>
                    {a.status?.replace('_', ' ')}
                  </span>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    Score: {a.total_score !== null ? `${a.total_score}%` : "—"}
                  </div>
                </div>
              </div>

              {/* Test Title */}
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 text-lg mb-1">
                  {a.test_master?.title || "—"}
                </h3>
              </div>

              {/* Candidate Info */}
              <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50/50 rounded-lg">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-indigo-600 font-semibold text-sm">
                    {a.user?.name?.charAt(0)?.toUpperCase() || "?"}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-gray-900 truncate">{a.user?.name || "—"}</div>
                  <div className="text-sm text-gray-600 truncate">{a.user?.email || "—"}</div>
                </div>
              </div>

              {/* Schedule Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 p-2 bg-blue-50/50 rounded-lg">
                  <svg className="w-4 h-4 text-blue-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div className="text-blue-800 font-medium">Start</div>
                    <div className="text-blue-600">
                      {a.test_master?.scheduled_start
                        ? new Date(a.test_master.scheduled_start).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : "—"}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 p-2 bg-purple-50/50 rounded-lg">
                  <svg className="w-4 h-4 text-purple-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div className="text-purple-800 font-medium">End</div>
                    <div className="text-purple-600">
                      {a.test_master?.scheduled_end
                        ? new Date(a.test_master.scheduled_end).toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })
                        : "—"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  </div>
);
};

export default AssignedTests;
