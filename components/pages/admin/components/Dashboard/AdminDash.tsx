// src/pages/admin/AdminDash.tsx

// src/pages/admin/AdminDash.tsx
import React, { useEffect, useMemo } from 'react';
import useAdminDashStore from './stores/adminDashStore'; // Adjust path
import StatCard from './StatCard'; // Adjust path
import StudentsByFacultyChart from './StudentsByFacultyChart'; // Adjust path
import StudentsByClassChart from './StudentsByClassChart'; // Adjust path
import GenderDistributionChart from './GenderDistributionChart'; // Adjust path
import ExamsOverviewChart from './ExamsOverviewChart'; // Adjust path
import PerfectScrollbar from "react-perfect-scrollbar";
import "react-perfect-scrollbar/dist/css/styles.css";
//

// Placeholder icons (you can use a library like react-icons)
import { Users, BookOpen, Briefcase, Home, CheckSquare, Library } from 'lucide-react'; // Example using lucide-react

// src/pages/admin/AdminDash.tsx
import TodayAttendanceCard from './TodayAttendanceCard'; // Import the new component

const AdminDash: React.FC = () => {
    const { loading, error, stats, data, fetchDashboardData } = useAdminDashStore();

    useEffect(() => {
        fetchDashboardData();
    }, [fetchDashboardData]);

    const studentData = useMemo(() => data?.students || [], [data?.students]);
    const facultyData = useMemo(() => data?.faculties || [], [data?.faculties]);
    const examData = useMemo(() => data?.exams || [], [data?.exams]);

    if (loading) {
        return <div className="p-8 text-center text-xl">Loading dashboard data...</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-xl text-red-500">Error: {error}</div>;
    }

    if (!stats || !data) {
        return <div className="p-8 text-center text-xl">No data available.</div>;
    }

    return (
        <PerfectScrollbar options={{ suppressScrollX: true }}>

        <div className="p-4 md:p-8 bg-gray-100 min-h-screen">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Admin Dashboard</h1>

            {/* Key Statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
                {/* ... existing StatCards ... */}
                <StatCard title="Total Students" value={stats.totalStudents} icon={<Users />} bgColor="bg-indigo-500" />
                <StatCard title="Total Teachers" value={stats.totalTeachers} icon={<Briefcase />} bgColor="bg-green-500" />
                <StatCard title="Total Parents" value={stats.totalParents} icon={<Home />} bgColor="bg-yellow-500 text-gray-800" />
                <StatCard title="Faculties" value={stats.totalFaculties} icon={<BookOpen />} bgColor="bg-purple-500" />
                <StatCard title="Classes" value={stats.totalClasses} icon={<Home />} bgColor="bg-pink-500" />
                <StatCard title="Sections" value={stats.totalSections} icon={<CheckSquare />} bgColor="bg-teal-500" />
                <StatCard title="Library Members" value={stats.studentsWithLibrary} icon={<Library />} bgColor="bg-cyan-500" />
                <StatCard title="Total Exams" value={stats.totalExams} icon={<CheckSquare />} bgColor="bg-orange-500" />
            </div>

            {/* New Today's Attendance Card */}
            <div className="mb-8">
                <TodayAttendanceCard />
            </div>

            {/* Existing Charts and Diagrams */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {studentData.length > 0 && facultyData.length > 0 && (
                    <StudentsByFacultyChart students={studentData} faculties={facultyData} />
                )}
                {studentData.length > 0 && (
                    <StudentsByClassChart students={studentData} />
                )}
                {/* GenderDistributionChart might need student.gender field which is not in schema */}
                {/* For now, assuming it's handled or you can adapt it */}
                {/* {studentData.length > 0 && (
                     <GenderDistributionChart students={studentData} />
                )} */}
                {examData.length > 0 && (
                    <ExamsOverviewChart exams={examData} />
                )}
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Additional Information</h2>
                <ul className="list-disc list-inside text-gray-600">
                    <li>Published Exams: {stats.publishedExams} / {stats.totalExams}</li>
                    <li>Active Teachers: {stats.totalTeachers}</li>
                </ul>
            </div>
        </div>
        </PerfectScrollbar>
    );
};

export default AdminDash;