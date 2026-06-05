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
      setLocalSettings((prev) => ({
        ...prev,
        notification: !prev.notification,
      }));
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
    <div className="w-full">
      <Header name="User Settings" />
      <div className="overflow-x-auto mt-5 shadow-md">
        <table className="min-w-full bg-white rounded-lg">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">
                Setting
              </th>
              <th className="text-left py-3 px-4 uppercase font-semibold text-sm">
                Value
              </th>
            </tr>
          </thead>
          <tbody>
            {userSettings.map((setting, index) => (
              <tr className="hover:bg-blue-50" key={setting.label}>
                <td className="py-2 px-4">{setting.label}</td>
                <td className="py-2 px-4">
                  {setting.type === "toggle" ? (
                    <label className="inline-flex relative items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={setting.value as boolean}
                        onChange={() => handleToggleChange(index)}
                      />
                      <div
                        className="w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-blue-400 peer-focus:ring-4 
                        transition peer-checked:after:translate-x-full peer-checked:after:border-white 
                        after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white 
                        after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all
                        peer-checked:bg-blue-600"
                      ></div>
                    </label>
                  ) : (
                    <input
                      type="text"
                      className="px-4 py-2 border rounded-lg text-gray-500 focus:outline-none focus:border-blue-500"
                      value={setting.value as string}
                      onChange={(e) => handleTextChange(index, e.target.value)}
                    />
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Settings;
