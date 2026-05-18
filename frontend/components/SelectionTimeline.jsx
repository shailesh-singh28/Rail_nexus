'use client';
import React from 'react';
import { motion } from 'framer-motion';

const SelectionTimeline = ({ currentStep }) => {
  const steps = [
    { id: 'start', title: 'Start', desc: 'Initialize workflow' },
    { id: 'select', title: 'Select', desc: 'Define location' },
    { id: 'analyze', title: 'Analyze', desc: 'Choose tests' },
    { id: 'report', title: 'Report', desc: 'Submit data' },
  ];

  // Shifted more towards the bottom
  const positions = [
    { left: '8%', bottom: '5%' },
    { left: '33%', bottom: '15%' },
    { left: '60%', bottom: '25%' },
    { left: '88%', bottom: '45%' },
  ];

  return (
    <div className="path-container" style={{ height: '300px', bottom: '0' }}>
      <svg width="100%" height="100%" viewBox="0 0 1440 300" preserveAspectRatio="none">
        <defs>
          <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="50%" stopColor="#818cf8" />
            <stop offset="100%" stopColor="#fb7185" />
          </linearGradient>
        </defs>
        <path 
          className="curved-path" 
          d="M0,280 C400,280 800,200 1200,100 C1320,50 1440,0 1440,0" 
          strokeWidth="3"
        />
      </svg>

      {steps.map((step, index) => (
        <motion.div 
          key={step.id}
          className="step-marker"
          style={{ 
            left: positions[index].left, 
            bottom: positions[index].bottom,
          }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.15 }}
        >
          <div className="marker-dot" style={{ 
            background: index <= currentStep ? '#fff' : 'rgba(255,255,255,0.1)',
            boxShadow: index <= currentStep ? '0 0 25px #fff, 0 0 50px rgba(255,255,255,0.3)' : 'none',
            border: index <= currentStep ? 'none' : '1px solid rgba(255,255,255,0.2)'
          }} />
          <h4 className="step-title" style={{ 
            color: index <= currentStep ? '#fff' : 'rgba(255,255,255,0.2)',
            fontSize: '1.25rem'
          }}>{step.title}</h4>
          <p className="step-desc" style={{ 
            color: index <= currentStep ? 'var(--text-muted)' : 'rgba(255,255,255,0.1)',
            fontSize: '0.8rem'
          }}>{step.desc}</p>
        </motion.div>
      ))}
    </div>
  );
};

export default SelectionTimeline;
