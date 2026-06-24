import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import {
  Plus, Trash2, ExternalLink, Download, Pencil, X, Check,
  Briefcase, TrendingUp, Trophy, Search, ChevronDown
} from 'lucide-react';
import './index.css';
import './App.css';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const STATUS_CONFIG = {
  Applied:   { color: '#3b82f6', bg: '#1e3a5f', emoji: '📤' },
  OA:        { color: '#a855f7', bg: '#2d1b4e', emoji: '🧩' },
  Interview: { color: '#f59e0b', bg: '#3d2e0e', emoji: '🎤' },
  Offer:     { color: '#22c55e', bg: '#0d2e1a', emoji: '🎉' },
  Rejected:  { color: '#ef4444', bg: '#2e0e0e', emoji: '💔' },
  Ghosted:   { color: '#6b7280', bg: '#1e1e2e', emoji: '👻' },
};

const SOURCES = ['LinkedIn', 'Company Site', 'Referral', 'Internshala', 'Naukri', 'AngelList', 'Other'];
const STATUSES = Object.keys(STATUS_CONFIG);

const EMPTY_FORM = {
  company: '', role: '', appliedDate: format(new Date(), 'yyyy-MM-dd'),
  status: 'Applied', package: '', location: '', source: '', trackLink: '', notes: ''
};

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.Applied;
  return (
    <span style={{
      background: cfg.bg, color: cfg.color,
      border: `1px solid ${cfg.color}44`,
      borderRadius: 20, padding: '3px 10px',
      fontSize: 12, fontWeight: 700, whiteSpace: 'nowrap'
    }}>
      {cfg.emoji} {status}
    </span>
  );
}

function Modal({ title, onClose, children }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-box" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose}><X size={20} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function AppForm({ initial = EMPTY_FORM, onSave, onCancel, loading }) {
  const [form, setForm] = useState(initial);
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  return (
    <form className="app-form" onSubmit={e => { e.preventDefault(); onSave(form); }}>
      <div className="form-row">
        <div className="form-group">
          <label>Company *</label>
          <input required placeholder="Google, Flipkart…" value={form.company} onChange={e => set('company', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Role *</label>
          <input required placeholder="SDE-1, Backend Intern…" value={form.role} onChange={e => set('role', e.target.value)} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Applied Date</label>
          <input type="date" value={form.appliedDate} onChange={e => set('appliedDate', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Status</label>
          <select value={form.status} onChange={e => set('status', e.target.value)}>
            {STATUSES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Package (LPA)</label>
          <input placeholder="12, 15–20, NA…" value={form.package} onChange={e => set('package', e.target.value)} />
        </div>
        <div className="form-group">
          <label>Location</label>
          <input placeholder="Bangalore, Remote…" value={form.location} onChange={e => set('location', e.target.value)} />
        </div>
      </div>
      <div className="form-row">
        <div className="form-group">
          <label>Source</label>
          <select value={form.source} onChange={e => set('source', e.target.value)}>
            <option value="">Select source</option>
            {SOURCES.map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="form-group">
          <label>Track Link</label>
          <input placeholder="https://…" value={form.trackLink} onChange={e => set('trackLink', e.target.value)} />
        </div>
      </div>
      <div className="form-group full">
        <label>Notes</label>
        <textarea placeholder="Referral from Rahul, DSA round expected…" rows={2} value={form.notes} onChange={e => set('notes', e.target.value)} />
      </div>
      <div className="form-actions">
        <button type="button" className="btn-ghost" onClick={onCancel}>Cancel</button>
        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving…' : <><Check size={16} /> Save</>}
        </button>
      </div>
    </form>
  );
}

export default function App() {
  const [apps, setApps] = useState([]);
  const [showAdd, setShowAdd] = useState(false);
  const [editApp, setEditApp] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [expandedId, setExpandedId] = useState(null);

  const fetch = useCallback(async () => {
    const res = await axios.get(`${API}/applications`);
    setApps(res.data);
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  const handleAdd = async (form) => {
    setLoading(true);
    await axios.post(`${API}/applications`, form);
    await fetch();
    setShowAdd(false);
    setLoading(false);
  };

  const handleEdit = async (form) => {
    setLoading(true);
    await axios.put(`${API}/applications/${editApp._id}`, form);
    await fetch();
    setEditApp(null);
    setLoading(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this application?')) return;
    await axios.delete(`${API}/applications/${id}`);
    setApps(a => a.filter(x => x._id !== id));
  };

  const handleExport = () => { window.open(`${API}/export`, '_blank'); };

  const filtered = apps.filter(a => {
    const matchSearch = !search || [a.company, a.role, a.location, a.source]
      .join(' ').toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'All' || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = STATUSES.reduce((acc, s) => {
    acc[s] = apps.filter(a => a.status === s).length;
    return acc;
  }, {});

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-left">
          <div className="logo">🚀</div>
          <div>
            <h1>Job Tracker</h1>
            <p className="subtitle">{apps.length} application{apps.length !== 1 ? 's' : ''} tracked</p>
          </div>
        </div>
        <div className="header-right">
          <button className="btn-ghost" onClick={handleExport}>
            <Download size={16} /> Export Excel
          </button>
          <button className="btn-primary" onClick={() => setShowAdd(true)}>
            <Plus size={16} /> Add Application
          </button>
        </div>
      </header>

      {/* Stats Strip */}
      <div className="stats-strip">
        {[
          { icon: <Briefcase size={18} />, label: 'Total', value: apps.length, color: '#e8e8f0' },
          ...STATUSES.map(s => ({
            icon: <span style={{ fontSize: 16 }}>{STATUS_CONFIG[s].emoji}</span>,
            label: s,
            value: stats[s],
            color: STATUS_CONFIG[s].color
          }))
        ].map(({ icon, label, value, color }) => (
          <div
            key={label}
            className={`stat-card ${filterStatus === label ? 'active' : ''}`}
            onClick={() => setFilterStatus(filterStatus === label ? 'All' : label)}
            style={{ '--accent': color }}
          >
            <span className="stat-icon">{icon}</span>
            <span className="stat-value" style={{ color }}>{value}</span>
            <span className="stat-label">{label}</span>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="search-wrap">
          <Search size={16} className="search-icon" />
          <input
            className="search-input"
            placeholder="Search company, role, location…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        {filterStatus !== 'All' && (
          <button className="chip-active" onClick={() => setFilterStatus('All')}>
            {STATUS_CONFIG[filterStatus]?.emoji} {filterStatus} <X size={12} />
          </button>
        )}
      </div>

      {/* Table */}
      <div className="table-wrap">
        {filtered.length === 0 ? (
          <div className="empty-state">
            <Trophy size={48} style={{ opacity: 0.3 }} />
            <p>{apps.length === 0 ? "No applications yet. Add your first one! 💪" : "No matches found."}</p>
          </div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Company</th>
                <th>Role</th>
                <th>Date</th>
                <th>Status</th>
                <th>Package</th>
                <th>Location</th>
                <th>Source</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <>
                  <tr
                    key={a._id}
                    className="table-row"
                    onClick={() => setExpandedId(expandedId === a._id ? null : a._id)}
                  >
                    <td className="td-company">
                      <span className="company-dot" style={{ background: STATUS_CONFIG[a.status]?.color }} />
                      <strong>{a.company}</strong>
                    </td>
                    <td>{a.role}</td>
                    <td className="td-date">
                      {a.appliedDate ? format(new Date(a.appliedDate), 'dd MMM yy') : '—'}
                    </td>
                    <td><StatusBadge status={a.status} /></td>
                    <td className="td-package">{a.package ? `${a.package} LPA` : '—'}</td>
                    <td className="td-muted">{a.location || '—'}</td>
                    <td className="td-muted">{a.source || '—'}</td>
                    <td className="td-actions" onClick={e => e.stopPropagation()}>
                      {a.trackLink && (
                        <a href={a.trackLink} target="_blank" rel="noreferrer" className="icon-btn">
                          <ExternalLink size={15} />
                        </a>
                      )}
                      <button className="icon-btn" onClick={() => setEditApp(a)}><Pencil size={15} /></button>
                      <button className="icon-btn danger" onClick={() => handleDelete(a._id)}><Trash2 size={15} /></button>
                      <ChevronDown size={15} style={{ opacity: 0.4, transform: expandedId === a._id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                    </td>
                  </tr>
                  {expandedId === a._id && a.notes && (
                    <tr key={`${a._id}-exp`} className="expanded-row">
                      <td colSpan={8}>
                        <div className="notes-row">
                          <TrendingUp size={14} /> <span>{a.notes}</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Modals */}
      {showAdd && (
        <Modal title="✨ New Application" onClose={() => setShowAdd(false)}>
          <AppForm onSave={handleAdd} onCancel={() => setShowAdd(false)} loading={loading} />
        </Modal>
      )}
      {editApp && (
        <Modal title="✏️ Edit Application" onClose={() => setEditApp(null)}>
          <AppForm
            initial={{ ...editApp, appliedDate: editApp.appliedDate ? format(new Date(editApp.appliedDate), 'yyyy-MM-dd') : '' }}
            onSave={handleEdit}
            onCancel={() => setEditApp(null)}
            loading={loading}
          />
        </Modal>
      )}
    </div>
  );
}
