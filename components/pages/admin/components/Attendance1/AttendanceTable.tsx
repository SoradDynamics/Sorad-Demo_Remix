// ~/Attendance/AttendanceTable.tsx
import React, { useState, useCallback, useMemo, useEffect } from "react";
import { useFacultyStore } from "~/store/facultyStore";
import { Student } from "~/store/studentStore";
import { Checkbox } from "@heroui/react";
import Table, { ColumnDef } from "../common/Table";

interface AttendanceTableProps {
    studentData: Student[];
    isLoading: boolean;
    onStudentsSelect: (studentIds: string[]) => void;
    selectedStudents: string[];
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({
    studentData,
    isLoading,
    onStudentsSelect,
    selectedStudents,
}) => {
    const { facultyData } = useFacultyStore();
    const [localSelectedStudents, setLocalSelectedStudents] = useState<string[]>(selectedStudents);

    // Effect to synchronize local state if the parent component changes the selectedStudents prop
    useEffect(() => {
        if (JSON.stringify(localSelectedStudents) !== JSON.stringify(selectedStudents)) {
            setLocalSelectedStudents(selectedStudents);
        }
    }, [selectedStudents, localSelectedStudents]); // localSelectedStudents is included to re-evaluate if it changed independently, but the condition prevents loops.

    // Effect to set initial selections based on today's absence data when studentData loads/changes
    useEffect(() => {
        if (studentData && studentData.length > 0) {
            const today = new Date().toISOString().slice(0, 10);
            const initiallySelected = studentData
                .filter((student) => Array.isArray(student.absent) && student.absent.includes(today))
                .map((student) => student.$id);

            if (JSON.stringify(initiallySelected) !== JSON.stringify(selectedStudents)) {
                onStudentsSelect(initiallySelected);
            }
        }
        // Optional: Clear selection if studentData becomes empty
        // else if (studentData && studentData.length === 0 && selectedStudents.length > 0) {
        //     onStudentsSelect([]);
        // }
    }, [studentData, selectedStudents, onStudentsSelect]);


    const columns: ColumnDef<Student>[] = useMemo(() => [
        {
            key: 'checkbox',
            label: '',
            align: 'center',
            minWidth: '50px',
            headerClassName: 'text-center px-3 py-3.5',
            cellClassName: 'text-center px-3 py-4',
        },
        { key: 'name', label: 'Name', minWidth: '150px', cellClassName: 'px-3 py-4' },
        { key: 'class', label: 'Class', minWidth: '80px', cellClassName: 'px-3 py-4' },
        { key: 'section', label: 'Section', minWidth: '80px', cellClassName: 'px-3 py-4' },
        { key: 'faculty', label: 'Faculty', minWidth: '150px', cellClassName: 'px-3 py-4' },
    ], []);

    const handleCheckboxChange = useCallback((studentId: string, isChecked: boolean) => {
        // Calculate the next state based on the current localSelectedStudents
        const currentSelection = localSelectedStudents;
        let nextSelection: string[];

        if (isChecked) {
            nextSelection = currentSelection.includes(studentId) ? currentSelection : [...currentSelection, studentId];
        } else {
            nextSelection = currentSelection.filter((id) => id !== studentId);
        }

        // Only update if the selection has actually changed
        if (JSON.stringify(currentSelection) !== JSON.stringify(nextSelection)) {
            setLocalSelectedStudents(nextSelection); // Update local state
            onStudentsSelect(nextSelection);       // Notify parent
        }
    }, [localSelectedStudents, onStudentsSelect]); // localSelectedStudents is a dependency now

    const handleRowClick = useCallback((student: Student) => {
        const isCurrentlySelected = localSelectedStudents.includes(student.$id);
        handleCheckboxChange(student.$id, !isCurrentlySelected);
    }, [localSelectedStudents, handleCheckboxChange]);

    const renderCell = useCallback((student: Student, columnKey: string): React.ReactNode => {
        switch (columnKey) {
            case 'checkbox':
                return (
                    <Checkbox
                        isSelected={localSelectedStudents.includes(student.$id)}
                        onChange={(e) => handleCheckboxChange(student.$id, e.target.checked)}
                        size="sm"
                        aria-label={`Select student ${student.name}`}
                    />
                );
            case 'name':
                return <span className="font-medium text-gray-900">{student.name ?? 'N/A'}</span>;
            case 'class':
                return student.class || <span className="text-gray-400 italic">N/A</span>;
            case 'section':
                return student.section || <span className="text-gray-400 italic">N/A</span>;
            case 'faculty':
                const faculty = facultyData.find((f) => f.$id === student.facultyId);
                return faculty ? faculty.name : <span className="text-gray-400 italic">N/A</span>;
            default:
                return null;
        }
    }, [facultyData, localSelectedStudents, handleCheckboxChange]);

    return (
        <div className="mt-4">
            <Table<Student>
                columns={columns}
                data={studentData}
                getRowKey={(student) => student.$id}
                isLoading={isLoading}
                emptyContent={isLoading ? "Loading students..." : "No students match your search."}
                renderCell={renderCell}
                selectionMode="none"
                className="border border-gray-200 rounded-lg shadow-sm overflow-hidden"
                tableClassName="min-w-full divide-y divide-gray-300"
                headerClassName="bg-gray-50 sticky top-0 z-10"
                rowClassName={(item) =>
                    `transition-colors duration-150 ease-in-out hover:bg-gray-50 cursor-pointer ${
                        localSelectedStudents.includes(item.$id) ? 'bg-primary-50 hover:bg-primary-100' : ''
                    }`
                }
                onRowClick={handleRowClick}
            />
        </div>
    );
};

export default AttendanceTable;