import React from "react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import { ShieldCheck, Video, Eye, MonitorCheck } from "lucide-react";

const Instruction = () => {
  return (
<div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-purple-50">

      <Navbar />

      {/* Main container */}
      <div className="flex-grow flex items-center justify-center p-4 md:p-8">
        <div className="w-full max-w-4xl bg-gradient-to-br from-indigo-50 via-white to-purple-50 backdrop-blur-lg rounded-2xl shadow-2xl p-6 md:p-10 h-[85vh] mt-10 flex flex-col">
          {/* Heading */}
          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800 mb-4">
            Online Competency Test Instructions
          </h1>
          <p className="text-center text-sm text-gray-500 mb-6">
            Please read carefully before starting your exam
          </p>

          {/* Scrollable content */}
          <div className="flex-grow overflow-y-auto pr-2 space-y-8">
            {/* AI Proctoring Notice */}
            <div className="flex flex-col md:flex-row md:items-center md:gap-6 bg-indigo-50 rounded-xl p-5 shadow-inner">
              <div className="flex-shrink-0 flex justify-center mb-4 md:mb-0">
                <Video className="h-12 w-12 text-indigo-600" />
              </div>
              <p className="text-gray-700 text-sm md:text-base">
                <strong>Important:</strong> During this test your <strong>camera</strong> and <strong>screen share</strong> will remain active.
                AI will <strong>ask questions</strong> aloud and monitor your <strong>eye movement, behavior, and tab activity</strong>. 
                Any suspicious movement, tab switching, or attempt to cheat will <span className="font-bold text-red-600">immediately terminate</span> the exam.
              </p>
            </div>

            {/* General Instructions */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <ShieldCheck className="text-green-600" /> General Instructions
              </h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm md:text-base">
                <li>Read each question carefully before answering.</li>
                <li>Answer verbally when prompted by the AI.</li>
                <li>Do not move away from the camera or screen.</li>
                <li>Maintain a stable internet connection throughout.</li>
                <li>Do not refresh or leave the page during the exam.</li>
                <li>Submit your answers before time expires.</li>
              </ul>
            </section>

            {/* Technical Requirements */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <MonitorCheck className="text-blue-600" /> Technical Requirements
              </h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm md:text-base">
                <li>Use a modern browser (Chrome, Edge, Firefox, Safari).</li>
                <li>Ensure camera, microphone, and screen-share permissions are granted.</li>
                <li>Close all unnecessary applications before starting.</li>
                <li>Enable JavaScript in your browser.</li>
              </ul>
            </section>

            {/* AI Proctoring Warnings */}
            <section>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Eye className="text-purple-600" /> AI Proctoring Rules
              </h2>
              <ul className="list-disc list-inside space-y-2 text-gray-700 text-sm md:text-base">
                <li>Your eye movement and body posture are monitored continuously.</li>
                <li>Switching tabs or minimizing the window will auto-eliminate you.</li>
                <li>Looking away from the screen repeatedly may trigger termination.</li>
                <li>Cheating or external help will lead to disqualification.</li>
              </ul>
            </section>
          </div>

          {/* Actions */}
          <div className="flex flex-col md:flex-row justify-center md:justify-end gap-4 mt-6">
            <Link
              to="/"
              className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300 text-center"
            >
              Back to Home
            </Link>
            <Link
              to="/system-check"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-transform transform hover:scale-[1.02] duration-300 shadow-md text-center"
            >
              System Check
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Instruction;
