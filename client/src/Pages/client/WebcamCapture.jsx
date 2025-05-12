import React, { useRef, useState, useEffect } from "react";

const WebcamCapture = ({ onCapture }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  const [mediaStream, setMediaStream] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);

  const startWebcam = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setMediaStream(stream);
    } catch (err) {
      console.error("Webcam error", err);
    }
  };

  useEffect(() => {
    startWebcam();
    return () => stopWebcam(); // Cleanup on unmount
  }, []);

  const stopWebcam = () => {
    if (mediaStream) {
      mediaStream.getTracks().forEach((track) => track.stop());
      setMediaStream(null);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL("image/jpeg");
      setCapturedImage(dataUrl);

      const blob = dataURLtoBlob(dataUrl);
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: "image/jpeg" });

      stopWebcam();
      onCapture(file);
    }
  };

  const dataURLtoBlob = (dataUrl) => {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new Blob([u8arr], { type: mime });
  };

  const reset = () => {
    setCapturedImage(null);
    startWebcam();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {capturedImage ? (
        <div className="relative w-full h-full flex flex-col items-center justify-center">
          <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
          <button
            onClick={reset}
            className="absolute bottom-8 px-6 py-3 bg-white text-black rounded-full shadow-md text-lg"
          >
            Retake
          </button>
        </div>
      ) : (
        <>
          <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover absolute" />
          <canvas ref={canvasRef} className="hidden" />
          <button
            onClick={captureImage}
            className="absolute bottom-8 px-6 py-3 bg-white text-black rounded-full shadow-md text-lg"
          >
            Capture
          </button>
        </>
      )}
    </div>
  );
};

export default WebcamCapture;
