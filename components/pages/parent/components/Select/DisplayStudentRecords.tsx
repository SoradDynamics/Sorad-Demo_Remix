// src/pages/parent/Select/DisplayStudentRecords.tsx

import React, { useState, useEffect } from 'react';
import { Student } from 'types/models';
import { databases, Query } from '~/utils/appwrite';
import {
  UserCircleIcon, AcademicCapIcon, BookOpenIcon,
  UserGroupIcon, InformationCircleIcon, RectangleStackIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';
import { useSchoolStore } from '~/store/schoolStore';

// Configuration
const DB_Id = useSchoolStore.getState().dbId;
const DATABASE_ID = DB_Id as string;
const FACULTY_COLLECTION_ID = import.meta.env.VITE_APPWRITE_FACULTY_COLLECTION_ID as string;
const SECTION_COLLECTION_ID = import.meta.env.VITE_APPWRITE_SECTION_COLLECTION_ID as string;

// Props Interface
interface DisplayStudentRecordsProps {
  student: Student | null;
  isLoading: boolean;
}

// UI Sub-component
const RecordItem: React.FC<{ icon: React.ElementType; label: string; value?: string | number | null; isLoading?: boolean; highlight?: boolean }> = ({
  icon: Icon, label, value, isLoading = false, highlight = false,
}) => {
  if (isLoading) {
    return (
      <div className="flex items-start space-x-3 py-3 sm:py-4 animate-pulse">
        <Icon className="h-6 w-6 flex-shrink-0 text-gray-400 mt-0.5" />
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{label}</p>
          <div className="h-5 bg-gray-300 rounded w-32 mt-1"></div>
        </div>
      </div>
    );
  }
  // This check correctly handles null, undefined, empty strings, and empty arrays.
  if (value === undefined || value === null || value === '' || (Array.isArray(value) && value.length === 0)) {
    return null;
  }
  return (
    <div className="flex items-start space-x-3 py-3 sm:py-4">
      <Icon className={`h-6 w-6 flex-shrink-0 ${highlight ? 'text-indigo-600' : 'text-gray-500'} mt-0.5`} />
      <div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
        <p className={`text-sm sm:text-base ${highlight ? 'font-semibold text-indigo-700' : 'text-gray-800'}`}>{value}</p>
      </div>
    </div>
  );
};

const DisplayStudentRecords: React.FC<DisplayStudentRecordsProps> = ({ student, isLoading }) => {
  const [facultyName, setFacultyName] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [isExtraLoading, setIsExtraLoading] = useState<boolean>(false);

  useEffect(() => {
    // Reset state whenever the student changes
    setFacultyName(null);
    setSubjects([]);

    // Only proceed if we have a student object
    if (student) {
      const fetchExtraData = async () => {
        setIsExtraLoading(true);
        const promises = [];

        // 1. Fetch Faculty Name (requires student.facultyId)
        if (student.facultyId) {
          promises.push(
            databases.getDocument(DATABASE_ID, FACULTY_COLLECTION_ID, student.facultyId)
              .then(doc => setFacultyName(doc.name))
              .catch(e => {
                console.error("Error fetching faculty:", e);
                setFacultyName("N/A"); // Show error state
              })
          );
        }

        // 2. Fetch Subjects (requires class, section, AND facultyId to be safe)
        if (student.class && student.section && student.facultyId) {
          promises.push(
            databases.listDocuments<{ subjects: string[] }>(DATABASE_ID, SECTION_COLLECTION_ID, [
              Query.equal('class', student.class),
              Query.equal('name', student.section),
              Query.equal('facultyId', student.facultyId),
              Query.limit(1)
            ])
            .then(response => {
              if (response.documents.length > 0 && response.documents[0].subjects) {
                setSubjects(response.documents[0].subjects);
              } else {
                // This means no matching section was found for the student's data
                console.warn(`No section document found for class: ${student.class}, section: ${student.section}`);
                setSubjects([]);
              }
            })
            .catch(e => {
              console.error("Error fetching subjects:", e);
              setSubjects([]);
            })
          );
        } else {
           // Log if required data for subject fetch is missing from student document
           console.warn("Student document is missing 'class', 'section', or 'facultyId'. Cannot fetch subjects.");
        }

        await Promise.all(promises);
        setIsExtraLoading(false);
      };

      fetchExtraData();
    }
  }, [student]);

  if (isLoading) {
    // Show a skeleton loader while the parent is fetching student list
    return <div className="bg-white shadow-xl rounded-xl p-8 animate-pulse">{/* ... skeleton UI ... */}</div>;
  }

  if (!student) {
    // Show a prompt if no student is selected
    return (
      <div className="p-8 border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 text-center">
        <InformationCircleIcon className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-3 text-lg font-medium text-gray-800">No Student Selected</h3>
        <p className="mt-1.5 text-sm text-gray-600">Please select a student to view their records.</p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-xl rounded-xl overflow-hidden">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 sm:p-8">
        {/* ... Header with student name ... */}
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-5">
            <UserCircleIcon className="h-20 w-20 text-white opacity-90 rounded-full border-2 border-white/50" />
            <div className="text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">{student.name}</h2>
                <p className="text-sm text-indigo-200">Student Record Overview</p>
            </div>
        </div>
      </div>

      <div className="p-6 md:p-8">
        <h3 className="text-xl font-semibold text-gray-800 mb-2 border-b border-gray-200 pb-3">
          Academic Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <RecordItem icon={AcademicCapIcon} label="Class" value={student.class} highlight />
          <RecordItem icon={RectangleStackIcon} label="Section" value={student.section} highlight />
          <RecordItem 
            icon={UserGroupIcon} 
            label="Faculty" 
            value={facultyName} 
            isLoading={isExtraLoading && !!student.facultyId}
          />
          <RecordItem 
            icon={BookOpenIcon} 
            label="Subjects" 
            value={subjects.length > 0 ? subjects.join(', ') : 'Not assigned'}
            isLoading={isExtraLoading && !!student.section}
          />
          <RecordItem icon={EnvelopeIcon} label="Student Email" value={student.stdEmail} />
        </div>
      </div>
    </div>
  );
};

export default DisplayStudentRecords;