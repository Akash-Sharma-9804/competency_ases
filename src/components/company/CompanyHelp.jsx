import React from "react";

const CompanyHelp = () => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">❓ Help & Support</h2>
      <p className="text-gray-600 mb-4">
        Need help with creating tests or managing candidates? Reach out to our support team.
      </p>
      <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
        Contact Support
      </button>
    </div>
  );
};

export default CompanyHelp;
