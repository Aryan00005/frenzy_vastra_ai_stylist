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
      // Network or fetch errors
      if (err.name === 'TypeError' && err.message.includes('fetch')) {
        const errorMsg = '⚠️ Network error: Unable to connect to AI service. Please check your internet connection.';
        console.error('❌ Network Error:', {
          error: err.message,
          name: err.name,
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
