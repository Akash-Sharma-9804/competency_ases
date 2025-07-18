import React, { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";

const ExamPage = () => {
  const [cameraOn, setCameraOn] = useState(false);
  const videoRef = useRef(null);

  // drag state
  const [isDragging, setIsDragging] = useState(false);
  const [pos, setPos] = useState({ x: 20, y: 80 });
  const offset = useRef({ x: 0, y: 0 });

  // handle dragging (only on large screens)
  const handleMouseDown = (e) => {
    if (window.innerWidth >= 1024) {
      setIsDragging(true);
      offset.current = {
        x: e.clientX - pos.x,
        y: e.clientY - pos.y,
      };
    }
  };
  const handleMouseMove = (e) => {
    if (isDragging && window.innerWidth >= 1024) {
      setPos({
        x: e.clientX - offset.current.x,
        y: e.clientY - offset.current.y,
      });
    }
  };
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  // start camera on mount
  useEffect(() => {
    const startCam = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "user",
            width: { ideal: 640 },
            height: { ideal: 480 },
          },
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
        setCameraOn(true);
      } catch (err) {
        console.error("Camera access denied:", err);
      }
    };
    startCam();
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const handleSubmit = () => {
    alert("Test Submitted!");
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-100 overflow-hidden">
      <Navbar />

      <div className="relative flex-grow mt-16 p-2 md:p-4">
        {/* Camera floating window */}
        <div
          className={`
            z-30 rounded-lg overflow-hidden border-2 border-white shadow-xl bg-black
            ${window.innerWidth < 1024 ? "fixed top-20 right-2 w-28 h-28" : ""}
          `}
          style={
            window.innerWidth >= 1024
              ? {
                  position: "fixed",
                  top: pos.y,
                  left: pos.x,
                  width: "160px",
                  height: "160px",
                  cursor: isDragging ? "grabbing" : "grab",
                }
              : {}
          }
          onMouseDown={handleMouseDown}
        >
          {cameraOn ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-white flex items-center justify-center h-full text-sm">
              Camera Off
            </div>
          )}
        </div>

        {/* Full window exam container */}
        <div className="w-full h-full bg-white rounded-2xl shadow-2xl p-4 md:p-8 max-w-5xl mx-auto overflow-y-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            Online Test
          </h1>
          <p className="text-gray-700 mb-6 text-sm md:text-base">
            Read the questions carefully and submit your answers once done.
          </p>

          {/* Questions */}
          <div className="space-y-6">
            <div className="p-4 border rounded-lg bg-gray-50">
              <h2 className="font-semibold text-gray-800 mb-2">
                Question 1:
              </h2>
              <p className="text-gray-700 mb-3">
                What is the capital of France?
              </p>
              <input
                type="text"
                placeholder="Your answer"
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div className="p-4 border rounded-lg bg-gray-50">
              <h2 className="font-semibold text-gray-800 mb-2">
                Question 2:
              </h2>
              <p className="text-gray-700 mb-3">
                Solve: 12 + 8 = ?
              </p>
              <input
                type="text"
                placeholder="Your answer"
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div className="p-4 border rounded-lg bg-gray-50">
              <h2 className="font-semibold text-gray-800 mb-2">
                Question 3:
              </h2>
              <p className="text-gray-700 mb-3">
                Who wrote the play “Romeo and Juliet”?
              </p>
              <input
                type="text"
                placeholder="Your answer"
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSubmit}
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-transform transform hover:scale-[1.02] duration-300 shadow-md text-center"
            >
              Submit Test
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExamPage;
