'use client';
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, RotateCcw } from 'lucide-react';

const SelectionPath = ({ items }) => {
  if (!items || items.length === 0) return null;

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      flexWrap: 'wrap', 
      gap: '12px',
      background: 'rgba(255,255,255,0.03)',
      padding: '16px 24px',
      borderRadius: '24px',
      border: '1px solid rgba(255,255,255,0.1)',
      backdropFilter: 'blur(20px)',
      marginBottom: '60px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.2)'
    }}>
      <AnimatePresence mode="popLayout">
        {items.map((item, index) => (
          <React.Fragment key={item.label + item.value}>
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
            >
              <div 
                onClick={item.onReset}
                style={{ 
                  cursor: 'pointer',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.05)',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)';
                }}
              >
                <span style={{ 
                  fontSize: '0.65rem', 
                  textTransform: 'uppercase', 
                  letterSpacing: '1px', 
                  color: 'var(--text-muted)',
                  fontWeight: 600
                }}>
                  {item.label}
                </span>
                <span style={{ 
                  fontSize: '0.95rem', 
                  color: '#fff', 
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}>
                  {item.value}
                </span>
              </div>
            </motion.div>

            {index < items.length - 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{ color: 'rgba(255,255,255,0.2)' }}
              >
                <ChevronRight size={18} />
              </motion.div>
            )}
          </React.Fragment>
        ))}
      </AnimatePresence>
      
      <motion.button
        whileHover={{ rotate: -180 }}
        onClick={() => items[0].onReset()}
        style={{
          marginLeft: 'auto',
          background: 'rgba(255,255,255,0.05)',
          border: 'none',
          color: 'var(--text-muted)',
          width: '36px',
          height: '36px',
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer'
        }}
        title="Reset All"
      >
        <RotateCcw size={16} />
      </motion.button>
    </div>
  );
};

export default SelectionPath;
