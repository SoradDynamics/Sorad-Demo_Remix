// src/hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { Models } from 'appwrite'; // Assuming your user is an Appwrite User model
import { account as appwriteAccountService } from '~/utils/appwrite'; // Assuming you have appwrite.ts for client-side SDK
import { CurrentUser } from '../types'; // Your CurrentUser type

interface AuthState {
    currentUser: CurrentUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    // You might have other auth-related functions like login, logout, etc.
}

// THIS IS A PLACEHOLDER HOOK. REPLACE WITH YOUR ACTUAL AUTH HOOK.
export const useAuth = (): AuthState => {
    const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkCurrentUser = async () => {
            setIsLoading(true);
            try {
                // This is how you'd typically get the user with Appwrite client-side
                const appwriteUser: Models.User<Models.Preferences> = await appwriteAccountService.get();
                
                // Adapt this to match your CurrentUser type structure
                setCurrentUser({
                    $id: appwriteUser.$id,
                    labels: appwriteUser.labels || [], // Ensure labels is an array
                    name: appwriteUser.name,
                    email: appwriteUser.email,
                    // Add any other fields from appwriteUser that are in your CurrentUser type
                });
            } catch (error) {
                // No user logged in or session expired
                setCurrentUser(null);
                console.warn("No active Appwrite session or failed to get user:", error);
            } finally {
                setIsLoading(false);
            }
        };

        checkCurrentUser();
    }, []);

    return {
        currentUser,
        isLoading,
        isAuthenticated: !!currentUser,
    };
};