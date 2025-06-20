import React, { useState } from "react";
import Instructions from "./Instructions";
import { Play, X, HelpCircle, Save } from "lucide-react";
export default function ControlPanel({
  jobs,
  conflicts,
  currentSchedule,
  currentResult,
  isScheduleRunning,
  getTotalGain,
  getTotalProcessingTime,
  scheduleParams,
  setScheduleParams,
  isScheduleCreating,
  handleCreateSchedule,
  handleRunSchedule,
  setIsAddingJob,
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

            {/* Schedule Parameters */}
            <div className="space-y-3 border-t pt-3">
              <h3 className="text-sm font-semibold">Schedule Parameters</h3>

              <div className="form-control">
                <label className="label py-1">
                  <span className="label-text text-xs">Schedule Name</span>
                </label>
                <input
                  type="text"
                  value={scheduleParams.name}
                  onChange={(e) =>
                    setScheduleParams({
                      ...scheduleParams,
                      name: e.target.value,
                    })
                  }
                  placeholder="Enter schedule name"
                  className="input input-bordered input-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-xs">
                      Number of shared resources
                    </span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={scheduleParams.l}
                    onChange={(e) =>
                      setScheduleParams({
                        ...scheduleParams,
                        l: Number(e.target.value),
                      })
                    }
                    placeholder="L value"
                    className="input input-bordered input-sm"
                  />
                </div>
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-xs">
                      Deadline(the number of hours)
                    </span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={scheduleParams.D}
                    onChange={(e) =>
                      setScheduleParams({
                        ...scheduleParams,
                        D: Number(e.target.value),
                      })
                    }
                    placeholder="D value"
                    className="input input-bordered input-sm"
                  />
                </div>
              </div>
            </div>

            {/* Schedule Actions */}
            <div className="space-y-2">
              {!currentSchedule ? (
                <button
                  onClick={handleCreateSchedule}
                  className="btn btn-primary w-full btn-sm"
                  disabled={
                    jobs.length === 0 ||
                    isScheduleCreating ||
                    !scheduleParams?.name?.trim()
                  }
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isScheduleCreating ? "Saving..." : "Save Schedule"}
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="text-xs text-center font-medium bg-base-200 rounded p-2">
                    Current: {currentSchedule.name}
                  </div>
                  <button
                    onClick={handleRunSchedule}
                    className="btn btn-success w-full btn-sm"
                    disabled={isScheduleRunning}
                  >
                    <Play className="w-4 h-4 mr-2" />
                    {isScheduleRunning ? "Running..." : "Run Schedule"}
                  </button>
                  <button
                    onClick={handleCreateSchedule}
                    className="btn btn-outline w-full btn-sm"
                    disabled={
                      isScheduleCreating || !scheduleParams?.name?.trim()
                    }
                  >
                    <Save className="w-4 h-4 mr-2" />
                    {isScheduleCreating ? "Saving..." : "Save New Schedule"}
                  </button>
                </div>
              )}
            </div>

            {/* Schedule Results Display */}
            {currentResult && (
              <div className="card bg-base-200 mt-4">
                <div className="card-body p-3">
                  <h3 className="card-title text-sm mb-3">Latest Results</h3>

                  {/* Algorithm Used */}
                  <div className="mb-3">
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Algorithm
                    </div>
                    <div className="text-sm bg-base-100 rounded px-2 py-1">
                      {currentResult?.algorithm_used || "N/A"}
                    </div>
                  </div>

                  {/* Colored Jobs */}
                  <div className="mb-3">
                    <div className="text-xs font-semibold text-gray-600 mb-1">
                      Colored Jobs
                    </div>
                    <div className="text-sm bg-base-100 rounded px-2 py-1">
                      {currentResult?.fully_colored_jobs?.length || 0} /{" "}
                      {jobs.length}
                    </div>
                  </div>

                  {/* Objectives */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="text-center">
                      <div className="text-xs font-semibold text-gray-600">
                        F1
                      </div>
                      <div className="text-sm text-black  bg-white rounded px-2 py-1">
                        {currentResult?.f1 !== undefined
                          ? currentResult.f1
                          : "N/A"}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-semibold text-gray-600">
                        F2
                      </div>
                      <div className="text-sm text-black  bg-white rounded px-2 py-1">
                        {currentResult?.f2 !== undefined
                          ? currentResult.f2
                          : "N/A"}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs font-semibold text-gray-600">
                        F3
                      </div>
                      <div className="text-sm text-black  bg-white rounded px-2 py-1">
                        {currentResult?.f3 !== undefined
                          ? currentResult.f3
                          : "N/A"}
                      </div>
                    </div>
                  </div>

                  {/* Timestamp */}
                  <div className="mt-3 text-xs text-gray-500 text-center">
                    {currentResult?.timestamp &&
                      new Date(currentResult.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <button
                onClick={() => setIsAddingJob(true)}
                className="btn btn-success w-full btn-sm"
                disabled={isJobCreating}
              >
                {isJobCreating ? "Creating..." : "+ Add Job"}
              </button>

              <button
                onClick={clearAll}
                className="btn btn-error btn-outline w-full btn-sm"
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
