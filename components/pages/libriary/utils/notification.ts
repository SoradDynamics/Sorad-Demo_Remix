// ~/utils/notification.ts
import { databases, ID as AppwriteID } from '~/utils/appwrite'; // Renamed ID to AppwriteID
import { Models } from 'appwrite';
import { APPWRITE_DATABASE_ID, NOTIFICATIONS_COLLECTION_ID } from '../constants/appwriteIds'; // Assuming constants are here

// We need to get the current user's email.
// It's better if the calling service (libraryService) fetches this and passes it.
// import { getCurrentUserEmail } from '~/utils/appwrite';


export interface NotificationData {
  title: string;
  msg: string;
  to: string[];      // Array of target custom IDs, e.g., ["id:S001", "id:T002"]
  valid: string;     // Date string "YYYY-MM-DD"
  sender: string;    // Email of the sender (logged-in user)
  date?: string;     // Optional: ISO string for creation date, if your schema has 'date'
  // Add any other fields your coll-notify schema expects
}

/**
 * Creates a new notification document in the 'coll-notify' collection.
 */
export const createNotificationEntry = async (notificationPayload: NotificationData): Promise<Models.Document> => { // Use Models.Document for Appwrite type
  if (!APPWRITE_DATABASE_ID || !NOTIFICATIONS_COLLECTION_ID) {
    console.error('NotificationService: Database ID or Notifications Collection ID is not configured.');
    throw new Error('Notification service is not properly configured.');
  }

  // Add current date if your schema requires it (and it's not auto-generated by Appwrite)
  const payloadWithDate = {
    ...notificationPayload,
    date: notificationPayload.date || new Date().toISOString(), // Add current date if not provided
  };

  // console.log('[NotificationService] Creating notification with payload:', payloadWithDate);

  try {
    const document = await databases.createDocument(
      APPWRITE_DATABASE_ID,
      NOTIFICATIONS_COLLECTION_ID,
      AppwriteID.unique(), // Use the imported AppwriteID
      payloadWithDate     // Send the payload with all required fields
    );
    // console.log('[NotificationService] Notification created successfully:', document.$id);
    return document;
  } catch (error) {
    console.error('[NotificationService] Error creating notification:', error);
    throw error;
  }
};

// This function should ideally be in a more general date utility file (like your dateConverter.ts)
// but keeping it here as per your provided file structure.
/**
 * Generates tomorrow's date in YYYY-MM-DD format.
 * @returns Date string for tomorrow.
 */
export const getTomorrowDateStringForNotification = (): string => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};