// src/components/admin/StudentsByClassChart.tsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { StudentDocument } from './lib/appwriteConfig'; // Adjust path

interface StudentsByClassChartProps {
    students: StudentDocument[];
}

const StudentsByClassChart: React.FC<StudentsByClassChartProps> = ({ students }) => {
    if (!students.length) {
        return <div className="p-4 text-center text-gray-500">No student data available for class chart.</div>;
    }

    const classCounts: { [key: string]: number } = {};
    students.forEach(student => {
        classCounts[student.class] = (classCounts[student.class] || 0) + 1;
    });

    const data = Object.entries(classCounts)
        .map(([className, count]) => ({ name: `Class ${className}`, students: count }))
        .sort((a, b) => a.name.localeCompare(b.name)); // Sort by class name

    if (data.length === 0) {
        return <div className="p-4 text-center text-gray-500">No class distribution data available.</div>;
    }
    
    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Students by Class</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="students" fill="#8884d8" />
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default StudentsByClassChart;