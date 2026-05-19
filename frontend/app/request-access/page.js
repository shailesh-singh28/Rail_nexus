'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Phone, Briefcase, ArrowLeft, Send, CheckCircle, Lock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import api from '@/lib/api';

const inputStyle = {
  width: '100%',
  padding: '11px 14px 11px 40px',
  background: 'rgba(255,255,255,0.05)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  color: '#fff',
  fontSize: '0.88rem',
  outline: 'none',
  transition: 'border-color 0.2s, background 0.2s',
  boxSizing: 'border-box',
};

const selectStyle = {
  width: '100%',
  padding: '11px 14px 11px 40px',
  background: 'rgba(15, 17, 26, 0.95)',
  border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: '12px',
  color: '#fff',
  fontSize: '0.88rem',
  outline: 'none',
  transition: 'border-color 0.2s, background 0.2s',
  boxSizing: 'border-box',
  appearance: 'none',
};

const labelStyle = {
  display: 'block',
  fontSize: '0.72rem',
  fontWeight: 600,
  color: 'rgba(255,255,255,0.45)',
  marginBottom: '7px',
  letterSpacing: '0.8px',
  textTransform: 'uppercase',
};

const btnStyle = {
  width: '100%',
  height: '46px',
  background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
  border: 'none',
  borderRadius: '12px',
  color: '#fff',
  fontSize: '0.9rem',
  fontWeight: 700,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
  letterSpacing: '0.2px',
  transition: 'opacity 0.2s',
};

export default function RequestAccessPage() {
  const [divisions, setDivisions] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [division, setDivision] = useState('');
  const [password, setPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchDivisions();
  }, []);

  const fetchDivisions = async () => {
    try {
      const res = await api.get('/divisions');
      setDivisions(res.data);
      if (res.data.length > 0) {
        setDivision(res.data[0]._id);
      }
    } catch (err) {
      console.error('Failed to load divisions:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const cleanedPhone = phone.replace(/\D/g, '');
    if (cleanedPhone.length < 10) {
      setError('Enter a valid 10-digit mobile number.');
      setLoading(false);
      return;
    }

    try {
      await api.post('/auth/request-access', {
        name,
        email,
        phone: cleanedPhone,
        division,
        password
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const focusStyle = (e) => {
    e.target.style.borderColor = 'rgba(99,102,241,0.7)';
    e.target.style.background = 'rgba(99,102,241,0.08)';
  };

  const blurStyle = (e) => {
    e.target.style.borderColor = 'rgba(255,255,255,0.1)';
    e.target.style.background = 'rgba(255,255,255,0.05)';
  };

  return (
    <main style={{ position: 'relative', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', zIndex: 20 }}>
        <Navbar logoOnly />
      </div>

      {/* Background */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <img src="/monitoring.png" alt="bg" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(7,8,14,0.85) 0%, rgba(11,12,20,0.78) 50%, rgba(7,8,14,0.9) 100%)', backdropFilter: 'blur(2px)' }} />
      </div>
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, opacity: 0.04, backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
      <div style={{ position: 'absolute', top: '20%', left: '15%', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(99,102,241,0.12)', filter: 'blur(80px)', zIndex: 1 }} />
      <div style={{ position: 'absolute', bottom: '20%', right: '15%', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(244,114,182,0.08)', filter: 'blur(80px)', zIndex: 1 }} />

      {/* Form Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          position: 'relative', zIndex: 10,
          width: '100%', maxWidth: '440px',
          margin: '24px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '24px',
          padding: '36px 32px',
          backdropFilter: 'blur(32px)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        <AnimatePresence mode="wait">
          {!success ? (
            <motion.div
              key="request-form"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '28px' }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: '#fff', marginBottom: '6px', letterSpacing: '-0.3px' }}>Request Access</h1>
                <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem' }}>
                  Submit your details. An administrator will review and configure your account.
                </p>
              </div>

              <form onSubmit={handleSubmit}>
                {/* Name */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={labelStyle}>Full Name</label>
                  <div style={{ position: 'relative' }}>
                    <User size={14} color="rgba(255,255,255,0.25)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                      type="text"
                      placeholder="John Doe"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      style={inputStyle}
                      onFocus={focusStyle}
                      onBlur={blurStyle}
                    />
                  </div>
                </div>

                {/* Email */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={labelStyle}>Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={14} color="rgba(255,255,255,0.25)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                      type="email"
                      placeholder="name@railnexus.in"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      style={inputStyle}
                      onFocus={focusStyle}
                      onBlur={blurStyle}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={labelStyle}>Mobile Number</label>
                  <div style={{ position: 'relative' }}>
                    <Phone size={14} color="rgba(255,255,255,0.25)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                      type="tel"
                      placeholder="9876543210"
                      required
                      maxLength={10}
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      style={inputStyle}
                      onFocus={focusStyle}
                      onBlur={blurStyle}
                    />
                  </div>
                </div>

                {/* Password */}
                <div style={{ marginBottom: '14px' }}>
                  <label style={labelStyle}>Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={14} color="rgba(255,255,255,0.25)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                    <input
                      type="password"
                      placeholder="••••••••"
                      required
                      minLength={6}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      style={inputStyle}
                      onFocus={focusStyle}
                      onBlur={blurStyle}
                    />
                  </div>
                </div>

                {/* Division */}
                <div style={{ marginBottom: '22px' }}>
                  <label style={labelStyle}>Division</label>
                  <div style={{ position: 'relative' }}>
                    <Briefcase size={14} color="rgba(255,255,255,0.25)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', zIndex: 10 }} />
                    <select
                      value={division}
                      onChange={e => setDivision(e.target.value)}
                      style={selectStyle}
                      onFocus={focusStyle}
                      onBlur={blurStyle}
                    >
                      {divisions.map(div => (
                        <option key={div._id} value={div._id} style={{ background: '#11131e', color: '#fff' }}>
                          {div.name} ({div.code})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {error && (
                  <div style={{ marginBottom: '16px', padding: '10px 14px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: '10px', color: '#fca5a5', fontSize: '0.8rem', textAlign: 'center' }}>
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  style={{ ...btnStyle, opacity: loading ? 0.7 : 1 }}
                  disabled={loading}
                >
                  <Send size={15} /> {loading ? 'Submitting...' : 'Submit Request'}
                </button>
              </form>

              <div style={{ textAlign: 'center', marginTop: '20px' }}>
                <Link href="/login" style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.45)', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                  <ArrowLeft size={13} /> Back to Login
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="request-success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
              style={{ textAlign: 'center', padding: '20px 10px' }}
            >
              <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <CheckCircle size={32} color="#34d399" />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', marginBottom: '8px' }}>Request Submitted!</h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', lineHeight: '1.6', marginBottom: '24px' }}>
                Thank you! Your access request has been successfully recorded. An administrator will review your application and configure your profile. You will be able to log in once approved.
              </p>
              <Link href="/login" style={{ ...btnStyle, textDecoration: 'none' }}>
                <ArrowLeft size={16} /> Return to Login
              </Link>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      <div style={{ position: 'absolute', bottom: '18px', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
        <p style={{ color: 'rgba(255,255,255,0.18)', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
          © 2026 RailNexus Systems · Industrial-grade maintenance
        </p>
      </div>
    </main>
  );
}
