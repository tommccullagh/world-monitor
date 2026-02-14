import React, { useState } from 'react';

function LayerToggle({ label, active, color, onClick }) {
  return (
    <div className={`layer-toggle ${active ? 'active' : ''}`} onClick={onClick}>
      <div className="toggle-dot" style={active ? { borderColor: color, background: color } : {}} />
      <span>{label}</span>
    </div>
  );
}

function MilitaryAssetSummary({ militaryAssets, onSelectAsset }) {
  return (
    <div>
      {militaryAssets.carriers?.map((csg) => (
        <div key={csg.id} className="military-asset" onClick={() => onSelectAsset(csg)}>
          <div className="asset-icon carrier">⚓</div>
          <div className="asset-info">
            <h4>{csg.name}</h4>
            <p>{csg.region}</p>
          </div>
          <span className={`asset-status status-${csg.status?.toLowerCase()}`}>
            {csg.status}
          </span>
        </div>
      ))}
      {militaryAssets.bombers?.map((b) => (
        <div key={b.id} className="military-asset" onClick={() => onSelectAsset(b)}>
          <div className="asset-icon bomber">💣</div>
          <div className="asset-info">
            <h4>{b.type}</h4>
            <p>{b.mission}</p>
          </div>
          <span className={`asset-status status-${b.status?.toLowerCase()}`}>
            {b.status}
          </span>
        </div>
      ))}
      {militaryAssets.fighters?.slice(0, 3).map((f) => (
        <div key={f.id} className="military-asset" onClick={() => onSelectAsset(f)}>
          <div className="asset-icon fighter">✈</div>
          <div className="asset-info">
            <h4>{f.type}</h4>
            <p>{f.base}</p>
          </div>
          <span className={`asset-status status-${f.status?.toLowerCase()}`}>
            {f.status}
          </span>
        </div>
      ))}
    </div>
  );
}

function DiscordSettings({ webhook, connected, categories, onConnect, onToggleCategory }) {
  const [url, setUrl] = useState(webhook || '');
  const [testing, setTesting] = useState(false);

  const handleConnect = async () => {
    if (!url.startsWith('https://discord.com/api/webhooks/')) {
      alert('Please enter a valid Discord webhook URL');
      return;
    }
    setTesting(true);
    await onConnect(url);
    setTesting(false);
  };

  const categoryLabels = {
    attack: 'Attacks',
    war: 'War / Invasion',
    terrorism: 'Terrorism',
    mass_casualty: 'Mass Casualty',
    military_action: 'Military Actions',
    protest: 'Protests / Unrest',
    breaking: 'Breaking News',
    political: 'US Political',
    iran: 'Iran Events',
    mexico: 'Mexico Events',
  };

  return (
    <div className="discord-config">
      <div className="webhook-status">
        <div className={`dot ${connected ? 'dot-connected' : 'dot-disconnected'}`} />
        <span>{connected ? 'Connected' : 'Not connected'}</span>
      </div>

      <div className="settings-section" style={{ padding: 0 }}>
        <label>Discord Webhook URL</label>
        <input
          type="text"
          placeholder="https://discord.com/api/webhooks/..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <button onClick={handleConnect} disabled={testing}>
          {testing ? 'Testing...' : connected ? 'Reconnect' : 'Connect'}
        </button>
      </div>

      <div style={{ marginTop: 12 }}>
        <h3 style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, color: '#5a6577', marginBottom: 6 }}>
          Alert Categories
        </h3>
        {Object.entries(categoryLabels).map(([key, label]) => (
          <div key={key} className="alert-category">
            <span>{label}</span>
            <div
              className={`toggle-switch ${categories[key] ? 'on' : ''}`}
              onClick={() => onToggleCategory(key)}
            >
              <div className="toggle-knob" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LeftSidebar({
  activeLayers, onToggleLayer, militaryAssets, onSelectAsset,
  discordWebhook, discordConnected, discordCategories,
  onDiscordConnect, onDiscordToggleCategory,
}) {
  const [sidebarTab, setSidebarTab] = useState('layers');

  return (
    <div className="left-sidebar">
      {/* Sidebar tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #2a3548' }}>
        {['layers', 'military', 'discord'].map((tab) => (
          <button
            key={tab}
            className={`panel-tab ${sidebarTab === tab ? 'active' : ''}`}
            onClick={() => setSidebarTab(tab)}
          >
            {tab === 'layers' ? 'Layers' : tab === 'military' ? 'Forces' : 'Discord'}
          </button>
        ))}
      </div>

      {sidebarTab === 'layers' && (
        <>
          <div className="sidebar-section">
            <h3>Map Layers</h3>
            <LayerToggle
              label="Carrier Strike Groups"
              active={activeLayers.carriers}
              color="#3b82f6"
              onClick={() => onToggleLayer('carriers')}
            />
            <LayerToggle
              label="Fighter Deployments"
              active={activeLayers.fighters}
              color="#ef4444"
              onClick={() => onToggleLayer('fighters')}
            />
            <LayerToggle
              label="Bomber Patrols"
              active={activeLayers.bombers}
              color="#f59e0b"
              onClick={() => onToggleLayer('bombers')}
            />
            <LayerToggle
              label="Live Events"
              active={activeLayers.events}
              color="#06b6d4"
              onClick={() => onToggleLayer('events')}
            />
            <LayerToggle
              label="Conflict Zones"
              active={activeLayers.conflicts}
              color="#ef4444"
              onClick={() => onToggleLayer('conflicts')}
            />
          </div>

          <div className="sidebar-section">
            <h3>Quick Stats</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 4 }}>
              <div style={{ background: '#1f2937', borderRadius: 6, padding: '8px 10px' }}>
                <div style={{ fontSize: 9, color: '#5a6577', textTransform: 'uppercase' }}>Carriers</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#3b82f6' }}>
                  {militaryAssets.carriers?.length || 0}
                </div>
              </div>
              <div style={{ background: '#1f2937', borderRadius: 6, padding: '8px 10px' }}>
                <div style={{ fontSize: 9, color: '#5a6577', textTransform: 'uppercase' }}>Fighters</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#ef4444' }}>
                  {militaryAssets.fighters?.length || 0}
                </div>
              </div>
              <div style={{ background: '#1f2937', borderRadius: 6, padding: '8px 10px' }}>
                <div style={{ fontSize: 9, color: '#5a6577', textTransform: 'uppercase' }}>Bombers</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#f59e0b' }}>
                  {militaryAssets.bombers?.length || 0}
                </div>
              </div>
              <div style={{ background: '#1f2937', borderRadius: 6, padding: '8px 10px' }}>
                <div style={{ fontSize: 9, color: '#5a6577', textTransform: 'uppercase' }}>On Alert</div>
                <div style={{ fontSize: 18, fontWeight: 700, color: '#ef4444' }}>
                  {militaryAssets.all?.filter((a) => a.status === 'Alert').length || 0}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {sidebarTab === 'military' && (
        <div className="sidebar-section" style={{ padding: 0 }}>
          <div style={{ padding: '12px 12px 6px', borderBottom: '1px solid #2a3548' }}>
            <h3 style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: 1.5, color: '#5a6577' }}>
              Tracked Military Assets
            </h3>
          </div>
          <MilitaryAssetSummary militaryAssets={militaryAssets} onSelectAsset={onSelectAsset} />
        </div>
      )}

      {sidebarTab === 'discord' && (
        <DiscordSettings
          webhook={discordWebhook}
          connected={discordConnected}
          categories={discordCategories}
          onConnect={onDiscordConnect}
          onToggleCategory={onDiscordToggleCategory}
        />
      )}
    </div>
  );
}
