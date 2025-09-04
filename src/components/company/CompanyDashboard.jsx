import React, { useEffect, useState } from "react";
import { useNavigate, NavLink, Routes, Route, useLocation } from "react-router-dom";
import {
  Home, FilePlus, BarChart3, Users, User, HelpCircle, LogOut, Menu, X
} from "lucide-react";

import CompanyHome from "./CompanyHome";
import ManageTests from "./ManageTests";
import CompanyResults from "./CompanyResults";
import CandidatesList from "./CandidatesList";
import CompanyProfile from "./CompanyProfile";
import CompanyHelp from "./CompanyHelp";
import AssignedTests from "./AssignedTests";
import CandidateProfile from "./CandidateProfile"; // make sure this import exists

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [company, setCompany] = useState(null);

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/companies/profile`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const data = await res.json();
        if (res.ok) setCompany(data);
      } catch (err) {
        console.error("Error fetching company profile:", err);
      }
    };
    fetchCompanyProfile();
  }, []);

  const menuItems = [
    { id: "", label: "Dashboard", icon: <Home className="w-5 h-5" /> },
    { id: "tests", label: "Manage Tests", icon: <FilePlus className="w-5 h-5" /> },
    { id: "assigned", label: "Assigned Tests", icon: <BarChart3 className="w-5 h-5" /> },
    { id: "results", label: "Results", icon: <BarChart3 className="w-5 h-5" /> },
    { id: "candidates", label: "Candidates", icon: <Users className="w-5 h-5" /> },
    { id: "profile", label: "Profile", icon: <User className="w-5 h-5" /> },
    { id: "help", label: "Help", icon: <HelpCircle className="w-5 h-5" /> },
  ];

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 bg-white shadow-md transform md:translate-x-0 transition-transform duration-200 ease-in-out 
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} w-64 md:w-40 lg:w-64 flex flex-col`}>
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-indigo-600">
              {company ? company.name : "Company Panel"}
            </h1>
            <p className="text-sm text-gray-500">Manage Tests</p>
          </div>
          <button className="md:hidden text-gray-600" onClick={() => setSidebarOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.id}
              to={`/company-dashboard/${item.id}`}
              end={item.id === ""}
              className={({ isActive }) =>
                `w-full flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                  isActive
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow"
                    : "text-gray-700 hover:bg-indigo-50"
                }`
              }>
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="p-4 border-t">
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/", { replace: true });
            }}
            className="w-full flex cursor-pointer items-center space-x-2 px-4 py-2 rounded-lg hover:bg-red-50 text-red-600 font-medium">
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="p-4 md:hidden flex justify-between items-center bg-white shadow">
          <h2 className="text-lg font-bold text-gray-800">Menu</h2>
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
        </header>
        <main className="pt-0 px-6 pb-6 flex-1 overflow-y-auto">
          <Routes>
            <Route path="/" element={<CompanyHome />} />
            <Route path="tests" element={<ManageTests />} />
            <Route path="assigned" element={<AssignedTests />} />
            <Route path="results" element={<CompanyResults />} />
            <Route path="candidates" element={<CandidatesList />} />
            <Route path="candidate/:id" element={<CandidateProfile />} /> {/* ✅ Added this */}
            <Route path="profile" element={<CompanyProfile />} />
            <Route path="help" element={<CompanyHelp />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default CompanyDashboard;
