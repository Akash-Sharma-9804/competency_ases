import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRole }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role"); // store role in login step

  if (!token) {
    // Not logged in
    return <Navigate to="/" replace />;
  }

  // Optional: if you want to check role for specific routes
  if (allowedRole && role !== allowedRole) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
