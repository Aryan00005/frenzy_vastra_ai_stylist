import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ProductCard = ({ 
  product, 
  onQuickView, 
  onAddToCart, 
  isRecommended = false,
  className = '' 
}) => {
  const [selectedSize, setSelectedSize] = useState('');
  const [isHovered, setIsHovered] = useState(false);

  const mockProduct = product || {
    id: 1,
    sku: 'TSH-001',
    name: 'Classic Cotton Crew Neck T-Shirt',
    price: 2499,
    originalPrice: 3299,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
    images: [
      'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400'
    ],
    colors: ['black', 'white', 'gray', 'navy'],
    sizes: ['S', 'M', 'L', 'XL'],
    fit: 'regular',
    rating: 4.5,
    reviewCount: 128,
    isOnSale: true,
    matchScore: 95
  };

  const handleSizeSelect = (size) => {
    setSelectedSize(size);
  };

  const handleAddToCart = () => {
    if (!selectedSize) {
      alert('Please select a size first');
      return;
    }
    
    if (onAddToCart) {
      onAddToCart({
        ...mockProduct,
        selectedSize
      });
    }
  };

  const handleQuickView = () => {
    if (onQuickView) {
      onQuickView(mockProduct);
    }
  };

  const getColorClass = (color) => {
    const colorMap = {
      black: 'bg-gray-900',
      white: 'bg-white border border-gray-300',
      gray: 'bg-gray-500',
      navy: 'bg-blue-900',
      red: 'bg-red-500',
      blue: 'bg-blue-500',
      green: 'bg-green-500'
    };
    return colorMap?.[color] || 'bg-gray-400';
  };

  const discountPercentage = mockProduct?.originalPrice 
    ? Math.round(((mockProduct?.originalPrice - mockProduct?.price) / mockProduct?.originalPrice) * 100)
    : 0;

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    })?.format(price);
  };

  return (
    <div 
      className={`bg-surface border border-border rounded-lg shadow-subtle hover:shadow-modal transition-all duration-300 overflow-hidden group ${className}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-muted">
        <Image
          src={mockProduct?.image}
          alt={mockProduct?.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        
        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col space-y-1">
          {isRecommended && (
            <span className="bg-accent text-accent-foreground px-2 py-1 rounded-full text-xs font-medium flex items-center">
              <Icon name="Sparkles" size={12} className="mr-1" />
              AI Pick
            </span>
          )}
          {mockProduct?.isOnSale && discountPercentage > 0 && (
            <span className="bg-error text-error-foreground px-2 py-1 rounded-full text-xs font-medium">
              -{discountPercentage}%
            </span>
          )}
        </div>

        {/* Match Score */}
        {mockProduct?.matchScore && (
          <div className="absolute top-2 right-2 bg-success text-success-foreground px-2 py-1 rounded-full text-xs font-medium">
            {mockProduct?.matchScore}% match
          </div>
        )}

        {/* Quick View Button */}
        <div className={`absolute inset-0 bg-black/20 flex items-center justify-center transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <Button
            variant="default"
            size="sm"
            onClick={handleQuickView}
            iconName="Eye"
            iconPosition="left"
          >
            Quick View
          </Button>
        </div>
      </div>
      {/* Product Info */}
      <div className="p-4">
        {/* SKU and Rating */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-text-secondary font-mono">{mockProduct?.sku}</span>
          <div className="flex items-center space-x-1">
            <Icon name="Star" size={12} color="var(--color-warning)" />
            <span className="text-xs text-text-secondary">
              {mockProduct?.rating} ({mockProduct?.reviewCount})
            </span>
          </div>
        </div>

        {/* Product Name */}
        <h3 className="font-medium text-primary mb-2 line-clamp-2 text-sm">
          {mockProduct?.name}
        </h3>

        {/* Price */}
        <div className="flex items-center space-x-2 mb-3">
          <span className="text-lg font-semibold text-primary">
            {formatPrice(mockProduct?.price)}
          </span>
          {mockProduct?.originalPrice && mockProduct?.originalPrice > mockProduct?.price && (
            <span className="text-sm text-text-secondary line-through">
              {formatPrice(mockProduct?.originalPrice)}
            </span>
          )}
        </div>

        {/* Colors */}
        <div className="mb-3">
          <div className="flex items-center space-x-1 mb-1">
            <span className="text-xs text-text-secondary">Colors:</span>
          </div>
          <div className="flex space-x-1">
            {mockProduct?.colors?.slice(0, 4)?.map((color, index) => (
              <div
                key={index}
                className={`w-4 h-4 rounded-full ${getColorClass(color)} border border-border`}
                title={color}
              />
            ))}
            {mockProduct?.colors?.length > 4 && (
              <span className="text-xs text-text-secondary ml-1">
                +{mockProduct?.colors?.length - 4}
              </span>
            )}
          </div>
        </div>

        {/* Sizes */}
        <div className="mb-4">
          <div className="flex items-center space-x-1 mb-2">
            <span className="text-xs text-text-secondary">Size:</span>
            <span className="text-xs text-accent capitalize">{mockProduct?.fit} fit</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {mockProduct?.sizes?.map((size) => (
              <button
                key={size}
                onClick={() => handleSizeSelect(size)}
                className={`px-2 py-1 text-xs border rounded transition-smooth ${
                  selectedSize === size
                    ? 'border-accent bg-accent text-accent-foreground'
                    : 'border-border text-text-secondary hover:border-accent'
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        </div>

        {/* Add to Cart Button */}
        <Button
          variant="outline"
          size="sm"
          fullWidth
          onClick={handleAddToCart}
          iconName="ShoppingCart"
          iconPosition="left"
          disabled={!selectedSize}
        >
          {selectedSize ? `Add ${selectedSize} to Cart` : 'Select Size'}
        </Button>
      </div>
    </div>
  );
};

export default ProductCard;