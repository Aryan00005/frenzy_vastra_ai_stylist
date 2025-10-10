import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const EmptyState = ({ hasFilters = false, onClearFilters }) => {
  if (hasFilters) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Search" size={24} color="var(--color-text-secondary)" />
        </div>
        <h3 className="text-lg font-semibold text-primary mb-2">No Sessions Match Your Filters</h3>
        <p className="text-text-secondary mb-6 max-w-md mx-auto">
          Try adjusting your search criteria or date range to find the sessions you're looking for.
        </p>
        <Button
          variant="outline"
          onClick={onClearFilters}
          iconName="X"
          iconPosition="left"
        >
          Clear All Filters
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center py-16">
      <div className="w-20 h-20 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-6">
        <Icon name="Camera" size={32} color="var(--color-accent)" />
      </div>
      
      <h3 className="text-xl font-semibold text-primary mb-3">
        No Style Sessions Yet
      </h3>
      
      <p className="text-text-secondary mb-8 max-w-md mx-auto">
        Start your AI styling journey by uploading a photo. Our AI will analyze your body type and recommend perfect T-shirts for any occasion.
      </p>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link to="/photo-upload-analysis">
          <Button
            variant="default"
            iconName="Camera"
            iconPosition="left"
            className="w-full sm:w-auto"
          >
            Upload Your First Photo
          </Button>
        </Link>
        
        <Button
          variant="outline"
          iconName="HelpCircle"
          iconPosition="left"
          className="w-full sm:w-auto"
        >
          How It Works
        </Button>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-3xl mx-auto">
        <div className="text-center">
          <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Icon name="Zap" size={20} color="var(--color-accent)" />
          </div>
          <h4 className="font-medium text-primary mb-1">AI Analysis</h4>
          <p className="text-sm text-text-secondary">
            Advanced AI determines your body type and size
          </p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Icon name="Sparkles" size={20} color="var(--color-accent)" />
          </div>
          <h4 className="font-medium text-primary mb-1">Smart Recommendations</h4>
          <p className="text-sm text-text-secondary">
            Personalized T-shirt suggestions for every occasion
          </p>
        </div>
        
        <div className="text-center">
          <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center mx-auto mb-3">
            <Icon name="Clock" size={20} color="var(--color-accent)" />
          </div>
          <h4 className="font-medium text-primary mb-1">Session History</h4>
          <p className="text-sm text-text-secondary">
            Access all your past analyses and recommendations
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmptyState;