import React from 'react';
import Icon from '../../../components/AppIcon';
import SessionCard from './SessionCard';

const SessionTimeline = ({ 
  sessions, 
  onReanalyze, 
  onDelete, 
  onViewRecommendations,
  isMobile = false 
}) => {
  if (sessions?.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Clock" size={24} color="var(--color-text-secondary)" />
        </div>
        <h3 className="text-lg font-semibold text-primary mb-2">No Sessions Found</h3>
        <p className="text-text-secondary mb-4">
          You haven't analyzed any photos yet or no sessions match your filters.
        </p>
      </div>
    );
  }

  // Group sessions by date for timeline view
  const groupedSessions = sessions?.reduce((groups, session) => {
    const date = new Date(session.uploadDate)?.toDateString();
    if (!groups?.[date]) {
      groups[date] = [];
    }
    groups?.[date]?.push(session);
    return groups;
  }, {});

  const sortedDates = Object.keys(groupedSessions)?.sort((a, b) => 
    new Date(b) - new Date(a)
  );

  return (
    <div className="space-y-6">
      {sortedDates?.map((dateString) => {
        const date = new Date(dateString);
        const isToday = date?.toDateString() === new Date()?.toDateString();
        const isYesterday = date?.toDateString() === new Date(Date.now() - 86400000)?.toDateString();
        
        let dateLabel;
        if (isToday) {
          dateLabel = 'Today';
        } else if (isYesterday) {
          dateLabel = 'Yesterday';
        } else {
          dateLabel = date?.toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          });
        }

        return (
          <div key={dateString} className="relative">
            {/* Date Header */}
            <div className="flex items-center mb-4">
              <div className="flex items-center space-x-2 bg-surface px-3 py-1 rounded-full border border-border">
                <Icon name="Calendar" size={14} color="var(--color-text-secondary)" />
                <span className="text-sm font-medium text-primary">{dateLabel}</span>
                <span className="text-xs text-text-secondary">
                  {groupedSessions?.[dateString]?.length} session{groupedSessions?.[dateString]?.length !== 1 ? 's' : ''}
                </span>
              </div>
              <div className="flex-1 h-px bg-border ml-4"></div>
            </div>
            {/* Sessions for this date */}
            <div className="space-y-4 ml-4">
              {groupedSessions?.[dateString]?.map((session) => (
                <div key={session?.id} className="relative">
                  {/* Timeline dot */}
                  <div className="absolute -left-6 top-6 w-3 h-3 rounded-full border-2 border-surface bg-accent"></div>
                  
                  <SessionCard
                    session={session}
                    onReanalyze={onReanalyze}
                    onDelete={onDelete}
                    onViewRecommendations={onViewRecommendations}
                    isMobile={isMobile}
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default SessionTimeline;