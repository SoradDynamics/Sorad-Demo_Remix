// app/components/Navbar.tsx
import { Bars3Icon } from "@heroicons/react/24/outline";
import SearchBar from "./SearchBar";
import { useState } from "react";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
  Avatar,
  AvatarIcon,
} from "@heroui/react";
import { IoMdLogOut } from "react-icons/io";
import { useNavigate } from "@remix-run/react";
import { toast, Toaster } from "react-hot-toast";
import { account } from "~/utils/appwrite";
import ResetPasswordModal from "../common/ResetPassword/ResetPasswordModal";

interface NavbarProps {
  toggleSidebar: () => void;
  setActiveItem: (item: string) => void; // Add setActiveItem prop
}

const Navbar: React.FC<NavbarProps> = ({ toggleSidebar, setActiveItem }) => {
  const navigate = useNavigate();

      // ***** NEW: Handlers for Reset Password Modal *****
      const openResetPasswordModal = () => setIsResetPasswordModalOpen(true);
      const closeResetPasswordModal = () => setIsResetPasswordModalOpen(false);
      const [isResetPasswordModalOpen, setIsResetPasswordModalOpen] = useState(false);
      

  const handleLogout = async () => {
    try {
      await account.deleteSession("current");
      // setUser(null);
      toast.success("Logged out successfully!");
      window.location.reload();
    } catch (error: any) {
      toast.error(error.message || "Logout failed!");
    }
  };

  return (
    <>
    {/* // <nav className=" pr-4 m-2 mt-3 justify-between  items-center"> */}
    <nav className="flex flex-row m-3 gap-6 items-center justify-between pr-2 rounded">
      <button
        onClick={toggleSidebar}
        className="p-2 text-gray-800 font-semibold bg-[rgb(235,235,235)]/80 rounded-md hover:bg-gray-300/60 active:scale-95 transition-colors duration-200 ease-in-out"
      >
        <Bars3Icon className="w-6 h-6" />
      </button>
      {/* Search Bar */}
      <SearchBar setActiveItem={setActiveItem} />
      {/* Pass setActiveItem to SearchBar */}

      {/* Profile Dropdown */}
      <div className="flex items-center">
        <Dropdown placement="bottom-start" backdrop="opaque">
          <DropdownTrigger>
            <Avatar
              classNames={{
                base: "bg-gradient-to-br from-[#FFB457] to-[#FF705B]",
                icon: "text-black/80",
              }}
              className="cursor-pointer"
              icon={<AvatarIcon />}
            />
          </DropdownTrigger>
          <DropdownMenu
            aria-label="Dropdown menu with description"
            variant="faded"
          >
            <DropdownSection showDivider>
              <DropdownItem key="profile" className="h-14 gap-2">
                <p className="font-medium">User name</p>
                <p className="font-semibold text-gray-400">Admin</p>
              </DropdownItem>
            </DropdownSection>

            <DropdownSection title="Settings">
              <DropdownItem
                key="reset-password" // Changed key for clarity
                className="cursor-pointer"
                onPress={openResetPasswordModal} // ***** MODIFIED: Open modal onPress *****
              >
                Reset Password
              </DropdownItem>
            </DropdownSection>


            <DropdownSection title={"Actions"}>
              <DropdownItem
                key="logout"
                className="text-danger text-xl"
                color="danger"
                startContent={<IoMdLogOut />}
                onPress={handleLogout}
              >
                Logout
              </DropdownItem>
            </DropdownSection>
          </DropdownMenu>
        </Dropdown>
      </div>
    </nav>


            <ResetPasswordModal
                isOpen={isResetPasswordModalOpen}
                onClose={closeResetPasswordModal}
            />
</>
  );
};

export default Navbar;
