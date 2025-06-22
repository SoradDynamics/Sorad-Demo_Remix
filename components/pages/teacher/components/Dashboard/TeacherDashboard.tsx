import React, { useEffect } from 'react';
// Removed: import { useNavigate } from 'react-router-dom';
import { useTeacherStore } from './teacherStore';

const TeacherDashboard: React.FC = () => {
  const {
    appwriteUser,
    teacherProfile,
    isLoading,
    isInitialized,
    error,
    initializeAuthAndProfile,
    logout,
  } = useTeacherStore();

  // Removed: const navigate = useNavigate();

  useEffect(() => {
    if (!isInitialized || (isInitialized && !appwriteUser && !isLoading)) {
        initializeAuthAndProfile();
    }
  }, [initializeAuthAndProfile, isInitialized, appwriteUser, isLoading]);

  const handleLogout = async () => {
    await logout();
    // After logout, the store state will be cleared.
    // The component will re-render, and the UI should reflect the logged-out state.
    // The user will need to click a link or manually navigate to login.
  };

  const handleRetry = () => {
    useTeacherStore.setState({ isInitialized: false, error: null });
    initializeAuthAndProfile();
  }

  // Initial loading state before first attempt
  if (!isInitialized && isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-lg">Initializing Dashboard...</p>
      </div>
    );
  }

  // After initialization attempt:
  if (isLoading) {
     return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
        <p className="ml-4 text-lg">Loading Data...</p>
      </div>
    );
  }

  // If initialization is done, and there's an error AND no appwriteUser (authentication failed or no session)
  if (isInitialized && error && !appwriteUser) {
    return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Access Denied</h1>
        <p className="text-xl text-gray-700">{error}</p>
        <div className="mt-6 space-x-4">
            
            <button
                onClick={handleRetry}
                className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
            >
                Retry
            </button>
        </div>
      </div>
    );
  }

  // If initialization is done, appwriteUser exists, but no teacherProfile (or an error related to profile)
  if (isInitialized && appwriteUser && !teacherProfile) {
     return (
      <div className="container mx-auto p-6 text-center">
        <h1 className="text-3xl font-bold text-orange-500 mb-4">Profile Issue</h1>
        <p className="text-xl text-gray-700">
          {error || `Teacher profile not found for ${appwriteUser.email}. Please ensure your teacher profile is set up.`}
        </p>
        <p className="mt-2 text-gray-500">Contact administration if this issue persists.</p>
        <div className="mt-6 space-x-4">
            <button
                onClick={handleLogout} // Logout clears state, user sees login prompt next
                className="px-6 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
                Logout
            </button>
            <button
                onClick={handleRetry}
                className="px-6 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                Retry Fetching Profile
            </button>
        </div>
      </div>
    );
  }

  // If all data is loaded successfully
  if (isInitialized && appwriteUser && teacherProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-100 to-sky-100 p-4 sm:p-6 lg:p-8">
        <div className="container mx-auto">
          <header className="mb-8 p-6 bg-white shadow-lg rounded-xl flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-semibold text-slate-800">Teacher Dashboard</h1>
              <p className="text-xl text-sky-600 mt-1">
                Welcome back, <span className="font-semibold">{teacherProfile.name}!</span>
              </p>
            </div>
            {/* <button
              onClick={handleLogout} // This will clear the session and store state
              className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Logout
            </button> */}
          </header>

          {/* ... (Rest of the dashboard content: General Info, Quick Stats, Upcoming Features) ... */}
          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-slate-700 mb-4 ml-1">General Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-xl font-semibold text-sky-700 mb-3">My Profile</h3>
                <div className="space-y-2 text-slate-600">
                  {/* <p><strong>Auth User ID:</strong> {appwriteUser.$id}</p> */}
                  {/* <p><strong>Teacher Record ID:</strong> {teacherProfile.$id}</p> */}
                  <p><strong>Name:</strong> {teacherProfile.name}</p>
                  <p><strong>Email:</strong> {teacherProfile.email}</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-xl font-semibold text-sky-700 mb-3">Quick Stats</h3>
                <div className="space-y-2 text-slate-600">
                  <p><strong>Classes Assigned:</strong> <span className="font-bold text-sky-600">0</span> (Upcoming)</p>
                  <p><strong>Total Students:</strong> <span className="font-bold text-sky-600">0</span> (Upcoming)</p>
                </div>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                <h3 className="text-xl font-semibold text-sky-700 mb-3">School Announcements</h3>
                <div className="space-y-2 text-slate-600"><p className="italic">No new announcements. (Upcoming)</p></div>
              </div>
            </div>
          </section>

          <section className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-semibold text-slate-700 mb-4">Upcoming Dashboard Features</h2>
            <ul className="list-disc list-inside space-y-3 text-slate-600 pl-2">
                <li><strong>Class Management:</strong> View assigned classes, student rosters.</li>
                <li><strong>Student Information:</strong> Access student profiles and progress.</li>
                {/* ... other features ... */}
            </ul>
          </section>
        </div>
      </div>
    );
  }

  // Fallback if none of the above specific conditions met after initialization
  // This state implies isInitialized is true, but something is off (e.g. no user, no profile, no error)
  // which should ideally be caught by previous conditions.
  // We'll show a generic message with a login link.
  return (
    <div className="container mx-auto p-6 text-center">
      <p className="text-xl text-gray-700">
        Unable to display dashboard. You might need to log in or there was an issue fetching your data.
      </p>
      <div className="mt-6 space-x-4">
    
        <button
            onClick={handleRetry}
            className="px-6 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400"
        >
            Retry
        </button>
      </div>
    </div>
  );
};

export default TeacherDashboard;