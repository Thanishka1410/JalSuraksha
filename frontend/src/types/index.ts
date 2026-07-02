export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  village?: Village | string;
  profileImage?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Village {
  _id: string;
  name: string;
  code: string;
  district: string;
  state: string;
  population: number;
  totalHouseholds?: number;
  waterSources?: string[];
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  totalPumps?: number;
  totalTanks?: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Pump {
  _id: string;
  pumpId: string;
  name: string;
  village: Village | string;
  type: string;
  status: string;
  capacity: number;
  runningHours: number;
  efficiencyScore: number;
  powerConsumption: number;
  voltage?: number;
  temperature?: number;
  efficiency?: number;
  healthScore?: number;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  lastMaintenance?: string;
  nextMaintenance?: string;
  installedDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface WaterTank {
  _id: string;
  name: string;
  tankId?: string;
  village: Village | string;
  capacity: number;
  currentLevel: number;
  dailyConsumption?: number;
  type?: string;
  status: string;
  location: {
    type: 'Point';
    coordinates: [number, number];
  };
  lastRefilled?: string;
  lastFilled?: string;
  lastEmptied?: string;
  inflowRate?: number;
  outflowRate?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Valve {
  _id: string;
  name: string;
  valveId: string;
  village: Village | string;
  pipeline?: Pipeline | string;
  status: string;
  type: string;
  diameter: number;
  lastChecked?: string;
  lastOperated?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  createdAt: string;
  updatedAt: string;
}

export interface Pipeline {
  _id: string;
  name: string;
  pipelineId: string;
  village: Village | string;
  status: string;
  length: number;
  diameter: number;
  material: string;
  leakCount?: number;
  leakReports?: any[];
  installationDate?: string;
  coordinates?: {
    type: 'LineString';
    coordinates: [number, number][];
  };
  createdAt: string;
  updatedAt: string;
}

export interface WaterScheduleSlot {
  zone: string;
  startTime: string;
  endTime: string;
  durationMinutes?: number;
}

export interface WaterSchedule {
  _id: string;
  village: Village | string;
  dayOfWeek: string;
  slots: WaterScheduleSlot[];
  notes?: string;
  isActive: boolean;
  createdBy?: User | string;
  createdAt: string;
  updatedAt: string;
}

export interface VillageHealthScore {
  village: { _id: string; name: string; district: string };
  score: number;
  grade: 'A' | 'B' | 'C' | 'D';
  breakdown: {
    pumpScore: number;
    tankScore: number;
    qualityScore: number;
    complaintScore: number;
  };
  details: {
    totalPumps: number;
    runningPumps: number;
    totalTanks: number;
    avgTankLevel: number;
    totalComplaints: number;
    resolvedComplaints: number;
    latestQualityStatus: string;
  };
}


export interface WaterQuality {
  _id: string;
  village: Village | string;
  recordedBy: User | string;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  parameters: {
    pH: number;
    TDS: number;
    turbidity: number;
    chlorine: number;
    fluoride: number;
    iron?: number;
    nitrate?: number;
    coliform?: number;
  };
  overallStatus: string;
  recommendations?: string[];
  sampleDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Complaint {
  _id: string;
  complaintId?: string;
  complainant?: User | string;
  user?: User;
  village: Village | string;
  category: string;
  title?: string;
  description: string;
  images?: string[];
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  status: string;
  assignedTo?: User | string;
  priority: string;
  resolutionNotes?: string;
  resolvedAt?: string;
  timeline?: any[];
  createdAt: string;
  updatedAt: string;
}

export interface MaintenanceLog {
  _id: string;
  pump?: Pump | string;
  tank?: WaterTank | string;
  pipeline?: Pipeline | string;
  valve?: Valve | string;
  village: Village | string;
  performedBy: User | string;
  type: string;
  description: string;
  partsReplaced?: { name: string; cost: number }[];
  parts?: { name: string; cost: number }[];
  totalCost: number;
  laborCost?: number;
  startTime?: string;
  endTime?: string;
  status: string;
  nextMaintenanceDate?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Alert {
  _id: string;
  type: string;
  severity: string;
  title: string;
  message: string;
  village: Village | string;
  relatedEntity?: {
    model: string;
    id: string;
  };
  isRead: boolean;
  isAcknowledged?: boolean;
  acknowledgedBy?: User | string;
  acknowledgedAt?: string;
  resolvedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIReport {
  _id: string;
  type: 'health' | 'prediction' | 'analysis' | 'recommendation';
  title: string;
  content: string;
  data: any;
  generatedBy: string;
  createdAt: string;
}

export interface ChatMessage {
  _id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: {
    confidence?: number;
    sources?: string[];
    suggestedActions?: string[];
  };
}

export interface DashboardStats {
  totalPumps: number;
  activePumps: number;
  totalTanks: number;
  tankLevels: {
    name: string;
    level: number;
    capacity: number;
  }[];
  waterQualityStatus: 'safe' | 'caution' | 'unsafe';
  leakAlerts: number;
  pendingComplaints: number;
  maintenanceTasks: number;
  waterUsage: {
    today: number;
    week: number;
    month: number;
    trend: number;
  };
  recentAlerts: Alert[];
  recentComplaints: Complaint[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}
