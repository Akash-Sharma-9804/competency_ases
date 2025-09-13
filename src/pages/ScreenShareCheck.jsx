import React, { useEffect, useRef, useState } from "react";

const ScreenShareCheck = ({ onVerified }) => {
  const screenVideoRef = useRef(null);
  const cameraVideoRef = useRef(null);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        alert("Tab switch detected! Please stay on the test window.");
        setTabSwitchCount(prev => prev + 1);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  const startScreenCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: {
          displaySurface: "monitor", // hint to pick entire screen
          preferCurrentTab: true,
        }
      });
      screenVideoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Screen share error:", err);
      alert("Please share your entire screen to proceed.");
    }
  };

  const startCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      cameraVideoRef.current.srcObject = stream;
    } catch (err) {
      console.error("Camera error:", err);
      alert("Camera access is required to continue.");
    }
  };

 useEffect(() => {
  startCameraCapture(); // only auto-start camera
}, []);


  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-slate-100 flex flex-col items-center justify-center px-4 py-6">
      <div className="w-full max-w-5xl">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 text-gray-800">
          Screen & Camera Check
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Camera */}
          <div className="bg-white p-4 rounded-2xl shadow-lg">
            <h3 className="text-lg font-semibold mb-2 text-center text-gray-700">Camera Preview</h3>
            <video
              ref={cameraVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full aspect-video rounded-xl border"
            />
          </div>

          {/* Screen */}
          <div className="bg-white p-4 rounded-2xl shadow-lg">
            <h3 className="text-lg font-semibold mb-2 text-center text-gray-700">Screen Preview</h3>
            <video
              ref={screenVideoRef}
              autoPlay
              playsInline
              muted
              className="w-full aspect-video rounded-xl border"
            />
          </div>
        </div>

        <div className="flex flex-col items-center">
          <button
  onClick={async () => {
    await startScreenCapture();
    onVerified();
  }}
  className="bg-blue-600 text-white text-lg font-medium px-6 py-3 rounded-xl hover:bg-blue-700 transition-all shadow-md"
>
  ✅ Start Test
</button>

          <p className="text-sm text-red-500 mt-2">
            Tab switch warnings: {tabSwitchCount}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ScreenShareCheck;
