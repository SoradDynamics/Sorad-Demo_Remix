// src/components/common/ErrorMessage.tsx
import React from 'react';
import { ExclamationCircleIcon } from '@heroicons/react/24/solid';

interface ErrorMessageProps {
    message: string | null | undefined;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
    if (!message) return null;
    return (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
            <div className="flex items-center">
                <ExclamationCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                <span className="block sm:inline">{message}</span>
            </div>
        </div>
    );
};

export default ErrorMessage;