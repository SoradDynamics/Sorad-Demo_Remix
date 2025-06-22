import React from 'react';
import { useStudentDashboardStore } from '../store/useStudentDashboardStore';
import PerfectScrollbar from "react-perfect-scrollbar"; // Import PerfectScrollbar
import "react-perfect-scrollbar/dist/css/styles.css";  // Import styles

const CalendarDaysIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
    </svg>
  );

const UpcomingExamsList: React.FC = () => {
  const upcomingExams = useStudentDashboardStore((state) => state.upcomingExams);

  return (
    <div className="bg-purple-50 p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 h-full max-h-96 flex flex-col">
      <div className="flex items-center mb-5 flex-shrink-0"> {/* Header, flex-shrink-0 to prevent shrinking */}
        <CalendarDaysIcon className="w-7 h-7 mr-3 text-purple-600" />
        <h2 className="text-xl font-semibold text-purple-800">Upcoming Exams</h2>
      </div>

      <div className="flex-grow overflow-hidden"> {/* Wrapper for scrollbar */}
        {upcomingExams.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500 text-center py-4">No upcoming exams scheduled.</p>
          </div>
        ) : (
          <PerfectScrollbar options={{ suppressScrollX: true }} className="h-full">
            <ul className="space-y-4 pr-2"> {/* Added pr-2 for scrollbar spacing */}
              {upcomingExams.map((exam) => (
                <li
                  key={exam.id}
                  className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-300 border border-purple-200"
                >
                  <p className="font-medium text-gray-800 text-md mb-1">
                    {exam.examTitle}
                  </p>
                  <p className="text-sm text-purple-700 mt-1">
                    <span className="font-normal text-gray-600">Date:</span>{' '}
                    {new Date(exam.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
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

export default UpcomingExamsList;