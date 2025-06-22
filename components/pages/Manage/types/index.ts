// src/types/index.ts

// This is the user object your existing auth system should provide.
// Components will expect this shape if they need user-specific logic.
export interface CurrentUser {
    $id: string;       // Appwrite User ID
    labels: string[];  // e.g., ['manage', 'pro']
    // Add any other properties your auth system provides and your app needs
    name?: string;
    email?: string;
}

export interface ClientMetadata {
    $id: string;
    name: string;
    desc?: string;
    admin_name: string;
    domain: string;
    db_id: string;
    gallery_bucket_id: string;
    assignment_bucket_id: string;
    notes_bucket_id: string;
    by: string; // User ID of manager who added it
    license_date: string; // ISO Date string
    logo_image_id?: string;
    status: 'active' | 'expired' | 'pending_setup' | 'setup_failed';
    client_admin_user_id: string;
    client_notes?: string[]; // Array of notes, e.g., "YYYY-MM-DDTHH:mm:ss.sssZ: Note content"
    $createdAt: string;
    $updatedAt: string;
    byName: string;
}

export interface AddClientPayload {
    name: string;
    desc?: string;
    domain: string;
    admin_name: string;
    license_date: string; // Expected format YYYY-MM-DD
    logoImage?: File;

    byName: string;
    byContact: string;
}

export interface ClientApiError {
    message: string;
    // You might have other properties in your backend error response
    error?: any;
}