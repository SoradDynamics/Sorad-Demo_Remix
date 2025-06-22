import axios, { AxiosError } from 'axios';
import { ClientMetadata, AddClientPayload, ClientApiError } from '../types'; // Ensure your types are correct
import {
    storage as appwriteBrowserStorage,
    APPWRITE_BUCKET_ID_METADATA,
    account as appwriteAccount // CRITICAL: This must be correctly imported and initialized
} from '~/utils/appwrite'; // Ensure this path is correct and lib/appwrite.ts exports 'account'

// Ensure VITE_API_BASE_URL is set in your .env file (e.g., VITE_API_BASE_URL=http://localhost:5001/api)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
if (!API_BASE_URL) {
    console.error("CRITICAL: VITE_API_BASE_URL is not defined in your frontend's .env file!");
}

const apiClient = axios.create({
    baseURL: API_BASE_URL,
});

// Axios Interceptor: Attempts to add Appwrite JWT to outgoing requests
apiClient.interceptors.request.use(
    async (config) => {
        const requestUrl = config.baseURL ? config.baseURL + (config.url || '') : (config.url || '');
        // console.log(`[AxiosInterceptor] Preparing request for: ${config.method?.toUpperCase()} ${requestUrl}`);

        if (!appwriteAccount) {
            console.error('[AxiosInterceptor] CRITICAL FAILURE: `appwriteAccount` service is undefined. Check import from `lib/appwrite.ts`. No token will be attached.');
            if (config.headers) delete config.headers['Authorization'];
            return config;
        }

        try {
            // console.log('[AxiosInterceptor] Attempting to retrieve current Appwrite session...');
            const session = await appwriteAccount.getSession('current'); // Attempt to get the current session

            if (session && session.jwt) {
                const jwt = session.jwt;
                // // console.log('[AxiosInterceptor] Full session object:', session); // For detailed debugging
                // console.log(`[AxiosInterceptor] SUCCESS: JWT retrieved from session. Length: ${jwt.length}. UserID in session: ${session.userId}`);
                
                if (config.headers) {
                    config.headers['Authorization'] = `Bearer ${jwt}`;
                    // console.log('[AxiosInterceptor] Authorization header SET with Bearer token.');
                } else {
                    // This should not happen with a standard Axios config object
                    console.warn('[AxiosInterceptor] Axios request config.headers is undefined. Cannot set Authorization header.');
                }
            } else {
                console.warn('[AxiosInterceptor] No active Appwrite session found, or session object does not contain JWT. Request will be unauthenticated.');
                // // console.log('[AxiosInterceptor] Session object when JWT was missing:', session); // For debugging
                if (config.headers) {
                    delete config.headers['Authorization'];
                    // console.log('[AxiosInterceptor] Authorization header cleared (no JWT in session).');
                }
            }
        } catch (error) {
            // This catch block is typically hit if account.getSession('current') throws,
            // which usually means "no active session" (e.g., 401 from Appwrite if it tries to verify).
            console.warn('[AxiosInterceptor] Error retrieving Appwrite session (likely indicates no user is logged in):', error);
            if (config.headers) {
                delete config.headers['Authorization'];
                // console.log('[AxiosInterceptor] Authorization header cleared due to error fetching session.');
            }
        }
        // // console.log('[AxiosInterceptor] Final request headers:', config.headers); // For debugging
        return config; // Return the (potentially modified) config
    },
    (error) => {
        // Handles errors that occur when setting up the request (before it's sent)
        console.error('[AxiosInterceptor] Error in request setup:', error);
        return Promise.reject(error);
    }
);

// Helper to transform AxiosError into a structured ClientApiError
const handleError = (error: AxiosError): ClientApiError => {
    // console.error("[handleError] Axios error object:", error); // Full error object
    if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        const responseData = error.response.data as any;
        console.error('[handleError] Server Error Response:', {
            status: error.response.status,
            data: responseData,
            headers: error.response.headers,
        });
        return {
            message: responseData?.message || error.message || "An unknown server error occurred.",
            error: responseData?.error || responseData, // Include original error or full response data
        };
    } else if (error.request) {
        // The request was made but no response was received
        // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
        // http.ClientRequest in node.js
        console.error('[handleError] Network Error (No Response):', error.request);
        return {
            message: "Network error: No response received from server. Check server status and network connection.",
        };
    } else {
        // Something happened in setting up the request that triggered an Error
        console.error('[handleError] Request Setup Error:', error.message);
        return {
            message: `Request setup error: ${error.message}`,
        };
    }
};


// --- API Functions ---

export const fetchClients = async (filters?: { name?: string; status?: string }): Promise<ClientMetadata[]> => {
    // console.log('[ApiService] fetchClients called. Filters:', filters);
    try {
        const params: Record<string, string> = {};
        if (filters?.name?.trim()) params.name = filters.name.trim();
        if (filters?.status?.trim()) params.status = filters.status.trim();

        const response = await apiClient.get<ClientMetadata[]>('/clients', {
            params: Object.keys(params).length > 0 ? params : undefined
        });
        // console.log('[ApiService] fetchClients SUCCESS. Count:', response.data.length);
        return response.data;
    } catch (error) {
        console.error('[ApiService] fetchClients FAILED.');
        throw handleError(error as AxiosError);
    }
};

export const fetchClientById = async (id: string): Promise<ClientMetadata> => {
    // console.log(`[ApiService] fetchClientById called. ID: ${id}`);
    try {
        const response = await apiClient.get<ClientMetadata>(`/clients/${id}`);
        // console.log(`[ApiService] fetchClientById SUCCESS for ID: ${id}`);
        return response.data;
    } catch (error) {
        console.error(`[ApiService] fetchClientById FAILED for ID: ${id}.`);
        throw handleError(error as AxiosError);
    }
};

export const addClient = async (payload: AddClientPayload): Promise<{ message: string; client: ClientMetadata; adminPassword?: string; libPassword?: string }> => {
    // console.log('[ApiService] addClient called. Payload (image name):', { ...payload, logoImage: payload.logoImage?.name });
    const formData = new FormData();
    formData.append('name', payload.name);
    if (payload.desc) formData.append('desc', payload.desc);
    formData.append('domain', payload.domain);
    formData.append('admin_name', payload.admin_name);
    formData.append('license_date', payload.license_date);
    formData.append('byName', payload.byName);
    formData.append('byContact', payload.byContact);


    if (payload.logoImage) {
        formData.append('logoImage', payload.logoImage, payload.logoImage.name);
    }

    try {
        const response = await apiClient.post<{ message: string; client: ClientMetadata; adminPassword?: string; libPassword?: string }>('/clients', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        // console.log('[ApiService] addClient SUCCESS.');
        return response.data;
    } catch (error) {
        console.error('[ApiService] addClient FAILED.');
        throw handleError(error as AxiosError);
    }
};

export const updateClientDetails = async (id: string, data: Partial<Pick<ClientMetadata, 'name' | 'desc'>>): Promise<ClientMetadata> => {
    // console.log(`[ApiService] updateClientDetails. ID: ${id}, Data:`, data);
    try {
        const response = await apiClient.put<ClientMetadata>(`/clients/${id}`, data);
        // console.log(`[ApiService] updateClientDetails SUCCESS for ID: ${id}.`);
        return response.data;
    } catch (error) {
        console.error(`[ApiService] updateClientDetails FAILED for ID: ${id}.`);
        throw handleError(error as AxiosError);
    }
};

export const updateClientLicense = async (id: string, license_date: string): Promise<ClientMetadata> => {
    // console.log(`[ApiService] updateClientLicense. ID: ${id}, Date: ${license_date}`);
    try {
        const response = await apiClient.put<ClientMetadata>(`/clients/${id}/license`, { license_date });
        // console.log(`[ApiService] updateClientLicense SUCCESS for ID: ${id}.`);
        return response.data;
    } catch (error) {
        console.error(`[ApiService] updateClientLicense FAILED for ID: ${id}.`);
        throw handleError(error as AxiosError);
    }
};

export const addClientNoteApi = async (id: string, note: string): Promise<ClientMetadata> => {
    // console.log(`[ApiService] addClientNoteApi. ID: ${id}, Note: "${note.substring(0, 30)}..."`);
    try {
        const response = await apiClient.post<ClientMetadata>(`/clients/${id}/notes`, { note });
        // console.log(`[ApiService] addClientNoteApi SUCCESS for ID: ${id}.`);
        return response.data;
    } catch (error) {
        console.error(`[ApiService] addClientNoteApi FAILED for ID: ${id}.`);
        throw handleError(error as AxiosError);
    }
};

export const getLogoPreviewUrl = (fileId: string): URL | null => {
    if (!fileId || !APPWRITE_BUCKET_ID_METADATA) {
        return null;
    }
    try {
        return appwriteBrowserStorage.getFilePreview(APPWRITE_BUCKET_ID_METADATA, fileId, 200, 0, undefined, 85);
    } catch (error) {
        console.error(`[Util] Error getting file preview for Appwrite File ID ${fileId}:`, error);
        return null;
    }
};