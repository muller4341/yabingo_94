import { useEffect, useState, useRef } from "react"; 
import { useParams, Link, useNavigate } from "react-router-dom";
import { Button, Spinner, Modal } from 'flowbite-react';
import { HiOutlineExclamationCircle } from "react-icons/hi";
import { useSelector } from "react-redux";
import { ref, uploadBytes, getDownloadURL, getStorage } from "firebase/storage";
import { app } from "../../firebase";
import { log } from "../../assets";
import { useDispatch } from 'react-redux';
import { markAsUploaded } from '../../redux/media/mediaSlice';


const Tasks = () => {
  // State management
  const [showWebcam, setShowWebcam] = useState(false);
  const [capturedFile, setCapturedFile] = useState(null);
  const [previewURL, setPreviewURL] = useState('');
  const [uploadStatus, setUploadStatus] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [cameraMode, setCameraMode] = useState(null); 
  const [stream, setStream] = useState(null);
  const [timer, setTimer] = useState(0);
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState(null);
  const [error, setError] = useState(false);
  const dispatch = useDispatch();
  let recorder = useRef(null);
  let recordedChunks = useRef([]);
  const [devices, setDevices] = useState([]);
  const [currentDeviceId, setCurrentDeviceId] = useState('');
  const [facingMode, setFacingMode] = useState('environment');
  const [isCameraLoading, setIsCameraLoading] = useState(false);// 'environment' or 'user'
  const [videoTracks, setVideoTracks] = useState([]);

  
  
  // Refs
  const timerRef = useRef(null);
  const videoRef = useRef(null);
  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);
  // Router and Redux
  const { postSlug } = useParams();
  const navigate = useNavigate();
  const currentUser = useSelector((state) => state.user.currentUser);
  const storage = getStorage(app);


  
  //   setIsRecording(false);
  //   const mediaStream = await navigator.mediaDevices.getUserMedia({
  //     video: { facingMode: 'environment' },
  //     audio: false
  //   });
  //   setStream(mediaStream);
  //   videoRef.current.srcObject = mediaStream;
  // };
  
  // const openCameraForVideo = async () => {
  //   setIsRecording(false);
  //   const mediaStream = await navigator.mediaDevices.getUserMedia({
  //     video: { facingMode: 'environment' },
  //     audio: true
  //   });
  //   setStream(mediaStream);
  //   videoRef.current.srcObject = mediaStream;
  // };
  // const capturePhoto = () => {
  //   if (!videoRef.current) return;
  //   const video = videoRef.current;
  //   const canvas = document.createElement('canvas');
  //   canvas.width = video.videoWidth;
  //   canvas.height = video.videoHeight;
  //   const ctx = canvas.getContext('2d');
  //   ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
  //   canvas.toBlob(blob => {
  //     if (blob) {
  //       const file = new File([blob], `photo_${Date.now()}.jpg`, { type: 'image/jpeg' });
  //       handleFileSelect(file);
  //     }
  //   }, 'image/jpeg', 0.95);
  
  //   closeCamera();
  // };
  // let recorder;
  // let recordedChunks = [];
  
  // const startRecording = () => {
  //   if (!stream) return;
  //   recordedChunks = [];
  //   recorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' });
  //   recorder.ondataavailable = e => e.data.size && recordedChunks.push(e.data);
  //   recorder.onstop = () => {
  //     const blob = new Blob(recordedChunks, { type: 'video/webm' });
  //     const file = new File([blob], `video_${Date.now()}.webm`, { type: blob.type });
  //     handleFileSelect(file);
  //     closeCamera();
  //   };
  //   recorder.start();
  //   setIsRecording(true);
  //   startTimer();
  // };
  
  // const stopRecording = () => {
  //   recorder && recorder.state === 'recording' && recorder.stop();
  //   setIsRecording(false);
  //   stopTimer();
  // };
  // const closeCamera = () => {
  //   if (stream) {
  //     stream.getTracks().forEach(t => t.stop());
  //     setStream(null);
  //   }
  // };
        
  // Update your openCamera function
// const openCamera = async (mode) => {
//   try {
//     setCameraMode(mode);
//     setIsRecording(false);
    
//     const constraints = {
//       video: { 
//         facingMode: 'environment',
//         width: { ideal: 1280 },  // Reduced from 1920 for better mobile compatibility
//         height: { ideal: 720 }   // Reduced from 1080
//       },
//       audio: mode === 'video'
//     };

//     const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
//     setStream(mediaStream);
    
//     // Add a small delay to ensure video element is ready
//     await new Promise(resolve => setTimeout(resolve, 100));
    
//     if (videoRef.current) {
//       videoRef.current.srcObject = mediaStream;
//       videoRef.current.onloadedmetadata = () => {
//         videoRef.current.play().catch(err => console.error("Video play error:", err));
//       };
//     }
//   } catch (err) {
//     console.error("Camera error:", err);
//     setUploadStatus(`Camera error: ${err.message}`);
//     setCameraMode(null);
//   }
// };

const enumerateDevices = async () => {
  try {
    // First get permission by accessing any camera
    const tempStream = await navigator.mediaDevices.getUserMedia({ video: true });
    
    // Stop the temporary stream immediately
    tempStream.getTracks().forEach(track => track.stop());
    
    // Then enumerate all devices
    const devices = await navigator.mediaDevices.enumerateDevices();
    const videoDevices = devices.filter(d => d.kind === 'videoinput');
    
    setDevices(videoDevices);
    
    if (videoDevices.length > 0) {
      // Try to find rear camera first
      const rearCamera = videoDevices.find(d => 
        d.label.toLowerCase().includes('back') || 
        d.label.toLowerCase().includes('rear') ||
        d.label.toLowerCase().includes('environment')
      );
      
      setCurrentDeviceId(rearCamera?.deviceId || videoDevices[0].deviceId);
    }
  } catch (err) {
    console.error("Device enumeration error:", err);
    setUploadStatus("Could not access camera devices");
  }
};

useEffect(() => {
  enumerateDevices();
}, []);

useEffect(() => {
  enumerateDevices();
}, []);
// Update your openCamera function

const openCamera = async (mode) => {
  if (!currentDeviceId && devices.length === 0) {
    setUploadStatus("No camera devices available");
    return;
  }

  setIsCameraLoading(true);
  try {
    setCameraMode(mode);
    setIsRecording(false);
    
    // Stop existing tracks first
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }

    const constraints = {
      video: { 
        deviceId: { exact: currentDeviceId },
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: facingMode
      },
      audio: mode === 'video'
    };

    const mediaStream = await navigator.mediaDevices.getUserMedia(constraints)
      .catch(err => {
        console.error("Camera access error:", err);
        throw new Error("Could not access the selected camera");
      });

    setStream(mediaStream);
    
    if (videoRef.current) {
      videoRef.current.srcObject = mediaStream;
      videoRef.current.onloadedmetadata = () => {
        videoRef.current.play().catch(err => {
          console.error("Video play error:", err);
          setUploadStatus("Could not start camera preview");
        });
      };
    }
  } catch (err) {
    console.error("Camera initialization error:", err);
    setUploadStatus(err.message || "Camera error");
    setCameraMode(null);
  } finally {
    setIsCameraLoading(false);
  }
};
const flipCamera = async () => {
  if (devices.length < 2) {
    setUploadStatus("Only one camera available");
    return;
  }

  setIsCameraLoading(true);
  try {
    const currentIndex = devices.findIndex(d => d.deviceId === currentDeviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    const nextDevice = devices[nextIndex];
    
    // Determine facing mode from device label
    const isFrontFacing = nextDevice.label.toLowerCase().includes('front') || 
                         nextDevice.label.toLowerCase().includes('user');
    
    setCurrentDeviceId(nextDevice.deviceId);
    setFacingMode(isFrontFacing ? 'user' : 'environment');
    
    // Restart camera with new device
    const currentMode = cameraMode;
    closeCamera();
    await new Promise(resolve => setTimeout(resolve, 100));
    openCamera(currentMode);
  } catch (err) {
    console.error("Camera flip error:", err);
    setUploadStatus("Failed to switch cameras");
  } finally {
    setIsCameraLoading(false);
  }
};

 // Update your closeCamera function
 const closeCamera = () => {
  if (recorder.current && recorder.current.state === 'recording') {
    recorder.current.stop();
  }
  
  if (stream) {
    stream.getTracks().forEach(track => {
      track.stop();
      if (stream.removeTrack) {
        stream.removeTrack(track);
      }
    });
    setStream(null);
  }
  
  if (videoRef.current) {
    videoRef.current.srcObject = null;
  }
  
  setCameraMode(null);
  setIsRecording(false);
  stopTimer();
};
  // Update your capturePhoto function
const capturePhoto = () => {
  const video = videoRef.current;
  if (!video || !stream || video.readyState !== 4) {
    console.error("Video not ready for capture");
    setUploadStatus("Camera not ready. Please try again.");
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  
  try {
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    canvas.toBlob(blob => {
      if (blob) {
        const file = new File([blob], `photo_${Date.now()}.jpg`, { 
          type: 'image/jpeg' 
        });
        handleFileSelect(file);
        closeCamera();
      } else {
        throw new Error("Failed to create image blob");
      }
    }, 'image/jpeg', 0.95);
  } catch (err) {
    console.error("Capture error:", err);
    setUploadStatus("Failed to capture photo");
  }
};


 // Update your startRecording function
const startRecording = () => {
  if (!stream) {
    console.error("No stream available");
    return;
  }
  
  recordedChunks.current = [];
  
  // Try different mimeTypes for better browser compatibility
  const options = { 
    mimeType: MediaRecorder.isTypeSupported('video/webm;codecs=vp9') 
      ? 'video/webm;codecs=vp9' 
      : MediaRecorder.isTypeSupported('video/webm') 
        ? 'video/webm' 
        : 'video/mp4',
    audioBitsPerSecond: 128000,
    videoBitsPerSecond: 2500000
  };
  
  try {
    recorder.current = new MediaRecorder(stream, options);
    
    recorder.current.ondataavailable = (e) => {
      if (e.data.size > 0) {
        recordedChunks.current.push(e.data);
      }
    };
    
    recorder.current.onstop = () => {
      const blob = new Blob(recordedChunks.current, { 
        type: recorder.current.mimeType 
      });
      const fileExt = recorder.current.mimeType.includes('mp4') ? 'mp4' : 'webm';
      const file = new File([blob], `video_${Date.now()}.${fileExt}`, { 
        type: blob.type 
      });
      handleFileSelect(file);
      closeCamera();
    };
    
    recorder.current.onerror = (e) => {
      console.error("Recording error:", e.error);
      setUploadStatus("Recording failed");
      closeCamera();
    };
    
    recorder.current.start(200); // Collect data more frequently
    setIsRecording(true);
    startTimer();
  } catch (err) {
    console.error("MediaRecorder error:", err);
    setUploadStatus(`Recording error: ${err.message}`);
    closeCamera();
  }
};

// Update your stopRecording function
const stopRecording = () => {
  if (recorder.current && recorder.current.state === 'recording') {
    recorder.current.stop();
  }
  setIsRecording(false);
  stopTimer();
};

  // Camera functions
  const startTimer = () => {
    setTimer(0);
    timerRef.current = setInterval(() => {
      setTimer(prev => prev + 1);
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(timerRef.current);
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Prefer rear camera
      });
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Camera access denied:", err);
      setUploadStatus('Error: Camera access denied. Please enable permissions.');
    }
  };

  // File handling
  const handleFileSelect = (file) => {
    if (!file) return;

    // Different size limits for images and videos
    const maxSize = file.type.startsWith('video') ? 
      10 * 1024 * 1024 : // 10MB for videos
      2 * 1024 * 1024;   // 2MB for images

    if (file.size > maxSize) {
      setUploadStatus(`Error: File exceeds ${maxSize/(1024*1024)}MB limit`);
      return;
    }

    setCapturedFile(file);
    setPreviewURL(URL.createObjectURL(file));
    setUploadStatus('');
  };

  const handleUpload = async () => {
    if (!capturedFile) return;

    setUploadStatus('Uploading...');
    
    try {
      // Generate unique filename
      const fileExt = capturedFile.name.split('.').pop();
      const fileName = `task-media/${currentUser._id}/${Date.now()}.${fileExt}`;
      
      const fileRef = ref(storage, fileName);
      const snapshot = await uploadBytes(fileRef, capturedFile);
      const downloadURL = await getDownloadURL(snapshot.ref);

      // Send to backend
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          postId: post._id,
          userId: currentUser._id,
          firstname: currentUser.firstname,
          lastname: currentUser.lastname,
          phoneNumber: currentUser.phoneNumber,
          slug: post.slug,
          url: downloadURL,
          type: capturedFile.type.startsWith("video") ? "video" : "image",
          timestamp: new Date().toISOString()
        })
      });

      if (!response.ok) throw new Error('Upload rejected by server');
      console.log("markAsUploaded",markAsUploaded);
      console.log("postslug",post.slug);
     console.log (" userId:", currentUser?._id,)  
      
      if (post?.slug && currentUser?._id) {
        dispatch(markAsUploaded({ userId: currentUser._id, slug: post.slug }));
      } else {
        console.error('Post slug is undefined');
      }
      setUploadStatus('Upload successful!');
      setTimeout(() => {
        setCapturedFile(null);
        setPreviewURL('');
        setUploadStatus('');
        navigate('/client');
      }, 2000);
    } catch (err) {
      console.error("Upload failed:", err);
      setUploadStatus('Upload failed: ' + (err.message || 'Please try again'));
    }
  };

  const handleWebcamCapture = (file) => {
    handleFileSelect(file);
    setShowWebcam(false);
  };

  // Media preview component
  const MediaPreview = () => (
    <div className="flex flex-col items-center mt-4 w-full h-2/3 bg-white p-0">
      {capturedFile?.type.startsWith('video') ? (
        <video 
          src={previewURL} 
          controls 
          className="w-full h-auto  border rounded-lg mb-2"
        />
      ) : (
        <img
          src={previewURL}
          alt="Preview"
          className="w-100% h-auto max-h-80 object-contain border rounded-lg mb-2 "
        />
      )}
      <div className="flex gap-2 w-full">
        <button
          onClick={() => {
            setCapturedFile(null);
            setPreviewURL('');
          }}
          className="bg-yellow-500 text-white md:px-4 md:py-1 px-2 py-1 flex-1 rounded-lg hover:bg-yellow-600"
        >
          Cancel
        </button>
        <button
  onClick={handleUpload}
  disabled={uploadStatus === 'Uploading...'}
  className={`bg-fuchsia-800 text-white md:px-4 md:py-1 px-2 py-1 flex-1 rounded-lg hover:bg-fuchsia-900 ${
    uploadStatus === 'Uploading...' && 'opacity-50 cursor-not-allowed ' && 'text-fuchsia-800'
  }`}
>
  Confirm 
</button>

      </div>
    </div>
  );

  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/post/getposts?slug=${postSlug}`);
        const data = await res.json();
        
        if (!res.ok || !data.posts?.length) {
          throw new Error(data.message || 'Post not found');
        }
        
        setPost(data.posts[0]);
      } catch (error) {
        console.error('Error fetching post:', error);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [postSlug]);

  useEffect(() => {
    const handlePermissionChange = () => {
      if (stream) {
        stream.getTracks().forEach(track => {
          if (track.readyState === 'ended') {
            // Attempt to restart if permission was granted
            openCamera(cameraMode);
          }
        });
      }
    };
  
    navigator.permissions?.query({ name: 'camera' })
      .then(permissionStatus => {
        permissionStatus.onchange = handlePermissionChange;
      })
      .catch(console.error);
  
    return () => {
      navigator.permissions?.query({ name: 'camera' })
        .then(permissionStatus => {
          permissionStatus.onchange = null;
        })
        .catch(console.error);
    };
  }, [stream, cameraMode]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex items-center justify-center h-screen bg-white">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <strong>Task Not Found!</strong> The task doesn't exist or was removed.
        </div>
      </div>
    );
  }

  return (
    <div 
      className="container mx-auto px-4 py-8 md:py-20 flex flex-col md:flex-row justify-center gap-4 min-h-screen "
      style={{
        backgroundImage: `url(${log})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        hight: 'auto',
        width: '100%',
      }}
    >
      {/* Task Content */}
      <div className="flex flex-col w-full md:w-2/3 border   bg-opacity-90 rounded-lg md:p-4 mt-10 md:mt-0 justify-center h-auto gap-y-1 md:gap-y-4">
        <p className="text-fuchsia-800 font-bold text-center md:text-leftn ">
          {post.category}
        </p>
        
        <div className="flex justify-center md:my-4 my-2">
          <div 
            className="w-full md:p-4 p-1 border border-fuchsia-800 rounded-lg text-fuchsia-800"
            dangerouslySetInnerHTML={{ __html: post.content }} 
          />
        </div>
        
        <div className="flex gap-4 justify-center md:justify-end md:mt-4 mt-2">
          <button  className="bg-fuchsia-800 hover:bg-fuchsia-900 text-white md:w-20 md:h-10 rounded-lg md:text-[18px] text-[12px] w-16 h-8">
          <Link to="/client">
            Previous
            </Link>
          </button>
          <button  className="bg-fuchsia-800 hover:bg-fuchsia-900 text-white md:w-20 md:h-10 rounded-lg md:text-[18px] text-[12px] w-16 h-8">
        <Link to="/client">
            Next
            </Link>
          </button>
        </div>
      </div>

      {/* Media Upload Panel */}
      <div className="flex flex-col w-full md:w-1/3 border  md:p-4 p-2  rounded-lg gap-4 justify-center items-center">
        <div className="border-fuchsia-800  border  text-center rounded-lg md:w-1/3 md:h-1/4 h-1/2  w-1/4 md:p-2 p-8">
         
        </div>
        
        {/* Hidden file inputs */}
        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files?.[0])}
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          capture="environment"
          className="hidden"
          onChange={(e) => handleFileSelect(e.target.files?.[0])}
        />
        
        {/* Action Buttons */}
        {/* <div className="grid grid-cols-2 gap-2">
          <Button 
            onClick={() => photoInputRef.current.click()}
            color="fuchsia"
            className="flex items-center justify-center md:gap-2 gap-1  bg-fuchsia-800 hover:bg-fuchsia-900 text-white md:text-[18px] text-[12px]"
          >
            <span className="md:text-[18px] text-[12px]">📷</span> Photo
          </Button>
          
          <Button 
            onClick={() => videoInputRef.current.click()}
            color="fuchsia"
            className="flex items-center justify-center md:gap-2 gap-1  bg-fuchsia-800 hover:bg-fuchsia-900 text-white md:text-[18px] text-[12px]"
          >
            <span className="md:text-[18px] text-[12px]">🎥</span> Video
          </Button>
          
          <Button 
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*,video/*';
              input.onchange = (e) => handleFileSelect(e.target.files?.[0]);
              input.click();
            }}
            color="fuchsia"
          
            className="col-span-2 flex items-center justify-center gap-2  bg-fuchsia-800 hover:bg-fuchsia-900 text-white md:text-[18px] text-[12px]"
          >
            <span className="md:text-[18px] text-[12px]">📁</span> Choose File
          </Button>
        </div>
         */}
        <div className={`fixed inset-0 z-50 ${!stream ? 'hidden' : 'block'} bg-black`}>
  {/* Loading overlay */}
  {isCameraLoading && (
    <div className="absolute inset-0 flex items-center justify-center bg-black/70 z-10">
      <Spinner size="xl" />
    </div>
  )}
  
  {/* Camera Preview */}
  <video 
    ref={videoRef} 
    autoPlay 
    playsInline 
    muted
    className="absolute inset-0 w-full h-full object-cover"
    style={{ 
      transform: facingMode === 'user' ? 'scaleX(-1)' : 'scaleX(1)'
    }}
  />
  
  {/* Camera Controls */}
  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 z-20">
    <div className="flex flex-col items-center">
      {isRecording && (
        <div className="bg-red-600 text-white px-3 py-1 rounded-full mb-2">
          Recording: {timer}s
        </div>
      )}
      
      <div className="flex justify-center items-center mb-4">
        {cameraMode === 'photo' ? (
          <button
            onClick={capturePhoto}
            className="w-16 h-16 rounded-full bg-white border-4 border-gray-200 focus:outline-none"
          />
        ) : (
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-16 h-16 rounded-full ${isRecording ? 'bg-red-600' : 'bg-white'} border-4 ${isRecording ? 'border-red-400' : 'border-gray-200'} focus:outline-none`}
          />
        )}
      </div>
      
      <div className="flex justify-between w-full px-4">
        <button
          onClick={closeCamera}
          className="text-white text-sm flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        <button
          onClick={flipCamera}
          disabled={devices.length < 2 || isCameraLoading}
          className="text-white text-sm flex items-center disabled:opacity-50"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          <span className="ml-1 text-xs">{facingMode === 'user' ? 'Rear' : 'Front'}</span>
        </button>
      </div>
    </div>
  </div>
</div>
  
      {/* Regular UI (when camera not active) */}
      {!stream && (
        <div className="flex flex-col w-full md:w-1/3 border md:p-4 p-2 rounded-lg gap-4 justify-center items-center">
          {/* ... your existing non-camera UI ... */}
          <div className="grid grid-cols-2 gap-2 w-full">
            <div className="flex gap-2 w-full">
            <Button 
              onClick={() => openCamera('photo')}
              className="flex  flex-1 items-center justify-center gap-1 bg-fuchsia-800 hover:bg-fuchsia-900 text-white  w-24"
            >
              <span>📷</span> Photo
            </Button>
            
            <Button 
              onClick={() => openCamera('video')}
              className="flex flex-1 items-center justify-center gap-1 bg-fuchsia-800 hover:bg-fuchsia-900 text-white px-8   w-24"
            >
              <span>🎥</span> Video
            </Button>
            </div>
            
            <Button 
              onClick={() => photoInputRef.current.click()}
              className="col-span-2 flex items-center justify-center gap-1 bg-fuchsia-800 hover:bg-fuchsia-900 md:w-40 w-30 text-white"
            >
              <span>📁</span> Choose File
            </Button>
          </div>
        </div>
      )}
        

        {/* Preview Section */}
        {previewURL && <MediaPreview  />}
        
        {/* Status Messages */}
        {uploadStatus && (
          <p className={`text-center mt-2 ${
            uploadStatus.includes('Error') ? 'text-red-600' : 'text-green-600'
          }`}>
            {uploadStatus}
          </p>
        )}
      </div>

      {/* Webcam Modal */}
      {showWebcam && (
        <Modal
          show={showWebcam}
          onClose={() => setShowWebcam(false)}
          size="lg"
        >
          <Modal.Header>Webcam Capture</Modal.Header>
          <Modal.Body>
            <div className="p-4">
              <WebcamCapture 
                onCapture={handleWebcamCapture} 
                onClose={() => setShowWebcam(false)}
              />
            </div>
          </Modal.Body>
        </Modal>
      )}
    </div>
  );
};

export default Tasks;
