'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Menu, X, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import useAppStore from '@/store/useAppStore';

const Navbar = ({ logoOnly = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { isLoggedIn, logout } = useAppStore();

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    // The home page useEffect guard will redirect to /login automatically
  };

  const navLinkStyle = {
    color: '#ffffff',
    fontSize: '0.9rem',
    fontWeight: 500,
    textDecoration: 'none',
    opacity: 0.8,
    transition: 'opacity 0.2s'
  };

  return (
    <nav className="navbar">
      <div className="container navbar-container">
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' }}>
          <div style={{ 
            width: '40px', 
            height: '40px', 
            borderRadius: '10px', 
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.1)',
            background: 'rgba(255,255,255,0.05)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <img src="/logo.png" alt="RailNexus" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', letterSpacing: '-0.5px' }}>RailNexus</h1>
        </Link>

        {/* Hide everything except logo when logoOnly */}
        {!logoOnly && (
          <>
            {/* Desktop Links */}
            <div className="nav-links">
              <Link href="#" style={navLinkStyle}>Dashboard</Link>
              <Link href="#" style={navLinkStyle}>Reports</Link>
              <Link href="#" style={navLinkStyle}>Settings</Link>
            </div>

            {/* Desktop Actions */}
            <div className="nav-actions hide-mobile">
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  style={{ color: '#fff', fontWeight: 600, background: 'transparent', fontSize: '0.9rem', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <LogOut size={16} /> Log out
                </button>
              ) : (
                <>
                  <Link href="/login" style={{ color: '#fff', fontWeight: 600, background: 'transparent', fontSize: '0.9rem', textDecoration: 'none' }}>Log in</Link>
                  <button className="btn-gradient" style={{ padding: '10px 20px', borderRadius: '10px' }}>Get started</button>
                </>
              )}
            </div>

            <button 
              className="mobile-toggle"
              onClick={() => setIsOpen(!isOpen)}
              style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', zIndex: 1001 }}
            >
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </>
        )}
      </div>

      {/* Mobile Menu Overlay — only when not logoOnly */}
      {!logoOnly && (
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                position: 'fixed', top: 0, left: 0,
                width: '100%', height: '100vh',
                background: 'rgba(11, 12, 20, 0.98)',
                backdropFilter: 'blur(10px)', zIndex: 1000,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: '32px', padding: '24px'
              }}
            >
              <div style={{ width: '80px', height: '80px', borderRadius: '20px', overflow: 'hidden', marginBottom: '20px' }}>
                <img src="/logo.png" alt="RailNexus" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
              <Link href="#" onClick={() => setIsOpen(false)} style={{ fontSize: '1.5rem', color: '#fff', fontWeight: 600, textDecoration: 'none' }}>Dashboard</Link>
              <Link href="#" onClick={() => setIsOpen(false)} style={{ fontSize: '1.5rem', color: '#fff', fontWeight: 600, textDecoration: 'none' }}>Reports</Link>
              <Link href="#" onClick={() => setIsOpen(false)} style={{ fontSize: '1.5rem', color: '#fff', fontWeight: 600, textDecoration: 'none' }}>Settings</Link>
              <div style={{ height: '1px', width: '60px', background: 'rgba(255,255,255,0.1)' }} />
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <LogOut size={20} /> Log out
                </button>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsOpen(false)} style={{ fontSize: '1.25rem', color: '#fff', fontWeight: 500, textDecoration: 'none' }}>Log in</Link>
                  <button className="btn-gradient" style={{ width: '200px', padding: '16px', borderRadius: '12px' }} onClick={() => setIsOpen(false)}>
                    Get started
                  </button>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </nav>
  );
};

export default Navbar;
