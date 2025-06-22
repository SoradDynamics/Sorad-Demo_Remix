// src/pages/admin/components/TodayAttendanceCard.tsx
import React, { useState, useMemo } from 'react';
// Ensure FacultyDocument and StudentDocument are correctly typed from store
import useAdminDashStore, { ClassAttendanceStat, FacultyDocument, StudentDocument } from './stores/adminDashStore';
import AttendanceByFacultyChart from './AttendanceByFacultyChart';
import AttendanceByClassChart from './AttendanceByClassChart';
import AbsentStudentsList from './AbsentStudentsList';
import { TrendingUp, ListChecks, ArrowLeft, Filter } from 'lucide-react';
import { getTodayDateString } from './utils/dateUtils';

const TodayAttendanceCard: React.FC = () => {
    const [showDetailedView, setShowDetailedView] = useState(false);
    // This state will now store the Appwrite Document ID ($id) of the selected faculty
    const [selectedFacultyAppwriteId, setSelectedFacultyAppwriteId] = useState<string>('all');

    const loading = useAdminDashStore(state => state.loading);
    const allData = useAdminDashStore(state => state.data);

    // Provide default empty structures to prevent errors if allData is initially null/undefined
    const { 
        students = [], 
        faculties = [], 
        todayAttendanceByFaculty = [], 
        absentStudentsToday = [] 
    } = allData || {};

    const handleFacultyChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedFacultyAppwriteId(event.target.value);
    };

    const selectedFaculty = useMemo(() => {
        if (selectedFacultyAppwriteId === 'all' || !faculties) return null;
        // Find faculty by its Appwrite Document ID ($id)
        return faculties.find(f => f.$id === selectedFacultyAppwriteId);
    }, [selectedFacultyAppwriteId, faculties]);

    const chartDataAndTitle = useMemo(() => {
        // // console.log("Students for chart calc:", students);
        // // console.log("Faculties for chart calc:", faculties);
        // // console.log("Selected Faculty $id:", selectedFacultyAppwriteId);
        // // console.log("Selected Faculty Object:", selectedFaculty);

        if (!students.length || !faculties.length || !todayAttendanceByFaculty.length) {
            return { title: "Today's Attendance", data: [], type: 'faculty' as 'faculty' | 'class' };
        }

        if (selectedFacultyAppwriteId === 'all') {
            // // console.log("All faculties chart data:", todayAttendanceByFaculty);
            return {
                title: "Today's Attendance Rate by Faculty",
                data: todayAttendanceByFaculty, // This data should have facultyId as $id
                type: 'faculty' as 'faculty',
            };
        }

        const faculty = selectedFaculty; // This is the faculty object (with $id, name, classes etc.)
        if (!faculty || !faculty.classes || faculty.classes.length === 0) {
             // // console.log("No classes for faculty or faculty not found:", faculty?.name);
             return { title: `Today's Attendance for ${faculty?.name || 'Selected Faculty'}`, data: [], type: 'class' as 'class' };
        }

        const todayDateStr = getTodayDateString();
        const classAttendanceStats: ClassAttendanceStat[] = faculty.classes.map(className => {
            // Filter students by faculty's $id and class name
            const studentsInClassForFaculty = students.filter(
                s => s.facultyId === faculty.$id && s.class === className
            );
            const totalClassStudents = studentsInClassForFaculty.length;
            const absentClassStudents = studentsInClassForFaculty.filter(
                s => Array.isArray(s.absent) && s.absent.includes(todayDateStr)
            ).length;
            const presentClassStudents = totalClassStudents - absentClassStudents;
            const attendanceRate = totalClassStudents > 0
                ? parseFloat(((presentClassStudents / totalClassStudents) * 100).toFixed(2))
                : 0;
            
            // // console.log(`Faculty: ${faculty.name}, Class: ${className}, Total: ${totalClassStudents}, Absent: ${absentClassStudents}`);

            return {
                className,
                totalStudents: totalClassStudents,
                presentStudents: presentClassStudents,
                absentStudentsCount: absentClassStudents,
                attendanceRate,
            };
        }).filter(stat => stat.totalStudents > 0); // Optional: Don't show classes with 0 students for this faculty

        // // console.log(`Class attendance for ${faculty.name}:`, classAttendanceStats);
        return {
            title: `Today's Attendance for ${faculty.name} by Class`,
            data: classAttendanceStats,
            type: 'class' as 'class',
        };
    }, [selectedFacultyAppwriteId, students, faculties, todayAttendanceByFaculty, selectedFaculty]);

    const filteredAbsentStudents = useMemo(() => {
        if (!absentStudentsToday.length) return [];
        if (selectedFacultyAppwriteId === 'all') {
            return absentStudentsToday;
        }
        // Filter by student.facultyId (which is faculty $id) matching selectedFacultyAppwriteId
        return absentStudentsToday.filter(student => student.facultyId === selectedFacultyAppwriteId);
    }, [selectedFacultyAppwriteId, absentStudentsToday]);


    if (loading) { /* ... */ }
    // Adjusted initial check
    if (!allData) {
        return (
            <div className="bg-white p-6 rounded-lg shadow-md">
                <h2 className="text-xl font-semibold mb-4 text-gray-700">Today's Attendance</h2>
                <p>Attendance data is not available yet or failed to load.</p>
            </div>
        );
    }
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                <h2 className="text-xl font-semibold text-gray-700 flex items-center">
                    {showDetailedView ? <ListChecks className="mr-2 h-6 w-6 text-blue-500" /> : <TrendingUp className="mr-2 h-6 w-6 text-green-500" />}
                    {showDetailedView 
                        ? `Today's Absent Students ${selectedFaculty ? `(Faculty: ${selectedFaculty.name})` : '(All Faculties)'}` 
                        : chartDataAndTitle.title}
                </h2>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 w-full sm:w-auto">
                     <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Filter className="h-5 w-5 text-gray-600" />
                        <select
                            id="facultySelect"
                            value={selectedFacultyAppwriteId} // Bound to state holding $id
                            onChange={handleFacultyChange}
                            className="block w-full sm:w-auto pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md shadow-sm"
                        >
                            <option value="all">All Faculties</option>
                            {/* Value is faculty.$id, display is faculty.name */}
                            {faculties.map((facultyItem: FacultyDocument) => (
                                <option key={facultyItem.$id} value={facultyItem.$id}>
                                    {facultyItem.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={() => setShowDetailedView(!showDetailedView)}
                        className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 flex items-center w-full sm:w-auto justify-center"
                    >
                        {showDetailedView ? (
                            <><ArrowLeft className="mr-2 h-4 w-4" /> Back to Graph</>
                        ) : (
                            <>View Absentee List <ListChecks className="ml-2 h-4 w-4" /></>
                        )}
                    </button>
                </div>
            </div>

            {showDetailedView ? (
                <AbsentStudentsList absentStudents={filteredAbsentStudents} faculties={faculties} />
            ) : (
                <>
                    {chartDataAndTitle.data && chartDataAndTitle.data.length > 0 ? (
                        <>
                            {chartDataAndTitle.type === 'faculty' && (
                                <AttendanceByFacultyChart data={chartDataAndTitle.data as any} />
                            )}
                            {chartDataAndTitle.type === 'class' && (
                                <AttendanceByClassChart data={chartDataAndTitle.data as ClassAttendanceStat[]} facultyName={selectedFaculty?.name} />
                            )}
                        </>
                    ) : (
                        <p className="text-gray-500 text-center py-4">No attendance data to display for the current selection.</p>
                    )}
                </>
            )}
        </div>
    );
};

export default TodayAttendanceCard;