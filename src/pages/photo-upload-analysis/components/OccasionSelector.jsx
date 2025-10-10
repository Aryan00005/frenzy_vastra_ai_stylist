import React from 'react';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const OccasionSelector = ({ selectedOccasion, onOccasionChange, disabled }) => {
  const occasionOptions = [
    {
      value: 'casual',
      label: 'Casual',
      description: 'Everyday wear, relaxed settings'
    },
    {
      value: 'office',
      label: 'Office',
      description: 'Professional workplace attire'
    },
    {
      value: 'party',
      label: 'Party',
      description: 'Social events and celebrations'
    },
    {
      value: 'sports',
      label: 'Sports',
      description: 'Athletic activities and workouts'
    },
    {
      value: 'wedding-festival',
      label: 'Wedding/Festival',
      description: 'Special occasions and ceremonies'
    },
    {
      value: 'travel',
      label: 'Travel',
      description: 'Comfortable travel wear'
    }
  ];

  const getOccasionIcon = (occasion) => {
    const iconMap = {
      'casual': 'Coffee',
      'office': 'Briefcase',
      'party': 'Music',
      'sports': 'Zap',
      'wedding-festival': 'Heart',
      'travel': 'Plane'
    };
    return iconMap?.[occasion] || 'Shirt';
  };

  return (
    <div className="w-full">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-primary mb-2">
          Select Occasion
        </h3>
        <p className="text-sm text-text-secondary">
          Choose the occasion to get personalized T-shirt recommendations that match your style needs.
        </p>
      </div>
      <Select
        label="Occasion Type"
        placeholder="Choose an occasion..."
        options={occasionOptions}
        value={selectedOccasion}
        onChange={onOccasionChange}
        disabled={disabled}
        required
        className="mb-4"
      />
      {selectedOccasion && (
        <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
              <Icon 
                name={getOccasionIcon(selectedOccasion)} 
                size={20} 
                color="var(--color-accent)" 
              />
            </div>
            <div>
              <h4 className="font-medium text-primary">
                {occasionOptions?.find(opt => opt?.value === selectedOccasion)?.label}
              </h4>
              <p className="text-sm text-text-secondary">
                {occasionOptions?.find(opt => opt?.value === selectedOccasion)?.description}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OccasionSelector;