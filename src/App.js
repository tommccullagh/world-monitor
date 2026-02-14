import React, { useState, useEffect, useCallback, useRef } from 'react';
import GlobalMap from './components/GlobalMap';
import TopBar from './components/TopBar';
import LeftSidebar from './components/LeftSidebar';
import RightPanel from './components/RightPanel';
import StatusBar from './components/StatusBar';
import AlertBanner from './components/AlertBanner';
import { fetchAllFeeds, getAlertWorthy } from './services/feedService';
import { getMilitaryAssets, getMilitaryEvents } from './services/militaryService';
import { getPoliticalStories, getPoliticalAlerts } from './services/politicalService';
import { discordManager } from './services/discordService';

export default function App() {
  // Core state
  const [feedItems, setFeedItems] = useState([]);
  const [militaryAssets, setMilitaryAssets] = useState({ carriers: [], bombers: [], fighters: [], all: [] });
  const [militaryEvents, setMilitaryEvents] = useState([]);
  const [politicalStories, setPoliticalStories] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(null);

  // UI state
  const [activeLayers, setActiveLayers] = useState({
    carriers: true,
    fighters: true,
    bombers: true,
    events: true,
    conflicts: true,
  });
  const [rightPanelTab, setRightPanelTab] = useState('feed');
  const [selectedAsset, setSelectedAsset] = useState(null);

  // Discord state
  const [discordWebhook, setDiscordWebhook] = useState('');
  const [discordConnected, setDiscordConnected] = useState(false);
  const [discordCategories, setDiscordCategories] = useState({
    attack: true, war: true, terrorism: true, mass_casualty: true,
    military_action: true, protest: true, breaking: true, political: false,
    iran: true, mexico: true,
  });

  // Feed stats
  const [feedStats, setFeedStats] = useState({
    total: 0,
    critical: 0,
    high: 0,
    sources: 0,
  });

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      // Fetch feeds
      const items = await fetchAllFeeds();
      setFeedItems(items);

      // Get military data
      const assets = getMilitaryAssets();
      setMilitaryAssets(assets);
      setMilitaryEvents(getMilitaryEvents());

      // Get political data
      setPoliticalStories(getPoliticalStories());

      // Extract alerts
      const alertItems = getAlertWorthy(items);
      const politicalAlerts = getPoliticalAlerts();
      setAlerts([...alertItems.slice(0, 5), ...politicalAlerts.map((p) => ({
        ...p,
        title: p.title,
        threatLevel: 'high',
        source: p.sources[0],
        pubDate: p.lastUpdate,
      }))]);

      // Update stats
      const sources = new Set(items.map((i) => i.source));
      setFeedStats({
        total: items.length,
        critical: items.filter((i) => i.threatLevel === 'critical').length,
        high: items.filter((i) => i.threatLevel === 'high').length,
        sources: sources.size,
      });

      setLastUpdate(new Date());
      setLoading(false);

      // Process alerts for Discord
      if (discordWebhook) {
        for (const alert of alertItems.slice(0, 3)) {
          await discordManager.processEvent(alert);
        }
      }
    } catch (err) {
      console.error('Data load error:', err);
      setLoading(false);
    }
  }, [discordWebhook]);

  // Initial load + periodic refresh
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 120000); // Refresh every 2 min
    return () => clearInterval(interval);
  }, [loadData]);

  // Refresh military positions more frequently
  useEffect(() => {
    const interval = setInterval(() => {
      setMilitaryAssets(getMilitaryAssets());
    }, 30000); // Every 30s
    return () => clearInterval(interval);
  }, []);

  // Layer toggle handler
  const toggleLayer = useCallback((layer) => {
    setActiveLayers((prev) => ({ ...prev, [layer]: !prev[layer] }));
  }, []);

  // Discord config handlers
  const handleDiscordConnect = useCallback(async (webhookUrl) => {
    setDiscordWebhook(webhookUrl);
    discordManager.configure(webhookUrl);
    setDiscordConnected(true);
  }, []);

  const handleDiscordToggleCategory = useCallback((category) => {
    setDiscordCategories((prev) => {
      const next = { ...prev, [category]: !prev[category] };
      discordManager.toggleCategory(category);
      return next;
    });
  }, []);

  return (
    <div className="app-container">
      <TopBar lastUpdate={lastUpdate} feedStats={feedStats} />

      <LeftSidebar
        activeLayers={activeLayers}
        onToggleLayer={toggleLayer}
        militaryAssets={militaryAssets}
        onSelectAsset={setSelectedAsset}
        discordWebhook={discordWebhook}
        discordConnected={discordConnected}
        discordCategories={discordCategories}
        onDiscordConnect={handleDiscordConnect}
        onDiscordToggleCategory={handleDiscordToggleCategory}
      />

      <div className="map-container">
        {alerts.length > 0 && <AlertBanner alerts={alerts} />}
        <GlobalMap
          feedItems={feedItems}
          militaryAssets={militaryAssets}
          activeLayers={activeLayers}
          selectedAsset={selectedAsset}
          onSelectAsset={setSelectedAsset}
        />
      </div>

      <RightPanel
        activeTab={rightPanelTab}
        onTabChange={setRightPanelTab}
        feedItems={feedItems}
        militaryAssets={militaryAssets}
        militaryEvents={militaryEvents}
        politicalStories={politicalStories}
        loading={loading}
      />

      <StatusBar
        feedStats={feedStats}
        lastUpdate={lastUpdate}
        discordConnected={discordConnected}
        loading={loading}
      />
    </div>
  );
}
