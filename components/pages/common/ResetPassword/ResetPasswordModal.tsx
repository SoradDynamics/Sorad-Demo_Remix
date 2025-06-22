// src/components/ResetPasswordModal.tsx
import { Button, Input } from "@heroui/react";
import React, { useState, FormEvent } from "react";
import { account } from "~/utils/appwrite";

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ResetPasswordModal: React.FC<ResetPasswordModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (newPassword !== confirmPassword) {
      setError("New passwords don't match.");
      return;
    }
    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true);
    try {
      await account.updatePassword(newPassword, oldPassword);
      setSuccessMessage("Password updated successfully!");
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");
      // Optionally close modal after a delay or let user close it
      // setTimeout(onClose, 2000);
    } catch (err: any) {
      console.error("Password reset error:", err);
      setError(err.message || "Failed to update password. Check old password.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out"
      onClick={onClose} // Close if overlay is clicked
    >
      <div
        className="relative w-full max-w-md mx-2 transform rounded-lg bg-white p-3 shadow-xl transition-all duration-300 ease-in-out sm:p-8"
        onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside modal
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 focus:outline-none"
          aria-label="Close modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <h2 className="mb-4 text-center text-xl font-semibold text-gray-800">
          Reset Password
        </h2>

        {error && (
          <div className="mb-4 rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="mb-4 rounded-md border border-green-300 bg-green-50 p-3 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        {!successMessage && (
          <form onSubmit={handleSubmit} className="">
           <div className=" gap-4 flex flex-col">
           <div className=" gap-1 flex-col flex">
           <label htmlFor="oldPassword" className=" ml-2 text-sm">Old Password</label>              <Input
                size="md"
                placeholder="Enter your Old Password"
                type="password"
                id="oldPassword"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className=" gap-1 flex-col flex">
              <label htmlFor="newPassword" className=" ml-2 text-sm">New Password</label>
              <Input
                size="md"
                placeholder="New Password"
                type="password"
                id="newPassword"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>

            <div className=" gap-1 flex-col flex">
            <label htmlFor="confirmPassword" className=" ml-2 text-sm">Confirm Password</label>              {/* <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Confirm New Password
              </label> */}

              <Input
                size="md"
                placeholder="Confirm Password"
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </div>
           </div>

           <div className=" flex justify-center">
           <Button
              type="submit"
              disabled={isLoading}
              color="danger"
              className="px-5 mt-6"
            //   className="w-full rounded-md bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-indigo-300"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg
                    className="mr-2 h-4 w-4 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Updating...
                </div>
              ) : (
                "Update Password"
              )}
            </Button>
           </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordModal;
