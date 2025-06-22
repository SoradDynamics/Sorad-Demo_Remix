// src/components/admin/StudentsByFacultyChart.tsx
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { StudentDocument, FacultyDocument } from './lib/appwriteConfig'; // Adjust path

interface StudentsByFacultyChartProps {
    students: StudentDocument[];
    faculties: FacultyDocument[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82Ca9D'];

const StudentsByFacultyChart: React.FC<StudentsByFacultyChartProps> = ({ students, faculties }) => {
    if (!students.length || !faculties.length) {
        return <div className="p-4 text-center text-gray-500">No student or faculty data available.</div>;
    }
    
    const facultyMap = new Map(faculties.map(f => [f.$id, f.name]));

    const data = faculties.map(faculty => {
        const count = students.filter(student => student.facultyId === faculty.$id).length;
        return { name: faculty.name, value: count };
    }).filter(item => item.value > 0); // Only show faculties with students

    if (data.length === 0) {
        return <div className="p-4 text-center text-gray-500">No students found for any faculty.</div>;
    }

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Students by Faculty</h3>
            <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default StudentsByFacultyChart;