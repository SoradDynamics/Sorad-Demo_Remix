// src/components/admin/StatCard.tsx
import React from 'react';

interface StatCardProps {
    title: string;
    value: string | number;
    icon?: React.ReactNode; // e.g., an SVG icon
    bgColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, bgColor = 'bg-blue-500' }) => {
    return (
        <div className={`p-6 rounded-lg shadow-lg text-white ${bgColor}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium uppercase tracking-wider">{title}</p>
                    <p className="text-3xl font-semibold">{value}</p>
                </div>
                {icon && <div className="text-4xl opacity-80">{icon}</div>}
            </div>
        </div>
    );
};

export default StatCard;