import React, { useState } from 'react';
import { MapContainer as LeafletMap, TileLayer, LayersControl, useMap } from 'react-leaflet';
import { PumpMarker, TankMarker, LeakMarker, ComplaintMarker } from './MapMarkers';
import { Pump, WaterTank, Complaint } from '../../types';

interface MapContainerProps {
  pumps: Pump[];
  tanks: WaterTank[];
  complaints: Complaint[];
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
  leaks = [],
  center = [28.6139, 77.209],
  zoom = 12,
}) => {
  const [layers, setLayers] = useState({
    pumps: true,
    tanks: true,
    leaks: true,
    complaints: true,
  });

  return (
    <div className="relative h-[calc(100vh-200px)] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
      <LeafletMap center={center} zoom={zoom} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <LayersControl position="topright">
          <LayersControl.Overlay checked name="Pumps">
            {layers.pumps &&
              pumps.map((pump) => <PumpMarker key={pump._id} pump={pump} />)}
          </LayersControl.Overlay>
          <LayersControl.Overlay checked name="Tanks">
            {layers.tanks &&
              tanks.map((tank) => <TankMarker key={tank._id} tank={tank} />)}
          </LayersControl.Overlay>
          <LayersControl.Overlay checked name="Leaks">
            {layers.leaks &&
              leaks.map((leak, i) => (
                <LeakMarker key={i} location={leak.location} info={leak.info} />
              ))}
          </LayersControl.Overlay>
          <LayersControl.Overlay checked name="Complaints">
            {layers.complaints &&
              complaints.map((complaint) => (
                <ComplaintMarker key={complaint._id} complaint={complaint} />
              ))}
          </LayersControl.Overlay>
        </LayersControl>

        <MapControls center={center} zoom={zoom} />
      </LeafletMap>
    </div>
  );
};

export default MapContainer;
