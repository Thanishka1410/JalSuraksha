# Deployment Guide - JalRakshak AI

## Prerequisites

- MongoDB Atlas account (free tier available)
- Vercel account (free tier available)
- Render account (free tier available)
- GitHub repository

---

## 1. MongoDB Atlas Setup

1. Go to https://cloud.mongodb.com
2. Create a free M0 cluster
3. Create a database user (Database Access)
4. Whitelist IP addresses (Network Access → Add IP → 0.0.0.0/0)
5. Get connection string:
   - Click "Connect" → "Connect your application"
   - Copy the connection string
   - Replace `<password>` with your database user password
   - Example: `mongodb+srv://user:pass@cluster.mongodb.net/jalrakshak?retryWrites=true&w=majority`

---

## 2. Backend Deployment (Render)

### Step 1: Push to GitHub
```bash
cd backend
git init
git add .
git commit -m "Initial backend commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Step 2: Create Render Service
1. Go to https://dashboard.render.com
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: jalrakshak-backend
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: Free

### Step 3: Set Environment Variables
In Render dashboard → Environment tab, add:
```
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/jalrakshak?retryWrites=true&w=majority
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRE=7d
JWT_COOKIE_EXPIRE=7
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
AI_SERVICE_URL=https://your-ai-service.onrender.com
```

### Step 4: Deploy
- Render auto-deploys on push to main
- Check logs for any errors

---

## 3. AI Service Deployment (Render)

### Step 1: Push AI Service to GitHub
```bash
cd ai-service
git init
git add .
git commit -m "Initial AI service commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Step 2: Create Render Service
1. Click "New +" → "Web Service"
2. Connect repository
3. Configure:
   - **Name**: jalrakshak-ai
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Plan**: Free

### Step 3: Set Environment Variables
```
MODEL_DIR=./saved_models
HOST=0.0.0.0
PORT=8001
```

### Step 4: Deploy
- Auto-deploys on push
- Note the service URL (e.g., https://jalrakshak-ai.onrender.com)

---

## 4. Frontend Deployment (Vercel)

### Step 1: Prepare Frontend
```bash
cd frontend
# Create .env file with production API URL
echo "REACT_APP_API_URL=https://jalrakshak-backend.onrender.com/api/v1" > .env
echo "REACT_APP_AI_URL=https://jalrakshak-ai.onrender.com" >> .env
```

### Step 2: Push to GitHub
```bash
git init
git add .
git commit -m "Initial frontend commit"
git remote add origin <your-github-repo-url>
git push -u origin main
```

### Step 3: Deploy on Vercel
1. Go to https://vercel.com
2. Click "New Project"
3. Import GitHub repository
4. Configure:
   - **Framework Preset**: Create React App
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
5. Add Environment Variables:
   ```
   REACT_APP_API_URL=https://jalrakshak-backend.onrender.com/api/v1
   REACT_APP_AI_URL=https://jalrakshak-ai.onrender.com
   ```
6. Click "Deploy"

---

## 5. Alternative: Railway Deployment

### Backend on Railway
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Add service → Web Service
4. Set:
   - Build: `npm install`
   - Start: `node server.js`
5. Add environment variables
6. Deploy

### AI Service on Railway
1. Add service → Web Service
2. Set:
   - Build: `pip install -r requirements.txt`
   - Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Deploy

---

## 6. Post-Deployment

### Seed the Database
```bash
# After first deployment, seed sample data
curl -X POST https://jalrakshak-backend.onrender.com/api/v1/seed
```

### Verify Deployment
1. Check backend health: `GET https://jalrakshak-backend.onrender.com/api/v1/health`
2. Check AI service: `GET https://jalrakshak-ai.onrender.com/health`
3. Open frontend: `https://your-app.vercel.app`

---

## 7. Custom Domain (Optional)

### Vercel
1. Project Settings → Domains
2. Add your domain
3. Update DNS records as instructed

### Render
1. Settings → Custom Domains
2. Add domain
3. Update DNS CNAME record

---

## 8. SSL/HTTPS

All platforms (Vercel, Render, Railway) provide free SSL certificates automatically.

---

## Troubleshooting

### CORS Errors
Ensure backend CORS is configured for your frontend domain.

### MongoDB Connection
- Verify IP whitelist includes 0.0.0.0/0
- Check connection string format
- Ensure database user has read/write permissions

### AI Service Cold Start
Free tier services sleep after inactivity. First request may take 30-60 seconds.

### Environment Variables
Double-check all environment variables are set correctly in each platform dashboard.

---

## Monitoring

### Health Checks
- Backend: `GET /api/v1/health`
- AI Service: `GET /health`

### Logs
- Vercel: Project → Logs tab
- Render: Service → Logs tab
- Railway: Service → Deployments → View Logs

---

## Cost Estimate (Free Tier)

| Service | Provider | Cost |
|---------|----------|------|
| Frontend | Vercel | Free |
| Backend | Render | Free (with limitations) |
| AI Service | Render | Free (with limitations) |
| Database | MongoDB Atlas | Free (M0) |
| **Total** | | **$0/month** |

> Note: Free tiers have limitations (sleep after inactivity, limited bandwidth). For production, consider paid plans.
