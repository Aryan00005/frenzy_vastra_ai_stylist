import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickTips = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const photographyTips = [
    {
      icon: 'Camera',
      title: 'Good Lighting',
      description: 'Use natural light or well-lit indoor spaces for clear photos'
    },
    {
      icon: 'User',
      title: 'Full Body Shot',
      description: 'Include your full body from head to toe for accurate analysis'
    },
    {
      icon: 'Square',
      title: 'Plain Background',
      description: 'Stand against a plain wall or background for better detection'
    },
    {
      icon: 'Maximize',
      title: 'Proper Distance',
      description: 'Stand 6-8 feet away from the camera for optimal proportions'
    }
  ];

  const occasionGuide = [
    {
      occasion: 'Casual',
      tips: ['Comfortable fit', 'Relaxed styles', 'Fun colors and patterns']
    },
    {
      occasion: 'Office',
      tips: ['Professional colors', 'Clean lines', 'Modest necklines']
    },
    {
      occasion: 'Party',
      tips: ['Statement pieces', 'Bold colors', 'Trendy cuts']
    },
    {
      occasion: 'Sports',
      tips: ['Moisture-wicking fabric', 'Athletic fit', 'Breathable materials']
    }
  ];

  return (
    <div className="w-full">
      <div className="bg-surface border border-border rounded-lg overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <Icon name="Lightbulb" size={20} color="var(--color-accent)" />
            <h3 className="font-semibold text-primary">Quick Tips</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            aria-label={isExpanded ? 'Collapse tips' : 'Expand tips'}
          >
            <Icon name={isExpanded ? 'ChevronUp' : 'ChevronDown'} size={16} />
          </Button>
        </div>

        {/* Content */}
        <div className={`transition-all duration-300 ${isExpanded ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
          <div className="p-4 space-y-6">
            {/* Photography Tips */}
            <div>
              <h4 className="text-sm font-medium text-primary mb-3">
                Photography Tips
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {photographyTips?.map((tip, index) => (
                  <div key={index} className="flex items-start space-x-3 p-3 bg-muted/30 rounded-lg">
                    <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0">
                      <Icon name={tip?.icon} size={14} color="var(--color-accent)" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-primary">{tip?.title}</p>
                      <p className="text-xs text-text-secondary mt-1">{tip?.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Occasion Guide */}
            <div>
              <h4 className="text-sm font-medium text-primary mb-3">
                Occasion Guide
              </h4>
              <div className="space-y-3">
                {occasionGuide?.map((guide, index) => (
                  <div key={index} className="p-3 bg-muted/30 rounded-lg">
                    <h5 className="text-sm font-medium text-primary mb-2">
                      {guide?.occasion}
                    </h5>
                    <div className="flex flex-wrap gap-2">
                      {guide?.tips?.map((tip, tipIndex) => (
                        <span
                          key={tipIndex}
                          className="inline-flex items-center px-2 py-1 bg-accent/10 text-accent text-xs rounded-full"
                        >
                          {tip}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Collapsed Preview */}
        {!isExpanded && (
          <div className="p-4">
            <p className="text-sm text-text-secondary">
              Get the best results with proper lighting, full body shots, and plain backgrounds.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuickTips;