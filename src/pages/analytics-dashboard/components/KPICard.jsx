import React from 'react';
import Icon from '../../../components/AppIcon';

const KPICard = ({ 
  title, 
  value, 
  change, 
  changeType = 'positive', 
  icon, 
  description,
  loading = false 
}) => {
  const getChangeColor = () => {
    if (changeType === 'positive') return 'text-success';
    if (changeType === 'negative') return 'text-destructive';
    return 'text-text-secondary';
  };

  const getChangeIcon = () => {
    if (changeType === 'positive') return 'TrendingUp';
    if (changeType === 'negative') return 'TrendingDown';
    return 'Minus';
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6 animate-pulse">
        <div className="flex items-center justify-between mb-4">
          <div className="w-8 h-8 bg-muted rounded-lg"></div>
          <div className="w-16 h-4 bg-muted rounded"></div>
        </div>
        <div className="w-24 h-8 bg-muted rounded mb-2"></div>
        <div className="w-32 h-4 bg-muted rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-subtle transition-smooth">
      <div className="flex items-center justify-between mb-4">
        <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
          <Icon name={icon} size={20} color="var(--color-accent)" />
        </div>
        {change && (
          <div className={`flex items-center space-x-1 ${getChangeColor()}`}>
            <Icon name={getChangeIcon()} size={16} />
            <span className="text-sm font-medium">{change}</span>
          </div>
        )}
      </div>
      
      <div className="space-y-1">
        <h3 className="text-2xl font-bold text-primary">{value}</h3>
        <p className="text-sm text-text-secondary">{title}</p>
        {description && (
          <p className="text-xs text-text-secondary mt-2">{description}</p>
        )}
      </div>
    </div>
  );
};

export default KPICard;