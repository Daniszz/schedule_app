// src/components/scheduler/JobScheduler.jsx
import React from "react";
import { ReactFlowProvider } from "reactflow";
import "reactflow/dist/style.css";
import SchedulerFlow from "./SchedulerFlow";

export default function JobScheduler() {
  return (
    <div className="w-full h-screen bg-base-200 pt-16">
      <ReactFlowProvider>
        <div className="w-full h-full bg-white">
          <SchedulerFlow />
        </div>
      </ReactFlowProvider>
    </div>
  );
}
