"use client";

import { useDeleteUserMutation, useGetUsersQuery, useUpdateUserMutation, User, UserRole } from "@/state/api";
import { Edit2, PlusCircle, Search, Trash2, X } from "lucide-react";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/app/(components)/Header";
import Image from "next/image";
import { useSort } from "@/lib/useSort";
import SortIcon from "@/app/(components)/SortIcon";
import Pagination from "@/app/(components)/Pagination";

type SortKey = "name" | "email" | "role" | "createdAt";

const ROLES: UserRole[] = ["Admin", "Manager", "Staff"];
const ROLE_COLORS: Record<UserRole, string> = { Admin: "bg-purple-50 text-purple-700", Manager: "bg-blue-50 text-blue-700", Staff: "bg-gray-100 text-gray-600" };
const ROLE_DESC: Record<UserRole, string> = { Admin: "Full access to all features.", Manager: "Manage products and view reports.", Staff: "Read-only access." };

type FormState = { name: string; email: string; role: UserRole };
const emptyForm = (): FormState => ({ name: "", email: "", role: "Staff" });

const DeleteModal = ({ name, onConfirm, onCancel }: { name: string; onConfirm: () => void; onCancel: () => void }) => (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
    <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
      <h3 className="text-base font-semibold text-gray-800 mb-2">Delete User</h3>
      <p className="text-sm text-gray-500 mb-6">Are you sure you want to delete <span className="font-medium text-gray-800">{name}</span>?</p>
      <div className="flex gap-3 justify-end">
        <button onClick={onCancel} className="px-4 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
        <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors">Delete</button>
      </div>
    </div>
  </div>
);

const Users = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<"All" | UserRole>("All");
  const [panel, setPanel] = useState<"edit" | null>(null);
  const [editTarget, setEditTarget] = useState<User | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);

  const { data: allUsers, isError, isLoading } = useGetUsersQuery();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();

  const filtered = allUsers?.filter((u) => {
    const matchName = u.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase());
    return matchName && (roleFilter === "All" || u.role === roleFilter);
  });

  const getValue = useCallback((u: User, k: SortKey) => {
    if (k === "name") return u.name;
    if (k === "email") return u.email;
    if (k === "role") return u.role;
    if (k === "createdAt") return u.createdAt;
    return undefined;
  }, []);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const { sorted: allUsers2, sort, toggle } = useSort<User, SortKey>(filtered, getValue);
  const users = pageSize === 0 ? allUsers2 : allUsers2.slice((page - 1) * pageSize, page * pageSize);

  const openEdit = (u: User) => { setForm({ name: u.name, email: u.email, role: u.role }); setEditTarget(u); setPanel("edit"); };
  const closePanel = () => { setPanel(null); setEditTarget(null); setForm(emptyForm()); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (panel === "edit" && editTarget) {
      await updateUser({ userId: editTarget.userId, name: form.name.trim(), email: form.email.trim().toLowerCase(), role: form.role }).unwrap().catch(console.error);
    }
    closePanel();
  };

  const roleCounts = allUsers?.reduce((acc, u) => { acc[u.role] = (acc[u.role] ?? 0) + 1; return acc; }, {} as Record<string, number>);

  const th = (label: string, key: SortKey, cls = "") => (
    <th className={`text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3 cursor-pointer select-none group ${cls}`} onClick={() => toggle(key)}>
      <span className="inline-flex items-center">{label}<SortIcon dir={sort.dir} active={sort.key === key} /></span>
    </th>
  );

  const FormPanel = (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6 lg:w-96 shrink-0">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-base font-semibold text-gray-800">Edit User</h2>
        <button onClick={closePanel} className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"><X className="w-4 h-4 text-gray-500" /></button>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Full Name <span className="text-red-400">*</span></label>
          <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            placeholder="e.g. John Doe"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Email Address <span className="text-red-400">*</span></label>
          <input required type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
            placeholder="john@company.com"
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400" />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Role</label>
          <div className="space-y-2">
            {ROLES.map((r) => (
              <label key={r} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${form.role === r ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
                <input type="radio" name="role" value={r} checked={form.role === r} onChange={() => setForm((f) => ({ ...f, role: r }))} className="mt-0.5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-800">{r}</p>
                  <p className="text-xs text-gray-400">{ROLE_DESC[r]}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="button" onClick={closePanel} className="flex-1 py-2 text-sm font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">Cancel</button>
          <button type="submit" className="flex-1 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );

  return (
    <div className="pb-8 w-full">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <Header name="Users" />
          <p className="text-sm text-gray-400 mt-0.5">{allUsers ? `${allUsers.length} total users` : ""}</p>
        </div>
        <button onClick={() => router.push("/users/new")} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors shrink-0 self-start sm:self-auto">
          <PlusCircle className="w-4 h-4" />Add User
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-4">
        {(["All", "Admin", "Manager", "Staff"] as const).map((r) => (
          <button key={r} onClick={() => setRoleFilter(r)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors border ${roleFilter === r ? "bg-blue-600 text-white border-blue-600" : "bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600"}`}>
            {r}{r === "All" ? ` (${allUsers?.length ?? 0})` : roleCounts?.[r] != null ? ` (${roleCounts[r]})` : ""}
          </button>
        ))}
        <div className="relative ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={15} />
          <input className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 w-48 transition-all"
            placeholder="Search users..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
        </div>
      </div>

      <div className={`flex flex-col ${panel ? "lg:flex-row" : ""} gap-5`}>
        <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden flex-1 min-w-0">
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
                    {th("Name", "name")}
                    {th("Email", "email", `${panel ? "hidden xl:table-cell" : "hidden md:table-cell"}`)}
                    {th("Role", "role")}
                    {th("Joined", "createdAt", "hidden lg:table-cell")}
                    <th className="text-right text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {users.map((user) => (
                    <tr key={user.userId} className={`hover:bg-gray-50 transition-colors ${editTarget?.userId === user.userId ? "bg-blue-50/50" : ""}`}>
                      <td className="px-4 py-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 overflow-hidden flex items-center justify-center shrink-0">
                          {user.image ? <Image src={user.image} alt={user.name} width={32} height={32} className="object-cover w-full h-full" /> : <span className="text-xs font-bold text-blue-600">{user.name[0].toUpperCase()}</span>}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-400 font-mono">{user.userId.slice(0, 8)}…</p>
                      </td>
                      <td className={`px-4 py-3 ${panel ? "hidden xl:table-cell" : "hidden md:table-cell"}`}><span className="text-sm text-gray-600">{user.email}</span></td>
                      <td className="px-4 py-3"><span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${ROLE_COLORS[user.role]}`}>{user.role}</span></td>
                      <td className="px-4 py-3 hidden lg:table-cell"><span className="text-sm text-gray-500">{new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span></td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => openEdit(user)} className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"><Edit2 className="w-4 h-4" /></button>
                          <button onClick={() => setDeleteTarget(user)} className="p-1.5 rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"><Trash2 className="w-4 h-4" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            <Pagination page={page} pageSize={pageSize} total={allUsers2.length} onPageChange={setPage} onPageSizeChange={(s) => { setPageSize(s); setPage(1); }} />
            </div>
          )}
        </div>
        {panel && FormPanel}
      </div>

      {deleteTarget && (
        <DeleteModal name={deleteTarget.name}
          onConfirm={async () => { await deleteUser(deleteTarget.userId).unwrap().catch(console.error); setDeleteTarget(null); }}
          onCancel={() => setDeleteTarget(null)} />
      )}
    </div>
  );
};

export default Users;
