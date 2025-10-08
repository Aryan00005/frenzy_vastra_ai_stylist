import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const FilterControls = ({ 
  onDateRangeChange, 
  onOccasionFilter, 
  onMetricChange,
  onRefresh,
  lastUpdated 
}) => {
  const [selectedDateRange, setSelectedDateRange] = useState('7d');
  const [selectedOccasion, setSelectedOccasion] = useState('all');
  const [selectedMetric, setSelectedMetric] = useState('all');

  const dateRangeOptions = [
    { value: '24h', label: 'Last 24 Hours' },
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last 90 Days' },
    { value: '1y', label: 'Last Year' },
    { value: 'custom', label: 'Custom Range' }
  ];

  const occasionOptions = [
    { value: 'all', label: 'All Occasions' },
    { value: 'casual', label: 'Casual' },
    { value: 'office', label: 'Office' },
    { value: 'party', label: 'Party' },
    { value: 'sports', label: 'Sports' },
    { value: 'wedding', label: 'Wedding/Festival' },
    { value: 'travel', label: 'Travel' }
  ];

  const metricOptions = [
    { value: 'all', label: 'All Metrics' },
    { value: 'analyses', label: 'Photo Analyses' },
    { value: 'recommendations', label: 'Recommendations' },
    { value: 'conversions', label: 'Conversions' },
    { value: 'engagement', label: 'User Engagement' }
  ];

  const handleDateRangeChange = (value) => {
    setSelectedDateRange(value);
    if (onDateRangeChange) {
      onDateRangeChange(value);
    }
  };

  const handleOccasionChange = (value) => {
    setSelectedOccasion(value);
    if (onOccasionFilter) {
      onOccasionFilter(value);
    }
  };

  const handleMetricChange = (value) => {
    setSelectedMetric(value);
    if (onMetricChange) {
      onMetricChange(value);
    }
  };

  const formatLastUpdated = (timestamp) => {
    if (!timestamp) return 'Never';
    const date = new Date(timestamp);
    return date?.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <Select
            label="Date Range"
            options={dateRangeOptions}
            value={selectedDateRange}
            onChange={handleDateRangeChange}
            className="w-full sm:w-48"
          />
          
          <Select
            label="Occasion"
            options={occasionOptions}
            value={selectedOccasion}
            onChange={handleOccasionChange}
            className="w-full sm:w-48"
          />
          
          <Select
            label="Metric Type"
            options={metricOptions}
            value={selectedMetric}
            onChange={handleMetricChange}
            className="w-full sm:w-48"
          />
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
          <div className="flex items-center space-x-2 text-sm text-text-secondary">
            <Icon name="Clock" size={14} />
            <span>Updated: {formatLastUpdated(lastUpdated)}</span>
          </div>
          
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              iconName="RefreshCw"
              iconPosition="left"
            >
              Refresh
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              iconName="Download"
              iconPosition="left"
            >
              Export Report
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;