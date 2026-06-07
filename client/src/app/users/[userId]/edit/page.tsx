"use client";

import { useGetUsersQuery, useUpdateUserMutation, UserRole } from "@/state/api";
import { AlertCircle, Camera, Check, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Breadcrumb from "@/app/(components)/Breadcrumb";
import Link from "next/link";
import Image from "next/image";

const ROLES: { value: UserRole; label: string; desc: string; badge: string }[] = [
  { value: "Admin",   label: "Admin",   desc: "Full access to all features including user management.", badge: "bg-purple-100 text-purple-700" },
  { value: "Manager", label: "Manager", desc: "Manage products, inventory, and view all reports.",      badge: "bg-blue-100 text-blue-700"   },
  { value: "Staff",   label: "Staff",   desc: "Read-only access to products and basic reports.",        badge: "bg-gray-100 text-gray-600"   },
];

const inputCls = "w-full px-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors placeholder:text-gray-400";

const getBase64 = (file: File): Promise<string> =>
  new Promise((res) => { const r = new FileReader(); r.onloadend = () => res(r.result as string); r.readAsDataURL(file); });

const EditUserPage = () => {
  const router = useRouter();
  const { userId } = useParams<{ userId: string }>();
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: users, isLoading: loadingUsers } = useGetUsersQuery();
  const [updateUser] = useUpdateUserMutation();

  const [form, setForm] = useState<{ name: string; email: string; role: UserRole }>({
    name: "", email: "", role: "Staff",
  });
  const [existingImage, setExistingImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!users) return;
    const user = users.find((u) => u.userId === userId);
    if (!user) { router.replace("/users"); return; }
    setForm({ name: user.name, email: user.email, role: user.role });
    setExistingImage(user.image ?? null);
    setReady(true);
  }, [users, userId, router]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview("");
    setExistingImage(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      let imagePayload: string | undefined = undefined;
      if (imageFile) {
        imagePayload = await getBase64(imageFile);
      } else if (existingImage === null) {
        // user explicitly removed the image
        imagePayload = "";
      }
      await updateUser({
        userId,
        name:  form.name.trim(),
        email: form.email.trim().toLowerCase(),
        role:  form.role,
        ...(imagePayload !== undefined && { image: imagePayload }),
      }).unwrap();
      router.push("/users");
    } catch {
      setError("Failed to update user. The email may already be in use.");
      setIsSubmitting(false);
    }
  };

  const displayPreview = imagePreview || existingImage || "";

  if (loadingUsers || !ready) {
    return (
      <div className="flex items-center justify-center py-32">
        <div className="w-8 h-8 rounded-full border-2 border-gray-200 border-t-blue-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="pb-10 w-full">
      <Breadcrumb items={[{ label: "Users", href: "/users" }, { label: "Edit User" }]} />

      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">Edit User</h1>
        <p className="text-sm text-gray-500 mt-1">Update the user&apos;s details and permissions.</p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
        <form onSubmit={handleSubmit}>
          <div className="p-6 space-y-6">

            {error && (
              <div className="flex items-center gap-2.5 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                <AlertCircle className="w-4 h-4 shrink-0" /><span>{error}</span>
              </div>
            )}

            {/* Avatar upload */}
            <div className="flex items-center gap-5">
              <div className="relative shrink-0">
                <div
                  onClick={() => fileRef.current?.click()}
                  className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 hover:border-blue-400 flex items-center justify-center overflow-hidden cursor-pointer transition-colors group"
                >
                  {displayPreview ? (
                    <Image
                      src={displayPreview}
                      alt="Avatar"
                      width={80}
                      height={80}
                      unoptimized
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-blue-400 group-hover:opacity-60 transition-opacity">
                      {form.name?.[0]?.toUpperCase() ?? "?"}
                    </span>
                  )}
                </div>
                {displayPreview && (
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center shadow"
                  >
                    <X className="w-3 h-3 text-white" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow"
                >
                  <Camera className="w-3.5 h-3.5 text-white" />
                </button>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Profile Photo</p>
                <p className="text-xs text-gray-400 mt-0.5">JPG, PNG up to 5MB. Stored on Cloudinary.</p>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="mt-2 text-xs text-blue-600 hover:underline"
                >
                  {displayPreview ? "Change photo" : "Upload photo"}
                </button>
              </div>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
            </div>

            <hr className="border-gray-100" />

            {/* Name & Email */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. John Doe"
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-400">*</span>
                </label>
                <input
                  required
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="john@company.com"
                  className={inputCls}
                />
              </div>
            </div>

            <hr className="border-gray-100" />

            {/* Role */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Role & Permissions</label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {ROLES.map((r) => {
                  const active = form.role === r.value;
                  return (
                    <button
                      key={r.value}
                      type="button"
                      onClick={() => setForm((f) => ({ ...f, role: r.value }))}
                      className={`relative flex flex-col items-start gap-1.5 p-4 rounded-xl border-2 text-left transition-all ${
                        active ? "border-blue-400 bg-blue-50/60" : "border-gray-200 hover:border-gray-300 bg-white"
                      }`}
                    >
                      {active && (
                        <span className="absolute top-3 right-3 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </span>
                      )}
                      <span className={`inline-block px-2 py-0.5 rounded-md text-xs font-semibold ${r.badge}`}>{r.label}</span>
                      <p className="text-xs text-gray-500 leading-relaxed">{r.desc}</p>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 rounded-b-2xl border-t border-gray-100 flex items-center justify-between gap-3">
            <p className="text-xs text-gray-400"><span className="text-red-400">*</span> Required fields</p>
            <div className="flex items-center gap-3">
              <Link
                href="/users"
                className="px-5 py-2.5 text-sm font-medium text-gray-600 bg-white border border-gray-200 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2.5 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2"
              >
                {isSubmitting ? (
                  <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Saving…</>
                ) : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditUserPage;
