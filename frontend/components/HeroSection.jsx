'use client';
import React from 'react';
import { motion } from 'framer-motion';

const HeroSection = ({ children }) => {
  return (
    <div className="hero-section">
      {/* Cinematic Background Image Fallback */}
      <motion.div 
        initial={{ scale: 1.1, opacity: 0 }}
        animate={{ scale: 1, opacity: 0.3 }}
        transition={{ duration: 2, ease: "easeOut" }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0
        }}
      >
        <img 
          src="/monitoring.png" 
          alt="Railway Network" 
          style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
        />
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: 'linear-gradient(to bottom, rgba(11, 12, 20, 0.95) 0%, rgba(11, 12, 20, 0.6) 50%, rgba(11, 12, 20, 0.95) 100%)'
        }} />
      </motion.div>

      {/* Animated Signal Flow Lines */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}>
        <svg width="100%" height="100%" style={{ opacity: 0.15 }}>
          {[...Array(5)].map((_, i) => (
            <motion.path
              key={i}
              d={`M ${-100} ${200 + i * 150} Q ${400} ${100 + i * 100}, ${800} ${300 + i * 50} T ${1600} ${200 + i * 120}`}
              stroke={i % 2 === 0 ? '#f472b6' : '#6366f1'}
              strokeWidth="2"
              fill="none"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: [0, 1, 1],
                pathOffset: [0, 0, 1],
                opacity: [0, 0.5, 0]
              }}
              transition={{ 
                duration: 5 + i, 
                repeat: Infinity, 
                ease: "linear",
                delay: i * 1
              }}
            />
          ))}
        </svg>
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 10, textAlign: 'center' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
        >
          <h2 className="hero-title">
            The all-in-one maintenance <br className="hidden-mobile" />
            platform for <span style={{ 
              background: 'linear-gradient(90deg, #f472b6 0%, #fb7185 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 20px rgba(244, 114, 182, 0.3))'
            }}>railways</span>
          </h2>
          <p className="hero-subtitle">
            Digitalizing railway telecommunication assets monitoring and reporting — all under one unified, industrial-grade dashboard.
          </p>
          
          <div style={{ marginBottom: '40px' }}>
            {children}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeroSection;
