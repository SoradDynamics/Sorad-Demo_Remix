import React, { useState } from "react";
import { Input } from "@heroui/input";
import { FaUser } from "react-icons/fa";
import { Button, ButtonGroup } from "@heroui/button";
import { EyeFilledIcon, EyeSlashFilledIcon } from "components/icons";
import { IoMdLogIn } from "react-icons/io";
import { Globe, Facebook, Linkedin } from "lucide-react";
import { toast, Toaster } from "react-hot-toast";
import { account } from "~/utils/appwrite";
import { Form } from "@remix-run/react";
export default function Login({
  setUser,
}: {
  setUser: (user: object | null) => void;
}) {
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [isVisible, setIsVisible] = useState(false);
  const toggleVisibility = () => setIsVisible(!isVisible);

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false); // Add isLoading state

  //validate email
  const validateEmail = (username: string) =>
    username.match(/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i);

  const isInvalid = React.useMemo(() => {
    if (username === "") return false;

    return validateEmail(username) ? false : true;
  }, [username]);

  const handleLogin = async (username: string, password: string) => {
    // e.preventDefault();
    setIsLoggingIn(true);

    setIsLoading(true); // Set loading to true before the request

    try {
      await account.createEmailPasswordSession(username, password);
      const user = await account.get();

      const isManage = user.labels?.includes("manage");
      const isPro = user.labels?.includes("pro");
      const isOne = user.labels?.includes("one");

      const isParent = user.labels?.includes("parent");
      const isStudent = user.labels?.includes("student");
      const isAdmin = user.labels?.includes("admin");
      const isTeacher = user.labels?.includes("teacher");
      const isDriver = user.labels?.includes("driver");
      const isCam = user.labels?.includes("camera");
      const isLib = user.labels?.includes("library");

      setUser({
        ...user,
        isParent,
        isStudent,
        isAdmin,
        isTeacher,
        isDriver,
        isCam,
        isLib,
        isPro,
        isManage,
        isOne,
      }); // Store role in state

      toast.success("Login successful!"); // ✅ Now it only shows when logging in
    } catch (error: any) {
      toast.error(error.message || "Login failed!");
    } finally {
      setIsLoggingIn(false);
      setIsLoading(false); // Set loading to false after the request
    }
  };
  return (
    <div>
      <Toaster position="top-right" />

      <div className="h-screen overflow-auto sm:bg-gradient-to-br sm:from-slate-50 sm:via-blue-50 sm:to-indigo-100 flex items-center justify-center sm:px-4 sm:py-8 p-0">
        <div className="sm:w-full sm:h-auto h-screen w-screen max-w-sm sm:bg-white/95 sm:backdrop-blur-xl sm:rounded-3xl sm:shadow-2xl sm:border sm:border-white/30 overflow-hidden sm:transition-all sm:duration-300 hover:shadow-3xl sm:transform scale-100 sm:scale-80 mt-40 sm:m-0">
          {/* Login Section */}
          <div className="px-6 py-8 sm:px-8 sm:py-10">
            {/* Brand Header */}
            <div className="flex items-center justify-center mb-10">
              <img
                src="/ico.png"
                alt="Sorad Dynamics"
                className="w-12 h-12 mr-3 object-contain"
              />
              <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 tracking-tight">
                Sorad<span className="text-orange-500">Dynamics</span>
              </h1>
            </div>

            {/* Welcome Message */}
            <div className="mb-10 grid-1">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 leading-tight">
                Welcome Back
              </h2>
              <p className="text-base text-gray-600 ml-2 font-small">
                Please sign in to continue
              </p>
            </div>

            {/* Login Form */}
            <Form
              method="post"
              onSubmit={(e) => {
                e.preventDefault();
                const form = e.currentTarget;
                const username = (
                  form.elements.namedItem("username") as HTMLInputElement
                ).value;
                const password = (
                  form.elements.namedItem("password") as HTMLInputElement
                ).value;
                handleLogin(username, password);
              }}
              className="space-y-8"
            >
              <div className="space-y-6">
                <div className="group">
                  <Input
                    className="w-full"
                    name="username"
                    size="lg"
                    variant="bordered"
                    type="email"
                    isInvalid={isInvalid}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your email address"
                    endContent={
                      <FaUser className="text-gray-500 text-base transition-colors group-focus-within:text-primary-500" />
                    }
                    color="primary"
                    radius="lg"
                    classNames={{
                      input: "text-base font-medium placeholder:text-gray-500",
                      inputWrapper:
                        "border-2 border-gray-200 hover:border-gray-300 focus-within:!border-primary-500 h-14 bg-gray-50/50 transition-all duration-200",
                    }}
                    required
                  />
                </div>

                <div className="group">
                  <Input
                    className="w-full"
                    name="password"
                    size="lg"
                    variant="bordered"
                    placeholder="Enter your password"
                    type={isVisible ? "text" : "password"}
                    minLength={8}
                    endContent={
                      <button
                        aria-label="toggle password visibility"
                        onClick={toggleVisibility}
                        className="focus:outline-none text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1"
                        type="button"
                      >
                        {isVisible ? (
                          <EyeSlashFilledIcon className="text-xl" />
                        ) : (
                          <EyeFilledIcon className="text-xl" />
                        )}
                      </button>
                    }
                    color="primary"
                    radius="lg"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    classNames={{
                      input: "text-base font-medium placeholder:text-gray-500",
                      inputWrapper:
                        "border-2 border-gray-200 hover:border-gray-300 focus-within:!border-primary-500 h-14 bg-gray-50/50 transition-all duration-200",
                    }}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full h-14 text-base font-bold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:transform-none bg-orange-500 hover:bg-orange-600"
                  color="primary"
                  variant="solid"
                  disabled={isLoggingIn}
                  isLoading={isLoading}
                  radius="lg"
                  startContent={!isLoading && <IoMdLogIn className="text-xl" />}
                >
                  {isLoading ? "Signing in..." : "Sign In"}
                </Button>
              </div>
            </Form>

            {/* Social Connect Section */}
            <div className="mt-10 pt-8 border-t border-gray-200">
              <div className="">
                <h3 className="ml-4 text-gray-700 font-bold text-lg mb-6 tracking-wide">
                  Connect with us
                </h3>
                <div className="flex justify-center space-x-4">
                  {[
                    {
                      href: "https://soraddynamics.com/",
                      icon: <Globe size={18} />,
                      label: "Website",
                      text: "Website",
                    },
                    {
                      href: "https://www.facebook.com/profile.php?id=61569291325991",
                      icon: <Facebook size={18} />,
                      label: "Facebook",
                      text: "Facebook",
                    },
                    {
                      href: "https://www.linkedin.com/in/sorad-dynamics-a84087346/",
                      icon: <Linkedin size={18} />,
                      label: "LinkedIn",
                      text: "LinkedIn",
                    },
                  ].map((link, idx) => (
                    <a
                      key={idx}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center w-30 h-10 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg transition-all duration-300 hover:scale-105 text-gray-700 hover:text-gray-900 shadow-sm hover:shadow-md font-medium text-sm"
                      aria-label={link.label}
                    >
                      <span className="mr-2">{link.icon}</span>
                      {link.text}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
