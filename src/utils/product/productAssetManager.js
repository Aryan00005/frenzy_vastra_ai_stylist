/**
 * Product Asset Manager
 * Handles loading, caching, and management of product assets (images, 3D models)
 */

class ProductAssetManager {
  constructor() {
    this.cache = new Map();
    this.loadingQueue = new Map();
    this.preloadQueue = [];
    this.maxCacheSize = 50; // Maximum number of cached assets
  }

  /**
   * Load a product asset (image or 3D model)
   * @param {string} url - Asset URL
   * @param {Object} options - Loading options
   * @returns {Promise<HTMLImageElement|Object>}
   */
  async loadAsset(url, options = {}) {
    const {
      type = 'image',
      priority = 'normal',
      crossOrigin = 'anonymous',
      timeout = 10000
    } = options;

    // Check cache first
    if (this.cache.has(url)) {
      return this.cache.get(url);
    }

    // Check if already loading
    if (this.loadingQueue.has(url)) {
      return this.loadingQueue.get(url);
    }

    // Start loading
    const loadPromise = this._loadAssetWithTimeout(url, type, crossOrigin, timeout);
    this.loadingQueue.set(url, loadPromise);

    try {
      const asset = await loadPromise;
      
      // Add to cache
      this._addToCache(url, asset);
      
      // Remove from loading queue
      this.loadingQueue.delete(url);
      
      return asset;
    } catch (error) {
      this.loadingQueue.delete(url);
      throw error;
    }
  }

  /**
   * Load asset with timeout
   * @private
   */
  async _loadAssetWithTimeout(url, type, crossOrigin, timeout) {
    return Promise.race([
      this._loadAssetByType(url, type, crossOrigin),
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Asset load timeout')), timeout)
      )
    ]);
  }

  /**
   * Load asset by type
   * @private
   */
  async _loadAssetByType(url, type, crossOrigin) {
    if (type === 'image') {
      return this._loadImage(url, crossOrigin);
    } else if (type === '3d') {
      return this._load3DModel(url);
    } else {
      throw new Error(`Unsupported asset type: ${type}`);
    }
  }

  /**
   * Load image asset
   * @private
   */
  async _loadImage(url, crossOrigin) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = crossOrigin;

      img.onload = () => resolve(img);
      img.onerror = (err) => reject(new Error(`Failed to load image: ${url}`));

      img.src = url;
    });
  }

  /**
   * Load 3D model asset (placeholder for future implementation)
   * @private
   */
  async _load3DModel(url) {
    // TODO: Implement 3D model loading (e.g., with Three.js)
    throw new Error('3D model loading not yet implemented');
  }

  /**
   * Preload multiple assets
   * @param {Array<Object>} assets - Array of asset configs
   * @returns {Promise<Array>}
   */
  async preloadAssets(assets) {
    const promises = assets.map(asset => 
      this.loadAsset(asset.url, asset.options).catch(err => {
        console.error(`Failed to preload asset: ${asset.url}`, err);
        return null;
      })
    );

    return Promise.all(promises);
  }

  /**
   * Add asset to cache
   * @private
   */
  _addToCache(url, asset) {
    // Implement LRU cache eviction
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(url, asset);
  }

  /**
   * Get cached asset
   * @param {string} url - Asset URL
   * @returns {HTMLImageElement|Object|null}
   */
  getCachedAsset(url) {
    return this.cache.get(url) || null;
  }

  /**
   * Clear cache
   * @param {string} url - Optional specific URL to clear
   */
  clearCache(url = null) {
    if (url) {
      this.cache.delete(url);
    } else {
      this.cache.clear();
    }
  }

  /**
   * Get cache statistics
   * @returns {Object}
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      urls: Array.from(this.cache.keys())
    };
  }
}

// Singleton instance
const assetManager = new ProductAssetManager();

export default assetManager;

/**
 * Product Asset Validator
 * Validates product asset configurations
 */
export class ProductAssetValidator {
  static validateProduct(product) {
    const errors = [];

    if (!product.id) {
      errors.push('Product must have an ID');
    }

    if (!product.name) {
      errors.push('Product must have a name');
    }

    if (!product.category) {
      errors.push('Product must have a category');
    }

    if (!product.overlay_image_url) {
      errors.push('Product must have an overlay_image_url');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static validateVariation(variation) {
    const errors = [];

    if (!variation.id) {
      errors.push('Variation must have an ID');
    }

    if (!variation.name && !variation.color) {
      errors.push('Variation must have a name or color');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  static validateAssetUrl(url) {
    if (!url) return false;

    try {
      new URL(url);
      return true;
    } catch {
      // Check if it's a relative path
      return url.startsWith('/') || url.startsWith('./');
    }
  }
}

/**
 * Product Asset Helper Functions
 */
export const ProductAssetHelpers = {
  /**
   * Get optimal asset URL based on device capabilities
   * @param {Object} product - Product object
   * @param {Object} variation - Optional variation
   * @returns {string}
   */
  getOptimalAssetUrl(product, variation = null) {
    const url = variation?.overlay_image_url || product?.overlay_image_url;
    
    if (!url) return null;

    // For future: implement responsive image selection based on device
    // e.g., return smaller images for mobile, higher quality for desktop
    return url;
  },

  /**
   * Extract product category and subcategory
   * @param {Object} product - Product object
   * @returns {Object}
   */
  getProductCategories(product) {
    return {
      category: product.category || 'general',
      subcategory: product.subcategory || product.type || null
    };
  },

  /**
   * Check if product supports 3D rendering
   * @param {Object} product - Product object
   * @returns {boolean}
   */
  supports3D(product) {
    return !!(product.model_3d_url || product.supports_3d);
  },

  /**
   * Get product scale factor
   * @param {Object} product - Product object
   * @returns {number}
   */
  getScaleFactor(product) {
    return product.scale_factor || 1.0;
  },

  /**
   * Get product variations
   * @param {Object} product - Product object
   * @returns {Array}
   */
  getVariations(product) {
    return product.variations || [];
  },

  /**
   * Find variation by ID
   * @param {Object} product - Product object
   * @param {string} variationId - Variation ID
   * @returns {Object|null}
   */
  findVariation(product, variationId) {
    const variations = this.getVariations(product);
    return variations.find(v => v.id === variationId) || null;
  }
};
