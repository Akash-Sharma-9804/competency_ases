import React, { useState, useRef } from "react";
import Navbar from "../components/user/Navbar";
import { Camera, Mic, Volume2 } from "lucide-react";
import { Link } from "react-router-dom";

const SystemCheck = () => {
  const [cameraOn, setCameraOn] = useState(false);
  const [micOn, setMicOn] = useState(false);
  const [micStatus, setMicStatus] = useState("");
  const [speakerStatus, setSpeakerStatus] = useState("");
  const videoRef = useRef(null);
  const audioTestRef = useRef(null);
  const micStreamRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceRef = useRef(null);
 
  // CAMERA start/stop
const handleCamera = async () => {
  if (!cameraOn) {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",           // front camera
          width: { ideal: 1920 },       // ask for higher width
          height: { ideal: 1080 },      // ask for higher height
          aspectRatio: 1,               // square aspect to avoid cropping
        }
      });
      if (videoRef.current) videoRef.current.srcObject = stream;
      setCameraOn(true);
    } catch (err) {
      console.error(err);
      alert("Unable to access camera.");
    }
  } else {
    let tracks = videoRef.current.srcObject?.getTracks();
    tracks?.forEach((track) => track.stop());
    videoRef.current.srcObject = null;
    setCameraOn(false);
  }
};


  // MICROPHONE start/stop with loopback
  const handleMicToggle = async () => {
    if (!micOn) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        micStreamRef.current = stream;
        audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContextRef.current.createMediaStreamSource(stream);
        source.connect(audioContextRef.current.destination);
        sourceRef.current = source;

        setMicOn(true);
        setMicStatus("Microphone active. Speak to hear yourself 🎤🔊");
      } catch (err) {
        console.error(err);
        setMicStatus("Microphone access denied ❌");
      }
    } else {
      micStreamRef.current?.getTracks().forEach((t) => t.stop());
      if (sourceRef.current) {
        try {
          sourceRef.current.disconnect();
        } catch {}
      }
      if (audioContextRef.current) {
        try {
          audioContextRef.current.close();
        } catch {}
      }
      setMicOn(false);
      setMicStatus("Microphone stopped.");
    }
  };

  // SPEAKER test
  const handleSpeaker = () => {
    if (audioTestRef.current) {
      audioTestRef.current.play().then(() => {
        setSpeakerStatus("Playing test sound 🎵");
      });
    }
  };


 

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <Navbar />
      <div className="flex-grow flex items-center justify-center p-4 mt-16 md:p-8">
        <div className="w-full bg-white rounded-2xl shadow-2xl p-6 md:p-10 flex flex-col gap-8">
          <h1 className="text-3xl md:text-4xl font-bold text-center text-gray-800">
            System Check
          </h1>
          <p className="text-center text-gray-600 text-sm md:text-base">
            Before you start your exam, please make sure your camera, microphone, and speakers are working correctly.
          </p>

          {/* CAMERA | SPEAKER | MIC SIDE BY SIDE on large screens */}
        <div className="flex flex-col lg:flex-row gap-6">
  {/* CAMERA */}
  <div className="flex-1 flex flex-col items-center text-center lg:text-left lg:items-start bg-indigo-50 rounded-xl p-6 
                  lg:h-[500px]">
    <Camera className="h-12 w-12 text-indigo-600 mb-4" />
    <h2 className="text-xl font-semibold text-gray-800 mb-2">Camera Test</h2>
    <p className="text-gray-700 text-sm mb-4">
      Click the button to enable your camera. Make sure your image appears below.
    </p>
    <button
      onClick={handleCamera}
      className="bg-indigo-600 hover:bg-indigo-700 cursor-pointer text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
    >
      {cameraOn ? "Stop Camera" : "Start Camera"}
    </button>
    {/* fixed square video container on desktop */}
    <div className="mt-4 rounded-lg overflow-hidden border shadow-inner bg-black 
                    w-full max-w-xs aspect-square lg:w-[400px] lg:h-[400px]">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        className="w-full h-full object-contain"
      />
    </div>
  </div>

  {/* SPEAKER */}
  <div className="flex-1 flex flex-col items-center text-center lg:text-left lg:items-start bg-yellow-50 rounded-xl p-6 
                  lg:h-[500px]">
    <Volume2 className="h-12 w-12 text-yellow-600 mb-4" />
    <h2 className="text-xl font-semibold text-gray-800 mb-2">Speaker Test</h2>
    <p className="text-gray-700 text-sm mb-4">
      Click the button to play a test sound. Ensure you can hear it.
    </p>
    <button
      onClick={handleSpeaker}
      className="bg-yellow-600 hover:bg-yellow-700 cursor-pointer text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
    >
      Play Test Sound
    </button>
    {speakerStatus && (
      <p className="mt-3 text-sm text-gray-700 font-medium">{speakerStatus}</p>
    )}
    <audio
      ref={audioTestRef}
      src="https://actions.google.com/sounds/v1/cartoon/clang_and_wobble.ogg"
    ></audio>
  </div>

  {/* MICROPHONE */}
  <div className="flex-1 flex flex-col items-center text-center lg:text-left lg:items-start bg-green-50 rounded-xl p-6 
                  lg:h-[500px]">
    <Mic className="h-12 w-12 text-green-600 mb-4" />
    <h2 className="text-xl font-semibold text-gray-800 mb-2">Microphone Test</h2>
    <p className="text-gray-700 text-sm mb-4">
      Click start to enable your microphone. Speak into your mic to hear yourself live.
    </p>
    <button
      onClick={handleMicToggle}
      className={`${
        micOn ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
      } text-white cursor-pointer font-medium py-2 px-4 rounded-lg transition-all duration-300`}
    >
      {micOn ? "Stop Microphone" : "Start Microphone"}
    </button>
    {micStatus && (
      <p
        className={`mt-3 text-sm font-medium ${
          micOn ? "text-green-700" : "text-gray-700"
        }`}
      >
        {micStatus}
      </p>
    )}
  </div>
</div>


          {/* ACTION BUTTONS */}
          <div className="flex flex-col md:flex-row justify-center md:justify-end gap-4 mt-6">
            <Link to="/instructions" className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-300">
              Back
            </Link>
            <Link to="/exam" className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-transform transform hover:scale-[1.02] duration-300 shadow-md text-center">
              Proceed to Exam
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemCheck;




