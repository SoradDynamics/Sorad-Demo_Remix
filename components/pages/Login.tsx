import React, { useState, useId } from "react";
import { Input } from "@heroui/input";
import { FaUser } from "react-icons/fa";
import { Button } from "@heroui/button";
import { EyeFilledIcon, EyeSlashFilledIcon } from "components/icons";
import { IoMdLogIn } from "react-icons/io";
import { Globe, Facebook, Linkedin } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { account } from "~/utils/appwrite";
import { Form } from "@remix-run/react";
import { AppwriteException } from "appwrite";

// --- Constants ---
const socialLinks = [
  {
    href: "https://soraddynamics.com/",
    icon: <Globe className="h-5 w-5" />,
    label: "Website",
  },
  {
    href: "https://www.facebook.com/profile.php?id=61569291325991",
    icon: <Facebook className="h-5 w-5" />,
    label: "Facebook",
  },
  {
    href: "https://www.linkedin.com/in/sorad-dynamics-a84087346/",
    icon: <Linkedin className="h-5 w-5" />,
    label: "LinkedIn",
  },
];

// --- Main Component ---
export default function Login({
  setUser,
}: {
  setUser: (user: object | null) => void;
}) {
  // --- State Management ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  
  // --- Hooks for unique IDs for accessibility ---
  const emailId = useId();
  const passwordId = useId();

  // --- Utility Functions ---
  const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);

  // --- Event Handlers ---
  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      await account.createEmailPasswordSession(email, password);
      const user = await account.get();
      const roles = {
        isParent: user.labels.includes("parent"),
        isStudent: user.labels.includes("student"),
        isAdmin: user.labels.includes("admin"),
        isTeacher: user.labels.includes("teacher"),
        isDriver: user.labels.includes("driver"),
        isCam: user.labels.includes("camera"),
        isLib: user.labels.includes("library"),
        isPro: user.labels.includes("pro"),
        isManage: user.labels.includes("manage"),
        isOne: user.labels.includes("one"),
      };
      setUser({ ...user, ...roles });
      toast.success("Login successful! Redirecting...");
    } catch (error) {
      if (error instanceof AppwriteException) {
        toast.error(error.message || "Login failed. Please check your credentials.");
      } else {
        toast.error("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // --- Common Input Styles ---
  const inputStyles = {
    inputWrapper: "h-12 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700 transition-colors hover:border-orange-500 dark:hover:border-orange-400 focus-within:border-orange-500 focus-within:ring-2 focus-within:ring-orange-500/20 dark:focus-within:ring-orange-500/40",
    input: "text-base placeholder:text-gray-500 dark:placeholder:text-gray-400",
  };

  return (
    <>
      <Toaster position="top-right" toastOptions={{
        className: 'dark:bg-gray-700 dark:text-white',
      }} />

      {/* 
        This is the main container.
        On mobile (default), it's a white screen with padding.
        On desktop (md:), it becomes a gray background to make the card stand out.
      */}
      <div className="flex min-h-screen w-full items-center justify-center bg-white p-6 dark:bg-gray-900 md:bg-gray-100 md:p-4 md:dark:bg-gray-950">
        
        {/*
          This is the content block.
          On mobile (default), it's transparent and has no special styling.
          On desktop (md:), it "becomes" a card with a background, shadow, and rounded corners.
        */}
        <div className="w-full max-w-md space-y-10 md:rounded-2xl md:bg-white md:p-8 md:shadow-xl md:dark:bg-gray-800">
          
          <header className="text-center">
            <div className="mb-4 inline-flex items-center">
              <img
                src="/ico.png"
                alt="Sorad Dynamics Logo"
                className="mr-3 h-10 w-10 object-contain"
              />
              <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
                Sorad<span className="text-orange-500">Dynamics</span>
              </h1>
            </div>
            <h2 className="text-xl text-gray-600 dark:text-gray-300">
              Welcome Back
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Please sign in to continue
            </p>
          </header>

          <main>
            <Form method="post" onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor={emailId} className="sr-only">
                  Email Address
                </label>
                <Input
                  id={emailId}
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  endContent={<FaUser className="pointer-events-none text-xl text-gray-400" />}
                  classNames={inputStyles}
                />
              </div>

              <div>
                <label htmlFor={passwordId} className="sr-only">
                  Password
                </label>
                <Input
                  id={passwordId}
                  name="password"
                  placeholder="Enter your password"
                  type={isPasswordVisible ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  endContent={
                    <button
                      aria-label="toggle password visibility"
                      onClick={togglePasswordVisibility}
                      className="focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 rounded-md"
                      type="button"
                    >
                      {isPasswordVisible ? (
                        <EyeSlashFilledIcon className="text-xl text-gray-400" />
                      ) : (
                        <EyeFilledIcon className="text-xl text-gray-400" />
                      )}
                    </button>
                  }
                  classNames={inputStyles}
                />
              </div>
              
              <Button
                type="submit"
                color="primary"
                variant="solid"
                disabled={isLoading}
                isLoading={isLoading}
                className="h-12 w-full bg-orange-500 text-base font-bold text-white shadow-md transition-all hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-70 dark:focus:ring-offset-gray-800"
                startContent={!isLoading && <IoMdLogIn className="text-xl" />}
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </Form>
          </main>

          <footer className="pt-6 border-t border-gray-200 dark:border-gray-600">
            <p className="mb-4 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
              Connect with us
            </p>
            <div className="flex justify-center space-x-4">
              {socialLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={link.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600 transition-colors hover:bg-gray-200 hover:text-gray-900 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  {link.icon}
                </a>
              ))}
            </div>
          </footer>
        </div>
      </div>
    </>
  );
}
