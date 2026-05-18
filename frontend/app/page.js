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

export default function Home() {
  const store = useAppStore();
  const router = useRouter();

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
      const res = await api.get('/main-categories');
      setData(prev => ({ ...prev, mainCategories: res.data }));
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const fetchCategories = async (id) => {
    setLoading(true);
    try {
      const res = await api.get(`/categories/${id}`);
      setData(prev => ({ ...prev, categories: res.data }));
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const fetchSubCategories = async (id) => {
    setLoading(true);
    try {
      const res = await api.get(`/subcategories/${id}`);
      setData(prev => ({ ...prev, subCategories: res.data }));
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const fetchTestTypes = async (id) => {
    setLoading(true);
    try {
      const res = await api.get(`/test-types/${id}`);
      setData(prev => ({ ...prev, testTypes: res.data }));
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const fetchParameters = async (id) => {
    setLoading(true);
    try {
      const res = await api.get(`/parameters/${id}`);
      setData(prev => ({ ...prev, parameters: res.data }));
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const fetchFormSchema = async (id) => {
    setLoading(true);
    try {
      const res = await api.get(`/formschema/${id}`);
      setData(prev => ({ ...prev, formSchema: res.data }));
    } catch (err) {
      console.error(err);
    } finally { setLoading(false); }
  };

  const handleSubmitReport = async (formData) => {
    setSubmitError('');
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

      <HeroSection>
        {!store.locationConfirmed ? (
          <LocationSelector />
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
