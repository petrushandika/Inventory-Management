"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Eye, EyeOff, Lock, User, ShieldCheck, BarChart3, Package, TrendingUp } from "lucide-react";
import { useLoginMutation } from "@/state/api";

const FEATURES = [
  { icon: Package,    label: "Inventory Tracking",  desc: "Monitor stock levels in real time" },
  { icon: BarChart3,  label: "Analytics",            desc: "Data-driven insights and reports" },
  { icon: TrendingUp, label: "Sales & Purchases",    desc: "Track every transaction instantly" },
  { icon: ShieldCheck,label: "Access Control",       desc: "Role-based user permissions" },
];

const LoginPage = () => {
  const router = useRouter();
  const [login] = useLoginMutation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!username.trim() || !password) {
      setError("Please enter your username and password.");
      return;
    }

    setIsLoading(true);
    try {
      await login({ username: username.trim(), password }).unwrap();
      router.push("/dashboard");
    } catch {
      setError("Invalid username or password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">

      {/* ── Left: Branding (hidden on mobile) ── */}
      <div className="hidden md:flex w-1/2 relative flex-col justify-between bg-[#080d1a] p-10 lg:p-14 overflow-hidden">

        {/* Dot grid */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />

        {/* Glows */}
        <div className="absolute -top-32 -left-20 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[130px] pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-[400px] h-[400px] bg-indigo-600/15 rounded-full blur-[110px] pointer-events-none" />

        {/* Top: logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
            <Image
              src="https://res.cloudinary.com/dqcyabvc2/image/upload/v1749802554/logo_w7rgwe.png"
              width={22}
              height={22}
              alt="XStock"
            />
          </div>
          <span className="text-white font-bold text-base tracking-tight">XStock</span>
        </div>

        {/* Center: headline + features */}
        <div className="relative z-10 space-y-10">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-xs font-medium mb-5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Inventory Management System
            </span>
            <h1 className="text-3xl lg:text-4xl font-bold text-white leading-snug">
              Full control<br />
              <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                over your stock.
              </span>
            </h1>
            <p className="text-gray-400 text-sm mt-3 leading-relaxed max-w-xs">
              Streamline operations, track inventory, and make smarter decisions — all in one place.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {FEATURES.map(({ icon: Icon, label, desc }) => (
              <div key={label} className="flex items-center gap-4 p-3 rounded-xl bg-white/[0.04] border border-white/[0.07]">
                <div className="w-9 h-9 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-blue-400" />
                </div>
                <div>
                  <p className="text-white text-sm font-medium">{label}</p>
                  <p className="text-gray-500 text-xs">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <p className="relative z-10 text-xs text-gray-600">
          &copy; {new Date().getFullYear()} XStock. All rights reserved.
        </p>
      </div>

      {/* ── Right: Form ── */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center bg-white px-6 py-12 sm:px-12">

        {/* Mobile logo */}
        <div className="flex md:hidden items-center gap-2 mb-10">
          <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center">
            <Image
              src="https://res.cloudinary.com/dqcyabvc2/image/upload/v1749802554/logo_w7rgwe.png"
              width={22}
              height={22}
              alt="XStock"
            />
          </div>
          <span className="font-bold text-gray-900 text-base">XStock</span>
        </div>

        <div className="w-full max-w-sm">
          {/* Heading */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Welcome back</h2>
            <p className="text-sm text-gray-500 mt-1">Sign in to access your dashboard.</p>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-100 text-sm text-red-600">
              <span className="mt-0.5 shrink-0">⚠</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" autoComplete="off">

            {/* Username */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={15} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  autoComplete="username"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl transition-all focus:outline-none focus:bg-white focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-medium text-gray-700">Password</label>
                <button type="button" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                  Forgot password?
                </button>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={15} />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  autoComplete="current-password"
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-gray-50 border border-gray-200 rounded-xl transition-all focus:outline-none focus:bg-white focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Remember me */}
            <div className="flex items-center gap-2.5">
              <input
                id="remember"
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-gray-900 focus:ring-gray-900 cursor-pointer"
              />
              <label htmlFor="remember" className="text-sm text-gray-600 cursor-pointer select-none">
                Keep me signed in
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-gray-300 shrink-0" />
            <span className="text-xs text-gray-400">Secured with end-to-end encryption</span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default LoginPage;
