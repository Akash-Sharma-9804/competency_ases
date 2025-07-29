import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home, BookOpen, BarChart3, HelpCircle, LogOut, User, Menu, X,SquarePen 
} from "lucide-react";
import api from "../../utils/api";

// Import sub-components
import DashboardHome from "./UserHome";
import Exams from "./Exams";
import Results from "./Results";
import Profile from "./Profile";
import UserCreateTest from "./UserCreateTest";
import Help from "./Help";
import toast from "react-hot-toast";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // Initialize activeTab from localStorage or default to "dashboard"
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("userActiveTab") || "dashboard";
  });
  const [user, setUser] = useState(null);

  // Save activeTab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("userActiveTab", activeTab);
  }, [activeTab]);

  // Fetch user profile on mount
 useEffect(() => {
  const fetchUserProfile = async () => {
    try {
      const data = await api.get("/users/profile"); // ✅ already JSON
      setUser(data); // ✅ directly use it
    } catch (err) {
      console.error(err);
      toast.error(err.message || "Failed to load profile");
    }
  };
  fetchUserProfile();
}, []);


  const menuItems = [
    { id: "dashboard", icon: <Home className="w-5 h-5" />, label: "Dashboard" },
    { id: "exams", icon: <BookOpen className="w-5 h-5" />, label: "My Exams" },
    { id: "create-test", icon: <SquarePen className="w-5 h-5"  />, label: "Create Test" },

    { id: "results", icon: <BarChart3 className="w-5 h-5" />, label: "Results" },
    { id: "profile", icon: <User className="w-5 h-5" />, label: "Profile" },
    { id: "help", icon: <HelpCircle className="w-5 h-5" />, label: "Help" },
  ];

  const renderMainContent = () => {
    switch (activeTab) {
      case "dashboard": return <DashboardHome user={user} />;
      case "exams": return <Exams />;
      case "create-test": return <UserCreateTest />;

      case "results": return <Results />;
      case "profile": return <Profile />;
      case "help": return <Help />;
      default: return null;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-20 bg-white shadow-md transform md:translate-x-0 transition-transform duration-200 ease-in-out 
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} w-64 flex flex-col`}
      >
        <div className="p-6 border-b flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-indigo-600">
              {user ? `Welcome, ${user.name}` : "Loading…"}
            </h1>
            {user && (
              <p className="text-sm text-gray-500 truncate">{user.email}</p>
            )}
          </div>
          <button className="md:hidden text-gray-600" onClick={() => setSidebarOpen(false)}>
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
              className={`w-full flex items-center cursor-pointer space-x-2 px-4 py-2 rounded-lg text-left transition-all ${
                activeTab === item.id
                  ? "bg-indigo-600 text-white"
                  : "text-gray-700 hover:bg-indigo-50"
              }`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
        <div className="p-4 border-t space-y-2">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/");
            }}
            className="w-full flex items-center space-x-2 px-4 py-2 rounded-lg hover:bg-red-50 text-red-600 font-medium"
          >
            <LogOut className="w-5 h-5" /> <span>Logout</span>
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
        <main className="p-6 flex-1 overflow-y-auto">{renderMainContent()}</main>
      </div>
    </div>
  );
};

export default UserDashboard;
