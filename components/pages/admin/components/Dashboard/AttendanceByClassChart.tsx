// src/pages/admin/charts/AttendanceByClassChart.tsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ClassAttendanceStat } from './stores/adminDashStore'; // Adjust path as necessary

interface Props {
    data: ClassAttendanceStat[];
    facultyName?: string; // Optional: for a more specific chart title if needed
}

const AttendanceByClassChart: React.FC<Props> = ({ data, facultyName }) => {
    if (!data || data.length === 0) {
        return <p className="text-gray-500">No class attendance data available for {facultyName || 'the selected faculty'}.</p>;
    }

    const chartData = data.map(item => ({
        name: item.className, // Use className for X-axis
        'Attendance Rate (%)': item.attendanceRate,
        'Absent': item.absentStudentsCount,
        'Present': item.presentStudents,
    }));

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 70 }}> {/* Increased bottom margin for labels */}
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} interval={0} />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" label={{ value: 'Rate (%)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" label={{ value: 'Count', angle: -90, position: 'insideRight' }}/>
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="Attendance Rate (%)" fill="#8884d8" />
                <Bar yAxisId="right" dataKey="Present" stackId="a" fill="#82ca9d" />
                <Bar yAxisId="right" dataKey="Absent" stackId="a" fill="#ff7300" />
            </BarChart>
        </ResponsiveContainer>
    );
};

export default AttendanceByClassChart;