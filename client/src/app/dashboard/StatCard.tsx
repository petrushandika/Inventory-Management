"use client";

import { LucideIcon } from "lucide-react";
import React from "react";

type StatDetail = {
  title: string;
  amount: string;
  changePercentage: number;
  IconComponent: LucideIcon;
};

type StatCardProps = {
  title: string;
  primaryIcon: React.ReactNode;
  details: StatDetail[];
  dateRange: string;
};

const StatCard = ({ title, primaryIcon, details, dateRange }: StatCardProps) => {
  const formatPercentage = (value: number) => {
    const signal = value >= 0 ? "+" : "";
    return `${signal}${value.toFixed(0)}%`;
  };

  const getChangeColor = (value: number) =>
    value >= 0 ? "text-green-500" : "text-red-500";

  return (
    <div className="md:row-span-1 xl:row-span-2 bg-white col-span-1 shadow-sm rounded-2xl border border-gray-100 flex flex-col">
      {/* HEADER */}
      <div className="shrink-0">
        <div className="flex justify-between items-center px-5 pt-4 pb-3">
          <h2 className="font-semibold text-sm text-gray-800">{title}</h2>
          <span className="text-xs text-gray-400">{dateRange}</span>
        </div>
        <hr className="border-gray-100" />
      </div>

      {/* BODY */}
      <div className="flex-1 flex items-center gap-4 px-5 py-3">
        <div className="rounded-xl p-3 bg-blue-50 border border-blue-100 shrink-0">
          {primaryIcon}
        </div>
        <div className="flex-1 min-w-0">
          {details.map((detail, index) => (
            <React.Fragment key={index}>
              <div className="flex items-center justify-between py-1.5 gap-2">
                <span className="text-xs text-gray-500 truncate">{detail.title}</span>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-xs font-bold text-gray-800">
                    ${detail.amount}
                  </span>
                  <div
                    className={`flex items-center text-xs font-medium ${getChangeColor(
                      detail.changePercentage
                    )}`}
                  >
                    <detail.IconComponent className="w-3 h-3 mr-0.5" />
                    {formatPercentage(detail.changePercentage)}
                  </div>
                </div>
              </div>
              {index < details.length - 1 && (
                <hr className="border-gray-50" />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
