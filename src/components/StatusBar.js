import React from 'react';

export default function StatusBar({ feedStats, lastUpdate, discordConnected, loading }) {
  const formatTime = (date) => {
    if (!date) return 'Never';
    return date.toLocaleTimeString('en-US', { hour12: false });
  };

  return (
    <div className="status-bar">
      <div className="feed-stats">
        <span>
          {loading ? '⟳ Loading...' : `✓ ${feedStats.total} items from ${feedStats.sources} sources`}
        </span>
        <span>Last update: {formatTime(lastUpdate)}</span>
      </div>
      <div className="feed-stats">
        <span>
          Discord: {discordConnected ? (
            <span style={{ color: '#10b981' }}>Connected</span>
          ) : (
            <span style={{ color: '#5a6577' }}>Not configured</span>
          )}
        </span>
        <span>Refresh: 2min</span>
      </div>
    </div>
  );
}
