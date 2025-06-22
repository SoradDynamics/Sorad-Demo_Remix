// src/components/Login.tsx
import React, { useState, useMemo } from "react";
import axios from 'axios';
import { toast, Toaster } from "react-hot-toast";

// --- Appwrite ---
import { account } from "~/utils/appwrite"; // Adjusted path

// --- Zustand Store ---
import { useSchoolConfigStore } from '~/store/schoolConfigStore'; // Adjusted path

// --- Interfaces ---
interface BackendSchoolConfigResponse {
    name: string;
    domain: string;
    license_date: string;
    db_id: string;
    gallery_bucket_id: string;
    notes_bucket_id: string;
    assignment_bucket_id: string;
    isLicenseExpired: boolean;
    error?: string;
}

interface AppwriteUser {
  $id: string;
  name?: string;
  email?: string;
  // Add other Appwrite user fields you use
}

interface LoginProps {
  onLoginSuccess: (user: AppwriteUser) => void; // Callback for successful login
}

// --- Basic Styling (can be replaced with Tailwind/CSS Modules/Styled Components) ---
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as 'column', // Type assertion for CSSProperties
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: '#f0f2f5',
    fontFamily: 'Arial, sans-serif',
  },
  formWrapper: {
    background: 'white',
    padding: '40px',
    borderRadius: '8px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center' as 'center',
  },
  title: {
    marginBottom: '20px',
    color: '#333',
    fontSize: '24px',
  },
  inputGroup: {
    marginBottom: '20px',
    textAlign: 'left' as 'left',
  },
  label: {
    display: 'block',
    marginBottom: '5px',
    color: '#555',
    fontSize: '14px',
  },
  input: {
    width: '100%',
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    boxSizing: 'border-box' as 'border-box',
    fontSize: '16px',
  },
  inputError: {
    borderColor: 'red',
  },
  passwordToggle: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    position: 'absolute' as 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    padding: '5px',
  },
  inputPasswordWrapper: {
    position: 'relative' as 'relative',
  },
  button: {
    width: '100%',
    padding: '12px',
    background: '#007bff',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '16px',
    transition: 'background-color 0.2s',
  },
  buttonDisabled: {
    backgroundColor: '#aaa',
    cursor: 'not-allowed',
  },
  errorMessage: {
    color: 'red',
    fontSize: '12px',
    marginTop: '-15px',
    marginBottom: '10px',
  },
  footerText: {
    marginTop: '20px',
    fontSize: '14px',
    color: '#666',
  }
};

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const setSchoolConfiguration = useSchoolConfigStore((state) => state.setSchoolConfiguration);
  const clearSchoolConfiguration = useSchoolConfigStore((state) => state.clearSchoolConfiguration);

  const togglePasswordVisibility = () => setIsPasswordVisible(!isPasswordVisible);

  const validateEmail = (value: string) =>
    /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value);

  const isEmailInvalid = useMemo(() => {
    if (email === "") return false;
    return !validateEmail(email);
  }, [email]);

  const checkAndSetSchoolConfig = async (emailToCheck: string): Promise<boolean> => {
    if (!emailToCheck || !validateEmail(emailToCheck)) {
      toast.error("Please enter a valid email address.");
      return false;
    }
    setIsLoading(true);
    let configIsValid = false;
    try {
      const response = await axios.post<BackendSchoolConfigResponse>(
        'http://localhost:5001/api/get-school-config',
        { email: emailToCheck }
      );
      if (response.data && response.status === 200 && response.data.db_id) {
        setSchoolConfiguration({
          dbId: response.data.db_id,
          galleryBucketId: response.data.gallery_bucket_id,
          notesBucketId: response.data.notes_bucket_id,
          assignmentBucketId: response.data.assignment_bucket_id,
          isLicenseExpired: response.data.isLicenseExpired,
          schoolName: response.data.name,
          domain: response.data.domain,
        });
        if (response.data.isLicenseExpired) {
          toast.error(response.data.error || `License for ${response.data.name || 'this school'} has expired.`, { duration: 6000 });
        } else {
          toast.success(`Configuration for ${response.data.name || 'school'} loaded!`, { duration: 3000 });
          configIsValid = true;
        }
      } else {
        toast.error(response.data?.error || "School configuration not found or invalid.", { duration: 6000 });
        clearSchoolConfiguration();
      }
    } catch (err: any) {
      let message = 'Network error or server unavailable.';
      if (err.response?.data?.error) message = err.response.data.error;
      else if (err.message) message = err.message;
      toast.error(message, { duration: 6000 });
      clearSchoolConfiguration();
    } finally {
      setIsLoading(false);
    }
    return configIsValid;
  };

  const handleActualLogin = async (loginEmail: string, loginPassword: string) => {
    const { isLicenseExpired: licenseStatus, dbId: currentDbId } = useSchoolConfigStore.getState();
    if (licenseStatus) {
      toast.error("Login failed: School license is expired.", { duration: 5000 });
      return;
    }
    if (!currentDbId) {
      toast.error("Login failed: School configuration could not be loaded.", { duration: 5000 });
      return;
    }
    if (!loginPassword || loginPassword.length < 8) {
      toast.error("Password must be at least 8 characters long.", { duration: 4000});
      return;
    }
    setIsLoading(true);
    try {
      await account.createEmailPasswordSession(loginEmail, loginPassword);
      const user = await account.get();
      onLoginSuccess(user as AppwriteUser); // Call parent callback
      toast.success("Login successful! Welcome.");
    } catch (error: any) {
      toast.error(error.message || "Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isEmailInvalid) {
      toast.error("Please enter a valid email address.");
      return;
    }
    if (!password) {
      toast.error("Please enter your password.");
      return;
    }
    const configIsValid = await checkAndSetSchoolConfig(email);
    if (configIsValid) {
      await handleActualLogin(email, password);
    }
  };

  return (
    <div style={styles.container}>
      <Toaster position="top-center" toastOptions={{ duration: 4000 }} />
      <div style={styles.formWrapper}>
        <h2 style={styles.title}>School Portal Login</h2>
        <form onSubmit={handleSubmit}>
          <div style={styles.inputGroup}>
            <label htmlFor="email" style={styles.label}>Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@schooldomain.com"
              required
              style={{ ...styles.input, ...(isEmailInvalid && email !== "" ? styles.inputError : {}) }}
              disabled={isLoading}
            />
            {isEmailInvalid && email !== "" && (
              <p style={styles.errorMessage}>Invalid email format.</p>
            )}
          </div>

          <div style={styles.inputGroup}>
            <label htmlFor="password" style={styles.label}>Password</label>
            <div style={styles.inputPasswordWrapper}>
              <input
                id="password"
                type={isPasswordVisible ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                minLength={8}
                style={styles.input}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={togglePasswordVisibility}
                style={styles.passwordToggle}
                aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                disabled={isLoading}
              >
                {isPasswordVisible ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            style={{ ...styles.button, ...(isLoading ? styles.buttonDisabled : {}) }}
          >
            {isLoading ? 'Processing...' : 'Login'}
          </button>
        </form>
        <p style={styles.footerText}>
          Ensure your email domain matches your school's registered domain.
        </p>
      </div>
    </div>
  );
}