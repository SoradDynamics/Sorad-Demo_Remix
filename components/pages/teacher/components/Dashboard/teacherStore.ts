import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { Models } from 'appwrite';
import { account, databases, Query } from '~/utils/appwrite'; // Your Appwrite client instances

import { useSchoolStore } from '~/store/schoolStore';
export const DB_Id = () => useSchoolStore.getState().dbId;
// console.log("DB_Id from schoolStore:", DB_Id);


const DATABASE_ID = DB_Id;
const TEACHER_COLLECTION_ID = import.meta.env.VITE_APPWRITE_TEACHER_COLLECTION_ID;


// Define the Teacher interface
export interface Teacher {
  $id: string;
  name: string;
  email: string;
  // Add other fields from coll-teacher if they exist
}

interface TeacherDashboardState {
  appwriteUser: Models.User<Models.Preferences> | null; // Currently authenticated Appwrite user
  teacherProfile: Teacher | null; // Profile from coll-teacher
  isLoading: boolean;
  isInitialized: boolean; // To track if initial fetch attempt has been made
  error: string | null;
  initializeAuthAndProfile: () => Promise<void>; // Fetches auth user then teacher profile
  logout: () => Promise<void>; // Logout will clear state, navigation happens elsewhere if needed
  resetStore: () => void;
}

export const useTeacherStore = create<TeacherDashboardState>()(
  devtools(
    (set, get) => ({
      appwriteUser: null,
      teacherProfile: null,
      isLoading: false,
      isInitialized: false,
      error: null,

      initializeAuthAndProfile: async () => {
        if (get().isLoading) return;
        if (get().isInitialized && get().appwriteUser) return;

        set({ isLoading: true, error: null });
        let authenticatedUser: Models.User<Models.Preferences> | null = null;

        try {
          authenticatedUser = await account.get();
          set({ appwriteUser: authenticatedUser });
        } catch (authError: any) {
          console.error('Authentication error:', authError);
          let errorMessage = 'Failed to retrieve user session.';
          if (authError.code === 401) {
            errorMessage = 'No active session. Please log in.';
          } else if (authError.message) {
            errorMessage = authError.message;
          }
          set({ isLoading: false, error: errorMessage, appwriteUser: null, teacherProfile: null, isInitialized: true });
          return;
        }

        if (authenticatedUser && authenticatedUser.email) {
          try {
            const response = await databases.listDocuments<Teacher>(
              DATABASE_ID,
              TEACHER_COLLECTION_ID,
              [Query.equal('email', authenticatedUser.email), Query.limit(1)]
            );
            if (response.documents.length > 0) {
              set({ teacherProfile: response.documents[0], isLoading: false, error: null, isInitialized: true });
            } else {
              set({
                teacherProfile: null, isLoading: false,
                error: `Teacher profile not found for email: ${authenticatedUser.email}. Please contact administration.`,
                isInitialized: true,
              });
            }
          } catch (profileError: any) {
            console.error('Failed to fetch teacher profile:', profileError);
            set({
              teacherProfile: null, isLoading: false,
              error: profileError.message || 'Failed to fetch teacher profile data.',
              isInitialized: true,
            });
          }
        } else if (authenticatedUser && !authenticatedUser.email) {
            set({
                isLoading: false,
                error: 'Authenticated user does not have an email address. Cannot fetch teacher profile.',
                teacherProfile: null, isInitialized: true,
            });
        } else {
             set({ isLoading: false, isInitialized: true });
        }
      },

      logout: async () => {
        set({ isLoading: true });
        try {
          await account.deleteSession('current');
        } catch (error: any) {
          console.error('Logout failed:', error);
          // Set an error message, but still reset local state
          set({ error: error.message || 'Logout failed.' });
        } finally {
            get().resetStore(); // Clear local state regardless of Appwrite call success
            set({isLoading: false}); // Ensure loading is false
            // Navigation after logout will now need to be handled by whatever component calls logout,
            // or the user manually navigates.
        }
      },
      resetStore: () => {
        set({
          appwriteUser: null, teacherProfile: null,
          isLoading: false, isInitialized: false, error: null,
        });
      }
    }),
    { name: 'TeacherDashboardStore' }
  )
);