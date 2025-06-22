// src/components/common/SuccessMessage.tsx
import React from 'react';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

interface SuccessMessageProps {
    message: string | null | undefined;
}

const SuccessMessage: React.FC<SuccessMessageProps> = ({ message }) => {
    if (!message) return null;
    return (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
            <div className="flex items-center">
                <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
                <span className="block sm:inline">{message}</span>
            </div>
        </div>
    );
};

export default SuccessMessage;