import React, { useRef, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';
import { FiCamera, FiRefreshCw, FiSave, FiArrowLeft } from 'react-icons/fi';

const PhotoCapture = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const webcamRef = useRef(null);
  const [image, setImage] = useState(null);
  const [cameraError, setCameraError] = useState(false);
  const [flash, setFlash] = useState(false);

  const videoConstraints = {
    width: 1280,
    height: 720,
    facingMode: "user"
  };

  const capture = useCallback(() => {
    setFlash(true);
    setTimeout(() => setFlash(false), 300);
    const imageSrc = webcamRef.current.getScreenshot();
    setImage(imageSrc);
  }, [webcamRef]);

  const retake = () => {
    setImage(null);
  };

  const savePhoto = () => {
    const savedPhotos = JSON.parse(localStorage.getItem('employeePhotos') || '{}');
    savedPhotos[id] = image;
    localStorage.setItem('employeePhotos', JSON.stringify(savedPhotos));
    
    // Show success message
    alert('Photo saved successfully!');
    navigate(`/employee/${id}`);
  };

  if (cameraError) {
    return (
      <div className="card text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Camera Error</h2>
        <p className="text-gray-600 mb-6">Unable to access camera. Please make sure you have granted camera permissions.</p>
        <button onClick={() => navigate(`/employee/${id}`)} className="btn-secondary flex items-center gap-2 mx-auto">
          <FiArrowLeft /> Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="card w-full max-w-2xl">
      <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Capture Employee Photo</h2>
      
      <div className="relative mb-6 rounded-xl overflow-hidden shadow-2xl">
        {flash && (
          <div className="absolute inset-0 bg-white animate-pulse z-10"></div>
        )}
        
        {!image ? (
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            onUserMediaError={() => setCameraError(true)}
            className="w-full"
          />
        ) : (
          <img src={image} alt="captured" className="w-full" />
        )}
      </div>

      <div className="flex gap-4 justify-center mb-6">
        {!image ? (
          <button onClick={capture} className="btn-success flex items-center gap-2 px-8 py-4 text-lg">
            <FiCamera /> Take Photo
          </button>
        ) : (
          <>
            <button onClick={retake} className="btn-secondary flex items-center gap-2">
              <FiRefreshCw /> Retake
            </button>
            <button onClick={savePhoto} className="btn-success flex items-center gap-2">
              <FiSave /> Save Photo
            </button>
          </>
        )}
      </div>

      <button 
        onClick={() => navigate(`/employee/${id}`)} 
        className="btn-secondary flex items-center gap-2 mx-auto"
      >
        <FiArrowLeft /> Cancel
      </button>
    </div>
  );
};

export default PhotoCapture;