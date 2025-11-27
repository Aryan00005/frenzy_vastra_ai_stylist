import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '../../components/ui/Header';
import SessionContextIndicator from '../../components/ui/SessionContextIndicator';
import ModalNavigationController from '../../components/ui/ModalNavigationController';
import AnalysisResultsCard from './components/AnalysisResultsCard';
import FilterControls from './components/FilterControls';
import ProductGrid from './components/ProductGrid';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { aiService } from '../../services/aiService';

const StyleRecommendations = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // State management
  const [analysisData, setAnalysisData] = useState(null);
  const [selectedOccasion, setSelectedOccasion] = useState('casual');
  const [filters, setFilters] = useState({
    sort: 'relevance',
    size: '',
    color: '',
    fit: '',
    priceRange: ''
  });
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [isMobile, setIsMobile] = useState(false);

  // Check for mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load analysis data and get AI recommendations
  useEffect(() => {
    const loadAnalysisData = async () => {
      // Try to get data from navigation state first
      const navState = location?.state;
      if (navState?.analysisData) {
        setAnalysisData(navState?.analysisData);
        setSelectedOccasion(navState?.occasion || 'casual');
        
        // Get AI recommendations
        setIsLoading(true);
        try {
          const recommendations = await aiService.getRecommendations({
            body_type: navState.analysisData?.body_type,
            style_preference: selectedOccasion,
            occasion: selectedOccasion
          });
          console.log('🤖 AI Recommendations:', recommendations);
        } catch (error) {
          console.error('AI recommendations failed:', error);
        }
        setIsLoading(false);
        return;
      }

      // Fallback to localStorage
      const savedSession = localStorage.getItem('currentAnalysisSession');
      if (savedSession) {
        try {
          const sessionData = JSON.parse(savedSession);
          setAnalysisData(sessionData?.analysisData);
          setSelectedOccasion(sessionData?.occasion || 'casual');
        } catch (error) {
          console.error('Error loading saved session:', error);
          navigate('/photo-upload-analysis');
        }
      } else {
        navigate('/photo-upload-analysis');
      }
    };

    loadAnalysisData();
  }, [location?.state, navigate, selectedOccasion]);

  // Mock current session for SessionContextIndicator
  const currentSession = {
    id: 'session_' + Date.now(),
    timestamp: new Date(),
    recommendationCount: 24,
    occasion: selectedOccasion,
    analysisData
  };

  // Handle filter changes
  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Clear all filters
  const handleClearFilters = () => {
    setFilters({
      sort: 'relevance',
      size: '',
      color: '',
      fit: '',
      priceRange: ''
    });
  };

  // Handle product selection for modal
  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  // Handle add to cart
  const handleAddToCart = (productWithSize) => {
    const cartItem = {
      ...productWithSize,
      cartId: Date.now() + Math.random(),
      quantity: 1,
      addedAt: new Date()
    };
    
    setCartItems(prev => [...prev, cartItem]);
    
    // Show success feedback
    alert(`${productWithSize?.name} (Size: ${productWithSize?.selectedSize}) added to cart!`);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  // Handle new analysis
  const handleNewAnalysis = () => {
    navigate('/photo-upload-analysis');
  };

  // Handle view session history
  const handleViewHistory = () => {
    navigate('/user-session-history');
  };

  // Get related products for modal
  const getRelatedProducts = (product) => {
    // Mock related products logic
    return products?.filter(p => 
      p?.id !== product?.id && 
      (p?.fit === product?.fit || p?.colors?.some(color => product?.colors?.includes(color)))
    )?.slice(0, 6);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SessionContextIndicator 
        currentSession={currentSession}
        onViewResults={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      />
      <main className="pt-20 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-primary mb-2">
                Your Style Recommendations
              </h1>
              <p className="text-text-secondary">
                AI-powered suggestions tailored for your {selectedOccasion} occasion
              </p>
            </div>
            
            <div className="flex items-center space-x-3 mt-4 sm:mt-0">
              <Button
                variant="outline"
                onClick={handleViewHistory}
                iconName="Clock"
                iconPosition="left"
                size="sm"
              >
                <span className="hidden sm:inline">View History</span>
                <span className="sm:hidden">History</span>
              </Button>
              
              <Button
                variant="default"
                onClick={handleNewAnalysis}
                iconName="Camera"
                iconPosition="left"
                size="sm"
              >
                <span className="hidden sm:inline">New Analysis</span>
                <span className="sm:hidden">New</span>
              </Button>
            </div>
          </div>

          {/* Analysis Results */}
          <div className="mb-8">
            <AnalysisResultsCard 
              analysisData={analysisData}
              occasion={selectedOccasion}
            />
          </div>

          {/* Filter Controls */}
          <div className="mb-6">
            <FilterControls
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearFilters={handleClearFilters}
              resultCount={24}
              isMobile={isMobile}
              onDateRangeChange={() => {}}
              onOccasionFilter={() => {}}
              onMetricChange={() => {}}
              onRefresh={() => {}}
              lastUpdated={new Date()}
            />
          </div>

          {/* Products Section */}
          <div className="bg-surface border border-border rounded-lg p-6 shadow-subtle">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <Icon name="Shirt" size={24} color="var(--color-accent)" />
                <div>
                  <h2 className="text-xl font-semibold text-primary">Recommended T-Shirts</h2>
                  <p className="text-sm text-text-secondary">
                    Curated based on your body type and style preferences
                  </p>
                </div>
              </div>
              
              {cartItems?.length > 0 && (
                <div className="flex items-center space-x-2 bg-success/10 text-success px-3 py-1 rounded-full">
                  <Icon name="ShoppingCart" size={16} />
                  <span className="text-sm font-medium">{cartItems?.length} items</span>
                </div>
              )}
            </div>

            <ProductGrid
              products={products}
              filters={filters}
              onProductSelect={handleProductSelect}
              onAddToCart={handleAddToCart}
              isLoading={isLoading}
            />
          </div>
        </div>
      </main>
      {/* Product Detail Modal */}
      <ModalNavigationController
        isOpen={isModalOpen}
        onClose={handleModalClose}
        product={selectedProduct}
        relatedProducts={getRelatedProducts(selectedProduct)}
        onProductChange={setSelectedProduct}
        onAddToCart={handleAddToCart}
        onViewSimilar={(product) => {
          setFilters(prev => ({
            ...prev,
            fit: product?.fit,
            color: product?.colors?.[0]
          }));
          setIsModalOpen(false);
        }}
      />
    </div>
  );
};

export default StyleRecommendations;