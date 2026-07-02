import React from 'react';
import { Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import { Pump, WaterTank, Complaint, Pipeline, Valve } from '../../types';
import { timeAgo } from '../../utils/helpers';

const createIcon = (color: string, shape: 'circle' | 'diamond' = 'circle') =>
  L.divIcon({
    html: shape === 'diamond'
      ? `<div style="background-color: ${color}; width: 18px; height: 18px; transform: rotate(45deg); border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`
      : `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  });

const icons = {
  pump: createIcon('#0ea5e9'),
  tank: createIcon('#14b8a6'),
  leak: createIcon('#ef4444'),
  complaint: createIcon('#f59e0b'),
  valve_open: createIcon('#22c55e', 'diamond'),
  valve_closed: createIcon('#ef4444', 'diamond'),
  valve_partial: createIcon('#f59e0b', 'diamond'),
};

const getPipelineColor = (status: string) => {
  switch (status) {
    case 'good': return '#22c55e';
    case 'fair': return '#f59e0b';
    case 'poor': return '#f97316';
    case 'critical': return '#ef4444';
    default: return '#94a3b8';
  }
};

const getValveIcon = (status: string) => {
  if (status === 'open') return icons.valve_open;
  if (status === 'closed') return icons.valve_closed;
  return icons.valve_partial;
};

// ── Pump ─────────────────────────────────────────────────────────
interface PumpMarkerProps { pump: Pump; }

export const PumpMarker: React.FC<PumpMarkerProps> = ({ pump }) => {
  if (!pump.location?.coordinates) return null;
  return (
    <Marker position={[pump.location.coordinates[1], pump.location.coordinates[0]]} icon={icons.pump}>
      <Popup>
        <div className="p-2">
          <h3 className="font-semibold text-gray-900">{pump.name}</h3>
          <p className="text-sm text-gray-500">{pump.pumpId}</p>
          <div className="mt-2 space-y-1 text-sm">
            <p>Status: <span className="font-medium">{pump.status}</span></p>
            <p>Efficiency: <span className="font-medium">{pump.efficiencyScore}%</span></p>
            <p>Running Hours: <span className="font-medium">{pump.runningHours}h</span></p>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

// ── Water Tank ────────────────────────────────────────────────────
interface TankMarkerProps { tank: WaterTank; }

export const TankMarker: React.FC<TankMarkerProps> = ({ tank }) => {
  if (!tank.location?.coordinates) return null;
  const level = tank.capacity > 0 ? Math.round((tank.currentLevel / tank.capacity) * 100) : 0;
  return (
    <Marker position={[tank.location.coordinates[1], tank.location.coordinates[0]]} icon={icons.tank}>
      <Popup>
        <div className="p-2">
          <h3 className="font-semibold text-gray-900">{tank.name}</h3>
          <div className="mt-2 space-y-1 text-sm">
            <p>Capacity: <span className="font-medium">{(tank.capacity / 1000).toFixed(0)} KL</span></p>
            <p>Current Level: <span className="font-medium">{level}%</span></p>
            <p>Status: <span className="font-medium">{tank.status}</span></p>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

// ── Leak ──────────────────────────────────────────────────────────
interface LeakMarkerProps { location: [number, number]; info?: string; }

export const LeakMarker: React.FC<LeakMarkerProps> = ({ location, info }) => (
  <Marker position={location} icon={icons.leak}>
    <Popup>
      <div className="p-2">
        <h3 className="font-semibold text-red-600">Leak Detected</h3>
        {info && <p className="text-sm text-gray-500 mt-1">{info}</p>}
      </div>
    </Popup>
  </Marker>
);

// ── Complaint ─────────────────────────────────────────────────────
interface ComplaintMarkerProps { complaint: Complaint; }

export const ComplaintMarker: React.FC<ComplaintMarkerProps> = ({ complaint }) => {
  if (!complaint.location?.coordinates) return null;
  return (
    <Marker
      position={[complaint.location.coordinates[1], complaint.location.coordinates[0]]}
      icon={icons.complaint}
    >
      <Popup>
        <div className="p-2">
          <h3 className="font-semibold text-gray-900">{complaint.description?.substring(0, 40) || 'Complaint'}</h3>
          <div className="mt-2 space-y-1 text-sm">
            <p>Category: <span className="font-medium capitalize">{complaint.category?.replace(/_/g, ' ')}</span></p>
            <p>Priority: <span className="font-medium capitalize">{complaint.priority}</span></p>
            <p>Status: <span className="font-medium capitalize">{complaint.status?.replace(/_/g, ' ')}</span></p>
            <p className="text-gray-400">{timeAgo(complaint.createdAt)}</p>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};

// ── Pipeline Polyline ─────────────────────────────────────────────
interface PipelinePolylineProps { pipeline: Pipeline; }

export const PipelinePolyline: React.FC<PipelinePolylineProps> = ({ pipeline }) => {
  if (!pipeline.coordinates?.coordinates?.length) return null;
  // GeoJSON uses [lng, lat]; Leaflet needs [lat, lng]
  const positions: [number, number][] = pipeline.coordinates.coordinates.map(
    ([lng, lat]) => [lat, lng]
  );
  const color = getPipelineColor(pipeline.status);
  return (
    <Polyline
      positions={positions}
      pathOptions={{
        color,
        weight: 5,
        opacity: 0.85,
        dashArray: pipeline.status !== 'good' ? '8 5' : undefined,
      }}
    >
      <Popup>
        <div className="p-2">
          <h3 className="font-semibold text-gray-900">{pipeline.name}</h3>
          <p className="text-sm text-gray-500">{pipeline.pipelineId}</p>
          <div className="mt-2 space-y-1 text-sm">
            <p>Material: <span className="font-medium">{pipeline.material}</span></p>
            <p>Length: <span className="font-medium">{pipeline.length}m</span></p>
            <p>Diameter: <span className="font-medium">{pipeline.diameter}mm</span></p>
            <p>Status: <span className="font-medium capitalize" style={{ color }}>{pipeline.status}</span></p>
            {(pipeline.leakReports?.length ?? 0) > 0 && (
              <p className="text-red-500 font-medium">⚠ {pipeline.leakReports!.length} leak report(s)</p>
            )}
          </div>
        </div>
      </Popup>
    </Polyline>
  );
};

// ── Valve Marker ──────────────────────────────────────────────────
interface ValveMarkerProps { valve: Valve; }

export const ValveMarker: React.FC<ValveMarkerProps> = ({ valve }) => {
  if (!valve.location?.coordinates) return null;
  return (
    <Marker
      position={[valve.location.coordinates[1], valve.location.coordinates[0]]}
      icon={getValveIcon(valve.status)}
    >
      <Popup>
        <div className="p-2">
          <h3 className="font-semibold text-gray-900">{valve.name}</h3>
          <p className="text-sm text-gray-500">{valve.valveId}</p>
          <div className="mt-2 space-y-1 text-sm">
            <p>Type: <span className="font-medium capitalize">{valve.type}</span></p>
            <p>Status: <span className="font-medium capitalize">{valve.status?.replace(/_/g, ' ')}</span></p>
            <p>Diameter: <span className="font-medium">{valve.diameter}mm</span></p>
            {valve.lastChecked && (
              <p>Last Checked: <span className="font-medium">{new Date(valve.lastChecked).toLocaleDateString('en-IN')}</span></p>
            )}
          </div>
        </div>
      </Popup>
    </Marker>
  );
};
