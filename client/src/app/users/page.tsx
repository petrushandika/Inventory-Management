"use client";

import {
  useCreateUserMutation,
  useDeleteUserMutation,
  useGetUsersQuery,
  useUpdateUserMutation,
  User,
  UserRole,
  NewUser,
} from "@/state/api";
import { Edit2, PlusCircle, Search, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import Header from "@/app/(components)/Header";
import Image from "next/image";
import UserModal from "./UserModal";
import { useSort } from "@/lib/useSort";
import SortIcon from "@/app/(components)/SortIcon";

type SortKey = "name" | "email" | "role" | "createdAt";

const ROLE_COLORS: Record<UserRole, string> = {
  Admin: "bg-purple-50 text-purple-700",
  Manager: "bg-blue-50 text-blue-700",
  Staff: "bg-gray-100 text-gray-600",
};

const Users = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"All" | UserRole>("All");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const { data: allUsers, isError, isLoading } = useGetUsersQuery();
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const filtered = allUsers?.filter((u) => {
    const matchName = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchRole = roleFilter === "All" || u.role === roleFilter;
    return matchName && matchRole;
  });

  const getValue = useCallback((u: User, k: SortKey) => {
    if (k === "name") return u.name;
    if (k === "email") return u.email;
    if (k === "role") return u.role;
    if (k === "createdAt") return u.createdAt;
    return undefined;
  }, []);

  const { sorted: users, sort, toggle } = useSort<User, SortKey>(filtered, getValue);

  const handleCreate = async (data: NewUser) => {
    await createUser(data).unwrap().catch(console.error);
    setIsCreateOpen(false);
  };
  const handleUpdate = async (data: User) => {
    const { userId, ...rest } = data;
    await updateUser({ userId, ...rest }).unwrap().catch(console.error);
    setEditTarget(null);
  };
  const handleDelete = async (userId: string) => {
    await deleteUser(userId).unwrap().catch(console.error);
    setDeleteConfirm(null);
  };

  const roleCounts = allUsers?.reduce((acc, u) => {
    acc[u.role] = (acc[u.role] ?? 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const th = (label: string, key: SortKey, className = "") => (
    <th
      className={`text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3.5 cursor-pointer select-none group ${className}`}
      onClick={() => toggle(key)}
    >
      <span className="inline-flex items-center">
        {label}
        <SortIcon dir={sort.dir} active={sort.key === key} />
      </span>
    </th>
  );

  return (
    <div className="pb-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <Header name="Users" />
          <p className="text-sm text-gray-400 mt-0.5">{allUsers ? `${allUsers.length} total users` : ""}</p>
        </div>
        <button
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors shrink-0 self-start sm:self-auto"
          onClick={() => setIsCreateOpen(true)}
        >
          <PlusCircle className="w-4 h-4" />
          Add User
        </button>
      </div>

      {roleCounts && (
        <div className="flex flex-wrap gap-2 mb-4">
          {(["All", "Admin", "Manager", "Staff"] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                roleFilter === r
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600"
              }`}
            >
              {r}
              {r !== "All" && roleCounts[r] != null && <span className="ml-1.5 opacity-75">({roleCounts[r]})</span>}
              {r === "All" && allUsers && <span className="ml-1.5 opacity-75">({allUsers.length})</span>}
            </button>
          ))}
        </div>
      )}

      <div className="relative mb-4 max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={15} />
        <input
          className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 w-full transition-all"
          placeholder="Search by name or email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden w-full">
        {isLoading ? (
          <div className="flex items-center justify-center py-20 text-sm text-gray-400 animate-pulse">Loading users...</div>
        ) : isError || !users ? (
          <div className="flex items-center justify-center py-20 text-sm text-red-500">Failed to fetch users.</div>
        ) : users.length === 0 ? (
          <div className="flex items-center justify-center py-20 text-sm text-gray-400">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3.5 w-12" />
                  {th("Name", "name")}
                  {th("Email", "email", "hidden md:table-cell")}
                  {th("Role", "role")}
                  {th("Joined", "createdAt", "hidden lg:table-cell")}
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-5 py-3.5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => (
                  <tr key={user.userId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="w-9 h-9 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center shrink-0">
                        {user.image ? (
                          <Image src={user.image} alt={user.name} width={36} height={36} className="object-cover w-full h-full" />
                        ) : (
                          <span className="text-sm font-bold text-blue-600">{user.name[0].toUpperCase()}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{user.userId.slice(0, 8)}…</p>
                    </td>
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="text-sm text-gray-600">{user.email}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[user.role]}`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 hidden lg:table-cell">
                      <span className="text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => setEditTarget(user)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => setDeleteConfirm(user.userId)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isCreateOpen && <UserModal mode="create" onClose={() => setIsCreateOpen(false)} onSave={(data) => handleCreate(data as NewUser)} />}
      {editTarget && <UserModal mode="edit" user={editTarget} onClose={() => setEditTarget(null)} onSave={(data) => handleUpdate(data as User)} />}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h3 className="text-base font-semibold text-gray-800 mb-2">Delete User</h3>
            <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete this user? This cannot be undone.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteConfirm(null)} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Users;
