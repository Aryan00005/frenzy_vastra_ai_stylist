import React from 'react';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const ProductFilters = ({ 
  filters, 
  onFilterChange, 
  onClearFilters, 
  resultsCount = 0 
}) => {
  const categoryOptions = [
    { value: '', label: 'All Categories' },
    { value: 'casual', label: 'Casual Wear' },
    { value: 'formal', label: 'Formal Wear' },
    { value: 'sports', label: 'Sports Wear' },
    { value: 'party', label: 'Party Wear' }
  ];

  const occasionOptions = [
    { value: '', label: 'All Occasions' },
    { value: 'casual', label: 'Casual' },
    { value: 'office', label: 'Office' },
    { value: 'party', label: 'Party' },
    { value: 'sports', label: 'Sports' },
    { value: 'wedding', label: 'Wedding/Festival' },
    { value: 'travel', label: 'Travel' }
  ];

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
    { value: 'draft', label: 'Draft' }
  ];

  const fitOptions = [
    { value: '', label: 'All Fits' },
    { value: 'slim', label: 'Slim Fit' },
    { value: 'regular', label: 'Regular Fit' },
    { value: 'loose', label: 'Loose Fit' },
    { value: 'oversized', label: 'Oversized' }
  ];

  const handleFilterChange = (key, value) => {
    onFilterChange({
      ...filters,
      [key]: value
    });
  };

  const hasActiveFilters = Object.values(filters)?.some(value => 
    value !== '' && value !== null && value !== undefined
  );

  return (
    <div className="bg-surface border border-border rounded-lg p-6 space-y-6">
      {/* Search and Results */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 max-w-md">
          <Input
            type="search"
            placeholder="Search products by name or SKU..."
            value={filters?.search || ''}
            onChange={(e) => handleFilterChange('search', e?.target?.value)}
            className="w-full"
          />
        </div>
        
        <div className="flex items-center space-x-4">
          <span className="text-sm text-text-secondary">
            {resultsCount} product{resultsCount !== 1 ? 's' : ''} found
          </span>
          
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={onClearFilters}
              iconName="X"
              iconPosition="left"
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>
      {/* Filter Controls */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <Select
          label="Category"
          options={categoryOptions}
          value={filters?.category || ''}
          onChange={(value) => handleFilterChange('category', value)}
          className="w-full"
        />

        <Select
          label="Occasion"
          options={occasionOptions}
          value={filters?.occasion || ''}
          onChange={(value) => handleFilterChange('occasion', value)}
          className="w-full"
        />

        <Select
          label="Status"
          options={statusOptions}
          value={filters?.status || ''}
          onChange={(value) => handleFilterChange('status', value)}
          className="w-full"
        />

        <Select
          label="Fit Type"
          options={fitOptions}
          value={filters?.fit || ''}
          onChange={(value) => handleFilterChange('fit', value)}
          className="w-full"
        />

        <Input
          type="number"
          label="Min Price"
          placeholder="₹0"
          value={filters?.minPrice || ''}
          onChange={(e) => handleFilterChange('minPrice', e?.target?.value)}
          min="0"
          step="0.01"
        />

        <Input
          type="number"
          label="Max Price"
          placeholder="₹999"
          value={filters?.maxPrice || ''}
          onChange={(e) => handleFilterChange('maxPrice', e?.target?.value)}
          min="0"
          step="0.01"
        />
      </div>
      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 pt-2 border-t border-border">
          <span className="text-sm font-medium text-text-secondary">Active filters:</span>
          
          {filters?.search && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
              Search: "{filters?.search}"
              <button
                onClick={() => handleFilterChange('search', '')}
                className="ml-2 hover:text-accent-foreground"
                aria-label="Remove search filter"
              >
                <Icon name="X" size={12} />
              </button>
            </span>
          )}

          {filters?.category && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
              Category: {categoryOptions?.find(opt => opt?.value === filters?.category)?.label}
              <button
                onClick={() => handleFilterChange('category', '')}
                className="ml-2 hover:text-accent-foreground"
                aria-label="Remove category filter"
              >
                <Icon name="X" size={12} />
              </button>
            </span>
          )}

          {filters?.occasion && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
              Occasion: {occasionOptions?.find(opt => opt?.value === filters?.occasion)?.label}
              <button
                onClick={() => handleFilterChange('occasion', '')}
                className="ml-2 hover:text-accent-foreground"
                aria-label="Remove occasion filter"
              >
                <Icon name="X" size={12} />
              </button>
            </span>
          )}

          {filters?.status && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
              Status: {statusOptions?.find(opt => opt?.value === filters?.status)?.label}
              <button
                onClick={() => handleFilterChange('status', '')}
                className="ml-2 hover:text-accent-foreground"
                aria-label="Remove status filter"
              >
                <Icon name="X" size={12} />
              </button>
            </span>
          )}

          {filters?.fit && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
              Fit: {fitOptions?.find(opt => opt?.value === filters?.fit)?.label}
              <button
                onClick={() => handleFilterChange('fit', '')}
                className="ml-2 hover:text-accent-foreground"
                aria-label="Remove fit filter"
              >
                <Icon name="X" size={12} />
              </button>
            </span>
          )}

          {(filters?.minPrice || filters?.maxPrice) && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-accent/10 text-accent">
              Price: ₹{filters?.minPrice || '0'} - ₹{filters?.maxPrice || '∞'}
              <button
                onClick={() => {
                  handleFilterChange('minPrice', '');
                  handleFilterChange('maxPrice', '');
                }}
                className="ml-2 hover:text-accent-foreground"
                aria-label="Remove price filter"
              >
                <Icon name="X" size={12} />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default ProductFilters;