import React, { useState, useEffect, useRef } from 'react';
import { Helmet } from 'react-helmet';
import Header from '../../components/ui/Header';
import Button from '../../components/ui/Button';
import { WebcamCapture } from '../../components/tryon/WebcamCapture';
import { ImageUploader } from '../../components/tryon/ImageUploader';
import { VirtualTryOnCanvas } from '../../components/tryon/VirtualTryOnCanvas';
import { ProductSelector } from '../../components/tryon/ProductSelector';
import { tryonService } from '../../services/tryonService';

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

  const videoRef = useRef(null);
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
      const data = await tryonService.getProducts();
      setProducts(data);
    } catch (error) {
      console.error('Failed to load products:', error);
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
          });
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
            });
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
    const videos = document.querySelectorAll('video');
    return videos.length > 0 ? videos[0] : null;
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

      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />

        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Virtual Try-On
              </h1>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Experience products before you buy. Use your webcam or upload a photo
                to see how accessories, eyewear, and clothing look on you.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex gap-4 mb-6">
                    <Button
                      onClick={() => setInputMode('webcam')}
                      variant={inputMode === 'webcam' ? 'default' : 'outline'}
                      className="flex-1"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                        />
                      </svg>
                      Webcam
                    </Button>

                    <Button
                      onClick={() => setInputMode('upload')}
                      variant={inputMode === 'upload' ? 'default' : 'outline'}
                      className="flex-1"
                    >
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Upload Photo
                    </Button>
                  </div>

                  {inputMode === 'webcam' ? (
                    <div>
                      {!isWebcamActive || !selectedProduct ? (
                        <WebcamCapture
                          onCapture={handleCapture}
                          isActive={isWebcamActive}
                          onToggle={handleWebcamToggle}
                        />
                      ) : (
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
                              className="flex-1"
                            >
                              Stop Webcam
                            </Button>

                            <Button
                              onClick={handleScreenshot}
                              variant="default"
                              className="flex-1"
                            >
                              <svg
                                className="w-5 h-5 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                              Screenshot
                            </Button>

                            <Button
                              onClick={handleShare}
                              variant="outline"
                              className="flex-1"
                            >
                              <svg
                                className="w-5 h-5 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                                />
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
                              className="flex-1"
                            >
                              Change Photo
                            </Button>

                            <Button
                              onClick={handleScreenshot}
                              variant="default"
                              className="flex-1"
                            >
                              <svg
                                className="w-5 h-5 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                                />
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                                />
                              </svg>
                              Screenshot
                            </Button>

                            <Button
                              onClick={handleShare}
                              variant="outline"
                              className="flex-1"
                            >
                              <svg
                                className="w-5 h-5 mr-2"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                                />
                              </svg>
                              Share
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {!selectedProduct && !loading && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                    <div className="flex items-start gap-3">
                      <svg
                        className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                          clipRule="evenodd"
                        />
                      </svg>

                      <div>
                        <h3 className="text-sm font-semibold text-blue-900 mb-1">
                          Getting Started
                        </h3>
                        <p className="text-sm text-blue-800">
                          Select a product from the sidebar to begin your virtual try-on
                          experience. Choose between webcam for real-time tracking or
                          upload a photo for a static view.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="lg:col-span-1">
                <div className="bg-white rounded-xl shadow-sm p-6 sticky top-24">
                  {loading ? (
                    <div className="text-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                      <p className="text-gray-600">Loading products...</p>
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
