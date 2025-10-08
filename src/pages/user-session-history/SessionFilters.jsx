import React from 'react';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const SessionFilters = ({
  filters,
  onFiltersChange,
  onClearFilters,
  resultCount = 0
}) => {
  const occasionOptions = [
    { value: 'all', label: 'All Occasions' },
    { value: 'casual', label: 'Casual' },
    { value: 'office', label: 'Office' },
    { value: 'party', label: 'Party' },
    { value: 'sports', label: 'Sports' },
    { value: 'wedding', label: 'Wedding/Festival' },
    { value: 'travel', label: 'Travel' }
  ];

  const statusOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'completed', label: 'Completed' },
    { value: 'failed', label: 'Failed' },
    { value: 'processing', label: 'Processing' }
  ];

  const sortOptions = [
    { value: 'date_desc', label: 'Newest First' },
    { value: 'date_asc', label: 'Oldest First' },
    { value: 'occasion', label: 'By Occasion' },
    { value: 'status', label: 'By Status' }
  ];

  const handleFilterChange = (key, value) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const hasActiveFilters = () => {
    return filters?.occasion !== 'all' || 
           filters?.status !== 'all' || 
           filters?.search?.trim() !== '' ||
           filters?.dateRange?.start || 
           filters?.dateRange?.end;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6 shadow-subtle">
      {/* Search and Sort Row */}
      <div className="flex flex-col lg:flex-row gap-4 mb-4">
        <div className="flex-1">
          <Input
            type="search"
            placeholder="Search by occasion or date..."
            value={filters?.search}
            onChange={(e) => handleFilterChange('search', e?.target?.value)}
            className="w-full"
          />
        </div>
        
        <div className="lg:w-48">
          <Select
            options={sortOptions}
            value={filters?.sortBy}
            onChange={(value) => handleFilterChange('sortBy', value)}
            placeholder="Sort by..."
          />
        </div>
      </div>
      {/* Filter Controls Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Select
          label="Occasion"
          options={occasionOptions}
          value={filters?.occasion}
          onChange={(value) => handleFilterChange('occasion', value)}
        />

        <Select
          label="Status"
          options={statusOptions}
          value={filters?.status}
          onChange={(value) => handleFilterChange('status', value)}
        />

        <Input
          label="From Date"
          type="date"
          value={filters?.dateRange?.start}
          onChange={(e) => handleFilterChange('dateRange', {
            ...filters?.dateRange,
            start: e?.target?.value
          })}
        />

        <Input
          label="To Date"
          type="date"
          value={filters?.dateRange?.end}
          onChange={(e) => handleFilterChange('dateRange', {
            ...filters?.dateRange,
            end: e?.target?.value
          })}
        />
      </div>
      {/* Results and Clear Filters Row */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2 text-sm text-text-secondary">
          <Icon name="Search" size={16} />
          <span>
            {resultCount} session{resultCount !== 1 ? 's' : ''} found
          </span>
        </div>

        {hasActiveFilters() && (
          <Button
            variant="ghost"
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
  );
};

export default SessionFilters;