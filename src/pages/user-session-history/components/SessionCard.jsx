import React, { useState } from 'react';

import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const SessionCard = ({ 
  session, 
  onReanalyze, 
  onDelete, 
  onViewRecommendations,
  isMobile = false 
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(session?.id);
    } catch (error) {
      console.error('Failed to delete session:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReanalyze = () => {
    if (onReanalyze) {
      onReanalyze(session);
    }
  };

  const handleViewRecommendations = () => {
    if (onViewRecommendations) {
      onViewRecommendations(session);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'text-success';
      case 'failed':
        return 'text-error';
      case 'processing':
        return 'text-warning';
      default:
        return 'text-text-secondary';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return 'CheckCircle';
      case 'failed':
        return 'XCircle';
      case 'processing':
        return 'Clock';
      default:
        return 'Circle';
    }
  };

  if (isMobile) {
    return (
      <div className="bg-card border border-border rounded-lg p-4 shadow-subtle">
        <div className="flex space-x-3">
          {/* Photo Thumbnail */}
          <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0">
            <Image
              src={session?.photoThumbnail}
              alt="Session photo"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Session Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm font-medium text-primary truncate">
                {session?.occasion}
              </span>
              <div className={`flex items-center space-x-1 ${getStatusColor(session?.status)}`}>
                <Icon name={getStatusIcon(session?.status)} size={14} />
                <span className="text-xs capitalize">{session?.status}</span>
              </div>
            </div>

            <p className="text-xs text-text-secondary mb-2">
              {new Date(session.uploadDate)?.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </p>

            {session?.status === 'completed' && (
              <div className="flex items-center space-x-4 text-xs text-text-secondary">
                <span>Body: {session?.bodyType}</span>
                <span>Size: {session?.recommendedSize}</span>
                <span>{session?.productCount} items</span>
              </div>
            )}
          </div>
        </div>
        {/* Mobile Actions */}
        <div className="flex space-x-2 mt-3">
          {session?.status === 'completed' && (
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={handleViewRecommendations}
              iconName="Eye"
              iconPosition="left"
            >
              View Results
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleReanalyze}
            iconName="RotateCcw"
          >
            Retry
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            loading={isDeleting}
            iconName="Trash2"
          >
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-subtle hover:shadow-modal transition-smooth">
      <div className="flex items-start space-x-4">
        {/* Photo Thumbnail */}
        <div className="w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0">
          <Image
            src={session?.photoThumbnail}
            alt="Session photo"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Session Details */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-3">
              <h3 className="text-lg font-semibold text-primary">
                {session?.occasion}
              </h3>
              <div className={`flex items-center space-x-1 ${getStatusColor(session?.status)}`}>
                <Icon name={getStatusIcon(session?.status)} size={16} />
                <span className="text-sm capitalize">{session?.status}</span>
              </div>
            </div>
            
            <span className="text-sm text-text-secondary">
              {new Date(session.uploadDate)?.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: 'numeric'
              })}
            </span>
          </div>

          {session?.status === 'completed' && (
            <>
              <div className="flex items-center space-x-6 mb-3 text-sm text-text-secondary">
                <div className="flex items-center space-x-1">
                  <Icon name="User" size={14} />
                  <span>Body Type: {session?.bodyType}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="Ruler" size={14} />
                  <span>Size: {session?.recommendedSize}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Icon name="Package" size={14} />
                  <span>{session?.productCount} recommendations</span>
                </div>
              </div>

              {/* Top Matches Preview */}
              {session?.topMatches && session?.topMatches?.length > 0 && (
                <div className="mb-4">
                  <p className="text-sm font-medium text-primary mb-2">Top Matches:</p>
                  <div className="flex space-x-2">
                    {session?.topMatches?.slice(0, 3)?.map((match, index) => (
                      <div key={index} className="w-12 h-12 rounded overflow-hidden bg-muted">
                        <Image
                          src={match?.image}
                          alt={match?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                    {session?.topMatches?.length > 3 && (
                      <div className="w-12 h-12 rounded bg-muted flex items-center justify-center">
                        <span className="text-xs text-text-secondary">
                          +{session?.topMatches?.length - 3}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}

          {session?.status === 'failed' && (
            <p className="text-sm text-error mb-3">
              Analysis failed: {session?.errorMessage || 'Unknown error occurred'}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-2">
          {session?.status === 'completed' && (
            <Button
              variant="default"
              size="sm"
              onClick={handleViewRecommendations}
              iconName="Eye"
              iconPosition="left"
            >
              View Results
            </Button>
          )}
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleReanalyze}
            iconName="RotateCcw"
            iconPosition="left"
          >
            Reanalyze
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            loading={isDeleting}
            iconName="Trash2"
          >
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SessionCard;