import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import { testAPI, companyAPI } from "../../utils/api";
import {
  Calendar,
  Users,
  CheckCircle,
  Clock,
  Target,
  TrendingUp,
  Award,
  Filter,
  Search,
  Eye,
  Edit,
  Trash2,
  UserPlus,
  Settings,
  BarChart3,
  Star,
} from "lucide-react";
import ViewTest from "../common/ViewTest";

const CompanyHome = ({
  // openViewTest,
  openEditTest,
  handleDelete,
  openAssign,
  openScheduleModal,
}) => {
  const [stats, setStats] = useState({
    totalTests: 0,
    totalCandidates: 0,
    completedTests: 0,
  });
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedRole, setSelectedRole] = useState("all");
  const [showViewTest, setShowViewTest] = useState(false);
  const [selectedTestForView, setSelectedTestForView] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, testsData] = await Promise.all([
          companyAPI.getStats(),
          testAPI.getTests(),
        ]);

        setStats(statsData);
        setTests(testsData);
        setFilteredTests(testsData);
        console.log("Fetched tests:", testsData);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter tests based on active filter, search term, and role
  useEffect(() => {
    let filtered = tests;

    // Filter by status
    if (activeFilter !== "all") {
      if (activeFilter === "completed") {
        filtered = filtered.filter(
          (t) => t.status === "completed" || t.status === "finished"
        );
      } else if (activeFilter === "scheduled") {
        filtered = filtered.filter((t) => t.scheduled_start);
      } else {
        filtered = filtered.filter((t) => t.status === activeFilter);
      }
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(
        (t) =>
          t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.job_role.toLowerCase().includes(searchTerm.toLowerCase()) ||
          t.job_sector.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (selectedRole !== "all") {
      filtered = filtered.filter((t) => t.job_role === selectedRole);
    }

    setFilteredTests(filtered);
  }, [tests, activeFilter, searchTerm, selectedRole]);

  // Get unique roles for filter dropdown
  const uniqueRoles = [...new Set(tests.map((t) => t.job_role))].filter(
    Boolean
  );

  // Process test data for charts
  const processTestData = () => {
    if (!tests.length)
      return {
        statusData: [],
        roleData: [],
        sectorData: [],
        scheduleData: [],
        completionTrend: [],
      };

    // Status distribution
    const statusCounts = tests.reduce((acc, test) => {
      acc[test.status] = (acc[test.status] || 0) + 1;
      return acc;
    }, {});

    const statusData = Object.entries(statusCounts).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count,
      color: getStatusColor(status),
    }));

    // Role distribution (top 8)
    const roleCounts = tests.reduce((acc, test) => {
      acc[test.job_role] = (acc[test.job_role] || 0) + 1;
      return acc;
    }, {});

    const roleData = Object.entries(roleCounts)
      .map(([role, count]) => ({ role: role, count: count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // Sector distribution
    const sectorCounts = tests.reduce((acc, test) => {
      acc[test.job_sector] = (acc[test.job_sector] || 0) + 1;
      return acc;
    }, {});

    const sectorData = Object.entries(sectorCounts)
      .map(([sector, count]) => ({ sector: sector, count: count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    // Scheduled vs Unscheduled
    const scheduledCount = tests.filter((t) => t.scheduled_start).length;
    const unscheduledCount = tests.length - scheduledCount;

    const scheduleData = [
      { name: "Scheduled", value: scheduledCount, color: "#10B981" },
      { name: "Not Scheduled", value: unscheduledCount, color: "#EF4444" },
    ];

    // Completion trend (mock data - you can replace with real date-based data)
    const completionTrend = [
      { month: "Jan", completed: 12, total: 20 },
      { month: "Feb", completed: 18, total: 25 },
      { month: "Mar", completed: 22, total: 30 },
      { month: "Apr", completed: 28, total: 35 },
      { month: "May", completed: 25, total: 32 },
      { month: "Jun", completed: 30, total: 38 },
    ];

    return { statusData, roleData, sectorData, scheduleData, completionTrend };
  };

  const getStatusColor = (status) => {
    const colors = {
      active: "#10B981",
      inactive: "#EF4444",
      draft: "#F59E0B",
      pending: "#8B5CF6",
      completed: "#06B6D4",
      finished: "#06B6D4",
    };
    return colors[status] || "#6B7280";
  };

  const { statusData, roleData, sectorData, scheduleData, completionTrend } =
    processTestData();

  // Enhanced stats with real data
  const enhancedStats = [
    {
      title: "Total Tests",
      value: tests.length,
      icon: Target,
      color: "from-purple-500 to-indigo-600",
      textColor: "text-purple-600",
      trend: "+12%",
    },
    {
      title: "Total Candidates",
      value: stats.totalCandidates,
      icon: Users,
      color: "from-green-500 to-emerald-600",
      textColor: "text-green-600",
      trend: "+8%",
    },
    {
      title: "Completed Tests",
      value: tests.filter(
        (t) => t.status === "completed" || t.status === "finished"
      ).length,
      icon: CheckCircle,
      color: "from-blue-500 to-cyan-600",
      textColor: "text-blue-600",
      trend: "+15%",
    },
    {
      title: "Active Tests",
      value: tests.filter((t) => t.status === "active").length,
      icon: Clock,
      color: "from-orange-500 to-red-600",
      textColor: "text-orange-600",
      trend: "+5%",
    },
  ];

  const filterButtons = [
    { key: "all", label: "All Tests", icon: BarChart3 },
    { key: "active", label: "Active", icon: Target },
    { key: "completed", label: "Completed", icon: CheckCircle },
    { key: "scheduled", label: "Scheduled", icon: Calendar },
    { key: "draft", label: "Draft", icon: Edit },
  ];

  // -------- VIEW TEST FUNCTIONS --------
  // REPLACE the entire openViewTest function with:
  const openViewTest = (testId) => {
    console.log("openViewTest called with testId:", testId); // Debug log
    setSelectedTestForView({ id: testId });
    setShowViewTest(true);
    console.log("State updated - showViewTest:", true); // Debug log
  };

  const closeViewTest = () => {
    setShowViewTest(false);
    setSelectedTestForView(null);
  };
 
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <motion.div
          className="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </div>
    );
  }

  return (
<>

    {showViewTest ? (
  <ViewTest
    isVisible={showViewTest}
    onClose={closeViewTest}
    testData={selectedTestForView}
    testAPI={testAPI}
  />
) : (
  <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="sticky top-0 z-50  bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 py-2">

    
        <motion.div
          className="text-center mb-8 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}>
          <h1 className="text-4xl font-bold   mb-2">
            🏠 Dashboard Overview
          </h1>
          <p className="text-white font-semibold">
            Real-time insights from your test management system
          </p>
        </motion.div>
  {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {enhancedStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: index * 0.1,
                  type: "spring",
                  bounce: 0.4,
                  duration: 0.8,
                }}
                whileHover={{
                  scale: 1.05,
                  y: -5,
                  transition: { type: "spring", bounce: 0.4 },
                }}
                className="relative overflow-hidden cursor-pointer">
                <div
                  className={`bg-gradient-to-br ${stat.color} p-6 rounded-xl shadow-lg text-white relative`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm opacity-90 mb-1">{stat.title}</p>
                      <motion.p
                        className="text-3xl font-bold"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{
                          delay: 0.3 + index * 0.1,
                          type: "spring",
                          bounce: 0.6,
                        }}>
                        {stat.value}
                      </motion.p>
                    </div>
                    <motion.div
                      initial={{ rotate: -180, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      transition={{ delay: 0.4 + index * 0.1, duration: 0.6 }}>
                      <Icon size={32} className="opacity-80" />
                    </motion.div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs opacity-75">Trend:</span>
                    <span className="text-xs font-semibold">{stat.trend}</span>
                  </div>

                  {/* Decorative elements */}
                  <motion.div
                    className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full"
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      delay: index * 0.5,
                    }}
                  />
                  <div className="absolute -bottom-4 -left-4 w-16 h-16 bg-white/5 rounded-full" />
                </div>
              </motion.div>
            );
          })}
        </div>
        {/* Custom Scrollbar Styles */}
        <style>{`
          .custom-scrollbar::-webkit-scrollbar {
            width: 8px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: rgba(0, 0, 0, 0.1);
            border-radius: 10px;
          }
          .custom-scrollbar::-webkit-scrollbar-corner {
            background: transparent;
          }
        `}</style>
    </div>
      

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {/* Test Status Distribution */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 cursor-pointer hover:shadow-xl transition-all duration-300">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="text-purple-500" size={20} />
              Test Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={70}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}>
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Completion Trend */}
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.8 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 cursor-pointer hover:shadow-xl transition-all duration-300">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Star className="text-yellow-500" size={20} />
              Completion Trend
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={completionTrend}>
                <XAxis dataKey="month" stroke="#6b7280" />
                <YAxis stroke="#6b7280" />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="completed"
                  stroke="#10b981"
                  strokeWidth={3}
                  dot={{ fill: "#10b981", r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#6366f1"
                  strokeWidth={3}
                  dot={{ fill: "#6366f1", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Schedule Status */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.8 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 cursor-pointer hover:shadow-xl transition-all duration-300">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Calendar className="text-blue-500" size={20} />
              Schedule Status
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
              <Pie
  data={scheduleData}
  cx="50%"
  cy="50%"
  outerRadius={70}
  dataKey="value"
  label={({ name, value, x, y, fill }) => (
    <text
      x={x}
      y={y + 80} // 👈 push label down a bit
      textAnchor="middle"
      fontSize={15} // 👈 smaller text
      fill={fill}   // 👈 keep slice color (red/green etc.)
    >
      {`${name}: ${value}`}
    </text>
  )}
>
  {scheduleData.map((entry, index) => (
    <Cell key={`cell-${index}`} fill={entry.color} />
  ))}
</Pie>


                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Job Roles and Sectors Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Job Roles Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.8 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 cursor-pointer hover:shadow-xl transition-all duration-300">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Award className="text-green-500" size={20} />
              Tests by Job Role (Top 8)
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={roleData}>
                <XAxis
                  dataKey="role"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="url(#roleGradient)"
                  radius={[4, 4, 0, 0]}
                  className="cursor-pointer"
                />
                <defs>
                  <linearGradient id="roleGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Job Sectors Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.8 }}
            className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 cursor-pointer hover:shadow-xl transition-all duration-300">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <Target className="text-indigo-500" size={20} />
              Tests by Job Sector
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={sectorData}>
                <XAxis
                  dataKey="sector"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  fontSize={12}
                />
                <YAxis />
                <Tooltip />
                <Bar
                  dataKey="count"
                  fill="url(#sectorGradient)"
                  radius={[4, 4, 0, 0]}
                  className="cursor-pointer"
                />
                <defs>
                  <linearGradient
                    id="sectorGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1">
                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#4F46E5" stopOpacity={0.6} />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* All Tests with Filters */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8 }}
          className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
          {/* Header with filters */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6 gap-4">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Filter className="text-orange-500" size={20} />
              All Tests ({filteredTests.length})
            </h3>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search */}
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <input
                  type="text"
                  placeholder="Search tests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              {/* Role Filter */}
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer">
                <option value="all">All Roles</option>
                {uniqueRoles.map((role) => (
                  <option key={role} value={role}>
                    {role}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex flex-wrap gap-2 mb-6">
            {filterButtons.map(({ key, label, icon: Icon }) => (
              <motion.button
                key={key}
                onClick={() => setActiveFilter(key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 cursor-pointer ${
                  activeFilter === key
                    ? "bg-purple-500 text-white shadow-lg"
                    : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                }`}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}>
                <Icon size={16} />
                {label}
              </motion.button>
            ))}
          </div>

          {/* Tests Grid - Scrollable Container */}
          <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
            <AnimatePresence>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 pb-4">
                {filteredTests.map((test, index) => (
                  <motion.div
                    key={test.test_id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ delay: index * 0.05 }}
                    onClick={() => openViewTest(test.test_id)}
                    whileHover={{
                      scale: 1.03,
                      y: -5,
                      transition: { type: "spring", bounce: 0.4 },
                    }}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-lg transition-all duration-300 cursor-pointer bg-white/50 backdrop-blur-sm">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-semibold text-gray-800 truncate flex-1 mr-2">
                        {test.title}
                      </h4>
                      <div className="flex gap-1">
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => openViewTest(test.test_id)}
                          className="p-1 text-gray-400 hover:text-blue-500 cursor-pointer"
                          title="View Test">
                          <Eye size={14} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => openEditTest(test.test_id)}
                          className="p-1 text-gray-400 hover:text-green-500 cursor-pointer"
                          title="Edit Test">
                          <Edit size={14} />
                        </motion.button>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(test.test_id)}
                          className="p-1 text-gray-400 hover:text-red-500 cursor-pointer"
                          title="Delete Test">
                          <Trash2 size={14} />
                        </motion.button>
                      </div>
                    </div>

                    <p className="text-sm text-gray-600 mb-1">
                      {test.job_role}
                    </p>
                    <p className="text-sm text-gray-500 mb-3">
                      {test.job_sector}
                    </p>

                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                          test.status === "active"
                            ? "bg-green-100 text-green-800"
                            : test.status === "inactive"
                            ? "bg-red-100 text-red-800"
                            : test.status === "completed" ||
                              test.status === "finished"
                            ? "bg-blue-100 text-blue-800"
                            : test.status === "draft"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}>
                        {test.status}
                      </span>
                    </div>

                    {test.scheduled_start && (
                      <div className="text-xs text-gray-600 flex items-center gap-1 mb-2">
                        <Calendar size={12} />
                        <span>
                          Start:{" "}
                          {new Date(test.scheduled_start).toLocaleDateString()}
                        </span>
                      </div>
                    )}

                    <div className="flex gap-2 mt-3">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openAssign(test.test_id)}
                        className="flex-1 bg-purple-500 text-white text-xs py-2 px-3 rounded-lg hover:bg-purple-600 cursor-pointer transition-colors"
                        title="Assign Test">
                        <UserPlus size={12} className="inline mr-1" />
                        Assign
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openScheduleModal(test.test_id)}
                        className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        title="Schedule Test">
                        <Settings size={12} />
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>

            {filteredTests.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">
                  No tests found matching your filters.
                </p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
 


      
    </div>
)}

   </>
  );
};

export default CompanyHome;
