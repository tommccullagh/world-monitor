// World Monitor Configuration
// Copy this to config.local.js and fill in your values

const config = {
  // Discord webhook URL for alerts
  discordWebhookUrl: '',

  // Feed refresh interval in milliseconds
  feedRefreshInterval: 120000, // 2 minutes

  // Military position refresh interval
  militaryRefreshInterval: 30000, // 30 seconds

  // Alert categories enabled by default
  defaultAlertCategories: [
    'attack',
    'war',
    'terrorism',
    'mass_casualty',
    'military_action',
    'protest',
    'breaking',
    'iran',
    'mexico',
  ],

  // Map default view
  mapCenter: [25, 20],
  mapZoom: 3,

  // Maximum feed items to display
  maxFeedItems: 200,

  // RSS CORS proxy (for fetching RSS from renderer process)
  corsProxy: 'https://api.allorigins.win/raw?url=',
};

export default config;
