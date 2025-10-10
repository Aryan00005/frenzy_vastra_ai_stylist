import React from 'react';
import Icon from '../../../components/AppIcon';

const AnalysisResultsCard = ({ analysisData, occasion }) => {
  const mockAnalysisData = analysisData || {
    bodyType: "Athletic",
    recommendedSize: "M",
    confidence: 92,
    measurements: {
      chest: "38-40 inches",
      shoulders: "17-18 inches",
      length: "28-29 inches"
    },
    stylingTips: [
      "Fitted cuts will complement your athletic build",
      "V-necks and crew necks work best for your body type",
      "Consider layering with light jackets for versatile looks"
    ]
  };

  const selectedOccasion = occasion || "casual";

  const getOccasionIcon = (occasion) => {
    const iconMap = {
      casual: 'Coffee',
      office: 'Briefcase',
      party: 'Music',
      sports: 'Dumbbell',
      wedding: 'Heart',
      travel: 'Plane'
    };
    return iconMap?.[occasion] || 'Shirt';
  };

  const getConfidenceColor = (confidence) => {
    if (confidence >= 90) return 'text-success';
    if (confidence >= 75) return 'text-warning';
    return 'text-error';
  };

  return (
    <div className="bg-surface border border-border rounded-lg p-6 shadow-subtle">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-accent/10 rounded-full flex items-center justify-center">
            <Icon name="Sparkles" size={20} color="var(--color-accent)" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-primary">AI Analysis Results</h2>
            <p className="text-sm text-text-secondary">Based on your photo and preferences</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 bg-muted px-3 py-1 rounded-full">
          <Icon name={getOccasionIcon(selectedOccasion)} size={16} color="var(--color-text-secondary)" />
          <span className="text-sm font-medium text-primary capitalize">{selectedOccasion}</span>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        {/* Body Type */}
        <div className="text-center">
          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Icon name="User" size={24} color="var(--color-primary)" />
          </div>
          <h3 className="font-medium text-primary mb-1">Body Type</h3>
          <p className="text-lg font-semibold text-accent">{mockAnalysisData?.bodyType}</p>
        </div>

        {/* Recommended Size */}
        <div className="text-center">
          <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Icon name="Ruler" size={24} color="var(--color-success)" />
          </div>
          <h3 className="font-medium text-primary mb-1">Recommended Size</h3>
          <p className="text-lg font-semibold text-success">{mockAnalysisData?.recommendedSize}</p>
        </div>

        {/* Confidence Score */}
        <div className="text-center">
          <div className="w-12 h-12 bg-warning/10 rounded-full flex items-center justify-center mx-auto mb-3">
            <Icon name="Target" size={24} color="var(--color-warning)" />
          </div>
          <h3 className="font-medium text-primary mb-1">Confidence</h3>
          <p className={`text-lg font-semibold ${getConfidenceColor(mockAnalysisData?.confidence)}`}>
            {mockAnalysisData?.confidence}%
          </p>
        </div>
      </div>
      {/* Measurements */}
      <div className="bg-muted rounded-lg p-4 mb-6">
        <h4 className="font-medium text-primary mb-3 flex items-center">
          <Icon name="Ruler" size={16} className="mr-2" />
          Recommended Measurements
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div>
            <span className="text-text-secondary">Chest:</span>
            <span className="ml-2 font-medium text-primary">{mockAnalysisData?.measurements?.chest}</span>
          </div>
          <div>
            <span className="text-text-secondary">Shoulders:</span>
            <span className="ml-2 font-medium text-primary">{mockAnalysisData?.measurements?.shoulders}</span>
          </div>
          <div>
            <span className="text-text-secondary">Length:</span>
            <span className="ml-2 font-medium text-primary">{mockAnalysisData?.measurements?.length}</span>
          </div>
        </div>
      </div>
      {/* Styling Tips */}
      <div>
        <h4 className="font-medium text-primary mb-3 flex items-center">
          <Icon name="Lightbulb" size={16} className="mr-2" />
          AI Styling Tips for {selectedOccasion}
        </h4>
        <ul className="space-y-2">
          {mockAnalysisData?.stylingTips?.map((tip, index) => (
            <li key={index} className="flex items-start space-x-2 text-sm text-text-secondary">
              <Icon name="Check" size={14} color="var(--color-success)" className="mt-0.5 flex-shrink-0" />
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default AnalysisResultsCard;