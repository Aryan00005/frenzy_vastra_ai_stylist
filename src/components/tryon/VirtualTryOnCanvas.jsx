import React, { useRef, useEffect, useState } from 'react';
import { FaceTrackingEngine } from '../../utils/faceTracking';
import { BodyTrackingEngine } from '../../utils/bodyTracking';

export const VirtualTryOnCanvas = ({
  videoElement,
  imageSource,
  selectedProduct,
  selectedVariation,
  isTracking,
  onPositionUpdate
}) => {
  const canvasRef = useRef(null);
  const overlayCanvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const faceTrackerRef = useRef(null);
  const bodyTrackerRef = useRef(null);
  const productImageRef = useRef(null);
  const [isProductLoaded, setIsProductLoaded] = useState(false);

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
    if (isTracking && (videoElement || imageSource) && isProductLoaded) {
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

    if (!imageUrl) return;

    const img = new Image();
    img.crossOrigin = 'anonymous';

    img.onload = () => {
      productImageRef.current = img;
      setIsProductLoaded(true);
    };

    img.onerror = () => {
      console.error('Failed to load product image');
      setIsProductLoaded(false);
    };

    img.src = imageUrl;
  };

  const startTracking = async () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    const animate = async () => {
      await detectAndRender();
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

    let sourceElement = videoElement;
    if (!sourceElement && imageSource) {
      const img = new Image();
      img.src = imageSource;
      sourceElement = img;
    }

    if (!sourceElement) return;

    canvas.width = sourceElement.videoWidth || sourceElement.width || 1280;
    canvas.height = sourceElement.videoHeight || sourceElement.height || 720;
    overlayCanvas.width = canvas.width;
    overlayCanvas.height = canvas.height;

    ctx.drawImage(sourceElement, 0, 0, canvas.width, canvas.height);

    const category = selectedProduct.category;
    const subcategory = selectedProduct.subcategory;

    let landmarks = null;
    let position = null;

    if (category === 'eyewear' || category === 'accessories' || subcategory === 'jewelry' || subcategory === 'hats') {
      landmarks = await faceTrackerRef.current.detectFace(sourceElement, canvas);
      position = faceTrackerRef.current.calculateProductPosition(landmarks, subcategory || category);
    } else {
      landmarks = await bodyTrackerRef.current.detectBody(sourceElement, canvas);
      position = bodyTrackerRef.current.calculateProductPosition(landmarks, category, subcategory);
    }

    overlayCtx.clearRect(0, 0, overlayCanvas.width, overlayCanvas.height);

    if (position && productImageRef.current) {
      if (subcategory === 'earrings' && position.left && position.right) {
        renderEarrings(overlayCtx, position);
      } else {
        renderProduct(overlayCtx, position);
      }

      if (onPositionUpdate) {
        onPositionUpdate(position);
      }
    }
  };

  const renderProduct = (ctx, position) => {
    if (!productImageRef.current) return;

    ctx.save();

    ctx.translate(position.x, position.y);

    if (position.rotation) {
      ctx.rotate((position.rotation * Math.PI) / 180);
    }

    const scaleFactor = selectedProduct.scale_factor || 1.0;
    const finalWidth = position.width * scaleFactor;
    const finalHeight = position.height * scaleFactor;

    ctx.globalAlpha = 0.9;

    ctx.drawImage(
      productImageRef.current,
      -finalWidth / 2,
      -finalHeight / 2,
      finalWidth,
      finalHeight
    );

    ctx.restore();
  };

  const renderEarrings = (ctx, position) => {
    if (!productImageRef.current) return;

    ctx.save();
    ctx.globalAlpha = 0.9;

    ctx.translate(position.left.x, position.left.y);
    ctx.rotate((position.left.rotation * Math.PI) / 180);
    ctx.drawImage(
      productImageRef.current,
      -position.left.width / 2,
      -position.left.height / 2,
      position.left.width,
      position.left.height
    );

    ctx.restore();

    ctx.save();
    ctx.translate(position.right.x, position.right.y);
    ctx.rotate((position.right.rotation * Math.PI) / 180);
    ctx.scale(-1, 1);
    ctx.drawImage(
      productImageRef.current,
      -position.right.width / 2,
      -position.right.height / 2,
      position.right.width,
      position.right.height
    );

    ctx.restore();
  };

  return (
    <div className="relative w-full">
      <canvas ref={canvasRef} className="hidden" />
      <canvas
        ref={overlayCanvasRef}
        className="w-full h-full rounded-lg"
        style={{ maxHeight: '600px', objectFit: 'contain' }}
      />

      {!isProductLoaded && selectedProduct && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-50 rounded-lg">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p className="text-sm">Loading product...</p>
          </div>
        </div>
      )}
    </div>
  );
};
