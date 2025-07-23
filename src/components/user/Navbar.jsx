import React from "react";

const Navbar = () => {
  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-white/30 backdrop-blur-md border-b border-white/20 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="flex  items-center">
          <img
            src="./logo22.png"
            alt="logo"
            className="h-10 w-auto drop-shadow-md"
          />
        </div>

        {/* (Optional) Add links if needed */}
        {/* <div className="hidden md:flex space-x-6">
          <a href="#" className="text-gray-700 hover:text-indigo-600 text-sm font-medium">Home</a>
          <a href="#" className="text-gray-700 hover:text-indigo-600 text-sm font-medium">About</a>
          <a href="#" className="text-gray-700 hover:text-indigo-600 text-sm font-medium">Contact</a>
        </div> */}
      </div>
    </div>
  );
};

export default Navbar;
