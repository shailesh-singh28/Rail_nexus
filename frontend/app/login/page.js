'use client';
import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, ArrowRight, Phone, ShieldCheck, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import useAppStore from '@/store/useAppStore';
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
  width: '100%', height: '46px',
  background: 'linear-gradient(90deg, #6366f1 0%, #8b5cf6 100%)',
  border: 'none', borderRadius: '12px',
  color: '#fff', fontSize: '0.9rem', fontWeight: 700,
  cursor: 'pointer', display: 'flex', alignItems: 'center',
  justifyContent: 'center', gap: '8px',
  boxShadow: '0 4px 20px rgba(99,102,241,0.35)',
  letterSpacing: '0.2px',
  transition: 'opacity 0.2s',
};

const Tab = ({ active, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    style={{
      flex: 1, padding: '8px 0',
      background: active ? 'rgba(99,102,241,0.2)' : 'transparent',
      border: active ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
      borderRadius: '10px',
      color: active ? '#fff' : 'rgba(255,255,255,0.4)',
      fontSize: '0.82rem', fontWeight: 600,
      cursor: 'pointer', transition: 'all 0.2s',
      letterSpacing: '0.3px',
    }}
  >
    {children}
  </button>
);

const OtpInput = ({ otp, setOtp }) => {
  const refs = useRef([]);

  const handleChange = (val, idx) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[idx] = val;
    setOtp(next);
    if (val && idx < 5) refs.current[idx + 1]?.focus();
  };

  const handleKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
      refs.current[idx - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      refs.current[5]?.focus();
    }
    e.preventDefault();
  };

  return (
    <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
      {otp.map((digit, idx) => (
        <input
          key={idx}
          ref={el => refs.current[idx] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={e => handleChange(e.target.value, idx)}
          onKeyDown={e => handleKeyDown(e, idx)}
          onPaste={handlePaste}
          style={{
            width: '44px', height: '52px',
            textAlign: 'center', fontSize: '1.3rem', fontWeight: 700,
            background: digit ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)',
            border: digit ? '1px solid rgba(99,102,241,0.5)' : '1px solid rgba(255,255,255,0.1)',
            borderRadius: '12px', color: '#fff', outline: 'none',
            transition: 'all 0.15s',
          }}
          onFocus={e => { e.target.style.borderColor = 'rgba(99,102,241,0.7)'; e.target.style.background = 'rgba(99,102,241,0.12)'; }}
          onBlur={e => {
            e.target.style.borderColor = digit ? 'rgba(99,102,241,0.5)' : 'rgba(255,255,255,0.1)';
            e.target.style.background = digit ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.05)';
          }}
        />
      ))}
    </div>
  );
};

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoggedIn } = useAppStore();

  const [tab, setTab] = useState('password');

  // password form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const passwordRef = useRef(null);

  const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  // otp form
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [countdown, setCountdown] = useState(0);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [serverOffline, setServerOffline] = useState(false);

  useEffect(() => {
    if (isLoggedIn) router.replace('/');
  }, [isLoggedIn, router]);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setTimeout(() => setCountdown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [countdown]);

  const switchTab = (t) => {
    setTab(t);
    setError('');
    setSuccess('');
    setServerOffline(false);
    setOtpSent(false);
    setOtp(['', '', '', '', '', '']);
    setCountdown(0);
  };

  // ── Password login ──
  const handlePasswordLogin = async (e) => {
    e.preventDefault();
    setError('');
    setServerOffline(false);
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });
      login(res.data.user, res.data.token);
      router.replace('/');
    } catch (err) {
      if (err.friendlyMessage) {
        setServerOffline(true);
      } else {
        setError(err.response?.data?.error || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Demo login (no server needed) ──
  const handleDemoLogin = () => {
    login(
      { name: 'Demo User', email: 'demo@railnexus.in', role: 'engineer' },
      'demo-token'
    );
    router.replace('/');
  };

  // ── Send OTP ──
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError('');
    setServerOffline(false);
    const cleaned = phone.replace(/\D/g, '');
    if (cleaned.length < 10) {
      setError('Enter a valid 10-digit mobile number.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/send-otp', { phone: cleaned });
      setOtpSent(true);
      setCountdown(30);
      setSuccess(res.data.message || `OTP sent to +91 ${cleaned.slice(-10)}`);
      if (res.data.otp) {
        setOtp(res.data.otp.split(''));
        setSuccess(`${res.data.message} (dev: ${res.data.otp})`);
      }
      setTimeout(() => setSuccess(''), 5000);
    } catch (err) {
      if (err.friendlyMessage) {
        setServerOffline(true);
      } else {
        setError(err.response?.data?.error || 'Failed to send OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // ── Verify OTP ──
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError('');
    setServerOffline(false);
    const code = otp.join('');
    if (code.length < 6) {
      setError('Please enter the complete 6-digit OTP.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/auth/verify-otp', { phone, otp: code });
      login(res.data.user, res.data.token);
      router.replace('/');
    } catch (err) {
      if (err.friendlyMessage) {
        setServerOffline(true);
      } else {
        setError(err.response?.data?.error || 'OTP verification failed. Please try again.');
      }
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
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(7,8,14,0.83) 0%, rgba(11,12,20,0.76) 50%, rgba(7,8,14,0.89) 100%)', backdropFilter: 'blur(2px)' }} />
      </div>
      <div style={{ position: 'absolute', inset: 0, zIndex: 1, opacity: 0.04, backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)', backgroundSize: '40px 40px' }} />
      <div style={{ position: 'absolute', top: '20%', left: '15%', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(99,102,241,0.12)', filter: 'blur(80px)', zIndex: 1 }} />
      <div style={{ position: 'absolute', bottom: '20%', right: '15%', width: '250px', height: '250px', borderRadius: '50%', background: 'rgba(244,114,182,0.08)', filter: 'blur(80px)', zIndex: 1 }} />

      {/* Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{
          position: 'relative', zIndex: 10,
          width: '100%', maxWidth: '400px',
          margin: '0 24px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '24px',
          padding: '36px 32px',
          backdropFilter: 'blur(32px)',
          boxShadow: '0 32px 64px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.06)',
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ width: '46px', height: '46px', borderRadius: '13px', overflow: 'hidden', margin: '0 auto 14px', border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.05)', boxShadow: '0 4px 16px rgba(0,0,0,0.3)' }}>
            <img src="/logo.png" alt="RailNexus" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: '0.68rem', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '6px' }}>RailNexus</p>
          <h1 style={{ fontSize: '1.55rem', fontWeight: 800, color: '#fff', marginBottom: '4px', letterSpacing: '-0.3px' }}>Welcome back</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.82rem' }}>Sign in to access the maintenance dashboard</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '22px', background: 'rgba(255,255,255,0.03)', padding: '4px', borderRadius: '13px', border: '1px solid rgba(255,255,255,0.07)' }}>
          <Tab active={tab === 'password'} onClick={() => switchTab('password')}>Email & Password</Tab>
          <Tab active={tab === 'otp'} onClick={() => switchTab('otp')}>Mobile OTP</Tab>
        </div>

        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginBottom: '20px' }} />

        {/* ── Password Form ── */}
        <AnimatePresence mode="wait">
          {tab === 'password' && (
            <motion.form
              key="password"
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 12 }}
              transition={{ duration: 0.2 }}
              onSubmit={handlePasswordLogin}
            >
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>Email Address</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={14} color="rgba(255,255,255,0.25)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input
                    type="email"
                    placeholder="name@company.com"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    style={inputStyle}
                    onFocus={focusStyle}
                    onBlur={e => {
                      blurStyle(e);
                      if (isValidEmail(email)) passwordRef.current?.focus();
                    }}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (isValidEmail(email)) passwordRef.current?.focus();
                      }
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                  <label style={{ ...labelStyle, marginBottom: 0 }}>Password</label>
                  <Link href="#" style={{ fontSize: '0.73rem', color: 'rgba(99,102,241,0.9)', textDecoration: 'none', fontWeight: 500 }}>Forgot password?</Link>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={14} color="rgba(255,255,255,0.25)" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input
                    type="password"
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    ref={passwordRef}
                    style={inputStyle}
                    onFocus={focusStyle}
                    onBlur={blurStyle}
                  />
                </div>
              </div>

              <button
                type="submit"
                style={{ ...btnStyle, opacity: loading ? 0.7 : 1 }}
                disabled={loading}
              >
                {loading ? 'Signing in...' : <><span>Sign In</span> <ArrowRight size={16} /></>}
              </button>
            </motion.form>
          )}

          {/* ── OTP Form ── */}
          {tab === 'otp' && (
            <motion.div
              key="otp"
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -12 }}
              transition={{ duration: 0.2 }}
            >
              {!otpSent ? (
                <form onSubmit={handleSendOtp}>
                  <div style={{ marginBottom: '20px' }}>
                    <label style={labelStyle}>Mobile Number</label>
                    <div style={{ position: 'relative' }}>
                      <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.5)', fontSize: '0.85rem', fontWeight: 600, pointerEvents: 'none', userSelect: 'none' }}>+91</span>
                      <input
                        type="tel"
                        placeholder="98765 43210"
                        required
                        value={phone}
                        onChange={e => setPhone(e.target.value)}
                        maxLength={10}
                        style={{ ...inputStyle, paddingLeft: '48px' }}
                        onFocus={focusStyle}
                        onBlur={blurStyle}
                      />
                    </div>
                    <p style={{ marginTop: '6px', fontSize: '0.72rem', color: 'rgba(255,255,255,0.3)' }}>We'll send a 6-digit OTP to this number</p>
                  </div>

                  <button
                    type="submit"
                    style={{ ...btnStyle, opacity: loading ? 0.7 : 1 }}
                    disabled={loading}
                  >
                    <Phone size={15} /> {loading ? 'Sending...' : 'Send OTP'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleVerifyOtp}>
                  <div style={{ textAlign: 'center', marginBottom: '18px' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                      <ShieldCheck size={18} color="#818cf8" />
                    </div>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.82rem' }}>
                      OTP sent to <span style={{ color: '#fff', fontWeight: 600 }}>+91 {phone.slice(-10)}</span>
                    </p>
                    <button type="button" onClick={() => { setOtpSent(false); setOtp(['','','','','','']); setError(''); }} style={{ background: 'none', border: 'none', color: 'rgba(99,102,241,0.8)', fontSize: '0.75rem', cursor: 'pointer', marginTop: '4px' }}>
                      Change number
                    </button>
                  </div>

                  <div style={{ marginBottom: '20px' }}>
                    <label style={{ ...labelStyle, textAlign: 'center', display: 'block', marginBottom: '12px' }}>Enter 6-digit OTP</label>
                    <OtpInput otp={otp} setOtp={setOtp} />
                  </div>

                  <button
                    type="submit"
                    style={{ ...btnStyle, marginBottom: '14px', opacity: loading ? 0.7 : 1 }}
                    disabled={loading}
                  >
                    <ShieldCheck size={16} /> {loading ? 'Verifying...' : 'Verify & Sign In'}
                  </button>

                  <div style={{ textAlign: 'center' }}>
                    {countdown > 0 ? (
                      <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.78rem' }}>
                        Resend OTP in <span style={{ color: '#818cf8', fontWeight: 600 }}>{countdown}s</span>
                      </p>
                    ) : (
                      <button type="button" onClick={handleSendOtp} disabled={loading} style={{ background: 'none', border: 'none', color: 'rgba(99,102,241,0.85)', fontSize: '0.78rem', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: 600 }}>
                        <RefreshCw size={12} /> Resend OTP
                      </button>
                    )}
                  </div>
                </form>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error / Success */}
        <AnimatePresence>
          {error && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.25)', borderRadius: '10px', color: '#fca5a5', fontSize: '0.8rem', textAlign: 'center' }}>
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ marginTop: '12px', padding: '10px 14px', background: 'rgba(52,211,153,0.1)', border: '1px solid rgba(52,211,153,0.25)', borderRadius: '10px', color: '#6ee7b7', fontSize: '0.8rem', textAlign: 'center' }}>
              {success}
            </motion.div>
          )}
          {serverOffline && (
            <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              style={{ marginTop: '12px', padding: '14px 16px', background: 'rgba(251,191,36,0.08)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '10px', fontSize: '0.78rem' }}>
              <p style={{ color: '#fcd34d', fontWeight: 700, marginBottom: '6px' }}>⚠ Backend server is offline</p>
              <p style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.5, marginBottom: '10px' }}>
                Start the server first:<br />
                <code style={{ color: '#fcd34d', fontSize: '0.75rem' }}>cd server &amp;&amp; npm run dev</code><br />
                Then run the seed:<br />
                <code style={{ color: '#fcd34d', fontSize: '0.75rem' }}>npm run seed</code>
              </p>
              <button
                onClick={handleDemoLogin}
                style={{
                  width: '100%', padding: '9px', borderRadius: '8px',
                  background: 'rgba(251,191,36,0.15)', border: '1px solid rgba(251,191,36,0.4)',
                  color: '#fcd34d', fontSize: '0.8rem', fontWeight: 700, cursor: 'pointer'
                }}
              >
                Continue in Demo Mode →
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <p style={{ textAlign: 'center', marginTop: '20px', color: 'rgba(255,255,255,0.28)', fontSize: '0.76rem' }}>
          Need access?{' '}
          <Link href="#" style={{ color: 'rgba(255,255,255,0.65)', fontWeight: 600, textDecoration: 'none' }}>Contact Administrator</Link>
        </p>
      </motion.div>

      <div style={{ position: 'absolute', bottom: '18px', left: '50%', transform: 'translateX(-50%)', zIndex: 10 }}>
        <p style={{ color: 'rgba(255,255,255,0.18)', fontSize: '0.7rem', letterSpacing: '1px', textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
          © 2026 RailNexus Systems · Industrial-grade maintenance
        </p>
      </div>
    </main>
  );
}
