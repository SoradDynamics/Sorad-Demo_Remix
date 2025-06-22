// src/components/admin/GenderDistributionChart.tsx
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { StudentDocument } from './lib/appwriteConfig'; // Adjust path

interface GenderDistributionChartProps {
    students: StudentDocument[];
}

const COLORS_GENDER = ['#2196F3', '#E91E63', '#9E9E9E']; // Blue for Male, Pink for Female, Grey for Other/Undefined

const GenderDistributionChart: React.FC<GenderDistributionChartProps> = ({ students }) => {
    // IMPORTANT: This chart assumes you have a 'gender' field in your coll-student
    // with values like 'male', 'female', 'other'.
    // If not, this chart will show "Undefined" for all.
    if (!students.length) {
        return <div className="p-4 text-center text-gray-500">No student data for gender distribution.</div>;
    }
    
    const genderCounts = { male: 0, female: 0, other: 0, undefined: 0 };
    students.forEach(student => {
        if (student.gender === 'male') genderCounts.male++;
        else if (student.gender === 'female') genderCounts.female++;
        else if (student.gender === 'other') genderCounts.other++;
        else genderCounts.undefined++;
    });

    const data = [
        { name: 'Male', value: genderCounts.male },
        { name: 'Female', value: genderCounts.female },
        { name: 'Other', value: genderCounts.other },
        { name: 'Undefined', value: genderCounts.undefined },
    ].filter(item => item.value > 0); // Only show categories with students

    if (data.length === 0) {
         return (
            <div className="p-4 bg-white rounded-lg shadow-md text-center">
                <h3 className="text-lg font-semibold mb-4 text-gray-700">Gender Distribution</h3>
                <p className="text-gray-500">No gender data to display.</p>
                <p className="text-sm text-orange-500 mt-2">
                    Note: Ensure 'gender' field ('male'/'female'/'other') exists in your student collection.
                </p>
            </div>
        );
    }

    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Gender Distribution</h3>
             <p className="text-xs text-orange-500 mb-2">
                Note: 'Undefined' means the gender field is missing or not 'male'/'female'/'other' for some students.
            </p>
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
                            <Cell key={`cell-${index}`} fill={COLORS_GENDER[index % COLORS_GENDER.length]} />
                        ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                </PieChart>
            </ResponsiveContainer>
        </div>
    );
};

export default GenderDistributionChart;