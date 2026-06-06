"use client";

import React, { useState } from "react";
import Header from "@/app/(components)/Header";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsDarkMode } from "@/state";

type UserSetting = {
  label: string;
  value: string | boolean;
  type: "text" | "toggle";
};

const Settings = () => {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  const [localSettings, setLocalSettings] = useState({
    username: "john_doe",
    email: "john.doe@example.com",
    notification: true,
    language: "English",
  });

  const userSettings: UserSetting[] = [
    { label: "Username", value: localSettings.username, type: "text" },
    { label: "Email", value: localSettings.email, type: "text" },
    { label: "Notification", value: localSettings.notification, type: "toggle" },
    { label: "Dark Mode", value: isDarkMode, type: "toggle" },
    { label: "Language", value: localSettings.language, type: "text" },
  ];

  const handleToggleChange = (index: number) => {
    const setting = userSettings[index];
    if (setting.label === "Dark Mode") {
      dispatch(setIsDarkMode(!isDarkMode));
    } else if (setting.label === "Notification") {
      setLocalSettings((prev) => ({ ...prev, notification: !prev.notification }));
    }
  };

  const handleTextChange = (index: number, newValue: string) => {
    const setting = userSettings[index];
    if (setting.label === "Username") {
      setLocalSettings((prev) => ({ ...prev, username: newValue }));
    } else if (setting.label === "Email") {
      setLocalSettings((prev) => ({ ...prev, email: newValue }));
    } else if (setting.label === "Language") {
      setLocalSettings((prev) => ({ ...prev, language: newValue }));
    }
  };

  return (
    <div className="pb-8">
      <div className="mb-6">
        <Header name="Settings" />
        <p className="text-sm text-gray-400 mt-1">
          Manage your account preferences.
        </p>
      </div>

      <div className="bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden max-w-2xl">
        <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
          <div className="grid grid-cols-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Setting
            </span>
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
              Value
            </span>
          </div>
        </div>
        <div>
          {userSettings.map((setting, index) => (
            <div
              key={setting.label}
              className={`grid grid-cols-2 items-center px-5 py-3.5 ${
                index < userSettings.length - 1 ? "border-b border-gray-50" : ""
              } hover:bg-gray-50 transition-colors`}
            >
              <span className="text-sm font-medium text-gray-700">
                {setting.label}
              </span>
              <div>
                {setting.type === "toggle" ? (
                  <label className="inline-flex relative items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={setting.value as boolean}
                      onChange={() => handleToggleChange(index)}
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
                    className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all w-full max-w-xs"
                    value={setting.value as string}
                    onChange={(e) => handleTextChange(index, e.target.value)}
                  />
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Settings;
