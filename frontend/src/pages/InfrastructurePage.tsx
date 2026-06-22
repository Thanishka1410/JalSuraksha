import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Droplets, Zap, GitBranch, Gauge } from 'lucide-react';
import PumpList from '../components/infrastructure/PumpList';
import TankList from '../components/infrastructure/TankList';
import ValveList from '../components/infrastructure/ValveList';
import PipelineList from '../components/infrastructure/PipelineList';
import PumpForm from '../components/infrastructure/PumpForm';
import TankForm from '../components/infrastructure/TankForm';
import { useFetch } from '../hooks/useApi';
import { apiGet, apiPost, apiPut } from '../utils/api';
import { Pump, WaterTank, Valve, Pipeline } from '../types';
import toast from 'react-hot-toast';

type TabType = 'pumps' | 'tanks' | 'valves' | 'pipelines';

const InfrastructurePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('pumps');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPumpFormOpen, setIsPumpFormOpen] = useState(false);
  const [isTankFormOpen, setIsTankFormOpen] = useState(false);
  const [selectedPump, setSelectedPump] = useState<Pump | null>(null);
  const [selectedTank, setSelectedTank] = useState<WaterTank | null>(null);

  const { data: pumpsData, loading: pumpsLoading, refetch: refetchPumps } = useFetch<{ data: { pumps: Pump[] } }>('/pumps');
  const { data: tanksData, loading: tanksLoading, refetch: refetchTanks } = useFetch<{ data: { tanks: WaterTank[] } }>('/tanks');
  const { data: valvesData, loading: valvesLoading } = useFetch<{ data: { valves: Valve[] } }>('/valves');
  const { data: pipelinesData, loading: pipelinesLoading } = useFetch<{ data: { pipelines: Pipeline[] } }>('/pipelines');

  const pumps = pumpsData?.data?.pumps || [];
  const tanks = tanksData?.data?.tanks || [];
  const valves = valvesData?.data?.valves || [];
  const pipelines = pipelinesData?.data?.pipelines || [];

  const filteredPumps = pumps.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.pumpId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTanks = tanks.filter(
    (t) => t.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handlePumpSubmit = async (data: any) => {
    try {
      if (selectedPump) {
        await apiPut(`/pumps/${selectedPump._id}`, data);
        toast.success('Pump updated successfully');
      } else {
        await apiPost('/pumps', data);
        toast.success('Pump created successfully');
      }
      refetchPumps();
      setSelectedPump(null);
    } catch (error) {
      toast.error('Failed to save pump');
    }
  };

  const handleTankSubmit = async (data: any) => {
    try {
      if (selectedTank) {
        await apiPut(`/tanks/${selectedTank._id}`, data);
        toast.success('Tank updated successfully');
      } else {
        await apiPost('/tanks', data);
        toast.success('Tank created successfully');
      }
      refetchTanks();
      setSelectedTank(null);
    } catch (error) {
      toast.error('Failed to save tank');
    }
  };

  const handleValveToggle = async (valve: Valve) => {
    await apiPut(`/valves/${valve._id}/toggle`);
  };

  const handlePumpClick = (pump: Pump) => {
    setSelectedPump(pump);
    setIsPumpFormOpen(true);
  };

  const handleTankClick = (tank: WaterTank) => {
    setSelectedTank(tank);
    setIsTankFormOpen(true);
  };

  const tabs = [
    { id: 'pumps' as TabType, label: 'Pumps', icon: Zap, count: pumps.length },
    { id: 'tanks' as TabType, label: 'Tanks', icon: Droplets, count: tanks.length },
    { id: 'valves' as TabType, label: 'Valves', icon: Gauge, count: valves.length },
    { id: 'pipelines' as TabType, label: 'Pipelines', icon: GitBranch, count: pipelines.length },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Infrastructure</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage pumps, tanks, valves, and pipelines</p>
        </div>
        <button
          onClick={() => {
            setSelectedPump(null);
            setSelectedTank(null);
            if (activeTab === 'pumps') setIsPumpFormOpen(true);
            else if (activeTab === 'tanks') setIsTankFormOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg font-medium hover:bg-primary-600 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add {activeTab.charAt(0).toUpperCase() + activeTab.slice(1, -1)}
        </button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="flex gap-4 overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 font-medium transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Icon className="w-5 h-5" />
                {tab.label}
                <span className="px-2 py-0.5 text-xs rounded-full bg-gray-100 dark:bg-gray-700">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder={`Search ${activeTab}...`}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
      </div>

      {/* Content */}
      {/* @ts-ignore */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'pumps' && (
            <PumpList
              pumps={filteredPumps}
              isLoading={pumpsLoading}
              onPumpClick={handlePumpClick}
            />
          )}
          {activeTab === 'tanks' && (
            <TankList
              tanks={filteredTanks}
              isLoading={tanksLoading}
              onTankClick={handleTankClick}
            />
          )}
          {activeTab === 'valves' && (
            <ValveList
              valves={valves}
              isLoading={valvesLoading}
              onValveToggle={handleValveToggle}
            />
          )}
          {activeTab === 'pipelines' && (
            <PipelineList
              pipelines={pipelines}
              isLoading={pipelinesLoading}
              onPipelineClick={(p) => console.log('Pipeline clicked:', p)}
            />
          )}
        </motion.div>
      </AnimatePresence>

      {/* Forms */}
      <PumpForm
        isOpen={isPumpFormOpen}
        onClose={() => {
          setIsPumpFormOpen(false);
          setSelectedPump(null);
        }}
        onSubmit={handlePumpSubmit}
        pump={selectedPump}
      />

      <TankForm
        isOpen={isTankFormOpen}
        onClose={() => {
          setIsTankFormOpen(false);
          setSelectedTank(null);
        }}
        onSubmit={handleTankSubmit}
        tank={selectedTank}
      />
    </div>
  );
};

export default InfrastructurePage;
