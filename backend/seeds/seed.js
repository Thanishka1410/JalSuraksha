const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);
const User = require('../models/User');
const Village = require('../models/Village');
const Pump = require('../models/Pump');
const WaterTank = require('../models/WaterTank');
const Valve = require('../models/Valve');
const Pipeline = require('../models/Pipeline');
const WaterQuality = require('../models/WaterQuality');
const Complaint = require('../models/Complaint');
const MaintenanceLog = require('../models/MaintenanceLog');
const Alert = require('../models/Alert');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const seed = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      console.log('No MONGO_URI found, starting in-memory MongoDB...');
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create();
      mongoUri = mongod.getUri();
      console.log(`In-memory MongoDB: ${mongoUri}`);
    }
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB');

    await User.deleteMany({});
    await Village.deleteMany({});
    await Pump.deleteMany({});
    await WaterTank.deleteMany({});
    await Valve.deleteMany({});
    await Pipeline.deleteMany({});
    await WaterQuality.deleteMany({});
    await Complaint.deleteMany({});
    await MaintenanceLog.deleteMany({});
    await Alert.deleteMany({});

    console.log('Cleared existing data');

    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@jalrakshak.gov.in',
      password: 'Admin@123',
      phone: '9876543210',
      role: 'super_admin'
    });

    const citizen = await User.create({
      name: 'Ramesh Kumar',
      email: 'ramesh@jalrakshak.gov.in',
      password: 'Citizen@123',
      phone: '9876543211',
      role: 'citizen'
    });

    console.log('Users created');

    const village = await Village.create({
      name: 'Rampur',
      code: 'VIL001',
      district: 'Raipur',
      state: 'Chhattisgarh',
      population: 2500,
      totalHouseholds: 450,
      waterSources: ['borewell', 'hand_pump', 'river'],
      location: {
        type: 'Point',
        coordinates: [81.6296, 21.2514]
      },
      gpAdmin: admin._id,
      vWSC: [admin._id],
      isActive: true
    });

    console.log('Village created');

    const pump1 = await Pump.create({
      name: 'Main Borewell Pump',
      pumpId: 'PMP001',
      village: village._id,
      location: { type: 'Point', coordinates: [81.6300, 21.2510] },
      type: 'submersible',
      capacity: 5,
      runningHours: 3200,
      powerConsumption: 4.2,
      efficiencyScore: 85,
      voltage: 220,
      temperature: 45,
      status: 'running',
      lastMaintenance: new Date('2024-01-15'),
      nextMaintenance: new Date('2024-04-15'),
      installedDate: new Date('2022-06-01')
    });

    const pump2 = await Pump.create({
      name: 'School Pump',
      pumpId: 'PMP002',
      village: village._id,
      location: { type: 'Point', coordinates: [81.6290, 21.2520] },
      type: 'centrifugal',
      capacity: 3,
      runningHours: 1500,
      powerConsumption: 2.8,
      efficiencyScore: 92,
      voltage: 230,
      temperature: 40,
      status: 'running',
      lastMaintenance: new Date('2024-02-10'),
      nextMaintenance: new Date('2024-05-10'),
      installedDate: new Date('2023-01-15')
    });

    const pump3 = await Pump.create({
      name: 'Backup Pump',
      pumpId: 'PMP003',
      village: village._id,
      location: { type: 'Point', coordinates: [81.6295, 21.2518] },
      type: 'booster',
      capacity: 2,
      runningHours: 800,
      powerConsumption: 1.8,
      efficiencyScore: 78,
      voltage: 215,
      temperature: 42,
      status: 'maintenance',
      lastMaintenance: new Date('2024-03-01'),
      nextMaintenance: new Date('2024-06-01'),
      installedDate: new Date('2023-06-20')
    });

    console.log('Pumps created');

    const tank1 = await WaterTank.create({
      name: 'Overhead Tank - Main',
      tankId: 'TNK001',
      village: village._id,
      location: { type: 'Point', coordinates: [81.6298, 21.2515] },
      capacity: 50000,
      currentLevel: 35000,
      dailyConsumption: 8000,
      type: 'overhead',
      status: 'normal',
      lastRefilled: new Date('2024-03-10')
    });

    const tank2 = await WaterTank.create({
      name: 'Underground Tank - East',
      tankId: 'TNK002',
      village: village._id,
      location: { type: 'Point', coordinates: [81.6305, 21.2512] },
      capacity: 30000,
      currentLevel: 5000,
      dailyConsumption: 5000,
      type: 'underground',
      status: 'low',
      lastRefilled: new Date('2024-03-05')
    });

    console.log('Tanks created');

    const pipeline1 = await Pipeline.create({
      name: 'Main Distribution Pipeline',
      pipelineId: 'PIPE001',
      village: village._id,
      length: 2500,
      diameter: 150,
      material: 'HDPE',
      status: 'good',
      installationDate: new Date('2022-06-01')
    });

    const pipeline2 = await Pipeline.create({
      name: 'Secondary Pipeline - East',
      pipelineId: 'PIPE002',
      village: village._id,
      length: 1200,
      diameter: 100,
      material: 'PVC',
      status: 'fair',
      leakReports: [
        {
          reportedBy: citizen._id,
          reportedAt: new Date('2024-03-08'),
          description: 'Small leak near the junction box',
          status: 'reported'
        }
      ],
      installationDate: new Date('2023-01-15')
    });

    console.log('Pipelines created');

    const valve1 = await Valve.create({
      name: 'Main Gate Valve',
      valveId: 'VLV001',
      village: village._id,
      pipeline: pipeline1._id,
      status: 'open',
      type: 'gate',
      lastChecked: new Date('2024-03-10'),
      diameter: 150
    });

    const valve2 = await Valve.create({
      name: 'Secondary Gate Valve',
      valveId: 'VLV002',
      village: village._id,
      pipeline: pipeline1._id,
      status: 'closed',
      type: 'gate',
      lastChecked: new Date('2024-03-10'),
      diameter: 100
    });

    const valve3 = await Valve.create({
      name: 'East Pipeline Butterfly Valve',
      valveId: 'VLV003',
      village: village._id,
      pipeline: pipeline2._id,
      status: 'partially_open',
      type: 'butterfly',
      lastChecked: new Date('2024-03-09'),
      diameter: 100
    });

    const valve4 = await Valve.create({
      name: 'Check Valve - Pump Station',
      valveId: 'VLV004',
      village: village._id,
      pipeline: pipeline1._id,
      status: 'open',
      type: 'check',
      lastChecked: new Date('2024-03-10'),
      diameter: 150
    });

    console.log('Valves created');

    const qualityRecords = [];
    const statuses = ['safe', 'safe', 'needs_inspection', 'unsafe', 'safe'];
    for (let i = 0; i < 5; i++) {
      const record = await WaterQuality.create({
        village: village._id,
        recordedBy: admin._id,
        location: { type: 'Point', coordinates: [81.6296 + (i * 0.001), 21.2514 + (i * 0.001)] },
        parameters: {
          pH: 7.0 + (Math.random() * 1.5 - 0.5),
          TDS: 200 + Math.floor(Math.random() * 300),
          turbidity: Math.random() * 6,
          chlorine: 0.2 + Math.random() * 0.8,
          fluoride: Math.random() * 1.5,
          iron: Math.random() * 0.4,
          nitrate: Math.random() * 40,
          coliform: Math.floor(Math.random() * 3)
        },
        overallStatus: statuses[i],
        recommendations: statuses[i] === 'unsafe' ? ['Boil water before use', 'Contact health officer'] : [],
        sampleDate: new Date(Date.now() - (i * 24 * 60 * 60 * 1000))
      });
      qualityRecords.push(record);
    }

    console.log('Water quality records created');

    const complaintCategories = ['leakage', 'no_water', 'dirty_water', 'low_pressure', 'other'];
    const complaintStatuses = ['pending', 'assigned', 'in_progress', 'resolved', 'closed'];
    const priorities = ['low', 'medium', 'high', 'urgent'];
    const complaintsData = [];

    for (let i = 0; i < 10; i++) {
      const complaint = await Complaint.create({
        complainant: citizen._id,
        village: village._id,
        category: complaintCategories[i % complaintCategories.length],
        description: `Complaint ${i + 1}: This is a sample complaint about ${complaintCategories[i % complaintCategories.length]} in the village. The issue needs immediate attention.`,
        location: { type: 'Point', coordinates: [81.6296 + (Math.random() * 0.005), 21.2514 + (Math.random() * 0.005)] },
        status: complaintStatuses[i % complaintStatuses.length],
        assignedTo: i % 2 === 0 ? admin._id : undefined,
        priority: priorities[i % priorities.length],
        resolutionNotes: complaintStatuses[i % complaintStatuses.length] === 'resolved' ? 'Issue has been resolved by maintenance team.' : undefined,
        resolvedAt: complaintStatuses[i % complaintStatuses.length] === 'resolved' ? new Date() : undefined
      });
      complaintsData.push(complaint);
    }

    console.log('Complaints created');

    const maintenance1 = await MaintenanceLog.create({
      pump: pump1._id,
      village: village._id,
      performedBy: admin._id,
      type: 'preventive',
      description: 'Regular quarterly maintenance of main borewell pump. Checked bearings, seals, and electrical connections.',
      partsReplaced: [
        { name: 'Pump Seal', cost: 500 },
        { name: 'Bearings', cost: 1200 }
      ],
      totalCost: 1700,
      startTime: new Date('2024-01-15T09:00:00'),
      endTime: new Date('2024-01-15T14:00:00'),
      status: 'completed',
      nextMaintenanceDate: new Date('2024-04-15')
    });

    const maintenance2 = await MaintenanceLog.create({
      pipeline: pipeline2._id,
      village: village._id,
      performedBy: admin._id,
      type: 'corrective',
      description: 'Repairing minor leak in secondary pipeline near junction box.',
      partsReplaced: [
        { name: 'Pipe Joint', cost: 300 }
      ],
      totalCost: 300,
      startTime: new Date('2024-03-09T10:00:00'),
      endTime: new Date('2024-03-09T13:00:00'),
      status: 'completed',
      nextMaintenanceDate: null
    });

    const maintenance3 = await MaintenanceLog.create({
      pump: pump3._id,
      village: village._id,
      performedBy: admin._id,
      type: 'emergency',
      description: 'Emergency maintenance on backup pump. Motor overheating issue reported.',
      partsReplaced: [],
      totalCost: 0,
      startTime: new Date('2024-03-12T08:00:00'),
      status: 'in_progress',
      nextMaintenanceDate: null
    });

    console.log('Maintenance logs created');

    await Alert.create({
      village: village._id,
      type: 'pump_failure',
      severity: 'medium',
      title: 'Backup Pump Overheating',
      message: 'The backup pump is showing signs of overheating. Maintenance is scheduled.',
      relatedEntity: { model: 'Pump', id: pump3._id },
      isRead: false
    });

    await Alert.create({
      village: village._id,
      type: 'tank_low',
      severity: 'high',
      title: 'East Underground Tank Low',
      message: 'The east underground tank is at 17% capacity. Refill needed urgently.',
      relatedEntity: { model: 'WaterTank', id: tank2._id },
      isRead: false
    });

    await Alert.create({
      village: village._id,
      type: 'leak_detected',
      severity: 'high',
      title: 'Pipeline Leak Reported',
      message: 'A leak has been reported in the secondary pipeline near the junction box.',
      relatedEntity: { model: 'Pipeline', id: pipeline2._id },
      isRead: true,
      acknowledgedBy: admin._id
    });

    await Alert.create({
      village: village._id,
      type: 'water_quality_risk',
      severity: 'critical',
      title: 'Unsafe Water Quality Detected',
      message: 'Recent water quality test shows unsafe coliform levels. Immediate action required.',
      relatedEntity: { model: 'WaterQuality', id: qualityRecords[3]._id },
      isRead: false
    });

    await Alert.create({
      village: village._id,
      type: 'maintenance_due',
      severity: 'low',
      title: 'Scheduled Maintenance Due',
      message: 'School pump is due for quarterly maintenance in the next week.',
      relatedEntity: { model: 'Pump', id: pump2._id },
      isRead: true,
      acknowledgedBy: admin._id
    });

    console.log('Alerts created');

    console.log('\nSeed completed successfully!');
    console.log('Summary:');
    console.log('- Users: 2 (admin, citizen)');
    console.log('- Villages: 1');
    console.log('- Pumps: 3');
    console.log('- Water Tanks: 2');
    console.log('- Pipelines: 2');
    console.log('- Valves: 4');
    console.log('- Water Quality Records: 5');
    console.log('- Complaints: 10');
    console.log('- Maintenance Logs: 3');
    console.log('- Alerts: 5');
    console.log('\nLogin credentials:');
    console.log('Admin: admin@jalrakshak.gov.in / Admin@123');
    console.log('Citizen: ramesh@jalrakshak.gov.in / Citizen@123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seed();
