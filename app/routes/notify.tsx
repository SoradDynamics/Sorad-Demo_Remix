// src/components/NotificationButton.tsx
import React, { useState } from 'react';
import {
  isPermissionGranted,
  requestPermission,
  sendNotification,
} from '@tauri-apps/plugin-notification';
import { Bell } from 'lucide-react'; // Optional: install lucide-react for icons

const NotificationButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [granted, setGranted] = useState<boolean | null>(null);

  const handleNotification = async () => {
    setLoading(true);

    let permission = await isPermissionGranted();
    if (!permission) {
      const request = await requestPermission();
      permission = request === 'granted';
    }

    setGranted(permission);

    if (permission) {
      sendNotification({
        title: '🔔 Tauri Notification',
        body: 'This is a modern styled notification!',
      });
    }

    setLoading(false);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 p-6">
      <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm text-center transition-all">
        <Bell className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-pulse" />
        <h2 className="text-xl font-semibold text-gray-800 mb-2">Tauri Notification</h2>
        <p className="text-gray-600 mb-6">
          Click the button below to test sending a notification from your Tauri app.
        </p>
        <button
          onClick={handleNotification}
          disabled={loading}
          className={`w-full py-3 px-4 rounded-xl text-white font-semibold transition duration-300 ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700'
          }`}
        >
          {loading ? 'Sending...' : 'Show Notification'}
        </button>

        {granted === false && (
          <p className="mt-4 text-sm text-red-500">Notification permission denied.</p>
        )}
      </div>
    </div>
  );
};

export default NotificationButton;
