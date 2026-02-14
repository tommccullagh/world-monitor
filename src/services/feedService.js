import axios from 'axios';

// RSS Feed sources for global intelligence
const RSS_SOURCES = {
  breaking: [
    { name: 'Reuters World', url: 'https://feeds.reuters.com/Reuters/worldNews', category: 'world' },
    { name: 'AP Top News', url: 'https://rsshub.app/apnews/topics/apf-topnews', category: 'world' },
    { name: 'BBC World', url: 'https://feeds.bbci.co.uk/news/world/rss.xml', category: 'world' },
    { name: 'Al Jazeera', url: 'https://www.aljazeera.com/xml/rss/all.xml', category: 'world' },
  ],
  military: [
    { name: 'Defense One', url: 'https://www.defenseone.com/rss/all/', category: 'military' },
    { name: 'War on the Rocks', url: 'https://warontherocks.com/feed/', category: 'military' },
    { name: 'Breaking Defense', url: 'https://breakingdefense.com/feed/', category: 'military' },
    { name: 'The War Zone', url: 'https://www.thedrive.com/the-war-zone/feed', category: 'military' },
  ],
  political: [
    { name: 'Politico', url: 'https://www.politico.com/rss/politicopicks.xml', category: 'political' },
    { name: 'The Hill', url: 'https://thehill.com/feed/', category: 'political' },
    { name: 'Reuters Politics', url: 'https://feeds.reuters.com/Reuters/PoliticsNews', category: 'political' },
    { name: 'AP Politics', url: 'https://rsshub.app/apnews/topics/apf-politics', category: 'political' },
  ],
  conflict: [
    { name: 'ACLED', url: 'https://acleddata.com/feed/', category: 'conflict' },
    { name: 'Liveuamap', url: 'https://liveuamap.com/rss', category: 'conflict' },
    { name: 'Janes', url: 'https://www.janes.com/feeds/news', category: 'conflict' },
  ],
};

// CORS proxy for RSS fetching (needed in Electron renderer)
const CORS_PROXIES = [
  'https://api.allorigins.win/raw?url=',
  'https://api.codetabs.com/v1/proxy?quest=',
];

// Threat keywords for classification
const THREAT_KEYWORDS = {
  critical: [
    'nuclear', 'missile launch', 'invasion', 'declaration of war', 'mass casualty',
    'terrorist attack', 'chemical weapon', 'biological weapon', 'coup d\'etat',
    'martial law', 'emergency declaration', 'DEFCON', 'nuclear strike',
  ],
  high: [
    'airstrike', 'bombing', 'military operation', 'carrier strike', 'naval blockade',
    'assassination', 'hostage', 'insurgency', 'civil war', 'ethnic cleansing',
    'sanctions', 'mobilization', 'troops deployed', 'war crimes', 'massacre',
    'iran attack', 'mexico military', 'military action',
  ],
  medium: [
    'protest', 'riot', 'cyber attack', 'espionage', 'arms deal', 'military exercise',
    'border clash', 'militia', 'drone strike', 'embargo', 'refugee crisis',
    'ceasefire', 'peace talks', 'diplomatic crisis', 'election interference',
  ],
  low: [
    'summit', 'trade deal', 'diplomatic visit', 'UN resolution', 'aid package',
    'peacekeeping', 'treaty', 'bilateral talks', 'defense budget',
  ],
};

// Alert-worthy categories for Discord notifications
const DISCORD_ALERT_KEYWORDS = [
  'attack', 'war', 'terrorist', 'mass casualty', 'bombing', 'invasion',
  'missile', 'nuclear', 'military action', 'protest', 'breaking',
  'iran', 'mexico', 'strike group', 'carrier', 'troops',
];

export function classifyThreat(title, description = '') {
  const text = `${title} ${description}`.toLowerCase();
  for (const [level, keywords] of Object.entries(THREAT_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) return level;
  }
  return 'low';
}

export function shouldAlertDiscord(title, description = '') {
  const text = `${title} ${description}`.toLowerCase();
  return DISCORD_ALERT_KEYWORDS.some((kw) => text.includes(kw));
}

export function extractLocation(text) {
  // Simple geographic entity extraction
  const countries = {
    'ukraine': [48.38, 31.17], 'russia': [61.52, 105.32], 'china': [35.86, 104.20],
    'iran': [32.43, 53.69], 'iraq': [33.22, 43.68], 'syria': [34.80, 38.99],
    'israel': [31.05, 34.85], 'gaza': [31.35, 34.31], 'lebanon': [33.85, 35.86],
    'taiwan': [23.70, 120.96], 'north korea': [40.34, 127.51], 'south korea': [35.91, 127.77],
    'mexico': [23.63, -102.55], 'yemen': [15.55, 48.52], 'libya': [26.34, 17.23],
    'somalia': [5.15, 46.20], 'sudan': [12.86, 30.22], 'afghanistan': [33.94, 67.71],
    'pakistan': [30.38, 69.35], 'india': [20.59, 78.96], 'myanmar': [21.91, 95.96],
    'ethiopia': [9.15, 40.49], 'niger': [17.61, 8.08], 'mali': [17.57, -4.0],
    'united states': [37.09, -95.71], 'washington': [38.91, -77.04],
    'pentagon': [38.87, -77.06], 'moscow': [55.76, 37.62], 'beijing': [39.90, 116.41],
    'tehran': [35.69, 51.39], 'jerusalem': [31.77, 35.23], 'taipei': [25.03, 121.57],
    'kyiv': [50.45, 30.52], 'seoul': [37.57, 126.98], 'pyongyang': [39.02, 125.75],
    'middle east': [29.31, 47.48], 'persian gulf': [26.84, 51.51],
    'south china sea': [12.0, 113.0], 'red sea': [20.0, 38.0],
    'black sea': [43.0, 35.0], 'mediterranean': [35.0, 18.0],
    'pacific': [0.0, -160.0], 'atlantic': [30.0, -42.0],
  };

  const lower = text.toLowerCase();
  for (const [place, coords] of Object.entries(countries)) {
    if (lower.includes(place)) return { name: place, lat: coords[0], lng: coords[1] };
  }
  return null;
}

// Simulated RSS fetch (using CORS proxy or direct fetch)
async function fetchRSSFeed(source) {
  try {
    const response = await axios.get(`${CORS_PROXIES[0]}${encodeURIComponent(source.url)}`, {
      timeout: 8000,
      headers: { 'Accept': 'application/rss+xml, application/xml, text/xml' },
    });

    // Simple XML parsing for RSS items
    const items = parseRSSXML(response.data, source);
    return items;
  } catch (err) {
    console.warn(`Feed fetch failed for ${source.name}:`, err.message);
    return [];
  }
}

function parseRSSXML(xml, source) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/gi;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    const title = extractTag(itemXml, 'title');
    const description = extractTag(itemXml, 'description');
    const link = extractTag(itemXml, 'link');
    const pubDate = extractTag(itemXml, 'pubDate');

    if (title) {
      const threatLevel = classifyThreat(title, description);
      const location = extractLocation(`${title} ${description}`);

      items.push({
        id: `${source.name}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        title: decodeHTML(title),
        description: decodeHTML(description || '').slice(0, 200),
        link,
        pubDate: pubDate ? new Date(pubDate) : new Date(),
        source: source.name,
        category: source.category,
        threatLevel,
        location,
        isAlert: shouldAlertDiscord(title, description),
      });
    }
  }

  return items.slice(0, 15); // Limit per feed
}

function extractTag(xml, tag) {
  const regex = new RegExp(`<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]></${tag}>|<${tag}[^>]*>([\\s\\S]*?)</${tag}>`, 'i');
  const match = regex.exec(xml);
  return match ? (match[1] || match[2] || '').trim() : '';
}

function decodeHTML(html) {
  const entities = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'" };
  return html.replace(/&amp;|&lt;|&gt;|&quot;|&#39;/g, (m) => entities[m] || m)
    .replace(/<[^>]+>/g, ''); // Strip HTML tags
}

export async function fetchAllFeeds() {
  const allSources = [
    ...RSS_SOURCES.breaking,
    ...RSS_SOURCES.military,
    ...RSS_SOURCES.political,
    ...RSS_SOURCES.conflict,
  ];

  const results = await Promise.allSettled(allSources.map(fetchRSSFeed));
  const items = results
    .filter((r) => r.status === 'fulfilled')
    .flatMap((r) => r.value)
    .sort((a, b) => b.pubDate - a.pubDate);

  return items;
}

export function getAlertWorthy(items) {
  return items.filter((item) => item.isAlert || item.threatLevel === 'critical');
}

export { RSS_SOURCES };
