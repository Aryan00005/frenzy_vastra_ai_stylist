import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ActionButtons = ({ 
  product = {},
  selectedSize = "",
  selectedColor = "",
  selectedQuantity = 1,
  onAddToCart,
  onAddToWishlist,
  onShare,
  onClose,
  isLoading = false
}) => {
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);

  const handleAddToCart = async () => {
    if (!selectedSize || !selectedColor) {
      return;
    }

    setIsAddingToCart(true);
    
    try {
      if (onAddToCart) {
        await onAddToCart({
          product,
          size: selectedSize,
          color: selectedColor,
          quantity: selectedQuantity
        });
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const handleAddToWishlist = async () => {
    setIsAddingToWishlist(true);
    
    try {
      if (onAddToWishlist) {
        await onAddToWishlist(product);
      }
    } catch (error) {
      console.error('Error adding to wishlist:', error);
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const handleShare = (platform) => {
    const productUrl = `${window.location?.origin}/product/${product?.id}`;
    const shareText = `Check out this ${product?.name} - $${product?.price}`;
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(productUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(productUrl)}`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(productUrl)}&description=${encodeURIComponent(shareText)}`,
      whatsapp: `https://wa.me/?text=${encodeURIComponent(`${shareText} ${productUrl}`)}`,
      copy: productUrl
    };

    if (platform === 'copy') {
      navigator.clipboard?.writeText(shareUrls?.copy);
      setShowShareOptions(false);
      return;
    }

    window.open(shareUrls?.[platform], '_blank', 'width=600,height=400');
    setShowShareOptions(false);
    
    if (onShare) {
      onShare(platform);
    }
  };

  const canAddToCart = selectedSize && selectedColor && !isLoading;
  const isOutOfStock = product?.stock === 0;

  return (
    <div className="space-y-4">
      {/* Size/Color Selection Warning */}
      {(!selectedSize || !selectedColor) && (
        <div className="bg-warning/10 border border-warning/20 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Icon name="AlertTriangle" size={16} color="var(--color-warning)" />
            <span className="text-sm text-warning">
              Please select {!selectedSize && !selectedColor ? 'size and color' : !selectedSize ? 'size' : 'color'} to continue
            </span>
          </div>
        </div>
      )}
      {/* Out of Stock Warning */}
      {isOutOfStock && (
        <div className="bg-error/10 border border-error/20 rounded-lg p-3">
          <div className="flex items-center space-x-2">
            <Icon name="XCircle" size={16} color="var(--color-error)" />
            <span className="text-sm text-error">This item is currently out of stock</span>
          </div>
        </div>
      )}
      {/* Primary Actions */}
      <div className="flex space-x-3">
        <Button
          variant="default"
          className="flex-1"
          onClick={handleAddToCart}
          disabled={!canAddToCart || isOutOfStock}
          loading={isAddingToCart}
          iconName="ShoppingCart"
          iconPosition="left"
        >
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </Button>
        
        <Button
          variant="outline"
          onClick={handleAddToWishlist}
          loading={isAddingToWishlist}
          iconName="Heart"
          className="w-12"
          aria-label="Add to wishlist"
        />
      </div>
      {/* Secondary Actions */}
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => window.open(`/product/${product?.id}`, '_blank')}
          iconName="ExternalLink"
          iconPosition="left"
        >
          View Full Page
        </Button>
        
        <div className="relative">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowShareOptions(!showShareOptions)}
            iconName="Share2"
            className="w-10"
            aria-label="Share product"
          />
          
          {/* Share Options Dropdown */}
          {showShareOptions && (
            <div className="absolute bottom-full right-0 mb-2 bg-surface border border-border rounded-lg shadow-modal p-2 min-w-48 z-10">
              <div className="space-y-1">
                <button
                  onClick={() => handleShare('facebook')}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-text-primary hover:bg-muted rounded-lg transition-smooth"
                >
                  <Icon name="Facebook" size={16} color="#1877F2" />
                  <span>Share on Facebook</span>
                </button>
                
                <button
                  onClick={() => handleShare('twitter')}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-text-primary hover:bg-muted rounded-lg transition-smooth"
                >
                  <Icon name="Twitter" size={16} color="#1DA1F2" />
                  <span>Share on Twitter</span>
                </button>
                
                <button
                  onClick={() => handleShare('pinterest')}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-text-primary hover:bg-muted rounded-lg transition-smooth"
                >
                  <Icon name="Image" size={16} color="#E60023" />
                  <span>Pin to Pinterest</span>
                </button>
                
                <button
                  onClick={() => handleShare('whatsapp')}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-text-primary hover:bg-muted rounded-lg transition-smooth"
                >
                  <Icon name="MessageCircle" size={16} color="#25D366" />
                  <span>Share on WhatsApp</span>
                </button>
                
                <hr className="border-border my-1" />
                
                <button
                  onClick={() => handleShare('copy')}
                  className="flex items-center space-x-2 w-full px-3 py-2 text-sm text-text-primary hover:bg-muted rounded-lg transition-smooth"
                >
                  <Icon name="Copy" size={16} />
                  <span>Copy Link</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Purchase Info */}
      <div className="space-y-2 pt-2 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Subtotal:</span>
          <span className="font-medium text-primary">
            ${(product?.price * selectedQuantity)?.toFixed(2)}
          </span>
        </div>
        
        <div className="flex items-center space-x-2 text-xs text-text-secondary">
          <Icon name="Truck" size={12} />
          <span>Free shipping on orders over $50</span>
        </div>
        
        <div className="flex items-center space-x-2 text-xs text-text-secondary">
          <Icon name="RotateCcw" size={12} />
          <span>30-day return policy</span>
        </div>
        
        <div className="flex items-center space-x-2 text-xs text-text-secondary">
          <Icon name="Shield" size={12} />
          <span>Secure checkout guaranteed</span>
        </div>
      </div>
      {/* Close Button */}
      <div className="pt-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={onClose}
          iconName="X"
          iconPosition="left"
        >
          Continue Shopping
        </Button>
      </div>
    </div>
  );
};

export default ActionButtons;