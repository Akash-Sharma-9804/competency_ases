import React, { useEffect, useState } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  RadialBarChart,
  RadialBar,
} from "recharts";
import {
  Search,
  Calendar,
  Clock,
  Trophy,
  AlertCircle,
  BookOpen,
  TrendingUp,
  Grid,
  List,
  Target,
  Zap,
  Award,
  Users,
  Activity,
} from "lucide-react";
import toast from "react-hot-toast";
import { userAPI } from "../../utils/api";
import { useNavigate } from "react-router-dom";

const Exams = () => {
  const [exams, setExams] = useState([]);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState("grid");
  const [filterStatus, setFilterStatus] = useState("all");

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

  // Filter exams
  const filtered = exams.filter((e) => {
    const matchesSearch =
      e.test_master?.title.toLowerCase().includes(search.toLowerCase()) ||
      e.company?.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === "all" || e.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Statistics for charts
  const statusStats = exams.reduce((acc, exam) => {
    acc[exam.status] = (acc[exam.status] || 0) + 1;
    return acc;
  }, {});

  const pieData = Object.entries(statusStats).map(([status, count]) => ({
    name: status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase()),
    value: count,
  }));

  // Calculate success rate based on completed exams
  const completedExams = exams.filter(
    (e) => e.status === "passed" || e.status === "failed"
  );
  const successRate =
    completedExams.length > 0
      ? Math.round(((statusStats.passed || 0) / completedExams.length) * 100)
      : 0;

  // Mock data for additional charts (replace with backend data later)
  const performanceData = [
    { month: "Jan", score: 65, tests: 3 },
    { month: "Feb", score: 72, tests: 5 },
    { month: "Mar", score: 78, tests: 4 },
    { month: "Apr", score: 85, tests: 6 },
    { month: "May", score: 82, tests: 3 },
    { month: "Jun", score: 89, tests: 4 },
  ];

  const difficultyData = [
    { difficulty: "Easy", passed: 8, failed: 2, total: 10 },
    { difficulty: "Medium", passed: 12, failed: 5, total: 17 },
    { difficulty: "Hard", passed: 6, failed: 4, total: 10 },
  ];

  const weeklyActivityData = [
    { day: "Mon", tests: 2, hours: 3.5 },
    { day: "Tue", tests: 1, hours: 2.0 },
    { day: "Wed", tests: 3, hours: 4.5 },
    { day: "Thu", tests: 2, hours: 3.0 },
    { day: "Fri", tests: 4, hours: 6.0 },
    { day: "Sat", tests: 1, hours: 1.5 },
    { day: "Sun", tests: 0, hours: 0 },
  ];

  const skillData = [
    { skill: "JavaScript", score: 85, total: 100 },
    { skill: "React", score: 92, total: 100 },
    { skill: "Python", score: 78, total: 100 },
    { skill: "SQL", score: 88, total: 100 },
  ];

  const COLORS = {
    scheduled: "#3B82F6",
    in_progress: "#F59E0B",
    passed: "#10B981",
    failed: "#EF4444",
    under_review: "#8B5CF6",
  };

  const getStatusConfig = (status) => {
    switch (status) {
      case "scheduled":
        return {
          bg: "bg-blue-50",
          border: "border-blue-200",
          text: "text-blue-700",
          icon: Calendar,
        };
      case "in_progress":
        return {
          bg: "bg-amber-50",
          border: "border-amber-200",
          text: "text-amber-700",
          icon: Clock,
        };
      case "passed":
        return {
          bg: "bg-green-50",
          border: "border-green-200",
          text: "text-green-700",
          icon: Trophy,
        };
      case "failed":
        return {
          bg: "bg-red-50",
          border: "border-red-200",
          text: "text-red-700",
          icon: AlertCircle,
        };
      case "under_review":
        return {
          bg: "bg-purple-50",
          border: "border-purple-200",
          text: "text-purple-700",
          icon: BookOpen,
        };
      default:
        return {
          bg: "bg-gray-50",
          border: "border-gray-200",
          text: "text-gray-700",
          icon: BookOpen,
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
        {/* Loading Navbar */}
        <div className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
          <div className="px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="animate-pulse bg-gray-200 h-8 w-48 rounded"></div>
              <div className="flex gap-6">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="animate-pulse bg-gray-200 h-12 w-20 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
        {/* Loading Content */}
        <div className="p-6 max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-white rounded-xl h-64"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Fixed Navbar with Key Metrics */}
      <div className="sticky top-0 z-50    ">
        <div className="px-4 md:px-6 py-4 rounded-2xl bg-white/95 backdrop-blur-md border-b border-gray-200">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                📚 Exam Dashboard
              </h1>
            </div>

            {/* Key Metrics in Navbar */}
            <div className="flex flex-wrap gap-3 lg:gap-6">
              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-blue-500/10 to-blue-600/10 rounded-lg border border-blue-200">
                <BookOpen className="w-5 h-5 text-blue-600" />
                <div className="text-center">
                  <p className="text-xs text-blue-600 font-medium">Total</p>
                  <p className="text-lg font-bold text-blue-700">
                    {exams.length}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-green-500/10 to-green-600/10 rounded-lg border border-green-200">
                <Trophy className="w-5 h-5 text-green-600" />
                <div className="text-center">
                  <p className="text-xs text-green-600 font-medium">Passed</p>
                  <p className="text-lg font-bold text-green-700">
                    {statusStats.passed || 0}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-purple-500/10 to-purple-600/10 rounded-lg border border-purple-200">
                <TrendingUp className="w-5 h-5 text-purple-600" />
                <div className="text-center">
                  <p className="text-xs text-purple-600 font-medium">Success</p>
                  <p className="text-lg font-bold text-purple-700">
                    {successRate}%
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-amber-500/10 to-amber-600/10 rounded-lg border border-amber-200">
                <Clock className="w-5 h-5 text-amber-600" />
                <div className="text-center">
                  <p className="text-xs text-amber-600 font-medium">Pending</p>
                  <p className="text-lg font-bold text-amber-700">
                    {(statusStats.scheduled || 0) +
                      (statusStats.under_review || 0)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
         {/* Search and Filters */}
        <div className="bg-white/80 w-11/12 mx-auto backdrop-blur-sm rounded-2xl p-4 md:p-6 shadow-lg border border-white/20">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <p className="text-gray-600">
                Track your progress and upcoming tests
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by company or test..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none w-full sm:w-64"
                />
              </div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none">
                <option value="all">All Status</option>
                <option value="scheduled">Scheduled</option>
                <option value="in_progress">In Progress</option>
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
                <option value="under_review">Under Review</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="p-4 md:p-6 max-w-7xl mx-auto space-y-6">
       

        {/* Enhanced Analytics Section */}
        {exams.length > 0 && (
          <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {/* Status Distribution */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Target className="w-5 h-5 text-indigo-600" />
                Status Distribution
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value">
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          Object.values(COLORS)[
                            index % Object.keys(COLORS).length
                          ]
                        }
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Performance Trend (Mock Data - Replace with Backend) */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-green-600" />
                Performance Trend
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full ml-auto">
                  Mock Data
                </span>
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis domain={[0, 100]} />
                  <Tooltip
                    formatter={(value) => [`${value}%`, "Average Score"]}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Difficulty Analysis (Mock Data - Replace with Backend) */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-600" />
                Difficulty Analysis
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full ml-auto">
                  Mock Data
                </span>
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={difficultyData} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis type="number" />
                  <YAxis dataKey="difficulty" type="category" width={80} />
                  <Tooltip />
                  <Bar
                    dataKey="passed"
                    stackId="a"
                    fill="#10B981"
                    radius={[0, 4, 4, 0]}
                  />
                  <Bar
                    dataKey="failed"
                    stackId="a"
                    fill="#EF4444"
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Weekly Activity (Mock Data - Replace with Backend) */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-600" />
                Weekly Activity
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full ml-auto">
                  Mock Data
                </span>
              </h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={weeklyActivityData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip formatter={(value) => [`${value}`, "Tests Taken"]} />
                  <Line
                    type="monotone"
                    dataKey="tests"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    dot={{ fill: "#3B82F6", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Skill Breakdown (Mock Data - Replace with Backend) */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-purple-600" />
                Skill Breakdown
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full ml-auto">
                  Mock Data
                </span>
              </h3>
              <div className="space-y-4">
                {skillData.map((skill, index) => (
                  <div key={skill.skill} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-700">
                        {skill.skill}
                      </span>
                      <span className="text-sm text-gray-600">
                        {skill.score}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${skill.score}%` }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievement Summary (Mock Data - Replace with Backend) */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-yellow-600" />
                Achievements
                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full ml-auto">
                  Mock Data
                </span>
              </h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg border border-yellow-200">
                  <Trophy className="w-8 h-8 text-yellow-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Perfect Score</p>
                    <p className="text-sm text-gray-600">
                      Achieved 100% in 3 tests
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <Zap className="w-8 h-8 text-blue-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Speed Demon</p>
                    <p className="text-sm text-gray-600">
                      Completed tests 20% faster
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                  <Award className="w-8 h-8 text-green-600" />
                  <div>
                    <p className="font-semibold text-gray-800">Consistent</p>
                    <p className="text-sm text-gray-600">7-day test streak</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* View Toggle */}
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">
            My Exams ({filtered.length})
          </h2>
          <div className="flex bg-white rounded-lg p-1 shadow-sm border">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "grid"
                  ? "bg-indigo-100 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}>
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 rounded-md transition-colors ${
                viewMode === "list"
                  ? "bg-indigo-100 text-indigo-600"
                  : "text-gray-500 hover:text-gray-700"
              }`}>
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Exams Grid/List */}
        {filtered.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-12 text-center shadow-lg border border-white/20">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-xl text-gray-500">No exams found</p>
            <p className="text-gray-400 mt-2">
              Try adjusting your search or filter criteria
            </p>
          </div>
        ) : (
          <div
            className={
              viewMode === "grid"
                ? "grid gap-6 md:grid-cols-2 lg:grid-cols-3"
                : "space-y-4"
            }>
            {filtered.map((exam) => {
              const countdown = getCountdown(exam.test_master?.scheduled_start);
              const statusConfig = getStatusConfig(exam.status);
              const StatusIcon = statusConfig.icon;

              return (
                <div
                  key={exam.test_id}
                  className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 hover:shadow-xl hover:scale-[1.02] transition-all duration-300 ${
                    viewMode === "list"
                      ? "flex items-center space-x-6"
                      : "flex flex-col"
                  }`}>
                  {viewMode === "grid" ? (
                    <>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">
                            {exam.test_master?.title || "Untitled Test"}
                          </h3>
                          <div className="flex items-center gap-2 mb-2">
                            {exam.company ? (
                              <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                                {exam.company.name}
                              </span>
                            ) : (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                                Mock Test
                              </span>
                            )}
                          </div>
                        </div>
                        <div
                          className={`p-3 rounded-xl ${statusConfig.bg} ${statusConfig.border} border`}>
                          <StatusIcon
                            className={`w-5 h-5 ${statusConfig.text}`}
                          />
                        </div>
                      </div>

                      <div className="space-y-2 mb-4 flex-1">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Start:</span>
                          <span>
                            {exam.test_master?.scheduled_start
                              ? new Date(
                                  exam.test_master.scheduled_start
                                ).toLocaleDateString()
                              : "—"}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>End:</span>
                          <span>
                            {exam.test_master?.scheduled_end
                              ? new Date(
                                  exam.test_master.scheduled_end
                                ).toLocaleDateString()
                              : "—"}
                          </span>
                        </div>
                      </div>

                      {countdown && (
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 mb-4">
                          <p className="text-sm font-medium text-indigo-700 flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            Starts in {countdown}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}`}>
                          {exam.status
                            .replace("_", " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>

                        {!exam.company && exam.status === "scheduled" && (
                          <button
                            onClick={() => navigate(`/instructions`)}
                            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg">
                            Start Now
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div
                        className={`p-4 rounded-xl ${statusConfig.bg} ${statusConfig.border} border`}>
                        <StatusIcon
                          className={`w-6 h-6 ${statusConfig.text}`}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-800 mb-1">
                          {exam.test_master?.title || "Untitled Test"}
                        </h3>
                        <div className="flex items-center gap-2 mb-2">
                          {exam.company ? (
                            <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                              {exam.company.name}
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                              Mock Test
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {exam.test_master?.scheduled_start
                            ? new Date(
                                exam.test_master.scheduled_start
                              ).toLocaleDateString()
                            : "No date set"}
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        {countdown && (
                          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-2">
                            <p className="text-sm font-medium text-indigo-700">
                              {countdown}
                            </p>
                          </div>
                        )}
                        {!exam.company && exam.status === "scheduled" && (
                          <button
                            onClick={() => navigate(`/instructions`)}
                            className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:from-indigo-700 hover:to-purple-700 transition-all duration-200">
                            Start Now
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Exams;
