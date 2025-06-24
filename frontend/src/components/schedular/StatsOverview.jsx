import React from "react";

export default function StatsOverview({
  jobs,
  conflicts,
  getTotalGain,
  getTotalProcessingTime,
}) {
  const stats = [
    { label: "Jobs", value: jobs.length, color: "text-primary" },
    { label: "Conflicts", value: conflicts.length, color: "text-warning" },
    { label: "Total Gain", value: getTotalGain(), color: "text-success" },
    {
      label: "Total Time",
      value: getTotalProcessingTime(),
      color: "text-info",
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-1 text-center">
      {stats.map((stat, index) => (
        <div key={index} className="bg-base-200 rounded p-2">
          <div className="text-xs text-base-content/60 mb-1">{stat.label}</div>
          <div className={`text-sm font-semibold ${stat.color}`}>
            {stat.value}
          </div>
        </div>
      ))}
    </div>
  );
}
