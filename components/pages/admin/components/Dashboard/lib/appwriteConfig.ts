// src/lib/appwriteConfig.ts
import { Client, Databases, Account, Models } from 'appwrite';
import { constants } from '~/utils/constant';

const client = new Client();
client
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT as string)
    .setProject(import.meta.env.VITE_APPWRITE_PROJECT_ID as string);

export const account = new Account(client);
export const databases = new Databases(client);

import { useSchoolStore } from '~/store/schoolStore';
const DB_ID = () => useSchoolStore.getState().dbId;
const DB_Id = DB_ID as unknown as string;

export const DATABASE_ID = DB_Id as string;

export const COLL_STUDENT_ID = 'coll-student';
export const COLL_TEACHER_ID = 'coll-teacher';
export const COLL_PARENT_ID = 'coll-parent';
export const COLL_FACULTY_ID = 'coll-faculty';
export const COLL_SECTION_ID = 'coll-section';
export const COLL_EXAM_ID = 'coll-exam';
export const COLL_ASSIGNMENT_ID = 'coll-assignment';
// Add other collection IDs as needed

// Basic type for documents if you don't have detailed interfaces everywhere
export type AppwriteDocument = Models.Document;

// More specific types (optional, but good practice)
export interface StudentDocument extends Models.Document {
  name: string;
  class: string;
  facultyId: string;
  section: string;
  stdEmail: string;
  parentId?: string;
  gender?: 'male' | 'female' | 'other'; // ASSUMPTION: Add this field to your coll-student
  isLibraryMember: boolean;
}

export interface TeacherDocument extends Models.Document {
  name: string;
  email: string;
  authUserId: string;
}

export interface FacultyDocument extends Models.Document {
  id: string; // Appwrite $id will be used
  name: string;
  classes?: string; // Assuming this might be a comma-separated string or JSON string
}

export interface SectionDocument extends Models.Document {
  id: string; // Appwrite $id will be used
  name: string;
  class: string;
  facultyId: string;
  // subjects: string[];
  // class_teacher: string;
}

export interface ExamDocument extends Models.Document {
  title: string;
  type: string;
  isPublished: boolean;
  // ... other fields
}

// You can define more interfaces for other collections as needed