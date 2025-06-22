import React from 'react';
import { useStudentDashboardStore } from '../store/useStudentDashboardStore';
import { UserCircle2 } from 'lucide-react';

const StudentDetailsCard: React.FC = () => {
  const studentDetails = useStudentDashboardStore((state) => state.studentDetails);

  if (!studentDetails) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg text-gray-500 animate-pulse min-h-[200px] flex items-center justify-center h-full">
        Loading details...
      </div>
    );
  }

  // Prepare details for mapping, making it cleaner to render
  const detailsToDisplay = [
    { label: "Class", value: studentDetails.className },
    { label: "Section", value: studentDetails.sectionName },
    { label: "Faculty", value: studentDetails.facultyName },
    // You can add more details here if they become available in studentDetails
    // e.g., { label: "Roll Number", value: studentDetails.rollNumber || "N/A" }
  ];

  return (
    <div className=" sm:gap-6 bg-gradient-to-br from-sky-500 to-indigo-600 p-6 rounded-xl shadow-xl text-white transform hover:scale-105 transition-transform duration-300 ease-out h-full flex flex-col md:flex-row md:items-stretch"> {/* Changed to md:items-stretch */}
      
      {/* Icon Section */}
      <div className="flex-shrink-0 flex flex-col items-center justify-center mb-4 md:mb-0 md:mr-6 lg:mr-8 md:py-4">
        <UserCircle2 className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36 text-sky-100" />
      </div>

      {/* Details Section - takes remaining space */}
      <div className="flex flex-col flex-grow justify-center text-center md:text-left md:py-4">
        <h2 className="text-2xl sm:text-3xl md:text-3xl lg:text-4xl font-bold tracking-tight mb-1 md:mb-2">
          {studentDetails.name}
        </h2>
        
        <div className="mt-2 space-y-2 md:mt-3 md:space-y-3">
          {detailsToDisplay.map((detail) => (
            <div key={detail.label} className='flex gap-2 justify-center sm:flex-row sm:justify-start'>
              <p className="text-base sm:text-lg font-medium text-sky-200">{detail.label}: </p>
              <p className="text-base sm:text-lg md:text-xl font-semibold">{detail.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsCard;