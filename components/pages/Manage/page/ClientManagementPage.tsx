// src/pages/ClientManagementPage.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { ClientMetadata, ClientApiError } // CurrentUser removed from here
from '../types';
import { fetchClients, fetchClientById } from '../services/clientApiService';
import ClientList from '../components/client/ClientList';
import ClientDetailView from '../components/client/ClientDetailView';
import AddClientForm from '../components/client/AddClientForm';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';
import { PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../hooks/useAuth'; // IMPORT YOUR AUTH HOOK
import { account } from '~/utils/appwrite';
import toast from 'react-hot-toast';
import { LogOutIcon } from 'lucide-react';

// Props are no longer needed for currentUser
// interface ClientManagementPageProps {
//     currentUser: CurrentUser | null;
// }

const ClientManagementPage: React.FC = () => { // No props defined here now
    const { currentUser, isLoading: authIsLoading, isAuthenticated } = useAuth(); // Use the hook

    const [clients, setClients] = useState<ClientMetadata[]>([]);
    const [filteredClients, setFilteredClients] = useState<ClientMetadata[]>([]);
    const [selectedClient, setSelectedClient] = useState<ClientMetadata | null>(null);
    
    const [isLoading, setIsLoading] = useState(true);
    const [pageError, setPageError] = useState<string | null>(null);
    const [detailViewError, setDetailViewError] = useState<string | null>(null);

    const [showAddModal, setShowAddModal] = useState(false);

    const [nameFilter, setNameFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');

    const loadAllClients = useCallback(async (filtersToApply?: { name?: string; status?: string }) => {
        // currentUser is now available from the useAuth hook
        if (!currentUser || !currentUser.labels.includes('manage')) {
            setPageError("You are not authorized to view this page.");
            setIsLoading(false);
            return;
        }
        setIsLoading(true);
        setPageError(null);
        try {
            const serverFilters = filtersToApply || {
                name: nameFilter.trim() ? nameFilter.trim() : undefined,
                status: statusFilter || undefined,
            };
            const fetchedClients = await fetchClients(serverFilters);
            setClients(fetchedClients);
            setFilteredClients(fetchedClients);
        } catch (e: any) {
            const apiError = e as ClientApiError;
            setPageError(apiError.message || 'Failed to load clients');
            setClients([]);
            setFilteredClients([]);
        } finally {
            setIsLoading(false);
        }
    }, [currentUser, nameFilter, statusFilter]);

    useEffect(() => {
        if (authIsLoading) { // Wait for auth state to resolve
            return;
        }

        if (isAuthenticated && currentUser && currentUser.labels.includes('manage')) {
             loadAllClients({ name: nameFilter, status: statusFilter });
        } else if (isAuthenticated && currentUser && !currentUser.labels.includes('manage')) {
             setPageError("You are not authorized to manage clients.");
             setIsLoading(false);
        } else if (!isAuthenticated) {
            setPageError("Please log in to manage clients."); // Or your router should handle this
            setIsLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentUser, isAuthenticated, authIsLoading]); // Depend on auth state


    const handleFilterApply = () => {
        if (!authIsLoading && isAuthenticated) {
            loadAllClients({ name: nameFilter, status: statusFilter });
        }
    };

    const handleClientSelect = async (client: ClientMetadata) => {
        if (!currentUser) return; // Should be covered by isAuthenticated check
        const canViewDetails = currentUser.labels.includes('pro') || client.by === currentUser.$id;
        if (canViewDetails) {
            setIsLoading(true);
            setDetailViewError(null);
            try {
                const detailedClient = await fetchClientById(client.$id);
                setSelectedClient(detailedClient);
            } catch (e: any) {
                 const apiError = e as ClientApiError;
                 setDetailViewError(apiError.message || 'Failed to load client details');
                 setSelectedClient(null);
            } finally {
                setIsLoading(false);
            }
        } else {
            alert("You don't have permission to view details for this client.");
        }
    };

    const handleBackToList = () => {
        setSelectedClient(null);
        setDetailViewError(null);
        if (!authIsLoading && isAuthenticated) {
            loadAllClients({ name: nameFilter, status: statusFilter });
        }
    };

    const handleClientAdded = (newClient: ClientMetadata, adminPassword?: string) => {
        if (!authIsLoading && isAuthenticated) {
            loadAllClients({ name: nameFilter, status: statusFilter });
        }
    };

    const handleClientUpdateInDetail = (updatedClient: ClientMetadata) => {
        setSelectedClient(updatedClient);
        setClients(prevClients => prevClients.map(c => c.$id === updatedClient.$id ? updatedClient : c));
        setFilteredClients(prevFiltered => prevFiltered.map(c => c.$id === updatedClient.$id ? updatedClient : c));
    };

    // --- Render Logic ---
    if (authIsLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner size="lg" /> <span className="ml-3 text-slate-600">Authenticating...</span>
            </div>
        );
    }

    if (!isAuthenticated) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <ErrorMessage message={pageError || "Please log in to access this page."} />
                {/* Optionally, include a login button or redirect logic here if not handled by a router */}
            </div>
        );
    }
    
    // currentUser is guaranteed to be non-null if isAuthenticated is true
    if (currentUser && !currentUser.labels.includes('manage')) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <ErrorMessage message={pageError || "You are not authorized to access this page."} />
            </div>
        );
    }

    // At this point, user is authenticated and is a manager
    // currentUser is available and non-null

    if (isLoading && !selectedClient && clients.length === 0 && !pageError) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <LoadingSpinner size="lg" /> <span className="ml-3 text-slate-600">Loading Clients...</span>
            </div>
        );
    }
    
    if (selectedClient && currentUser) { // currentUser check is redundant here due to above logic but good for type safety
        return (
            <div className="container mx-auto px-2 sm:px-4 py-8">
                <ErrorMessage message={detailViewError} />
                {isLoading && <div className="fixed top-4 right-4 z-50"><LoadingSpinner size="sm"/></div>}
                <ClientDetailView
                    client={selectedClient}
                    onBack={handleBackToList}
                    onClientUpdate={handleClientUpdateInDetail}
                    currentUser={currentUser} // Still pass currentUser to children that need it
                />
            </div>
        );
    }

    const handleLogout = async () => {
        try {
            await account.deleteSession("current");
            toast.success("Logged out successfully!");
            window.location.reload();
        } catch (error: any) {
            console.error("Logout failed:", error);
            toast.error(error.message || "Logout failed!");
        }
    };



    // Main list view
    return (
        <div className="container mx-auto px-2 sm:px-4 py-8">
            <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-slate-800">Client Management</h1>
                <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    Add New Client
                </button>

                <button
                    type="button"
                    onClick={handleLogout}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                    <LogOutIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                    Logout
                </button>
                
            </div>

            {currentUser && <AddClientForm // Pass currentUser if AddClientForm needs it (e.g. for manager ID)
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onClientAdded={handleClientAdded}
                // If AddClientForm needs to know who is adding, pass currentUser
                // loggedInManagerId={currentUser.$id} 
            />}

            <div className="bg-white shadow-md rounded-lg p-4 md:p-6 mb-6">
                <h3 className="text-lg font-semibold text-slate-700 mb-3">Filters</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <label htmlFor="name-filter" className="block text-sm font-medium text-slate-700">Filter by name</label>
                        <input
                            type="text"
                            id="name-filter"
                            placeholder="Enter client name..."
                            value={nameFilter}
                            onChange={(e) => setNameFilter(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                    <div>
                        <label htmlFor="status-filter" className="block text-sm font-medium text-slate-700">Filter by status</label>
                        <select id="status-filter" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
                                className="mt-1 block w-full px-3 py-2 border border-slate-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm">
                            <option value="">All Statuses</option>
                            <option value="active">Active</option>
                            <option value="expired">Expired</option>
                            <option value="pending_setup">Pending Setup</option>
                            <option value="setup_failed">Setup Failed</option>
                        </select>
                    </div>
                    <button
                        type="button"
                        onClick={handleFilterApply}
                        className="md:mt-0 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        <MagnifyingGlassIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                        Apply Filters
                    </button>
                </div>
            </div>
            
            {/* Combined loading and error display for the list */}
            {isLoading && <div className="text-center py-4"><LoadingSpinner /></div>}
            {pageError && !isLoading && <ErrorMessage message={pageError} />}
            {!isLoading && !pageError && clients.length === 0 && <p className="text-center text-slate-500 py-8">No clients found.</p>}
            {!isLoading && !pageError && clients.length > 0 && <ClientList clients={filteredClients} onClientSelect={handleClientSelect} />}
        </div>
    );
};

// If you named the file ManageSchoolsPage.tsx, then the export should match:
// export default ManageSchoolsPage;
export default ClientManagementPage;