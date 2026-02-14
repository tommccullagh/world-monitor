// US Political tracking service
// Monitors political news velocity and identifies spiking stories

import { classifyThreat } from './feedService';

// Political topic categories for tracking
const POLITICAL_TOPICS = [
  'congress', 'senate', 'house', 'supreme court', 'white house', 'pentagon',
  'executive order', 'legislation', 'impeachment', 'election', 'campaign',
  'democrat', 'republican', 'bipartisan', 'filibuster', 'veto',
  'foreign policy', 'defense bill', 'budget', 'shutdown', 'debt ceiling',
];

// Tracked political figures
const KEY_FIGURES = [
  'president', 'vice president', 'speaker', 'majority leader', 'minority leader',
  'secretary of state', 'secretary of defense', 'national security advisor',
  'attorney general', 'cia director', 'fbi director', 'joint chiefs',
];

// Simulated spiking political stories with velocity metrics
const MOCK_POLITICAL_STORIES = [
  {
    id: 'pol-1',
    title: 'Senate advances defense spending bill with bipartisan support',
    topic: 'Defense Budget',
    velocity: 78,
    sentiment: 'neutral',
    mentions: 342,
    trendDirection: 'up',
    sources: ['Reuters', 'AP', 'Politico', 'The Hill'],
    lastUpdate: new Date(Date.now() - 900000),
    category: 'legislation',
  },
  {
    id: 'pol-2',
    title: 'White House announces new Iran sanctions package',
    topic: 'Foreign Policy',
    velocity: 92,
    sentiment: 'negative',
    mentions: 518,
    trendDirection: 'up',
    sources: ['Reuters', 'BBC', 'Al Jazeera', 'CNN', 'Fox News'],
    lastUpdate: new Date(Date.now() - 600000),
    category: 'executive_action',
  },
  {
    id: 'pol-3',
    title: 'Congressional hearing on military readiness in Pacific',
    topic: 'Military Oversight',
    velocity: 55,
    sentiment: 'neutral',
    mentions: 189,
    trendDirection: 'stable',
    sources: ['Defense One', 'Breaking Defense', 'Politico'],
    lastUpdate: new Date(Date.now() - 1800000),
    category: 'oversight',
  },
  {
    id: 'pol-4',
    title: 'Pentagon briefing: increased activity near Mexico border',
    topic: 'Border Security',
    velocity: 85,
    sentiment: 'negative',
    mentions: 445,
    trendDirection: 'up',
    sources: ['AP', 'Reuters', 'CNN', 'Fox News', 'NBC'],
    lastUpdate: new Date(Date.now() - 300000),
    category: 'defense',
  },
  {
    id: 'pol-5',
    title: 'State Department issues travel warning for Middle East region',
    topic: 'Diplomacy',
    velocity: 67,
    sentiment: 'negative',
    mentions: 278,
    trendDirection: 'up',
    sources: ['Reuters', 'AP', 'State Dept'],
    lastUpdate: new Date(Date.now() - 2400000),
    category: 'diplomacy',
  },
  {
    id: 'pol-6',
    title: 'House Intelligence Committee holds classified briefing on China',
    topic: 'Intelligence',
    velocity: 44,
    sentiment: 'neutral',
    mentions: 156,
    trendDirection: 'stable',
    sources: ['Politico', 'The Hill', 'CNN'],
    lastUpdate: new Date(Date.now() - 4200000),
    category: 'oversight',
  },
  {
    id: 'pol-7',
    title: 'National Guard deployment to southern border expanded',
    topic: 'Border Security',
    velocity: 88,
    sentiment: 'negative',
    mentions: 621,
    trendDirection: 'up',
    sources: ['AP', 'Reuters', 'CNN', 'Fox News', 'MSNBC', 'NBC'],
    lastUpdate: new Date(Date.now() - 150000),
    category: 'defense',
  },
];

export function getPoliticalStories() {
  return MOCK_POLITICAL_STORIES
    .map((story) => ({
      ...story,
      threatLevel: story.velocity > 80 ? 'high' : story.velocity > 50 ? 'medium' : 'low',
      isBreaking: story.velocity > 85,
      velocityLabel: story.velocity > 80 ? 'SPIKING' : story.velocity > 50 ? 'TRENDING' : 'MONITORING',
    }))
    .sort((a, b) => b.velocity - a.velocity);
}

export function getTopSpikingStories(limit = 3) {
  return getPoliticalStories()
    .filter((s) => s.trendDirection === 'up')
    .slice(0, limit);
}

export function getPoliticalAlerts() {
  return getPoliticalStories().filter((s) => s.isBreaking);
}

// Track story velocity over time (for spike detection)
class VelocityTracker {
  constructor() {
    this.windows = new Map(); // storyId -> array of {timestamp, count}
    this.windowSize = 30 * 60 * 1000; // 30 minute window
  }

  recordMention(storyId) {
    if (!this.windows.has(storyId)) {
      this.windows.set(storyId, []);
    }
    const window = this.windows.get(storyId);
    window.push({ timestamp: Date.now(), count: 1 });

    // Clean old entries
    const cutoff = Date.now() - this.windowSize;
    this.windows.set(storyId, window.filter((w) => w.timestamp > cutoff));
  }

  getVelocity(storyId) {
    const window = this.windows.get(storyId) || [];
    return window.length;
  }

  getSpikes(threshold = 10) {
    const spikes = [];
    for (const [storyId, window] of this.windows.entries()) {
      if (window.length >= threshold) {
        spikes.push({ storyId, velocity: window.length });
      }
    }
    return spikes.sort((a, b) => b.velocity - a.velocity);
  }
}

export const velocityTracker = new VelocityTracker();
