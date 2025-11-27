import { useState } from 'react';

export function useClothSwap() {
  const [resultImage, setResultImage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Try Enhanced Backend API
  const callEnhancedBackend = async (personImageBase64, garmentImageUrl, productData) => {
    try {
      console.log('🤖 Calling Enhanced Backend API...');
      
      const response = await fetch('http://localhost:3001/api/virtual-tryon', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          person_image: personImageBase64,
          garment_image: garmentImageUrl,
          product_info: {
            name: productData.name,
            colorHex: productData.colorHex,
            subcategory: productData.subcategory,
            color: productData.color,
            category: productData.category
          }
        })
      });

      if (response.ok) {
        const result = await response.blob();
        console.log('✅ Enhanced Backend processing successful!');
        return URL.createObjectURL(result);
      } else {
        const errorText = await response.text();
        console.log('❌ Enhanced Backend failed:', errorText);
        throw new Error('Enhanced Backend API failed');
      }
    } catch (error) {
      console.log('❌ Enhanced Backend error:', error);
      throw error;
    }
  };

  // Real Virtual Try-On with Body Detection
  const advancedVirtualTryOn = async (personImageBase64, garmentImageUrl, productData) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      const personImg = new Image();
      const garmentImg = new Image();
      let imagesLoaded = 0;
      
      const processImages = () => {
        if (imagesLoaded < 2) return;
        
        canvas.width = personImg.width;
        canvas.height = personImg.height;
        
        // Draw person
        ctx.drawImage(personImg, 0, 0);
        
        // Advanced body detection
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const landmarks = bodyDetector.detectBodyLandmarks(imageData.data, canvas.width, canvas.height);
        
        // Calculate garment fit
        const productType = productData.subcategory || 'shirt';
        const fitArea = bodyDetector.calculateGarmentFit(landmarks, productType, productData);
        
        // Apply garment with realistic fitting
        applyAdvancedGarment(ctx, garmentImg, fitArea, landmarks, productData);
        
        // Add realistic lighting
        bodyDetector.addBodyLighting(ctx, landmarks, fitArea);
        
        // Add info label
        addInfoLabel(ctx, productData, landmarks);
        
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      
      personImg.onload = () => { imagesLoaded++; processImages(); };
      garmentImg.onload = () => { imagesLoaded++; processImages(); };
      personImg.onerror = () => reject(new Error('Person image failed'));
      garmentImg.onerror = () => reject(new Error('Garment image failed'));
      
      personImg.src = personImageBase64;
      garmentImg.crossOrigin = 'anonymous';
      garmentImg.src = garmentImageUrl;
    });
  };
  

  
  // Apply advanced garment with realistic fitting
  const applyAdvancedGarment = (ctx, garmentImg, fitArea, landmarks, productData) => {
    // Create garment canvas
    const garmentCanvas = document.createElement('canvas');
    const garmentCtx = garmentCanvas.getContext('2d');
    garmentCanvas.width = fitArea.width;
    garmentCanvas.height = fitArea.height;
    
    // Draw and resize garment
    garmentCtx.drawImage(garmentImg, 0, 0, fitArea.width, fitArea.height);
    
    // Apply color tinting
    if (productData.colorHex && productData.colorHex !== '#FFFFFF') {
      garmentCtx.globalCompositeOperation = 'multiply';
      garmentCtx.fillStyle = productData.colorHex;
      garmentCtx.fillRect(0, 0, fitArea.width, fitArea.height);
      garmentCtx.globalCompositeOperation = 'source-over';
    }
    
    // Apply to main canvas with realistic blending
    ctx.save();
    ctx.globalAlpha = 0.88;
    ctx.globalCompositeOperation = 'source-over';
    
    // Apply body deformation
    bodyDetector.applyGarmentDeformation(ctx, garmentCanvas, fitArea, landmarks);
    
    ctx.restore();
  };
  
  // Add information label
  const addInfoLabel = (ctx, productData, landmarks) => {
    // Background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.85)';
    ctx.fillRect(10, 10, 300, 55);
    
    // Title
    ctx.fillStyle = 'white';
    ctx.font = 'bold 15px Arial';
    ctx.fillText('✨ AI Virtual Try-On: ' + productData.name, 20, 32);
    
    // Status
    ctx.font = '12px Arial';
    ctx.fillStyle = '#00FF00';
    ctx.fillText('● Body Detected  ● Garment Fitted  ● Realistic Lighting', 20, 50);
    
    // Confidence indicator
    const confidence = landmarks.torso.width > 50 ? 'High' : 'Medium';
    ctx.fillStyle = confidence === 'High' ? '#00FF00' : '#FFA500';
    ctx.font = '10px Arial';
    ctx.fillText('Fit Quality: ' + confidence, 220, 50);
  };

  // Detect body region using simple computer vision
  const detectBodyRegion = (imageData, width, height) => {
    // Simple skin tone detection and body outline
    const skinPixels = [];
    
    for (let i = 0; i < imageData.length; i += 4) {
      const r = imageData[i];
      const g = imageData[i + 1];
      const b = imageData[i + 2];
      
      // Simple skin tone detection
      if (isSkinTone(r, g, b)) {
        const pixelIndex = i / 4;
        const x = pixelIndex % width;
        const y = Math.floor(pixelIndex / width);
        skinPixels.push({ x, y });
      }
    }
    
    // Calculate body bounds
    if (skinPixels.length === 0) {
      // Fallback to center region
      return {
        top: height * 0.2,
        bottom: height * 0.8,
        left: width * 0.3,
        right: width * 0.7,
        centerX: width / 2,
        centerY: height / 2
      };
    }
    
    const minX = Math.min(...skinPixels.map(p => p.x));
    const maxX = Math.max(...skinPixels.map(p => p.x));
    const minY = Math.min(...skinPixels.map(p => p.y));
    const maxY = Math.max(...skinPixels.map(p => p.y));
    
    return {
      top: minY,
      bottom: maxY,
      left: minX,
      right: maxX,
      centerX: (minX + maxX) / 2,
      centerY: (minY + maxY) / 2
    };
  };

  // Simple skin tone detection
  const isSkinTone = (r, g, b) => {
    return (
      r > 95 && g > 40 && b > 20 &&
      Math.max(r, g, b) - Math.min(r, g, b) > 15 &&
      Math.abs(r - g) > 15 && r > g && r > b
    );
  };

  // Apply garment with proper blending and fitting
  const applyGarmentWithBlending = (ctx, garmentImg, bodyRegion, productData) => {
    const { top, bottom, left, right, centerX, centerY } = bodyRegion;
    
    // Calculate garment placement based on product type
    let garmentTop, garmentBottom, garmentLeft, garmentRight;
    
    const productName = productData.name.toLowerCase();
    
    if (productName.includes('dress')) {
      garmentTop = top + (bottom - top) * 0.1;
      garmentBottom = bottom - (bottom - top) * 0.1;
      garmentLeft = left + (right - left) * 0.1;
      garmentRight = right - (right - left) * 0.1;
    } else if (productName.includes('jacket') || productName.includes('blazer')) {
      garmentTop = top + (bottom - top) * 0.05;
      garmentBottom = top + (bottom - top) * 0.6;
      garmentLeft = left - (right - left) * 0.1;
      garmentRight = right + (right - left) * 0.1;
    } else {
      // Default shirt/top
      garmentTop = top + (bottom - top) * 0.1;
      garmentBottom = top + (bottom - top) * 0.65;
      garmentLeft = left + (right - left) * 0.05;
      garmentRight = right - (right - left) * 0.05;
    }
    
    const garmentWidth = garmentRight - garmentLeft;
    const garmentHeight = garmentBottom - garmentTop;
    
    // Create a temporary canvas for garment processing
    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');
    tempCanvas.width = garmentWidth;
    tempCanvas.height = garmentHeight;
    
    // Draw and resize garment
    tempCtx.drawImage(garmentImg, 0, 0, garmentWidth, garmentHeight);
    
    // Apply color tinting if specified
    if (productData.colorHex) {
      tempCtx.globalCompositeOperation = 'multiply';
      tempCtx.fillStyle = productData.colorHex;
      tempCtx.fillRect(0, 0, garmentWidth, garmentHeight);
      tempCtx.globalCompositeOperation = 'source-over';
    }
    
    // Apply garment with blending
    ctx.save();
    ctx.globalCompositeOperation = 'source-over';
    ctx.globalAlpha = 0.85;
    
    // Add slight perspective transformation
    const skewX = (centerX - (garmentLeft + garmentWidth / 2)) * 0.1;
    ctx.setTransform(1, 0, skewX / garmentWidth, 1, garmentLeft, garmentTop);
    
    ctx.drawImage(tempCanvas, 0, 0);
    ctx.restore();
  };

  // Add realistic lighting and shadow effects
  const addRealisticEffects = (ctx, bodyRegion) => {
    const { top, bottom, left, right, centerX } = bodyRegion;
    
    // Add subtle shadow on the right side
    const gradient = ctx.createLinearGradient(centerX, top, right, top);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.1)');
    
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = gradient;
    ctx.fillRect(centerX, top, right - centerX, bottom - top);
    ctx.restore();
    
    // Add highlight on the left side
    const highlightGradient = ctx.createLinearGradient(left, top, centerX, top);
    highlightGradient.addColorStop(0, 'rgba(255,255,255,0.05)');
    highlightGradient.addColorStop(1, 'rgba(255,255,255,0)');
    
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.fillStyle = highlightGradient;
    ctx.fillRect(left, top, centerX - left, bottom - top);
    ctx.restore();
  };

  const swapClothing = async (imageFile, selectedProduct) => {
    setIsProcessing(true);
    setErrorMessage(null);
    setResultImage(null);

    console.log('🚀 Starting Virtual Try-On for', selectedProduct.name);

    try {
      const personImageBase64 = await fileToBase64(imageFile);
      
      // Try Python backend first
      try {
        console.log('🐍 Calling Python Backend...');
        const result = await callPythonBackend(personImageBase64, selectedProduct);
        console.log('✅ Python processing complete!');
        setResultImage(result);
        setIsProcessing(false);
        return result;
      } catch (backendError) {
        console.log('⚠️ Python backend failed, using simple fallback...');
        setErrorMessage('Python backend unavailable - using simulation');
        
        // Simple fallback without body detection
        await new Promise(resolve => setTimeout(resolve, 1500));
        const result = await simpleFallback(personImageBase64, selectedProduct.overlay_image_url, selectedProduct);
        setResultImage(result);
        setIsProcessing(false);
        return result;
      }
      
    } catch (error) {
      console.error('Virtual try-on error:', error);
      setErrorMessage('Processing failed: ' + error.message);
      setIsProcessing(false);
    }
  };
  
  // Simple fallback without complex body detection
  const simpleFallback = async (personImageBase64, garmentImageUrl, productData) => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      const personImg = new Image();
      const garmentImg = new Image();
      let imagesLoaded = 0;
      
      const processImages = () => {
        if (imagesLoaded < 2) return;
        
        canvas.width = personImg.width;
        canvas.height = personImg.height;
        
        // Draw person
        ctx.drawImage(personImg, 0, 0);
        
        // Simple center overlay
        const centerX = canvas.width / 2;
        const centerY = canvas.height * 0.4;
        const overlayWidth = canvas.width * 0.4;
        const overlayHeight = canvas.height * 0.5;
        
        // Draw garment
        ctx.globalAlpha = 0.8;
        ctx.drawImage(
          garmentImg,
          centerX - overlayWidth / 2,
          centerY - overlayHeight / 2,
          overlayWidth,
          overlayHeight
        );
        
        // Add label
        ctx.globalAlpha = 1;
        ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
        ctx.fillRect(10, 10, 300, 50);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Arial';
        ctx.fillText('✨ Virtual Try-On: ' + productData.name, 20, 30);
        ctx.font = '12px Arial';
        ctx.fillStyle = '#00FF00';
        ctx.fillText('✓ Fallback Mode  ✓ Simple Overlay', 20, 48);
        
        resolve(canvas.toDataURL('image/jpeg', 0.9));
      };
      
      personImg.onload = () => { imagesLoaded++; processImages(); };
      garmentImg.onload = () => { imagesLoaded++; processImages(); };
      personImg.onerror = () => reject(new Error('Person image failed'));
      garmentImg.onerror = () => reject(new Error('Garment image failed'));
      
      personImg.src = personImageBase64;
      garmentImg.crossOrigin = 'anonymous';
      garmentImg.src = garmentImageUrl;
    });
  };
  
  // Call Python backend API
  const callPythonBackend = async (personImageBase64, selectedProduct) => {
    const response = await fetch('http://localhost:3001/api/virtual-tryon', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        person_image: personImageBase64,
        garment_image: selectedProduct.overlay_image_url,
        product_info: {
          name: selectedProduct.name,
          category: selectedProduct.category,
          subcategory: selectedProduct.subcategory,
          colorHex: selectedProduct.colorHex,
          color: selectedProduct.color
        }
      })
    });

    if (!response.ok) {
      throw new Error('Python backend failed');
    }

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  };

  const clearError = () => {
    setErrorMessage(null);
  };

  return { 
    swappedImage: resultImage, 
    swapClothing: swapClothing, 
    isSwapping: isProcessing, 
    error: errorMessage,
    resetError: clearError
  };
}
