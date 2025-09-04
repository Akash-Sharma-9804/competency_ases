import { FilesetResolver, FaceLandmarker } from "@mediapipe/tasks-vision";

let faceLandmarker;

export const initMediaPipe = async () => {
  if (!faceLandmarker) {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
    );

    faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath:
          "https://storage.googleapis.com/mediapipe-assets/face_landmarker.task",
      },
      runningMode: "IMAGE",
      numFaces: 1,
    });
  }
};



export const checkPoseInFrontend = async (imgElement, expected = "front") => {
  await initMediaPipe();

  const result = await faceLandmarker.detect(imgElement);
  const face = result?.faceLandmarks?.[0];
if (!face || face.length < 100) return false; // No or partial face


  const nose = face[1];
  const leftEye = face[33];
  const rightEye = face[263];

  const noseX = nose.x;
  const leftX = leftEye.x;
  const rightX = rightEye.x;

  const distLeft = Math.abs(noseX - leftX);
  const distRight = Math.abs(rightX - noseX);
  const ratio = distLeft / distRight;

 if (expected === "front") {
  return ratio > 0.8 && ratio < 1.2; // tighter for center
}
if (expected === "left") {
  return ratio > 1.35; // head turned right
}
if (expected === "right") {
  return ratio < 0.75; // head turned left
}


  return false;
};

export const isImageClear = async (imgElement) => {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  canvas.width = imgElement.width;
  canvas.height = imgElement.height;
  ctx.drawImage(imgElement, 0, 0);

  const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const gray = [];
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    gray.push(avg);
  }

  const mean = gray.reduce((a, b) => a + b, 0) / gray.length;
  const variance = gray.reduce((acc, g) => acc + (g - mean) ** 2, 0) / gray.length;

  return  variance > 120; // you can increase to 100+ for stricter clarity
};
