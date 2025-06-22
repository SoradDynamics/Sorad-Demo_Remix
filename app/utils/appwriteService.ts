import {
    Client,
    Account,
    Databases,
    Storage,
    Avatars,
    Functions,
    ID,
    Query,
    Permission,
    Role,
    AppwriteException, // Good for type checking errors
  } from 'appwrite';
import { constants } from './constant';
  
  // --- Environment Variables ---
  const APPWRITE_ENDPOINT = import.meta.env.VITE_APPWRITE_ENDPOINT as string;
  const APPWRITE_PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID as string;
  
  import { useSchoolStore } from '~/store/schoolStore';
  const DB_ID = () => useSchoolStore.getState().dbId;
  const DB_Id = DB_ID as unknown as string;
  
  // Basic check for environment variables
  if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID) {
    console.error(
      'Appwrite environment variables VITE_APPWRITE_ENDPOINT or VITE_APPWRITE_PROJECT_ID are not set.',
    );
    throw new Error(
      'Missing Appwrite configuration. Please check your .env file.',
    );
  }
  
  class AppwriteService {
    private static instance: AppwriteService;
  
    public readonly client: Client;
    public readonly account: Account;
    public readonly databases: Databases;
    public readonly storage: Storage;
    public readonly avatars: Avatars;
    public readonly functions: Functions;
  
    // Expose Appwrite utilities for direct use from the service instance
    public readonly ID = ID;
    public readonly Query = Query;
    public readonly Permission = Permission;
    public readonly Role = Role;
  
    private constructor() {
      this.client = new Client();
      this.client.setEndpoint(APPWRITE_ENDPOINT).setProject(APPWRITE_PROJECT_ID);
  
      this.account = new Account(this.client);
      this.databases = new Databases(this.client);
      this.storage = new Storage(this.client);
      this.avatars = new Avatars(this.client);
      this.functions = new Functions(this.client);
  
      // console.log('AppwriteService Initialized');
    }
  
    /**
     * Gets the singleton instance of the AppwriteService.
     */
    public static getInstance(): AppwriteService {
      if (!AppwriteService.instance) {
        AppwriteService.instance = new AppwriteService();
      }
      return AppwriteService.instance;
    }
  
    /**
     * Helper to get the main database ID from environment variables.
     * This is useful if you have one primary database for your app.
     */
    public get mainDatabaseId(): string {
      const dbId = DB_Id as string;
      if (!dbId) {
        console.warn(
          'VITE_APPWRITE_DATABASE_ID is not set in environment variables. Operations requiring it might fail.',
        );
        // Optionally throw an error if it's strictly required for most operations
        // throw new Error("VITE_APPWRITE_DATABASE_ID is not configured.");
      }
      return dbId;
    }
  
    // --- Optional: Add common helper methods here ---
  
    /**
     * Example: Fetches the current logged-in user's account details.
     * @returns {Promise<Models.User<Models.Preferences> | null>} User object or null if not logged in or error.
     */
    // async getCurrentUser(): Promise<Models.User<Models.Preferences> | null> {
    //   try {
    //     return await this.account.get();
    //   } catch (error) {
    //     if (error instanceof AppwriteException && error.code === 401) {
    //       // Not logged in or session expired
    //       console.info('AppwriteService: No active user session.');
    //     } else {
    //       console.error('AppwriteService: Error fetching current user:', error);
    //     }
    //     return null;
    //   }
    // }
  
    /**
     * Example: Fetches the current active session.
     * @returns {Promise<Models.Session | null>} Session object or null if no active session or error.
     */
    // async getCurrentSession(): Promise<Models.Session | null> {
    //   try {
    //     return await this.account.getSession('current');
    //   } catch (error) {
    //     if (error instanceof AppwriteException && error.code === 401) {
    //       console.info('AppwriteService: No active session.');
    //     } else {
    //       console.error('AppwriteService: Error fetching current session:', error);
    //     }
    //     return null;
    //   }
    // }
  }
  
  // --- How to use it in other files (e.g., your Zustand store or components) ---
  
  // Option 1: Export the class and call getInstance() where needed (Recommended for flexibility)
  //
  // In your store (e.g., adminDashboardStore.ts):
  // import { AppwriteService } from '../services/appwriteService';
  // const appwrite = AppwriteService.getInstance();
  //
  // const documents = await appwrite.databases.listDocuments(
  //   appwrite.mainDatabaseId, // or DB_Id
  //   'your_collection_id'
  // );
  
  // Option 2: Export a pre-initialized singleton instance directly (Simpler for smaller apps)
  //
  // const appwriteService = AppwriteService.getInstance();
  // export default appwriteService;
  //
  // In your store (e.g., adminDashboardStore.ts):
  // import appwriteService from '../services/appwriteService';
  // const documents = await appwriteService.databases.listDocuments(...);
  
  // For this project, Option 1 is generally better as it makes dependencies more explicit.
  // We will export the class and utilities.
  export {
    AppwriteService,
    ID,
    Query,
    Permission,
    Role,
    AppwriteException, // Good to export for type checking errors
  };