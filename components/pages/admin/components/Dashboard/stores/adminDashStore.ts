// src/stores/adminDashStore.ts
import { create } from "zustand";
import {
  databases,
  DATABASE_ID,
  COLL_STUDENT_ID,
  COLL_TEACHER_ID,
  COLL_PARENT_ID,
  COLL_FACULTY_ID,
  COLL_SECTION_ID,
  COLL_EXAM_ID,
  // StudentDocument,
  TeacherDocument,
  // FacultyDocument, // Will define below or ensure it's imported correctly
  SectionDocument,
  ExamDocument,
  AppwriteDocument,
} from "../lib/appwriteConfig"; // Adjust path as needed
import { Query } from "appwrite";
import { getTodayDateString } from "../utils/dateUtils"; // Import the helper

// --- Define/Ensure Core Document Interfaces ---
// (If these are defined in appwriteConfig.ts, ensure they match this structure)

// Assuming AppwriteDocument provides $id, $createdAt, $updatedAt, $permissions
// export interface AppwriteDocument {
//   $id: string;
//   $collectionId: string;
//   $databaseId: string;
//   $createdAt: string;
//   $updatedAt: string;
//   $permissions: string[];
// }

export interface StudentDocument extends AppwriteDocument {
  // id: string; // Assuming $id is the primary student identifier unless a custom 'id' field exists
  name: string;
  class: string;
  facultyId: string; // Refers to FacultyDocument.id (custom ID)
  section: string;
  stdEmail?: string;
  parentId?: string;
  absent?: string[];
  leave?: string[];
  isLibraryMember: boolean;
}

export interface FacultyDocument extends AppwriteDocument {
  id: string; // Custom Faculty ID (used for linking)
  name: string;
  classes?: string[]; // Array of class names for this faculty
}

// ... other document interfaces (TeacherDocument, SectionDocument, ExamDocument)

// --- Interfaces for Stats and Data ---
interface AdminDashboardStats {
  totalStudents: number;
  totalTeachers: number;
  totalParents: number;
  totalFaculties: number;
  totalClasses: number;
  totalSections: number;
  studentsWithLibrary: number;
  totalExams: number;
  publishedExams: number;
}

export interface FacultyAttendanceStat {
  facultyId: string; // This will be FacultyDocument.id
  facultyName: string;
  totalStudents: number;
  presentStudents: number;
  absentStudentsCount: number;
  attendanceRate: number; // Percentage
}

// New: Interface for class-level attendance stats (used in component, not directly in store state yet)
export interface ClassAttendanceStat {
  className: string;
  totalStudents: number;
  presentStudents: number;
  absentStudentsCount: number;
  attendanceRate: number;
}

interface AdminDashboardData {
  students: StudentDocument[];
  teachers: TeacherDocument[];
  parents: AppwriteDocument[];
  faculties: FacultyDocument[];
  sections: SectionDocument[];
  exams: ExamDocument[];
  todayAttendanceByFaculty: FacultyAttendanceStat[];
  absentStudentsToday: StudentDocument[];
}

interface AdminDashState {
  loading: boolean;
  error: string | null;
  stats: AdminDashboardStats | null;
  data: AdminDashboardData | null;
  fetchDashboardData: () => Promise<void>;
}

const useAdminDashStore = create<AdminDashState>((set) => ({
  loading: false,
  error: null,
  stats: null,
  data: null,
  fetchDashboardData: async () => {
    set({ loading: true, error: null });
    try {
      const [
        studentResponse,
        teacherResponse,
        parentResponse,
        facultyResponse,
        sectionResponse,
        examResponse,
      ] = await Promise.all([
        databases.listDocuments<StudentDocument>(DATABASE_ID, COLL_STUDENT_ID, [
          Query.limit(5000),
        ]),
        databases.listDocuments<TeacherDocument>(DATABASE_ID, COLL_TEACHER_ID, [
          Query.limit(1000),
        ]),
        databases.listDocuments(DATABASE_ID, COLL_PARENT_ID, [
          Query.limit(5000),
        ]),
        databases.listDocuments<FacultyDocument>(DATABASE_ID, COLL_FACULTY_ID, [
          Query.limit(100),
        ]),
        databases.listDocuments<SectionDocument>(DATABASE_ID, COLL_SECTION_ID, [
          Query.limit(500),
        ]),
        databases.listDocuments<ExamDocument>(DATABASE_ID, COLL_EXAM_ID, [
          Query.limit(1000),
        ]),
      ]);

      const students = studentResponse.documents;
      const teachers = teacherResponse.documents;
      const parents = parentResponse.documents;
      const faculties = facultyResponse.documents;
      const sections = sectionResponse.documents;
      const exams = examResponse.documents;

      const totalStudents = students.length;
      const totalTeachers = teachers.length;
      const totalParents = parents.length;
      const totalFaculties = faculties.length;
      const totalSections = sections.length;

      const uniqueClasses = new Set<string>();
      students.forEach((s) => {
        if (s.class) uniqueClasses.add(s.class);
      });
      sections.forEach((sec) => {
        if (sec.class) uniqueClasses.add(sec.class);
      });
      const totalClasses = uniqueClasses.size;

      const studentsWithLibrary = students.filter(
        (s) => s.isLibraryMember
      ).length;
      const totalExams = exams.length;
      const publishedExams = exams.filter((e) => e.isPublished).length;

      const todayDateStr = getTodayDateString();
      const calculatedTodayAttendanceByFaculty: FacultyAttendanceStat[] = [];

      for (const faculty of faculties) {
        // IMPORTANT: student.facultyId stores Appwrite's $id of the faculty document.
        // So, we match student.facultyId with faculty.$id.
        const facultyStudents = students.filter(
          (s) => s.facultyId === faculty.$id
        ); // USE $id
        const totalFacultyStudents = facultyStudents.length;
        let absentFacultyStudentsCount = 0;

        facultyStudents.forEach((student) => {
          if (
            Array.isArray(student.absent) &&
            student.absent.includes(todayDateStr)
          ) {
            absentFacultyStudentsCount++;
          }
        });

        const presentFacultyStudents =
          totalFacultyStudents - absentFacultyStudentsCount;
        const attendanceRate =
          totalFacultyStudents > 0
            ? (presentFacultyStudents / totalFacultyStudents) * 100
            : 0;

        calculatedTodayAttendanceByFaculty.push({
          facultyId: faculty.$id, // STORE faculty's $id, as this is what student.facultyId links to
          facultyName: faculty.name,
          totalStudents: totalFacultyStudents,
          presentStudents: presentFacultyStudents,
          absentStudentsCount: absentFacultyStudentsCount,
          attendanceRate: parseFloat(attendanceRate.toFixed(2)),
        });
      }

      const calculatedAbsentStudentsToday = students.filter(
        (student) =>
          Array.isArray(student.absent) && student.absent.includes(todayDateStr)
      );

      set({
        loading: false,
        stats: {
          totalStudents,
          totalTeachers,
          totalParents,
          totalFaculties,
          totalClasses,
          totalSections,
          studentsWithLibrary,
          totalExams,
          publishedExams,
        },
        data: {
          students,
          teachers,
          parents,
          faculties,
          sections,
          exams,
          todayAttendanceByFaculty: calculatedTodayAttendanceByFaculty,
          absentStudentsToday: calculatedAbsentStudentsToday,
        },
      });
    } catch (err: any) {
      console.error("Failed to fetch admin dashboard data:", err);
      set({ loading: false, error: err.message || "Failed to fetch data" });
    }
  },
}));

export default useAdminDashStore;

// Ensure ../lib/appwriteConfig also exports correctly typed StudentDocument, FacultyDocument, etc.
// or define them comprehensively here as done for StudentDocument and FacultyDocument.
