import React, { useRef, useEffect, useState } from 'react';
import Button from '../ui/Button';

export const WebcamCapture = ({ onCapture, isActive, onToggle }) => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isActive) {
      startWebcam();
    } else {
      stopWebcam();
    }

    return () => {
      stopWebcam();
    };
  }, [isActive]);

  const startWebcam = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setIsLoading(false);
    } catch (err) {
      console.error('Error accessing webcam:', err);
      setError('Unable to access webcam. Please check permissions.');
      setIsLoading(false);
      onToggle(false);
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const handleCapture = () => {
    if (videoRef.current && onCapture) {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;

      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0);

      canvas.toBlob((blob) => {
        onCapture(blob, canvas.toDataURL('image/png'));
      }, 'image/png');
    }
  };

  return (
    <div className="relative w-full">
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Starting webcam...</p>
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex gap-3">
        <Button
          onClick={() => onToggle(!isActive)}
          variant={isActive ? 'outline' : 'default'}
          className="flex-1"
        >
          {isActive ? 'Stop Webcam' : 'Start Webcam'}
        </Button>

        {isActive && (
          <Button
            onClick={handleCapture}
            variant="default"
            className="flex-1"
          >
            Capture Photo
          </Button>
        )}
      </div>
    </div>
  );
};
