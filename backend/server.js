const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

dotenv.config();

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(morgan('dev'));
app.use(cookieParser());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

const autoSeed = async () => {
  const User = require('./models/User');
  const count = await User.countDocuments();
  if (count === 0) {
    console.log('Database empty, auto-seeding...');
    const Village = require('./models/Village');
    const Pump = require('./models/Pump');
    const WaterTank = require('./models/WaterTank');
    const Valve = require('./models/Valve');
    const Pipeline = require('./models/Pipeline');
    const WaterQuality = require('./models/WaterQuality');
    const Complaint = require('./models/Complaint');
    const MaintenanceLog = require('./models/MaintenanceLog');
    const Alert = require('./models/Alert');

    const admin = await User.create({ name: 'Admin User', email: 'admin@jalrakshak.gov.in', password: 'Admin@123', phone: '9876543210', role: 'super_admin' });
    const citizen = await User.create({ name: 'Ramesh Kumar', email: 'ramesh@jalrakshak.gov.in', password: 'Citizen@123', phone: '9876543211', role: 'citizen' });
    console.log('Users seeded');

    const village = await Village.create({ name: 'Rampur', code: 'VIL001', district: 'Raipur', state: 'Chhattisgarh', population: 2500, totalHouseholds: 450, waterSources: ['borewell', 'hand_pump', 'river'], location: { type: 'Point', coordinates: [81.6296, 21.2514] }, gpAdmin: admin._id, vWSC: [admin._id], isActive: true });
    console.log('Village seeded');

    const pump1 = await Pump.create({ name: 'Main Borewell Pump', pumpId: 'PMP001', village: village._id, location: { type: 'Point', coordinates: [81.6300, 21.2510] }, type: 'submersible', capacity: 5, runningHours: 3200, powerConsumption: 4.2, efficiencyScore: 85, voltage: 220, temperature: 45, status: 'running', lastMaintenance: new Date('2024-01-15'), nextMaintenance: new Date('2024-04-15'), installedDate: new Date('2022-06-01') });
    const pump2 = await Pump.create({ name: 'School Pump', pumpId: 'PMP002', village: village._id, location: { type: 'Point', coordinates: [81.6290, 21.2520] }, type: 'centrifugal', capacity: 3, runningHours: 1500, powerConsumption: 2.8, efficiencyScore: 92, voltage: 230, temperature: 40, status: 'running', lastMaintenance: new Date('2024-02-10'), nextMaintenance: new Date('2024-05-10'), installedDate: new Date('2023-01-15') });
    const pump3 = await Pump.create({ name: 'Backup Pump', pumpId: 'PMP003', village: village._id, location: { type: 'Point', coordinates: [81.6295, 21.2518] }, type: 'booster', capacity: 2, runningHours: 800, powerConsumption: 1.8, efficiencyScore: 78, voltage: 215, temperature: 42, status: 'maintenance', lastMaintenance: new Date('2024-03-01'), nextMaintenance: new Date('2024-06-01'), installedDate: new Date('2023-06-20') });
    console.log('Pumps seeded');

    const tank1 = await WaterTank.create({ name: 'Overhead Tank - Main', tankId: 'TNK001', village: village._id, location: { type: 'Point', coordinates: [81.6298, 21.2515] }, capacity: 50000, currentLevel: 35000, dailyConsumption: 8000, type: 'overhead', status: 'normal', lastRefilled: new Date('2024-03-10') });
    const tank2 = await WaterTank.create({ name: 'Underground Tank - East', tankId: 'TNK002', village: village._id, location: { type: 'Point', coordinates: [81.6305, 21.2512] }, capacity: 30000, currentLevel: 5000, dailyConsumption: 5000, type: 'underground', status: 'low', lastRefilled: new Date('2024-03-05') });
    console.log('Tanks seeded');

    const pipeline1 = await Pipeline.create({ name: 'Main Distribution Pipeline', pipelineId: 'PIPE001', village: village._id, length: 2500, diameter: 150, material: 'HDPE', status: 'good', installationDate: new Date('2022-06-01'), coordinates: { type: 'LineString', coordinates: [[81.6296, 21.2514],[81.6300, 21.2510],[81.6305, 21.2512],[81.6310, 21.2515]] } });
    const pipeline2 = await Pipeline.create({ name: 'Secondary Pipeline - East', pipelineId: 'PIPE002', village: village._id, length: 1200, diameter: 100, material: 'PVC', status: 'fair', leakReports: [{ reportedBy: citizen._id, reportedAt: new Date('2024-03-08'), description: 'Small leak near junction box', status: 'reported' }], installationDate: new Date('2023-01-15'), coordinates: { type: 'LineString', coordinates: [[81.6305, 21.2512],[81.6308, 21.2508],[81.6312, 21.2505]] } });
    console.log('Pipelines seeded');

    await Valve.create({ name: 'Main Gate Valve', valveId: 'VLV001', village: village._id, pipeline: pipeline1._id, status: 'open', type: 'gate', lastChecked: new Date('2024-03-10'), diameter: 150, location: { type: 'Point', coordinates: [81.6300, 21.2510] } });
    await Valve.create({ name: 'Secondary Gate Valve', valveId: 'VLV002', village: village._id, pipeline: pipeline1._id, status: 'closed', type: 'gate', lastChecked: new Date('2024-03-10'), diameter: 100, location: { type: 'Point', coordinates: [81.6305, 21.2512] } });
    await Valve.create({ name: 'East Pipeline Butterfly Valve', valveId: 'VLV003', village: village._id, pipeline: pipeline2._id, status: 'partially_open', type: 'butterfly', lastChecked: new Date('2024-03-09'), diameter: 100, location: { type: 'Point', coordinates: [81.6308, 21.2508] } });
    await Valve.create({ name: 'Check Valve - Pump Station', valveId: 'VLV004', village: village._id, pipeline: pipeline1._id, status: 'open', type: 'check', lastChecked: new Date('2024-03-10'), diameter: 150, location: { type: 'Point', coordinates: [81.6296, 21.2514] } });
    console.log('Valves seeded');

    const statuses = ['safe', 'safe', 'needs_inspection', 'unsafe', 'safe'];
    const qr = [];
    for (let i = 0; i < 5; i++) {
      qr.push(await WaterQuality.create({ village: village._id, recordedBy: admin._id, location: { type: 'Point', coordinates: [81.6296 + (i * 0.001), 21.2514 + (i * 0.001)] }, parameters: { pH: 7.0 + (Math.random() * 1.5 - 0.5), TDS: 200 + Math.floor(Math.random() * 300), turbidity: Math.random() * 6, chlorine: 0.2 + Math.random() * 0.8, fluoride: Math.random() * 1.5, iron: Math.random() * 0.4, nitrate: Math.random() * 40, coliform: Math.floor(Math.random() * 3) }, overallStatus: statuses[i], recommendations: statuses[i] === 'unsafe' ? ['Boil water before use'] : [], sampleDate: new Date(Date.now() - (i * 86400000)) }));
    }
    console.log('Water quality seeded');

    const cats = ['leakage', 'no_water', 'dirty_water', 'low_pressure', 'other'];
    const sts = ['pending', 'assigned', 'in_progress', 'resolved', 'closed'];
    const pris = ['low', 'medium', 'high', 'urgent'];
    for (let i = 0; i < 10; i++) {
      await Complaint.create({ complainant: citizen._id, village: village._id, category: cats[i % cats.length], description: `Complaint ${i + 1}: Sample ${cats[i % cats.length]} issue.`, location: { type: 'Point', coordinates: [81.6296 + (Math.random() * 0.005), 21.2514 + (Math.random() * 0.005)] }, status: sts[i % sts.length], assignedTo: i % 2 === 0 ? admin._id : undefined, priority: pris[i % pris.length] });
    }
    console.log('Complaints seeded');

    await MaintenanceLog.create({ pump: pump1._id, village: village._id, performedBy: admin._id, type: 'preventive', description: 'Regular quarterly maintenance', partsReplaced: [{ name: 'Pump Seal', cost: 500 }, { name: 'Bearings', cost: 1200 }], totalCost: 1700, startTime: new Date('2024-01-15T09:00:00'), endTime: new Date('2024-01-15T14:00:00'), status: 'completed', nextMaintenanceDate: new Date('2024-04-15') });
    await MaintenanceLog.create({ pump: pump3._id, village: village._id, performedBy: admin._id, type: 'emergency', description: 'Emergency maintenance - motor overheating', partsReplaced: [], totalCost: 0, startTime: new Date('2024-03-12T08:00:00'), status: 'in_progress' });
    console.log('Maintenance seeded');

    await Alert.create({ village: village._id, type: 'pump_failure', severity: 'medium', title: 'Backup Pump Overheating', message: 'Backup pump showing signs of overheating.', relatedEntity: { model: 'Pump', id: pump3._id }, isRead: false });
    await Alert.create({ village: village._id, type: 'tank_low', severity: 'high', title: 'East Underground Tank Low', message: 'East underground tank at 17% capacity.', relatedEntity: { model: 'WaterTank', id: tank2._id }, isRead: false });
    await Alert.create({ village: village._id, type: 'leak_detected', severity: 'high', title: 'Pipeline Leak Reported', message: 'Leak in secondary pipeline.', relatedEntity: { model: 'Pipeline', id: pipeline2._id }, isRead: true, acknowledgedBy: admin._id });
    await Alert.create({ village: village._id, type: 'water_quality_risk', severity: 'critical', title: 'Unsafe Water Quality', message: 'Unsafe coliform levels detected.', relatedEntity: { model: 'WaterQuality', id: qr[3]._id }, isRead: false });
    await Alert.create({ village: village._id, type: 'maintenance_due', severity: 'low', title: 'Maintenance Due', message: 'School pump due for quarterly maintenance.', relatedEntity: { model: 'Pump', id: pump2._id }, isRead: true, acknowledgedBy: admin._id });
    console.log('Alerts seeded');

    console.log('Auto-seed completed!');
    console.log('Admin: admin@jalrakshak.gov.in / Admin@123');
    console.log('Citizen: ramesh@jalrakshak.gov.in / Citizen@123');
  }
};

app.use('/api/v1/auth', require('./routes/auth'));
app.use('/api/v1/villages', require('./routes/villages'));
app.use('/api/v1/pumps', require('./routes/pumps'));
app.use('/api/v1/tanks', require('./routes/tanks'));
app.use('/api/v1/valves', require('./routes/valves'));
app.use('/api/v1/pipelines', require('./routes/pipelines'));
app.use('/api/v1/water-quality', require('./routes/waterQuality'));
app.use('/api/v1/complaints', require('./routes/complaints'));
app.use('/api/v1/maintenance', require('./routes/maintenance'));
app.use('/api/v1/alerts', require('./routes/alerts'));
app.use('/api/v1/analytics', require('./routes/analytics'));
app.use('/api/v1/ai', require('./routes/ai'));
app.use('/api/v1/upload', require('./routes/upload'));
app.use('/api/v1/schedule', require('./routes/schedule'));


app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'JalRakshak API is running',
    timestamp: new Date().toISOString()
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();
  await autoSeed();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();

module.exports = app;
