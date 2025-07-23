import React from "react";

const Results = () => {
  const results = [
    { id: 1, exam: "React Fundamentals Test", score: "85%", date: "July 18, 2025", status: "Passed" },
    { id: 2, exam: "System Design Interview", score: "72%", date: "July 10, 2025", status: "Passed" },
    { id: 3, exam: "Drilling Safety Exam", score: "48%", date: "June 25, 2025", status: "Failed" },
  ];

  return (
    <div>
      <h3 className="text-2xl font-bold text-gray-800 mb-6">📊 My Results</h3>
      <div className="bg-white rounded-xl shadow-sm overflow-x-auto">
        <table className="min-w-full text-left">
          <thead>
            <tr className="border-b bg-gray-50">
              <th className="py-3 px-4 font-medium text-gray-700">Exam</th>
              <th className="py-3 px-4 font-medium text-gray-700">Score</th>
              <th className="py-3 px-4 font-medium text-gray-700">Date</th>
              <th className="py-3 px-4 font-medium text-gray-700">Status</th>
            </tr>
          </thead>
          <tbody>
            {results.map((res) => (
              <tr key={res.id} className="border-b hover:bg-gray-50">
                <td className="py-3 px-4">{res.exam}</td>
                <td className="py-3 px-4 font-semibold">{res.score}</td>
                <td className="py-3 px-4">{res.date}</td>
                <td className="py-3 px-4">
                  {res.status === "Passed" ? (
                    <span className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full font-medium">
                      Passed
                    </span>
                  ) : (
                    <span className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-full font-medium">
                      Failed
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Results;
