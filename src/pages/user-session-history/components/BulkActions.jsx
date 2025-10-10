import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import Icon from '../../../components/AppIcon';

const BulkActions = ({
  selectedSessions,
  onSelectAll,
  onDeselectAll,
  onBulkDelete,
  totalSessions,
  isAllSelected
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  const handleBulkDelete = async () => {
    if (selectedSessions?.length === 0) return;
    
    setShowConfirmation(true);
  };

  const confirmBulkDelete = async () => {
    setIsDeleting(true);
    setShowConfirmation(false);
    
    try {
      await onBulkDelete(selectedSessions);
    } catch (error) {
      console.error('Failed to delete sessions:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const cancelBulkDelete = () => {
    setShowConfirmation(false);
  };

  if (totalSessions === 0) {
    return null;
  }

  return (
    <>
      <div className="bg-card border border-border rounded-lg p-4 mb-6 shadow-subtle">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Checkbox
              checked={isAllSelected}
              onChange={isAllSelected ? onDeselectAll : onSelectAll}
              label={`Select all (${totalSessions})`}
            />
            
            {selectedSessions?.length > 0 && (
              <span className="text-sm text-text-secondary">
                {selectedSessions?.length} session{selectedSessions?.length !== 1 ? 's' : ''} selected
              </span>
            )}
          </div>

          {selectedSessions?.length > 0 && (
            <div className="flex items-center space-x-2">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                loading={isDeleting}
                iconName="Trash2"
                iconPosition="left"
              >
                Delete Selected ({selectedSessions?.length})
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={onDeselectAll}
                iconName="X"
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
      </div>
      {/* Confirmation Modal */}
      {showConfirmation && (
        <div className="fixed inset-0 z-200 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-lg shadow-modal max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-error/10 rounded-full flex items-center justify-center">
                <Icon name="AlertTriangle" size={20} color="var(--color-error)" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-primary">Confirm Deletion</h3>
                <p className="text-sm text-text-secondary">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <p className="text-text-secondary mb-6">
              Are you sure you want to delete {selectedSessions?.length} session{selectedSessions?.length !== 1 ? 's' : ''}? 
              This will permanently remove all analysis data and recommendations.
            </p>

            <div className="flex space-x-3">
              <Button
                variant="destructive"
                onClick={confirmBulkDelete}
                loading={isDeleting}
                className="flex-1"
                iconName="Trash2"
                iconPosition="left"
              >
                Delete Sessions
              </Button>
              
              <Button
                variant="outline"
                onClick={cancelBulkDelete}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default BulkActions;