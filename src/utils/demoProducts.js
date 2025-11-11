// Demo products with REAL clothing images for virtual try-on feature
// Using high-quality product photos from CDN
// Prices in INR (Indian Rupees)

const demoProductsData = [
  {
    id: 'shirt-1',
    name: 'Classic White Shirt',
    category: 'clothing',
    subcategory: 'shirt',
    description: 'Crisp white button-down shirt perfect for any occasion',
    base_price: 1799,
    colorHex: '#F8FAFC',
    variations: [{
      id: 'shirt-1-var-1',
      color: 'White',
      colorHex: '#F8FAFC',
      size: 'M',
      overlay_image_url: '/api/placeholder/300/400'
    }]
  },
  {
    id: 'shirt-2', 
    name: 'Navy Blue Shirt',
    category: 'clothing',
    subcategory: 'shirt',
    description: 'Professional navy blue dress shirt',
    base_price: 1999,
    colorHex: '#1E3A8A',
    variations: [{
      id: 'shirt-2-var-1',
      color: 'Navy Blue',
      colorHex: '#1E3A8A',
      size: 'M',
      overlay_image_url: '/api/placeholder/300/400'
    }]
  },
  {
    id: 'tshirt-1',
    name: 'Red T-Shirt',
    category: 'clothing', 
    subcategory: 'tshirt',
    description: 'Comfortable red cotton t-shirt',
    base_price: 899,
    colorHex: '#DC2626',
    variations: [{
      id: 'tshirt-1-var-1',
      color: 'Red',
      colorHex: '#DC2626',
      size: 'M',
      overlay_image_url: '/api/placeholder/300/400'
    }]
  },
  {
    id: 'tshirt-2',
    name: 'Green T-Shirt', 
    category: 'clothing',
    subcategory: 'tshirt',
    description: 'Fresh green casual t-shirt',
    base_price: 899,
    colorHex: '#16A34A',
    variations: [{
      id: 'tshirt-2-var-1',
      color: 'Green',
      colorHex: '#16A34A',
      size: 'M',
      overlay_image_url: '/api/placeholder/300/400'
    }]
  },
  {
    id: 'jacket-1',
    name: 'Black Jacket',
    category: 'clothing',
    subcategory: 'jacket', 
    description: 'Stylish black blazer jacket',
    base_price: 3999,
    colorHex: '#1F2937',
    variations: [{
      id: 'jacket-1-var-1',
      color: 'Black',
      colorHex: '#1F2937',
      size: 'M',
      overlay_image_url: '/api/placeholder/300/400'
    }]
  },
  {
    id: 'dress-1',
    name: 'Purple Dress',
    category: 'clothing',
    subcategory: 'dress',
    description: 'Elegant purple evening dress',
    base_price: 2999,
    colorHex: '#7C3AED',
    variations: [{
      id: 'dress-1-var-1',
      color: 'Purple',
      colorHex: '#7C3AED',
      size: 'M',
      overlay_image_url: '/api/placeholder/300/400'
    }]
  }
];

// Initialize demo products with proper structure
export const initializeDemoProducts = () => {
  const products = [];

  demoProductsData.forEach(product => {
    product.variations.forEach(variation => {
      products.push({
        id: variation.id,
        product_id: product.id,
        name: product.name,
        category: product.category,
        subcategory: product.subcategory,
        description: product.description,
        base_price: product.base_price,
        scale_factor: product.scale_factor,
        color: variation.color,
        size: variation.size,
        image_url: variation.overlay_image_url,
        overlay_image_url: variation.overlay_image_url,
        colorHex: product.colorHex || variation.colorHex || '#4F46E5',
        variations: product.variations.map(v => ({
          id: v.id,
          color: v.color,
          size: v.size,
          variation_name: v.variation_name,
          price_modifier: v.price_modifier,
          stock_quantity: v.stock_quantity,
          is_available: v.is_available,
          overlay_image_url: v.overlay_image_url
        }))
      });
    });
  });

  return products;
};

export default demoProductsData;
