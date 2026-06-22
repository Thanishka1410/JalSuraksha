import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import { Pump, WaterTank, Complaint } from '../../types';
import { timeAgo } from '../../utils/helpers';

const createIcon = (color: string) =>
  L.divIcon({
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    className: '',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
  });

const icons = {
  pump: createIcon('#0ea5e9'),
  tank: createIcon('#14b8a6'),
  leak: createIcon('#ef4444'),
  complaint: createIcon('#f59e0b'),
};

interface PumpMarkerProps {
  pump: Pump;
}

export const PumpMarker: React.FC<PumpMarkerProps> = ({ pump }) => {
  if (!pump.location?.coordinates) return null;
  return (
    <Marker
      position={[pump.location.coordinates[1], pump.location.coordinates[0]]}
      icon={icons.pump}
    >
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

interface TankMarkerProps {
  tank: WaterTank;
}

export const TankMarker: React.FC<TankMarkerProps> = ({ tank }) => {
  if (!tank.location?.coordinates) return null;
  const level = tank.capacity > 0 ? Math.round((tank.currentLevel / tank.capacity) * 100) : 0;
  return (
    <Marker
      position={[tank.location.coordinates[1], tank.location.coordinates[0]]}
      icon={icons.tank}
    >
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

interface LeakMarkerProps {
  location: [number, number];
  info?: string;
}

export const LeakMarker: React.FC<LeakMarkerProps> = ({ location, info }) => (
  <Marker position={location} icon={icons.leak}>
    <Popup>
      <div className="p-2">
        <h3 className="font-semibold text-danger-600">Leak Detected</h3>
        {info && <p className="text-sm text-gray-500 mt-1">{info}</p>}
      </div>
    </Popup>
  </Marker>
);

interface ComplaintMarkerProps {
  complaint: Complaint;
}

export const ComplaintMarker: React.FC<ComplaintMarkerProps> = ({ complaint }) => {
  if (!complaint.location?.coordinates) return null;
  return (
    <Marker
      position={[complaint.location.coordinates[1], complaint.location.coordinates[0]]}
      icon={icons.complaint}
    >
      <Popup>
        <div className="p-2">
          <h3 className="font-semibold text-gray-900">{complaint.description?.substring(0, 30) || 'Complaint'}</h3>
          <div className="mt-2 space-y-1 text-sm">
            <p>Category: <span className="font-medium capitalize">{complaint.category?.replace('_', ' ')}</span></p>
            <p>Priority: <span className="font-medium capitalize">{complaint.priority}</span></p>
            <p>Status: <span className="font-medium capitalize">{complaint.status?.replace('_', ' ')}</span></p>
            <p className="text-gray-400">{timeAgo(complaint.createdAt)}</p>
          </div>
        </div>
      </Popup>
    </Marker>
  );
};
