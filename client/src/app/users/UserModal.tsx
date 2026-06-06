"use client";

import React, { ChangeEvent, FormEvent, useState } from "react";
import { X } from "lucide-react";
import { NewUser, User, UserRole } from "@/state/api";

type Props =
  | { mode: "create"; user?: undefined; onClose: () => void; onSave: (data: NewUser) => void }
  | { mode: "edit"; user: User; onClose: () => void; onSave: (data: User) => void };

const ROLES: UserRole[] = ["Admin", "Manager", "Staff"];

const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  Admin: "Full access to all features and settings.",
  Manager: "Can manage products, inventory, and view reports.",
  Staff: "Read-only access to inventory and products.",
};

const UserModal = (props: Props) => {
  const { mode, onClose } = props;

  const [formData, setFormData] = useState({
    name: props.user?.name ?? "",
    email: props.user?.email ?? "",
    role: props.user?.role ?? ("Staff" as UserRole),
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (mode === "edit" && props.user) {
      (props.onSave as (data: User) => void)({ ...props.user, ...formData });
    } else {
      (props.onSave as (data: NewUser) => void)(formData);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-base font-semibold text-gray-800">
            {mode === "create" ? "Add New User" : "Edit User"}
          </h2>
          <button type="button" onClick={onClose} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-5 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. John Doe"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="e.g. john@company.com"
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-all"
            >
              {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <p className="mt-1 text-xs text-gray-400">{ROLE_DESCRIPTIONS[formData.role]}</p>
          </div>

          <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
              Cancel
            </button>
            <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
              {mode === "create" ? "Create User" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserModal;
