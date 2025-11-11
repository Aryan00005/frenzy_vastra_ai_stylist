import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import { WebcamCapture } from '../../components/tryon/WebcamCapture';
import { ImageUploader } from '../../components/tryon/ImageUploader';
import { VirtualTryOnCanvas } from '../../components/tryon/VirtualTryOnCanvas';
import { ProductSelector } from '../../components/tryon/ProductSelector';
import { tryonService } from '../../services/tryonService';
import { initializeDemoProducts } from '../../utils/demoProducts';
import { useClothSwap } from '../../hooks/useClothSwap';

export default function VirtualTryOnPage() {
  const [inputMode, setInputMode] = useState('webcam');
  const [isWebcamActive, setIsWebcamActive] = useState(false);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedImageUrl, setUploadedImageUrl] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [isTracking, setIsTracking] = useState(false);
  const [session, setSession] = useState(null);
  const [currentInteraction, setCurrentInteraction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [screenshotUrl, setScreenshotUrl] = useState(null);

  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const interactionStartTimeRef = useRef(null);
  
  // AI Cloth Swap Hook
  const { swappedImage, swapClothing, isSwapping, error: swapError, resetError } = useClothSwap();

  useEffect(() => {
    loadProducts();
    initializeSession();
  }, []);

  useEffect(() => {
    if (selectedProduct && session) {
      startProductInteraction();
    }

    return () => {
      if (currentInteraction && interactionStartTimeRef.current) {
        endProductInteraction();
      }
    };
  }, [selectedProduct, selectedVariation]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      
      // Load demo products directly for demo
      console.log('🛍️ Loading demo products...');
      const demoProducts = initializeDemoProducts();
      console.log('📦 Demo products loaded:', demoProducts);
      setProducts(demoProducts);
      
    } catch (error) {
      console.error('Failed to load products:', error);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const initializeSession = async () => {
    try {
      // Create a mock session for demo mode
      console.log('🎯 Creating demo session...');
      const mockSession = { id: 'demo-session', started_at: new Date().toISOString() };
      setSession(mockSession);
      console.log('✅ Demo session created:', mockSession);
    } catch (error) {
      console.error('Failed to create session:', error);
    }
  };

  const startProductInteraction = async () => {
    if (!session || !selectedProduct) return;

    try {
      if (currentInteraction && interactionStartTimeRef.current) {
        await endProductInteraction();
      }

      const interaction = await tryonService.recordInteraction(
        session.id,
        selectedProduct.id,
        selectedVariation?.id
      );

      setCurrentInteraction(interaction);
      interactionStartTimeRef.current = Date.now();
    } catch (error) {
      console.error('Failed to start interaction:', error);
      // Continue without tracking in demo mode
      setCurrentInteraction({ id: 'demo-interaction' });
      interactionStartTimeRef.current = Date.now();
    }
  };

  const endProductInteraction = async () => {
    if (!currentInteraction || !interactionStartTimeRef.current) return;

    try {
      const duration = Math.floor((Date.now() - interactionStartTimeRef.current) / 1000);

      await tryonService.updateInteraction(currentInteraction.id, {
        duration_seconds: duration
      });

      setCurrentInteraction(null);
      interactionStartTimeRef.current = null;
    } catch (error) {
      console.error('Failed to end interaction:', error);
      setCurrentInteraction(null);
      interactionStartTimeRef.current = null;
    }
  };

  const handleWebcamToggle = (active) => {
    setIsWebcamActive(active);
    if (active) {
      setIsTracking(true);
      setUploadedImage(null);
      setUploadedImageUrl(null);
    } else {
      setIsTracking(false);
    }
  };

  const handleImageSelect = async (file, dataUrl) => {
    if (file && dataUrl) {
      setUploadedImage(file);
      setUploadedImageUrl(dataUrl);
      setIsTracking(true);
      setIsWebcamActive(false);
      
      // Reset any previous AI results
      resetError();
      
      console.log('📸 Image uploaded:', file.name);
      
      // Don't auto-trigger - let user click "Try It On" button
    } else {
      setUploadedImage(null);
      setUploadedImageUrl(null);
      setIsTracking(false);
    }
  };

  const handleCapture = (blob, dataUrl) => {
    setUploadedImage(blob);
    setUploadedImageUrl(dataUrl);
    setIsWebcamActive(false);
    setIsTracking(true);
    setInputMode('upload');
  };

  const handleProductSelect = async (product) => {
    console.log('🛍️ SELECTING PRODUCT:', product);
    setSelectedProduct(product);
    setSelectedVariation(null);
    
    // Reset any previous AI results
    resetError();
    
    if (product.variations && product.variations.length > 0) {
      setSelectedVariation(product.variations[0]);
    }
    
    console.log('✅ Product selected successfully:', product.name);
    console.log('🎨 Product color:', product.colorHex);
    console.log('📸 Image uploaded:', !!uploadedImage);
  };

  const handleScreenshot = async () => {
    try {
      // For upload mode with swapped image
      if (inputMode === 'upload' && swappedImage) {
        await downloadImageFromUrl(swappedImage);
        return;
      }

      // For webcam mode with canvas
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;

      canvas.toBlob(async (blob) => {
        const url = URL.createObjectURL(blob);
        setScreenshotUrl(url);

        if (currentInteraction) {
          await tryonService.updateInteraction(currentInteraction.id, {
            screenshot_taken: true
          }).catch(() => {});
        }

        const link = document.createElement('a');
        link.href = url;
        link.download = `virtual-tryon-${Date.now()}.png`;
        link.click();
      }, 'image/png');
    } catch (error) {
      console.error('Failed to capture screenshot:', error);
    }
  };

  const downloadImageFromUrl = async (imageUrl) => {
    try {
      // If it's a base64 image, convert directly
      if (imageUrl.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = imageUrl;
        link.download = `virtual-tryon-${Date.now()}.png`;
        link.click();
        return;
      }

      // For regular URLs, fetch and download
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `virtual-tryon-${Date.now()}.png`;
      link.click();
      
      // Clean up
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error('Failed to download image:', error);
      alert('Failed to download image. Please try again.');
    }
  };

  const handleShare = async () => {
    try {
      // For upload mode with swapped image
      if (inputMode === 'upload' && swappedImage) {
        // Try to convert base64 to blob for sharing
        if (swappedImage.startsWith('data:')) {
          const response = await fetch(swappedImage);
          const blob = await response.blob();
          const file = new File([blob], 'virtual-tryon.png', { type: 'image/png' });

          if (navigator.share && navigator.canShare({ files: [file] })) {
            await navigator.share({
              files: [file],
              title: 'Virtual Try-On',
              text: `Check out how I look with ${selectedProduct?.name}!`
            });
            return;
          }
        }
        // Fallback to download
        handleScreenshot();
        return;
      }

      // For webcam mode with canvas
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;

      canvas.toBlob(async (blob) => {
        const file = new File([blob], 'virtual-tryon.png', { type: 'image/png' });

        if (navigator.share && navigator.canShare({ files: [file] })) {
          await navigator.share({
            files: [file],
            title: 'Virtual Try-On',
            text: `Check out how I look with ${selectedProduct?.name}!`
          });

          if (currentInteraction) {
            await tryonService.updateInteraction(currentInteraction.id, {
              shared: true
            }).catch(() => {});
          }
        } else {
          handleScreenshot();
        }
      }, 'image/png');
    } catch (error) {
      console.error('Failed to share:', error);
      handleScreenshot();
    }
  };

  const getVideoElement = () => {
    // Return the video element from webcamRef
    return webcamRef.current || null;
  };

  return (
    <>
      <Helmet>
        <title>Virtual Try-On - Frenzy Vastra</title>
        <meta
          name="description"
          content="Try on products virtually using your webcam or uploaded photos. See how accessories, eyewear, and clothing look on you in real-time."
        />
      </Helmet>

      <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
        <Header />

        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            {/* Hero Section */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full mb-4">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  AI-Powered Virtual Try-On
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 bg-clip-text text-transparent">
                  Virtual Try-On Experience
                </span>
              </h1>
              
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                See yourself in our products with real-time AR technology.
                <span className="block mt-1 text-sm text-gray-500">
                  Your privacy matters - all processing happens on your device
                </span>
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Try-On Area */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6">
                  {/* Mode Tabs */}
                  <div className="flex gap-3 mb-6">
                    <button
                      onClick={() => setInputMode('webcam')}
                      className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                        inputMode === 'webcam'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        <span>Live Camera</span>
                      </div>
                    </button>

                    <button
                      onClick={() => setInputMode('upload')}
                      className={`flex-1 py-3 px-6 rounded-xl font-semibold transition-all duration-300 ${
                        inputMode === 'upload'
                          ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Upload Photo</span>
                      </div>
                    </button>
                  </div>

                  {/* Try-On Canvas */}
                  {inputMode === 'webcam' ? (
                    <div>
                      <div style={{ display: (!isWebcamActive || !selectedProduct) ? 'block' : 'none' }}>
                        <WebcamCapture
                          ref={webcamRef}
                          onCapture={handleCapture}
                          isActive={isWebcamActive}
                          onToggle={handleWebcamToggle}
                        />
                      </div>
                      {isWebcamActive && selectedProduct && (
                        <div className="space-y-4">
                          <VirtualTryOnCanvas
                            ref={canvasRef}
                            videoElement={getVideoElement()}
                            selectedProduct={selectedProduct}
                            selectedVariation={selectedVariation}
                            isTracking={isTracking}
                          />

                          <div className="flex gap-3">
                            <Button
                              onClick={() => setIsWebcamActive(false)}
                              variant="outline"
                              className="flex-1 bg-white hover:bg-gray-50"
                            >
                              Stop Camera
                            </Button>

                            <Button
                              onClick={handleScreenshot}
                              variant="default"
                              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                            >
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              Screenshot
                            </Button>

                            <Button
                              onClick={handleShare}
                              variant="outline"
                              className="flex-1 bg-white hover:bg-gray-50"
                            >
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                              </svg>
                              Share
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div>
                      {!uploadedImageUrl ? (
                        <ImageUploader onImageSelect={handleImageSelect} />
                      ) : (
                        <div className="space-y-4">
                          {!selectedProduct && (
                            <div className="text-center py-6">
                              <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl border border-blue-200">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div className="text-left">
                                  <div className="text-sm font-semibold text-blue-900">Ready for Virtual Try-On!</div>
                                  <div className="text-xs text-blue-700">Select an outfit from the sidebar to get started ✨</div>
                                </div>
                              </div>
                            </div>
                          )}

                          {selectedProduct && !swappedImage && !isSwapping && (
                            <div className="text-center py-6">
                              <div className="space-y-4">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-green-100 rounded-lg">
                                  <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  <span className="text-sm font-medium text-green-900">Ready! {selectedProduct.name} selected</span>
                                </div>
                                <Button
                                  onClick={() => swapClothing(uploadedImage, selectedProduct)}
                                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-8 py-3 text-lg font-semibold"
                                >
                                  ✨ Try It On with AI
                                </Button>
                              </div>
                            </div>
                          )}

                          {isSwapping && (
                            <div className="text-center py-6">
                              <div className="inline-flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl border border-purple-200">
                                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                                <div className="text-left">
                                  <div className="text-sm font-semibold text-purple-900">🤖 AI is working its magic...</div>
                                  <div className="text-xs text-purple-700">Virtually fitting {selectedProduct?.name} on you</div>
                                </div>
                              </div>
                            </div>
                          )}

                          {swapError && (
                            <div className="text-center py-4">
                              <div className="inline-flex items-center gap-2 px-4 py-3 bg-yellow-100 rounded-xl border border-yellow-200">
                                <svg className="w-5 h-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm font-medium text-yellow-900">{swapError}</span>
                              </div>
                            </div>
                          )}
                          
                          <div className="relative">
                            <img
                              src={swappedImage || uploadedImageUrl}
                              alt={swappedImage ? "Virtual try-on result" : "Your uploaded photo"}
                              className="w-full h-auto rounded-lg shadow-lg"
                            />
                            {isSwapping && (
                              <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-pink-900/30 rounded-lg flex items-center justify-center">
                                <div className="bg-white px-6 py-4 rounded-xl shadow-xl">
                                  <div className="flex items-center gap-3">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                                    <div>
                                      <div className="text-sm font-medium text-gray-900">AI Processing...</div>
                                      <div className="text-xs text-gray-500">Fitting your outfit</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}
                            {swappedImage && !isSwapping && (
                              <div className="absolute top-3 right-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                                ✨ AI Fitted
                              </div>
                            )}
                          </div>

                          {/* ALWAYS SHOW TRY IT ON BUTTON */}
                          {uploadedImageUrl && selectedProduct && (
                            <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-xl border-2 border-purple-200 text-center">
                              <Button
                                onClick={() => {
                                  console.log('🚀 TRY IT ON CLICKED!');
                                  console.log('📸 Image:', uploadedImage);
                                  console.log('👕 Product:', selectedProduct);
                                  swapClothing(uploadedImage, selectedProduct);
                                }}
                                className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-4 text-xl font-bold shadow-lg"
                                disabled={isSwapping}
                              >
                                {isSwapping ? '🤖 AI Working...' : swappedImage ? '🔄 TRY DIFFERENT STYLE' : '✨ TRY IT ON WITH AI'}
                              </Button>
                              <p className="text-sm text-purple-700 mt-2 font-medium">
                                {swappedImage ? `Try ${selectedProduct.name} again or select a different product!` : `Ready to fit ${selectedProduct.name} on your photo!`}
                              </p>
                            </div>
                          )}



                          {/* PERMANENT TRY IT ON BUTTON - ALWAYS VISIBLE */}
                          <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-4 rounded-xl border-2 border-purple-200 text-center mb-4">
                            <Button
                              onClick={() => {
                                console.log('🚀 PERMANENT BUTTON CLICKED!');
                                console.log('📸 Image exists:', !!uploadedImage);
                                console.log('👕 Selected Product:', selectedProduct);
                                console.log('🛍️ All Products:', products);
                                
                                // If no selected product, use the first available product
                                const productToUse = selectedProduct || (products && products[0]);
                                
                                if (uploadedImage && productToUse) {
                                  console.log('✅ Using product:', productToUse.name);
                                  swapClothing(uploadedImage, productToUse);
                                } else {
                                  console.log('❌ Missing:', { image: !!uploadedImage, product: !!productToUse });
                                  alert('Please upload an image first! Products are available.');
                                }
                              }}
                              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white py-4 text-xl font-bold shadow-lg"
                              disabled={isSwapping}
                            >
                              {isSwapping ? '🤖 AI WORKING...' : '✨ TRY IT ON WITH AI'}
                            </Button>
                            <p className="text-sm text-purple-700 mt-2 font-medium">
                              {selectedProduct ? `Ready to try ${selectedProduct.name}!` : 'Select a product from the sidebar first'}
                            </p>
                          </div>

                          <div className="flex gap-3">
                            <Button
                              onClick={() => handleImageSelect(null, null)}
                              variant="outline"
                              className="flex-1 bg-white hover:bg-gray-50"
                              disabled={isSwapping}
                            >
                              Change Photo
                            </Button>

                            <Button
                              onClick={handleScreenshot}
                              variant="default"
                              className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                              disabled={isSwapping}
                            >
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              {swappedImage ? 'Download Result' : 'Download Photo'}
                            </Button>

                            <Button
                              onClick={handleShare}
                              variant="outline"
                              className="flex-1 bg-white hover:bg-gray-50"
                              disabled={isSwapping}
                            >
                              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                              </svg>
                              Share
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Getting Started Guide */}
                {!selectedProduct && !loading && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-2xl p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                      </div>

                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-blue-900 mb-2">
                          🎯 How to Get Started
                        </h3>
                        <ol className="text-sm text-blue-800 space-y-2">
                          <li className="flex items-start gap-2">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                            <span>Select a product from the sidebar →</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                            <span>Choose "Live Camera" for real-time try-on or "Upload Photo" for a static view</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <span className="flex-shrink-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                            <span>See the product overlay on you in real-time!</span>
                          </li>
                        </ol>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Product Selector Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-6 sticky top-24">
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-100 to-pink-100 rounded-full mb-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
                      </div>
                      <p className="text-gray-600 font-medium">Loading products...</p>
                    </div>
                  ) : (
                    <ProductSelector
                      products={products}
                      selectedProduct={selectedProduct}
                      onProductSelect={handleProductSelect}
                      selectedVariation={selectedVariation}
                      onVariationSelect={setSelectedVariation}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
