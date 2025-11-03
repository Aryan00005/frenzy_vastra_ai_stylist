// Demo products with REAL clothing images for virtual try-on feature
// Using high-quality product photos from CDN
// Prices in INR (Indian Rupees)

const demoProductsData = [
  {
    id: 'demo-1',
    name: 'Floral Summer Dress',
    category: 'clothing',
    subcategory: 'dress',
    description: 'Beautiful floral print summer dress perfect for outdoor events',
    base_price: 2499,
    scale_factor: 1.2,
    variations: [
      {
        id: 'demo-1-var-1',
        color: 'Floral Blue',
        size: 'M',
        variation_name: 'Floral Blue - M',
        price_modifier: 0,
        stock_quantity: 10,
        is_available: true,
        overlay_image_url: 'https://public.youware.com/users-website-assets/prod/afe1f57c-8b6d-41b8-a571-1b096865a82c/ccd1fb334b9a4a539afcdc5b005b8ec0.jpg'
      },
      {
        id: 'demo-1-var-2',
        color: 'Floral Pink',
        size: 'M',
        variation_name: 'Floral Pink - M',
        price_modifier: 200,
        stock_quantity: 8,
        is_available: true,
        overlay_image_url: 'https://public.youware.com/users-website-assets/prod/afe1f57c-8b6d-41b8-a571-1b096865a82c/ccd1fb334b9a4a539afcdc5b005b8ec0.jpg'
      }
    ]
  },
  {
    id: 'demo-2',
    name: 'Classic White Shirt',
    category: 'clothing',
    subcategory: 'shirt',
    description: 'Elegant white button-down shirt for formal and casual occasions',
    base_price: 1799,
    scale_factor: 1.0,
    variations: [
      {
        id: 'demo-2-var-1',
        color: 'White',
        size: 'M',
        variation_name: 'White - M',
        price_modifier: 0,
        stock_quantity: 15,
        is_available: true,
        overlay_image_url: 'https://public.youware.com/users-website-assets/prod/afe1f57c-8b6d-41b8-a571-1b096865a82c/b1c435f398dc47488e3942f5bf22abde.jpg'
      }
    ]
  },
  {
    id: 'demo-3',
    name: 'Casual T-Shirt',
    category: 'clothing',
    subcategory: 'shirt',
    description: 'Comfortable casual t-shirt perfect for everyday wear',
    base_price: 999,
    scale_factor: 1.0,
    variations: [
      {
        id: 'demo-3-var-1',
        color: 'Blue Polo',
        size: 'M',
        variation_name: 'Blue Polo - M',
        price_modifier: 0,
        stock_quantity: 20,
        is_available: true,
        overlay_image_url: 'https://public.youware.com/users-website-assets/prod/afe1f57c-8b6d-41b8-a571-1b096865a82c/8005ea413f004d3393b11f7ea56e74e7.jpg'
      }
    ]
  },
  {
    id: 'demo-4',
    name: 'Elegant Black Dress',
    category: 'clothing',
    subcategory: 'dress',
    description: 'Sophisticated black dress for evening events',
    base_price: 3299,
    scale_factor: 1.2,
    variations: [
      {
        id: 'demo-4-var-1',
        color: 'Black',
        size: 'M',
        variation_name: 'Black - M',
        price_modifier: 0,
        stock_quantity: 12,
        is_available: true,
        overlay_image_url: 'https://public.youware.com/users-website-assets/prod/afe1f57c-8b6d-41b8-a571-1b096865a82c/50b357dceccb4be89f9a4b98d247bc46.jpg'
      }
    ]
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
        scale_factor: product.scale_factor,
        color: variation.color,
        size: variation.size,
        overlay_image_url: variation.overlay_image_url,
        variations: product.variations.map(v => ({
          id: v.id,
          color: v.color,
          size: v.size,
          overlay_image_url: v.overlay_image_url
        }))
      });
    });
  });

  return products;
};

export default demoProductsData;
