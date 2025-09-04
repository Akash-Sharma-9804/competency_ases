import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

// ✅ User-facing pages
import Homepage from "./pages/Homepage";
import Instruction from "./pages/Instruction";
import SystemCheck from "./pages/SystemCheck";
import ExamPage from "./pages/ExamPage";
import ProtectedRoute from "./components/ProtectedRoute";
import ImageVerification from "./pages/ImageVerification";
import ScreenShareCheck from "./pages/ScreenShareCheck";
// ✅ User Dashboard
import UserDashboard from "./components/user/UserDashboard";
// import UserDetails from "./components/user/UserDetails";
import UserSignup from "./components/user/UserSignup";

// ✅ Company Dashboard
import CompanyDashboard from "./components/company/CompanyDashboard";
// import CompanyRegister from "./components/company/CompanyRegister";
import CompanySignup from "./components/company/CompanySignup";
import CreateTest from "./components/company/CreateTest";

function App() {
  return (
    <Router>
    
      <Routes>
  {/* 🎯 Public routes */}
  <Route path="/" element={<Homepage />} />
  <Route path="/instructions" element={<Instruction />} />
  <Route path="/system-check" element={<SystemCheck />} />
  <Route path="/image-verification" element={<ImageVerification />} />
  <Route path="/screen-check" element={<ScreenShareCheck />} />
  <Route path="/exam" element={<ExamPage />} />
  <Route path="/user-signup" element={<UserSignup />} />
  <Route path="/company-register" element={<CompanySignup />} />

  {/* 👤 User dashboard protected */}
<Route
  path="/user-dashboard/*"
  element={
    <ProtectedRoute allowedRole="user">
      <UserDashboard />
    </ProtectedRoute>
  }
/>

   

  {/* 🏢 Company dashboard protected */}
<Route
  path="/company-dashboard/*"
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
