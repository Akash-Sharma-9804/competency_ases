import React, { useEffect, useState } from "react";

const CompanyHome = () => {
  const [stats, setStats] = useState({ totalTests: 0, totalCandidates: 0, completedTests: 0 });
  const token = localStorage.getItem("token");

 useEffect(() => {
  const fetchStats = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_BASE_URL}/companies/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setStats(data);
    } catch (err) {
      console.error(err);
    }
  };
  fetchStats();
}, []);


  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">🏠 Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
          <p className="text-sm text-gray-500">Total Tests</p>
          <p className="text-3xl font-bold text-indigo-600">{stats.totalTests}</p>
        </div>
       <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
  <p className="text-sm text-gray-500">Total Candidates</p>
  <p className="text-3xl font-bold text-green-600">{stats.totalCandidates}</p>
</div>

        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
          <p className="text-sm text-gray-500">Completed Tests</p>
          <p className="text-3xl font-bold text-blue-600">{stats.completedTests}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow hover:shadow-md transition">
          <p className="text-sm text-gray-500">Upcoming Tests</p>
          <p className="text-3xl font-bold text-yellow-600">–{/* add later */}</p>
        </div>
      </div>
    </div>
  );
};

export default CompanyHome;
