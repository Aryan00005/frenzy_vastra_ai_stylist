import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProductInfo = ({ 
  product = {},
  selectedSize = "",
  selectedColor = "",
  selectedQuantity = 1,
  onSizeSelect,
  onColorSelect,
  onQuantityChange,
  userAnalysis = null
}) => {
  const [showSizeGuide, setShowSizeGuide] = useState(false);

  const sizeGuideData = [
    { size: "XS", chest: "32-34", waist: "26-28", length: "26" },
    { size: "S", chest: "34-36", waist: "28-30", length: "27" },
    { size: "M", chest: "36-38", waist: "30-32", length: "28" },
    { size: "L", chest: "38-40", waist: "32-34", length: "29" },
    { size: "XL", chest: "40-42", waist: "34-36", length: "30" },
    { size: "XXL", chest: "42-44", waist: "36-38", length: "31" }
  ];

  const handleQuantityDecrease = () => {
    if (selectedQuantity > 1 && onQuantityChange) {
      onQuantityChange(selectedQuantity - 1);
    }
  };

  const handleQuantityIncrease = () => {
    if (selectedQuantity < 10 && onQuantityChange) {
      onQuantityChange(selectedQuantity + 1);
    }
  };

  const getStockStatus = (size) => {
    const sizeStock = product?.sizeStock?.[size] || 0;
    if (sizeStock === 0) return { status: 'out-of-stock', text: 'Out of Stock' };
    if (sizeStock <= 3) return { status: 'low-stock', text: `Only ${sizeStock} left` };
    return { status: 'in-stock', text: 'In Stock' };
  };

  const getRecommendedSize = () => {
    if (userAnalysis?.recommendedSize) {
      return userAnalysis?.recommendedSize;
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Product Header */}
      <div>
        <div className="flex items-start justify-between mb-2">
          <h1 className="text-2xl font-bold text-primary">{product?.name}</h1>
          <Button
            variant="ghost"
            size="icon"
            className="text-text-secondary hover:text-error"
            aria-label="Add to wishlist"
          >
            <Icon name="Heart" size={20} />
          </Button>
        </div>
        
        <div className="flex items-center space-x-4 mb-3">
          <span className="text-sm text-text-secondary">SKU: {product?.sku}</span>
          <div className="flex items-center space-x-1">
            {[...Array(5)]?.map((_, i) => (
              <Icon
                key={i}
                name="Star"
                size={14}
                color={i < (product?.rating || 4) ? "var(--color-warning)" : "var(--color-border)"}
              />
            ))}
            <span className="text-sm text-text-secondary ml-1">
              ({product?.reviewCount || 127} reviews)
            </span>
          </div>
        </div>
        
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold text-accent">${product?.price}</span>
          {product?.originalPrice && product?.originalPrice > product?.price && (
            <span className="text-lg text-text-secondary line-through">
              ${product?.originalPrice}
            </span>
          )}
        </div>
      </div>
      {/* AI Recommendations */}
      {userAnalysis && (
        <div className="bg-accent/10 border border-accent/20 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="Sparkles" size={16} color="var(--color-accent)" />
            <span className="font-medium text-accent">AI Styling Recommendation</span>
          </div>
          <p className="text-sm text-text-secondary mb-2">
            Based on your body analysis: {userAnalysis?.bodyType}
          </p>
          {getRecommendedSize() && (
            <p className="text-sm text-primary font-medium">
              Recommended size: {getRecommendedSize()}
            </p>
          )}
        </div>
      )}
      {/* Size Selection */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium text-primary">Size</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowSizeGuide(!showSizeGuide)}
            iconName="Ruler"
            iconPosition="left"
          >
            Size Guide
          </Button>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-3">
          {(product?.availableSizes || ["XS", "S", "M", "L", "XL", "XXL"])?.map((size) => {
            const stockInfo = getStockStatus(size);
            const isRecommended = getRecommendedSize() === size;
            const isSelected = selectedSize === size;
            const isOutOfStock = stockInfo?.status === 'out-of-stock';
            
            return (
              <button
                key={size}
                onClick={() => !isOutOfStock && onSizeSelect && onSizeSelect(size)}
                disabled={isOutOfStock}
                className={`relative p-3 rounded-lg border-2 transition-smooth text-center ${
                  isSelected
                    ? 'border-accent bg-accent text-accent-foreground'
                    : isOutOfStock
                    ? 'border-border bg-muted text-text-secondary cursor-not-allowed' :'border-border hover:border-accent'
                } ${isRecommended ? 'ring-2 ring-accent/30' : ''}`}
              >
                <span className="font-medium">{size}</span>
                {isRecommended && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent rounded-full"></div>
                )}
                {stockInfo?.status === 'low-stock' && !isOutOfStock && (
                  <span className="text-xs text-warning block">Low Stock</span>
                )}
                {isOutOfStock && (
                  <span className="text-xs block">Out of Stock</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Size Guide */}
        {showSizeGuide && (
          <div className="bg-muted rounded-lg p-4 mt-3">
            <h4 className="font-medium text-primary mb-3">Size Guide (inches)</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2">Size</th>
                    <th className="text-left py-2">Chest</th>
                    <th className="text-left py-2">Waist</th>
                    <th className="text-left py-2">Length</th>
                  </tr>
                </thead>
                <tbody>
                  {sizeGuideData?.map((row) => (
                    <tr key={row?.size} className="border-b border-border/50">
                      <td className="py-2 font-medium">{row?.size}</td>
                      <td className="py-2">{row?.chest}</td>
                      <td className="py-2">{row?.waist}</td>
                      <td className="py-2">{row?.length}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
      {/* Color Selection */}
      <div>
        <h3 className="font-medium text-primary mb-3">Color</h3>
        <div className="flex flex-wrap gap-2">
          {(product?.availableColors || [
            { name: "Black", hex: "#000000" },
            { name: "White", hex: "#FFFFFF" },
            { name: "Navy", hex: "#1E3A8A" },
            { name: "Gray", hex: "#6B7280" },
            { name: "Red", hex: "#DC2626" }
          ])?.map((color) => (
            <button
              key={color?.name}
              onClick={() => onColorSelect && onColorSelect(color?.name)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg border-2 transition-smooth ${
                selectedColor === color?.name
                  ? 'border-accent bg-accent/10' :'border-border hover:border-accent'
              }`}
            >
              <div
                className="w-4 h-4 rounded-full border border-border"
                style={{ backgroundColor: color?.hex }}
              />
              <span className="text-sm font-medium">{color?.name}</span>
            </button>
          ))}
        </div>
      </div>
      {/* Fit Type */}
      <div>
        <h3 className="font-medium text-primary mb-2">Fit</h3>
        <div className="bg-muted rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Icon name="Shirt" size={16} color="var(--color-text-secondary)" />
            <span className="text-sm font-medium text-primary">
              {product?.fitType || "Regular Fit"}
            </span>
          </div>
          <p className="text-xs text-text-secondary mt-1">
            {product?.fitDescription || "Classic comfortable fit with room to move"}
          </p>
        </div>
      </div>
      {/* Quantity Selection */}
      <div>
        <h3 className="font-medium text-primary mb-3">Quantity</h3>
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            size="icon"
            onClick={handleQuantityDecrease}
            disabled={selectedQuantity <= 1}
            className="w-10 h-10"
          >
            <Icon name="Minus" size={16} />
          </Button>
          
          <span className="text-lg font-medium text-primary w-8 text-center">
            {selectedQuantity}
          </span>
          
          <Button
            variant="outline"
            size="icon"
            onClick={handleQuantityIncrease}
            disabled={selectedQuantity >= 10}
            className="w-10 h-10"
          >
            <Icon name="Plus" size={16} />
          </Button>
        </div>
      </div>
      {/* Product Features */}
      {product?.features && (
        <div>
          <h3 className="font-medium text-primary mb-3">Features</h3>
          <ul className="space-y-2">
            {product?.features?.map((feature, index) => (
              <li key={index} className="flex items-center space-x-2 text-sm text-text-secondary">
                <Icon name="Check" size={14} color="var(--color-success)" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {/* Description */}
      {product?.description && (
        <div>
          <h3 className="font-medium text-primary mb-2">Description</h3>
          <p className="text-sm text-text-secondary leading-relaxed">
            {product?.description}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProductInfo;