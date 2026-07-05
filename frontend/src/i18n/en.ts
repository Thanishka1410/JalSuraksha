// English translations
const en = {
  // Navigation
  nav: {
    dashboard: 'Dashboard',
    infrastructure: 'Infrastructure',
    quality: 'Water Quality',
    complaints: 'Complaints',
    analytics: 'Analytics',
    maps: 'Maps',
    alerts: 'Alerts',
    aiAssistant: 'AI Assistant',
    settings: 'Settings',
  },
  // Dashboard
  dashboard: {
    title: 'Dashboard',
    subtitle: 'Real-time overview of water supply infrastructure',
    totalPumps: 'Total Pumps',
    activePumps: 'Active Pumps',
    tankLevel: 'Tank Level',
    openComplaints: 'Open Complaints',
    waterQuality: 'Water Quality',
    alertsToday: 'Alerts Today',
    recentAlerts: 'Recent Alerts',
    recentComplaints: 'Recent Complaints',
    pumpEfficiency: 'Pump Efficiency',
    usageTrends: 'Usage Trends',
    qualityDistribution: 'Quality Distribution',
  },
  // Complaints
  complaints: {
    title: 'Complaints',
    subtitle: 'Track and manage user complaints',
    newComplaint: 'New Complaint',
    total: 'Total',
    pending: 'Pending',
    inProgress: 'In Progress',
    resolved: 'Resolved',
    submitComplaint: 'Submit Complaint',
    category: 'Category',
    description: 'Description',
    priority: 'Priority',
    village: 'Village',
    villagePlaceholder: 'Type village name...',
    noVillagesFound: 'No villages found',
    captureLocation: 'Capture GPS Location',
    locationCaptured: 'Location Captured',
    uploadPhotos: 'Photos (Optional, max 5)',
    cancel: 'Cancel',
    submitting: 'Submitting...',
  },
  // Quality
  quality: {
    title: 'Water Quality',
    subtitle: 'Monitor water quality parameters',
    safe: 'Safe',
    unsafe: 'Unsafe',
    needsInspection: 'Needs Inspection',
    pH: 'pH Level',
    tds: 'TDS (ppm)',
    turbidity: 'Turbidity (NTU)',
    chlorine: 'Chlorine (mg/L)',
    fluoride: 'Fluoride (mg/L)',
    iron: 'Iron (mg/L)',
    nitrate: 'Nitrate (mg/L)',
  },
  // Analytics
  analytics: {
    title: 'Analytics',
    subtitle: 'Detailed reports and insights',
    exportReport: 'Export PDF',
    consumption: 'Consumption',
    efficiency: 'Efficiency',
    maintenanceCosts: 'Maintenance Costs',
    generating: 'Generating PDF...',
  },
  // Infrastructure
  infrastructure: {
    title: 'Infrastructure',
    subtitle: 'Manage pumps, tanks, valves and pipelines',
    pumps: 'Pumps',
    tanks: 'Water Tanks',
    valves: 'Valves',
    pipelines: 'Pipelines',
    addPump: 'Add Pump',
    addTank: 'Add Tank',
  },
  // Alerts
  alerts: {
    title: 'Alerts',
    subtitle: 'System alerts and notifications',
    critical: 'Critical',
    high: 'High',
    medium: 'Medium',
    low: 'Low',
    markRead: 'Mark as Read',
    acknowledge: 'Acknowledge',
    resolve: 'Resolve',
  },
  // Maps
  maps: {
    title: 'Maps',
    subtitle: 'Interactive GIS map view',
  },
  // AI Assistant
  aiAssistant: {
    title: 'AI Assistant',
    subtitle: 'Ask questions about water supply',
  },
  // Settings
  settings: {
    title: 'Settings',
    subtitle: 'Manage your account and preferences',
    language: 'Language',
    theme: 'Theme',
    notifications: 'Notifications',
    profile: 'Profile',
    save: 'Save Changes',
  },
  // Common
  common: {
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    search: 'Search',
    filter: 'Filter',
    noData: 'No data available',
    status: 'Status',
    actions: 'Actions',
    createdAt: 'Created At',
    updatedAt: 'Updated At',
  },
  // Language names
  languages: {
    en: 'English',
    te: 'తెలుగు',
    hi: 'हिंदी',
  },
};

export default en;
export type Translations = typeof en;
