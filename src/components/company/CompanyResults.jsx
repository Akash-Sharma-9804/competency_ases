import React from "react";

const CompanyResults = () => {
  const results = [
    { id: 1, candidate: "Alice", test: "Frontend Dev Test", score: "85%", date: "July 18, 2025" },
    { id: 2, candidate: "Bob", test: "Backend Dev Test", score: "92%", date: "July 15, 2025" },
  ];
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">📊 Results</h2>
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="min-w-full text-left text-gray-700">
          <thead>
            <tr className="border-b">
              <th className="py-2 px-4">Candidate</th>
              <th className="py-2 px-4">Test</th>
              <th className="py-2 px-4">Score</th>
              <th className="py-2 px-4">Date</th>
            </tr>
          </thead>
          <tbody>
            {results.map((r) => (
              <tr key={r.id} className="border-b hover:bg-gray-50">
                <td className="py-2 px-4">{r.candidate}</td>
                <td className="py-2 px-4">{r.test}</td>
                <td className="py-2 px-4 font-semibold">{r.score}</td>
                <td className="py-2 px-4">{r.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CompanyResults;
