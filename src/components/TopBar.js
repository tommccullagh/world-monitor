import React, { useState, useEffect } from 'react';

export default function TopBar({ lastUpdate, feedStats }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const utcTime = time.toUTCString().slice(17, 25);
  const localTime = time.toLocaleTimeString('en-US', { hour12: false });

  return (
    <div className="top-bar">
      <div className="logo">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
        WORLD MONITOR
      </div>

      <div className="status-indicators">
        <span>
          <span className="live-dot"></span>
          LIVE FEED
        </span>
        <span>{feedStats.total} items</span>
        <span style={{ color: feedStats.critical > 0 ? '#ef4444' : '#8892a4' }}>
          {feedStats.critical} critical
        </span>
        <span style={{ color: feedStats.high > 0 ? '#f59e0b' : '#8892a4' }}>
          {feedStats.high} high
        </span>
        <span>{feedStats.sources} sources</span>
      </div>

      <div className="time-display">
        UTC {utcTime} | LOCAL {localTime}
      </div>
    </div>
  );
}
