import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const AnalysisActions = ({ 
  selectedFile, 
  selectedOccasion, 
  isAnalyzing, 
  onAnalyze, 
  onReset,
  onViewHistory 
}) => {
  const canAnalyze = selectedFile && selectedOccasion && !isAnalyzing;

  return (
    <div className="w-full">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Primary Action */}
        <div className="flex-1">
          <Button
            variant="default"
            size="lg"
            fullWidth
            disabled={!canAnalyze}
            loading={isAnalyzing}
            onClick={onAnalyze}
            iconName="Sparkles"
            iconPosition="left"
          >
            {isAnalyzing ? 'Analyzing...' : 'Analyze Photo'}
          </Button>
          
          {!canAnalyze && !isAnalyzing && (
            <p className="text-xs text-text-secondary mt-2 text-center">
              {!selectedFile && !selectedOccasion 
                ? 'Please upload a photo and select an occasion'
                : !selectedFile 
                ? 'Please upload a photo' :'Please select an occasion'
              }
            </p>
          )}
        </div>

        {/* Secondary Actions */}
        <div className="flex space-x-2 sm:flex-col sm:space-x-0 sm:space-y-2">
          <Button
            variant="outline"
            size="lg"
            onClick={onReset}
            disabled={isAnalyzing}
            iconName="RotateCcw"
            className="flex-1 sm:flex-none"
          >
            <span className="hidden sm:inline">Reset</span>
          </Button>
          
          <Button
            variant="ghost"
            size="lg"
            onClick={onViewHistory}
            disabled={isAnalyzing}
            iconName="Clock"
            className="flex-1 sm:flex-none"
          >
            <span className="hidden sm:inline">History</span>
          </Button>
        </div>
      </div>

      {/* Analysis Info */}
      <div className="mt-6 p-4 bg-muted/30 rounded-lg">
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-accent/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <Icon name="Info" size={16} color="var(--color-accent)" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-medium text-primary mb-1">
              How it works
            </h4>
            <ul className="text-xs text-text-secondary space-y-1">
              <li>• AI analyzes your body type and proportions</li>
              <li>• Matches your style preferences with occasion needs</li>
              <li>• Recommends T-shirts that fit and flatter your body</li>
              <li>• Provides styling tips for the selected occasion</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="mt-4 p-3 bg-success/5 border border-success/20 rounded-lg">
        <div className="flex items-center space-x-2">
          <Icon name="Shield" size={14} color="var(--color-success)" />
          <p className="text-xs text-text-secondary">
            Your photos are processed securely and deleted after analysis. We never store personal images.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AnalysisActions;