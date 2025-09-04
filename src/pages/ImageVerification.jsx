import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Camera,
  RotateCcw,
  CheckCircle,
  ArrowRight,
  User,
  MoveLeft,
  MoveRight,
  X,
} from "lucide-react";
import toast from "react-hot-toast";
import {
  checkPoseInFrontend,
  initMediaPipe,
  isImageClear,
} from "../utils/poseUtils"; // adjust path

const ImageVerification = () => {
  const [step, setStep] = useState(0); // 0=center, 1=left, 2=right
  const [images, setImages] = useState([null, null, null]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [cameraStream, setCameraStream] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [enlargedImage, setEnlargedImage] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const navigate = useNavigate();

  const positions = [
    {
      name: "Front Face",
      instruction: "Look straight at the camera",
      icon: "👤",
      color: "bg-blue-500",
    },
    {
      name: "Turn Left",
      instruction: "Turn your head to the left",
      icon: <MoveLeft />,
      color: "bg-purple-500",
    },
    {
      name: "Turn Right",
      instruction: "Turn your head to the right",
      icon: <MoveRight />,
      color: "bg-green-500",
    },
  ];

  const startCamera = async () => {
    try {
      // Stop existing stream if any
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });

      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (error) {
      toast.error("Unable to access the camera. Please check permissions.");
    }
  };

  useEffect(() => {
    initMediaPipe();
    startCamera();

    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const captureImage = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);

    setTimeout(async () => {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0);

      const imageData = canvas.toDataURL("image/png");

      const img = new Image();
      img.src = imageData;

      img.onload = async () => {
        const expected = step === 0 ? "front" : step === 1 ? "left" : "right";
        const validPose = await checkPoseInFrontend(img, expected);
        const clearEnough = await isImageClear(img);

        if (!validPose || !clearEnough) {
          toast.error(
            `Please ensure your face is clearly visible and aligned for ${expected} pose`
          );
          setIsCapturing(false);
          return;
        }

        const updatedImages = [...images];
        updatedImages[step] = imageData;
        setImages(updatedImages);
        setIsCapturing(false);
      };
    }, 500);
  };

  const retryStep = () => {
    // Clear current step's image
    const updatedImages = [...images];
    updatedImages[step] = null;
    setImages(updatedImages);
    setIsCapturing(false);

    // Restart camera
    startCamera();
  };

  const nextStep = () => {
    if (step < 2) {
      setStep(step + 1);
    }
  };

  const previousStep = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const proceedToVerification = async () => {
     setIsVerifying(true);
    try {
      for (let i = 0; i < images.length; i++) {
        if (!images[i]) continue;
        const blob = dataURLToBlob(images[i]);
        const formData = new FormData();
        formData.append("image", blob, `face_${i}.png`);
        const testId = localStorage.getItem("testId"); // assuming you stored it
        formData.append(
          "position",
          i === 0 ? "front" : i === 1 ? "left" : "right"
        );
        formData.append("test_id", testId);

        await fetch(
          `${
            import.meta.env.VITE_API_BASE_URL
          }/tests/upload-image-verification`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
            body: formData,
          }
        );
      }

      // After all 3 uploaded, call verification
      const verifyRes = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/tests/verify-image`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ test_id: localStorage.getItem("testId") }),
        }
      );

      const data = await verifyRes.json();
      if (
        data.message === "Verification completed" &&
        data.results?.every((r) => r.passed)
      ) {
        toast.success("Verification successful!");
        setTimeout(() => {
          navigate("/screen-check");
        }, 1000);
      } else {
        toast.error(
          "Verification failed: Some images did not match your profile."
        );
      }
    } catch (err) {
      console.error("Upload or verification failed", err);
      toast.error("Upload or verification failed. Please try again.");
    }finally {
    setIsVerifying(false);
  }
  };

  const dataURLToBlob = (dataURL) => {
    const arr = dataURL.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  };

  const allImagesCaptured = images.every((img) => img !== null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-4 lg:p-6 lg:h-screen lg:overflow-hidden">
      <div className="w-full max-w-lg mx-auto lg:max-w-none lg:mx-0 lg:grid lg:grid-cols-12 lg:gap-6 lg:h-full">
        {/* Left Column - Header & Progress */}
        <div className="lg:col-span-4 lg:flex lg:flex-col lg:justify-center lg:py-4">
          {/* Header */}
          <div className="text-center lg:text-left mb-4 lg:mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 lg:w-12 lg:h-12 bg-blue-100 rounded-full mb-3 lg:mb-4">
              <User className="w-8 h-8 lg:w-6 lg:h-6 text-blue-600" />
            </div>
            <h2 className="text-2xl md:text-3xl lg:text-2xl font-bold text-gray-900 mb-2">
              Face Verification
            </h2>
            <p className="text-gray-600 text-sm md:text-base lg:text-sm">
              Capture your face from 3 different angles
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center lg:justify-start mb-6 lg:mb-8">
            {positions.map((_, index) => (
              <React.Fragment key={index}>
                <div
                  className={`flex items-center justify-center w-8 h-8 md:w-10 md:h-10 lg:w-10 lg:h-10 rounded-full border-2 transition-all cursor-pointer ${
                    images[index]
                      ? "bg-green-500 border-green-500 text-white"
                      : index === step
                      ? "bg-blue-500 border-blue-500 text-white"
                      : "bg-gray-200 border-gray-300 text-gray-400"
                  }`}
                  onClick={() => setStep(index)}>
                  {images[index] ? <CheckCircle size={14} /> : index + 1}
                </div>
                {index < positions.length - 1 && (
                  <div
                    className={`w-8 md:w-12 lg:w-12 h-0.5 mx-2 ${
                      images[index] ? "bg-green-500" : "bg-gray-300"
                    }`}
                  />
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Tips - Desktop Only */}
          <div className="hidden lg:block bg-blue-50 rounded-xl p-4">
            <h4 className="font-semibold text-blue-900 mb-3 text-base">
              💡 Instructions:
            </h4>
            <ul className="text-blue-800 space-y-1 text-sm">
              <li>• Ensure good lighting on your face</li>
              <li>• Keep your face centered in the frame</li>
              <li>• You can click on progress dots to switch between steps</li>
              <li>• Remove glasses if possible for better results</li>
              <li>• Maintain a neutral expression</li>
            </ul>
          </div>
        </div>

        {/* Center Column - Camera */}
        <div className="lg:col-span-5 lg:flex lg:flex-col lg:justify-center lg:py-4">
          <div className="bg-white rounded-2xl p-4 md:p-6 lg:p-4 shadow-lg lg:h-fit">
            {/* Current Step Info */}
            <div className="text-center mb-3 lg:mb-4">
              <div
                className={`inline-flex items-center justify-center w-12 h-12 lg:w-12 lg:h-12 ${positions[step].color} text-white rounded-full mb-3 text-xl lg:text-lg`}>
                {positions[step].icon}
              </div>
              <h3 className="text-lg md:text-xl lg:text-lg font-semibold text-gray-900 mb-2">
                Step {step + 1}: {positions[step].name}
              </h3>
              <p className="text-gray-600 text-sm md:text-base lg:text-sm">
                {positions[step].instruction}
              </p>
            </div>

            {/* Camera View */}
            <div className="relative mb-3 lg:mb-4">
              <div
                className={`relative overflow-hidden rounded-xl shadow-lg ${
                  isCapturing ? "animate-pulse" : ""
                }`}>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full aspect-video bg-black object-cover lg:aspect-square lg:max-h-[50vh]"
                  style={{ transform: "scaleX(-1)" }}
                />

                {isCapturing && (
                  <div className="absolute inset-0 bg-white bg-opacity-20 flex items-center justify-center">
                    <div className="bg-white rounded-full p-3 lg:p-3">
                      <Camera className="w-6 h-6 lg:w-6 lg:h-6 text-gray-600 animate-pulse" />
                    </div>
                  </div>
                )}
              </div>
              <canvas ref={canvasRef} className="hidden" />
            </div>

            {/* Captured Image Preview - Show immediately after capture */}
            {images[step] && (
              <div className="text-center mb-3 lg:mb-4">
                <p className="text-sm lg:text-sm text-gray-600 mb-2">
                  ✅ Captured:
                </p>
                <div className="relative inline-block">
                  <img
                    src={images[step]}
                    alt={`${positions[step].name} captured`}
                    className="w-20 h-20 md:w-24 md:h-24 lg:w-20 lg:h-20 object-cover rounded-full border-4 border-green-200 shadow-md"
                  />
                  <div className="absolute -top-1 -right-1 w-5 h-5 lg:w-5 lg:h-5 bg-green-500 rounded-full flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 lg:w-3 lg:h-3 text-white" />
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="space-y-2 lg:space-y-3">
              {!images[step] ? (
                <button
                  onClick={captureImage}
                  disabled={isCapturing}
                  className="w-full flex cursor-pointer items-center justify-center gap-2 px-6 py-3 lg:py-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-xl transition-all shadow-lg text-sm lg:text-sm">
                  <Camera size={16} />
                  {isCapturing ? "Capturing..." : "Capture Photo"}
                </button>
              ) : (
                <div className="flex gap-3">
                  <button
                    onClick={retryStep}
                    className="flex items-center  cursor-pointer justify-center gap-2 px-4 py-3 lg:py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-xl transition-colors text-sm lg:text-sm">
                    <RotateCcw size={14} />
                    Retry
                  </button>
                  {step < 2 ? (
                    <button
                      onClick={nextStep}
                      className="flex-1 flex items-center   cursor-pointer justify-center gap-2 px-6 py-3 lg:py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-xl transition-all shadow-lg text-sm lg:text-sm">
                      Next Step
                      <ArrowRight size={14} />
                    </button>
                  ) : (
                    <button
                      onClick={proceedToVerification}
                      disabled={!allImagesCaptured}
                      className="flex-1 flex items-center  cursor-pointer justify-center gap-2 px-6 py-3 lg:py-3 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-gray-400 disabled:to-gray-500 text-white font-medium rounded-xl transition-all shadow-lg text-sm lg:text-sm">
                      {isVerifying ? (
                        <>
                          <svg
                            className="w-4 h-4 animate-spin mr-2 text-white"
                            fill="none"
                            viewBox="0 0 24 24">
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8v4l4-4-4-4v4a10 10 0 100 20 10 10 0 010-20z"></path>
                          </svg>
                          Verifying...
                        </>
                      ) : (
                        <>
                          Complete Verification
                          <CheckCircle size={14} />
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            {step > 0 && (
              <div className="mt-2 lg:mt-3">
                <button
                  onClick={previousStep}
                  className="text-sm lg:text-sm  cursor-pointer text-gray-500 hover:text-gray-700 transition-colors">
                  ← Back to previous step
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Summary */}
        <div className="lg:col-span-3 lg:flex lg:flex-col lg:justify-center lg:py-4">
          {/* All Captured Images Summary */}
          <div className="mt-6 lg:mt-0 bg-white rounded-xl p-4 lg:p-4 shadow-lg">
            <h4 className="font-semibold text-gray-900 mb-3 lg:mb-4 text-center text-sm md:text-base lg:text-base">
              Captured Images
            </h4>
            <div className="flex justify-center lg:flex-col lg:space-y-3 gap-4 lg:gap-0">
              {positions.map((pos, index) => (
                <div
                  key={index}
                  className="flex flex-col lg:flex-row items-center lg:items-center lg:gap-3">
                  <div
                    className={`w-16 h-16 md:w-20 md:h-20 lg:w-20 lg:h-20 rounded-full border-2 overflow-hidden cursor-pointer transition-all ${
                      images[index]
                        ? "border-green-500 hover:scale-105"
                        : "border-gray-300"
                    }`}
                    onClick={() => setStep(index)}>
                    {images[index] ? (
                      <img
                        src={images[index]}
                        onClick={() => setEnlargedImage(images[index])}
                        className="w-full h-full object-cover cursor-zoom-in"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400 text-lg lg:text-base">
                        {pos.icon}
                      </div>
                    )}
                  </div>
                  <div className="lg:flex-1 text-center lg:text-left">
                    <span className="text-xs lg:text-sm text-gray-600 mt-1 block">
                      {pos.name}
                    </span>
                    {images[index] && (
                      <div className="flex items-center justify-center lg:justify-start mt-1">
                        <CheckCircle className="w-3 h-3 lg:w-4 lg:h-4 text-green-500" />
                        <span className="text-xs text-green-600 ml-1 hidden lg:inline">
                          Captured
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Tips */}
          <div className="mt-4 lg:hidden bg-blue-50 rounded-xl p-4">
            <h4 className="font-semibold text-blue-900 mb-2 text-sm">
              💡 Tips:
            </h4>
            <ul className="text-xs text-blue-800 space-y-1">
              <li>• Ensure good lighting on your face</li>
              <li>• Keep your face centered in the frame</li>
              <li>• You can click on progress dots to switch between steps</li>
            </ul>
          </div>
        </div>
      </div>
      {enlargedImage && (
        <div
          className="fixed inset-0 z-50 bg-black bg-opacity-70 flex items-center justify-center"
          onClick={() => setEnlargedImage(null)}>
          {/* Prevent inner click from closing */}
          <div className="relative" onClick={(e) => e.stopPropagation()}>
            {/* Close button */}
            <button
              onClick={() => setEnlargedImage(null)}
              className="absolute cursor-pointer top-2 right-2 text-white hover:text-red-500 transition-all">
              <X size={28} />
            </button>

            {/* Image */}
            <img
              src={enlargedImage}
              alt="Enlarged"
              className="max-w-[90vw] max-h-[90vh] rounded-xl shadow-2xl"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageVerification;
