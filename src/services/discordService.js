// Discord webhook integration for alert notifications
// Sends alerts for major events: attacks, war, terrorism, military actions, etc.

import axios from 'axios';

const ALERT_CATEGORIES = {
  attack: { emoji: '🚨', color: 0xff0000, label: 'ATTACK' },
  war: { emoji: '⚔️', color: 0xff0000, label: 'WAR' },
  terrorism: { emoji: '💥', color: 0xff0000, label: 'TERRORISM' },
  mass_casualty: { emoji: '🏥', color: 0xff0000, label: 'MASS CASUALTY' },
  military_action: { emoji: '🎖️', color: 0xff8c00, label: 'MILITARY ACTION' },
  protest: { emoji: '✊', color: 0xffa500, label: 'PROTEST' },
  breaking: { emoji: '📰', color: 0x3b82f6, label: 'BREAKING' },
  political: { emoji: '🏛️', color: 0x06b6d4, label: 'POLITICAL' },
  iran: { emoji: '🇮🇷', color: 0xff0000, label: 'IRAN' },
  mexico: { emoji: '🇲🇽', color: 0xff8c00, label: 'MEXICO' },
};

// Categorize event for Discord alert
export function categorizeEvent(title, description = '') {
  const text = `${title} ${description}`.toLowerCase();

  if (/terrorist|terrorism|terror attack/.test(text)) return 'terrorism';
  if (/mass casualty|mass shooting|massacre/.test(text)) return 'mass_casualty';
  if (/declaration of war|invad|invasion|war declared/.test(text)) return 'war';
  if (/attack|strike|bomb|shell|missile hit/.test(text)) return 'attack';
  if (/iran|tehran|iranian/.test(text)) return 'iran';
  if (/mexico|mexican military|cartel/.test(text)) return 'mexico';
  if (/military action|troops deploy|carrier strike|naval operation/.test(text)) return 'military_action';
  if (/protest|riot|demonstration|uprising/.test(text)) return 'protest';
  if (/breaking|urgent|just in/.test(text)) return 'breaking';
  if (/congress|senate|white house|executive order/.test(text)) return 'political';

  return 'breaking';
}

// Format Discord embed message
function formatDiscordEmbed(event) {
  const category = categorizeEvent(event.title, event.description);
  const alertMeta = ALERT_CATEGORIES[category] || ALERT_CATEGORIES.breaking;

  return {
    embeds: [
      {
        title: `${alertMeta.emoji} ${alertMeta.label}: ${event.title}`,
        description: event.description || 'No additional details available.',
        color: alertMeta.color,
        fields: [
          { name: 'Source', value: event.source || 'Unknown', inline: true },
          { name: 'Threat Level', value: (event.threatLevel || 'unknown').toUpperCase(), inline: true },
          { name: 'Category', value: category.replace('_', ' ').toUpperCase(), inline: true },
          ...(event.location
            ? [{ name: 'Location', value: event.location.name || 'Unknown', inline: true }]
            : []),
        ],
        timestamp: event.pubDate || new Date().toISOString(),
        footer: { text: 'World Monitor — Global Intelligence Dashboard' },
      },
    ],
  };
}

// Send alert to Discord webhook
export async function sendDiscordAlert(webhookUrl, event) {
  if (!webhookUrl) {
    console.warn('Discord webhook URL not configured');
    return false;
  }

  try {
    const payload = formatDiscordEmbed(event);
    await axios.post(webhookUrl, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 5000,
    });
    console.log(`Discord alert sent: ${event.title}`);
    return true;
  } catch (err) {
    console.error('Discord alert failed:', err.message);
    return false;
  }
}

// Send batch of alerts (with rate limiting)
export async function sendBatchAlerts(webhookUrl, events, delayMs = 1000) {
  const results = [];
  for (const event of events) {
    const success = await sendDiscordAlert(webhookUrl, event);
    results.push({ event: event.title, success });
    // Rate limit: Discord webhooks have 30 req/min limit
    if (events.indexOf(event) < events.length - 1) {
      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }
  return results;
}

// Test webhook connectivity
export async function testWebhook(webhookUrl) {
  try {
    await axios.post(
      webhookUrl,
      {
        embeds: [
          {
            title: '✅ World Monitor Connected',
            description: 'Discord alerts are now active. You will receive notifications for major global events.',
            color: 0x10b981,
            footer: { text: 'World Monitor — Global Intelligence Dashboard' },
            timestamp: new Date().toISOString(),
          },
        ],
      },
      { timeout: 5000 },
    );
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Discord alert settings management
export class DiscordAlertManager {
  constructor() {
    this.webhookUrl = '';
    this.enabledCategories = new Set(Object.keys(ALERT_CATEGORIES));
    this.alertHistory = [];
    this.maxHistory = 100;
    this.cooldowns = new Map(); // Prevent duplicate alerts
    this.cooldownMs = 5 * 60 * 1000; // 5 minute cooldown per similar alert
  }

  configure(webhookUrl) {
    this.webhookUrl = webhookUrl;
  }

  toggleCategory(category) {
    if (this.enabledCategories.has(category)) {
      this.enabledCategories.delete(category);
    } else {
      this.enabledCategories.add(category);
    }
  }

  isCategoryEnabled(category) {
    return this.enabledCategories.has(category);
  }

  async processEvent(event) {
    const category = categorizeEvent(event.title, event.description);

    if (!this.enabledCategories.has(category)) return false;

    // Check cooldown (prevent duplicate/similar alerts)
    const key = `${category}-${event.title.slice(0, 50)}`;
    const lastSent = this.cooldowns.get(key);
    if (lastSent && Date.now() - lastSent < this.cooldownMs) return false;

    const success = await sendDiscordAlert(this.webhookUrl, event);
    if (success) {
      this.cooldowns.set(key, Date.now());
      this.alertHistory.unshift({
        ...event,
        alertCategory: category,
        sentAt: new Date(),
      });
      if (this.alertHistory.length > this.maxHistory) {
        this.alertHistory = this.alertHistory.slice(0, this.maxHistory);
      }
    }
    return success;
  }

  getHistory() {
    return this.alertHistory;
  }

  getEnabledCategories() {
    return [...this.enabledCategories];
  }
}

export const discordManager = new DiscordAlertManager();
export { ALERT_CATEGORIES };
