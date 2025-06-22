import React, { useEffect } from 'react';
import {
  account,
  databases,
  Query,
  APPWRITE_DATABASE_ID as  DATABASE_ID,
  STUDENTS_COLLECTION_ID as COLLECTION_STUDENT_ID,
  FACULTIES_COLLECTION_ID as COLLECTION_FACULTY_ID,
  ASSIGNMENT_COLLECTION_ID as COLLECTION_ASSIGNMENT_ID,
  EXAMS_COLLECTION_ID as  COLLECTION_EXAM_ID,
} from '~/utils/appwrite';
import { Student, Faculty, Assignment, Exam, SubjectDetail, UpcomingExamDisplay } from './types';
import { useStudentDashboardStore } from './store/useStudentDashboardStore';

import StudentDetailsCard from './components/StudentDetailsCard';
import UpcomingAssignmentsList from './components/UpcomingAssignmentsList';
import UpcomingExamsList from './components/UpcomingExamsList';

import PerfectScrollbar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";

const ExclamationTriangleIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
   <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
 </svg>
);

const ComingSoonCard: React.FC = () => (
  <div className="bg-gray-100 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col items-center justify-center text-center h-full min-h-[200px]">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400 mb-4">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
    </svg>
    <h2 className="text-xl font-semibold text-gray-700 mb-2">Coming Soon...</h2>
    <p className="text-gray-500">New tools, components and updates are coming soon!</p>
  </div>
);


const StudentDashboard: React.FC = () => {
  const {
    loading,
    error,
    studentDetails,
    setLoading,
    setError,
    setStudentDetails,
    setUpcomingAssignments,
    setUpcomingExams,
    reset,
  } = useStudentDashboardStore();

  useEffect(() => {
    // // console.log('[DEBUG] StudentDashboard: useEffect triggered.');
    const fetchDashboardData = async () => {
      setLoading(true);
      setError(null);

      try {
        const user = await account.get();
        const userEmail = user.email;
        if (!userEmail) {
          setError('User email not found. Please log in.'); setLoading(false); return;
        }

        const studentResponse = await databases.listDocuments<Student>(
          DATABASE_ID, COLLECTION_STUDENT_ID, [Query.equal('stdEmail', userEmail), Query.limit(1)]
        );
        if (studentResponse.documents.length === 0) {
          setError('Student record not found.'); setLoading(false); return;
        }
        const student = studentResponse.documents[0];

        let facultyName = 'N/A';
        if (student.facultyId) {
          try {
            const facultyResponse = await databases.getDocument<Faculty>(
              DATABASE_ID, COLLECTION_FACULTY_ID, student.facultyId
            );
            facultyName = facultyResponse.name;
          } catch (facultyError) {
            // console.warn('[DEBUG] Error fetching faculty details:', facultyError);
            facultyName = 'N/A';
          }
        }
        setStudentDetails({
          name: student.name, className: student.class, facultyName: facultyName, sectionName: student.section,
        });

        const todayString = new Date().toISOString().split('T')[0];
        const assignmentsResponse = await databases.listDocuments<Assignment>(
          DATABASE_ID, COLLECTION_ASSIGNMENT_ID, [
            Query.equal('className', student.class),
            Query.equal('sectionName', student.section),
            Query.greaterThanEqual('dateAD', todayString),
            Query.orderAsc('dateAD'), Query.limit(5),
          ]
        );
        setUpcomingAssignments(assignmentsResponse.documents.map(a => ({
          id: a.$id, title: a.title, subjectName: a.subjectName, dateAD: a.dateAD, dateBS: a.dateBS,
        })));

        // // console.log(`[DEBUG] Fetching exams for class: "${student.class}"`);
        const examsResponse = await databases.listDocuments<Exam>(
          DATABASE_ID,
          COLLECTION_EXAM_ID,
          [
            Query.contains('class', student.class),
            Query.limit(20),
          ]
        );
        // // console.log('[DEBUG] Raw Exams Response:', examsResponse);

        const processedUpcomingExams: UpcomingExamDisplay[] = [];
        const nowTimestamp = new Date().getTime();

        examsResponse.documents.forEach(examDoc => {
          try {
            if (examDoc.subjectDetails_json && examDoc.subjectDetails_json.trim() !== "") {
              const subjectDetails: SubjectDetail[] = JSON.parse(examDoc.subjectDetails_json);
              let earliestFutureSubjectDate: string | null = null;

              subjectDetails.forEach(subject => {
                const subjectExamDateTimestamp = new Date(subject.date).getTime();
                if (subjectExamDateTimestamp >= nowTimestamp) {
                  if (earliestFutureSubjectDate === null || subjectExamDateTimestamp < new Date(earliestFutureSubjectDate).getTime()) {
                    earliestFutureSubjectDate = subject.date;
                  }
                }
              });

              if (earliestFutureSubjectDate) {
                processedUpcomingExams.push({
                  id: examDoc.$id,
                  examTitle: examDoc.title,
                  date: earliestFutureSubjectDate,
                });
              }
            } else {
              // console.warn(`[DEBUG] subjectDetails_json is null or empty for exam ${examDoc.$id}`);
            }
          } catch (e) {
            // console.error(`[DEBUG] Error parsing subjectDetails_json or processing subjects for exam ${examDoc.$id}:`, e, examDoc.subjectDetails_json);
          }
        });

        processedUpcomingExams.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        const top5Exams = processedUpcomingExams.slice(0, 5);
        // // console.log('[DEBUG] Processed Top 5 Upcoming Exams (per document):', top5Exams);
        setUpcomingExams(top5Exams);

      } catch (err: any) {
        // console.error('[DEBUG] General error in fetchDashboardData:', err);
        setError(err.code === 401 ? 'Session expired. Please log in.' : `Failed to load data: ${err.message || 'Unknown error'}`);
      } finally {
        setLoading(false);
        // // console.log('[DEBUG] fetchDashboardData finished.');
      }
    };

    fetchDashboardData();
    return () => {
      // // console.log('[DEBUG] StudentDashboard: useEffect cleanup. Resetting store.');
      reset();
    };
  }, [reset, setError, setLoading, setStudentDetails, setUpcomingAssignments, setUpcomingExams]);


  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
        <div className="flex flex-col items-center">
          <svg className="animate-spin h-12 w-12 text-indigo-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-xl font-semibold text-gray-700">Loading Dashboard...</p>
          <p className="text-gray-500">Fetching your details, please wait.</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-md text-center">
          <ExclamationTriangleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-red-700 mb-2">Oops! Something went wrong.</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <PerfectScrollbar options={{ suppressScrollX: true }} className="h-screen"> {/* Ensure scrollbar container has height */}
      <div className="bg-gradient-to-br from-slate-50 to-sky-100 min-h-full py-8"> {/* Use min-h-full if h-screen on PerfectScrollbar */}
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <header className="mb-8 md:mb-12 text-center">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 pb-2">
              Student Dashboard
            </h1>
            {studentDetails && (
              <p className="text-lg text-gray-600 mt-2">
                Welcome back, <span className="font-semibold">{studentDetails.name}</span>!
              </p>
            )}
          </header>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
            <StudentDetailsCard />
            <UpcomingAssignmentsList />
            <UpcomingExamsList />
            <ComingSoonCard />
          </div>
        </div>
      </div>
    </PerfectScrollbar>
  );
};

export default StudentDashboard;