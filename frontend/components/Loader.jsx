import React from 'react';

const Loader = () => {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '40px',
      gap: '10px'
    }}>
      {[0, 1, 2].map(i => (
        <div key={i} style={{
          width: '12px',
          height: '12px',
          background: 'var(--primary)',
          borderRadius: '50%',
          animation: 'bounce 0.6s infinite alternate',
          animationDelay: `${i * 0.2}s`
        }} />
      ))}
      <style>{`
        @keyframes bounce {
          from { transform: translateY(0); }
          to { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
};

export default Loader;
