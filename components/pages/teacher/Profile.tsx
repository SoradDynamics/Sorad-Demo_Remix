// components/common/Profile.tsx
import React, { useEffect, useState } from "react";
// import { useStudentData } from "../StudentContext";
import { Button, Select, SelectItem } from "@heroui/react";
import { Avatar, AvatarIcon } from "@heroui/react";
import { account } from "~/utils/appwrite"; // Adjust path if needed
import { ArrowRightOnRectangleIcon } from "@heroicons/react/24/outline";
import toast from "react-hot-toast";
import ResetPasswordModal from "../common/ResetPassword/ResetPasswordModal";

const Profile: React.FC = () => {
//   const { studentOptions, selectedStudentId, handleStudentChange } =
//     useStudentData();
  const [email, setEmail] = useState<string | null>(null);

   // ***** NEW: Handlers for Reset Password Modal *****
   const openResetPasswordModal = () => setIsResetPasswordModalOpen(true);
   const closeResetPasswordModal = () => setIsResetPasswordModalOpen(false);
   const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
   


  // --- Fetch User Email ---
  useEffect(() => {
    let isMounted = true;
    account
      .get()
      .then((user) => {
        if (isMounted && user) {
          setEmail(user.email);
        } else if (isMounted) {
          setEmail(null);
        }
      })
      .catch((err) => {
        if (isMounted) {
          console.error("Navbar: Failed to get user email:", err);
          setEmail(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

//   const handleChange = (studentId: string) => {
//     handleStudentChange(studentId);
//   };


  const handleLogout = async () => {
    try {
        await account.deleteSession("current");
        toast.success("Logged out successfully!");
        window.location.reload();
    } catch (error: any) {
        console.error("Logout failed:", error);
        toast.error(error.message || "Logout failed!");
    }
};


  return (
    <div>

    <div className="p-4 bg-white rounded-md shadow-sm border mb-4">
      <div className="flex items-center mb-2 gap-1">
        <Avatar
          classNames={{
            base: "bg-gradient-to-br from-[#FFB457] to-[#FF705B]",
            icon: "text-black/80",
          }}
          className="cursor-pointer mr-2"
          icon={<AvatarIcon />}
        />
        <div>
          <p className="font-semibold">Admin User</p>
          <p className="text-sm text-gray-500">{email}</p>
        </div>
      </div>


    </div>

    

    <Button 
      className="w-full p-7 bg-white justify-start rounded-md shadow-sm border mb-4 
      transition-all duration-200 active:scale-[0.98] hover:bg-gray-50"
      onClick={openResetPasswordModal}
      variant="ghost"
    >
      <p className="font-normal text-base">Reset Password</p>
    </Button>


    <div className=" w-full flex justify-center pt-8 pb-5">
      <Button
          // className="ml-auto flex items-center justify-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-md shadow focus:outline-none focus:ring-2 focus:ring-indigo-500"
          variant="ghost"
          color="danger"
          onPress={handleLogout}
          >
          <ArrowRightOnRectangleIcon className="h-5 w-5" />
          Logout
        </Button>
      </div>

      <ResetPasswordModal
                isOpen={isResetPasswordModalOpen}
                onClose={closeResetPasswordModal}
            />

    </div>
  );
};

export default Profile;
