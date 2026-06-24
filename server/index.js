const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const XLSX = require('xlsx');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/jobtracker';
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB error:', err));

const ApplicationSchema = new mongoose.Schema({
  company: { type: String, required: true },
  role: { type: String, required: true },
  appliedDate: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['Applied', 'OA', 'Interview', 'Offer', 'Rejected', 'Ghosted'],
    default: 'Applied'
  },
  package: { type: String },
  trackLink: { type: String },
  location: { type: String },
  notes: { type: String },
  source: { type: String }, // LinkedIn, Referral, Company Site, etc.
}, { timestamps: true });

const Application = mongoose.model('Application', ApplicationSchema);

// GET all
app.get('/api/applications', async (req, res) => {
  const apps = await Application.find().sort({ createdAt: -1 });
  res.json(apps);
});

// POST create
app.post('/api/applications', async (req, res) => {
  try {
    const app = new Application(req.body);
    await app.save();
    res.json(app);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// PUT update
app.put('/api/applications/:id', async (req, res) => {
  try {
    const app = await Application.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(app);
  } catch (e) {
    res.status(400).json({ error: e.message });
  }
});

// DELETE
app.delete('/api/applications/:id', async (req, res) => {
  await Application.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Export to Excel
app.get('/api/export', async (req, res) => {
  const apps = await Application.find().sort({ createdAt: -1 });
  const data = apps.map(a => ({
    Company: a.company,
    Role: a.role,
    'Applied Date': a.appliedDate ? new Date(a.appliedDate).toLocaleDateString() : '',
    Status: a.status,
    'Package (LPA)': a.package || '',
    Location: a.location || '',
    Source: a.source || '',
    'Track Link': a.trackLink || '',
    Notes: a.notes || '',
  }));
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Applications');
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Disposition', 'attachment; filename=job-applications.xlsx');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buf);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
