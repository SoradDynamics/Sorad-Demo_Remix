// app/store/schoolStore.ts
import { create } from 'zustand';

export type SchoolLicenseStatus = 'valid' | 'expired' | 'not_found' | 'pending' | null;

export interface SchoolState {
  // getState(): unknown; // Removed this as `get()` from create already serves this.
  dbId: string | null;
  schoolName: string | null;
  licenseStatus: SchoolLicenseStatus;
  galleryBucketId: string | null;
  assignmentBucketId: string | null;
  notesBucketId: string | null;
  byContact: string | null;
  domain: string | null; // <-- ADDED: To store the school's domain
  isLoadingSchoolInfo: boolean; // To indicate if the initial school lookup is in progress
  error: string | null;

  // Action to set all school data at once
  setSchoolInfo: (data: Partial<Omit<SchoolState, 'setSchoolInfo' | 'clearSchoolInfo' | 'setIsLoadingSchoolInfo'>>) => void;
  clearSchoolInfo: () => void;
  setIsLoadingSchoolInfo: (isLoading: boolean) => void;
}

const initialState: Omit<SchoolState, 'setSchoolInfo' | 'clearSchoolInfo' | 'setIsLoadingSchoolInfo'> = {
  dbId: null,
  schoolName: null,
  licenseStatus: 'pending', // Start as pending until lookup is done
  galleryBucketId: null,
  assignmentBucketId: null,
  notesBucketId: null,
  byContact: null,
  domain: null, // <-- ADDED: Initialize domain
  isLoadingSchoolInfo: true, // Initially true
  error: null,
};

export const useSchoolStore = create<SchoolState>((set, get) => ({
  ...initialState,

  setIsLoadingSchoolInfo: (isLoading: boolean) => {
    set({ isLoadingSchoolInfo: isLoading });
  },

  setSchoolInfo: (data) => {
    // console.log("schoolStore: Setting school info:", data);
    set((state) => {
      const newState: Partial<SchoolState> = {
        ...state,
        ...data, // This will include 'domain' if it's in the data payload
        isLoadingSchoolInfo: false, // Assume loading is done when info is set
      };

      // Handle error based on licenseStatus, but preserve other data like domain
      if (data.licenseStatus === 'not_found') {
        newState.error = data.error || state.error || "School not found or an error occurred.";
        // Optionally, clear other school-specific data if 'not_found', but keep domain
        // newState.dbId = null;
        // newState.schoolName = null;
        // etc.
      } else if (data.error === undefined) { // Clear error if no new error and not 'not_found'
        newState.error = null;
      }
      
      return newState as SchoolState; // Cast to SchoolState after applying updates
    });
  },

  clearSchoolInfo: () => {
    // console.log("schoolStore: Clearing school info.");
    // Reset to initial state, which now includes domain: null
    // Set isLoadingSchoolInfo to false, as 'pending' implies a new lookup will start
    set({ ...initialState, isLoadingSchoolInfo: false, licenseStatus: 'pending' });
  },
}));

// Optional: Convenience getter for the domain
export const getSchoolDomain = () => useSchoolStore.getState().domain;