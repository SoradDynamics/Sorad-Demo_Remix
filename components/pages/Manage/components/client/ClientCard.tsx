// src/components/client/ClientCard.tsx
import React from 'react';
import { ClientMetadata } from '../../types'; // Ensure ClientMetadata type is correctly defined
import { getLogoPreviewUrl } from '../../services/clientApiService';
import {
    CalendarDaysIcon,
    CheckBadgeIcon,
    ExclamationTriangleIcon,
    // BuildingOffice2Icon, // Not used in this specific component logic, but keep if used elsewhere
    GlobeAltIcon,
    // DocumentTextIcon, // Not used
    PhotoIcon,
    QuestionMarkCircleIcon // Import for default/unknown status
} from '@heroicons/react/24/outline';

interface ClientCardProps {
    client: ClientMetadata;
    onClick: () => void;
}

const ClientCard: React.FC<ClientCardProps> = ({ client, onClick }) => {
    const logoUrl = client.logo_image_id ? getLogoPreviewUrl(client.logo_image_id)?.href : undefined;

    // Define status styles and icons, including a default for unknown/null statuses
    // Using Record<string, ...> for keys allows more flexibility and a 'default' key.
    const statusColors: Record<string, string> = {
        active: 'text-green-700 bg-green-100',
        expired: 'text-red-700 bg-red-100',
        pending_setup: 'text-yellow-700 bg-yellow-100',
        setup_failed: 'text-orange-700 bg-orange-100',
        default: 'text-gray-700 bg-gray-100', // Fallback style
    };

    const statusIcons: Record<string, JSX.Element> = {
        active: <CheckBadgeIcon className="h-4 w-4 mr-1 inline-block" />,
        expired: <ExclamationTriangleIcon className="h-4 w-4 mr-1 inline-block" />,
        pending_setup: <ExclamationTriangleIcon className="h-4 w-4 mr-1 inline-block" />,
        setup_failed: <ExclamationTriangleIcon className="h-4 w-4 mr-1 inline-block" />,
        default: <QuestionMarkCircleIcon className="h-4 w-4 mr-1 inline-block" />, // Fallback icon
    };

    const truncateText = (text: string | undefined | null, maxLength: number): string => {
        if (!text) return 'N/A';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    // Prepare status display elements safely
    let displayStatusText: string;
    let currentStatusColorClass: string;
    let currentStatusIconElement: JSX.Element;

    // Check if client.status is a valid string
    if (client.status && typeof client.status === 'string') {
        // This is the line (previously line 59) that caused the error.
        // Now it's guarded by the check above.
        displayStatusText = client.status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
        
        // Use status from client if valid and exists in maps, otherwise fallback to default
        currentStatusColorClass = statusColors[client.status] || statusColors.default;
        currentStatusIconElement = statusIcons[client.status] || statusIcons.default;
    } else {
        // Fallback for null, undefined, or non-string status
        displayStatusText = 'Status Unknown';
        currentStatusColorClass = statusColors.default;
        currentStatusIconElement = statusIcons.default;
    }

    const clientName = client.name || 'Unnamed Client';
    const clientDomain = client.domain || 'N/A';
    const clientDescription = client.desc || 'No description provided.';

    return (
        <div
            onClick={onClick}
            className="bg-white shadow-lg rounded-xl p-5 flex flex-col justify-between h-full cursor-pointer hover:shadow-xl transition-shadow duration-200 ease-in-out transform hover:-translate-y-1"
            title={`View details for ${clientName}`}
        >
            <div> {/* Top section for logo, name, status, desc */}
                <div className="flex items-start space-x-4 mb-3">
                    {logoUrl ? (
                        <img
                            src={logoUrl}
                            alt={`${clientName} logo`}
                            className="w-16 h-16 object-contain rounded-md border border-slate-200 bg-slate-50 p-0.5 flex-shrink-0"
                            onError={(e) => {
                                // Attempt to hide the img tag and show a fallback or log an error
                                e.currentTarget.style.display = 'none';
                                // Optionally, you could replace it with a placeholder if you have one structured in the DOM
                                // e.currentTarget.parentElement.querySelector('.logo-placeholder').style.display = 'flex';
                            }}
                        />
                        // Example placeholder (if needed, style appropriately):
                        // <div className="logo-placeholder w-16 h-16 bg-slate-100 rounded-md items-center justify-center text-slate-400 flex-shrink-0" style={{display: 'none'}}>
                        //     <PhotoIcon className="h-8 w-8" />
                        // </div>
                    ) : (
                        <div className="w-16 h-16 bg-slate-100 rounded-md flex items-center justify-center text-slate-400 flex-shrink-0">
                            <PhotoIcon className="h-8 w-8" />
                        </div>
                    )}
                    <div className="flex-1 min-w-0"> {/* Ensures text truncation works */}
                        <h3 className="text-lg font-semibold text-slate-800 truncate" title={clientName}>{clientName}</h3>
                        <p className={`text-xs font-medium px-2 py-0.5 rounded-full inline-block mt-1 ${currentStatusColorClass}`}>
                            {currentStatusIconElement}
                            {displayStatusText}
                        </p>
                    </div>
                </div>

                {/* Description */}
                <div className="mb-3 text-sm text-slate-600">
                    <p className="line-clamp-3" title={clientDescription}>
                        {client.desc ? truncateText(client.desc, 100) : <span className="italic">No description provided.</span>}
                    </p>
                </div>
            </div>

            {/* Bottom section for domain and license */}
            <div className="mt-auto pt-3 border-t border-slate-200 space-y-1.5 text-xs text-slate-500">
                <div className="flex items-center">
                    <GlobeAltIcon className="h-4 w-4 text-slate-400 mr-1.5 flex-shrink-0" />
                    <span className="truncate" title={clientDomain}>Domain: {clientDomain}</span>
                </div>
                <div className="flex items-center">
                    <CalendarDaysIcon className="h-4 w-4 text-slate-400 mr-1.5 flex-shrink-0" />
                    {/* Safely display license date */}
                    <span>Expires: {client.license_date ? new Date(client.license_date).toLocaleDateString() : 'N/A'}</span>
                </div>
            </div>
        </div>
    );
};

export default ClientCard;