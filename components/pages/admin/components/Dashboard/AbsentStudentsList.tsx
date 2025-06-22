// src/pages/admin/components/AbsentStudentsList.tsx
import React, { useMemo } from 'react';
import { StudentDocument, FacultyDocument } from './stores/adminDashStore'; // Ensure types have $id

interface Props {
    absentStudents: StudentDocument[];
    faculties: FacultyDocument[];
}

interface GroupedAbsentStudents {
    [facultyName: string]: {
        [className: string]: {
            [sectionName: string]: StudentDocument[];
        };
    };
}

const AbsentStudentsList: React.FC<Props> = ({ absentStudents, faculties }) => {
    const facultyNameMap = useMemo(() => {
        // student.facultyId contains faculty's Appwrite $id
        // So, the map should be keyed by faculty.$id
        // // console.log("Faculties for map in AbsentStudentsList:", faculties);
        if (!faculties || faculties.length === 0) return new Map();
        return new Map(faculties.map(f => [f.$id, f.name])); // Key by $id
    }, [faculties]);

    const groupedStudents = useMemo(() => {
        const groups: GroupedAbsentStudents = {};
        if (!absentStudents || absentStudents.length === 0) return groups;

        absentStudents.forEach(student => {
            // student.facultyId is the Appwrite $id of the faculty
            const facultyName = facultyNameMap.get(student.facultyId) || `Unknown Faculty (ID: ${student.facultyId || 'N/A'})`; // Improved fallback
            const className = student.class || 'Unknown Class';
            const sectionName = student.section || 'Unknown Section';

            if (!groups[facultyName]) {
                groups[facultyName] = {};
            }
            if (!groups[facultyName][className]) {
                groups[facultyName][className] = {};
            }
            if (!groups[facultyName][className][sectionName]) {
                groups[facultyName][className][sectionName] = [];
            }
            groups[facultyName][className][sectionName].push(student);
        });
        // // console.log("Grouped absent students:", groups);
        return groups;
    }, [absentStudents, facultyNameMap]);

    if (!absentStudents || absentStudents.length === 0) {
        return <p className="text-gray-600 italic">No students are reported absent today for the current selection.</p>;
    }

    return (
        <div className="space-y-6">
            {Object.entries(groupedStudents).map(([facultyName, classes]) => (
                <div key={facultyName} className="p-4 border rounded-md bg-gray-50">
                    <h3 className="text-xl font-semibold text-indigo-700 mb-3">{facultyName}</h3>
                    {Object.keys(classes).length === 0 && <p className="text-sm text-gray-500 italic">No absent students in known classes for this faculty.</p>}
                    {Object.entries(classes).map(([className, sections]) => (
                        <div key={className} className="ml-4 mb-3">
                            <h4 className="text-lg font-medium text-teal-600 mb-2">Class: {className}</h4>
                            {Object.keys(sections).length === 0 && <p className="text-sm text-gray-500 italic">No absent students in known sections for this class.</p>}
                            {Object.entries(sections).map(([sectionName, studentsList]) => (
                                <div key={sectionName} className="ml-4 mb-2">
                                    <h5 className="text-md font-normal text-gray-700 mb-1">Section: {sectionName} ({studentsList.length} absent)</h5>
                                    <ul className="list-disc list-inside pl-4 text-sm text-gray-600">
                                        {studentsList.map(student => (
                                            // Use student.$id if available and unique, otherwise fallback
                                            <li key={student.$id || student.name}>{student.name} ({student.stdEmail || 'No Email'})</li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default AbsentStudentsList;