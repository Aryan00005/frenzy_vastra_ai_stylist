import { useState } from 'react';

export function useClothSwap() {
  const [swappedImage, setSwappedImage] = useState(null);
  const [isSwapping, setIsSwapping] = useState(false);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  const swapClothing = async (userImageFile, product, shouldRetry = true) => {
    const startTime = Date.now();
    setIsSwapping(true);
    setError(null);

    console.log('👔 Starting clothing swap:', { 
      productName: product.name,
      productDescription: product.description,
      imageSize: userImageFile.size,
      imageType: userImageFile.type,
      retryAttempt: retryCount + 1
    });

    // Check if running in Youware platform environment
    const isYouwarePlatform = window.location.hostname.includes('youware.com') || 
                               window.location.hostname.includes('youware.new') ||
                               window.self !== window.top; // Running in iframe
    
    if (!isYouwarePlatform) {
      console.info('💡 Not running on Youware platform - redirecting to platform view');
      
      // Instead of showing error, redirect to Youware platform
      // Get project ID from the current URL or use a default
      const projectId = '2ba780fc-4d2b-4300-b7aa-9f07f2856e75'; // Current project ID
      
      // Convert image file to data URL for passing in URL params
      const reader = new FileReader();
      reader.onloadend = () => {
        const imageDataUrl = reader.result;
        
        // Create a URL with the image data and product info as parameters
        const params = new URLSearchParams({
          productName: product.name,
          productId: product.id || 'demo',
          imageData: imageDataUrl.substring(0, 1000) // Truncate for URL length
        });
        
        // Open the Youware platform page
        const youwareUrl = `https://youware.com/projects/${projectId}?${params.toString()}`;
        window.open(youwareUrl, '_blank');
      };
      reader.readAsDataURL(userImageFile);
      
      setIsSwapping(false);
      return null; // Don't throw error, just return
    }

    // Validate ywConfig exists
    if (!globalThis.ywConfig) {
      const errorMsg = '⚠️ Configuration Error: ywConfig not found. Please ensure yw_manifest.json is properly loaded.';
      console.error('❌', errorMsg);
      setError(errorMsg);
      setIsSwapping(false);
      throw new Error(errorMsg);
    }

    const config = globalThis.ywConfig?.ai_config?.cloth_swap;
    if (!config) {
      const errorMsg = '⚠️ Configuration Error: Cloth swap configuration not found in yw_manifest.json';
      console.error('❌', errorMsg);
      setError(errorMsg);
      setIsSwapping(false);
      throw new Error(errorMsg);
    }

    console.log('✅ Configuration loaded:', {
      model: config.model,
      responseFormat: config.response_format,
      size: config.size
    });

    // Build the prompt using template function
    const prompt = config.prompt_template({
      productName: product.name,
      description: product.description || 'stylish clothing item'
    });

    console.log('🤖 AI API Request (Cloth Swap):', {
      model: config.model,
      endpoint: 'https://api.youware.com/public/v1/ai/images/edits',
      prompt: prompt.substring(0, 150) + '...',
      parameters: {
        size: config.size,
        response_format: config.response_format
      },
      imageInfo: {
        name: userImageFile.name,
        size: `${(userImageFile.size / 1024).toFixed(2)} KB`,
        type: userImageFile.type
      }
    });

    const formData = new FormData();
    formData.append('model', config.model);
    formData.append('prompt', prompt);
    formData.append('response_format', config.response_format);
    formData.append('size', config.size);
    formData.append('image', userImageFile);

    try {
      const response = await fetch('https://api.youware.com/public/v1/ai/images/edits', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer sk-YOUWARE' },
        body: formData
      });

      console.log('📡 API Response received:', {
        status: response.status,
        statusText: response.statusText,
        ok: response.ok,
        headers: {
          contentType: response.headers.get('content-type')
        }
      });

      if (!response.ok) {
        let errorData;
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        
        try {
          errorData = await response.json();
          console.error('❌ API Error Response:', errorData);
          
          // Handle specific error cases
          if (response.status === 429) {
            errorMessage = '⚠️ Rate limit exceeded. Please wait a moment and try again.';
          } else if (response.status === 401 || response.status === 403) {
            errorMessage = '⚠️ Authentication error. Please refresh the page and try again.';
          } else if (response.status === 500) {
            errorMessage = '⚠️ Server error. The AI service is experiencing issues. Please try again later.';
          } else if (errorData.error) {
            errorMessage = `⚠️ ${errorData.error.message || errorData.error}`;
          }
        } catch (parseError) {
          console.error('❌ Failed to parse error response:', parseError);
        }

        console.error('❌ API Error - Cloth swap request failed:', {
          status: response.status,
          statusText: response.statusText,
          errorMessage: errorMessage,
          errorData: errorData
        });

        // Retry logic for transient errors
        if (shouldRetry && retryCount < 2 && (response.status >= 500 || response.status === 429)) {
          console.log(`🔄 Retrying... (attempt ${retryCount + 2}/3)`);
          setRetryCount(prev => prev + 1);
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retry
          return swapClothing(userImageFile, product, true);
        }

        setError(errorMessage);
        throw new Error(errorMessage);
      }

      const result = await response.json();

      console.log('✅ AI API Response (Cloth Swap):', {
        model: config.model,
        responseFormat: config.response_format,
        imagesGenerated: result.data ? result.data.length : 0,
        hasB64Json: result.data?.[0]?.b64_json ? 'Yes' : 'No',
        hasUrl: result.data?.[0]?.url ? 'Yes' : 'No',
        processingTime: `${Date.now() - startTime}ms`,
        retryAttempts: retryCount
      });

      if (result && result.data && result.data.length > 0) {
        const imageData = result.data[0];
        const finalImageUrl = imageData.b64_json
          ? `data:image/png;base64,${imageData.b64_json}`
          : imageData.url;
        
        if (!finalImageUrl) {
          const errorMsg = '⚠️ Invalid response: No image data received from AI service';
          console.error('❌', errorMsg, result);
          setError(errorMsg);
          throw new Error(errorMsg);
        }

        console.log('✅ Cloth swap successful!', {
          imageFormat: imageData.b64_json ? 'base64' : 'url',
          imageSize: finalImageUrl.length > 1000 ? `${(finalImageUrl.length / 1024).toFixed(2)} KB` : 'N/A'
        });
        
        setSwappedImage(finalImageUrl);
        setRetryCount(0); // Reset retry count on success
        return finalImageUrl;
      } else {
        const errorMsg = '⚠️ Invalid response format: Expected image data but received none';
        console.error('❌ API Error - Invalid response format:', result);
        setError(errorMsg);
        throw new Error(errorMsg);
      }
    } catch (err) {
      // Network or fetch errors - likely CORS or platform context issues
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        const errorMsg = '⚠️ Platform Error: Unable to connect to Youware AI service.\n\n' +
                         'This usually means you\'re testing locally. AI features require:\n' +
                         '1. Running on Youware platform (youware.com)\n' +
                         '2. Proper platform authentication headers\n' +
                         '3. CORS permissions from Youware servers\n\n' +
                         '💡 Solution: Deploy this project to Youware platform to test AI features.';
        console.error('❌ Network/CORS Error:', {
          error: err.message,
          name: err.name,
          hint: 'Deploy to Youware platform for AI functionality',
          processingTime: `${Date.now() - startTime}ms`
        });
        setError(errorMsg);
        throw new Error(errorMsg);
      }

      // Re-throw if it's already our custom error
      if (err.message.startsWith('⚠️')) {
        throw err;
      }

      // Generic error handler
      console.error('❌ API Error - Cloth swap failed:', {
        model: config.model,
        error: err.message,
        stack: err.stack,
        processingTime: `${Date.now() - startTime}ms`,
        retryAttempts: retryCount
      });
      
      const errorMsg = `⚠️ Unexpected error: ${err.message}`;
      setError(errorMsg);
      throw new Error(errorMsg);
    } finally {
      setIsSwapping(false);
    }
  };

  const resetError = () => {
    setError(null);
    setRetryCount(0);
  };

  return { 
    swappedImage, 
    swapClothing, 
    isSwapping, 
    error,
    resetError,
    retryCount
  };
}
