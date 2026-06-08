"use client";

import { useDeleteUserMutation, useGetUsersQuery, User, UserRole } from "@/state/api";
import { Edit2, PlusCircle, Search, Trash2 } from "lucide-react";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/(components)/Header";
import ExportReportMenu from "@/app/(components)/ExportReportMenu";
import Image from "next/image";
import { useSort } from "@/lib/useSort";
import SortIcon from "@/app/(components)/SortIcon";
import Pagination from "@/app/(components)/Pagination";

type SortKey = "name" | "email" | "role" | "createdAt";

const ROLE_COLORS: Record<UserRole, string> = {
  Admin:   "bg-purple-50 text-purple-700",
  Manager: "bg-blue-50 text-blue-700",
  Staff:   "bg-gray-100 text-gray-600",
};

const DeleteModal = ({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
      <h3 className="text-base font-semibold text-gray-800 mb-2">Delete User</h3>
      <p className="text-sm text-gray-500 mb-6">
        Are you sure you want to delete <span className="font-medium text-gray-800">{name}</span>? This action cannot be undone.
      </p>
      <div className="flex gap-3 justify-end">
        <button onClick={onCancel} className="cursor-pointer px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
        <button onClick={onConfirm} className="cursor-pointer px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">Delete</button>
      </div>
    </div>
  </div>
);

const Users = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm]   = useState("");
  const [roleFilter, setRoleFilter]   = useState<"All" | UserRole>("All");
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const { data: allUsers, isError, isLoading } = useGetUsersQuery();
  const [deleteUser] = useDeleteUserMutation();

  const filtered = allUsers?.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchSearch && (roleFilter === "All" || u.role === roleFilter);
  });

  const getValue = useCallback((u: User, k: SortKey) => {
    if (k === "name")      return u.name;
    if (k === "email")     return u.email;
    if (k === "role")      return u.role;
    if (k === "createdAt") return u.createdAt;
    return undefined;
  }, []);

  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { sorted: sortedUsers, sort, toggle } = useSort<User, SortKey>(filtered, getValue);
  const users = pageSize === 0 ? sortedUsers : sortedUsers.slice((page - 1) * pageSize, page * pageSize);

  const roleCounts = allUsers?.reduce((acc, u) => { acc[u.role] = (acc[u.role] ?? 0) + 1; return acc; }, {} as Record<string, number>);

  const reportData = (filtered ?? []).map((u) => ({
    name: u.name,
    email: u.email,
    role: u.role,
    createdAt: new Date(u.createdAt).toLocaleDateString("en-US"),
  }));

  const th = (label: string, key: SortKey, cls = "") => (
    <th
      className={`text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 cursor-pointer select-none group ${cls}`}
      onClick={() => toggle(key)}
    >
      <span className="inline-flex items-center">{label}<SortIcon dir={sort.dir} active={sort.key === key} /></span>
    </th>
  );

  return (
    <div className="pb-8 w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <Header name="Users" />
          <p className="text-sm text-gray-400 mt-0.5">{allUsers ? `${allUsers.length} total users` : ""}</p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={15} />
            <input
              className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 w-44 sm:w-52 transition-all"
              placeholder="Search users…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <ExportReportMenu
            data={reportData}
            filename="users"
            title="Users Report"
            disabled={!filtered?.length}
          />
          <button
            onClick={() => router.push("/users/new")}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors shrink-0"
          >
            <PlusCircle className="w-4 h-4" /><span className="hidden sm:inline">Add User</span>
          </button>
        </div>
      </div>

      {/* Role filters */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
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
            {r}{r === "All" ? ` (${allUsers?.length ?? 0})` : roleCounts?.[r] != null ? ` (${roleCounts[r]})` : ""}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-20"><div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-blue-500 animate-spin" /></div>
        ) : isError ? (
          <div className="flex items-center justify-center py-20 text-sm text-red-500">Failed to fetch users.</div>
        ) : !users?.length ? (
          <div className="flex items-center justify-center py-20 text-sm text-gray-400">No users found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="w-10 px-4 py-3" />
                  {th("Name",   "name")}
                  {th("Email",  "email",     "hidden md:table-cell")}
                  {th("Role",   "role")}
                  {th("Joined", "createdAt", "hidden lg:table-cell")}
                  <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {users.map((user) => (
                  <tr key={user.userId} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="w-8 h-8 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center shrink-0">
                        {user.image
                          ? <Image src={user.image} alt={user.name} width={32} height={32} className="object-cover w-full h-full" />
                          : <span className="text-xs font-bold text-blue-600">{user.name[0].toUpperCase()}</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                      <p className="text-xs text-gray-400 font-mono">{user.userId.slice(0, 8)}…</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-gray-600">{user.email}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[user.role]}`}>{user.role}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className="text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => router.push(`/users/${user.userId}/edit`)}
                          className="cursor-pointer p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(user)}
                          className="cursor-pointer p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination
              page={page} pageSize={pageSize} total={sortedUsers.length}
              onPageChange={setPage}
              onPageSizeChange={(s) => { setPageSize(s); setPage(1); }}
            />
          </div>
        )}
      </div>

      {deleteTarget && (
        <DeleteModal
          name={deleteTarget.name}
          onConfirm={async () => {
            await deleteUser(deleteTarget.userId).unwrap().catch(console.error);
            setDeleteTarget(null);
          }}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default Users;
