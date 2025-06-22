// src/store/schoolConfigStore.ts
import { create } from 'zustand';

interface SchoolConfigState {
  dbId: string | null;
  galleryBucketId: string | null;
  notesBucketId: string | null;
  assignmentBucketId: string | null;
  isLicenseExpired: boolean | null;
  schoolName: string | null;
  domain: string | null;
}

interface SchoolConfigActions {
  setSchoolConfiguration: (config: Partial<SchoolConfigState>) => void;
  clearSchoolConfiguration: () => void;
}

const initialState: SchoolConfigState = {
  dbId: null,
  // ... other initial states
  schoolName: null,
  domain: null,
};

export const useSchoolConfigStore = create<SchoolConfigState & SchoolConfigActions>((set) => ({
  ...initialState,
  setSchoolConfiguration: (config) =>
    set((state) => ({ ...state, ...config })),
  clearSchoolConfiguration: () => set({ ...initialState }),
}));

// Optional: Export getState directly for non-React usage if you often need it
export const getSchoolConfigState = () => useSchoolConfigStore.getState();