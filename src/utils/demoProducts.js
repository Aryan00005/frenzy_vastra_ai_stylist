// Demo products with REAL clothing images for virtual try-on feature
// Using high-quality product photos from Pixabay

const demoProductsData = [
  {
    id: 'demo-1',
    name: 'Floral Summer Dress',
    category: 'clothing',
    subcategory: 'dress',
    description: 'Beautiful floral print summer dress perfect for outdoor events',
    scale_factor: 1.2,
    variations: [
      {
        id: 'demo-1-var-1',
        color: 'Floral Blue',
        size: 'M',
        overlay_image_url: 'https://pixabay.com/get/gaa674ebdaee236e7228fc0d7e4c58c5bc71bcc64dff58ee495ccf081256fcd5d54afcdda1faa3d441d3eec8a1e26e435777f3e088807696e66e7538c0baada4b_1280.jpg'
      },
      {
        id: 'demo-1-var-2',
        color: 'Floral Pink',
        size: 'M',
        overlay_image_url: 'https://pixabay.com/get/g819e77c06a951c5254e424d741cdc6727c17324c688c27178ebbef74f4ef1dbff1114b1281d9ee954ed110ac366f7d150e667421fa6af661442e23ab9990a9ae_1280.jpg'
      }
    ]
  },
  {
    id: 'demo-2',
    name: 'Classic White Shirt',
    category: 'clothing',
    subcategory: 'shirt',
    description: 'Elegant white button-down shirt for formal and casual occasions',
    scale_factor: 1.0,
    variations: [
      {
        id: 'demo-2-var-1',
        color: 'White',
        size: 'M',
        overlay_image_url: 'https://pixabay.com/get/g7177fdc23e1f635c8ec780f7aaf2bfea32e301a6f19186dfef5835cd9d435124274bda4fe846fc8968ea67676c913ffa6fc3bc6ddbb35883a2b8c56aa5870a4d_1280.jpg'
      }
    ]
  },
  {
    id: 'demo-3',
    name: 'Casual T-Shirt',
    category: 'clothing',
    subcategory: 'shirt',
    description: 'Comfortable casual t-shirt perfect for everyday wear',
    scale_factor: 1.0,
    variations: [
      {
        id: 'demo-3-var-1',
        color: 'White',
        size: 'M',
        overlay_image_url: 'https://pixabay.com/get/ga56f52ffbd5e34d94c585295e9871cd9c62f5d7e503802001b9bbcaee1e389150c561b619b941497862dbc88ee42fc65307b19f8a72b238c94093e6a1f43af68_1280.jpg'
      },
      {
        id: 'demo-3-var-2',
        color: 'Gray',
        size: 'M',
        overlay_image_url: 'https://pixabay.com/get/ge1bb1d6d59c39644c09aa235843f3da973d997be7ae9cad53b2037407672fb46e96ebdfa909eb8f8a71ae36a7f53d9d467de15e86a1a0619f339343adcd6909f_1280.jpg'
      }
    ]
  },
  {
    id: 'demo-4',
    name: 'Elegant Black Dress',
    category: 'clothing',
    subcategory: 'dress',
    description: 'Sophisticated black dress for evening events',
    scale_factor: 1.2,
    variations: [
      {
        id: 'demo-4-var-1',
        color: 'Black',
        size: 'M',
        overlay_image_url: 'https://pixabay.com/get/g66febf29dffb3708b40962f57b1b405385eb8ec64ea891b691fc39103f34193d2497018de488ca1f3b04993df22e3979adc1c3ecb530bc9094aae824626ea34c_1280.jpg'
      }
    ]
  },
  {
    id: 'demo-5',
    name: 'Traditional Ao Dai',
    category: 'clothing',
    subcategory: 'dress',
    description: 'Beautiful traditional Vietnamese Ao Dai dress',
    scale_factor: 1.2,
    variations: [
      {
        id: 'demo-5-var-1',
        color: 'White',
        size: 'M',
        overlay_image_url: 'https://pixabay.com/get/gb40d59fcd6057fff7a80c1426bfe15ba5bd4eee3c3b596df2f9c3756065e39dba4103a3e5865d5088c87cf2c0b1194e65ab0704c1f014cd8f7ec5672ec0f6f58_1280.jpg'
      },
      {
        id: 'demo-5-var-2',
        color: 'Blue',
        size: 'M',
        overlay_image_url: 'https://pixabay.com/get/g8cfafbcbc8566d983331e0bd317b0688e7d93dfa58b57a5f434542d45c048fb9d5cdf2bc7bda2ce9f39ff3756c864cb3c32d0043a4020f74077d11bdd553e11b_1280.jpg'
      }
    ]
  },
  {
    id: 'demo-6',
    name: 'Summer Yellow Dress',
    category: 'clothing',
    subcategory: 'dress',
    description: 'Bright yellow summer dress with floral accents',
    scale_factor: 1.2,
    variations: [
      {
        id: 'demo-6-var-1',
        color: 'Yellow',
        size: 'M',
        overlay_image_url: 'https://pixabay.com/get/ga90cbc4610c555b7b312b21757b4a5591ddde5ce8d1851daccaaa4c209991d75fc744e367bdff125a571f81735b588bb57ed2c8a178c5591d3fe373a71363401_1280.jpg'
      }
    ]
  },
  {
    id: 'demo-7',
    name: 'Casual Street Fashion',
    category: 'clothing',
    subcategory: 'shirt',
    description: 'Modern casual outfit for street fashion',
    scale_factor: 1.0,
    variations: [
      {
        id: 'demo-7-var-1',
        color: 'Multi',
        size: 'M',
        overlay_image_url: 'https://pixabay.com/get/g1ae2434a3e4332d365e2d2b7a4a5a414c3faf07828d9a312162dd721aa5b73734385eb6525a3578fb11c13e1a0989726ebc13e2531d6570f54a3ecf1ca7a1388_1280.jpg'
      }
    ]
  },
  {
    id: 'demo-8',
    name: 'Elegant Model Dress',
    category: 'clothing',
    subcategory: 'dress',
    description: 'Fashionable model dress for photoshoots',
    scale_factor: 1.2,
    variations: [
      {
        id: 'demo-8-var-1',
        color: 'Light',
        size: 'M',
        overlay_image_url: 'https://pixabay.com/get/g00319e239223545c6ac1c72389d0cdc9d8fafcc756b89a2acf48c84547f1b922bee5532907b969306a86257e7a1ef7b81cef8d69da221f37d01a863ec297ad2e_1280.jpg'
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
