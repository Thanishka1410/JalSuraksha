# JalRakshak AI - Smart Rural Water Supply Monitoring & Maintenance Platform

A production-ready full-stack web application for monitoring, maintaining, and managing rural piped water supply systems under the Jal Jeevan Mission.

## Features

- **Dashboard** - Real-time KPIs, charts, and alerts
- **Infrastructure Monitoring** - Pumps, Tanks, Valves, Pipelines management
- **Water Quality Monitoring** - BIS-compliant parameter tracking with AI analysis
- **AI Leak Detection** - Machine learning powered leak prediction
- **Predictive Maintenance** - AI-driven pump health scoring and failure prediction
- **Citizen Complaint Portal** - Issue reporting with GPS, images, and tracking
- **GIS Map Module** - Interactive Leaflet.js map with all infrastructure
- **Alert System** - Multi-severity alerts with notifications
- **Analytics Module** - Comprehensive reports with PDF export
- **AI Village Assistant** - Chatbot for queries about water, pumps, complaints
- **Role-Based Access** - 5 user roles with granular permissions
- **Dark Mode** - Full dark mode support
- **Responsive Design** - Mobile-first, works on all devices

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, TypeScript, Tailwind CSS, Recharts, Framer Motion, Leaflet.js |
| Backend | Node.js, Express.js, Mongoose, JWT |
| Database | MongoDB Atlas |
| AI/ML | Python FastAPI, Scikit-Learn, XGBoost, Pandas, NumPy |
| Maps | Leaflet.js, OpenStreetMap |

## Project Structure

```
JalRakshak/
├── frontend/          # React + TypeScript + Tailwind
│   ├── src/
│   │   ├── components/    # Reusable UI components
│   │   ├── contexts/      # Auth & Theme context
│   │   ├── hooks/         # Custom React hooks
│   │   ├── layouts/       # Dashboard layout
│   │   ├── pages/         # Page components
│   │   ├── types/         # TypeScript interfaces
│   │   └── utils/         # API, helpers
│   ├── public/
│   └── package.json
├── backend/           # Node.js + Express
│   ├── config/        # DB, constants
│   ├── controllers/   # Route handlers
│   ├── middleware/     # Auth, validation, error handler
│   ├── models/        # Mongoose schemas (11 models)
│   ├── routes/        # API routes
│   ├── utils/         # Token, email, helpers
│   ├── seeds/         # Sample data seeder
│   └── server.js
├── ai-service/        # Python FastAPI ML service
│   ├── models/        # ML models (leak, maintenance, quality)
│   ├── routes/        # FastAPI routers
│   ├── services/      # Model service
│   ├── utils/         # Data generators
│   ├── sample_data/   # CSV datasets
│   └── main.py
└── README.md
```

## Getting Started

### Prerequisites

- Node.js >= 18.x
- Python >= 3.9
- MongoDB Atlas account
- npm or yarn

### 1. Clone the Repository

```bash
git clone <repository-url>
cd JalRakshak
```

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and secrets
npm run seed    # Populate sample data
npm run dev     # Start on port 5000
```

### 3. Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
# Edit .env with API URL
npm start       # Start on port 3000
```

### 4. AI Service Setup

```bash
cd ai-service
pip install -r requirements.txt
cp .env.example .env
python main.py  # Start on port 8001
```

### 5. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api/v1
- AI Service: http://localhost:8001/docs
- API Docs: http://localhost:5000/api-docs

## Default Credentials

After running the seed script:

| Role | Email | Password |
|------|-------|----------|
| Super Admin | admin@jalrakshak.gov.in | Admin@123 |
| Citizen | citizen@jalrakshak.gov.in | Citizen@123 |

## API Endpoints

### Authentication
- `POST /api/v1/auth/register` - Register user
- `POST /api/v1/auth/login` - Login
- `GET /api/v1/auth/me` - Get profile
- `PUT /api/v1/auth/profile` - Update profile
- `POST /api/v1/auth/forgot-password` - Forgot password
- `POST /api/v1/auth/reset-password/:token` - Reset password

### Villages
- `GET /api/v1/villages` - List villages
- `POST /api/v1/villages` - Create village
- `GET /api/v1/villages/:id` - Get village
- `PUT /api/v1/villages/:id` - Update village
- `DELETE /api/v1/villages/:id` - Delete village
- `GET /api/v1/villages/:id/stats` - Village statistics

### Pumps
- `GET /api/v1/pumps` - List pumps
- `POST /api/v1/pumps` - Create pump
- `GET /api/v1/pumps/:id` - Get pump
- `PUT /api/v1/pumps/:id` - Update pump
- `DELETE /api/v1/pumps/:id` - Delete pump

### Water Tanks
- `GET /api/v1/tanks` - List tanks
- `POST /api/v1/tanks` - Create tank
- `GET /api/v1/tanks/:id` - Get tank
- `PUT /api/v1/tanks/:id` - Update tank
- `DELETE /api/v1/tanks/:id` - Delete tank

### Valves
- `GET /api/v1/valves` - List valves
- `POST /api/v1/valves` - Create valve
- `PUT /api/v1/valves/:id` - Update valve
- `POST /api/v1/valves/:id/toggle` - Toggle valve status

### Pipelines
- `GET /api/v1/pipelines` - List pipelines
- `POST /api/v1/pipelines` - Create pipeline
- `PUT /api/v1/pipelines/:id` - Update pipeline
- `POST /api/v1/pipelines/:id/report-leak` - Report leak

### Water Quality
- `GET /api/v1/water-quality` - List readings
- `POST /api/v1/water-quality` - Create reading
- `GET /api/v1/water-quality/trends` - Get trends
- `GET /api/v1/water-quality/alerts` - Get alerts

### Complaints
- `GET /api/v1/complaints` - List complaints
- `POST /api/v1/complaints` - Create complaint
- `GET /api/v1/complaints/:id` - Get complaint
- `PUT /api/v1/complaints/:id/assign` - Assign complaint
- `PUT /api/v1/complaints/:id/status` - Update status

### Maintenance
- `GET /api/v1/maintenance` - List maintenance logs
- `POST /api/v1/maintenance` - Create maintenance
- `PUT /api/v1/maintenance/:id/complete` - Complete maintenance

### Alerts
- `GET /api/v1/alerts` - List alerts
- `PUT /api/v1/alerts/:id/read` - Mark as read
- `PUT /api/v1/alerts/:id/acknowledge` - Acknowledge
- `PUT /api/v1/alerts/:id/resolve` - Resolve

### Analytics
- `GET /api/v1/analytics/dashboard` - Dashboard data
- `GET /api/v1/analytics/consumption` - Consumption analytics
- `GET /api/v1/analytics/pump-efficiency` - Pump efficiency
- `GET /api/v1/analytics/quality-trends` - Quality trends
- `GET /api/v1/analytics/complaints` - Complaint analytics
- `GET /api/v1/analytics/maintenance-cost` - Maintenance costs

### AI Service
- `POST /api/v1/ai/leak-detect` - Leak detection
- `POST /api/v1/ai/maintenance-predict` - Maintenance prediction
- `POST /api/v1/ai/quality-analyze` - Water quality analysis
- `POST /api/v1/ai/quality-trend` - Quality trend analysis
- `POST /api/v1/ai/chat` - AI chat assistant

## Database Collections

| Collection | Description |
|-----------|-------------|
| Users | User accounts with roles |
| Villages | Village information with geolocation |
| Pumps | Water pump infrastructure |
| WaterTanks | Storage tank data |
| Valves | Valve controls |
| Pipelines | Pipeline network |
| WaterQuality | Quality test records |
| Complaints | Citizen complaints |
| MaintenanceLogs | Maintenance history |
| Alerts | System alerts |
| AIReports | AI analysis reports |

## User Roles

| Role | Permissions |
|------|------------|
| Super Admin | Full access to all villages and users |
| GP Admin | Monitor village infrastructure, assign maintenance |
| VWSC Member | Upload inspections, quality reports, maintenance records |
| Citizen | Report issues, view water quality |
| District Officer | Monitor multiple villages, view analytics |

## Deployment

### Frontend (Vercel)
```bash
cd frontend
npm run build
vercel deploy
```

### Backend (Render/Railway)
```bash
cd backend
# Set environment variables in dashboard
# Deploy from Git
```

### AI Service (Render)
```bash
cd ai-service
# Create Python service
# Set start command: uvicorn main:app --host 0.0.0.0 --port $PORT
```

## Environment Variables

See `.env.example` files in each directory for required variables.

## License

MIT License

## Contributing

Contributions welcome. Please follow the existing code style and add tests for new features.

## Support

For issues and feedback, please open a GitHub issue.
