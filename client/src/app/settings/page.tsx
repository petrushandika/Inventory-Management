"use client";

import React, { useEffect, useState } from "react";
import Header from "@/app/(components)/Header";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsDarkMode } from "@/state";
import { useGetUsersQuery, useUpdateUserMutation } from "@/state/api";

const Settings = () => {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  const { data: users, isLoading } = useGetUsersQuery();
  const [updateUser] = useUpdateUserMutation();

  const currentUser = users?.[0];

  const [localSettings, setLocalSettings] = useState({
    name: "",
    email: "",
    notification: true,
    language: "English",
    twoFactor: false,
    emailDigest: true,
  });

  const [saved, setSaved] = useState(false);

  // Sync with real user data once loaded
  useEffect(() => {
    if (currentUser) {
      setLocalSettings((p) => ({
        ...p,
        name: currentUser.name,
        email: currentUser.email,
      }));
    }
  }, [currentUser]);

  const handleToggle = (label: string) => {
    if (label === "Dark Mode") {
      dispatch(setIsDarkMode(!isDarkMode));
    } else if (label === "Push Notifications") {
      setLocalSettings((p) => ({ ...p, notification: !p.notification }));
    } else if (label === "Email Digest") {
      setLocalSettings((p) => ({ ...p, emailDigest: !p.emailDigest }));
    } else if (label === "Two-Factor Auth") {
      setLocalSettings((p) => ({ ...p, twoFactor: !p.twoFactor }));
    }
  };

  const handleTextChange = (label: string, value: string) => {
    if (label === "Name") setLocalSettings((p) => ({ ...p, name: value }));
    if (label === "Email") setLocalSettings((p) => ({ ...p, email: value }));
    if (label === "Language") setLocalSettings((p) => ({ ...p, language: value }));
  };

  const handleSave = async () => {
    if (currentUser) {
      await updateUser({
        userId: currentUser.userId,
        name: localSettings.name,
        email: localSettings.email,
      }).unwrap().catch(console.error);
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  type Section = {
    title: string;
    settings: { label: string; description: string; value: string | boolean; type: "text" | "toggle" }[];
  };

  const sections: Section[] = [
    {
      title: "Account",
      settings: [
        {
          label: "Name",
          description: "Your display name shown across the app.",
          value: localSettings.name,
          type: "text",
        },
        {
          label: "Email",
          description: "Email address associated with your account.",
          value: localSettings.email,
          type: "text",
        },
        {
          label: "Language",
          description: "Preferred display language.",
          value: localSettings.language,
          type: "text",
        },
      ],
    },
    {
      title: "Appearance",
      settings: [
        {
          label: "Dark Mode",
          description: "Switch between light and dark interface theme.",
          value: isDarkMode,
          type: "toggle",
        },
      ],
    },
    {
      title: "Notifications",
      settings: [
        {
          label: "Push Notifications",
          description: "Receive alerts for important inventory updates.",
          value: localSettings.notification,
          type: "toggle",
        },
        {
          label: "Email Digest",
          description: "Receive a weekly summary email of activity.",
          value: localSettings.emailDigest,
          type: "toggle",
        },
      ],
    },
    {
      title: "Security",
      settings: [
        {
          label: "Two-Factor Auth",
          description: "Require a second verification step on login.",
          value: localSettings.twoFactor,
          type: "toggle",
        },
      ],
    },
  ];

  return (
    <div className="pb-8">
      <div className="mb-6">
        <Header name="Settings" />
        <p className="text-sm text-gray-400 mt-1">
          Manage your account preferences and application settings.
        </p>
      </div>

      {isLoading ? (
        <div className="text-sm text-gray-400 animate-pulse py-10 text-center">
          Loading settings...
        </div>
      ) : (
        <div className="space-y-6">
          {/* Current User Card */}
          {currentUser && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl px-6 py-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center shrink-0">
                <span className="text-white font-bold text-lg">
                  {currentUser.name[0].toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{currentUser.name}</p>
                <p className="text-xs text-gray-500">{currentUser.email}</p>
                <span className="inline-flex mt-1 items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                  {currentUser.role}
                </span>
              </div>
            </div>
          )}

          {sections.map((section) => (
            <div
              key={section.title}
              className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden"
            >
              <div className="px-6 py-3.5 bg-gray-50 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700">{section.title}</h3>
              </div>
              <div>
                {section.settings.map((setting, i) => (
                  <div
                    key={setting.label}
                    className={`flex items-center justify-between gap-6 px-6 py-4 ${
                      i < section.settings.length - 1 ? "border-b border-gray-50" : ""
                    } hover:bg-gray-50 transition-colors`}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800">{setting.label}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{setting.description}</p>
                    </div>
                    <div className="shrink-0">
                      {setting.type === "toggle" ? (
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={setting.value as boolean}
                            onChange={() => handleToggle(setting.label)}
                          />
                          <div
                            className="w-10 h-6 bg-gray-200 rounded-full peer transition-all
                              peer-focus:ring-2 peer-focus:ring-blue-300
                              peer-checked:bg-blue-600
                              after:content-[''] after:absolute after:top-[2px] after:left-[2px]
                              after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all
                              peer-checked:after:translate-x-4"
                          />
                        </label>
                      ) : (
                        <input
                          type="text"
                          className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all w-64"
                          value={setting.value as string}
                          onChange={(e) => handleTextChange(setting.label, e.target.value)}
                        />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className="flex items-center justify-end gap-4">
            {saved && (
              <span className="text-sm text-green-600 font-medium">
                ✓ Changes saved
              </span>
            )}
            <button
              onClick={handleSave}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Settings;
