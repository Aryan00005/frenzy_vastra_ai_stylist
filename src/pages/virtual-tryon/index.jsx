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
      
      // Try to load from Supabase first
      try {
        const data = await tryonService.getProducts();
        if (data && data.length > 0) {
          setProducts(data);
        } else {
          // Fall back to demo products if no products in database
          const demoProducts = initializeDemoProducts();
          setProducts(demoProducts);
        }
      } catch (error) {
        // Fall back to demo products on error
        console.log('Using demo products:', error.message);
        const demoProducts = initializeDemoProducts();
        setProducts(demoProducts);
      }
    } catch (error) {
      console.error('Failed to load products:', error);
      // Load demo products as final fallback
      const demoProducts = initializeDemoProducts();
      setProducts(demoProducts);
    } finally {
      setLoading(false);
    }
  };

  const initializeSession = async () => {
    try {
      const deviceType = /Mobile|Android|iPhone/i.test(navigator.userAgent)
        ? 'mobile'
        : 'desktop';

      const sessionData = await tryonService.createSession('webcam', deviceType);
      setSession(sessionData);
    } catch (error) {
      console.error('Failed to create session:', error);
      // Create a mock session for demo mode
      setSession({ id: 'demo-session', started_at: new Date().toISOString() });
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

  const handleImageSelect = (file, dataUrl) => {
    if (file && dataUrl) {
      setUploadedImage(file);
      setUploadedImageUrl(dataUrl);
      setIsTracking(true);
      setIsWebcamActive(false);
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

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setSelectedVariation(null);

    if (product.variations && product.variations.length > 0) {
      setSelectedVariation(product.variations[0]);
    }
  };

  const handleScreenshot = async () => {
    if (!canvasRef.current) return;

    try {
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

  const handleShare = async () => {
    if (!canvasRef.current) return;

    try {
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
                      {!uploadedImageUrl || !selectedProduct ? (
                        <ImageUploader onImageSelect={handleImageSelect} />
                      ) : (
                        <div className="space-y-4">
                          <VirtualTryOnCanvas
                            ref={canvasRef}
                            imageSource={uploadedImageUrl}
                            selectedProduct={selectedProduct}
                            selectedVariation={selectedVariation}
                            isTracking={isTracking}
                          />

                          <div className="flex gap-3">
                            <Button
                              onClick={() => handleImageSelect(null, null)}
                              variant="outline"
                              className="flex-1 bg-white hover:bg-gray-50"
                            >
                              Change Photo
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
