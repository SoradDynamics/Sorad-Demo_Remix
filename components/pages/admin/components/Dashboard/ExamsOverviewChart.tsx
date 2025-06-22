// src/components/admin/ExamsOverviewChart.tsx
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from 'recharts';
import { ExamDocument } from './lib/appwriteConfig'; // Adjust path

interface ExamsOverviewChartProps {
    exams: ExamDocument[];
}

const ExamsOverviewChart: React.FC<ExamsOverviewChartProps> = ({ exams }) => {
    if (!exams.length) {
        return <div className="p-4 text-center text-gray-500">No exam data available.</div>;
    }

    const publishedCount = exams.filter(exam => exam.isPublished).length;
    const unpublishedCount = exams.length - publishedCount;

    const data = [
        { name: 'Published', count: publishedCount, fill: '#4CAF50' },
        { name: 'Unpublished', count: unpublishedCount, fill: '#FF9800' },
    ];
    
    return (
        <div className="p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4 text-gray-700">Exams Overview</h3>
            <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Exams" >
                        {data.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                    </Bar>
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};

export default ExamsOverviewChart;  