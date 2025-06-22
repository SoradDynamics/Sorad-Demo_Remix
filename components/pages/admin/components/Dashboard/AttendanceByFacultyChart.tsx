// src/pages/admin/charts/AttendanceByFacultyChart.tsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { FacultyAttendanceStat } from './stores/adminDashStore'; // Adjust path

interface Props {
    data: FacultyAttendanceStat[];
}

const AttendanceByFacultyChart: React.FC<Props> = ({ data }) => {
    if (!data || data.length === 0) {
        return <p className="text-gray-500">No attendance data available to display chart.</p>;
    }

    const chartData = data.map(item => ({
        name: item.facultyName,
        'Attendance Rate (%)': item.attendanceRate,
        'Absent': item.absentStudentsCount,
        'Present': item.presentStudents,
    }));

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-30} textAnchor="end" height={70} interval={0} />
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

export default AttendanceByFacultyChart;