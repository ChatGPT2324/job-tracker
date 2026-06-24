# 🚀 Job Tracker

A clean, fun job application tracker with MongoDB storage and Excel export.

## Prerequisites

- Node.js (v16+)
- MongoDB running locally on port 27017

## Setup & Run

### 1. Start MongoDB
```bash
mongod
# or if using brew on Mac:
brew services start mongodb-community
```

### 2. Start the Backend (Terminal 1)
```bash
cd server
node index.js
# Runs on http://localhost:5000
```

### 3. Start the Frontend (Terminal 2)
```bash
cd client
npm start
# Opens http://localhost:3000
```

## Features
- ✅ Add / Edit / Delete applications
- 📊 Status tracking: Applied → OA → Interview → Offer / Rejected / Ghosted
- 🔍 Search & filter by status
- 📤 Export to Excel
- 🔗 Track link per application
- 📝 Notes per application (click row to expand)
- 💾 All data persisted in local MongoDB

## Fields Tracked
| Field | Description |
|-------|-------------|
| Company | Company name |
| Role | Job title / role |
| Applied Date | When you applied |
| Status | Applied / OA / Interview / Offer / Rejected / Ghosted |
| Package | CTC in LPA |
| Location | City or Remote |
| Source | LinkedIn / Referral / etc. |
| Track Link | Direct link to application portal |
| Notes | Any personal notes |
