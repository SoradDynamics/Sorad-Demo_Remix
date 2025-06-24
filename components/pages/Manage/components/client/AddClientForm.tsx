// src/components/client/AddClientForm.tsx
import React, { useState } from 'react';
import { AddClientPayload, ClientApiError, ClientMetadata } from '../../types';
import { addClient } from '../../services/clientApiService';
import Modal from '../common/Modal';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import SuccessMessage from '../common/SuccessMessage'; // Added for success
import { PlusCircleIcon } from '@heroicons/react/24/outline';

interface AddClientFormProps {
    isOpen: boolean;
    onClose: () => void;
    onClientAdded: (newClient: ClientMetadata, adminPassword?: string) => void;
}

const AddClientForm: React.FC<AddClientFormProps> = ({ isOpen, onClose, onClientAdded }) => {
    const [name, setName] = useState('');
    const [desc, setDesc] = useState('');
    const [domain, setDomain] = useState('');
    const [adminName, setAdminName] = useState('');
    const [licenseDate, setLicenseDate] = useState('');
    const [logoImage, setLogoImage] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const [byName, setByName] = useState('');
    const [byContact, setByContact] = useState('');



    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files[0]) {
            const file = event.target.files[0];
            setLogoImage(file);
            setLogoPreview(URL.createObjectURL(file));
        } else {
            setLogoImage(null);
            setLogoPreview(null);
        }
    };
    
    const resetForm = () => {
        setName(''); setDesc(''); setDomain(''); setAdminName(''); 
        setLicenseDate(''); setLogoImage(null); setLogoPreview(null);
        setError(null);
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        setError(null);
        setSuccessMessage(null);

        if (adminName.includes(' ')) {
            setError("Admin name cannot contain spaces.");
            return;
        }
        // if (!domain.match(/^[a-zA-Z0-9-]+$/)) {
        //     setError("Domain can only contain letters, numbers, and hyphens.");
        //     return;
        // }

        const payload: AddClientPayload = {
            name,
            desc,
            domain: `${domain.toLowerCase()}.edu`,
            admin_name: adminName,
            license_date: licenseDate,
            logoImage: logoImage || undefined,
            byName,
            byContact,
        };

        setIsLoading(true);
        try {
            const result = await addClient(payload);
            setSuccessMessage(`${result.message}. Client Admin Email: ${adminName}@${domain}.edu. Initial Password: ${result.adminPassword || 'Not provided (see server logs)'}. And Libriary email: library@${domain}.edu and Password: ${result.libPassword || 'Not provided (see server logs)'}.  PLEASE SAVE THIS PASSWORD SECURELY.`);
            onClientAdded(result.client, result.adminPassword);
            resetForm();
            // Keep modal open to show success message for a bit, user can close it
            // setTimeout(() => { onClose(); setSuccessMessage(null); }, 7000);
        } catch (e: any) {
            const apiError = e as ClientApiError;
            setError(apiError.message || "Failed to add client.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={() => { resetForm(); onClose(); setSuccessMessage(null);}} title="Add New Client" size="lg">
            <form onSubmit={handleSubmit} className="space-y-4">
                <ErrorMessage message={error} />
                <SuccessMessage message={successMessage} />

                <div>
                    <label htmlFor="client-name" className="block text-sm font-medium text-slate-700">Client Name *</label>
                    <input id="client-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required 
                           className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                </div>
                <div>
                    <label htmlFor="client-desc" className="block text-sm font-medium text-slate-700">Description</label>
                    <textarea id="client-desc" value={desc} onChange={(e) => setDesc(e.target.value)} rows={3}
                              className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                              placeholder=' address, contact, social media of client etc'/>
                </div>
                <div>
                    <label htmlFor="client-domain" className="block text-sm font-medium text-slate-700">Unique Domain Slug *</label>
                    <input id="client-domain" type="text" value={domain} onChange={(e) => setDomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} placeholder="e.g., myschool (dont write .com or .edu)" required 
                           className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                    <p className="mt-1 text-xs text-slate-500">Used for DB IDs, bucket IDs (e.g., db_myschool). Letters, numbers, hyphens only.</p>
                </div>
                 <div>
                    <label htmlFor="client-admin-name" className="block text-sm font-medium text-slate-700">Client Admin Username *</label>
                    <input id="client-admin-name" type="text" value={adminName} onChange={(e) => setAdminName(e.target.value.replace(/\s+/g, ''))} placeholder="e.g., schooladmin (school admin user name)" required 
                           className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                    <p className="mt-1 text-xs text-slate-500">No spaces. Will be used for admin email: username@{domain || 'yourdomain'}.edu</p>
                </div>
                <div>
                    <label htmlFor="client-license-date" className="block text-sm font-medium text-slate-700">License Expiry Date *</label>
                    <input id="client-license-date" type="date" value={licenseDate} onChange={(e) => setLicenseDate(e.target.value)} required 
                           className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"/>
                </div>

                {/* by */}
                <div>
                    <label htmlFor="client-admin-name" className="block text-sm font-medium text-slate-700">By: *</label>
                    <input id="client-admin-name" type="text" value={byName} onChange={(e) => setByName(e.target.value)}   required 
                           className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                           placeholder=' Your name'/>
                    {/* <p className="mt-1 text-xs text-slate-500">Your name</p> */}
                </div>

                                {/* contact */}
                                <div>
                    <label htmlFor="client-admin-name" className="block text-sm font-medium text-slate-700">Your conatct: *</label>
                    <input id="client-admin-name" type="text" value={byContact} onChange={(e) => setByContact(e.target.value)}   required 
                           className="mt-1 block w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                           placeholder=' Your contact information'/>
                    <p className="mt-1 text-xs text-slate-500">This will be displayed to client to contact you</p>
                </div>


                {/* <div>
                    <label htmlFor="client-logo" className="block text-sm font-medium text-slate-700">Logo Image</label>
                    <input id="client-logo" type="file" accept="image/*" onChange={handleFileChange} 
                           className="mt-1 block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                    {logoPreview && <img src={logoPreview} alt="Logo preview" className="mt-2 h-20 w-auto object-contain border rounded"/>}
                </div> */}

                <div className="pt-2">
                    <button type="submit" 
                            className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            disabled={isLoading}>
                        {isLoading ? (
                             <> <LoadingSpinner size="sm" /> <span className="ml-2">Adding Client...</span> </>
                        ) : (
                             <> <PlusCircleIcon className="h-5 w-5 mr-2" /> Add Client </>
                        )}
                    </button>
                </div>
            </form>
        </Modal>
    );
};

export default AddClientForm;