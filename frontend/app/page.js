'use client';
import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import LocationSelector from '@/components/LocationSelector';
import CardGrid from '@/components/CardGrid';
import DynamicForm from '@/components/DynamicForm';
import Loader from '@/components/Loader';
import useAppStore from '@/store/useAppStore';
import SelectionPath from '@/components/SelectionPath';
import api from '@/lib/api';

// ── Demo data used when server is offline ─────────────────
const DEMO = {
  divisions: [
    { _id: 'div1', name: 'Bilaspur' },
    { _id: 'div2', name: 'Raipur' },
    { _id: 'div3', name: 'Nagpur' }
  ],
  majorSections: {
    div1: [
      { _id: 'ms1', name: '(RIG-JSG) RAIGARH-JHARSUGUDA' },
      { _id: 'ms2', name: '(CHAMP-RIG) CHAMPA-RAIGARH' },
      { _id: 'ms3', name: '(BSP-USL) BILASPUR-USLAPUR' }
    ],
    div2: [{ _id: 'ms4', name: '(R-BSP) RAIPUR-BILASPUR' }],
    div3: [{ _id: 'ms5', name: '(NGP-WR) NAGPUR-WARDHA' }]
  },
  sections: {
    ms1: [{ _id: 's1', name: 'DAO-HGR' }, { _id: 's2', name: 'KRL-JMG' }],
    ms2: [{ _id: 's3', name: 'CHAMP-KRL' }],
    ms3: [{ _id: 's4', name: 'BSP-USL' }],
    ms4: [{ _id: 's5', name: 'R-TILD' }],
    ms5: [{ _id: 's6', name: 'NGP-WR' }]
  },
  mainCategories: [
    { _id: 'mc1', name: 'Telecom Gear' },
    { _id: 'mc2', name: 'Signaling Gear' },
    { _id: 'mc3', name: 'Power Supply Gear' }
  ],
  categories: {
    mc1: [{ _id: 'cat1', name: 'Cable' }, { _id: 'cat2', name: 'Radio' }, { _id: 'cat3', name: 'Exchange' }],
    mc2: [{ _id: 'cat4', name: 'Signals' }, { _id: 'cat5', name: 'Point Machines' }],
    mc3: [{ _id: 'cat6', name: 'IPS' }, { _id: 'cat7', name: 'Battery' }]
  },
  subCategories: {
    cat1: [{ _id: 'sub1', name: '6 Quad' }, { _id: 'sub2', name: 'OFC' }],
    cat2: [{ _id: 'sub3', name: 'VHF Set' }, { _id: 'sub4', name: 'Microwave Link' }],
    cat4: [{ _id: 'sub5', name: 'Colour Light Signal' }],
    cat6: [{ _id: 'sub6', name: 'IPS Unit' }],
    cat7: [{ _id: 'sub7', name: 'VRLA Battery' }]
  },
  testTypes: {
    sub1: [{ _id: 'tt1', name: 'Testing' }, { _id: 'tt2', name: 'Joint' }, { _id: 'tt3', name: 'Earthing' }],
    sub2: [{ _id: 'tt4', name: 'OTDR Test' }],
    sub3: [{ _id: 'tt5', name: 'Power Test' }],
    sub6: [{ _id: 'tt6', name: 'Voltage Test' }],
    sub7: [{ _id: 'tt7', name: 'Capacity Test' }]
  },
  parameters: {
    tt1: [{ _id: 'p1', name: 'Loop Resistance' }, { _id: 'p2', name: 'Meggering' }, { _id: 'p3', name: 'TMS' }, { _id: 'p4', name: 'NEXT-FEXT' }],
    tt2: [{ _id: 'p5', name: 'Joint Resistance' }],
    tt3: [{ _id: 'p6', name: 'Earth Value' }],
    tt4: [{ _id: 'p7', name: 'OTDR Loss' }],
    tt5: [{ _id: 'p8', name: 'TX Power' }],
    tt6: [{ _id: 'p9', name: 'Output Voltage' }],
    tt7: [{ _id: 'p10', name: 'Battery Capacity' }]
  },
  formSchemas: {
    p1: { fields: [{ label: 'Loop Value', type: 'number', required: true }, { label: 'Tolerance', type: 'number', required: true }, { label: 'Test Status', type: 'select', options: ['Pass', 'Fail'], required: true }, { label: 'Remarks', type: 'text', required: false }] },
    p2: { fields: [{ label: 'Applied Voltage', type: 'number', required: true }, { label: 'Resistance', type: 'number', required: true }, { label: 'Insulation Quality', type: 'select', options: ['Excellent', 'Good', 'Fair', 'Poor'], required: true }, { label: 'Remarks', type: 'text', required: false }] },
    p3: { fields: [{ label: 'Signal Level', type: 'number', required: true }, { label: 'Error Rate', type: 'number', required: true }, { label: 'Status', type: 'select', options: ['Active', 'Inactive'], required: true }] },
    p4: { fields: [{ label: 'NEXT Value', type: 'number', required: true }, { label: 'FEXT Value', type: 'number', required: true }, { label: 'Frequency', type: 'number', required: true }, { label: 'Result', type: 'select', options: ['Compliant', 'Non-Compliant'], required: true }] },
    p5: { fields: [{ label: 'Resistance', type: 'number', required: true }, { label: 'Condition', type: 'select', options: ['Good', 'Weak', 'Broken'], required: true }] },
    p6: { fields: [{ label: 'Earth Resistance', type: 'number', required: true }, { label: 'Soil Condition', type: 'text', required: true }] },
    p7: { fields: [{ label: 'Total Loss', type: 'number', required: true }, { label: 'Splice Loss', type: 'number', required: true }, { label: 'Fiber Length', type: 'number', required: true }, { label: 'Result', type: 'select', options: ['Pass', 'Fail'], required: true }] },
    p8: { fields: [{ label: 'TX Power', type: 'number', required: true }, { label: 'RX Power', type: 'number', required: true }, { label: 'Status', type: 'select', options: ['Normal', 'Degraded', 'Faulty'], required: true }] },
    p9: { fields: [{ label: 'Output Voltage', type: 'number', required: true }, { label: 'Load Current', type: 'number', required: true }, { label: 'Status', type: 'select', options: ['Normal', 'Low', 'High', 'Faulty'], required: true }] },
    p10: { fields: [{ label: 'Capacity', type: 'number', required: true }, { label: 'Terminal Voltage', type: 'number', required: true }, { label: 'Condition', type: 'select', options: ['Good', 'Degraded', 'Replace'], required: true }] }
  }
};

const isDemoToken = (token) => token === 'demo-token';

export default function Home() {
  const store = useAppStore();
  const router = useRouter();
  const isDemo = isDemoToken(store.token);

  const [data, setData] = useState({
    mainCategories: [],
    categories: [],
    subCategories: [],
    testTypes: [],
    parameters: [],
    formSchema: null
  });
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Guard: redirect to login if not authenticated
  useEffect(() => {
    if (!store.isLoggedIn) router.replace('/login');
  }, [store.isLoggedIn, router]);

  // ── Breadcrumbs ───────────────────────────────────────
  const breadcrumbItems = useMemo(() => {
    const items = [];
    if (store.mainCategoryId) {
      items.push({
        label: 'Category',
        value: data.mainCategories.find(i => i._id === store.mainCategoryId)?.name,
        onReset: () => store.setMainCategory(null)
      });
    }
    if (store.categoryId) {
      items.push({
        label: data.mainCategories.find(i => i._id === store.mainCategoryId)?.name || 'Gear Type',
        value: data.categories.find(i => i._id === store.categoryId)?.name,
        onReset: () => store.setCategory(null)
      });
    }
    if (store.subCategoryId) {
      items.push({
        label: 'Sub-Category',
        value: data.subCategories.find(i => i._id === store.subCategoryId)?.name,
        onReset: () => store.setSubCategory(null)
      });
    }
    if (store.testTypeId) {
      items.push({
        label: 'Test Type',
        value: data.testTypes.find(i => i._id === store.testTypeId)?.name,
        onReset: () => store.setTestType(null)
      });
    }
    if (store.parameterId) {
      items.push({
        label: 'Parameter',
        value: data.parameters.find(i => i._id === store.parameterId)?.name,
        onReset: () => store.setParameter(null)
      });
    }
    return items;
  }, [store, data]);

  // ── Data fetching (with demo fallback) ────────────────
  const fetchOrDemo = async (apiCall, demoValue) => {
    if (isDemo) return demoValue;
    try {
      const res = await apiCall();
      return res.data;
    } catch (err) {
      if (err.friendlyMessage) return demoValue; // server offline → use demo
      throw err;
    }
  };

  useEffect(() => {
    if (store.locationConfirmed && store.sectionId) fetchMainCategories();
  }, [store.locationConfirmed, store.sectionId]);

  useEffect(() => {
    if (store.mainCategoryId) fetchCategories(store.mainCategoryId);
  }, [store.mainCategoryId]);

  useEffect(() => {
    if (store.categoryId) fetchSubCategories(store.categoryId);
  }, [store.categoryId]);

  useEffect(() => {
    if (store.subCategoryId) fetchTestTypes(store.subCategoryId);
  }, [store.subCategoryId]);

  useEffect(() => {
    if (store.testTypeId) fetchParameters(store.testTypeId);
  }, [store.testTypeId]);

  useEffect(() => {
    if (store.parameterId) fetchFormSchema(store.parameterId);
  }, [store.parameterId]);

  const fetchMainCategories = async () => {
    setLoading(true);
    try {
      const result = await fetchOrDemo(
        () => api.get('/main-categories'),
        DEMO.mainCategories
      );
      setData(prev => ({ ...prev, mainCategories: result }));
    } finally { setLoading(false); }
  };

  const fetchCategories = async (id) => {
    setLoading(true);
    try {
      const result = await fetchOrDemo(
        () => api.get(`/categories/${id}`),
        DEMO.categories[id] || []
      );
      setData(prev => ({ ...prev, categories: result }));
    } finally { setLoading(false); }
  };

  const fetchSubCategories = async (id) => {
    setLoading(true);
    try {
      const result = await fetchOrDemo(
        () => api.get(`/subcategories/${id}`),
        DEMO.subCategories[id] || []
      );
      setData(prev => ({ ...prev, subCategories: result }));
    } finally { setLoading(false); }
  };

  const fetchTestTypes = async (id) => {
    setLoading(true);
    try {
      const result = await fetchOrDemo(
        () => api.get(`/test-types/${id}`),
        DEMO.testTypes[id] || []
      );
      setData(prev => ({ ...prev, testTypes: result }));
    } finally { setLoading(false); }
  };

  const fetchParameters = async (id) => {
    setLoading(true);
    try {
      const result = await fetchOrDemo(
        () => api.get(`/parameters/${id}`),
        DEMO.parameters[id] || []
      );
      setData(prev => ({ ...prev, parameters: result }));
    } finally { setLoading(false); }
  };

  const fetchFormSchema = async (id) => {
    setLoading(true);
    try {
      const result = await fetchOrDemo(
        () => api.get(`/formschema/${id}`),
        DEMO.formSchemas[id] || null
      );
      setData(prev => ({ ...prev, formSchema: result }));
    } finally { setLoading(false); }
  };

  const handleSubmitReport = async (formData) => {
    setSubmitError('');
    if (isDemo) {
      // Demo mode — just simulate success
      store.resetFlow();
      return;
    }
    const report = {
      divisionId: store.divisionId,
      majorSectionId: store.majorSectionId,
      sectionId: store.sectionId,
      mainCategoryId: store.mainCategoryId,
      categoryId: store.categoryId,
      subCategoryId: store.subCategoryId,
      testTypeId: store.testTypeId,
      parameterId: store.parameterId,
      formData
    };
    try {
      await api.post('/reports', report);
      store.resetFlow();
    } catch (err) {
      setSubmitError(err.response?.data?.error || 'Failed to submit report. Please try again.');
      throw err; // let DynamicForm know it failed
    }
  };

  // ── Location display label ────────────────────────────
  const locationLabel = [store.divisionName, store.majorSectionName, store.sectionName]
    .filter(Boolean)
    .join(' • ');

  const SelectionLevel = ({ title, items, selectedId, onSelect }) => {
    if (!items || items.length === 0 || selectedId) return null;
    return (
      <div style={{ marginBottom: '40px' }}>
        <CardGrid title={title} items={items} onSelect={onSelect} />
      </div>
    );
  };

  if (!store.isLoggedIn) return null;

  return (
    <main style={{ background: 'var(--background)', minHeight: '100vh' }}>
      <Navbar />

      {/* Demo mode banner */}
      {isDemo && (
        <div style={{
          background: 'rgba(251,191,36,0.1)',
          borderBottom: '1px solid rgba(251,191,36,0.25)',
          padding: '10px 24px',
          textAlign: 'center',
          fontSize: '0.82rem',
          color: '#fcd34d'
        }}>
          ⚠ Demo Mode — data is not saved. Start the backend server and{' '}
          <button
            onClick={() => store.logout()}
            style={{ background: 'none', border: 'none', color: '#fcd34d', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline', fontSize: 'inherit' }}
          >
            log in again
          </button>{' '}
          to use the full system.
        </div>
      )}

      <HeroSection>
        {!store.locationConfirmed ? (
          <LocationSelector demoData={isDemo ? DEMO : null} />
        ) : (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
            <div style={{
              background: 'rgba(255,255,255,0.05)',
              padding: '12px 24px',
              borderRadius: '16px',
              border: '1px solid rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            }}>
              <div style={{ textAlign: 'left' }}>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Location Active</p>
                <p style={{ color: '#fff', fontWeight: 600 }}>{locationLabel || 'Location selected'}</p>
              </div>
              <button
                onClick={() => store.setDivision(null, null)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: '#fff',
                  border: 'none',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  fontSize: '0.8rem',
                  cursor: 'pointer'
                }}
              >
                Change
              </button>
            </div>
          </div>
        )}
      </HeroSection>

      <div className="container" style={{ paddingBottom: '100px', marginTop: '-100px', position: 'relative', zIndex: 20 }}>
        {loading && <Loader />}

        {store.locationConfirmed && (
          <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <SelectionPath items={breadcrumbItems} />

            {!store.mainCategoryId && (
              <SelectionLevel title="Category" items={data.mainCategories} selectedId={store.mainCategoryId} onSelect={store.setMainCategory} />
            )}
            {store.mainCategoryId && !store.categoryId && (
              <SelectionLevel
                title={data.mainCategories.find(mc => mc._id === store.mainCategoryId)?.name || 'Gear Type'}
                items={data.categories} selectedId={store.categoryId} onSelect={store.setCategory}
              />
            )}
            {store.categoryId && !store.subCategoryId && (
              <SelectionLevel title="Sub-Category" items={data.subCategories} selectedId={store.subCategoryId} onSelect={store.setSubCategory} />
            )}
            {store.subCategoryId && !store.testTypeId && (
              <SelectionLevel title="Test Type" items={data.testTypes} selectedId={store.testTypeId} onSelect={store.setTestType} />
            )}
            {store.testTypeId && !store.parameterId && (
              <SelectionLevel title="Parameter" items={data.parameters} selectedId={store.parameterId} onSelect={store.setParameter} />
            )}

            {store.parameterId && data.formSchema && (
              <div style={{ marginTop: '80px', animation: 'fadeIn 0.5s ease' }}>
                <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                  <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: '#fff' }}>Maintenance Report</h2>
                  <p style={{ color: 'var(--text-muted)' }}>Complete the technical verification for the selected parameter</p>
                </div>
                {submitError && (
                  <p style={{ color: '#fca5a5', textAlign: 'center', marginBottom: '16px' }}>{submitError}</p>
                )}
                <DynamicForm schema={data.formSchema} onSubmit={handleSubmitReport} />
              </div>
            )}
          </div>
        )}
      </div>

      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '60px 0', marginTop: '100px', background: '#07080e' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>© 2026 RailNexus Systems. Industrial-grade maintenance management.</p>
        </div>
      </footer>
    </main>
  );
}
