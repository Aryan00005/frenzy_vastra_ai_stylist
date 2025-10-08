import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ProductImageGallery = ({ 
  images = [], 
  productName = "", 
  onImageChange,
  currentImageIndex = 0 
}) => {
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });

  const handlePreviousImage = () => {
    const newIndex = currentImageIndex === 0 ? images?.length - 1 : currentImageIndex - 1;
    if (onImageChange) {
      onImageChange(newIndex);
    }
  };

  const handleNextImage = () => {
    const newIndex = currentImageIndex === images?.length - 1 ? 0 : currentImageIndex + 1;
    if (onImageChange) {
      onImageChange(newIndex);
    }
  };

  const handleThumbnailClick = (index) => {
    if (onImageChange) {
      onImageChange(index);
    }
  };

  const handleMouseMove = (e) => {
    if (!isZoomed) return;
    
    const rect = e?.currentTarget?.getBoundingClientRect();
    const x = ((e?.clientX - rect?.left) / rect?.width) * 100;
    const y = ((e?.clientY - rect?.top) / rect?.height) * 100;
    
    setZoomPosition({ x, y });
  };

  const toggleZoom = () => {
    setIsZoomed(!isZoomed);
  };

  if (!images?.length) {
    return (
      <div className="w-full h-96 bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center">
          <Icon name="ImageOff" size={48} color="var(--color-text-secondary)" />
          <p className="text-text-secondary mt-2">No images available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image Display */}
      <div className="relative bg-muted rounded-lg overflow-hidden">
        <div 
          className={`relative aspect-square cursor-${isZoomed ? 'zoom-out' : 'zoom-in'}`}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setIsZoomed(false)}
          onClick={toggleZoom}
        >
          <Image
            src={images?.[currentImageIndex]}
            alt={`${productName} - Image ${currentImageIndex + 1}`}
            className={`w-full h-full object-cover transition-transform duration-300 ${
              isZoomed ? 'scale-150' : 'scale-100'
            }`}
            style={isZoomed ? {
              transformOrigin: `${zoomPosition?.x}% ${zoomPosition?.y}%`
            } : {}}
          />
          
          {/* Zoom Indicator */}
          <div className="absolute top-4 right-4">
            <div className="bg-surface/80 rounded-full p-2">
              <Icon 
                name={isZoomed ? "ZoomOut" : "ZoomIn"} 
                size={16} 
                color="var(--color-text-secondary)" 
              />
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        {images?.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-surface/80 hover:bg-surface w-10 h-10"
              onClick={handlePreviousImage}
              aria-label="Previous image"
            >
              <Icon name="ChevronLeft" size={20} />
            </Button>
            
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-surface/80 hover:bg-surface w-10 h-10"
              onClick={handleNextImage}
              aria-label="Next image"
            >
              <Icon name="ChevronRight" size={20} />
            </Button>
          </>
        )}

        {/* Image Counter */}
        {images?.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-surface/80 rounded-full px-3 py-1">
            <span className="text-sm text-text-primary">
              {currentImageIndex + 1} / {images?.length}
            </span>
          </div>
        )}
      </div>
      {/* Thumbnail Navigation */}
      {images?.length > 1 && (
        <div className="flex space-x-2 overflow-x-auto pb-2">
          {images?.map((image, index) => (
            <button
              key={index}
              onClick={() => handleThumbnailClick(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-smooth ${
                index === currentImageIndex 
                  ? 'border-accent' :'border-transparent hover:border-border'
              }`}
            >
              <Image
                src={image}
                alt={`${productName} - Thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProductImageGallery;