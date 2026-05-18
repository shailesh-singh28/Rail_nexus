'use client';
import React, { useState, useEffect } from 'react';
import { MapPin, ArrowRight } from 'lucide-react';
import useAppStore from '@/store/useAppStore';
import api from '@/lib/api';

const LocationSelector = ({ demoData = null }) => {
  const {
    divisionId, setDivision,
    majorSectionId, setMajorSection,
    sectionId, setSection,
    confirmLocation
  } = useAppStore();

  const [divisions, setDivisions] = useState([]);
  const [majorSections, setMajorSections] = useState([]);
  const [sections, setSections] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDivisions();
  }, []);

  useEffect(() => {
    if (divisionId) fetchMajorSections(divisionId);
    else { setMajorSections([]); setSections([]); }
  }, [divisionId]);

  useEffect(() => {
    if (majorSectionId) fetchSections(majorSectionId);
    else setSections([]);
  }, [majorSectionId]);

  const fetchDivisions = async () => {
    if (demoData) { setDivisions(demoData.divisions); return; }
    try {
      const res = await api.get('/divisions');
      setDivisions(res.data);
      setError('');
    } catch (err) {
      if (err.friendlyMessage) {
        setError('Server offline — using demo data.');
        setDivisions([]); // demo mode is handled at page level
      } else {
        setError('Failed to load divisions. Please refresh.');
      }
    }
  };

  const fetchMajorSections = async (id) => {
    if (demoData) { setMajorSections(demoData.majorSections[id] || []); return; }
    try {
      const res = await api.get(`/major-sections/${id}`);
      setMajorSections(res.data);
    } catch (err) {
      if (err.friendlyMessage) setMajorSections([]);
      else setError('Failed to load major sections.');
    }
  };

  const fetchSections = async (id) => {
    if (demoData) { setSections(demoData.sections[id] || []); return; }
    try {
      const res = await api.get(`/sections/${id}`);
      setSections(res.data);
    } catch (err) {
      if (err.friendlyMessage) setSections([]);
      else setError('Failed to load sections.');
    }
  };

  const handleDivisionChange = (e) => {
    const id = e.target.value;
    const name = divisions.find(d => d._id === id)?.name || null;
    setDivision(id || null, name);
  };

  const handleMajorSectionChange = (e) => {
    const id = e.target.value;
    const name = majorSections.find(m => m._id === id)?.name || null;
    setMajorSection(id || null, name);
  };

  const handleSectionChange = (e) => {
    const id = e.target.value;
    const name = sections.find(s => s._id === id)?.name || null;
    setSection(id || null, name);
  };

  return (
    <div className="location-card">
      {/* Division */}
      <div className="location-field">
        <MapPin size={16} color="var(--primary)" />
        <select className="input-select" value={divisionId || ''} onChange={handleDivisionChange}>
          <option value="">Select Division</option>
          {divisions.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
        </select>
      </div>

      {/* Major Section */}
      <div className="location-field">
        <select className="input-select" value={majorSectionId || ''} onChange={handleMajorSectionChange} disabled={!divisionId}>
          <option value="">Major Section</option>
          {majorSections.map(m => <option key={m._id} value={m._id}>{m.name}</option>)}
        </select>
      </div>

      {/* Section */}
      <div className="location-field" style={{ borderRight: 'none' }}>
        <select className="input-select" value={sectionId || ''} onChange={handleSectionChange} disabled={!majorSectionId}>
          <option value="">Section</option>
          {sections.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
        </select>
      </div>

      <button
        className="btn-gradient"
        style={{ borderRadius: '16px', marginLeft: '8px', cursor: sectionId ? 'pointer' : 'not-allowed' }}
        disabled={!sectionId}
        onClick={confirmLocation}
      >
        Get started <ArrowRight size={18} style={{ marginLeft: '8px' }} />
      </button>

      {error && (
        <p style={{ color: '#fca5a5', fontSize: '0.78rem', marginTop: '8px', width: '100%', textAlign: 'center' }}>
          {error}
        </p>
      )}

      <style>{`
        .input-select {
          background: transparent;
          border: none;
          color: #fff;
          font-size: 0.95rem;
          font-weight: 500;
          outline: none;
          cursor: pointer;
          padding: 8px 0;
          min-width: 140px;
        }
        .input-select option {
          background: #0b0c14;
          color: #fff;
        }
        @media (max-width: 768px) {
          .input-select { width: 100%; }
        }
      `}</style>
    </div>
  );
};

export default LocationSelector;
