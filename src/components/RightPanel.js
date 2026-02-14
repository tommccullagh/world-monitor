import React from 'react';

function timeAgo(date) {
  if (!date) return '';
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

function FeedTab({ feedItems, loading }) {
  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: 'center', color: '#5a6577' }}>
        Loading intelligence feed...
      </div>
    );
  }

  if (feedItems.length === 0) {
    return (
      <div style={{ padding: 20, textAlign: 'center', color: '#5a6577' }}>
        No feed items. Feeds will populate from live RSS sources.
        <br /><br />
        <span style={{ fontSize: 11 }}>
          Sources: Reuters, AP, BBC, Al Jazeera, Defense One, Politico, and more.
        </span>
      </div>
    );
  }

  return (
    <div>
      {feedItems.slice(0, 50).map((item) => (
        <div key={item.id} className="feed-item" onClick={() => item.link && window.open(item.link, '_blank')}>
          <div className="feed-time">{timeAgo(item.pubDate)}</div>
          <div style={{ display: 'flex', gap: 4, marginBottom: 2 }}>
            <span className={`feed-tag tag-${item.threatLevel}`}>
              {item.threatLevel}
            </span>
            {item.category && (
              <span className={`feed-tag tag-${item.category === 'military' ? 'military' : item.category === 'political' ? 'political' : 'medium'}`}>
                {item.category}
              </span>
            )}
            {item.isAlert && <span className="feed-tag tag-breaking">ALERT</span>}
          </div>
          <div className="feed-title">{item.title}</div>
          <div className="feed-source">
            {item.source}
            {item.location && ` — ${item.location.name}`}
          </div>
        </div>
      ))}
    </div>
  );
}

function MilitaryTab({ militaryAssets, militaryEvents }) {
  return (
    <div>
      {/* Recent military events */}
      <div style={{ padding: '10px 12px', borderBottom: '1px solid #2a3548' }}>
        <h3 style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, color: '#5a6577' }}>
          Recent Activity
        </h3>
      </div>
      {militaryEvents.map((event) => (
        <div key={event.id} className="feed-item">
          <div className="feed-time">{timeAgo(event.time)}</div>
          <div style={{ marginBottom: 2 }}>
            <span className={`feed-tag tag-${event.severity === 'high' ? 'high' : 'medium'}`}>
              {event.severity}
            </span>
            <span className="feed-tag tag-military">MILITARY</span>
          </div>
          <div className="feed-title">{event.title}</div>
        </div>
      ))}

      {/* Carrier details */}
      <div style={{ padding: '10px 12px', borderBottom: '1px solid #2a3548' }}>
        <h3 style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, color: '#5a6577' }}>
          Carrier Strike Groups
        </h3>
      </div>
      {militaryAssets.carriers?.map((csg) => (
        <div key={csg.id} className="feed-item">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ fontSize: 13 }}>{csg.carrier}</strong>
            <span className={`asset-status status-${csg.status?.toLowerCase()}`}>{csg.status}</span>
          </div>
          <div style={{ fontSize: 11, color: '#8892a4', marginTop: 4 }}>
            <div>Air Wing: {csg.airWing}</div>
            <div>Region: {csg.region}</div>
            <div style={{ marginTop: 4 }}>
              Escorts: {csg.escorts?.join(', ')}
            </div>
          </div>
        </div>
      ))}

      {/* Fighter deployments */}
      <div style={{ padding: '10px 12px', borderBottom: '1px solid #2a3548' }}>
        <h3 style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, color: '#5a6577' }}>
          Fighter Deployments
        </h3>
      </div>
      {militaryAssets.fighters?.map((f) => (
        <div key={f.id} className="feed-item">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ fontSize: 12 }}>{f.type}</strong>
            <span className={`asset-status status-${f.status?.toLowerCase()}`}>{f.status}</span>
          </div>
          <div style={{ fontSize: 11, color: '#8892a4', marginTop: 2 }}>
            {f.unit} — {f.base}
          </div>
        </div>
      ))}

      {/* Bomber missions */}
      <div style={{ padding: '10px 12px', borderBottom: '1px solid #2a3548' }}>
        <h3 style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, color: '#5a6577' }}>
          Bomber Operations
        </h3>
      </div>
      {militaryAssets.bombers?.map((b) => (
        <div key={b.id} className="feed-item">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ fontSize: 12 }}>{b.type}</strong>
            <span className={`asset-status status-${b.status?.toLowerCase()}`}>{b.status}</span>
          </div>
          <div style={{ fontSize: 11, color: '#8892a4', marginTop: 2 }}>
            {b.unit} — {b.mission}
          </div>
        </div>
      ))}
    </div>
  );
}

function PoliticalTab({ politicalStories }) {
  if (politicalStories.length === 0) {
    return (
      <div style={{ padding: 20, textAlign: 'center', color: '#5a6577' }}>
        Loading political stories...
      </div>
    );
  }

  return (
    <div>
      <div style={{ padding: '10px 12px', borderBottom: '1px solid #2a3548' }}>
        <h3 style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, color: '#5a6577' }}>
          US Political Tracker — Spiking Stories
        </h3>
      </div>
      {politicalStories.map((story) => (
        <div key={story.id} className="political-story">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span className={`feed-tag tag-${story.threatLevel}`}>
              {story.velocityLabel}
            </span>
            <span style={{ fontSize: 10, color: '#5a6577' }}>{timeAgo(story.lastUpdate)}</span>
          </div>
          {story.isBreaking && (
            <span className="feed-tag tag-breaking" style={{ marginBottom: 4 }}>BREAKING</span>
          )}
          <div className="feed-title" style={{ fontSize: 13, marginBottom: 4 }}>{story.title}</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8892a4' }}>
            <span>{story.topic}</span>
            <span>{story.mentions} mentions</span>
          </div>
          <div className="spike-bar">
            <div
              className={`spike-fill ${story.velocity > 80 ? 'spike-critical' : story.velocity > 50 ? 'spike-high' : 'spike-medium'}`}
              style={{ width: `${Math.min(100, story.velocity)}%` }}
            />
          </div>
          <div style={{ fontSize: 10, color: '#5a6577', marginTop: 4 }}>
            Sources: {story.sources.join(', ')}
          </div>
        </div>
      ))}
    </div>
  );
}

export default function RightPanel({
  activeTab, onTabChange, feedItems, militaryAssets,
  militaryEvents, politicalStories, loading,
}) {
  return (
    <div className="right-panel">
      <div className="panel-tab-bar">
        <button
          className={`panel-tab ${activeTab === 'feed' ? 'active' : ''}`}
          onClick={() => onTabChange('feed')}
        >
          Intel Feed
        </button>
        <button
          className={`panel-tab ${activeTab === 'military' ? 'active' : ''}`}
          onClick={() => onTabChange('military')}
        >
          Military
        </button>
        <button
          className={`panel-tab ${activeTab === 'political' ? 'active' : ''}`}
          onClick={() => onTabChange('political')}
        >
          Political
        </button>
      </div>

      {activeTab === 'feed' && <FeedTab feedItems={feedItems} loading={loading} />}
      {activeTab === 'military' && (
        <MilitaryTab militaryAssets={militaryAssets} militaryEvents={militaryEvents} />
      )}
      {activeTab === 'political' && <PoliticalTab politicalStories={politicalStories} />}
    </div>
  );
}
