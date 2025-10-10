import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const BulkActions = ({ 
  selectedCount = 0, 
  onBulkAction, 
  onClearSelection,
  isProcessing = false 
}) => {
  const [selectedAction, setSelectedAction] = useState('');

  const bulkActionOptions = [
    { value: '', label: 'Select bulk action...' },
    { value: 'activate', label: 'Activate Products' },
    { value: 'deactivate', label: 'Deactivate Products' },
    { value: 'delete', label: 'Delete Products' },
    { value: 'export', label: 'Export Selected' },
    { value: 'duplicate', label: 'Duplicate Products' }
  ];

  const handleApplyAction = () => {
    if (selectedAction && selectedCount > 0) {
      onBulkAction(selectedAction);
      setSelectedAction('');
    }
  };

  const getActionIcon = (action) => {
    const iconMap = {
      activate: 'CheckCircle',
      deactivate: 'XCircle',
      delete: 'Trash2',
      export: 'Download',
      duplicate: 'Copy'
    };
    return iconMap?.[action] || 'Settings';
  };

  const getActionColor = (action) => {
    const colorMap = {
      activate: 'var(--color-success)',
      deactivate: 'var(--color-warning)',
      delete: 'var(--color-destructive)',
      export: 'var(--color-accent)',
      duplicate: 'var(--color-primary)'
    };
    return colorMap?.[action] || 'var(--color-text-secondary)';
  };

  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="bg-accent/5 border border-accent/20 rounded-lg p-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Selection Info */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-8 h-8 bg-accent/10 rounded-full">
            <Icon name="CheckSquare" size={16} color="var(--color-accent)" />
          </div>
          <div>
            <p className="font-medium text-primary">
              {selectedCount} product{selectedCount !== 1 ? 's' : ''} selected
            </p>
            <p className="text-sm text-text-secondary">
              Choose an action to apply to selected items
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <Select
              options={bulkActionOptions}
              value={selectedAction}
              onChange={setSelectedAction}
              placeholder="Select action..."
              className="min-w-48"
            />
            
            <Button
              variant="default"
              onClick={handleApplyAction}
              disabled={!selectedAction || isProcessing}
              loading={isProcessing}
              iconName={selectedAction ? getActionIcon(selectedAction) : 'Play'}
              iconPosition="left"
            >
              Apply
            </Button>
          </div>

          <div className="h-6 w-px bg-border" />

          <Button
            variant="outline"
            size="sm"
            onClick={onClearSelection}
            iconName="X"
            iconPosition="left"
          >
            Clear
          </Button>
        </div>
      </div>
      {/* Action Preview */}
      {selectedAction && (
        <div className="mt-4 p-3 bg-surface rounded-lg border border-border">
          <div className="flex items-center space-x-3">
            <Icon 
              name={getActionIcon(selectedAction)} 
              size={16} 
              color={getActionColor(selectedAction)} 
            />
            <div>
              <p className="text-sm font-medium text-primary">
                {bulkActionOptions?.find(opt => opt?.value === selectedAction)?.label}
              </p>
              <p className="text-xs text-text-secondary">
                This action will be applied to {selectedCount} selected product{selectedCount !== 1 ? 's' : ''}
                {selectedAction === 'delete' && ' (This action cannot be undone)'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkActions;