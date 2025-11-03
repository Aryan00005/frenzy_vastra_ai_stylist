import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import { useClothSwap } from '../hooks/useClothSwap';
import { initializeDemoProducts } from '../utils/demoProducts';

export default function TestClothSwap() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState(null);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const products = initializeDemoProducts();

  const { swappedImage, swapClothing, isSwapping, error: swapError, resetError } = useClothSwap();

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUploadedImage(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProductSelect = (product) => {
    setSelectedProduct(product);
  };

  const handleSwap = async () => {
    if (!uploadedImage || !selectedProduct) {
      alert('Please upload an image and select a product first!');
      return;
    }

    try {
      resetError();
      console.log('🚀 Starting cloth swap test...');
      console.log('Product:', selectedProduct);
      console.log('Image file:', uploadedImage);
      
      await swapClothing(uploadedImage, selectedProduct);
      console.log('✅ Swap completed successfully!');
    } catch (error) {
      console.error('❌ Swap failed:', error);
    }
  };

  return (
    <>
      <Helmet>
        <title>Test Cloth Swap - Youware AI</title>
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              🧪 Cloth Swap Test Page
            </h1>
            <p className="text-gray-600">Test the AI-powered clothing swap feature using Youware AI Platform</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Upload Section */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>📸</span> Step 1: Upload Photo
              </h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  {uploadedImagePreview ? (
                    <div>
                      <img 
                        src={uploadedImagePreview} 
                        alt="Uploaded" 
                        className="max-h-64 mx-auto rounded-lg mb-4"
                      />
                      <p className="text-sm text-gray-500">Click to change image</p>
                    </div>
                  ) : (
                    <div>
                      <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-lg font-semibold text-gray-700 mb-2">Upload a photo of a person</p>
                      <p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
                    </div>
                  )}
                </label>
              </div>
            </div>

            {/* Product Selection */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>👕</span> Step 2: Select Product
              </h2>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {products.map((product) => (
                  <div
                    key={product.id}
                    onClick={() => handleProductSelect(product)}
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      selectedProduct?.id === product.id
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <img 
                        src={product.overlay_image_url} 
                        alt={product.name}
                        className="w-20 h-20 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-800">{product.name}</h3>
                        <p className="text-sm text-gray-600">{product.description}</p>
                        <p className="text-xs text-gray-500 mt-1">{product.color} - {product.size}</p>
                      </div>
                      {selectedProduct?.id === product.id && (
                        <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Swap Button */}
          <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <span>✨</span> Step 3: Apply AI Swap
            </h2>
            
            <button
              onClick={handleSwap}
              disabled={!uploadedImage || !selectedProduct || isSwapping}
              className={`w-full py-4 px-6 rounded-lg font-bold text-white text-lg transition-all ${
                !uploadedImage || !selectedProduct || isSwapping
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl'
              }`}
            >
              {isSwapping ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-6 w-6" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing with AI...
                </span>
              ) : (
                '🚀 Swap Clothing with AI'
              )}
            </button>

            {swapError && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-700 text-sm font-semibold">❌ Error:</p>
                <p className="text-red-600 text-sm mt-1">{swapError}</p>
              </div>
            )}
          </div>

          {/* Result Section */}
          {swappedImage && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <span>🎉</span> Result
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">Original Photo</h3>
                  <img 
                    src={uploadedImagePreview} 
                    alt="Original" 
                    className="w-full rounded-lg shadow-md"
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">AI Swapped Result ✨</h3>
                  <img 
                    src={swappedImage} 
                    alt="Swapped" 
                    className="w-full rounded-lg shadow-md border-2 border-purple-500"
                  />
                </div>
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => {
                    const link = document.createElement('a');
                    link.href = swappedImage;
                    link.download = `cloth-swap-${Date.now()}.png`;
                    link.click();
                  }}
                  className="flex-1 py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-semibold rounded-lg hover:from-green-600 hover:to-emerald-600 transition-all shadow-md"
                >
                  💾 Download Result
                </button>
                <button
                  onClick={() => {
                    setUploadedImage(null);
                    setUploadedImagePreview(null);
                    setSelectedProduct(null);
                    resetError();
                  }}
                  className="flex-1 py-3 px-6 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-all"
                >
                  🔄 Try Another
                </button>
              </div>
            </div>
          )}

          {/* Debug Console */}
          <div className="bg-gray-900 text-green-400 rounded-xl shadow-lg p-6 mt-8 font-mono text-sm">
            <h2 className="text-lg font-bold mb-4 text-white flex items-center gap-2">
              <span>🖥️</span> Debug Console
            </h2>
            <div className="space-y-2">
              <p>✅ ywConfig loaded: {typeof globalThis.ywConfig !== 'undefined' ? 'Yes' : 'No'}</p>
              <p>✅ AI Config present: {globalThis.ywConfig?.ai_config?.cloth_swap ? 'Yes' : 'No'}</p>
              <p>📸 Image uploaded: {uploadedImage ? 'Yes' : 'No'}</p>
              <p>👕 Product selected: {selectedProduct ? 'Yes' : 'No'}</p>
              <p>🔄 Processing: {isSwapping ? 'Yes' : 'No'}</p>
              <p>✨ Result ready: {swappedImage ? 'Yes' : 'No'}</p>
              {selectedProduct && (
                <p className="text-yellow-400">📦 Selected: {selectedProduct.name} ({selectedProduct.color})</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
