import React from "react";

const Help = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <h3 className="text-2xl font-bold text-gray-800 mb-6">❓ Help & Support</h3>
      <p className="text-gray-600 mb-4">
        If you have questions about your exam setup, profile, or results, our support team is here to help.
      </p>
      <ul className="list-disc list-inside text-gray-700 mb-4">
        <li>Check our FAQ for common questions.</li>
        <li>Email us at <a href="mailto:support@competency.com" className="text-indigo-600 font-medium hover:underline">support@competency.com</a></li>
        <li>Live chat with our support (available 9 AM - 6 PM)</li>
      </ul>
      <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
        Go to Help Center
      </button>
    </div>
  );
};

export default Help;
