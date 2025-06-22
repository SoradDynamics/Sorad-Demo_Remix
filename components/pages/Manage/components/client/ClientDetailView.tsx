import React, { useState, useEffect } from 'react';
import { ClientMetadata, CurrentUser, ClientApiError } from '../../types'; // Ensure types are correct
import { getLogoPreviewUrl, updateClientLicense, updateClientDetails } from '../../services/clientApiService';
import ClientNotes from './ClientNotes';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import SuccessMessage from '../common/SuccessMessage';
import {
    ArrowLeftIcon, PencilIcon, CheckIcon, XMarkIcon, CalendarDaysIcon,
    BuildingOffice2Icon, GlobeAltIcon, ServerStackIcon, UserCircleIcon,
    InformationCircleIcon, // Make sure this is imported for default status
    PhotoIcon, ShieldCheckIcon, ShieldExclamationIcon, ClockIcon
} from '@heroicons/react/24/outline';

interface ClientDetailViewProps {
    client: ClientMetadata;
    onBack: () => void;
    onClientUpdate: (updatedClient: ClientMetadata) => void;
    currentUser: CurrentUser;
}

const DetailItem: React.FC<{icon: JSX.Element, label: string, value?: string | null | JSX.Element, className?: string}> = ({icon, label, value, className}) => (
    <div className={`flex items-start py-2 ${className}`}>
        <div className="flex-shrink-0 w-6 h-6 text-slate-500 mr-3 mt-0.5">{icon}</div>
        <div>
            <dt className="text-sm font-medium text-slate-500">{label}</dt>
            <dd className="mt-0.5 text-sm text-slate-900">{value === undefined || value === null || value === '' ? 'N/A' : value}</dd>
        </div>
    </div>
);


const ClientDetailView: React.FC<ClientDetailViewProps> = ({ client, onBack, onClientUpdate, currentUser }) => {
    const [editableClient, setEditableClient] = useState<ClientMetadata>(client);
    const [newLicenseDate, setNewLicenseDate] = useState('');
    
    const [isLoadingLicense, setIsLoadingLicense] = useState(false);
    const [isLoadingDetails, setIsLoadingDetails] = useState(false);
    const [licenseError, setLicenseError] = useState<string | null>(null);
    const [detailsError, setDetailsError] = useState<string | null>(null);
    const [licenseSuccess, setLicenseSuccess] = useState<string | null>(null);
    const [detailsSuccess, setDetailsSuccess] = useState<string | null>(null);
    const [isEditingDetails, setIsEditingDetails] = useState(false);


    useEffect(() => {
        setEditableClient(client);
        // Safely initialize newLicenseDate from client.license_date
        if (client.license_date && typeof client.license_date === 'string') {
            // Assuming license_date is in a format like "YYYY-MM-DDTHH:mm:ss.sssZ"
            // and you need "YYYY-MM-DD" for the date input
            setNewLicenseDate(client.license_date.substring(0, 10));
        } else {
            setNewLicenseDate(''); // Default for empty or invalid date
        }
    }, [client]);


    const logoUrl = editableClient.logo_image_id ? getLogoPreviewUrl(editableClient.logo_image_id)?.href : undefined;

    const canEditAny = currentUser.labels.includes('pro');
    const isOwner = editableClient.by === currentUser.$id;
    const canEditThisClient = canEditAny || isOwner;

    const handleLicenseUpdate = async () => {
        if (!canEditThisClient) return;
        setIsLoadingLicense(true);
        setLicenseError(null);
        setLicenseSuccess(null);
        try {
            const updated = await updateClientLicense(editableClient.$id, newLicenseDate);
            setEditableClient(updated);
            onClientUpdate(updated);
            setLicenseSuccess("License date updated successfully!");
            setTimeout(() => setLicenseSuccess(null), 3000);
        } catch (e: any) {
            const apiError = e as ClientApiError;
            setLicenseError(apiError.message || "Failed to update license.");
        } finally {
            setIsLoadingLicense(false);
        }
    };

    const handleDetailsChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setEditableClient({ ...editableClient, [e.target.name]: e.target.value });
    };

    const handleDetailsUpdate = async () => {
        if (!canEditThisClient) return;
        setIsLoadingDetails(true);
        setDetailsError(null);
        setDetailsSuccess(null);
        try {
            const { name, desc } = editableClient;
            const updated = await updateClientDetails(editableClient.$id, { name, desc });
            setEditableClient(updated);
            onClientUpdate(updated);
            setIsEditingDetails(false);
            setDetailsSuccess("Client details updated successfully!");
            setTimeout(() => setDetailsSuccess(null), 3000);
        } catch (e: any) {
            const apiError = e as ClientApiError;
            setDetailsError(apiError.message || "Failed to update details.");
        } finally {
            setIsLoadingDetails(false);
        }
    };

    const handleNoteAdded = (updatedClientWithNote: ClientMetadata) => {
        setEditableClient(updatedClientWithNote);
        onClientUpdate(updatedClientWithNote);
    };

    // Renamed statusInfo to statusDisplayConfig for clarity
    const statusDisplayConfig: Record<string, { text: string, color: string, icon: JSX.Element }> = {
        active: { text: 'Active', color: 'text-green-700 bg-green-100', icon: <ShieldCheckIcon className="h-5 w-5 mr-1 inline-block" /> },
        expired: { text: 'Expired', color: 'text-red-700 bg-red-100', icon: <ShieldExclamationIcon className="h-5 w-5 mr-1 inline-block" /> },
        pending_setup: { text: 'Pending Setup', color: 'text-yellow-700 bg-yellow-100', icon: <ClockIcon className="h-5 w-5 mr-1 inline-block" /> },
        setup_failed: { text: 'Setup Failed', color: 'text-orange-700 bg-orange-100', icon: <ShieldExclamationIcon className="h-5 w-5 mr-1 inline-block" /> },
    };

    const defaultStatusDisplay = {
        text: 'Status Unknown',
        color: 'text-slate-700 bg-slate-100', // A neutral default color
        icon: <InformationCircleIcon className="h-5 w-5 mr-1 inline-block" />
    };

    // Safely determine the status information to display
    let currentStatusRenderInfo = defaultStatusDisplay; // Assume default
    if (editableClient.status && typeof editableClient.status === 'string' && statusDisplayConfig.hasOwnProperty(editableClient.status)) {
        currentStatusRenderInfo = statusDisplayConfig[editableClient.status];
    }


    return (
        <div className="bg-white shadow-xl rounded-lg p-6 md:p-8 max-w-3xl mx-auto">
            <button
                type="button"
                onClick={onBack}
                className="mb-6 inline-flex items-center px-3 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
                <ArrowLeftIcon className="h-5 w-5 mr-2 text-slate-500" />
                Back to List
            </button>

            <div className="flex flex-col md:flex-row md:items-center md:space-x-6 mb-6">
                {logoUrl && (
                    <img 
                        src={logoUrl} 
                        alt={`${editableClient.name || 'Client'} logo`} // Added fallback for name
                        className="w-24 h-24 object-contain rounded-lg border border-slate-200 mb-4 md:mb-0 flex-shrink-0" 
                    />
                )}
                <div className="flex-1">
                    {isEditingDetails && canEditThisClient ? (
                         <div className="space-y-3">
                            <ErrorMessage message={detailsError} />
                            <SuccessMessage message={detailsSuccess} />
                            <div>
                                <label htmlFor="detail-name" className="block text-sm font-medium text-slate-700">Name:</label>
                                <input type="text" id="detail-name" name="name" value={editableClient.name || ''} onChange={handleDetailsChange} 
                                       className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                            </div>
                            <div>
                                <label htmlFor="detail-desc" className="block text-sm font-medium text-slate-700">Description:</label>
                                <textarea id="detail-desc" name="desc" value={editableClient.desc || ''} onChange={handleDetailsChange} rows={3}
                                          className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                            </div>
                            <div className="flex space-x-2">
                                <button type="button" onClick={handleDetailsUpdate} disabled={isLoadingDetails}
                                        className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50">
                                    {isLoadingDetails ? <LoadingSpinner size="sm" /> : <CheckIcon className="h-4 w-4 mr-1"/>} Save
                                </button>
                                <button type="button" onClick={() => { setIsEditingDetails(false); setEditableClient(client); setDetailsError(null); /* Reset changes & error */}} disabled={isLoadingDetails}
                                        className="inline-flex items-center px-3 py-1.5 border border-slate-300 text-xs font-medium rounded shadow-sm text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                                    <XMarkIcon className="h-4 w-4 mr-1"/> Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-slate-800">{editableClient.name || 'N/A'}</h2>
                                {canEditThisClient && (
                                    <button onClick={() => { setIsEditingDetails(true); setDetailsError(null); /* Clear previous errors */ }} title="Edit Name/Description"
                                            className="p-1.5 rounded-md text-slate-500 hover:text-blue-600 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500">
                                        <PencilIcon className="h-5 w-5" />
                                    </button>
                                )}
                            </div>
                            <p className="text-sm text-slate-600 mt-1">{editableClient.desc || 'No description provided.'}</p>
                        </>
                    )}
                </div>
            </div>

            <dl className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-1">
                 {/* Corrected line using currentStatusRenderInfo */}
                <DetailItem
                    icon={
                        <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${currentStatusRenderInfo.color}`}>
                            {currentStatusRenderInfo.icon} {currentStatusRenderInfo.text}
                        </span>
                    }
                    label="Status"
                    value="" // Status info is in the icon span
                    className=' gap-6'
                />
                <DetailItem icon={<GlobeAltIcon/>} label="Domain Slug" value={editableClient.domain} />

                <DetailItem icon={<GlobeAltIcon/>} label="By" value={editableClient.byName} />
                <DetailItem icon={<GlobeAltIcon/>} label="Domain Slug" value={editableClient.domain} />

                <DetailItem icon={<UserCircleIcon/>} label="Client Admin Username" value={editableClient.admin_name} />
                {/* <DetailItem icon={<ServerStackIcon/>} label="Database ID" value={editableClient.db_id} /> */}
                {/* <DetailItem icon={<PhotoIcon/>} label="Gallery Bucket ID" value={editableClient.gallery_bucket_id} /> */}
                {/* <DetailItem icon={<PhotoIcon/>} label="Assignment Bucket ID" value={editableClient.assignment_bucket_id} /> */}
                {/* <DetailItem icon={<PhotoIcon/>} label="Notes Bucket ID" value={editableClient.notes_bucket_id} /> */}
                {/* <DetailItem icon={<UserCircleIcon/>} label="Client Admin User ID (Appwrite)" value={editableClient.client_admin_user_id} /> */}
                {/* <DetailItem icon={<UserCircleIcon/>} label="Added By (Manager ID)" value={editableClient.by} /> */}
                <DetailItem
                    icon={<ClockIcon/>}
                    label="Created At"
                    value={editableClient.$createdAt ? new Date(editableClient.$createdAt).toLocaleString() : undefined} // Pass undefined for DetailItem to show N/A
                />
                <DetailItem
                    icon={<ClockIcon/>}
                    label="Last Updated"
                    value={editableClient.$updatedAt ? new Date(editableClient.$updatedAt).toLocaleString() : undefined} // Pass undefined for DetailItem to show N/A
                />
            </dl>

            {canEditThisClient && (
                <div className="mt-6 pt-6 border-t border-slate-200">
                    <h4 className="text-lg font-semibold text-slate-700 mb-2 flex items-center">
                        <CalendarDaysIcon className="h-6 w-6 mr-2 text-blue-500" />
                        Manage License
                    </h4>
                    <ErrorMessage message={licenseError} />
                    <SuccessMessage message={licenseSuccess} />
                    <div className="flex items-end space-x-3">
                        <div className="flex-grow">
                            <label htmlFor="license-date" className="block text-sm font-medium text-slate-700">License Expiry Date:</label>
                            <input
                                type="date"
                                id="license-date"
                                value={newLicenseDate}
                                onChange={(e) => setNewLicenseDate(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={handleLicenseUpdate} disabled={isLoadingLicense}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                        >
                            {isLoadingLicense ? (
                                <> <LoadingSpinner size="sm" /> <span className="ml-2">Updating...</span></>
                            ) : "Update License"}
                        </button>
                    </div>
                </div>
            )}

            <ClientNotes client={editableClient} onNoteAdded={handleNoteAdded} currentUser={currentUser} />
        </div>
    );
};

export default ClientDetailView;