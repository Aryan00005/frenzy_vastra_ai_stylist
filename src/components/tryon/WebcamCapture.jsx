import React, { useRef, useEffect, useState } from 'react';
import Button from '../ui/Button';

export const WebcamCapture = React.forwardRef(({ onCapture, isActive, onToggle }, ref) => {
  const videoRef = useRef(null);

  // Expose video element to parent
  React.useImperativeHandle(ref, () => videoRef.current);
  const streamRef = useRef(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [permissionState, setPermissionState] = useState('prompt');
  const [isMobile, setIsMobile] = useState(false);
  const [facingMode, setFacingMode] = useState('user');

  useEffect(() => {
    // Detect mobile device
    const checkMobile = /Mobile|Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    setIsMobile(checkMobile);

    // Check camera permission state
    checkPermissionState();
  }, []);

  useEffect(() => {
    if (isActive) {
      startWebcam();
    } else {
      stopWebcam();
    }

    return () => {
      stopWebcam();
    };
  }, [isActive, facingMode]);

  const checkPermissionState = async () => {
    try {
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: 'camera' });
        setPermissionState(result.state);
        
        result.addEventListener('change', () => {
          setPermissionState(result.state);
        });
      }
    } catch (err) {
      console.log('Permission API not supported:', err);
    }
  };

  const startWebcam = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Check if getUserMedia is available
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported in this browser');
      }

      const constraints = {
        video: {
          width: { ideal: isMobile ? 720 : 1280 },
          height: { ideal: isMobile ? 1280 : 720 },
          facingMode: facingMode,
          frameRate: { ideal: 30, max: 60 }
        },
        audio: false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().then(resolve).catch((err) => {
              console.error('Video play failed:', err);
              resolve();
            });
          };
        });
      }

      setPermissionState('granted');
      setIsLoading(false);
    } catch (err) {
      console.error('Error accessing webcam:', err);
      
      let errorMessage = 'Unable to access camera. ';
      
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage += 'Camera permission was denied. Please allow camera access in your browser settings.';
        setPermissionState('denied');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        errorMessage += 'No camera device found. Please connect a camera and try again.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        errorMessage += 'Camera is already in use by another application.';
      } else if (err.name === 'OverconstrainedError') {
        errorMessage += 'Camera does not support the requested settings.';
      } else {
        errorMessage += err.message || 'An unknown error occurred.';
      }
      
      setError(errorMessage);
      setIsLoading(false);
      onToggle(false);
    }
  };

  const stopWebcam = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => {
        track.stop();
      });
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

  const toggleCamera = () => {
    if (isMobile && isActive) {
      setFacingMode(prevMode => prevMode === 'user' ? 'environment' : 'user');
    }
  };

  const requestPermission = () => {
    setError(null);
    onToggle(true);
  };

  return (
    <div className="relative w-full" style={{ display: isActive ? 'block' : 'block' }}>
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-red-900 mb-1">Camera Access Error</p>
              <p className="text-sm text-red-800">{error}</p>
              {permissionState === 'denied' && (
                <p className="text-xs text-red-700 mt-2">
                  To enable camera access: Click the camera icon in your browser's address bar or check your browser settings.
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {permissionState === 'prompt' && !isActive && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <p className="text-sm font-semibold text-blue-900 mb-1">Camera Permission Required</p>
              <p className="text-sm text-blue-800">
                This feature requires access to your camera to provide real-time try-on experience.
                Your video is processed locally and never uploaded to our servers unless you explicitly choose to save.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="relative bg-gray-900 rounded-lg overflow-hidden" style={{ aspectRatio: isMobile ? '9/16' : '16/9' }}>
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
          style={{ transform: facingMode === 'user' ? 'scaleX(-1)' : 'none' }}
        />

        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-75">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Starting camera...</p>
              <p className="text-sm text-gray-400 mt-2">Please allow camera access when prompted</p>
            </div>
          </div>
        )}

        {!isActive && !isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
            <div className="text-white text-center px-4">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <p className="text-lg font-semibold mb-2">Camera Ready</p>
              <p className="text-sm text-gray-400">Click "Start Camera" to begin</p>
            </div>
          </div>
        )}

        {isActive && isMobile && (
          <button
            onClick={toggleCamera}
            className="absolute top-4 right-4 p-3 bg-white bg-opacity-20 hover:bg-opacity-30 backdrop-blur-sm rounded-full transition-all"
            aria-label="Switch camera"
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>

      <div className="mt-4 flex gap-3">
        {!isActive ? (
          <Button
            onClick={requestPermission}
            variant="default"
            className="flex-1"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Start Camera
          </Button>
        ) : (
          <>
            <Button
              onClick={() => onToggle(false)}
              variant="outline"
              className="flex-1"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
              Stop Camera
            </Button>

            <Button
              onClick={handleCapture}
              variant="default"
              className="flex-1"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Capture Photo
            </Button>
          </>
        )}
      </div>
    </div>
  );
});

WebcamCapture.displayName = 'WebcamCapture';
