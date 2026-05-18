'use client';
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, CheckCircle2 } from 'lucide-react';

const DynamicForm = ({ schema, onSubmit }) => {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  if (!schema || !schema.fields) return <p>No form configuration found.</p>;

  const handleChange = (name, value) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setSubmitted(true);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="container" style={{ textAlign: 'center', padding: '100px 24px' }}>
        <CheckCircle2 size={80} color="var(--primary)" style={{ marginBottom: '24px' }} />
        <h2 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '16px' }}>Report Submitted!</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem' }}>The maintenance data has been successfully recorded in the RailNexus system.</p>
        <button 
          className="btn-gradient" 
          style={{ marginTop: '40px', padding: '16px 40px' }}
          onClick={() => window.location.reload()}
        >
          Submit Another Report
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBottom: '100px' }}>
      <motion.form 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        style={{ 
          maxWidth: '800px', 
          margin: '0 auto',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--border)',
          borderRadius: '32px',
          padding: '40px',
          backdropFilter: 'blur(10px)'
        }}
        className="form-card"
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }} className="form-grid">
          {schema.fields.map((field) => (
            <div key={field.label}>
              <label className="label">{field.label}</label>
              {field.type === 'select' ? (
                <select 
                  className="input" 
                  required={field.required}
                  onChange={(e) => handleChange(field.label, e.target.value)}
                >
                  <option value="">Select Option</option>
                  {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : (
                <input 
                  type={field.type} 
                  className="input" 
                  placeholder={`Enter ${field.label}`}
                  required={field.required}
                  onChange={(e) => handleChange(field.label, e.target.value)}
                />
              )}
            </div>
          ))}
        </div>

        <div style={{ marginTop: '48px', borderTop: '1px solid var(--border)', paddingTop: '40px' }}>
          <button 
            type="submit" 
            className="btn-gradient" 
            disabled={isSubmitting}
            style={{ width: '100%', height: '60px', fontSize: '1.1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px' }}
          >
            {isSubmitting ? 'Processing...' : 'Complete Report'} <Send size={20} />
          </button>
        </div>
      </motion.form>

      <style jsx>{`
        @media (min-width: 640px) {
          .form-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 640px) {
          .form-card {
            padding: 24px !important;
            border-radius: 24px !important;
          }
        }
      `}</style>
    </div>
  );
};

export default DynamicForm;
