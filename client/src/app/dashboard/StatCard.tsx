"use client";

import { LucideIcon, TrendingDown, TrendingUp } from "lucide-react";
import React from "react";

type StatDetail = {
  label: string;
  value: string;
  change?: number;
};

type StatCardProps = {
  title: string;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  details: StatDetail[];
};

const StatCard = ({ title, icon: Icon, iconColor, iconBg, details }: StatCardProps) => {
  return (
    <div className="bg-white shadow-sm rounded-2xl border border-gray-100 p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className={`p-2.5 rounded-xl ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
        <h3 className="text-sm font-semibold text-gray-800">{title}</h3>
      </div>

      {/* Details */}
      <div className="space-y-3">
        {details.map((d, i) => (
          <div key={i} className="flex items-center justify-between">
            <span className="text-xs text-gray-500">{d.label}</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-gray-800">{d.value}</span>
              {d.change !== undefined && (
                <span
                  className={`flex items-center text-xs font-medium ${
                    d.change >= 0 ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {d.change >= 0 ? (
                    <TrendingUp className="w-3 h-3 mr-0.5" />
                  ) : (
                    <TrendingDown className="w-3 h-3 mr-0.5" />
                  )}
                  {Math.abs(d.change).toFixed(1)}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatCard;
