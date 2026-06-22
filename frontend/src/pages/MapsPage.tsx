import React from 'react';
import MapContainer from '../components/maps/MapContainer';
import { useFetch } from '../hooks/useApi';
import { Pump, WaterTank, Complaint } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

const MapsPage: React.FC = () => {
  const { data: pumpsData, loading: pumpsLoading } = useFetch<{ data: { pumps: Pump[] } }>('/pumps');
  const { data: tanksData, loading: tanksLoading } = useFetch<{ data: { tanks: WaterTank[] } }>('/tanks');
  const { data: complaintsData, loading: complaintsLoading } = useFetch<{ data: { complaints: Complaint[] } }>('/complaints');

  const pumps = pumpsData?.data?.pumps || [];
  const tanks = tanksData?.data?.tanks || [];
  const complaints = complaintsData?.data?.complaints || [];

  const mockLeaks = [
    { location: [28.62, 77.21] as [number, number], info: 'Pipeline leak detected' },
    { location: [28.61, 77.22] as [number, number], info: 'Valve malfunction' },
  ];

  if (pumpsLoading || tanksLoading || complaintsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner text="Loading map data..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Maps</h1>
        <p className="text-gray-500 dark:text-gray-400">
          View infrastructure and issues on the map
        </p>
      </div>

      <MapContainer
        pumps={pumps}
        tanks={tanks}
        complaints={complaints}
        leaks={mockLeaks}
      />
    </div>
  );
};

export default MapsPage;
