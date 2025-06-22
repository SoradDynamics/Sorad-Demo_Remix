// src/stores/assignmentStore.ts
import { create } from 'zustand';
import toast from 'react-hot-toast';
import {
    databases,
    storage,
    ID,
    Query,
   FACULTIES_COLLECTION_ID as FACULTY_COLLECTION_ID,
SECTIONS_COLLECTION_ID as    SECTION_COLLECTION_ID,
    ASSIGNMENT_COLLECTION_ID,
   STUDENTS_COLLECTION_ID as  STUDENT_COLLECTION_ID,
    ASSIGNMENT_FILES_BUCKET_ID,
    // NOTIFICATIONS_COLLECTION_ID, // Ensure this is defined in appwrite.ts if used directly by createNotificationEntry
} from '~/utils/appwrite'; // These MUST be correctly defined and exported
import { createNotificationEntry, getTomorrowDateString, NotificationData } from '~/utils/notification';
import NepaliDateConverter from 'nepali-date-converter'; // Correctly named import as used in the original store
import { Models } from 'appwrite';
import {getCurrentUser} from '../../components/pages/teacher/components/Assignment/utils/appwriteAuth'; // Import default export

import { useSchoolStore } from './schoolStore';
export const DB_Id = () => useSchoolStore.getState().dbId;
// console.log("DB_Id from schoolStore:", DB_Id);


const APPWRITE_DATABASE_ID = DB_Id as unknown as string;



// --- Interfaces ---
export interface Faculty extends Models.Document {
    name: string;
    classes: string[];
}

export interface Section extends Models.Document {
    name: string;
    subjects: string[];
    class: string;      // Class name, e.g., "XI"
    facultyId: string;
}

export interface Assignment extends Models.Document {
    title: string;
    description: string;
    facultyId: string;
    className: string;
    sectionId: string;
    sectionName: string; // Denormalized for display
    subjectName: string;
    assignedById: string;
    assignedByEmail: string;
    dateBS: string;
    dateAD: string;
    fileIds?: string[];
    fileNames?: string[];
    status?: string;
}

export interface AssignmentFormDataForStore {
    title: string;
    description: string;
    facultyId: string;
    className: string;
    sectionId: string;
    subjectName: string;
    dateBS: string; // Expected as YYYY-MM-DD
}

interface AssignmentFilters {
    facultyId: string | null;
    className: string | null;
    sectionId: string | null;
    subjectName: string | null;
}

interface AssignmentState {
    faculties: Faculty[];
    classesForFilter: string[];
    sectionsForFilter: Section[];
    subjectsForFilter: string[];
    assignments: Assignment[];
    filters: AssignmentFilters;
    isLoading: boolean;       // For general list loading
    isSubmitting: boolean;    // For form add/update operations
    error: string | null;     // General error for display (e.g., in form)
    isDrawerOpen: boolean;
    editingAssignment: Assignment | null;

    fetchFaculties: () => Promise<void>;
    fetchClassesForFaculty: (facultyId: string) => Promise<void>;
    fetchSectionsForClassAndFaculty: (facultyId: string, className: string) => Promise<void>;
    fetchSubjectsForSection: (sectionId: string) => Promise<void>;
    setFilter: (filterName: keyof AssignmentFilters, value: string | null) => void;
    fetchAssignments: () => Promise<void>;
    openDrawer: (assignmentToEdit?: Assignment) => void;
    closeDrawer: () => void;
    addAssignment: (data: AssignmentFormDataForStore & { files: File[] }) => Promise<boolean>;
    updateAssignment: (assignmentId: string, data: Partial<AssignmentFormDataForStore> & { newFiles?: File[]; filesToDelete?: string[] }) => Promise<boolean>;
    deleteAssignment: (assignmentId: string, fileIds?: string[]) => Promise<void>;
    getStudentsForNotification: (facultyId: string, className: string, sectionId: string) => Promise<string[]>;
}

const initialFilters: AssignmentFilters = {
    facultyId: null,
    className: null,
    sectionId: null,
    subjectName: null,
};

export const useAssignmentStore = create<AssignmentState>((set, get) => ({
    faculties: [],
    classesForFilter: [], // For dropdowns in filter bar AND form
    sectionsForFilter: [],// For dropdowns in filter bar AND form
    subjectsForFilter: [],// For dropdowns in filter bar AND form
    assignments: [],
    filters: initialFilters, // For main page list filtering
    isLoading: false,
    isSubmitting: false,
    error: null,
    isDrawerOpen: false,
    editingAssignment: null,

    fetchFaculties: async () => {
        set({ isLoading: true, error: null });
        try {
            if (!APPWRITE_DATABASE_ID || !FACULTY_COLLECTION_ID) {
                throw new Error("System Configuration Error: Faculty Collection ID or Database ID is missing.");
            }
            const response = await databases.listDocuments<Faculty>(APPWRITE_DATABASE_ID, FACULTY_COLLECTION_ID);
            set({ faculties: response.documents, isLoading: false });
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : "Failed to fetch faculties.";
            console.error("Error fetching faculties:", e);
            set({ error: errorMsg, isLoading: false });
            toast.error(errorMsg);
        }
    },

    fetchClassesForFaculty: async (facultyId: string) => {
        const faculty = get().faculties.find(f => f.$id === facultyId);
        set({ classesForFilter: faculty?.classes || [] });
    },

    fetchSectionsForClassAndFaculty: async (facultyId: string, className: string) => {
        if (!facultyId || !className) {
            set({ sectionsForFilter: [], subjectsForFilter: [] }); 
            return;
        }
        set({ isLoading: true, error: null }); 
        try {
            if (!APPWRITE_DATABASE_ID || !SECTION_COLLECTION_ID) {
                throw new Error("System Configuration Error: Section Collection ID or Database ID is missing.");
            }
            const response = await databases.listDocuments<Section>(
                APPWRITE_DATABASE_ID,
                SECTION_COLLECTION_ID,
                [Query.equal('facultyId', facultyId), Query.equal('class', className)]
            );
            set({ sectionsForFilter: response.documents, isLoading: false });
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : "Failed to fetch sections.";
            console.error("Error fetching sections:", e);
            set({ error: errorMsg, isLoading: false, sectionsForFilter: [] });
            toast.error(errorMsg);
        }
    },

    fetchSubjectsForSection: async (sectionId: string) => {
        if (!sectionId) {
            set({ subjectsForFilter: [] });
            return;
        }
        const section = get().sectionsForFilter.find(s => s.$id === sectionId);
        set({ subjectsForFilter: section?.subjects || [] });
    },

    setFilter: (filterName, value) => { 
        const newFilters = { ...get().filters, [filterName]: value };
        set({ filters: newFilters });

        if (filterName === 'facultyId') {
            set({ filters: { ...newFilters, className: null, sectionId: null, subjectName: null } }); 
            if (value) get().fetchClassesForFaculty(value);
            else set({ classesForFilter: [], sectionsForFilter: [], subjectsForFilter: [] });
        } else if (filterName === 'className') {
            set({ filters: { ...newFilters, sectionId: null, subjectName: null } });
            if (value && newFilters.facultyId) get().fetchSectionsForClassAndFaculty(newFilters.facultyId, value);
            else set({ sectionsForFilter: [], subjectsForFilter: [] });
        } else if (filterName === 'sectionId') {
            set({ filters: { ...newFilters, subjectName: null } });
            if (value) get().fetchSubjectsForSection(value);
            else set({ subjectsForFilter: [] });
        }
        get().fetchAssignments();
    },

    fetchAssignments: async () => {
        set({ isLoading: true, error: null });
        const { facultyId, className, sectionId, subjectName } = get().filters;
        const queries: string[] = [Query.orderDesc('dateBS')]; 

        if (facultyId) queries.push(Query.equal('facultyId', facultyId));
        if (className) queries.push(Query.equal('className', className));
        if (sectionId) queries.push(Query.equal('sectionId', sectionId));
        if (subjectName) queries.push(Query.equal('subjectName', subjectName));

        try {
            if (!APPWRITE_DATABASE_ID || !ASSIGNMENT_COLLECTION_ID) {
                throw new Error("System Configuration Error: Assignment Collection ID or Database ID is missing.");
            }
            const response = await databases.listDocuments<Assignment>(APPWRITE_DATABASE_ID, ASSIGNMENT_COLLECTION_ID, queries);
            set({ assignments: response.documents, isLoading: false });
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : "Failed to fetch assignments.";
            console.error("Error fetching assignments:", e);
            set({ error: errorMsg, isLoading: false, assignments: [] });
            toast.error(errorMsg);
        }
    },

    openDrawer: (assignmentToEdit?: Assignment) => {
        set({ isDrawerOpen: true, editingAssignment: assignmentToEdit || null, error: null }); 
        if (assignmentToEdit) {
            if (assignmentToEdit.facultyId) get().fetchClassesForFaculty(assignmentToEdit.facultyId);
            if (assignmentToEdit.facultyId && assignmentToEdit.className) get().fetchSectionsForClassAndFaculty(assignmentToEdit.facultyId, assignmentToEdit.className);
            if (assignmentToEdit.sectionId) get().fetchSubjectsForSection(assignmentToEdit.sectionId);
        } else {
            set({ classesForFilter: [], sectionsForFilter: [], subjectsForFilter: [] });
        }
    },
    closeDrawer: () => {
        set({ isDrawerOpen: false, editingAssignment: null }); 
        set({ classesForFilter: [], sectionsForFilter: [], subjectsForFilter: [] });
    },

    addAssignment: async (dataWithFiles) => {
        set({ isSubmitting: true, error: null });
        const user = await getCurrentUser();
        if (!user || !user.$id || !user.email) {
            const errorMsg = "Authentication error. Please log in again to add an assignment.";
            set({ error: errorMsg, isSubmitting: false });
            toast.error(errorMsg);
            return false; 
        }

        if (!APPWRITE_DATABASE_ID || !ASSIGNMENT_COLLECTION_ID || !ASSIGNMENT_FILES_BUCKET_ID || !SECTION_COLLECTION_ID || !FACULTY_COLLECTION_ID) {
            const errorMsg = "System configuration error (ID missing). Cannot add assignment.";
            set({ error: errorMsg, isSubmitting: false });
            toast.error(errorMsg);
            return false;
        }

        try {
            const { files, ...assignmentDataFromForm } = dataWithFiles;

            let fetchedSectionName = 'N/A'; 
            try {
                const sectionDoc = await databases.getDocument<Section>(APPWRITE_DATABASE_ID, SECTION_COLLECTION_ID, assignmentDataFromForm.sectionId);
                fetchedSectionName = sectionDoc.name;
            } catch (secError) {
                console.warn(`Could not fetch section name for ID ${assignmentDataFromForm.sectionId} during add:`, secError);
                toast.warn("Could not verify section name. Using default 'N/A'.");
            }

            // --- Corrected BS to AD conversion ---
            const [bsYear, bsMonth, bsDay] = assignmentDataFromForm.dateBS.split('-').map(Number);
            // NepaliDateConverter constructor expects month to be 0-indexed
            const nepaliDate = new NepaliDateConverter(bsYear, bsMonth - 1, bsDay);
            const adJsDate = nepaliDate.toJsDate(); // Returns a JS Date object

            const adYear = adJsDate.getFullYear();
            const adMonthString = String(adJsDate.getMonth() + 1).padStart(2, '0'); // JS Date getMonth() is 0-indexed
            const adDayString = String(adJsDate.getDate()).padStart(2, '0');
            const formattedDateAD = `${adYear}-${adMonthString}-${adDayString}`;
            // --- End of corrected BS to AD conversion ---

            const uploadedFileIds: string[] = [];
            const uploadedFileNames: string[] = [];
            if (files && files.length > 0) {
                for (const file of files) {
                    const response = await storage.createFile(ASSIGNMENT_FILES_BUCKET_ID, ID.unique(), file);
                    uploadedFileIds.push(response.$id);
                    uploadedFileNames.push(file.name);
                }
            }

            const assignmentPayload: Omit<Assignment, keyof Models.Document | '$permissions'> = {
                ...assignmentDataFromForm,
                sectionName: fetchedSectionName,
                assignedById: user.$id,
                assignedByEmail: user.email,
                dateAD: formattedDateAD, // Use the correctly converted AD date
                fileIds: uploadedFileIds.length > 0 ? uploadedFileIds : undefined,
                fileNames: uploadedFileNames.length > 0 ? uploadedFileNames : undefined,
                status: 'Published', 
            };

            const createdAssignment = await databases.createDocument<Assignment>(
                APPWRITE_DATABASE_ID, ASSIGNMENT_COLLECTION_ID, ID.unique(), assignmentPayload
            );

            const studentsToNotify = await get().getStudentsForNotification(createdAssignment.facultyId, createdAssignment.className, createdAssignment.sectionId);
            if (studentsToNotify.length > 0) {
                await createNotificationEntry({
                    title: `New Assignment: ${createdAssignment.title}`,
                    msg: `A new assignment "${createdAssignment.title}" for ${createdAssignment.subjectName} has been posted. Due: ${createdAssignment.dateBS}.`,
                    to: studentsToNotify, valid: getTomorrowDateString(), sender: user.email,
                });
            }

            toast.success("Assignment added successfully!");
            set({ isSubmitting: false }); 
            get().fetchAssignments(); 
            return true; 
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : "An unknown error occurred while adding the assignment.";
            console.error("Error in addAssignment:", e);
            set({ error: errorMsg, isSubmitting: false });
            toast.error(errorMsg);
            return false; 
        }
    },

    updateAssignment: async (assignmentId, dataWithPossibleFiles) => {
        set({ isSubmitting: true, error: null });
        const user = await getCurrentUser();
        if (!user || !user.$id || !user.email) {
            const errorMsg = "Authentication error. Please log in again to update.";
            set({ error: errorMsg, isSubmitting: false });
            toast.error(errorMsg);
            return false;
        }

        const existingAssignment = get().assignments.find(a => a.$id === assignmentId);
        if (!existingAssignment) {
            toast.error("Assignment not found. It might have been deleted.");
            set({ isSubmitting: false });
            return false;
        }
        if (existingAssignment.assignedById !== user.$id) {
            toast.error("You do not have permission to edit this assignment.");
            set({ isSubmitting: false });
            return false;
        }

        if (!APPWRITE_DATABASE_ID || !ASSIGNMENT_COLLECTION_ID || !ASSIGNMENT_FILES_BUCKET_ID || !SECTION_COLLECTION_ID || !FACULTY_COLLECTION_ID) {
            const errorMsg = "System configuration error (ID missing). Cannot update assignment.";
            set({ error: errorMsg, isSubmitting: false });
            toast.error(errorMsg);
            return false;
        }

        try {
            const { newFiles, filesToDelete, ...updateDataFromForm } = dataWithPossibleFiles;

            let fetchedSectionName = existingAssignment.sectionName; 
            if (updateDataFromForm.sectionId && updateDataFromForm.sectionId !== existingAssignment.sectionId) {
                try {
                    const sectionDoc = await databases.getDocument<Section>(APPWRITE_DATABASE_ID, SECTION_COLLECTION_ID, updateDataFromForm.sectionId);
                    fetchedSectionName = sectionDoc.name;
                } catch (secError) {
                    console.warn(`Could not fetch section name for ID ${updateDataFromForm.sectionId} during update:`, secError);
                    toast.warn("Could not verify updated section name. Previous name retained if section ID didn't change, else 'N/A'.");
                     if(updateDataFromForm.sectionId) fetchedSectionName = 'N/A'; 
                }
            }

            let convertedDateAD = existingAssignment.dateAD; // Keep existing AD date by default
            if (updateDataFromForm.dateBS) {
                // --- Corrected BS to AD conversion ---
                const [bsYear, bsMonth, bsDay] = updateDataFromForm.dateBS.split('-').map(Number);
                // NepaliDateConverter constructor expects month to be 0-indexed
                const nepaliDate = new NepaliDateConverter(bsYear, bsMonth - 1, bsDay);
                const adJsDate = nepaliDate.toJsDate(); // Returns a JS Date object

                const adYear = adJsDate.getFullYear();
                const adMonthString = String(adJsDate.getMonth() + 1).padStart(2, '0'); // JS Date getMonth() is 0-indexed
                const adDayString = String(adJsDate.getDate()).padStart(2, '0');
                convertedDateAD = `${adYear}-${adMonthString}-${adDayString}`;
                // --- End of corrected BS to AD conversion ---
            }

            let updatedFileIds = [...(existingAssignment.fileIds || [])];
            let updatedFileNames = [...(existingAssignment.fileNames || [])];

            if (filesToDelete && filesToDelete.length > 0) {
                for (const fileIdToDelete of filesToDelete) {
                    try {
                        await storage.deleteFile(ASSIGNMENT_FILES_BUCKET_ID, fileIdToDelete);
                    } catch (fileDeleteError) {
                        console.warn(`Could not delete file ${fileIdToDelete}:`, fileDeleteError);
                        toast.warn(`A file (${fileIdToDelete.substring(0,6)}...) could not be deleted. It might have already been removed.`);
                    }
                    const index = updatedFileIds.indexOf(fileIdToDelete);
                    if (index > -1) {
                        updatedFileIds.splice(index, 1);
                        updatedFileNames.splice(index, 1);
                    }
                }
            }

            if (newFiles && newFiles.length > 0) {
                for (const file of newFiles) {
                    const response = await storage.createFile(ASSIGNMENT_FILES_BUCKET_ID, ID.unique(), file);
                    updatedFileIds.push(response.$id);
                    updatedFileNames.push(file.name);
                }
            }
            
            const payloadToUpdate: Partial<Omit<Assignment, keyof Models.Document | '$permissions'>> = {};
            if (updateDataFromForm.title !== undefined) payloadToUpdate.title = updateDataFromForm.title;
            if (updateDataFromForm.description !== undefined) payloadToUpdate.description = updateDataFromForm.description;
            if (updateDataFromForm.facultyId !== undefined) payloadToUpdate.facultyId = updateDataFromForm.facultyId;
            if (updateDataFromForm.className !== undefined) payloadToUpdate.className = updateDataFromForm.className;
            if (updateDataFromForm.sectionId !== undefined) {
                 payloadToUpdate.sectionId = updateDataFromForm.sectionId;
                 payloadToUpdate.sectionName = fetchedSectionName;
            }
            if (updateDataFromForm.subjectName !== undefined) payloadToUpdate.subjectName = updateDataFromForm.subjectName;
            
            if (updateDataFromForm.dateBS !== undefined) {
                payloadToUpdate.dateBS = updateDataFromForm.dateBS;
                payloadToUpdate.dateAD = convertedDateAD; // Use the converted AD date
            }
            
            payloadToUpdate.fileIds = updatedFileIds.length > 0 ? updatedFileIds : undefined;
            payloadToUpdate.fileNames = updatedFileNames.length > 0 ? updatedFileNames : undefined;


            if (Object.keys(payloadToUpdate).length === 0 && (!newFiles?.length && !filesToDelete?.length) ) {
                toast.info("No changes were made to the assignment.");
                set({ isSubmitting: false });
                return true;
            }

            const updatedAssignmentDoc = await databases.updateDocument<Assignment>(
                APPWRITE_DATABASE_ID, ASSIGNMENT_COLLECTION_ID, assignmentId, payloadToUpdate
            );

            const studentsToNotify = await get().getStudentsForNotification(updatedAssignmentDoc.facultyId, updatedAssignmentDoc.className, updatedAssignmentDoc.sectionId);
            if (studentsToNotify.length > 0) {
                 await createNotificationEntry({
                    title: `Assignment Updated: ${updatedAssignmentDoc.title}`,
                    msg: `The assignment "${updatedAssignmentDoc.title}" for ${updatedAssignmentDoc.subjectName} has been updated. Due: ${updatedAssignmentDoc.dateBS}.`,
                    to: studentsToNotify, valid: getTomorrowDateString(), sender: user.email,
                });
            }

            toast.success("Assignment updated successfully!");
            set({ isSubmitting: false });
            get().fetchAssignments();
            return true;
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : "An error occurred while updating the assignment.";
            console.error("Error in updateAssignment:", e);
            set({ error: errorMsg, isSubmitting: false });
            toast.error(errorMsg);
            return false;
        }
    },

    deleteAssignment: async (assignmentId, fileIdsToDelete = []) => {
        set({ isLoading: true, error: null }); 
        const user = await getCurrentUser();
        if (!user || !user.$id) {
            toast.error("Authentication error. Please log in again.");
            set({ isLoading: false });
            return;
        }
        const assignmentToDelete = get().assignments.find(a => a.$id === assignmentId);
        if (!assignmentToDelete) {
            toast.error("Assignment not found. It might have already been deleted.");
            set({ isLoading: false });
            return;
        }
        if (assignmentToDelete.assignedById !== user.$id) {
            toast.error("You do not have permission to delete this assignment.");
            set({ isLoading: false });
            return;
        }

        if (!APPWRITE_DATABASE_ID || !ASSIGNMENT_COLLECTION_ID || !ASSIGNMENT_FILES_BUCKET_ID) {
             const errorMsg = "System configuration error (ID missing). Cannot delete assignment.";
            set({ error: errorMsg, isLoading: false });
            toast.error(errorMsg);
            return;
        }

        try {
            if (fileIdsToDelete && fileIdsToDelete.length > 0) {
                for (const fileId of fileIdsToDelete) {
                    try {
                        await storage.deleteFile(ASSIGNMENT_FILES_BUCKET_ID, fileId);
                    } catch (fileDeleteError) {
                        console.warn(`Could not delete file ${fileId} from storage:`, fileDeleteError);
                        toast.warn(`An associated file (${fileId.substring(0,6)}...) could not be deleted. It might have already been removed.`);
                    }
                }
            }
            await databases.deleteDocument(APPWRITE_DATABASE_ID, ASSIGNMENT_COLLECTION_ID, assignmentId);

            const studentsToNotify = await get().getStudentsForNotification(assignmentToDelete.facultyId, assignmentToDelete.className, assignmentToDelete.sectionId);
            if (studentsToNotify.length > 0) {
                await createNotificationEntry({
                    title: `Assignment Removed: ${assignmentToDelete.title}`,
                    msg: `The assignment "${assignmentToDelete.title}" for ${assignmentToDelete.subjectName} which was due on ${assignmentToDelete.dateBS} has been removed.`,
                    to: studentsToNotify, valid: getTomorrowDateString(), sender: user.email,
                });
            }

            toast.success("Assignment deleted successfully!");
            set({ isLoading: false });
            get().fetchAssignments(); 
        } catch (e) {
            const errorMsg = e instanceof Error ? e.message : "An error occurred while deleting the assignment.";
            console.error("Error in deleteAssignment:", e);
            set({ error: errorMsg, isLoading: false });
            toast.error(errorMsg);
        }
    },

    getStudentsForNotification: async (facultyId: string, className: string, sectionId: string): Promise<string[]> => {
        if (!APPWRITE_DATABASE_ID || !STUDENT_COLLECTION_ID) {
            console.error("Student Collection ID or Database ID is not configured for notifications.");
            return [];
        }
        try {
            const studentQueries = [
                Query.equal('facultyId', facultyId),
                Query.equal('class', className),     
                Query.equal('section', sectionId),   
                Query.limit(100) 
            ];
            let studentsToNotify: string[] = [];
            let offset = 0;
            let response;
            do {
                response = await databases.listDocuments(APPWRITE_DATABASE_ID, STUDENT_COLLECTION_ID, [...studentQueries, Query.offset(offset)]);
                studentsToNotify = studentsToNotify.concat(response.documents.map(doc => doc.$id));
                offset += response.documents.length;
            } while (response.documents.length > 0 && studentsToNotify.length < response.total && response.documents.length === 100); 
            
            if (studentsToNotify.length === 0) {
                console.warn(`No students found for notification: Fac: ${facultyId}, Cls: ${className}, Sec: ${sectionId}`);
            }
            return studentsToNotify;
        } catch (error) {
            console.error("Error fetching students for notification:", error);
            toast.error("Could not fetch student list for sending notifications.");
            return [];
        }
    },
}));