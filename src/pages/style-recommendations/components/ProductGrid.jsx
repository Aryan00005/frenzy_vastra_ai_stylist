import React, { useState, useEffect } from 'react';
import ProductCard from './ProductCard';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ProductGrid = ({ 
  products = [], 
  filters = {}, 
  onProductSelect, 
  onAddToCart,
  isLoading = false 
}) => {
  const [displayedProducts, setDisplayedProducts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 12;

  // Mock products data
  const mockProducts = products?.length > 0 ? products : [
    {
      id: 1,
      sku: 'TSH-001',
      name: 'Classic Cotton Crew Neck T-Shirt',
      price: 29.99,
      originalPrice: 39.99,
      image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400',
      colors: ['black', 'white', 'gray', 'navy'],
      sizes: ['S', 'M', 'L', 'XL'],
      fit: 'regular',
      rating: 4.5,
      reviewCount: 128,
      isOnSale: true,
      matchScore: 95,
      isRecommended: true
    },
    {
      id: 2,
      sku: 'TSH-002',
      name: 'Premium V-Neck Athletic Fit',
      price: 34.99,
      image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400',
      colors: ['navy', 'black', 'white'],
      sizes: ['S', 'M', 'L', 'XL', 'XXL'],
      fit: 'slim',
      rating: 4.7,
      reviewCount: 89,
      matchScore: 92,
      isRecommended: true
    },
    {
      id: 3,
      sku: 'TSH-003',
      name: 'Relaxed Fit Pocket Tee',
      price: 24.99,
      image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400',
      colors: ['gray', 'white', 'blue'],
      sizes: ['M', 'L', 'XL'],
      fit: 'relaxed',
      rating: 4.3,
      reviewCount: 156,
      matchScore: 88
    },
    {
      id: 4,
      sku: 'TSH-004',
      name: 'Organic Cotton Henley',
      price: 39.99,
      image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400',
      colors: ['white', 'navy', 'green'],
      sizes: ['S', 'M', 'L'],
      fit: 'regular',
      rating: 4.6,
      reviewCount: 73,
      matchScore: 85
    },
    {
      id: 5,
      sku: 'TSH-005',
      name: 'Vintage Wash Graphic Tee',
      price: 27.99,
      originalPrice: 32.99,
      image: 'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=400',
      colors: ['black', 'gray'],
      sizes: ['S', 'M', 'L', 'XL'],
      fit: 'regular',
      rating: 4.4,
      reviewCount: 94,
      isOnSale: true,
      matchScore: 82
    },
    {
      id: 6,
      sku: 'TSH-006',
      name: 'Performance Moisture-Wicking Tee',
      price: 32.99,
      image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400',
      colors: ['navy', 'black', 'red'],
      sizes: ['S', 'M', 'L', 'XL'],
      fit: 'slim',
      rating: 4.8,
      reviewCount: 112,
      matchScore: 90
    },
    {
      id: 7,
      sku: 'TSH-007',
      name: 'Oversized Streetwear Tee',
      price: 35.99,
      image: 'https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=400',
      colors: ['black', 'white', 'gray'],
      sizes: ['M', 'L', 'XL', 'XXL'],
      fit: 'oversized',
      rating: 4.2,
      reviewCount: 67,
      matchScore: 78
    },
    {
      id: 8,
      sku: 'TSH-008',
      name: 'Long Sleeve Basic Tee',
      price: 31.99,
      image: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400',
      colors: ['white', 'navy', 'gray'],
      sizes: ['S', 'M', 'L', 'XL'],
      fit: 'regular',
      rating: 4.5,
      reviewCount: 85,
      matchScore: 87
    }
  ];

  // Filter and sort products
  useEffect(() => {
    let filtered = [...mockProducts];

    // Apply filters
    if (filters?.size) {
      filtered = filtered?.filter(product => product?.sizes?.includes(filters?.size));
    }
    
    if (filters?.color) {
      filtered = filtered?.filter(product => product?.colors?.includes(filters?.color));
    }
    
    if (filters?.fit) {
      filtered = filtered?.filter(product => product?.fit === filters?.fit);
    }
    
    if (filters?.priceRange) {
      const [min, max] = filters?.priceRange?.split('-')?.map(p => p?.replace('+', ''));
      filtered = filtered?.filter(product => {
        if (max) {
          return product?.price >= parseFloat(min) && product?.price <= parseFloat(max);
        } else {
          return product?.price >= parseFloat(min);
        }
      });
    }

    // Apply sorting
    switch (filters?.sort) {
      case 'price-low':
        filtered?.sort((a, b) => a?.price - b?.price);
        break;
      case 'price-high':
        filtered?.sort((a, b) => b?.price - a?.price);
        break;
      case 'popularity':
        filtered?.sort((a, b) => b?.reviewCount - a?.reviewCount);
        break;
      case 'newest':
        filtered?.sort((a, b) => b?.id - a?.id);
        break;
      default: // relevance
        filtered?.sort((a, b) => (b?.matchScore || 0) - (a?.matchScore || 0));
    }

    setDisplayedProducts(filtered);
    setCurrentPage(1);
  }, [filters]);

  const totalPages = Math.ceil(displayedProducts?.length / productsPerPage);
  const startIndex = (currentPage - 1) * productsPerPage;
  const currentProducts = displayedProducts?.slice(startIndex, startIndex + productsPerPage);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleProductSelect = (product) => {
    if (onProductSelect) {
      onProductSelect(product);
    }
  };

  const handleAddToCart = (productWithSize) => {
    if (onAddToCart) {
      onAddToCart(productWithSize);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 })?.map((_, index) => (
          <div key={index} className="bg-surface border border-border rounded-lg overflow-hidden animate-pulse">
            <div className="aspect-square bg-muted" />
            <div className="p-4 space-y-3">
              <div className="h-4 bg-muted rounded w-3/4" />
              <div className="h-4 bg-muted rounded w-1/2" />
              <div className="h-8 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (displayedProducts?.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Search" size={24} color="var(--color-text-secondary)" />
        </div>
        <h3 className="text-lg font-medium text-primary mb-2">No products found</h3>
        <p className="text-text-secondary mb-4">
          Try adjusting your filters or search criteria
        </p>
        <Button variant="outline" onClick={() => window.location?.reload()}>
          Reset Filters
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
        {currentProducts?.map((product) => (
          <ProductCard
            key={product?.id}
            product={product}
            onQuickView={handleProductSelect}
            onAddToCart={handleAddToCart}
            isRecommended={product?.isRecommended}
          />
        ))}
      </div>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            iconName="ChevronLeft"
          >
            Previous
          </Button>
          
          <div className="flex space-x-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, index) => {
              let pageNumber;
              if (totalPages <= 5) {
                pageNumber = index + 1;
              } else if (currentPage <= 3) {
                pageNumber = index + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + index;
              } else {
                pageNumber = currentPage - 2 + index;
              }

              return (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(pageNumber)}
                  className="w-10"
                >
                  {pageNumber}
                </Button>
              );
            })}
          </div>
          
          <Button
            variant="outline"
            size="sm"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            iconName="ChevronRight"
            iconPosition="right"
          >
            Next
          </Button>
        </div>
      )}
      {/* Results Summary */}
      <div className="text-center mt-6 text-sm text-text-secondary">
        Showing {startIndex + 1}-{Math.min(startIndex + productsPerPage, displayedProducts?.length)} of {displayedProducts?.length} products
      </div>
    </div>
  );
};

export default ProductGrid;