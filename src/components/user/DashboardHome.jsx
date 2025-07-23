import React from "react";
import { useNavigate } from "react-router-dom";

const DashboardHome = () => {
  const navigate = useNavigate();

  const assignedTests = [
    { id: 1, company: "Rigs.co", role: "Drilling Engineer", status: "Not Started" },
    { id: 2, company: "TechCorp", role: "Software Dev", status: "Completed" },
  ];

  const previousResults = [
    { id: 1, name: "Rigs.co Test", score: "82%", date: "Jan 15, 2025" },
    { id: 2, name: "TechCorp Dev Test", score: "91%", date: "Dec 21, 2024" },
  ];

  return (
    <>
      {/* Assigned Tests */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Assigned Tests</h3>
        <div className="grid md:grid-cols-2 gap-4">
          {assignedTests.map((test) => (
            <div key={test.id} className="bg-white rounded-xl shadow-sm p-4 flex justify-between items-center hover:shadow-md transition">
              <div>
                <p className="font-medium text-gray-800">
                  {test.company} — {test.role}
                </p>
                <p className="text-sm text-gray-500 mt-1">Status: {test.status}</p>
              </div>
              {test.status === "Not Started" && (
                <button
                  onClick={() => navigate("/instructions")}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium"
                >
                  Start Setup
                </button>
              )}
              {test.status === "Completed" && <span className="text-green-600 font-semibold">Completed</span>}
            </div>
          ))}
        </div>
      </section>

      {/* Previous Results */}
      <section className="mb-8">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Previous Results</h3>
        <div className="bg-white rounded-xl shadow-sm p-4 overflow-x-auto">
          <table className="w-full text-left min-w-[400px]">
            <thead>
              <tr className="border-b">
                <th className="py-2 font-medium text-gray-700">Test</th>
                <th className="py-2 font-medium text-gray-700">Score</th>
                <th className="py-2 font-medium text-gray-700">Date</th>
              </tr>
            </thead>
            <tbody>
              {previousResults.map((result) => (
                <tr key={result.id} className="border-b hover:bg-gray-50">
                  <td className="py-2">{result.name}</td>
                  <td className="py-2 font-semibold">{result.score}</td>
                  <td className="py-2">{result.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
};

export default DashboardHome;
