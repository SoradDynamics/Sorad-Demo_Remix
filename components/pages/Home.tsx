// app/routes/Home.tsx
import { useEffect, useState } from "react";
import { toast, Toaster } from "react-hot-toast";
import { account } from "~/utils/appwrite"; // Still needed for logout, current user info
import { useNavigate } from "@remix-run/react";
import { Button } from "@heroui/react";

import Admin from "./admin/Admin";
import Student from "./student/Student";
import Manage from "./Manage/Manage";
import { useSchoolStore, SchoolLicenseStatus } from "~/store/schoolStore";
import LicenseExpiredMessage from "./LicenseExpiredMessage";
import Parent from "./parent/Parent";
import Teacher from "./teacher/Teacher";
import DriverComponent from "./driver/DriverLocation";
import Camera from "./Camera";
import Libriary from "./libriary/Libriary";

export default function Home({
  user,
  setUser,
}: {
  setUser: (user: object | null) => void;
  user: any; // Appwrite Models.User<Models.Preferences> (though prefs no longer fetched client-side)
}) {
  const navigate = useNavigate();

  const {
    setSchoolInfo,
    clearSchoolInfo,
    setIsLoadingSchoolInfo,
    licenseStatus,
    isLoadingSchoolInfo,
    error: schoolStoreError,
  } = useSchoolStore();

  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
      setUser(null);
      clearSchoolInfo();
      toast.success("Logged out successfully!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Logout failed!");
    }
  };

  if (user && user.email === "manage1@sorad.tech") {
    return (
      <div className="min-h-screen">
        <Toaster position="top-right" />
        <Manage />
      </div>
    );
  }

  useEffect(() => {
    const performSchoolLookup = async () => {
      if (!user || !user.email) {
        console.warn("Home: User or user email not available for school lookup.");
        setIsLoadingSchoolInfo(false);
        clearSchoolInfo();
        return;
      }

      setIsLoadingSchoolInfo(true);
      const userEmail = user.email; // Send the full email
      let currentDomainForReporting: string | null = userEmail.split('@')[1] || null; // For store, if needed

      // console.log("Home: Attempting school lookup for email:", userEmail);

      try {
        const response = await fetch(`${import.meta.env.VITE_SERVER_URL}/api/schools/resolve-info`, { // Updated endpoint
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userEmail }), // Send userEmail
        });

        const backendData = await response.json();
        // console.log("Home: Data received from backend API:", JSON.stringify(backendData, null, 2));

        if (!response.ok) {
          toast.error(backendData.message || "Failed to get school details.", { id: 'home-api-error' });
          setSchoolInfo({
            licenseStatus: 'not_found',
            error: backendData.message || "School not found or API error.",
            dbId: null, schoolName: null, galleryBucketId: null, assignmentBucketId: null, notesBucketId: null, byContact: null,
            // The backend might return the domain it tried, or we can fallback to email domain
            domain: backendData.original_domain_attempted || currentDomainForReporting, 
          });
          setIsLoadingSchoolInfo(false);
          return;
        }

        // Backend now returns all necessary info, including resolved_by and original_domain_attempted if you need them
        setSchoolInfo({
          dbId: backendData.db_id,
          schoolName: backendData.school_name,
          licenseStatus: backendData.license_status as SchoolLicenseStatus,
          galleryBucketId: backendData.gallery_bucket_id,
          assignmentBucketId: backendData.assignment_bucket_id,
          notesBucketId: backendData.notes_bucket_id,
          byContact: backendData.by_contact,
          domain: backendData.original_domain_attempted || currentDomainForReporting, // The domain that led to success
          error: null,
        });
        
        if (backendData.license_status === 'valid') {
            toast.success(`Welcome to ${backendData.school_name || 'your school'}! (Resolved via ${backendData.resolved_by || 'backend'})`, { id: 'home-welcome' });
        }

      } catch (error: any) {
        toast.error(error.message || "Error during school lookup.", { id: 'home-lookup-exception' });
        console.error("Home: Exception during school lookup - ", error);
        setSchoolInfo({
          licenseStatus: 'not_found',
          error: "Network error or unexpected issue during school lookup.",
          dbId: null, schoolName: null, galleryBucketId: null, assignmentBucketId: null, notesBucketId: null, byContact: null,
          domain: currentDomainForReporting, 
        });
      } finally {
        setIsLoadingSchoolInfo(false); // Ensure this is always called
      }
    };

    if (user && (isLoadingSchoolInfo || licenseStatus === 'pending')) {
      performSchoolLookup();
    } else if (!user) {
      clearSchoolInfo();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoadingSchoolInfo, licenseStatus, /* Removed Appwrite specific setters no longer used here */ setSchoolInfo, clearSchoolInfo, setIsLoadingSchoolInfo]);

  // --- Conditional Rendering Logic (remains the same) ---

  if (isLoadingSchoolInfo && licenseStatus === 'pending') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Toaster position="top-right" />
        <p className="text-xl">Verifying your school information, please wait...</p>
      </div>
    );
  }

  if (schoolStoreError && licenseStatus === 'not_found') {
      return (
          <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
              <Toaster position="top-right" />
              <p className="text-red-500 text-xl mb-4">Error: {schoolStoreError}</p>
              <p className="mb-4">We couldn't retrieve your school's information. Please try logging out and in again, or contact support.</p>
              <Button
                  color="primary" // Or your Button's equivalent prop
                  onClick={handleLogout}
              >
                  Logout and Try Again
              </Button>
          </div>
      );
  }

  if (licenseStatus === 'expired') {
    return (
        <div className=" min-w-screen min-h-screen gap-6 flex flex-col justify-center items-center">
            <Toaster position="top-right" />
            <LicenseExpiredMessage />
            <div className="text-center">
              <Button
              variant="ghost"
              color="danger"
              onClick={handleLogout}
              >
                Logout
              </Button>
            </div>
        </div>
    );
  }

  if (licenseStatus === 'valid' && user && !schoolStoreError) {
    return (
      <div className="min-h-screen">
        <Toaster position="top-right" />
        {user.isStudent && <div><Student/></div>}
        {user.isAdmin && <div><Admin /></div>}
        {user.isParent && <div><Parent /></div>}
        {user.isTeacher && <div><Teacher /></div>}
        {user.isDriver && <div><DriverComponent /></div>}
        {user.isLib && <div><Libriary /></div>}
        {user.isCam && <div><Camera /></div>}
      </div>
    );
  }

  if (!user) {
    useEffect(() => {
        navigate("/");
    }, [navigate]); 

    return (
      <div className="min-h-screen flex items-center justify-center">
        <Toaster position="top-right" />
        <p>Session not found. Redirecting...</p>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <Toaster position="top-right" />
      <p className="text-lg">Verifying your access... (Current Status: {licenseStatus})</p>
      {schoolStoreError && <p className="text-red-500">Details: {schoolStoreError}</p>}
      <Button
          className="mt-4" // Or specific styling
          color="primary"
          onClick={handleLogout}
      >
          Logout
      </Button>
    </div>
  );
}
