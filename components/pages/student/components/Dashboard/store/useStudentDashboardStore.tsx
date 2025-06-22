// src/store/useStudentDashboardStore.ts
import { create } from 'zustand';
import { StudentDetailsProps, UpcomingAssignment, UpcomingExamDisplay } from '../types'; // Adjust path

interface StudentDashboardState {
  studentDetails: StudentDetailsProps | null;
  upcomingAssignments: UpcomingAssignment[];
  upcomingExams: UpcomingExamDisplay[]; // <--- ADDED
  loading: boolean;
  error: string | null;
  setStudentDetails: (details: StudentDetailsProps | null) => void;
  setUpcomingAssignments: (assignments: UpcomingAssignment[]) => void;
  setUpcomingExams: (exams: UpcomingExamDisplay[]) => void; // <--- ADDED
  setLoading: (isLoading: boolean) => void;
  setError: (errorMessage: string | null) => void;
  reset: () => void;
}

const initialState = {
  studentDetails: null,
  upcomingAssignments: [],
  upcomingExams: [], // <--- ADDED
  loading: true, // Start with loading true
  error: null,
};

export const useStudentDashboardStore = create<StudentDashboardState>((set) => ({
  ...initialState,
  setStudentDetails: (details) => set({ studentDetails: details }),
  setUpcomingAssignments: (assignments) => set({ upcomingAssignments: assignments }),
  setUpcomingExams: (exams) => set({ upcomingExams: exams }), // <--- ADDED
  setLoading: (isLoading) => set({ loading: isLoading }),
  setError: (errorMessage) => set({ error: errorMessage }),
  reset: () => set(initialState),
}));