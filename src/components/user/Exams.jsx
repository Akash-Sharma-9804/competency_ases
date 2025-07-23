import React from "react";

const Exams = () => {
  // Example exams data
  const myExams = [
    { id: 1, title: "React Fundamentals Test", company: "TechCorp", status: "In Progress", startDate: "July 22, 2025" },
    { id: 2, title: "Drilling Safety Exam", company: "Rigs.co", status: "Not Started", startDate: "July 25, 2025" },
    { id: 3, title: "System Design Interview", company: "Designify", status: "Completed", startDate: "July 10, 2025" },
  ];

  return (
    <div>
      <h3 className="text-2xl font-bold text-gray-800 mb-6">📘 My Exams</h3>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {myExams.map((exam) => (
          <div key={exam.id} className="bg-white rounded-xl shadow-sm p-5 hover:shadow-md transition">
            <h4 className="font-semibold text-lg text-gray-800">{exam.title}</h4>
            <p className="text-sm text-gray-500 mt-1">Company: {exam.company}</p>
            <p className="text-sm text-gray-500 mt-1">Start Date: {exam.startDate}</p>
            <div className="mt-3">
              {exam.status === "Not Started" && (
                <span className="px-3 py-1 text-sm bg-yellow-100 text-yellow-700 rounded-full font-medium">
                  Not Started
                </span>
              )}
              {exam.status === "In Progress" && (
                <span className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-full font-medium">
                  In Progress
                </span>
              )}
              {exam.status === "Completed" && (
                <span className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-full font-medium">
                  Completed
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Exams;
