import assetManager, { ProductAssetValidator, ProductAssetHelpers } from '../../src/utils/product/productAssetManager';

describe('ProductAssetManager', () => {
  beforeEach(() => {
    assetManager.clearCache();
  });

  describe('loadAsset', () => {
    test('loads image asset successfully', async () => {
      const mockImage = new Image();
      const url = 'https://example.com/product.jpg';

      // Mock Image constructor
      global.Image = jest.fn(() => mockImage);

      // Trigger onload after a short delay
      setTimeout(() => {
        if (mockImage.onload) mockImage.onload();
      }, 10);

      const asset = await assetManager.loadAsset(url);
      expect(asset).toBe(mockImage);
    });

    test('caches loaded assets', async () => {
      const mockImage = new Image();
      const url = 'https://example.com/product.jpg';

      global.Image = jest.fn(() => mockImage);
      setTimeout(() => {
        if (mockImage.onload) mockImage.onload();
      }, 10);

      await assetManager.loadAsset(url);
      const cachedAsset = assetManager.getCachedAsset(url);

      expect(cachedAsset).toBe(mockImage);
    });

    test('returns cached asset on subsequent loads', async () => {
      const mockImage = new Image();
      const url = 'https://example.com/product.jpg';

      global.Image = jest.fn(() => mockImage);
      setTimeout(() => {
        if (mockImage.onload) mockImage.onload();
      }, 10);

      const asset1 = await assetManager.loadAsset(url);
      const asset2 = await assetManager.loadAsset(url);

      expect(asset1).toBe(asset2);
      expect(global.Image).toHaveBeenCalledTimes(1);
    });

    test('handles load errors', async () => {
      const mockImage = new Image();
      const url = 'https://example.com/invalid.jpg';

      global.Image = jest.fn(() => mockImage);
      setTimeout(() => {
        if (mockImage.onerror) mockImage.onerror();
      }, 10);

      await expect(assetManager.loadAsset(url)).rejects.toThrow();
    });
  });

  describe('preloadAssets', () => {
    test('preloads multiple assets', async () => {
      const urls = [
        'https://example.com/product1.jpg',
        'https://example.com/product2.jpg'
      ];

      global.Image = jest.fn(() => {
        const img = new Image();
        setTimeout(() => {
          if (img.onload) img.onload();
        }, 10);
        return img;
      });

      const assets = await assetManager.preloadAssets(
        urls.map(url => ({ url, options: {} }))
      );

      expect(assets).toHaveLength(2);
    });
  });

  describe('clearCache', () => {
    test('clears specific cached asset', async () => {
      const mockImage = new Image();
      const url = 'https://example.com/product.jpg';

      global.Image = jest.fn(() => mockImage);
      setTimeout(() => {
        if (mockImage.onload) mockImage.onload();
      }, 10);

      await assetManager.loadAsset(url);
      assetManager.clearCache(url);

      expect(assetManager.getCachedAsset(url)).toBeNull();
    });

    test('clears all cached assets', async () => {
      const mockImage1 = new Image();
      const mockImage2 = new Image();

      global.Image = jest.fn()
        .mockReturnValueOnce(mockImage1)
        .mockReturnValueOnce(mockImage2);

      setTimeout(() => {
        if (mockImage1.onload) mockImage1.onload();
        if (mockImage2.onload) mockImage2.onload();
      }, 10);

      await assetManager.loadAsset('https://example.com/product1.jpg');
      await assetManager.loadAsset('https://example.com/product2.jpg');

      assetManager.clearCache();

      const stats = assetManager.getCacheStats();
      expect(stats.size).toBe(0);
    });
  });
});

describe('ProductAssetValidator', () => {
  describe('validateProduct', () => {
    test('validates correct product', () => {
      const product = {
        id: '1',
        name: 'Test Product',
        category: 'clothing',
        overlay_image_url: '/assets/product.jpg'
      };

      const result = ProductAssetValidator.validateProduct(product);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('detects missing required fields', () => {
      const product = {
        id: '1'
      };

      const result = ProductAssetValidator.validateProduct(product);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('validateAssetUrl', () => {
    test('validates absolute URLs', () => {
      expect(ProductAssetValidator.validateAssetUrl('https://example.com/image.jpg')).toBe(true);
    });

    test('validates relative URLs', () => {
      expect(ProductAssetValidator.validateAssetUrl('/assets/image.jpg')).toBe(true);
    });

    test('rejects invalid URLs', () => {
      expect(ProductAssetValidator.validateAssetUrl('')).toBe(false);
      expect(ProductAssetValidator.validateAssetUrl(null)).toBe(false);
    });
  });
});

describe('ProductAssetHelpers', () => {
  describe('getOptimalAssetUrl', () => {
    test('returns variation URL if available', () => {
      const product = {
        overlay_image_url: '/assets/default.jpg'
      };
      const variation = {
        overlay_image_url: '/assets/variation.jpg'
      };

      const url = ProductAssetHelpers.getOptimalAssetUrl(product, variation);
      expect(url).toBe('/assets/variation.jpg');
    });

    test('returns product URL if no variation', () => {
      const product = {
        overlay_image_url: '/assets/default.jpg'
      };

      const url = ProductAssetHelpers.getOptimalAssetUrl(product);
      expect(url).toBe('/assets/default.jpg');
    });
  });

  describe('getProductCategories', () => {
    test('extracts category and subcategory', () => {
      const product = {
        category: 'clothing',
        subcategory: 'shirt'
      };

      const result = ProductAssetHelpers.getProductCategories(product);
      expect(result.category).toBe('clothing');
      expect(result.subcategory).toBe('shirt');
    });
  });

  describe('getScaleFactor', () => {
    test('returns product scale factor', () => {
      const product = { scale_factor: 1.5 };
      expect(ProductAssetHelpers.getScaleFactor(product)).toBe(1.5);
    });

    test('returns default scale factor', () => {
      const product = {};
      expect(ProductAssetHelpers.getScaleFactor(product)).toBe(1.0);
    });
  });

  describe('findVariation', () => {
    test('finds variation by ID', () => {
      const product = {
        variations: [
          { id: 'var1', name: 'Red' },
          { id: 'var2', name: 'Blue' }
        ]
      };

      const variation = ProductAssetHelpers.findVariation(product, 'var2');
      expect(variation.name).toBe('Blue');
    });

    test('returns null if variation not found', () => {
      const product = {
        variations: [
          { id: 'var1', name: 'Red' }
        ]
      };

      const variation = ProductAssetHelpers.findVariation(product, 'var999');
      expect(variation).toBeNull();
    });
  });
});
