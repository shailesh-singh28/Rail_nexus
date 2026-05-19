'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, UserCheck, UserX, Trash2, Plus, Edit3, Save, 
  X, Check, AlertTriangle, Shield, HardDrive, RefreshCw
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import useAppStore from '@/store/useAppStore';
import api from '@/lib/api';

const modalBgStyle = {
  position: 'fixed', inset: 0, zIndex: 1000,
  background: 'rgba(5, 5, 8, 0.85)',
  backdropFilter: 'blur(10px)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: '24px'
};

const cardStyle = {
  background: 'rgba(255, 255, 255, 0.03)',
  border: '1px solid rgba(255, 255, 255, 0.08)',
  borderRadius: '20px',
  padding: '24px',
  backdropFilter: 'blur(12px)',
};

const inputStyle = {
  width: '100%',
  padding: '10px 14px',
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '10px',
  color: '#fff',
  fontSize: '0.85rem',
  outline: 'none',
  boxSizing: 'border-box'
};

const selectStyle = {
  width: '100%',
  padding: '10px 14px',
  background: 'rgba(15, 17, 26, 0.95)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: '10px',
  color: '#fff',
  fontSize: '0.85rem',
  outline: 'none',
  boxSizing: 'border-box'
};

const btnStyle = {
  width: '100%',
  padding: '12px',
  background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
  color: '#fff',
  border: 'none',
  borderRadius: '10px',
  fontWeight: 600,
  fontSize: '0.9rem',
  cursor: 'pointer',
  marginTop: '10px',
  boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'
};

export default function AdminUsersPage() {
  const router = useRouter();
  const { loggedInUser, isLoggedIn } = useAppStore();

  const [tab, setTab] = useState('accounts'); // 'accounts' or 'requests'
  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [divisions, setDivisions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals / Actions
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('engineer');
  const [division, setDivision] = useState('');
  const [isActive, setIsActive] = useState(true);

  const [actionError, setActionError] = useState('');
  const [actionSuccess, setActionSuccess] = useState('');

  // Guard redirects
  useEffect(() => {
    if (!isLoggedIn) {
      router.replace('/login');
      return;
    }
    if (loggedInUser?.role !== 'admin') {
      router.replace('/');
      return;
    }
    loadData();
  }, [isLoggedIn, loggedInUser, router]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [usersRes, requestsRes, divRes] = await Promise.all([
        api.get('/users'),
        api.get('/users/requests'),
        api.get('/divisions')
      ]);
      setUsers(usersRes.data);
      setRequests(requestsRes.data);
      setDivisions(divRes.data);
      if (divRes.data.length > 0) {
        setDivision(divRes.data[0]._id);
      }
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setActionError('');
    try {
      const res = await api.post('/users', {
        name, email, phone, password, role, division
      });
      setUsers([res.data, ...users]);
      setShowAddModal(false);
      resetForm();
      triggerNotification('User created successfully.');
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to create user.');
    }
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setActionError('');
    try {
      const res = await api.put(`/users/${editingUser._id}`, {
        name, email, phone, role, division, isActive, password
      });
      setUsers(users.map(u => u._id === editingUser._id ? res.data : u));
      setShowEditModal(false);
      resetForm();
      triggerNotification('User details updated.');
    } catch (err) {
      setActionError(err.response?.data?.error || 'Failed to update user.');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this user?')) return;
    try {
      await api.delete(`/users/${id}`);
      setUsers(users.filter(u => u._id !== id));
      triggerNotification('User deleted.');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete user.');
    }
  };

  const handleApproveRequest = async (id) => {
    try {
      const res = await api.post(`/users/requests/${id}/approve`);
      setRequests(requests.map(r => r._id === id ? { ...r, status: 'approved' } : r));
      loadData(); // reload to put approved user in user list
      triggerNotification(res.data.message || 'Request approved successfully.');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to approve request.');
    }
  };

  const handleRejectRequest = async (id) => {
    if (!window.confirm('Are you sure you want to reject this request?')) return;
    try {
      await api.post(`/users/requests/${id}/reject`);
      setRequests(requests.map(r => r._id === id ? { ...r, status: 'rejected' } : r));
      triggerNotification('Request rejected.');
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to reject request.');
    }
  };

  const openEdit = (user) => {
    setEditingUser(user);
    setName(user.name || '');
    setEmail(user.email || '');
    setPhone(user.phone || '');
    setPassword('');
    setRole(user.role || 'engineer');
    setDivision(user.division?._id || user.division || '');
    setIsActive(user.isActive);
    setShowEditModal(true);
  };

  const resetForm = () => {
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setRole('engineer');
    setIsActive(true);
    setActionError('');
    if (divisions.length > 0) setDivision(divisions[0]._id);
  };

  const triggerNotification = (msg) => {
    setActionSuccess(msg);
    setTimeout(() => setActionSuccess(''), 4000);
  };

  if (!isLoggedIn || loggedInUser?.role !== 'admin') return null;

  return (
    <main style={{ background: '#07080e', minHeight: '100vh', paddingBottom: '100px' }}>
      <Navbar />

      {/* Header section */}
      <div style={{ background: 'linear-gradient(180deg, rgba(99,102,241,0.06) 0%, rgba(7,8,14,0) 100%)', paddingTop: '110px', paddingBottom: '36px', borderBottom: '1px solid rgba(255,255,255,0.03)' }}>
        <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div>
            <h1 style={{ fontSize: '2.2rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px', display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Shield size={32} color="#818cf8" /> Admin Console
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '4px' }}>
              Manage user accounts, monitor permissions, and approve new registration requests.
            </p>
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button 
              onClick={loadData}
              className="hidden-mobile"
              style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', padding: '10px 16px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}
            >
              <RefreshCw size={14} /> Refresh
            </button>
            <button 
              onClick={() => { resetForm(); setShowAddModal(true); }}
              style={{ background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '12px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '0.85rem', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)' }}
            >
              <Plus size={16} /> Add User
            </button>
          </div>
        </div>
      </div>

      <div className="container" style={{ marginTop: '36px' }}>
        <AnimatePresence>
          {actionSuccess && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', color: '#6ee7b7', padding: '12px 18px', borderRadius: '12px', fontSize: '0.88rem', textAlign: 'center', marginBottom: '24px', fontWeight: 500 }}
            >
              {actionSuccess}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px', marginBottom: '28px' }}>
          <button 
            onClick={() => setTab('accounts')}
            style={{ background: 'none', border: 'none', borderBottom: tab === 'accounts' ? '2px solid #818cf8' : '2px solid transparent', color: tab === 'accounts' ? '#fff' : 'rgba(255,255,255,0.4)', padding: '8px 16px 12px', fontSize: '0.92rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
          >
            User Accounts ({users.length})
          </button>
          <button 
            onClick={() => setTab('requests')}
            style={{ background: 'none', border: 'none', borderBottom: tab === 'requests' ? '2px solid #818cf8' : '2px solid transparent', color: tab === 'requests' ? '#fff' : 'rgba(255,255,255,0.4)', padding: '8px 16px 12px', fontSize: '0.92rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}
          >
            Access Requests ({requests.filter(r => r.status === 'pending').length} pending)
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'rgba(255,255,255,0.4)' }}>
            <RefreshCw className="animate-spin" size={24} style={{ margin: '0 auto 12px' }} />
            Loading accounts and requests...
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {tab === 'accounts' ? (
              <motion.div 
                key="accounts-tab"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
              >
                {users.length === 0 ? (
                  <div style={{ ...cardStyle, textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                    No users registered in the database.
                  </div>
                ) : (
                  users.map(user => (
                    <div key={user._id} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{ 
                          width: '46px', height: '46px', borderRadius: '12px', 
                          background: user.role === 'admin' ? 'rgba(244,63,94,0.1)' : 'rgba(99,102,241,0.1)',
                          border: user.role === 'admin' ? '1px solid rgba(244,63,94,0.2)' : '1px solid rgba(99,102,241,0.2)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: user.role === 'admin' ? '#f43f5e' : '#818cf8', fontWeight: 700, fontSize: '1.1rem'
                        }}>
                          {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.98rem' }}>{user.name}</span>
                            {/* Role Badge */}
                            <span style={{
                              padding: '2px 8px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px',
                              background: user.role === 'admin' ? 'rgba(244,63,94,0.12)' : user.role === 'engineer' ? 'rgba(99,102,241,0.12)' : 'rgba(255,255,255,0.06)',
                              color: user.role === 'admin' ? '#fb7185' : user.role === 'engineer' ? '#818cf8' : '#cbd5e1',
                              border: user.role === 'admin' ? '1px solid rgba(244,63,94,0.15)' : user.role === 'engineer' ? '1px solid rgba(99,102,241,0.15)' : '1px solid rgba(255,255,255,0.08)'
                            }}>
                              {user.role}
                            </span>
                            {/* Deactivated Badge */}
                            {!user.isActive && (
                              <span style={{ padding: '2px 8px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 700, background: 'rgba(239,68,68,0.1)', color: '#f87171', border: '1px solid rgba(239,68,68,0.2)' }}>
                                Deactivated
                              </span>
                            )}
                          </div>
                          <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '3px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                            <span>Email: <strong style={{ color: '#fff' }}>{user.email}</strong></span>
                            <span>Phone: <strong style={{ color: '#fff' }}>+91 {user.phone || 'N/A'}</strong></span>
                            <span>Division: <strong style={{ color: '#fff' }}>{user.division?.name || 'N/A'}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                          onClick={() => openEdit(user)}
                          style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: 'none', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.2s' }}
                        >
                          <Edit3 size={15} />
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(user._id)}
                          disabled={loggedInUser?._id === user._id}
                          style={{ background: 'rgba(239,68,68,0.05)', color: '#f87171', border: 'none', width: '38px', height: '38px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: loggedInUser?._id === user._id ? 'not-allowed' : 'pointer', transition: 'background 0.2s', opacity: loggedInUser?._id === user._id ? 0.3 : 1 }}
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            ) : (
              <motion.div 
                key="requests-tab"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}
              >
                {requests.length === 0 ? (
                  <div style={{ ...cardStyle, textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>
                    No user access requests found.
                  </div>
                ) : (
                  requests.map(req => (
                    <div key={req._id} style={{ ...cardStyle, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', borderLeft: req.status === 'pending' ? '4px solid #818cf8' : req.status === 'approved' ? '4px solid #34d399' : '4px solid #f87171' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ color: '#fff', fontWeight: 600, fontSize: '0.98rem' }}>{req.name}</span>
                          {/* Status Badge */}
                          <span style={{
                            padding: '2px 8px', borderRadius: '6px', fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase',
                            background: req.status === 'approved' ? 'rgba(52,211,153,0.1)' : req.status === 'rejected' ? 'rgba(239,68,68,0.1)' : 'rgba(99,102,241,0.1)',
                            color: req.status === 'approved' ? '#6ee7b7' : req.status === 'rejected' ? '#f87171' : '#818cf8',
                            border: req.status === 'approved' ? '1px solid rgba(52,211,153,0.15)' : req.status === 'rejected' ? '1px solid rgba(239,68,68,0.15)' : '1px solid rgba(99,102,241,0.15)'
                          }}>
                            {req.status}
                          </span>
                        </div>
                        <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: '4px', display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
                          <span>Email: <strong style={{ color: '#fff' }}>{req.email}</strong></span>
                          <span>Phone: <strong style={{ color: '#fff' }}>+91 {req.phone}</strong></span>
                          <span>Division: <strong style={{ color: '#fff' }}>{req.division?.name || 'N/A'}</strong></span>
                          <span>Submitted: <strong style={{ color: '#fff' }}>{new Date(req.createdAt).toLocaleDateString()}</strong></span>
                        </div>
                      </div>

                      {/* Approval Controls */}
                      {req.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => handleApproveRequest(req._id)}
                            style={{ background: 'rgba(52,211,153,0.1)', color: '#34d399', border: '1px solid rgba(52,211,153,0.2)', padding: '6px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                          >
                            <Check size={14} /> Approve
                          </button>
                          <button 
                            onClick={() => handleRejectRequest(req._id)}
                            style={{ background: 'rgba(239,68,68,0.06)', color: '#f87171', border: '1px solid rgba(239,68,68,0.15)', padding: '6px 14px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer' }}
                          >
                            <X size={14} /> Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>

      {/* ── ADD USER MODAL ── */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={modalBgStyle}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              style={{ ...cardStyle, width: '100%', maxWidth: '460px', padding: '32px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>Add New Account</h2>
                <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><X size={20} /></button>
              </div>

              <form onSubmit={handleCreateUser}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: '5px' }}>Full Name</label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: '5px' }}>Email</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: '5px' }}>Phone</label>
                  <input type="tel" required maxLength={10} value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: '5px' }}>Password</label>
                  <input type="password" required value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: '5px' }}>Role</label>
                    <select value={role} onChange={e => setRole(e.target.value)} style={selectStyle}>
                      <option value="engineer" style={{ background: '#11131e', color: '#fff' }}>Engineer</option>
                      <option value="admin" style={{ background: '#11131e', color: '#fff' }}>Admin</option>
                      <option value="viewer" style={{ background: '#11131e', color: '#fff' }}>Viewer</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: '5px' }}>Division</label>
                    <select value={division} onChange={e => setDivision(e.target.value)} style={selectStyle}>
                      {divisions.map(div => (
                        <option key={div._id} value={div._id} style={{ background: '#11131e', color: '#fff' }}>{div.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {actionError && (
                  <p style={{ color: '#fca5a5', fontSize: '0.8rem', textAlign: 'center', marginBottom: '12px' }}>{actionError}</p>
                )}

                <button type="submit" style={btnStyle}>
                  Create User
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── EDIT USER MODAL ── */}
      <AnimatePresence>
        {showEditModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={modalBgStyle}
          >
            <motion.div 
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              style={{ ...cardStyle, width: '100%', maxWidth: '460px', padding: '32px' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: '#fff' }}>Edit Account</h2>
                <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.4)', cursor: 'pointer' }}><X size={20} /></button>
              </div>

              <form onSubmit={handleEditUser}>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: '5px' }}>Full Name</label>
                  <input type="text" required value={name} onChange={e => setName(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: '5px' }}>Email</label>
                  <input type="email" required value={email} onChange={e => setEmail(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: '5px' }}>Phone</label>
                  <input type="tel" required maxLength={10} value={phone} onChange={e => setPhone(e.target.value)} style={inputStyle} />
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: '5px' }}>New Password (leave blank to keep unchanged)</label>
                  <input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} style={inputStyle} />
                </div>

                <div style={{ display: 'flex', gap: '12px', marginBottom: '14px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: '5px' }}>Role</label>
                    <select value={role} onChange={e => setRole(e.target.value)} style={selectStyle}>
                      <option value="engineer" style={{ background: '#11131e', color: '#fff' }}>Engineer</option>
                      <option value="admin" style={{ background: '#11131e', color: '#fff' }}>Admin</option>
                      <option value="viewer" style={{ background: '#11131e', color: '#fff' }}>Viewer</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ display: 'block', fontSize: '0.72rem', fontWeight: 600, color: 'rgba(255,255,255,0.45)', marginBottom: '5px' }}>Division</label>
                    <select value={division} onChange={e => setDivision(e.target.value)} style={selectStyle}>
                      {divisions.map(div => (
                        <option key={div._id} value={div._id} style={{ background: '#11131e', color: '#fff' }}>{div.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* IsActive status toggle */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '22px', background: 'rgba(255,255,255,0.02)', padding: '12px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.05)' }}>
                  <input 
                    type="checkbox" 
                    id="isActiveToggle" 
                    checked={isActive} 
                    onChange={e => setIsActive(e.target.checked)}
                    style={{ width: '16px', height: '16px', accentColor: '#6366f1' }}
                  />
                  <label htmlFor="isActiveToggle" style={{ fontSize: '0.82rem', color: '#fff', cursor: 'pointer', fontWeight: 500 }}>
                    Account Active / Approved for Login
                  </label>
                </div>

                {actionError && (
                  <p style={{ color: '#fca5a5', fontSize: '0.8rem', textAlign: 'center', marginBottom: '12px' }}>{actionError}</p>
                )}

                <button type="submit" style={btnStyle}>
                  Save Changes
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </main>
  );
}
