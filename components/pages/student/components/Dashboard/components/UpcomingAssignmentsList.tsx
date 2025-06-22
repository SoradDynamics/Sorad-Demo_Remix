import React from 'react';
import { useStudentDashboardStore } from '../store/useStudentDashboardStore';
import PerfectScrollbar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";

const DocumentTextIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
  </svg>
);

const UpcomingAssignmentsList: React.FC = () => {
  const upcomingAssignments = useStudentDashboardStore((state) => state.upcomingAssignments);

  const sortedAssignments = [...upcomingAssignments].sort(
    (a, b) => new Date(a.dateAD).getTime() - new Date(b.dateAD).getTime()
  );

  return (
    <div className="bg-white flex flex-col p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 h-full max-h-96">
      <div className="flex items-center mb-5 flex-shrink-0"> {/* Header, flex-shrink-0 to prevent shrinking */}
        <DocumentTextIcon className="w-7 h-7 mr-3 text-amber-500" />
        <h2 className="text-xl font-semibold text-gray-800">Upcoming Assignments</h2>
      </div>
      
      <div className="flex-grow overflow-hidden"> {/* Wrapper for scrollbar */}
        {sortedAssignments.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500 text-center py-4">No upcoming assignments.</p>
          </div>
        ) : (
          <PerfectScrollbar options={{ suppressScrollX: true }} className="h-full">
            <ul className="space-y-4 pr-2"> {/* Added pr-2 for scrollbar spacing */}
              {sortedAssignments.map((assignment) => (
                <li
                  key={assignment.id}
                  className="bg-amber-50 p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300"
                >
                  <h3 className="font-medium text-gray-800 text-md mb-1">{assignment.title}</h3>
                  <p className="text-sm text-amber-700">
                    <span className="font-normal text-gray-600">Subject:</span> {assignment.subjectName}
                  </p>
                  <p className="text-sm text-red-600 mt-1">
                    <span className="font-normal text-gray-600">Due Date (BS):</span> {assignment.dateBS}
                  </p>
                </li>
              ))}
            </ul>
          </PerfectScrollbar>
        )}
      </div>
    </div>
  );
};

export default UpcomingAssignmentsList;