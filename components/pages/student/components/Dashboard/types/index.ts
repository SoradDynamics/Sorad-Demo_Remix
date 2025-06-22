// src/types.ts

export interface AppwriteDocument {
    $id: string;
    $createdAt: string;
    $updatedAt: string;
    $permissions: string[];
    $collectionId: string;
    $databaseId: string;
  }
  
  export interface Student extends AppwriteDocument {
    name: string;
    class: string; // Name of the class (e.g., "10th")
    facultyId: string; // ID of the faculty
    section: string; // Name of the section (e.g., "A")
    stdEmail: string;
    parentId: string;
    absent: string[];
    leave: string[];
  }
  
  export interface Faculty extends AppwriteDocument {
    name: string;
    classes: string[];
  }
  
  export interface Assignment extends AppwriteDocument {
    title: string;
    description: string;
    facultyId: string;
    className: string; // e.g., "10th"
    sectionId: string;
    subjectName: string;
    assignedById: string;
    assignedByEmail: string;
    dateBS: string; // Nepali date (e.g., "2080-05-20")
    dateAD: string; // Gregorian date (e.g., "2023-09-06")
    fileNames: string[];
    status: string;
    sectionName: string;
  }
  
  export interface StudentDetailsProps {
    name: string;
    className: string;
    facultyName: string;
    sectionName: string;
  }
  
  export interface UpcomingAssignment {
    id: string;
    title: string;
    subjectName: string;
    dateAD: string; // Still needed for internal sorting if you prefer
    dateBS: string; // For display
  }

  export interface SubjectDetail {
    name: string;         // Subject name e.g., "eng"
    date: string;         // ISO Date string e.g., "2025-08-20T18:15:00.000Z"
    theoryFM: number | string;
    theoryPM: number | string;
    hasPractical: boolean;
    practicalFM?: number | string; // Optional based on hasPractical
    practicalPM?: number | string; // Optional
  }
  
  export interface Exam extends AppwriteDocument {
    title: string;
    type: string; // e.g., "Terminal", "Unit Test"
    faculty: string[]; // Array of faculty IDs or names (adjust based on actual storage)
    class: string[];   // Array of class names (e.g., ["10th", "11th"]) - student's class needs to be in this
    desc?: string;
    section: string[]; // Array of section names or IDs - student's section might need to be in this
    subjectDetails_json: string; // JSON string
  }
  
  // Interface for the items we'll display in the list
  export interface UpcomingExamDisplay {
    id: string; // Combination of Exam ID and subject name, or just a unique generated ID
    examTitle: string;
    subjectName: string;
    date: string; // ISO Date string
  }