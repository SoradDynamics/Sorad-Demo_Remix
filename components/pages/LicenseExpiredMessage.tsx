// Conponent.tsx

import React, { useState, useEffect, useRef } from 'react';
import { useSchoolStore } from '~/store/schoolStore';
import { databases, Query } from '~/utils/appwrite'; // Removed APPWRITE_DATABASE_ID as it's not used here
import { Models } from 'appwrite';

interface SchoolMetadataDoc extends Models.Document {
  byContact: string;
  domain: string;
}

const LicenseExpiredMessage: React.FC = () => {
  const schoolDomainFromStore = useSchoolStore(state => state.domain);

  const [byContactInfo, setByContactInfo] = useState<string | null>(null);
  const [isLoadingContact, setIsLoadingContact] = useState<boolean>(false);
  const [contactError, setContactError] = useState<string | null>(null);

  // Define these constants outside useEffect as they don't change based on component state/props
  const DATABASE_ID_TO_QUERY = import.meta.env.VITE_APPWRITE_SCHOOLSYSTEMDB_DATABASE_ID as string || 'SchoolSystemDB';
  const SCHOOLS_METADATA_COLLECTION_ID = import.meta.env.VITE_APPWRITE_SCHOOLS_METADATA_COLLECTION_ID as string || 'schools_metadata';

  // To keep track of the domain for which a fetch was initiated.
  // This helps in ignoring results from stale fetches if the domain changes quickly.
  const activeFetchDomainRef = useRef<string | null>(null);

  useEffect(() => {
    // Capture the domain at the moment the effect runs.
    // This specific value will be used for the fetch operation.
    const domainToFetch = schoolDomainFromStore;
    activeFetchDomainRef.current = domainToFetch; // Update ref to current domain being processed by this effect instance

    if (!domainToFetch) {
      // // console.log("LicenseExpiredMessage Effect: Domain is null or empty. Resetting contact info.");
      if (byContactInfo !== null) setByContactInfo(null);
      if (contactError !== null) setContactError(null);
      if (isLoadingContact) setIsLoadingContact(false);
      return;
    }

    if (!DATABASE_ID_TO_QUERY) {
      console.error("LicenseExpiredMessage: SchoolSystemDB Database ID is not defined. Please set VITE_APPWRITE_SCHOOLSYSTEMDB_DATABASE_ID.");
      if (contactError !== "Configuration error: SchoolSystemDB ID missing.") setContactError("Configuration error: SchoolSystemDB ID missing.");
      if (isLoadingContact) setIsLoadingContact(false);
      return;
    }

    if (!SCHOOLS_METADATA_COLLECTION_ID) {
      console.error("LicenseExpiredMessage: schools_metadata Collection ID is not defined. Please set VITE_APPWRITE_SCHOOLS_METADATA_COLLECTION_ID.");
      if (contactError !== "Configuration error: Metadata Collection ID missing.") setContactError("Configuration error: Metadata Collection ID missing.");
      if (isLoadingContact) setIsLoadingContact(false);
      return;
    }

    const fetchSchoolContact = async () => {
      // // console.log(`LicenseExpiredMessage Effect: Initiating fetch for domain: ${domainToFetch}`);
      setIsLoadingContact(true);
      // Reset previous error/info for a new fetch attempt for this domain
      setContactError(null);
      setByContactInfo(null);

      try {
        const response = await databases.listDocuments<SchoolMetadataDoc>(
          DATABASE_ID_TO_QUERY,
          SCHOOLS_METADATA_COLLECTION_ID,
          [Query.equal('domain', domainToFetch)]
        );

        // Critical: Only update state if the domain for this fetch
        // is still the one this effect instance is concerned with.
        if (activeFetchDomainRef.current === domainToFetch) {
          if (response.documents.length > 0) {
            setByContactInfo(response.documents[0].byContact);
          } else {
            // console.warn(`No schools_metadata document found for domain: ${domainToFetch}`);
            setContactError('Contact information not found for this school.');
          }
        } else {
          // // console.log(`LicenseExpiredMessage Effect: Domain changed from ${domainToFetch} to ${activeFetchDomainRef.current} during fetch. Stale data ignored.`);
        }
      } catch (error: any) {
        console.error('Failed to fetch school contact information:', error);
        if (activeFetchDomainRef.current === domainToFetch) {
          setContactError(error.message || 'Error fetching contact details.');
        } else {
          // // console.log(`LicenseExpiredMessage Effect: Domain changed from ${domainToFetch} to ${activeFetchDomainRef.current} during fetch error. Stale error ignored.`);
        }
      } finally {
        if (activeFetchDomainRef.current === domainToFetch) {
          setIsLoadingContact(false);
        }
      }
    };

    fetchSchoolContact();

    // Cleanup function: Not strictly necessary for listDocuments unless you have an AbortController.
    // The activeFetchDomainRef.current check handles staleness.
    return () => {
      // // console.log(`LicenseExpiredMessage Effect: Cleanup for domain ${domainToFetch}. Current active is ${activeFetchDomainRef.current}`);
      // If you were using AbortController: controller.abort();
    };

  }, [schoolDomainFromStore, DATABASE_ID_TO_QUERY, SCHOOLS_METADATA_COLLECTION_ID]); // Effect dependencies

  const renderContactInfo = () => {
    if (!schoolDomainFromStore && !isLoadingContact) { // Domain not yet loaded, and not actively loading for it
        return <span className="font-semibold text-blue-600 hover:underline">your school administration</span>;
    }
    if (isLoadingContact) {
      return <span className="font-semibold italic">Loading contact...</span>;
    }
    if (contactError) {
      // Fallback message if error occurs
      return <span className="font-semibold text-blue-600 hover:underline">your school administration</span>;
    }
    if (byContactInfo) {
      return <span className="font-semibold text-blue-600 hover:underline">{byContactInfo}</span>;
    }
    // Default if domain exists but no contact info found (and no error, not loading)
    if(schoolDomainFromStore && !byContactInfo && !isLoadingContact && !contactError){
        return <span className="font-semibold text-blue-600 hover:underline">your school administration (details not found)</span>;
    }
    // General fallback
    return <span className="font-semibold text-blue-600 hover:underline">your school administration</span>;
  };

  return (
    <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg max-w-md w-full border-l-4 border-red-500">
      <div className="flex items-start space-x-4">
        <div className="flex-shrink-0">
          <span
            className="text-3xl sm:text-4xl text-red-500"
            role="img"
            aria-label="Warning"
          >
            ⚠️
          </span>
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 mb-2">
            License Expired
          </h2>
          <p className="text-slate-600 text-sm sm:text-base mb-3">
            Your software license has unfortunately expired. To continue using
            our services and features, please renew your license.
          </p>
          <p className="text-slate-600 text-sm sm:text-base">
            Please contact{' '}
            {renderContactInfo()}
            {' '}for assistance with your license renewal.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LicenseExpiredMessage;