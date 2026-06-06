import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Hotspot, HotspotInsight } from '../types';
import { getHotspots, getHotspotInsight } from '../services/api';
import 'leaflet/dist/leaflet.css';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const createCustomIcon = (severityScore: number) => {
  const color = severityScore >= 2.5 ? '#dc2626' : severityScore >= 1.5 ? '#f59e0b' : '#22c55e';
  
  const svgIcon = `
    <svg width="25" height="41" viewBox="0 0 25 41" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.5 0C5.6 0 0 5.6 0 12.5c0 1.9.4 3.7 1.2 5.3L12.5 41l11.3-23.2c.8-1.6 1.2-3.4 1.2-5.3C25 5.6 19.4 0 12.5 0z" fill="${color}" stroke="#fff" stroke-width="2"/>
      <circle cx="12.5" cy="12.5" r="6" fill="#fff"/>
    </svg>
  `;
  
  return L.divIcon({
    html: svgIcon,
    className: 'custom-marker',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
  });
};

interface MapProps {
  refreshTrigger: number;
}

const MapComponent: React.FC<MapProps> = ({ refreshTrigger }) => {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [selectedHotspot, setSelectedHotspot] = useState<string | null>(null);
  const [insight, setInsight] = useState<HotspotInsight | null>(null);
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);
  const [mapCenter, setMapCenter] = useState<[number, number]>([39.8283, -98.5795]);
  const [mapZoom, setMapZoom] = useState(4);

  useEffect(() => {
    loadHotspots();
  }, [refreshTrigger]);

  const loadHotspots = async () => {
    try {
      const data = await getHotspots();
      setHotspots(data);
      
      if (data.length > 0) {
        const avgLat = data.reduce((sum, h) => sum + h.lat, 0) / data.length;
        const avgLng = data.reduce((sum, h) => sum + h.lng, 0) / data.length;
        setMapCenter([avgLat, avgLng]);
        setMapZoom(5);
      }
    } catch (error) {
      console.error('Failed to load hotspots:', error);
    }
  };

  const handleMarkerClick = async (hotspot: Hotspot) => {
    setSelectedHotspot(hotspot.id);
    setIsLoadingInsight(true);
    setInsight(null);

    try {
      const insightData = await getHotspotInsight(hotspot.id);
      setInsight(insightData);
    } catch (error) {
      console.error('Failed to load insight:', error);
    } finally {
      setIsLoadingInsight(false);
    }
  };

  return (
    <div className="relative h-full">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: '100%', width: '100%', borderRadius: '12px' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {hotspots.map((hotspot) => (
          <Marker
            key={hotspot.id}
            position={[hotspot.lat, hotspot.lng]}
            icon={createCustomIcon(hotspot.severity_score)}
            eventHandlers={{
              click: () => handleMarkerClick(hotspot),
            }}
          >
            <Popup>
              <div className="p-2">
                <h3 className="font-bold text-lg mb-2">{hotspot.name}</h3>
                <div className="space-y-1 text-sm">
                  <p><strong>Reports:</strong> {hotspot.report_count}</p>
                  <p><strong>Type:</strong> {hotspot.dominant_incident.replace('_', ' ')}</p>
                  <p><strong>Severity:</strong> {hotspot.severity_score.toFixed(1)}/3</p>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {selectedHotspot && (
        <div className="absolute bottom-4 left-4 right-4 bg-white rounded-lg shadow-xl p-4 md:p-6 max-w-md mx-auto z-[1000] max-h-[300px] overflow-y-auto">
          <div className="flex justify-between items-start mb-3">
            <h3 className="font-bold text-lg">AI Safety Insights</h3>
            <button
              onClick={() => {
                setSelectedHotspot(null);
                setInsight(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          {isLoadingInsight ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary-500 border-t-transparent rounded-full"></div>
            </div>
          ) : insight ? (
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-1">Summary</h4>
                <p className="text-sm text-gray-600">{insight.summary}</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm text-gray-700 mb-1">Recommended Action</h4>
                <p className="text-sm text-gray-600">{insight.recommended_action}</p>
              </div>
              
              <div>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  insight.risk_level === 'high' ? 'bg-red-100 text-red-800' :
                  insight.risk_level === 'moderate' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {insight.risk_level.toUpperCase()} RISK
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500">Failed to load insights. Please try again.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MapComponent;
