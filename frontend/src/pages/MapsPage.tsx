import React from 'react';
import MapContainer from '../components/maps/MapContainer';
import { useFetch } from '../hooks/useApi';
import { Pump, WaterTank, Complaint, Pipeline, Valve } from '../types';
import { LoadingSpinner } from '../components/common/LoadingSpinner';

const MapsPage: React.FC = () => {
  const { data: pumpsData, loading: pumpsLoading } = useFetch<{ data: { pumps: Pump[] } }>('/pumps');
  const { data: tanksData, loading: tanksLoading } = useFetch<{ data: { tanks: WaterTank[] } }>('/tanks');
  const { data: complaintsData, loading: complaintsLoading } = useFetch<{ data: { complaints: Complaint[] } }>('/complaints');
  const { data: pipelinesData, loading: pipelinesLoading } = useFetch<{ data: { pipelines: Pipeline[] } }>('/pipelines');
  const { data: valvesData, loading: valvesLoading } = useFetch<{ data: { valves: Valve[] } }>('/valves');

  const pumps = pumpsData?.data?.pumps || [];
  const tanks = tanksData?.data?.tanks || [];
  const complaints = complaintsData?.data?.complaints || [];
  const pipelines = pipelinesData?.data?.pipelines || [];
  const valves = valvesData?.data?.valves || [];

  // Derive real leak locations from pipeline leak reports
  const leaks = pipelines
    .flatMap(p =>
      (p.leakReports || [])
        .filter(lr => lr.status !== 'fixed')
        .map(lr => ({
          location: (p.coordinates?.coordinates?.[Math.floor(p.coordinates.coordinates.length / 2)] || [81.6296, 21.2514]) as [number, number],
          info: `${p.name}: ${lr.description || 'Leak reported'}`,
        }))
    )
    .map(({ location, info }) => ({
      // swap [lng, lat] → [lat, lng] for Leaflet
      location: [location[1], location[0]] as [number, number],
      info,
    }));

  if (pumpsLoading || tanksLoading || complaintsLoading || pipelinesLoading || valvesLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner text="Loading map data..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">GIS Map</h1>
        <p className="text-gray-500 dark:text-gray-400">
          Visualize water infrastructure, pipelines, valves, leaks and complaints on the village map
        </p>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {[
          { label: 'Pumps', count: pumps.length, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' },
          { label: 'Tanks', count: tanks.length, color: 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300' },
          { label: 'Pipelines', count: pipelines.length, color: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300' },
          { label: 'Valves', count: valves.length, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300' },
          { label: 'Leaks', count: leaks.length, color: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300' },
          { label: 'Complaints', count: complaints.filter(c => c.location?.coordinates).length, color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300' },
        ].map(({ label, count, color }) => (
          <div key={label} className={`rounded-xl px-4 py-3 ${color} text-center`}>
            <p className="text-2xl font-bold">{count}</p>
            <p className="text-xs font-medium">{label}</p>
          </div>
        ))}
      </div>

      <MapContainer
        pumps={pumps}
        tanks={tanks}
        complaints={complaints}
        pipelines={pipelines}
        valves={valves}
        leaks={leaks}
      />
    </div>
  );
};

export default MapsPage;
