'use client';
import { useEffect } from 'react';

const DevToolHider = () => {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    const hide = () => {
      const portals = document.querySelectorAll('nextjs-portal');
      portals.forEach(p => {
        if (p.style.display !== 'none') {
          p.style.display = 'none';
          p.style.visibility = 'hidden';
        }
      });
    };

    hide();
    const interval = setInterval(hide, 100);
    return () => clearInterval(interval);
  }, []);

  return null;
};

export default DevToolHider;
