"use client";

import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import Header from "@/app/(components)/Header";
import { useAppDispatch, useAppSelector } from "@/app/redux";
import { setIsDarkMode } from "@/state";
import { useGetUsersQuery, useUpdateUserMutation } from "@/state/api";
import { Camera, CheckCircle, AlertCircle } from "lucide-react";
import Image from "next/image";

const Settings = () => {
  const dispatch = useAppDispatch();
  const isDarkMode = useAppSelector((state) => state.global.isDarkMode);

  const { data: users, isLoading } = useGetUsersQuery();
  const [updateUser, { isLoading: isSaving }] = useUpdateUserMutation();

  const currentUser = users?.[0];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [notification, setNotification] = useState(true);
  const [emailDigest, setEmailDigest] = useState(true);
  const [twoFactor, setTwoFactor] = useState(false);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarBase64, setAvatarBase64] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (currentUser) {
      setName(currentUser.name);
      setEmail(currentUser.email);
      setAvatarPreview(currentUser.image ?? null);
    }
  }, [currentUser]);

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setStatus("error");
      setErrorMsg("Image must be smaller than 5MB.");
      return;
    }
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      setAvatarPreview(result);
      setAvatarBase64(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setStatus("idle");
    setErrorMsg("");

    if (!name.trim()) {
      setStatus("error");
      setErrorMsg("Name cannot be empty.");
      return;
    }
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus("error");
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (!currentUser) return;

    try {
      await updateUser({
        userId: currentUser.userId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        ...(avatarBase64 ? { image: avatarBase64 } : {}),
      }).unwrap();
      setAvatarBase64(null);
      setStatus("success");
      setTimeout(() => setStatus("idle"), 3000);
    } catch {
      setStatus("error");
      setErrorMsg("Failed to save changes. Please try again.");
    }
  };

  const Toggle = ({ value, onChange }: { value: boolean; onChange: () => void }) => (
    <label className="relative inline-flex items-center cursor-pointer">
      <input type="checkbox" className="sr-only peer" checked={value} onChange={onChange} />
      <div className="w-10 h-6 bg-gray-200 rounded-full peer transition-all peer-focus:ring-2 peer-focus:ring-blue-300 peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-4" />
    </label>
  );

  return (
    <div className="pb-8 w-full">
      <div className="mb-6">
        <Header name="Settings" />
        <p className="text-sm text-gray-400 mt-1">Manage your account preferences and application settings.</p>
      </div>

      {isLoading ? (
        <div className="text-sm text-gray-400 animate-pulse py-10 text-center">Loading settings...</div>
      ) : (
        <div className="space-y-5">

          {/* Profile Picture */}
          <div className="bg-white shadow-sm rounded-xl border border-gray-100 p-6">
            <h3 className="text-sm font-semibold text-gray-700 mb-4">Profile Picture</h3>
            <div className="flex items-center gap-5">
              <div className="relative group">
                <div className="w-20 h-20 rounded-full overflow-hidden bg-blue-100 flex items-center justify-center shrink-0 border-2 border-gray-100">
                  {avatarPreview ? (
                    <Image src={avatarPreview} alt="Avatar" width={80} height={80} className="object-cover w-full h-full" />
                  ) : (
                    <span className="text-2xl font-bold text-blue-600">{currentUser?.name?.[0]?.toUpperCase() ?? "?"}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <Camera className="w-5 h-5 text-white" />
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">{currentUser?.name}</p>
                <p className="text-xs text-gray-500 mb-2">{currentUser?.email}</p>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 hover:border-blue-300 transition-all"
                >
                  Change Photo
                </button>
                {avatarBase64 && (
                  <button
                    type="button"
                    onClick={() => { setAvatarPreview(currentUser?.image ?? null); setAvatarBase64(null); }}
                    className="ml-2 text-xs px-3 py-1.5 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    Remove
                  </button>
                )}
                <p className="text-xs text-gray-400 mt-1.5">JPG, PNG or GIF · Max 5MB</p>
              </div>
            </div>
          </div>

          {/* Account */}
          <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-3.5 bg-gray-50 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">Account</h3>
            </div>
            <div>
              {[
                { label: "Name", value: name, onChange: setName, placeholder: "Your full name" },
                { label: "Email", value: email, onChange: setEmail, placeholder: "you@company.com" },
              ].map((field, i) => (
                <div
                  key={field.label}
                  className={`flex items-center justify-between gap-4 px-6 py-4 hover:bg-gray-50 transition-colors ${i === 0 ? "border-b border-gray-50" : ""}`}
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">{field.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {field.label === "Name" ? "Your display name shown across the app." : "Email address associated with your account."}
                    </p>
                  </div>
                  <input
                    type={field.label === "Email" ? "email" : "text"}
                    value={field.value}
                    onChange={(e) => field.onChange(e.target.value)}
                    placeholder={field.placeholder}
                    className="text-sm px-3 py-1.5 border border-gray-200 rounded-lg text-gray-700 focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all w-52 sm:w-64 shrink-0"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Appearance */}
          <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-3.5 bg-gray-50 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">Appearance</h3>
            </div>
            <div className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
              <div>
                <p className="text-sm font-medium text-gray-800">Dark Mode</p>
                <p className="text-xs text-gray-400 mt-0.5">Switch between light and dark interface theme.</p>
              </div>
              <Toggle value={isDarkMode} onChange={() => dispatch(setIsDarkMode(!isDarkMode))} />
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-3.5 bg-gray-50 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">Notifications</h3>
            </div>
            <div>
              <div className="flex items-center justify-between gap-4 px-6 py-4 border-b border-gray-50 hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-800">Push Notifications</p>
                  <p className="text-xs text-gray-400 mt-0.5">Receive alerts for important inventory updates.</p>
                </div>
                <Toggle value={notification} onChange={() => setNotification((v) => !v)} />
              </div>
              <div className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
                <div>
                  <p className="text-sm font-medium text-gray-800">Email Digest</p>
                  <p className="text-xs text-gray-400 mt-0.5">Receive a weekly summary email of activity.</p>
                </div>
                <Toggle value={emailDigest} onChange={() => setEmailDigest((v) => !v)} />
              </div>
            </div>
          </div>

          {/* Security */}
          <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
            <div className="px-6 py-3.5 bg-gray-50 border-b border-gray-100">
              <h3 className="text-sm font-semibold text-gray-700">Security</h3>
            </div>
            <div className="flex items-center justify-between gap-4 px-6 py-4 hover:bg-gray-50 transition-colors">
              <div>
                <p className="text-sm font-medium text-gray-800">Two-Factor Auth</p>
                <p className="text-xs text-gray-400 mt-0.5">Require a second verification step on login.</p>
              </div>
              <Toggle value={twoFactor} onChange={() => setTwoFactor((v) => !v)} />
            </div>
          </div>

          {/* Save row */}
          <div className="flex items-center justify-end gap-4">
            {status === "success" && (
              <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
                <CheckCircle className="w-4 h-4" /> Changes saved successfully
              </span>
            )}
            {status === "error" && (
              <span className="flex items-center gap-1.5 text-sm text-red-600 font-medium">
                <AlertCircle className="w-4 h-4" /> {errorMsg}
              </span>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
            >
              {isSaving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
              {isSaving ? "Saving…" : "Save Changes"}
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default Settings;
