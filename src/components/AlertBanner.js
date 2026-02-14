import React, { useState, useEffect } from 'react';

export default function AlertBanner({ alerts }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (alerts.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % alerts.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [alerts.length]);

  if (alerts.length === 0) return null;

  const alert = alerts[currentIndex];

  return (
    <div className="alert-banner" style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }}>
      <span style={{ fontSize: '14px' }}>⚠️</span>
      <span style={{ fontWeight: 600, color: '#ef4444', marginRight: 6 }}>ALERT:</span>
      <span style={{ flex: 1 }}>{alert.title}</span>
      <span style={{ fontSize: '10px', color: '#8892a4' }}>
        {alert.source} — {currentIndex + 1}/{alerts.length}
      </span>
    </div>
  );
}
