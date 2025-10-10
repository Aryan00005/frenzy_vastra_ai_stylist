import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const FilterControls = ({ 
  filters = {}, 
  onFiltersChange, 
  resultCount = 0,
  onClearFilters,
  isMobile = false 
}) => {
  const [isExpanded, setIsExpanded] = useState(!isMobile);

  const sizeOptions = [
    { value: '', label: 'All Sizes' },
    { value: 'XS', label: 'Extra Small (XS)' },
    { value: 'S', label: 'Small (S)' },
    { value: 'M', label: 'Medium (M)' },
    { value: 'L', label: 'Large (L)' },
    { value: 'XL', label: 'Extra Large (XL)' },
    { value: 'XXL', label: 'Double XL (XXL)' }
  ];

  const colorOptions = [
    { value: '', label: 'All Colors' },
    { value: 'black', label: 'Black' },
    { value: 'white', label: 'White' },
    { value: 'gray', label: 'Gray' },
    { value: 'navy', label: 'Navy' },
    { value: 'red', label: 'Red' },
    { value: 'blue', label: 'Blue' },
    { value: 'green', label: 'Green' }
  ];

  const fitOptions = [
    { value: '', label: 'All Fits' },
    { value: 'slim', label: 'Slim Fit' },
    { value: 'regular', label: 'Regular Fit' },
    { value: 'relaxed', label: 'Relaxed Fit' },
    { value: 'oversized', label: 'Oversized' }
  ];

  const priceRangeOptions = [
    { value: '', label: 'All Prices' },
    { value: '0-25', label: 'Under $25' },
    { value: '25-50', label: '$25 - $50' },
    { value: '50-75', label: '$50 - $75' },
    { value: '75-100', label: '$75 - $100' },
    { value: '100+', label: 'Over $100' }
  ];

  const sortOptions = [
    { value: 'relevance', label: 'Most Relevant' },
    { value: 'price-low', label: 'Price: Low to High' },
    { value: 'price-high', label: 'Price: High to Low' },
    { value: 'popularity', label: 'Most Popular' },
    { value: 'newest', label: 'Newest First' }
  ];

  const handleFilterChange = (filterType, value) => {
    const newFilters = {
      ...filters,
      [filterType]: value
    };
    if (onFiltersChange) {
      onFiltersChange(newFilters);
    }
  };

  const handleClearFilters = () => {
    if (onClearFilters) {
      onClearFilters();
    }
  };

  const hasActiveFilters = Object.values(filters)?.some(value => value && value !== '');

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="bg-surface border border-border rounded-lg shadow-subtle">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <Icon name="Filter" size={20} color="var(--color-primary)" />
          <div>
            <h3 className="font-medium text-primary">Filter & Sort</h3>
            <p className="text-sm text-text-secondary">
              {resultCount} products found
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearFilters}
              iconName="X"
              iconPosition="left"
            >
              Clear
            </Button>
          )}
          
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleExpanded}
              aria-label={isExpanded ? 'Collapse filters' : 'Expand filters'}
            >
              <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={16} />
            </Button>
          )}
        </div>
      </div>
      {/* Filter Controls */}
      {isExpanded && (
        <div className="p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Sort */}
            <div className="xl:col-span-2">
              <Select
                label="Sort by"
                options={sortOptions}
                value={filters?.sort || 'relevance'}
                onChange={(value) => handleFilterChange('sort', value)}
                className="w-full"
              />
            </div>

            {/* Size Filter */}
            <div>
              <Select
                label="Size"
                options={sizeOptions}
                value={filters?.size || ''}
                onChange={(value) => handleFilterChange('size', value)}
                className="w-full"
              />
            </div>

            {/* Color Filter */}
            <div>
              <Select
                label="Color"
                options={colorOptions}
                value={filters?.color || ''}
                onChange={(value) => handleFilterChange('color', value)}
                className="w-full"
              />
            </div>

            {/* Fit Filter */}
            <div>
              <Select
                label="Fit"
                options={fitOptions}
                value={filters?.fit || ''}
                onChange={(value) => handleFilterChange('fit', value)}
                className="w-full"
              />
            </div>

            {/* Price Range Filter */}
            <div>
              <Select
                label="Price Range"
                options={priceRangeOptions}
                value={filters?.priceRange || ''}
                onChange={(value) => handleFilterChange('priceRange', value)}
                className="w-full"
              />
            </div>
          </div>

          {/* Active Filters Display */}
          {hasActiveFilters && (
            <div className="mt-4 pt-4 border-t border-border">
              <div className="flex items-center space-x-2 flex-wrap">
                <span className="text-sm font-medium text-primary">Active filters:</span>
                {Object.entries(filters)?.map(([key, value]) => {
                  if (!value || value === '') return null;
                  
                  let displayValue = value;
                  if (key === 'sort') {
                    displayValue = sortOptions?.find(opt => opt?.value === value)?.label || value;
                  } else if (key === 'size') {
                    displayValue = sizeOptions?.find(opt => opt?.value === value)?.label || value;
                  } else if (key === 'color') {
                    displayValue = colorOptions?.find(opt => opt?.value === value)?.label || value;
                  } else if (key === 'fit') {
                    displayValue = fitOptions?.find(opt => opt?.value === value)?.label || value;
                  } else if (key === 'priceRange') {
                    displayValue = priceRangeOptions?.find(opt => opt?.value === value)?.label || value;
                  }

                  return (
                    <span
                      key={key}
                      className="inline-flex items-center space-x-1 bg-accent/10 text-accent px-2 py-1 rounded-full text-xs"
                    >
                      <span>{displayValue}</span>
                      <button
                        onClick={() => handleFilterChange(key, '')}
                        className="hover:bg-accent/20 rounded-full p-0.5"
                        aria-label={`Remove ${key} filter`}
                      >
                        <Icon name="X" size={12} />
                      </button>
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FilterControls;