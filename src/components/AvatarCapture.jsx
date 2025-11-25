import React, { useState, useRef, useEffect } from 'react';

const AvatarCapture = ({ onCapture }) => {
  const [stream, setStream] = useState(null);
  const [captured, setCaptured] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Erreur accès caméra:', error);
      alert('Impossible d\'accéder à la caméra');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      context.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
      setAvatarUrl(dataUrl);
      setCaptured(true);
      stopCamera();
      onCapture(dataUrl);
    }
  };

  const retakePhoto = () => {
    setCaptured(false);
    setAvatarUrl(null);
    startCamera();
  };

  return (
    <div className="avatar-capture">
      {!captured ? (
        <div className="camera-container">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="camera-preview"
          />
          <button onClick={capturePhoto} className="btn-capture">
            📸 Prendre la photo
          </button>
        </div>
      ) : (
        <div className="photo-preview">
          <img src={avatarUrl} alt="Avatar" className="avatar-image" />
          <button onClick={retakePhoto} className="btn-retake">
            🔄 Reprendre
          </button>
        </div>
      )}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

export default AvatarCapture;
