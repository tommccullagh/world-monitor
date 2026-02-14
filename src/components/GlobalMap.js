import React, { useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker, Tooltip } from 'react-leaflet';
import L from 'leaflet';

// Custom marker icons
function createIcon(className, label) {
  return L.divIcon({
    className: 'marker-military',
    html: `<div class="marker-icon ${className}">${label}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });
}

const ICONS = {
  carrier: createIcon('marker-carrier', '⚓'),
  fighter: createIcon('marker-fighter', '✈'),
  bomber: createIcon('marker-bomber', '💣'),
  event: createIcon('marker-event', '⚡'),
};

function MapOverlayStats({ militaryAssets, feedItems }) {
  const criticalCount = feedItems.filter((f) => f.threatLevel === 'critical').length;
  const highCount = feedItems.filter((f) => f.threatLevel === 'high').length;
  const totalAssets = militaryAssets.all?.length || 0;

  // Compute threat level
  let threatLevel = 'LOW';
  let threatColor = '#10b981';
  let activeBars = 1;
  if (criticalCount > 0) { threatLevel = 'CRITICAL'; threatColor = '#ef4444'; activeBars = 4; }
  else if (highCount > 3) { threatLevel = 'HIGH'; threatColor = '#f59e0b'; activeBars = 3; }
  else if (highCount > 0) { threatLevel = 'ELEVATED'; threatColor = '#3b82f6'; activeBars = 2; }

  return (
    <div className="map-overlay-stats">
      <div className="overlay-stat">
        <h4>Global Threat Level</h4>
        <div className="stat-value" style={{ color: threatColor }}>{threatLevel}</div>
        <div className="threat-level-indicator">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className={`bar ${i <= activeBars ? (
                i <= 1 ? 'active-low' : i <= 2 ? 'active-medium' : i <= 3 ? 'active-high' : 'active-critical'
              ) : ''}`}
            />
          ))}
        </div>
      </div>
      <div className="overlay-stat">
        <h4>Tracked Military Assets</h4>
        <div className="stat-value" style={{ color: '#3b82f6' }}>{totalAssets}</div>
      </div>
      <div className="overlay-stat">
        <h4>Active Intel Items</h4>
        <div className="stat-value" style={{ color: '#06b6d4' }}>{feedItems.length}</div>
      </div>
    </div>
  );
}

export default function GlobalMap({ feedItems, militaryAssets, activeLayers, selectedAsset, onSelectAsset }) {
  // Filter map items based on active layers
  const mapMarkers = useMemo(() => {
    const markers = [];

    if (activeLayers.carriers) {
      militaryAssets.carriers?.forEach((c) => {
        markers.push({ ...c, markerType: 'carrier', icon: ICONS.carrier });
      });
    }
    if (activeLayers.fighters) {
      militaryAssets.fighters?.forEach((f) => {
        markers.push({ ...f, markerType: 'fighter', icon: ICONS.fighter });
      });
    }
    if (activeLayers.bombers) {
      militaryAssets.bombers?.forEach((b) => {
        markers.push({ ...b, markerType: 'bomber', icon: ICONS.bomber });
      });
    }

    return markers;
  }, [militaryAssets, activeLayers]);

  // Event locations from feed items
  const eventMarkers = useMemo(() => {
    if (!activeLayers.events) return [];
    return feedItems
      .filter((item) => item.location && (item.threatLevel === 'critical' || item.threatLevel === 'high'))
      .slice(0, 30)
      .map((item) => ({
        ...item,
        lat: item.location.lat,
        lng: item.location.lng,
        markerType: 'event',
      }));
  }, [feedItems, activeLayers.events]);

  // Conflict zone circles
  const conflictZones = useMemo(() => {
    if (!activeLayers.conflicts) return [];
    return [
      { name: 'Ukraine Conflict', lat: 48.38, lng: 36.0, radius: 200000, color: '#ef4444' },
      { name: 'Gaza', lat: 31.35, lng: 34.31, radius: 50000, color: '#ef4444' },
      { name: 'Red Sea / Yemen', lat: 15.0, lng: 42.0, radius: 150000, color: '#f59e0b' },
      { name: 'South China Sea', lat: 12.0, lng: 113.0, radius: 300000, color: '#f59e0b' },
      { name: 'Syria', lat: 35.0, lng: 38.0, radius: 120000, color: '#ef4444' },
      { name: 'Sudan', lat: 15.5, lng: 32.5, radius: 200000, color: '#f59e0b' },
      { name: 'Iran Border', lat: 32.4, lng: 53.7, radius: 250000, color: '#f59e0b' },
      { name: 'Mexico Border', lat: 29.0, lng: -104.0, radius: 200000, color: '#3b82f6' },
    ];
  }, [activeLayers.conflicts]);

  return (
    <>
      <MapOverlayStats militaryAssets={militaryAssets} feedItems={feedItems} />
      <MapContainer
        center={[25, 20]}
        zoom={3}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
        attributionControl={false}
        maxBounds={[[-85, -200], [85, 200]]}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          subdomains="abcd"
          maxZoom={18}
        />

        {/* Conflict zone circles */}
        {conflictZones.map((zone) => (
          <CircleMarker
            key={zone.name}
            center={[zone.lat, zone.lng]}
            radius={Math.max(8, zone.radius / 30000)}
            pathOptions={{
              color: zone.color,
              fillColor: zone.color,
              fillOpacity: 0.12,
              weight: 1.5,
              dashArray: '4 4',
            }}
          >
            <Tooltip direction="top" permanent={false}>
              <span style={{ fontWeight: 600 }}>{zone.name}</span>
            </Tooltip>
          </CircleMarker>
        ))}

        {/* Military asset markers */}
        {mapMarkers.map((marker) => (
          <Marker
            key={marker.id}
            position={[marker.lat, marker.lng]}
            icon={marker.icon}
            eventHandlers={{
              click: () => onSelectAsset(marker),
            }}
          >
            <Popup>
              <div style={{ color: '#0a0e17', minWidth: 200 }}>
                <strong>{marker.name}</strong>
                <br />
                <span style={{ fontSize: 11 }}>
                  {marker.carrier || marker.type || ''}
                </span>
                <br />
                <span style={{ fontSize: 11 }}>Region: {marker.region || marker.base || ''}</span>
                <br />
                <span style={{
                  fontSize: 10,
                  padding: '1px 4px',
                  borderRadius: 3,
                  background: marker.status === 'Alert' ? '#fee2e2' : marker.status === 'Transit' ? '#fef3c7' : '#d1fae5',
                  color: marker.status === 'Alert' ? '#dc2626' : marker.status === 'Transit' ? '#d97706' : '#059669',
                }}>
                  {marker.status}
                </span>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Event markers */}
        {eventMarkers.map((event) => (
          <CircleMarker
            key={event.id}
            center={[event.lat, event.lng]}
            radius={event.threatLevel === 'critical' ? 8 : 5}
            pathOptions={{
              color: event.threatLevel === 'critical' ? '#ef4444' : '#f59e0b',
              fillColor: event.threatLevel === 'critical' ? '#ef4444' : '#f59e0b',
              fillOpacity: 0.6,
              weight: 2,
            }}
          >
            <Tooltip direction="top">
              <div style={{ maxWidth: 250 }}>
                <strong style={{ fontSize: 11 }}>{event.title}</strong>
                <br />
                <span style={{ fontSize: 10, color: '#666' }}>
                  {event.source} — {event.threatLevel.toUpperCase()}
                </span>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>
    </>
  );
}
