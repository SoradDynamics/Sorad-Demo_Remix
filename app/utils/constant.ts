// ~/utils/constant.ts

import { cn } from "tailwind-variants";

interface constantsType {
    DB_ID: string | null;
    GALLERY_BUCKET_ID: string | null;
    NOTES_BUCKET_ID: string | null;
    ASSIGNMENT_BUCKET_ID: string | null;
    IS_LICENSE_EXPIRED: boolean | null;
    SCHOOL_NAME: string | null;
    DOMAIN: string | null;
    // Add any other fields from your SchoolConfigResponse that you want to make globally accessible
  }
  
  /**
   * constants: Holds runtime configuration fetched for the school.
   *
   * !!! WARNING !!!
   * Directly mutating this object from different parts of your application
   * and expecting React components to automatically re-render based on its changes
   * is NOT standard React practice. This object bypasses React's state and
   * reactivity system for components that might consume these values.
   *
   * If components need to react to changes in these values, consider using:
   * 1. React Context API: To provide these values down the component tree.
   * 2. A global state management library (Zustand, Jotai, Redux): For more complex state.
   *
   * This object is provided as a direct interpretation of "storing data to a constant file."
   * Use with caution and understand its implications.
   */
  export const constants: constantsType = {
    DB_ID: null,
    GALLERY_BUCKET_ID: null,
    NOTES_BUCKET_ID: null,
    ASSIGNMENT_BUCKET_ID: null,
    IS_LICENSE_EXPIRED: null,
    SCHOOL_NAME: null,
    DOMAIN: null,
  };
  
  // Interface matching the backend response for type safety
  interface SchoolConfigResponseForUpdate {
      name: string;
      domain: string;
      license_date: string; // We'll use IS_LICENSE_EXPIRED mostly
      db_id: string;
      gallery_bucket_id: string;
      notes_bucket_id: string;
      assignment_bucket_id: string;
      isLicenseExpired: boolean;
      error?: string;
  }
  
  /**
   * Updates the `constants` object with new values.
   * This function should be called after successfully fetching the school configuration.
   * @param newConfig - The fetched school configuration data.
   */
  export const updateGlobalSchoolConfig = (newConfig: SchoolConfigResponseForUpdate) => {
    // console.log("Attempting to update global school config with:", newConfig);
  
    constants.DB_ID = newConfig.db_id || null;
    constants.GALLERY_BUCKET_ID = newConfig.gallery_bucket_id || null;
    constants.NOTES_BUCKET_ID = newConfig.notes_bucket_id || null;
    constants.ASSIGNMENT_BUCKET_ID = newConfig.assignment_bucket_id || null;
    constants.IS_LICENSE_EXPIRED = newConfig.isLicenseExpired || false; // Default to false if undefined
    constants.SCHOOL_NAME = newConfig.name || null;
    constants.DOMAIN = newConfig.domain || null;
  
    // console.log("--- Global School Config Updated ---");
    // console.log(JSON.stringify(constants, null, 2));

    // console.log("DB_ID:", constants.DB_ID);
    // console.log("------------------------------------");
  };
  
  // You can still have truly static constants here
  export const APP_VERSION = "1.0.0";

  export const DV = constants.DB_ID;