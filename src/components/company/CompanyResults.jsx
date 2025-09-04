import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { Calendar, User, Briefcase, TrendingUp, Award, Clock, Filter } from "lucide-react";

const CompanyResults = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState("all");
  const [selectedRole, setSelectedRole] = useState("all");
  const [animationKey, setAnimationKey] = useState(0);

  const results = [
    { id: 1, candidate: "Alice Johnson", test: "Frontend Dev Test", score: 85, date: "2025-07-18", jobRole: "Frontend Developer", department: "Engineering", experience: "3 years", status: "passed" },
    { id: 2, candidate: "Bob Smith", test: "Backend Dev Test", score: 92, date: "2025-07-15", jobRole: "Backend Developer", department: "Engineering", experience: "5 years", status: "passed" },
    { id: 3, candidate: "Carol Williams", test: "UI/UX Design Test", score: 78, date: "2025-07-20", jobRole: "UI/UX Designer", department: "Design", experience: "2 years", status: "passed" },
    { id: 4, candidate: "David Brown", test: "DevOps Assessment", score: 88, date: "2025-07-22", jobRole: "DevOps Engineer", department: "Engineering", experience: "4 years", status: "passed" },
    { id: 5, candidate: "Eva Davis", test: "Data Science Test", score: 95, date: "2025-07-25", jobRole: "Data Scientist", department: "Analytics", experience: "6 years", status: "passed" },
    { id: 6, candidate: "Frank Miller", test: "Frontend Dev Test", score: 65, date: "2025-07-28", jobRole: "Frontend Developer", department: "Engineering", experience: "1 year", status: "failed" },
    { id: 7, candidate: "Grace Wilson", test: "Product Manager Assessment", score: 82, date: "2025-08-01", jobRole: "Product Manager", department: "Product", experience: "4 years", status: "passed" },
    { id: 8, candidate: "Henry Taylor", test: "QA Testing", score: 90, date: "2025-08-03", jobRole: "QA Engineer", department: "Engineering", experience: "3 years", status: "passed" },
    { id: 9, candidate: "Ivy Anderson", test: "Marketing Strategy Test", score: 75, date: "2025-08-05", jobRole: "Marketing Manager", department: "Marketing", experience: "5 years", status: "passed" },
    { id: 10, candidate: "Jack Thompson", test: "Backend Dev Test", score: 58, date: "2025-08-08", jobRole: "Backend Developer", department: "Engineering", experience: "2 years", status: "failed" },
    { id: 11, candidate: "Kate Moore", test: "Sales Assessment", score: 87, date: "2025-08-10", jobRole: "Sales Representative", department: "Sales", experience: "3 years", status: "passed" },
    { id: 12, candidate: "Liam Garcia", test: "Security Assessment", score: 93, date: "2025-08-12", jobRole: "Security Engineer", department: "Security", experience: "7 years", status: "passed" }
  ];

  const getScoreColor = (score) => {
    if (score >= 90) return "text-green-600 bg-green-50";
    if (score >= 80) return "text-blue-600 bg-blue-50";
    if (score >= 70) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  const getStatusColor = (status) => {
    return status === "passed" ? "text-green-600 bg-green-100" : "text-red-600 bg-red-100";
  };

  // Filter data based on selected filters
  const filteredResults = results.filter(result => {
    const roleMatch = selectedRole === "all" || result.jobRole.toLowerCase().includes(selectedRole.toLowerCase());
    return roleMatch;
  });

  // Pie chart data for pass/fail distribution
  const passFailData = [
    { name: "Passed", value: filteredResults.filter(r => r.status === "passed").length, color: "#10b981" },
    { name: "Failed", value: filteredResults.filter(r => r.status === "failed").length, color: "#ef4444" }
  ];

  // Department distribution data
  const departmentData = filteredResults.reduce((acc, result) => {
    const dept = result.department;
    acc[dept] = (acc[dept] || 0) + 1;
    return acc;
  }, {});

  const departmentPieData = Object.entries(departmentData).map(([dept, count], index) => ({
    name: dept,
    value: count,
    color: ["#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444", "#10b981", "#06b6d4"][index % 6]
  }));

  // Score distribution data
  const scoreRanges = {
    "90-100": filteredResults.filter(r => r.score >= 90).length,
    "80-89": filteredResults.filter(r => r.score >= 80 && r.score < 90).length,
    "70-79": filteredResults.filter(r => r.score >= 70 && r.score < 80).length,
    "60-69": filteredResults.filter(r => r.score >= 60 && r.score < 70).length,
    "Below 60": filteredResults.filter(r => r.score < 60).length
  };

  const scoreDistributionData = Object.entries(scoreRanges).map(([range, count]) => ({
    range,
    count
  }));

  // Calculate statistics
  const averageScore = Math.round(filteredResults.reduce((sum, r) => sum + r.score, 0) / filteredResults.length);
  const passRate = Math.round((filteredResults.filter(r => r.status === "passed").length / filteredResults.length) * 100);

  useEffect(() => {
    setAnimationKey(prev => prev + 1);
  }, [selectedRole]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length > 0) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border">
          <p className="font-semibold">{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div  className="sticky top-0 z-50  bg-gradient-to-br from-slate-50 to-blue-50 w-full">

        
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4 mb-5 py-3 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-3xl"
        >
          <h1 className="text-4xl font-bold  ">
            📊 Company Assessment Results
          </h1>
          <p className="text-white text-lg">Comprehensive overview of candidate performance and analytics</p>
        </motion.div>

        {/* Filters */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6"
        >
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-gray-700">Filters:</span>
            </div>
            <select 
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Roles</option>
              <option value="developer">Developers</option>
              <option value="designer">Designers</option>
              <option value="manager">Managers</option>
              <option value="engineer">Engineers</option>
            </select>
          </div>
        </motion.div>
</div>
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            { title: "Total Candidates", value: filteredResults.length, icon: User, color: "blue" },
            { title: "Average Score", value: `${averageScore}%`, icon: TrendingUp, color: "green" },
            { title: "Pass Rate", value: `${passRate}%`, icon: Award, color: "purple" },
            { title: "Active Tests", value: "12", icon: Clock, color: "orange" }
          ].map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`bg-gradient-to-br from-${stat.color}-50 to-${stat.color}-100 rounded-2xl p-6 shadow-lg border border-${stat.color}-200`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.title}</p>
                  <p className={`text-2xl font-bold text-${stat.color}-600 mt-1`}>{stat.value}</p>
                </div>
                <stat.icon className={`w-8 h-8 text-${stat.color}-500`} />
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Pass/Fail Distribution */}
          <motion.div
            key={`pass-fail-${animationKey}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Award className="w-6 h-6 text-green-500" />
              Pass/Fail Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={passFailData}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={1000}
                  >
                    {passFailData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-4">
              {passFailData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-sm text-gray-600">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Department Distribution */}
          <motion.div
            key={`department-${animationKey}`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <Briefcase className="w-6 h-6 text-blue-500" />
              Department Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={departmentPieData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    animationBegin={200}
                    animationDuration={1000}
                  >
                    {departmentPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {departmentPieData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                  <span className="text-xs text-gray-600">{item.name} ({item.value})</span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Score Distribution */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-purple-500" />
              Score Distribution
            </h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={scoreDistributionData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="range" tick={{ fontSize: 12 }} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>

        {/* Detailed Results Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white rounded-2xl shadow-lg overflow-hidden"
        >
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-500" />
              Detailed Results
            </h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Candidate</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Job Role</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Department</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Test</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Score</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Status</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Experience</th>
                  <th className="py-4 px-6 text-left text-sm font-semibold text-gray-700">Date</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence>
                  {filteredResults.map((result, index) => (
                    <motion.tr
                      key={result.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="font-medium text-gray-900">{result.candidate}</div>
                      </td>
                      <td className="py-4 px-6 text-gray-700">{result.jobRole}</td>
                      <td className="py-4 px-6">
                        <span className="px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                          {result.department}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-700">{result.test}</td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 text-sm font-bold rounded-full ${getScoreColor(result.score)}`}>
                          {result.score}%
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full capitalize ${getStatusColor(result.status)}`}>
                          {result.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-gray-700">{result.experience}</td>
                      <td className="py-4 px-6 text-gray-600">
                        {new Date(result.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default CompanyResults;