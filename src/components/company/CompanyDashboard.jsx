import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  FilePlus,
  BarChart3,
  Users,
  User,
  HelpCircle,
  LogOut,
  Menu,
  X,
} from "lucide-react";

import CompanyHome from "./CompanyHome";
import ManageTests from "./ManageTests";
import CompanyResults from "./CompanyResults";
import Candidates from "./Candidates";
import CompanyProfile from "./CompanyProfile";
import CompanyHelp from "./CompanyHelp";
import AssignedTests from "./AssignedTests";

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [company, setCompany] = useState(null);
  // Initialize activeTab from localStorage or default to "dashboard"
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("companyActiveTab") || "dashboard";
  });

  // Save activeTab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("companyActiveTab", activeTab);
  }, [activeTab]);

  // Fetch company profile on mount
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
        if (res.ok) {
          setCompany(data);
        }
      } catch (err) {
        console.error("Error fetching company profile:", err);
      }
    };
    fetchCompanyProfile();
  }, []);

  const menuItems = [
    { id: "dashboard", label: "Dashboard", icon: <Home className="w-5 h-5" /> },
    {
      id: "tests",
      label: "Manage Tests",
      icon: <FilePlus className="w-5 h-5" />,
    },
     { id: "assigned", label: "Assigned Tests", icon: <BarChart3 className="w-5 h-5" /> }, // ✅ Added
    {
      id: "results",
      label: "Results",
      icon: <BarChart3 className="w-5 h-5" />,
    },
    {
      id: "candidates",
      label: "Candidates",
      icon: <Users className="w-5 h-5" />,
    },
    { id: "profile", label: "Profile", icon: <User className="w-5 h-5" /> },
    { id: "help", label: "Help", icon: <HelpCircle className="w-5 h-5" /> },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return <CompanyHome />;
      case "tests":
        return <ManageTests />;
      case "assigned": // ✅ changed to match menuItems id
        return <AssignedTests />;
      case "results":
        return <CompanyResults />;
      case "candidates":
        return <Candidates />;
      case "profile":
        return <CompanyProfile />;
      case "help":
        return <CompanyHelp />;
      default:
        return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-30 bg-white shadow-md transform md:translate-x-0 transition-transform duration-200 ease-in-out 
        ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } w-64  md:w-40 lg:w-64 flex flex-col`}>
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-indigo-600">
              {company ? company.name : "Company Panel"}
            </h1>
            <p className="text-sm text-gray-500">Manage Tests</p>
          </div>
          <button
            className="md:hidden text-gray-600"
            onClick={() => setSidebarOpen(false)}>
            <X className="w-6 h-6" />
          </button>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (window.innerWidth < 768) setSidebarOpen(false);
              }}
              className={`w-full cursor-pointer flex items-center space-x-2 px-4 py-2 rounded-lg text-left transition ${
                activeTab === item.id
                  ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
                  : "text-gray-700 hover:bg-indigo-50"
              }`}>
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/", { replace: true }); // replace to prevent back navigation
            }}
            className="w-full flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-red-50 text-red-600 font-medium">
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
        <main className="p-6 flex-1 overflow-y-auto">{renderContent()}</main>
      </div>
    </div>
  );
};

export default CompanyDashboard;
