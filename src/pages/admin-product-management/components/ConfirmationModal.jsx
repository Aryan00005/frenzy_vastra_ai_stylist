import React from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const ConfirmationModal = ({ 
  isOpen = false, 
  onClose, 
  onConfirm, 
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'default', // 'default', 'destructive', 'warning'
  isLoading = false,
  details = null
}) => {
  const getTypeConfig = () => {
    const configs = {
      default: {
        icon: 'HelpCircle',
        iconColor: 'var(--color-accent)',
        confirmVariant: 'default'
      },
      destructive: {
        icon: 'AlertTriangle',
        iconColor: 'var(--color-destructive)',
        confirmVariant: 'destructive'
      },
      warning: {
        icon: 'AlertCircle',
        iconColor: 'var(--color-warning)',
        confirmVariant: 'warning'
      }
    };
    return configs?.[type] || configs?.default;
  };

  if (!isOpen) return null;

  const config = getTypeConfig();

  return (
    <div className="fixed inset-0 z-300 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-surface rounded-lg shadow-modal max-w-md w-full">
        {/* Modal Header */}
        <div className="p-6 pb-4">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <Icon name={config?.icon} size={24} color={config?.iconColor} />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-primary mb-2">
                {title}
              </h3>
              <p className="text-text-secondary">
                {message}
              </p>
            </div>
          </div>
        </div>

        {/* Details Section */}
        {details && (
          <div className="px-6 pb-4">
            <div className="bg-muted rounded-lg p-4">
              {Array.isArray(details) ? (
                <ul className="space-y-1">
                  {details?.map((detail, index) => (
                    <li key={index} className="text-sm text-text-secondary flex items-center">
                      <Icon name="Dot" size={12} className="mr-1" />
                      {detail}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-text-secondary">{details}</p>
              )}
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 pt-4 border-t border-border">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={config?.confirmVariant}
            onClick={onConfirm}
            loading={isLoading}
            iconName={type === 'destructive' ? 'Trash2' : 'Check'}
            iconPosition="left"
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;