import React, { useState } from "react";
import Instructions from "./Instructions";
import { Play, X, HelpCircle } from "lucide-react";

export default function ControlPanel({
  jobs,
  conflicts,
  currentSchedule,
  scheduleResults,
  isScheduleRunning,
  getTotalGain,
  getTotalProcessingTime,
  setIsCreatingSchedule,
  setIsAddingJob,
  handleRunSchedule,
  clearAll,
  isJobCreating,
}) {
  const [showInstructions, setShowInstructions] = useState(false);

  return (
    <>
      <div className="absolute -top-2 -left-2 z-10 scale-80 space-y-4">
        <div className="card bg-base-100 shadow-xl w-80">
          <div className="card-body">
            <div className="flex justify-between items-center">
              <h2 className="card-title text-lg">Job Scheduler</h2>
              <button
                onClick={() => setShowInstructions(true)}
                className="btn btn-ghost btn-sm btn-circle"
                title="Show Instructions"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="stat bg-base-200 rounded-lg p-2">
                <div className="stat-title text-xs">Total Jobs</div>
                <div className="stat-value text-sm">{jobs.length}</div>
              </div>
              <div className="stat bg-base-200 rounded-lg p-2">
                <div className="stat-title text-xs">Total Conflicts</div>
                <div className="stat-value text-sm">{conflicts.length}</div>
              </div>
              <div className="stat bg-base-200 rounded-lg p-2">
                <div className="stat-title text-xs">Total Gain</div>
                <div className="stat-value text-sm">{getTotalGain()}</div>
              </div>
              <div className="stat bg-base-200 rounded-lg p-2">
                <div className="stat-title text-xs">Total Time</div>
                <div className="stat-value text-sm">
                  {getTotalProcessingTime()}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              {!currentSchedule ? (
                <button
                  onClick={() => setIsCreatingSchedule(true)}
                  className="btn btn-primary w-full"
                  disabled={jobs.length === 0}
                >
                  <Play className="w-4 h-4 mr-2" />
                  Create Schedule
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="text-xs text-center font-medium">
                    Current: {currentSchedule.name}
                  </div>
                  <button
                    onClick={handleRunSchedule}
                    className="btn btn-success w-full"
                    disabled={isScheduleRunning}
                  >
                    {isScheduleRunning ? "Running..." : "▶️ Run Schedule"}
                  </button>
                  <button
                    onClick={() => setIsCreatingSchedule(true)}
                    className="btn btn-outline w-full"
                  >
                    📊 New Schedule
                  </button>
                </div>
              )}
            </div>

            {scheduleResults.length > 0 && (
              <div className="card bg-base-200 mt-4">
                <div className="card-body p-3">
                  <h3 className="card-title text-sm">Latest Results</h3>
                  <div className="space-y-2 text-xs">
                    <div>Algorithm: {scheduleResults[0]?.algorithm_used}</div>
                    <div>
                      Colored Jobs:{" "}
                      {scheduleResults[0]?.fully_colored_jobs?.length}
                    </div>
                    {scheduleResults[0]?.f1 && (
                      <div>F1: {scheduleResults[0].f1}</div>
                    )}
                    {scheduleResults[0]?.f2 && (
                      <div>F2: {scheduleResults[0].f2}</div>
                    )}
                    {scheduleResults[0]?.f3 && (
                      <div>F3: {scheduleResults[0].f3}</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <button
                onClick={() => setIsAddingJob(true)}
                className="btn btn-success w-full"
                disabled={isJobCreating}
              >
                {isJobCreating ? "Creating..." : "+ Add Job"}
              </button>

              <button
                onClick={clearAll}
                className="btn btn-error btn-outline w-full"
              >
                <X className="w-4 h-4 mr-2" />
                Clear All
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal pentru instrucțiuni */}
      {showInstructions && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Instructions</h3>
              <button
                onClick={() => setShowInstructions(false)}
                className="btn btn-ghost btn-sm btn-circle"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <Instructions />
          </div>
          <div
            className="modal-backdrop"
            onClick={() => setShowInstructions(false)}
          ></div>
        </div>
      )}
    </>
  );
}
