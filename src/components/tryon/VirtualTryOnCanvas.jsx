import React, { useRef, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { FaceTrackingEngine } from '../../utils/faceTracking';
import { BodyTrackingEngine } from '../../utils/bodyTracking';

export const VirtualTryOnCanvas = forwardRef(({
  videoElement,
  imageSource,
  selectedProduct,
  selectedVariation,
  isTracking,
  onPositionUpdate
}, ref) => {
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const faceTrackerRef = useRef(null);
  const bodyTrackerRef = useRef(null);
  const productImageRef = useRef(null);
  const sourceImageRef = useRef(null);
  const [isProductLoaded, setIsProductLoaded] = useState(false);
  const [trackingQuality, setTrackingQuality] = useState('good');
  const performanceRef = useRef({ frameCount: 0, lastTime: Date.now() });

  // Expose canvas ref to parent
  useImperativeHandle(ref, () => overlayCanvasRef.current);

  useEffect(() => {
    faceTrackerRef.current = new FaceTrackingEngine();
    bodyTrackerRef.current = new BodyTrackingEngine();

    return () => {
      if (faceTrackerRef.current) {
        faceTrackerRef.current.dispose();
      }
      if (bodyTrackerRef.current) {
        bodyTrackerRef.current.dispose();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (selectedProduct) {
      loadProductImage();
    }
  }, [selectedProduct, selectedVariation]);

  useEffect(() => {
    if (imageSource && !videoElement) {
      loadSourceImage();
    }
  }, [imageSource]);

  useEffect(() => {
    if (isTracking && (videoElement || sourceImageRef.current) && isProductLoaded) {
      startTracking();
    } else {
      stopTracking();
    }

    return () => {
      stopTracking();
    };
  }, [isTracking, videoElement, imageSource, isProductLoaded]);

  const loadProductImage = () => {
    setIsProductLoaded(false);

    const imageUrl = selectedVariation?.overlay_image_url || selectedProduct?.overlay_image_url;

    if (!imageUrl) {
      console.warn('No product image URL available');
      return;
    }

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      productImageRef.current = img;
      setIsProductLoaded(true);
    };

    img.onerror = (err) => {
      console.error('Failed to load product image:', err);
      setIsProductLoaded(false);
    };

    img.src = imageUrl;
  };

  const loadSourceImage = () => {
    if (!imageSource) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      sourceImageRef.current = img;
    };

    img.onerror = (err) => {
      console.error('Failed to load source image:', err);
    };

    img.src = imageSource;
  };

  const startTracking = async () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    performanceRef.current = { frameCount: 0, lastTime: Date.now() };

    const animate = async () => {
      await detectAndRender();
      
      // Performance monitoring
      performanceRef.current.frameCount++;
      const now = Date.now();
      if (now - performanceRef.current.lastTime > 1000) {
        const fps = performanceRef.current.frameCount;
        performanceRef.current.frameCount = 0;
        performanceRef.current.lastTime = now;
        
        // Update tracking quality based on FPS
        if (fps < 15) {
          setTrackingQuality('poor');
        } else if (fps < 25) {
          setTrackingQuality('fair');
        } else {
          setTrackingQuality('good');
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();
  };

  const stopTracking = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };

  const detectAndRender = async () => {
    const canvas = canvasRef.current;
    const overlayCanvas = overlayCanvasRef.current;

    if (!canvas || !overlayCanvas || !selectedProduct) return;

    const ctx = canvas.getContext('2d');
    const overlayCtx = overlayCanvas.getContext('2d');

    let sourceElement = videoElement || sourceImageRef.current;

    if (!sourceElement) return;

    const width = sourceElement.videoWidth || sourceElement.width || 1280;
    const height = sourceElement.videoHeight || sourceElement.height || 720;

    canvas.width = width;
    canvas.height = height;
    overlayCanvas.width = width;
    overlayCanvas.height = height;

    // Draw source
    ctx.save();
    if (videoElement && isFrontCamera()) {
      ctx.scale(-1, 1);
      ctx.translate(-width, 0);
    }
    ctx.drawImage(sourceElement, 0, 0, width, height);
    ctx.restore();

    // Detect landmarks
    const category = selectedProduct.category;
    const subcategory = selectedProduct.subcategory;

    let landmarks = null;
    let position = null;

    try {
      if (category === 'eyewear' || category === 'accessories' || subcategory === 'jewelry' || subcategory === 'hats') {
        landmarks = await faceTrackerRef.current.detectFace(sourceElement, canvas);
        position = faceTrackerRef.current.calculateProductPosition(landmarks, subcategory || category);
      } else {
        landmarks = await bodyTrackerRef.current.detectBody(sourceElement, canvas);
        position = bodyTrackerRef.current.calculateProductPosition(landmarks, category, subcategory);
      }
    } catch (error) {
      console.error('Detection error:', error);
    }

    // Clear overlay
    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    // Render product overlay
    if (position && productImageRef.current) {
      overlayCtx.save();

      // Mirror for front camera
      if (videoElement && isFrontCamera()) {
        overlayCtx.scale(-1, 1);
        overlayCtx.translate(-width, 0);
      }

      // Apply occlusion based on confidence
      const confidence = position.confidence || 1;
      if (confidence < 0.5) {
        overlayCtx.globalAlpha = 0.5 + (confidence * 0.5);
      } else {
        overlayCtx.globalAlpha = 0.85 + (confidence * 0.15);
      }

      if (subcategory === 'earrings' && position.left && position.right) {
        renderEarrings(overlayCtx, position);
      } else {
        renderProduct(overlayCtx, position);
      }

      overlayCtx.restore();

      if (onPositionUpdate) {
        onPositionUpdate(position);
      }
    }
  };

  const isFrontCamera = () => {
    if (!videoElement || !videoElement.srcObject) return false;
    
    const tracks = videoElement.srcObject.getVideoTracks();
    if (tracks.length === 0) return false;

    const settings = tracks[0].getSettings();
    return settings.facingMode === 'user';
  };

  const renderProduct = (ctx, position) => {
    if (!productImageRef.current) return;

    ctx.save();

    // Translate to position
    ctx.translate(position.x, position.y);

    // Apply rotation
    if (position.rotation && Math.abs(position.rotation) > 0.5) {
      ctx.rotate((position.rotation * Math.PI) / 180);
    }

    // Calculate final size with scale factor
    const scaleFactor = selectedProduct.scale_factor || 1.0;
    const finalWidth = position.width * scaleFactor;
    const finalHeight = position.height * scaleFactor;

    // Apply realistic blending
    const confidence = position.confidence || 1;
    ctx.globalAlpha = Math.max(0.7, 0.85 + (confidence * 0.15));
    
    // Add shadow effect
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 8;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;

    // Apply color tinting if specified
    if (selectedProduct.colorHex) {
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = selectedProduct.colorHex;
      ctx.fillRect(-finalWidth / 2, -finalHeight / 2, finalWidth, finalHeight);
      ctx.globalCompositeOperation = 'source-over';
    }

    // Draw product with enhanced realism
    try {
      ctx.drawImage(
        productImageRef.current,
        -finalWidth / 2,
        -finalHeight / 2,
        finalWidth,
        finalHeight
      );
      
      // Add highlight effect
      const gradient = ctx.createLinearGradient(
        -finalWidth / 2, -finalHeight / 2,
        finalWidth / 2, finalHeight / 2
      );
      gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
      gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
      
      ctx.globalCompositeOperation = 'screen';
      ctx.fillStyle = gradient;
      ctx.fillRect(-finalWidth / 2, -finalHeight / 2, finalWidth, finalHeight);
      
    } catch (error) {
      console.error('Error rendering product:', error);
    }

    ctx.restore();
  };

  const renderEarrings = (ctx, position) => {
    if (!productImageRef.current) return;

    // Left earring
    ctx.save();
    ctx.translate(position.left.x, position.left.y);
    
    if (position.left.rotation) {
      ctx.rotate((position.left.rotation * Math.PI) / 180);
    }

    try {
      ctx.drawImage(
        productImageRef.current,
        -position.left.width / 2,
        -position.left.height / 2,
        position.left.width,
        position.left.height
      );
    } catch (error) {
      console.error('Error rendering left earring:', error);
    }

    ctx.restore();

    // Right earring (mirrored)
    ctx.save();
    ctx.translate(position.right.x, position.right.y);
    
    if (position.right.rotation) {
      ctx.rotate((position.right.rotation * Math.PI) / 180);
    }
    
    ctx.scale(-1, 1);

    try {
      ctx.drawImage(
        productImageRef.current,
        -position.right.width / 2,
        -position.right.height / 2,
        position.right.width,
        position.right.height
      );
    } catch (error) {
      console.error('Error rendering right earring:', error);
    }

    ctx.restore();
  };

  return (
    <div className="relative w-full">
      <canvas ref={canvasRef} className="hidden" />
      <canvas
        ref={overlayCanvasRef}
        className="w-full h-full rounded-lg bg-gray-900"
        style={{ maxHeight: '600px', objectFit: 'contain' }}
      />

      {/* Loading indicator */}
      {!isProductLoaded && selectedProduct && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 rounded-lg">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p className="text-sm">Loading product...</p>
          </div>
        </div>
      )}

      {/* Tracking quality indicator */}
      {isTracking && isProductLoaded && (
        <div className="absolute top-4 left-4 px-3 py-1 bg-black bg-opacity-50 backdrop-blur-sm rounded-full">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              trackingQuality === 'good' ? 'bg-green-500' :
              trackingQuality === 'fair' ? 'bg-yellow-500' :
              'bg-red-500'
            }`} />
            <span className="text-xs text-white font-medium">
              {trackingQuality === 'good' ? 'Tracking' :
               trackingQuality === 'fair' ? 'Tracking (Slow)' :
               'Tracking (Poor)'}
            </span>
          </div>
        </div>
      )}

      {/* Privacy notice */}
      {isTracking && videoElement && (
        <div className="absolute bottom-4 left-4 right-4 px-3 py-2 bg-black bg-opacity-50 backdrop-blur-sm rounded-lg">
          <div className="flex items-start gap-2">
            <svg className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            <p className="text-xs text-white">
              Your video is processed locally on your device. Nothing is uploaded to our servers.
            </p>
          </div>
        </div>
      )}
    </div>
  );
});

VirtualTryOnCanvas.displayName = 'VirtualTryOnCanvas';
