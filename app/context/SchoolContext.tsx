// app/context/SchoolContext.tsx
import React, { createContext, useState, useContext, ReactNode, Dispatch, SetStateAction } from 'react'; // Added Dispatch, SetStateAction

export type LicenseStatus = 'valid' | 'expired' | 'not_found' | 'pending' | null;

export interface SchoolDataContextState {
  dbId: string | null;
  schoolName: string | null;
  licenseStatus: LicenseStatus;
  galleryBucketId: string | null;
  assignmentBucketId: string | null;
  notesBucketId: string | null;
  byContact: string | null;
}

interface SchoolContextType extends SchoolDataContextState {
  setSchoolData: (data: Partial<SchoolDataContextState>) => void;
  clearSchoolData: () => void;
  isLoadingSchoolData: boolean;
  setIsLoadingSchoolData: Dispatch<SetStateAction<boolean>>; // <--- ADD THIS LINE
}

const initialSchoolData: SchoolDataContextState = {
  dbId: null,
  schoolName: null,
  licenseStatus: 'pending',
  galleryBucketId: null,
  assignmentBucketId: null,
  notesBucketId: null,
  byContact: null,
};

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

export const SchoolProvider = ({ children }: { children: ReactNode }) => {
  const [schoolData, setSchoolDataState] = useState<SchoolDataContextState>(initialSchoolData);
  const [isLoadingSchoolData, setIsLoadingSchoolData] = useState(true); // State for loading

  const setSchoolData = (data: Partial<SchoolDataContextState>) => {
    setSchoolDataState(prev => ({ ...prev, ...data }));
    // Potentially set isLoadingSchoolData to false here if data implies loading is done
    // e.g., if (data.dbId || data.licenseStatus !== 'pending') setIsLoadingSchoolData(false);
  };

  const clearSchoolData = () => {
    setSchoolDataState(initialSchoolData); // This already sets licenseStatus to 'pending'
    setIsLoadingSchoolData(true); // Reset loading to true when clearing, as lookup will likely restart
  };

  return (
    <SchoolContext.Provider value={{
      ...schoolData,
      setSchoolData,
      clearSchoolData,
      isLoadingSchoolData,
      setIsLoadingSchoolData // <--- NOW IT'S VALID because it's in SchoolContextType
    }}>
      {/* // console.log() */}
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = (): SchoolContextType => {
  const context = useContext(SchoolContext);
  if (context === undefined) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};