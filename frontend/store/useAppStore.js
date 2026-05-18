import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAppStore = create(
  persist(
    (set) => ({
      // ── Auth State ──────────────────────────────────────
      isLoggedIn: false,
      loggedInUser: null,
      token: null,

      login: (user, token) => set({ isLoggedIn: true, loggedInUser: user, token }),
      logout: () => set({ isLoggedIn: false, loggedInUser: null, token: null }),

      // ── Location State ──────────────────────────────────
      divisionId: null,
      divisionName: null,
      majorSectionId: null,
      majorSectionName: null,
      sectionId: null,
      sectionName: null,
      locationConfirmed: false,

      // ── Category State ──────────────────────────────────
      mainCategoryId: null,
      categoryId: null,
      subCategoryId: null,
      testTypeId: null,
      parameterId: null,

      // ── Location Setters ────────────────────────────────
      setDivision: (id, name) =>
        set({
          divisionId: id,
          divisionName: name || null,
          majorSectionId: null,
          majorSectionName: null,
          sectionId: null,
          sectionName: null,
          locationConfirmed: false
        }),

      setMajorSection: (id, name) =>
        set({
          majorSectionId: id,
          majorSectionName: name || null,
          sectionId: null,
          sectionName: null,
          locationConfirmed: false
        }),

      setSection: (id, name) =>
        set({ sectionId: id, sectionName: name || null, locationConfirmed: false }),

      confirmLocation: () => set({ locationConfirmed: true }),

      // ── Category Setters ────────────────────────────────
      setMainCategory: (id) =>
        set({ mainCategoryId: id, categoryId: null, subCategoryId: null, testTypeId: null, parameterId: null }),

      setCategory: (id) =>
        set({ categoryId: id, subCategoryId: null, testTypeId: null, parameterId: null }),

      setSubCategory: (id) =>
        set({ subCategoryId: id, testTypeId: null, parameterId: null }),

      setTestType: (id) =>
        set({ testTypeId: id, parameterId: null }),

      setParameter: (id) =>
        set({ parameterId: id }),

      resetFlow: () =>
        set({
          mainCategoryId: null,
          categoryId: null,
          subCategoryId: null,
          testTypeId: null,
          parameterId: null,
          locationConfirmed: false
        })
    }),
    {
      name: 'railnexus-store',
      // Only persist auth — location/category state resets on page load
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        loggedInUser: state.loggedInUser,
        token: state.token
      })
    }
  )
);

export default useAppStore;
