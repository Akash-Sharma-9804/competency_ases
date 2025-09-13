import React, { useState, useEffect } from "react";
import { useNavigate, Routes, Route, NavLink, useLocation } from "react-router-dom";
import {
  Home,
  BookOpen,
  BarChart3,
  HelpCircle,
  LogOut,
  User,
  Menu,
  X,
  SquarePen,
} from "lucide-react";
import api from "../../utils/api";
import toast from "react-hot-toast";

// Sub-components
import DashboardHome from "./UserHome";
import UserHome3 from "./UserHome3";
import Exams from "./Exams";
import Results from "./Results";
import Profile from "./Profile";
import UserCreateTest from "./UserCreateTest";
import Help from "./Help";

const UserDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const data = await api.get("/users/profile");
        setUser(data);
      } catch (err) {
        console.error(err);
        toast.error(err.message || "Failed to load profile");
      }
    };
    fetchUserProfile();
  }, []);

  // Ensure proper routing for dashboard home
  useEffect(() => {
    // If user lands on /user-dashboard without trailing slash, add it
    if (location.pathname === '/user-dashboard') {
      navigate('/user-dashboard/', { replace: true });
    }
  }, [location.pathname, navigate]);

  const menuItems = [
    { path: "", icon: <Home className="w-5 h-5" />, label: "Dashboard" },
    // { path: "exams", icon: <BookOpen className="w-5 h-5" />, label: "My Exams" },
    // { path: "create-test", icon: <SquarePen className="w-5 h-5" />, label: "Create Test" },
    // { path: "results", icon: <BarChart3 className="w-5 h-5" />, label: "Results" },
    // { path: "profile", icon: <User className="w-5 h-5" />, label: "Profile" },
    // { path: "help", icon: <HelpCircle className="w-5 h-5" />, label: "Help" },
  ];

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
            <NavLink
              key={item.path}
              to={item.path === "" ? "/user-dashboard/" : `/user-dashboard/${item.path}`}
              end={item.path === ""}
              className={({ isActive }) => {
                // Special handling for dashboard home route
                const isDashboardActive = item.path === "" &&
                  (location.pathname === '/user-dashboard/' || location.pathname === '/user-dashboard');
                
                return `w-full flex items-center space-x-2 px-4 py-2 rounded-lg transition ${
                  isActive || isDashboardActive
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow"
                    : "text-gray-700 hover:bg-indigo-50"
                }`;
              }}
              onClick={() => {
                if (window.innerWidth < 768) setSidebarOpen(false);
              }}
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t space-y-2">
          <button
            onClick={() => {
              localStorage.clear();
              navigate("/user-login");
            }}
            className="w-full flex cursor-pointer items-center space-x-2 px-4 py-2 rounded-lg hover:bg-red-50 text-red-600 font-medium"
          >
            <LogOut className="w-5 h-5" /> <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <header className="p-4 md:hidden flex justify-between items-center bg-white shadow">
          <h2 className="text-lg font-bold text-gray-800">Menu</h2>
          <button onClick={() => setSidebarOpen(true)}>
            <Menu className="w-6 h-6 text-gray-700" />
          </button>
        </header>

        <main className=" pt-0 px-6 pb-6 flex-1 overflow-y-auto">
          <Routes>
            <Route index element={<DashboardHome user={user} />} />
            {/* <Route path="exams" element={<Exams />} /> */}
            <Route path="exams" element={<UserHome3 />} />

            <Route path="create-test" element={<UserCreateTest />} />
            <Route path="results" element={<Results />} />
            <Route path="profile" element={<Profile />} />
            <Route path="help" element={<Help />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
