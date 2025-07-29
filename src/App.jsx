import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// ✅ User-facing pages
import Homepage from "./pages/Homepage";
import Instruction from "./pages/Instruction";
import SystemCheck from "./pages/SystemCheck";
import ExamPage from "./pages/ExamPage";
import ProtectedRoute from "./components/ProtectedRoute";

// ✅ User Dashboard
import UserDashboard from "./components/user/UserDashboard";
// import UserDetails from "./components/user/UserDetails";
import UserSignup from "./components/user/UserSignup";

// ✅ Company Dashboard
import CompanyDashboard from "./components/company/CompanyDashboard";
// import CompanyRegister from "./components/company/CompanyRegister";
import CompanyRegister from "./components/company/CompanyRegister";
import CreateTest from "./components/company/CreateTest";

function App() {
  return (
    <Router>
    
      <Routes>
  {/* 🎯 Public routes */}
  <Route path="/" element={<Homepage />} />
  <Route path="/instructions" element={<Instruction />} />
  <Route path="/system-check" element={<SystemCheck />} />
  <Route path="/exam" element={<ExamPage />} />
  <Route path="/user-signup" element={<UserSignup />} />
  <Route path="/company-register" element={<CompanyRegister />} />

  {/* 👤 User dashboard protected */}
  <Route
    path="/user-dashboard"
    element={
      <ProtectedRoute allowedRole="user">
        <UserDashboard />
      </ProtectedRoute>
    }
  />
  {/* <Route
    path="/user-details"
    element={
      <ProtectedRoute allowedRole="user">
        <UserDetails />
      </ProtectedRoute>
    }
  /> */}

  {/* 🏢 Company dashboard protected */}
  <Route
    path="/company-dashboard"
    element={
      <ProtectedRoute allowedRole="company">
        <CompanyDashboard />
      </ProtectedRoute>
    }
  />
  <Route
  path="/create-test"
  element={
    <ProtectedRoute allowedRole="company">
      <CreateTest />
    </ProtectedRoute>
  }
/>
</Routes>

    </Router>
  );
}

export default App;
