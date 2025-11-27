// Demo products with REAL clothing images for virtual try-on feature
// Using high-quality product photos from CDN
// Prices in INR (Indian Rupees)

const demoProductsData = [
  {
    id: 'shirt-1',
    name: 'Classic White Shirt',
    category: 'clothing',
    subcategory: 'shirt',
    description: 'Crisp white button-down shirt',
    base_price: 1799,
    colorHex: '#FFFFFF',
    overlay_image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=500&fit=crop',
    variations: [{
      id: 'shirt-1-var-1',
      color: 'White',
      colorHex: '#FFFFFF',
      size: 'M',
      overlay_image_url: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400&h=500&fit=crop'
    }]
  },
  {
    id: 'tshirt-1',
    name: 'Red T-Shirt',
    category: 'clothing',
    subcategory: 'tshirt',
    description: 'Comfortable red t-shirt',
    base_price: 899,
    colorHex: '#DC2626',
    overlay_image_url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=500&fit=crop',
    variations: [{
      id: 'tshirt-1-var-1',
      color: 'Red',
      colorHex: '#DC2626',
      size: 'M',
      overlay_image_url: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=500&fit=crop'
    }]
  },
  {
    id: 'jacket-1',
    name: 'Black Jacket',
    category: 'clothing',
    subcategory: 'jacket',
    description: 'Stylish black jacket',
    base_price: 3999,
    colorHex: '#000000',
    overlay_image_url: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=500&fit=crop',
    variations: [{
      id: 'jacket-1-var-1',
      color: 'Black',
      colorHex: '#000000',
      size: 'M',
      overlay_image_url: 'https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=500&fit=crop'
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
