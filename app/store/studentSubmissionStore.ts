// src/store/studentSubmissionStore.ts
import { create } from 'zustand';
import toast from 'react-hot-toast';
import { databases, Query, ID } from '~/utils/appwrite';
import { Models } from 'appwrite';
import { Assignment, useAssignmentStore } from './assignmentStore'; // Import Assignment

import { useSchoolStore } from './schoolStore';
export const DB_Id = () => useSchoolStore.getState().dbId;
// console.log("DB_Id from schoolStore:", DB_Id);

const APPWRITE_DATABASE_ID = DB_Id as unknown as string;
const STUDENTS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_STUDENTS_COLLECTION_ID;
const ASSIGNMENT_COLLECTION_ID = import.meta.env.VITE_APPWRITE_ASSIGNMENT_COLLECTION_ID; // Needed to fetch single assignment


export interface StudentDoc extends Models.Document { /* ... (same as before) ... */ }
export interface StudentAssignmentSubmissionData { /* ... (same as before) ... */ }
export interface StudentForSubmissionView extends StudentDoc { /* ... (same as before) ... */ }
interface StudentSubmissionFilters { /* ... (same as before) ... */ }

interface StudentSubmissionState {
    selectedAssignment: Assignment | null;
    // isSubmissionsManagerOpen: boolean; // No longer needed for a page view
    
    students: StudentForSubmissionView[];
    isLoadingAssignment: boolean; // For loading the assignment details itself
    isLoadingStudents: boolean;
    error: string | null;

    filters: StudentSubmissionFilters;

    // Actions
    loadDataForSubmissionsPage: (assignmentId: string) => Promise<void>; // New action
    clearSubmissionsPageData: () => void; // New action
    
    // fetchStudentsForAssignment: (assignment: Assignment) => Promise<void>; // Will be part of loadDataForSubmissionsPage
    
    setFilter: <K extends keyof StudentSubmissionFilters>(filterName: K, value: StudentSubmissionFilters[K]) => void;
    
    updateStudentSubmission: (
        studentId: string,
        assignmentId: string,
        submissionDetails: Omit<StudentAssignmentSubmissionData, 'assignmentId'>
    ) => Promise<boolean>;
    
    _updateLocalStudentData: (studentId: string, newSubmissionData: StudentAssignmentSubmissionData, isSaving?: boolean) => void;
}

const initialFilters: StudentSubmissionFilters = {
    nameSearch: '',
    status: 'not_submitted',
};

export const useStudentSubmissionStore = create<StudentSubmissionState>((set, get) => ({
    selectedAssignment: null,
    students: [],
    isLoadingAssignment: false,
    isLoadingStudents: false,
    error: null,
    filters: initialFilters,

    loadDataForSubmissionsPage: async (assignmentId) => {
        set({
            isLoadingAssignment: true,
            isLoadingStudents: true,
            filters: initialFilters, // Reset filters
            students: [],
            selectedAssignment: null,
            error: null,
        });

        if (!APPWRITE_DATABASE_ID || !ASSIGNMENT_COLLECTION_ID || !STUDENTS_COLLECTION_ID) {
            const errorMsg = "System Configuration Error: Required Collection IDs are missing.";
            set({ error: errorMsg, isLoadingAssignment: false, isLoadingStudents: false });
            toast.error(errorMsg);
            return;
        }

        try {
            // 1. Fetch the assignment details
            const assignment = await databases.getDocument<Assignment>(
                APPWRITE_DATABASE_ID,
                ASSIGNMENT_COLLECTION_ID,
                assignmentId
            );
            set({ selectedAssignment: assignment, isLoadingAssignment: false });

            // 2. Fetch students for this assignment
            if (!assignment) {
                throw new Error("Assignment not found.");
            }
            const studentQueries: string[] = [
                Query.equal('facultyId', assignment.facultyId),
                Query.equal('class', assignment.className),
                Query.equal('section', assignment.sectionId),
                Query.limit(1000)
            ];

            const studentResponse = await databases.listDocuments<StudentDoc>(
                APPWRITE_DATABASE_ID,
                STUDENTS_COLLECTION_ID,
                studentQueries
            );

            const studentsWithSubmissionData: StudentForSubmissionView[] = studentResponse.documents.map(doc => {
                let submissionData: StudentAssignmentSubmissionData | undefined = undefined;
                if (doc.assignment && Array.isArray(doc.assignment)) {
                    const relevantSubmissionStr = doc.assignment.find(s => {
                        try { return JSON.parse(s).assignmentId === assignment.$id; } catch { return false; }
                    });
                    if (relevantSubmissionStr) {
                        try { submissionData = JSON.parse(relevantSubmissionStr); } catch (e) { console.error("Parse error", e); }
                    }
                }
                if (!submissionData) {
                    submissionData = { assignmentId: assignment.$id, status: 'not_submitted' };
                }
                return { ...doc, submissionData, isSaving: false };
            });
            set({ students: studentsWithSubmissionData, isLoadingStudents: false });

        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : "Failed to load data for submissions page.";
            console.error("Error loading submissions page data:", e);
            set({ error: errorMsg, isLoadingAssignment: false, isLoadingStudents: false });
            toast.error(errorMsg);
        }
    },

    clearSubmissionsPageData: () => {
        set({
            selectedAssignment: null,
            students: [],
            isLoadingAssignment: false,
            isLoadingStudents: false,
            error: null,
            filters: initialFilters, // Reset filters too
        });
    },
    
    setFilter: (filterName, value) => { /* ... (same as before) ... */ },
    _updateLocalStudentData: (studentId, newSubmissionData, isSaving = false) => { /* ... (same as before) ... */ },
    updateStudentSubmission: async (studentId, assignmentId, submissionDetails) => { /* ... (same as before, ensure selectedAssignment is used if needed for context, or rely on passed assignmentId) ... */ },
}));