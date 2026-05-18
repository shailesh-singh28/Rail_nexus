'use client';
import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const CardGrid = ({ items, onSelect, selectedId, title }) => {
  return (
    <div style={{ padding: '60px 0' }}>
      <h3 style={{
        fontSize: '1.75rem',
        fontWeight: 700,
        marginBottom: '32px',
        textAlign: 'center',
        background: 'linear-gradient(90deg, #fff 0%, rgba(255,255,255,0.5) 100%)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent'
      }}>{title}</h3>
      <div className="grid grid-cols-4 gap-4">
        {items.map((item, index) => {
          const borderColors = ['#10b981', '#f97316', '#8b5cf6', '#ec4899', '#3b82f6'];
          const borderColor = borderColors[index % borderColors.length];

          return (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.05 }}
              className="card"
              onClick={() => onSelect(item._id)}
              style={{
                cursor: 'pointer',
                background: 'rgba(255,255,255,0.03)',
                border: selectedId === item._id ? `1px solid ${borderColor}` : '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '24px',
                borderRadius: '20px',
                backdropFilter: 'blur(10px)',
                position: 'relative',
                overflow: 'hidden'
              }}
              whileHover={{ scale: 1.02, background: 'rgba(255,255,255,0.05)' }}
            >
              {/* Top Accent Border */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '4px',
                background: borderColor,
                boxShadow: `0 2px 10px ${borderColor}44`
              }} />

              <div style={{ position: 'relative', zIndex: 1 }}>
                <h4 style={{ fontSize: '1.25rem', fontWeight: 600, color: '#fff' }}>{item.name}</h4>
              </div>

              <div style={{
                background: selectedId === item._id ? borderColor : 'rgba(255,255,255,0.05)',
                padding: '10px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: selectedId === item._id ? `0 0 20px ${borderColor}44` : 'none',
                position: 'relative',
                zIndex: 1
              }}>
                <ChevronRight size={20} color={selectedId === item._id ? 'white' : 'var(--text-muted)'} />
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default CardGrid;
