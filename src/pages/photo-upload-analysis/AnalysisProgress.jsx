import React from 'react';
import Icon from '../../../components/AppIcon';

const AnalysisProgress = ({ 
  isAnalyzing, 
  progress, 
  currentStep, 
  onCancel 
}) => {
  const analysisSteps = [
    {
      id: 'upload',
      label: 'Uploading Photo',
      description: 'Securely uploading your image...',
      icon: 'Upload'
    },
    {
      id: 'processing',
      label: 'Processing Image',
      description: 'Analyzing photo quality and composition...',
      icon: 'Image'
    },
    {
      id: 'body-analysis',
      label: 'Body Analysis',
      description: 'Determining body type and measurements...',
      icon: 'User'
    },
    {
      id: 'style-matching',
      label: 'Style Matching',
      description: 'Finding perfect T-shirt recommendations...',
      icon: 'Shirt'
    },
    {
      id: 'complete',
      label: 'Analysis Complete',
      description: 'Generating personalized recommendations...',
      icon: 'CheckCircle'
    }
  ];

  const getCurrentStepIndex = () => {
    return analysisSteps?.findIndex(step => step?.id === currentStep);
  };

  const getStepStatus = (stepIndex) => {
    const currentIndex = getCurrentStepIndex();
    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'active';
    return 'pending';
  };

  if (!isAnalyzing) return null;

  return (
    <div className="fixed inset-0 z-100 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-lg shadow-modal p-6 max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="animate-spin">
              <Icon name="Loader2" size={32} color="var(--color-accent)" />
            </div>
          </div>
          <h3 className="text-xl font-semibold text-primary mb-2">
            Analyzing Your Style
          </h3>
          <p className="text-sm text-text-secondary">
            Our AI is processing your photo to provide personalized recommendations
          </p>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-sm text-text-secondary mb-2">
            <span>Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div
              className="bg-accent h-3 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Analysis Steps */}
        <div className="space-y-4 mb-6">
          {analysisSteps?.map((step, index) => {
            const status = getStepStatus(index);
            return (
              <div
                key={step?.id}
                className={`flex items-center space-x-3 p-3 rounded-lg transition-all duration-300 ${
                  status === 'active' ?'bg-accent/5 border border-accent/20'
                    : status === 'completed' ?'bg-success/5 border border-success/20' :'bg-muted/30'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  status === 'active' ?'bg-accent/10'
                    : status === 'completed' ?'bg-success/10' :'bg-muted'
                }`}>
                  {status === 'active' ? (
                    <div className="animate-spin">
                      <Icon name="Loader2" size={16} color="var(--color-accent)" />
                    </div>
                  ) : status === 'completed' ? (
                    <Icon name="Check" size={16} color="var(--color-success)" />
                  ) : (
                    <Icon 
                      name={step?.icon} 
                      size={16} 
                      color="var(--color-text-secondary)" 
                    />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    status === 'active' || status === 'completed'
                      ? 'text-primary' :'text-text-secondary'
                  }`}>
                    {step?.label}
                  </p>
                  {status === 'active' && (
                    <p className="text-xs text-text-secondary mt-1">
                      {step?.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Cancel Button */}
        <div className="text-center">
          <button
            onClick={onCancel}
            className="text-sm text-text-secondary hover:text-destructive transition-colors"
          >
            Cancel Analysis
          </button>
        </div>
      </div>
    </div>
  );
};

export default AnalysisProgress;