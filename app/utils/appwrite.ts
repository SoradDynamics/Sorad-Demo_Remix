// import { Client, Account, ID } from "appwrite";

// const client = new Client()
//   .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
//   .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID);

// export const account = new Account(client);
// export const iD = ID
// export default client;

// ~/utils/appwrite.ts
import { Client, Account, ID, Databases, Storage, Query, Functions, Models } from "appwrite";
import { constants, updateGlobalSchoolConfig } from "./constant";
const client = new Client();

function initializeAppwriteClient() {
    const endpoint = import.meta.env.VITE_APPWRITE_ENDPOINT;
    const projectId = import.meta.env.VITE_APPWRITE_PROJECT_ID;

    if (!endpoint) {
        console.error("VITE_APPWRITE_ENDPOINT is not defined in your environment variables!");
        return;
    }

    if (!projectId) {
        console.error("VITE_APPWRITE_PROJECT_ID is not defined in your environment variables!");
        return; 
    }

    client
        .setEndpoint(endpoint)
        .setProject(projectId);

    // // console.log("Appwrite Client initialized successfully.");
    // // console.log("Endpoint:", endpoint); 
    // // console.log("Project ID:", projectId);
}

initializeAppwriteClient(); 

export const account = new Account(client);
export const iD = ID; 
export {ID, Query};
export const databases = new Databases (client);
export const storage = new Storage(client);
export const functions = new Functions(client); // <<< Initialize and export Functions
export default client;

export type Document<T> = T & Models.Document;



async function getCurrentUserEmail() {
    try {
      const user = await account.get();
      // console.log(user.email); // Print email
      return user.email;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  }
  
export { getCurrentUserEmail };

export const getCurrentUser = async (): Promise<Models.User<Models.Preferences> | null> => {
  try {
    const user = await account.get();
    return user;
  } catch (error) {
    // console.warn("AppwriteAuth: No active session or error fetching user.", error);
    return null;
  }
};


export async function getCurrentUserEmail1(): Promise<string | null> {
  try {
    const user: Models.User<Models.Preferences> = await account.get();
    return user.email;
  } catch (error) {
    console.error("Failed to fetch user:", error);
    return null;
  }
}



// export const APPWRITE_DATABASE_ID= import.meta.env.VITE_APPWRITE_DATABASE_ID;

import { useSchoolStore } from '~/store/schoolStore';
export const APPWRITE_DATABASE_ID = () => useSchoolStore.getState().dbId;


// export const APPWRITE_DATABASE_ID= constants.DB_ID;

export const FACULTIES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_FACULTY_COLLECTION_ID;
export const SECTIONS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_SECTION_COLLECTION_ID;
export const FEES_CONFIG_COLLECTION_ID = import.meta.env.VITE_APPWRITE_FEE_COLLECTION_ID;
export const EXAMS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_EXAM_COLLECTION_ID;
export const STUDENTS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_STUDENT_COLLECTION_ID;
export const PARENTS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_PARENT_COLLECTION_ID;
export const NOTIFICATIONS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_NOTIFY_COLLECTION_ID;
export const ROUTINE_COLLECTION_ID = import.meta.env.VITE_APPWRITE_ROUTINE_COLLECTION_ID;

export const TEACHER_COLLECTION_ID = import.meta.env.VITE_APPWRITE_TEACHER_COLLECTION_ID;
export const TEACHERS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_TEACHER_COLLECTION_ID;

export const APPWRITE_BUCKET_GALLERY_ID = import.meta.env.VITE_APPWRITE_GALLERY_BUCKET_ID as string;

export const GALLERY_BUCKET_ID = import.meta.env.VITE_APPWRITE_GALLERY_BUCKET_ID as string;
export const GALLERY_GROUPS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_GALLERY_GROUPS_COLLECTION_ID as string;
export const GALLERY_PHOTOS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_GALLERY_PHOTOS_COLLECTION_ID as string;

export const ALL_FACULTIES_ID = 'ALL_FACULTIES_SHARED_ID'; // Unique ID for "All Faculties" option

export const ASSIGNMENT_FILES_BUCKET_ID = import.meta.env.VITE_APPWRITE_ASSIGNMENT_FILES_BUCKET_ID;
export const ASSIGNMENT_COLLECTION_ID = import.meta.env.VITE_APPWRITE_ASSIGNMENT_COLLECTION_ID;

export const NOTES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_NOTES_COLLECTION_ID;


export const LESSON_PLAN_COLLECTION_ID = import.meta.env.VITE_APPWRITE_LESSON_PLAN_COLLECTION_ID;
export const LESSON_STUDENT_REVIEW_COLLECTION_ID = import.meta.env.VITE_APPWRITE_LESSON_STUDENT_REVIEW_COLLECTION_ID;

export const REVIEWS_COLLECTION_ID = import.meta.env.VITE_APPWRITE_REVIEWS_COLLECTION_ID;

export const APPWRITE_BUCKET_ID_METADATA = import.meta.env.VITE_APPWRITE_BUCKET_ID_METADATA;



