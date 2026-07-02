import React, { useState } from 'react';
import { MapContainer as LeafletMap, TileLayer, LayersControl, useMap } from 'react-leaflet';
import { PumpMarker, TankMarker, LeakMarker, ComplaintMarker, PipelinePolyline, ValveMarker } from './MapMarkers';
import { Pump, WaterTank, Complaint, Pipeline, Valve } from '../../types';

interface MapContainerProps {
  pumps: Pump[];
  tanks: WaterTank[];
  complaints: Complaint[];
  pipelines?: Pipeline[];
  valves?: Valve[];
  leaks?: { location: [number, number]; info?: string }[];
  center?: [number, number];
  zoom?: number;
}

const MapControls: React.FC<{ center: [number, number]; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  React.useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
};

const MapContainer: React.FC<MapContainerProps> = ({
  pumps,
  tanks,
  complaints,
  pipelines = [],
  valves = [],
  leaks = [],
  center = [21.2514, 81.6296],
  zoom = 14,
}) => {
  const [layers] = useState({
    pumps: true,
    tanks: true,
    leaks: true,
    complaints: true,
    pipelines: true,
    valves: true,
  });

  return (
    <div className="relative h-[calc(100vh-200px)] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
      <LeafletMap center={center} zoom={zoom} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LayersControl position="topright">
          <LayersControl.Overlay checked name="🔵 Pumps">
            {layers.pumps && pumps.map((pump) => <PumpMarker key={pump._id} pump={pump} />)}
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="🟢 Tanks">
            {layers.tanks && tanks.map((tank) => <TankMarker key={tank._id} tank={tank} />)}
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="🟤 Pipelines">
            {layers.pipelines && pipelines.map((pipe) => <PipelinePolyline key={pipe._id} pipeline={pipe} />)}
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="🔷 Valves">
            {layers.valves && valves.map((valve) => <ValveMarker key={valve._id} valve={valve} />)}
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="🔴 Leaks">
            {layers.leaks && leaks.map((leak, i) => (
              <LeakMarker key={i} location={leak.location} info={leak.info} />
            ))}
          </LayersControl.Overlay>

          <LayersControl.Overlay checked name="🟡 Complaints">
            {layers.complaints && complaints.map((complaint) => (
              <ComplaintMarker key={complaint._id} complaint={complaint} />
            ))}
          </LayersControl.Overlay>
        </LayersControl>

        <MapControls center={center} zoom={zoom} />
      </LeafletMap>

      {/* Legend */}
      <div className="absolute bottom-8 left-4 z-[1000] bg-white dark:bg-gray-800 rounded-xl p-3 shadow-lg border border-gray-200 dark:border-gray-700 text-xs space-y-1">
        <p className="font-semibold text-gray-700 dark:text-gray-300 mb-2">Legend</p>
        {[
          { color: '#0ea5e9', label: 'Pump' },
          { color: '#14b8a6', label: 'Water Tank' },
          { color: '#22c55e', label: 'Pipeline (Good)' },
          { color: '#f59e0b', label: 'Pipeline (Fair)' },
          { color: '#ef4444', label: 'Pipeline (Critical) / Leak' },
          { color: '#22c55e', label: 'Valve (Open)', diamond: true },
          { color: '#ef4444', label: 'Valve (Closed)', diamond: true },
          { color: '#f59e0b', label: 'Complaint' },
        ].map(({ color, label, diamond }) => (
          <div key={label} className="flex items-center gap-2">
            <div
              style={{
                background: color,
                width: 12,
                height: 12,
                borderRadius: diamond ? 0 : '50%',
                transform: diamond ? 'rotate(45deg)' : undefined,
                flexShrink: 0,
              }}
            />
            <span className="text-gray-600 dark:text-gray-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MapContainer;
