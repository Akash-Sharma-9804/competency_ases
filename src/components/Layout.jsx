import React from "react";
import Navbar from "./user/Navbar";

const Layout = ({ children }) => {

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar always visible */}
      <Navbar />
      {/* Add padding top to push content below navbar */}
      <div className="pt-16">{children}</div>
    </div>
  );
};

export default Layout;
