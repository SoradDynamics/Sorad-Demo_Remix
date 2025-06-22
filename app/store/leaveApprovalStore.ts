// src/stores/leaveApprovalStore.ts
import { create } from 'zustand';
import { Leave, ModifiedLeave, StudentDocument, FacultyDocument, SectionDocument, TeacherDocument } from 'types';

const ITEMS_PER_LOAD = 20;

interface LeaveApprovalFilters {
  facultyId: string | null;
  class: string | null;
  section: string | null;
  searchText: string;
}

type UserRole = 'admin' | 'teacher';

interface LeaveApprovalState {
  // User context
  currentUserEmail: string | null;
  currentUserRole: UserRole;
  teacherDetails: TeacherDocument | null;
  teacherAssignedSectionIds: string[]; // IDs of sections teacher is class_teacher for
  teacherAssignedSectionsData: SectionDocument[]; // Full data of these sections

  allStudents: StudentDocument[]; // For admin: all students; For teacher: students of their sections
  rawLeaveRequests: Leave[];
  processedAndFilteredLeaves: Leave[];
  
  displayableLeaveRequests: Leave[];
  totalProcessedLeavesCount: number;
  currentlyDisplayedCount: number;

  modifiedLeaves: Map<string, ModifiedLeave>;
  isLoading: boolean; // Global loading for initial data fetch
  isFetchingMore: boolean;
  error: string | null;
  filters: LeaveApprovalFilters;
  
  // Data for filter dropdowns - these will be scoped based on role
  faculties: FacultyDocument[];
  sections: SectionDocument[];
  classes: string[];

  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setInitialData: (data: {
    students: StudentDocument[]; // Students (already scoped for teacher if applicable)
    allFacultiesFromDB: FacultyDocument[]; // All faculties from DB
    allSectionsFromDB: SectionDocument[];   // All sections from DB
    userEmail: string | null;
    teacherDoc: TeacherDocument | null;
    assignedSectionIdsForTeacher: string[];
    assignedSectionsDataForTeacher: SectionDocument[];
  }) => void;

  initializeAllLeaveData: () => void;
  applyFiltersAndPrepareDisplay: () => void;

  loadMoreLeaves: () => void;
  updateLeaveStatus: (leaveId: string, studentId: string, newStatus: 'approved' | 'rejected', rejectionReason?: string) => void;
  getLeaveById: (leaveId: string) => Leave | undefined;
  resetModifications: () => void;
  hasPendingChanges: () => boolean;
  clearModifications: () => void;
  setFilter: (filterName: keyof LeaveApprovalFilters, value: string | null) => void;
}

const useLeaveApprovalStore = create<LeaveApprovalState>((set, get) => ({
  currentUserEmail: null,
  currentUserRole: 'admin', // Default, will be updated
  teacherDetails: null,
  teacherAssignedSectionIds: [],
  teacherAssignedSectionsData: [],

  allStudents: [],
  rawLeaveRequests: [],
  processedAndFilteredLeaves: [],
  displayableLeaveRequests: [],
  totalProcessedLeavesCount: 0,
  currentlyDisplayedCount: 0,
  modifiedLeaves: new Map(),
  isLoading: true, // Start with loading true for initial fetch
  isFetchingMore: false,
  error: null,
  filters: {
    facultyId: null,
    class: null,
    section: null,
    searchText: '',
  },
  faculties: [],
  sections: [],
  classes: [],

  setLoading: (loading) => set({ isLoading: loading }),
  setError: (error) => set({ error, isLoading: false }), // Stop loading on error

  setInitialData: ({ 
    students, 
    allFacultiesFromDB, 
    allSectionsFromDB, 
    userEmail, 
    teacherDoc, 
    assignedSectionIdsForTeacher,
    assignedSectionsDataForTeacher,
  }) => {
    const role: UserRole = teacherDoc ? 'teacher' : 'admin';
    
    let finalFacultiesForFilter: FacultyDocument[];
    let finalSectionsForFilter: SectionDocument[];
    let finalClassesForFilter: string[];

    if (role === 'teacher') {
      // For teachers, students are already pre-filtered.
      // Filter dropdowns should be based on their assigned sections.
      finalSectionsForFilter = assignedSectionsDataForTeacher;
      const teacherClasses = [...new Set(assignedSectionsDataForTeacher.map(sec => sec.class))].filter(Boolean).sort();
      finalClassesForFilter = teacherClasses;
      
      // Faculties for filter can be derived from teacher's sections or all faculties
      const teacherFacultyIds = new Set(assignedSectionsDataForTeacher.map(sec => sec.facultyId));
      finalFacultiesForFilter = allFacultiesFromDB.filter(fac => teacherFacultyIds.has(fac.$id));
      // If no specific faculties linked to sections, or prefer to show all, use allFacultiesFromDB
      if (finalFacultiesForFilter.length === 0 && allFacultiesFromDB.length > 0) {
          finalFacultiesForFilter = allFacultiesFromDB; // Fallback or default
      }

    } else { // Admin
      finalFacultiesForFilter = allFacultiesFromDB;
      finalSectionsForFilter = allSectionsFromDB;
      const allClasses = [...new Set(
          students.map(s => s.class).concat(allSectionsFromDB.map(s => s.class))
      )].filter(Boolean).sort();
      finalClassesForFilter = allClasses;
    }
    
    set({
      allStudents: students, // These are pre-filtered for teachers
      faculties: finalFacultiesForFilter,
      sections: finalSectionsForFilter,
      classes: finalClassesForFilter,
      currentUserEmail: userEmail,
      currentUserRole: role,
      teacherDetails: teacherDoc,
      teacherAssignedSectionIds: assignedSectionIdsForTeacher,
      teacherAssignedSectionsData: assignedSectionsDataForTeacher,
      isLoading: false, // Data is set, initial loading finished
      error: null,
      filters: { facultyId: null, class: null, section: null, searchText: '' }, // Reset filters on new data
    });
    get().initializeAllLeaveData();
  },

  initializeAllLeaveData: () => {
    const { allStudents } = get(); // allStudents is already correctly scoped
    const allParsedLeaves: Leave[] = [];

    allStudents.forEach(student => {
      student.leave.forEach(leaveStr => {
        try {
          const leaveData = JSON.parse(leaveStr);
          const enrichedLeave: Leave = {
            ...leaveData,
            studentId: student.$id,
            studentName: student.name,
            studentClass: student.class,
            studentFacultyId: student.facultyId,
            studentSection: student.section,
          };
          allParsedLeaves.push(enrichedLeave);
        } catch (e) {
          console.error("Failed to parse leave data:", leaveStr, e);
        }
      });
    });

    allParsedLeaves.sort((a, b) => {
        const dateA = new Date(a.periodType === 'today' ? a.date || 0 : a.fromDate || 0).getTime();
        const dateB = new Date(b.periodType === 'today' ? b.date || 0 : b.fromDate || 0).getTime();
        return dateB - dateA;
    });
    
    set({ rawLeaveRequests: allParsedLeaves });
    get().applyFiltersAndPrepareDisplay();
  },

  applyFiltersAndPrepareDisplay: () => {
    const { rawLeaveRequests, filters } = get();
    let tempFiltered = [...rawLeaveRequests]; // rawLeaveRequests is already scoped for teacher/admin

    if (filters.facultyId) {
      tempFiltered = tempFiltered.filter(leave => leave.studentFacultyId === filters.facultyId);
    }
    if (filters.class) {
      tempFiltered = tempFiltered.filter(leave => leave.studentClass === filters.class);
    }
    if (filters.section) {
      tempFiltered = tempFiltered.filter(leave => leave.studentSection === filters.section);
    }
    if (filters.searchText) {
      const searchLower = filters.searchText.toLowerCase();
      tempFiltered = tempFiltered.filter(leave =>
        leave.title.toLowerCase().includes(searchLower) ||
        leave.reason.toLowerCase().includes(searchLower) ||
        leave.studentName.toLowerCase().includes(searchLower)
      );
    }
    
    set({
      processedAndFilteredLeaves: tempFiltered,
      totalProcessedLeavesCount: tempFiltered.length,
      currentlyDisplayedCount: Math.min(tempFiltered.length, ITEMS_PER_LOAD),
      displayableLeaveRequests: tempFiltered.slice(0, Math.min(tempFiltered.length, ITEMS_PER_LOAD)),
    });
  },

  setFilter: (filterName, value) => {
    set(state => {
      const newFilters = {
        ...state.filters,
        [filterName]: value,
      };

      if (filterName === 'class') {
        if (value === null) {
          newFilters.section = null;
        } else {
          const currentSectionId = state.filters.section;
          if (currentSectionId) {
            // `state.sections` is already scoped for teacher/admin.
            const sectionData = state.sections.find(s => s.$id === currentSectionId);
            if (!sectionData || sectionData.class !== value) {
              newFilters.section = null;
            }
          }
        }
      }
      return { filters: newFilters };
    });
    get().applyFiltersAndPrepareDisplay();
  },
  
  loadMoreLeaves: () => {
    const { processedAndFilteredLeaves, currentlyDisplayedCount, totalProcessedLeavesCount, isFetchingMore } = get();
    if (currentlyDisplayedCount >= totalProcessedLeavesCount || isFetchingMore) {
      return;
    }
    set({ isFetchingMore: true });
    const newCount = Math.min(currentlyDisplayedCount + ITEMS_PER_LOAD, totalProcessedLeavesCount);
    
      set(state => ({
        displayableLeaveRequests: state.processedAndFilteredLeaves.slice(0, newCount),
        currentlyDisplayedCount: newCount,
        isFetchingMore: false,
      }));
  },

  updateLeaveStatus: (leaveId, studentId, newStatus, rejectionReason) => {
    set(state => {
      const leaveToUpdate = state.rawLeaveRequests.find(l => l.leaveId === leaveId && l.studentId === studentId);
      if (!leaveToUpdate) {
          console.warn("Leave not found in raw requests for update:", leaveId, studentId);
          return state;
      }

      const newModifiedLeaves = new Map(state.modifiedLeaves);
      let modifiedLeaveEntry = newModifiedLeaves.get(leaveId);

      if (!modifiedLeaveEntry) {
        modifiedLeaveEntry = {
          ...leaveToUpdate,
          originalStatus: leaveToUpdate.status,
          status: newStatus,
        };
      } else {
        modifiedLeaveEntry.status = newStatus;
      }

      if (newStatus === 'rejected') {
        const rejecter = state.currentUserRole === 'teacher' ? (state.teacherDetails?.name || 'Class Teacher') : 'Admin';
        modifiedLeaveEntry.rejectionReason = rejectionReason || `Rejected by ${rejecter}`;
        modifiedLeaveEntry.rejectedAt = new Date().toISOString();
      } else if (newStatus === 'approved') {
        delete modifiedLeaveEntry.rejectionReason;
        delete modifiedLeaveEntry.rejectedAt;
      }
      newModifiedLeaves.set(leaveId, modifiedLeaveEntry);

      const updatedDisplayableLeaves = state.displayableLeaveRequests.map(leave =>
        leave.leaveId === leaveId ? { ...leave, ...modifiedLeaveEntry } : leave
      );

      return { 
        modifiedLeaves: newModifiedLeaves,
        displayableLeaveRequests: updatedDisplayableLeaves,
      };
    });
  },
  
  getLeaveById: (leaveId: string) => {
    const modified = get().modifiedLeaves.get(leaveId);
    if (modified) return modified;
    let leave = get().displayableLeaveRequests.find(l => l.leaveId === leaveId);
    if (leave) return leave;
    return get().rawLeaveRequests.find(l => l.leaveId === leaveId);
  },

  resetModifications: () => {
    const { modifiedLeaves } = get();
    if (modifiedLeaves.size === 0) return;
    set({ modifiedLeaves: new Map() });
    get().applyFiltersAndPrepareDisplay(); 
  },
  
  clearModifications: () => {
    set({ modifiedLeaves: new Map() });
  },

  hasPendingChanges: () => get().modifiedLeaves.size > 0,
}));

export default useLeaveApprovalStore;