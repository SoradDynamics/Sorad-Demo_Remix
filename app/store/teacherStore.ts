// src/store/teacherStore.ts
import { create } from 'zustand';
import { databases } from '~/utils/appwrite';
import { ID } from 'appwrite';
import { Teacher } from 'types/teacher';
// import { constants } from '~/utils/constant'; // Not used in the provided snippet

import { getSchoolDomain, useSchoolStore } from './schoolStore'; // Adjusted path if necessary, useSchoolStore imported

// --- Environment Variables ---
const API_BASE_URL = import.meta.env.VITE_SERVER_URL;
const TEACHER_COLLECTION_ID = import.meta.env.VITE_APPWRITE_TEACHER_COLLECTION_ID;

// Removed problematic APPWRITE_DATABASE_ID global constant definition.
// It will be fetched dynamically using useSchoolStore.getState().dbId within each function.

if (!API_BASE_URL) {
    console.error("FATAL ERROR: VITE_SERVER_URL is not defined in .env");
}
// Removed check for APPWRITE_DATABASE_ID here as it's dynamic now.
if (!TEACHER_COLLECTION_ID) {
    console.error("FATAL ERROR: VITE_APPWRITE_TEACHER_COLLECTION_ID is not defined in .env");
}

const AUTH_API_URL = `${API_BASE_URL}/api/users/auth`;

// --- Helper Types ---
export interface TeacherFormData {
    name: string;
    subject: string[];
    level: string[];
    qualification: string;
    email: string;
}

interface SignupResponse {
    success: boolean;
    message: string;
    userId?: string;
    email?: string;
    name?: string;
    labels?: string[];
}

interface DeleteResponse {
    success: boolean;
    message: string;
}

// --- Zustand Store Definition ---
interface TeacherState {
    teacherData: Teacher[];
    isLoading: boolean;
    isFetching: boolean;
    error: string | null;
    fetchTeachersData: () => Promise<void>;
    updateTeacherData: (teacherUpdateData: Pick<Teacher, '$id' | 'name' | 'subject' | 'level' | 'qualification' | 'email'>) => Promise<void>;
    deleteTeacherData: (teacherDocId: string) => Promise<void>;
    addTeacherData: (teacherFormData: TeacherFormData) => Promise<Teacher | null>;
}

const generateTemporaryPassword = (): string => {
    console.warn("SECURITY WARNING: Using insecure temporary password generation!");
    return `TempPass_${Math.random().toString(36).slice(-8)}`;
};

export const useTeacherStore = create<TeacherState>((set, get) => ({
    teacherData: [],
    isLoading: false,
    isFetching: false,
    error: null,

    fetchTeachersData: async () => {
        const currentDbId = useSchoolStore.getState().dbId;
        if (!currentDbId || !TEACHER_COLLECTION_ID) {
            const errorMsg = `Appwrite configuration missing: ${!currentDbId ? 'Database ID' : ''}${!currentDbId && !TEACHER_COLLECTION_ID ? ', ' : ''}${!TEACHER_COLLECTION_ID ? 'Teacher Collection ID' : ''}.`;
            console.error("[fetchTeachersData]", errorMsg);
            set({ isFetching: false, error: errorMsg });
            return;
        }
        set({ isFetching: true, error: null });
        try {
            const response = await databases.listDocuments(
                currentDbId,
                TEACHER_COLLECTION_ID
            );
            const teachers = response.documents as unknown as Teacher[];
            set({ teacherData: teachers, isFetching: false });
        } catch (error: any) {
            console.error('Error fetching teachers data:', error);
            const errorMsg = error.message || 'Failed to fetch teachers data';
            set({ error: errorMsg, isFetching: false });
        }
    },

    updateTeacherData: async (teacherUpdateData) => {
        const currentDbId = useSchoolStore.getState().dbId;
        if (!currentDbId || !TEACHER_COLLECTION_ID) {
            const errorMsg = `Appwrite configuration missing for update: ${!currentDbId ? 'Database ID' : ''}${!currentDbId && !TEACHER_COLLECTION_ID ? ', ' : ''}${!TEACHER_COLLECTION_ID ? 'Teacher Collection ID' : ''}.`;
            console.error("[updateTeacherData]", errorMsg);
            set({ isLoading: false, error: errorMsg });
            throw new Error(errorMsg);
        }
        set({ isLoading: true, error: null });
        try {
            const updatePayload = {
                name: teacherUpdateData.name,
                subject: teacherUpdateData.subject,
                level: teacherUpdateData.level,
                qualification: teacherUpdateData.qualification,
                email: teacherUpdateData.email,
            };

            const updatedDocument = await databases.updateDocument(
                currentDbId,
                TEACHER_COLLECTION_ID,
                teacherUpdateData.$id,
                updatePayload
            );
            const updatedTeacher = updatedDocument as unknown as Teacher;
            set((state) => ({
                teacherData: state.teacherData.map((t) =>
                    t.$id === updatedTeacher.$id ? { ...t, ...updatedTeacher } : t
                ),
                isLoading: false,
            }));
        } catch (error: any) {
            console.error('Error updating teacher document:', error);
            const errorMsg = error.message || 'Failed to update teacher document';
            set({ error: errorMsg, isLoading: false });
            throw error;
        }
    },

    deleteTeacherData: async (teacherDocId) => {
        // console.log(`[deleteTeacherData] Initiating delete for document ID: ${teacherDocId}`);
        const currentDbId = useSchoolStore.getState().dbId;

        if (!API_BASE_URL || !currentDbId || !TEACHER_COLLECTION_ID) {
             const errorMsg = `Config missing for teacher deletion: ${!API_BASE_URL ? 'API URL, ' : ''}${!currentDbId ? 'Database ID, ' : ''}${!TEACHER_COLLECTION_ID ? 'Collection ID' : ''}.`.replace(/, $/, '.');
             console.error("[deleteTeacherData]", errorMsg);
             set({ isLoading: false, error: errorMsg });
             throw new Error(errorMsg);
        }
        set({ isLoading: true, error: null });
        let authUserIdToDelete: string | null | undefined = null;

        try {
            const teacherToDelete = get().teacherData.find(t => t.$id === teacherDocId);

            if (teacherToDelete) {
                // console.log("[deleteTeacherData] Found teacher in state:", JSON.parse(JSON.stringify(teacherToDelete)));
                authUserIdToDelete = teacherToDelete.authUserId; // Assuming authUserId field exists and stores the Auth User ID
                if (!authUserIdToDelete) { // Also check the 'id' field if that's where it might be
                    authUserIdToDelete = (teacherToDelete as any).id; // Or teacherToDelete.id if Teacher type has id for auth user
                    if (authUserIdToDelete === teacherToDelete.$id) authUserIdToDelete = null; // Don't delete if id is doc id
                }

                if (!authUserIdToDelete) {
                    console.warn(`[deleteTeacherData] authUserId (or custom 'id' attribute for auth) is missing or empty on teacher object for doc ID: ${teacherDocId}. Teacher object:`, teacherToDelete);
                }
            } else {
                console.warn(`[deleteTeacherData] Teacher document ${teacherDocId} not found in local state. Cannot get authUserId directly.`);
            }

            // console.log(`[deleteTeacherData] authUserId to delete from Auth: ${authUserIdToDelete}`);

            if (authUserIdToDelete) {
                const deleteAuthUserUrl = `${AUTH_API_URL}/${authUserIdToDelete}`;
                // console.log(`[deleteTeacherData] Attempting to delete auth user via backend: ${deleteAuthUserUrl}`);
                try {
                    const response = await fetch(deleteAuthUserUrl, {
                        method: 'DELETE',
                    });
                    const deleteResultText = await response.text();
                    // console.log(`[deleteTeacherData] Backend response status for auth delete: ${response.status}`);
                    // console.log(`[deleteTeacherData] Backend response text for auth delete: ${deleteResultText}`);

                    let deleteResult: DeleteResponse;
                    try {
                        deleteResult = JSON.parse(deleteResultText);
                    } catch (e) {
                        console.error("[deleteTeacherData] Failed to parse backend JSON response for auth delete:", e);
                        if (!response.ok) {
                             throw new Error(`Auth user deletion failed with status ${response.status}. Response: ${deleteResultText}`);
                        }
                        deleteResult = { success: false, message: "Invalid JSON response from backend" };
                    }

                    if (!response.ok || !deleteResult.success) {
                        console.warn(`[deleteTeacherData] Backend failed to delete auth user ${authUserIdToDelete}. Message: ${deleteResult.message || `HTTP ${response.status}`}. Full response:`, deleteResult);
                    } else {
                        // console.log(`[deleteTeacherData] Successfully deleted auth user ${authUserIdToDelete} via backend.`);
                    }
                } catch (authDeleteError: any) {
                     console.warn(`[deleteTeacherData] Network or other error during auth user deletion for ${authUserIdToDelete}:`, authDeleteError);
                }
            } else {
                 // console.log(`[deleteTeacherData] No authUserId found or teacher not in state for document ${teacherDocId}. Skipping backend auth user deletion.`);
            }

            // console.log(`[deleteTeacherData] Attempting to delete teacher document from DB: ${teacherDocId}`);
            await databases.deleteDocument(
                currentDbId,
                TEACHER_COLLECTION_ID,
                teacherDocId
            );
            // console.log(`[deleteTeacherData] Successfully deleted teacher document from DB: ${teacherDocId}`);

            set((state) => ({
                teacherData: state.teacherData.filter((teacher) => teacher.$id !== teacherDocId),
                isLoading: false,
            }));
            // console.log(`[deleteTeacherData] Successfully updated frontend state.`);

        } catch (error: any) {
            console.error('[deleteTeacherData] Error during overall teacher deletion process:', error);
            const errorMsg = error.message || 'Failed to delete teacher';
            set({ error: errorMsg, isLoading: false });
            throw error;
        }
    },

    addTeacherData: async (teacherFormData) => {
        const currentDbId = useSchoolStore.getState().dbId; // Get DB ID dynamically

        if (!API_BASE_URL || !currentDbId || !TEACHER_COLLECTION_ID || !AUTH_API_URL) {
            let missingParts: string[] = [];
            if (!API_BASE_URL) missingParts.push("API_BASE_URL");
            if (!currentDbId) missingParts.push("Appwrite Database ID (from schoolStore)");
            if (!TEACHER_COLLECTION_ID) missingParts.push("TEACHER_COLLECTION_ID");
            if (!AUTH_API_URL) missingParts.push("AUTH_API_URL");

            const errorMsg = `Configuration missing for adding teacher: ${missingParts.join(', ')}.`;
            console.error("[addTeacherData]", errorMsg);
            set({ isLoading: false, error: errorMsg });
            return null;
        }
        set({ isLoading: true, error: null });
        let createdAuthUserId: string | null = null;

        const schoolDomain = getSchoolDomain();

        try {
            const tempPassword = generateTemporaryPassword();
            const signupPayload = {
                email: teacherFormData.email,
                password: tempPassword,
                name: teacherFormData.name,
                labels: ['teacher'],
                domain: schoolDomain,
            };

            // console.log(`[addTeacherData] Attempting signup via backend for teacher: ${teacherFormData.email} with domain: ${schoolDomain}`);
            const signupResponse = await fetch(`${AUTH_API_URL}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(signupPayload),
            });
            const signupResultText = await signupResponse.text(); // Get text for better debugging
            let signupResult: SignupResponse;
            try {
                signupResult = JSON.parse(signupResultText);
            } catch (e) {
                console.error("[addTeacherData] Failed to parse signup JSON response:", e, "Response text:", signupResultText);
                throw new Error(`Auth user creation failed: Invalid JSON response from server. Status: ${signupResponse.status}`);
            }

            if (!signupResponse.ok || !signupResult.success || !signupResult.userId) {
                throw new Error(`Auth user creation failed: ${signupResult.message || `HTTP ${signupResponse.status}`}`);
            }
            createdAuthUserId = signupResult.userId;
            // console.log(`[addTeacherData] Successfully created auth user via backend: ${createdAuthUserId} for teacher ${teacherFormData.email}`);

            const addDocumentPayload = {
                id: createdAuthUserId, // *** FIX: Save Appwrite Auth User ID to the 'id' attribute ***
                authUserId: createdAuthUserId, // Keep this if 'authUserId' attribute is also used/needed
                name: teacherFormData.name,
                subject: teacherFormData.subject,
                level: teacherFormData.level,
                qualification: teacherFormData.qualification,
                email: teacherFormData.email,
                // schoolDomain: schoolDomain, // Optionally store domain if needed
            };

            // console.log(`[addTeacherData] Attempting to create teacher document for: ${teacherFormData.email} with payload:`, JSON.stringify(addDocumentPayload));
            const newDocument = await databases.createDocument(
                currentDbId,
                TEACHER_COLLECTION_ID,
                ID.unique(), // Appwrite document $id will be auto-generated
                addDocumentPayload
            );
            // console.log(`[addTeacherData] Successfully created teacher document: ${newDocument.$id}, content:`, JSON.stringify(newDocument));

            // The 'newDocument' object from Appwrite will contain all fields, including:
            // - $id (the Appwrite document ID)
            // - id (the authUserId we just saved)
            // - authUserId (also the authUserId)
            // - name, email, etc.

            // The 'Teacher' type mapping:
            // If your `Teacher` type's `id` field is intended to be an alias for Appwrite's `$id` (document ID),
            // the `id: newDocument.$id` line below is correct.
            // If your `Teacher` type's `id` field is intended to reflect the custom `id` attribute
            // (which now stores authUserId), then you should REMOVE `id: newDocument.$id,` line.
            // `...newDocument` would then correctly populate `addedTeacher.id` with `authUserId`.
            // For now, assuming Teacher.id is an alias for $id as per existing code structure.
            const addedTeacher: Teacher = {
                ...newDocument,
                id: newDocument.$id, // This makes `addedTeacher.id` in frontend state represent the Appwrite Document ID.
                                     // `addedTeacher.authUserId` will still hold the auth user ID from `...newDocument`.
                                     // The DB attribute `id` will correctly hold the auth user ID.
                assignments: newDocument.assignments || [],
                notes: newDocument.notes || [],
                salary: newDocument.salary || [],
            } as unknown as Teacher;


            set((state) => ({
                teacherData: [...state.teacherData, addedTeacher],
                isLoading: false,
            }));
            return addedTeacher;

        } catch (error: any) {
            console.error('[addTeacherData] Error during teacher creation process:', error);

            if (createdAuthUserId && error.message && !error.message.startsWith('Auth user creation failed')) {
                console.warn(`[addTeacherData] DB document creation failed after auth user ${createdAuthUserId} was created. Attempting rollback of auth user.`);
                try {
                    const rollbackResponse = await fetch(`${AUTH_API_URL}/user/${createdAuthUserId}`, { method: 'DELETE' });
                    const rollbackResultText = await rollbackResponse.text();
                    let rollbackResult: DeleteResponse;
                    try {
                        rollbackResult = JSON.parse(rollbackResultText);
                    } catch(e) {
                         console.error("[addTeacherData] Failed to parse rollback JSON response:", e, "Response text:", rollbackResultText);
                         rollbackResult = { success: false, message: `Invalid JSON response during rollback. Status: ${rollbackResponse.status}`};
                    }

                    if (rollbackResponse.ok && rollbackResult.success) {
                        // console.log(`[addTeacherData] Successfully rolled back (deleted) auth user ${createdAuthUserId}.`);
                    } else {
                        console.error(`[addTeacherData] FAILED TO ROLLBACK auth user ${createdAuthUserId}: ${rollbackResult.message || `HTTP ${rollbackResponse.status}`}`);
                    }
                } catch (rollbackError: any) {
                    console.error(`[addTeacherData] Network or other error during auth user ${createdAuthUserId} rollback:`, rollbackError);
                }
            }

            const errorMsg = error.message || 'Failed to add teacher';
            set({ error: errorMsg, isLoading: false });
            return null;
        }
    },
}));