import React, { useState, useEffect } from "react";
import Instructions from "./Instructions";
import {
  Play,
  X,
  HelpCircle,
  Save,
  Edit,
  Plus,
  ArrowLeft,
  FolderOpen, // Keep if used for something else, not directly related to current fix
} from "lucide-react";

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
  handleUpdateSchedule,
  handleSaveAsNew,
  handleRunSchedule, // This function needs a slight modification or a wrapper
  setIsAddingJob,
  clearAll,
  isJobCreating, // This prop seems to map to isScheduleUpdating from SchedulerFlow
  isViewingResultMode,
  backToEditingMode,
}) {
  const [showInstructions, setShowInstructions] = useState(false);
  const [activeTab, setActiveTab] = useState("setup");

  // Effect to force "Setup" tab if no current schedule and not viewing results
  useEffect(() => {
    if (!currentSchedule && !isViewingResultMode && activeTab === "execution") {
      setActiveTab("setup");
    }
    // Also, if we enter viewing result mode, automatically switch to execution tab
    if (isViewingResultMode && activeTab !== "execution") {
      setActiveTab("execution");
    }
  }, [currentSchedule, activeTab, isViewingResultMode]);

  // isEditingEnabled determines if general editing actions (like updating schedule, adding jobs) are allowed
  const isEditingEnabled = !isViewingResultMode && !!currentSchedule;

  // --- NEW FUNCTION TO HANDLE RUN AND TAB SWITCH ---
  const handleRunScheduleAndSwitchTab = () => {
    handleRunSchedule(); // Call the original run function
    setActiveTab("execution"); // Automatically switch to the execution tab
  };
  // -------------------------------------------------

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

            {/* Stats Overview - se bazează pe jobs din currentSchedule */}
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

            {/* Tabs */}
            <div className="tabs tabs-bordered border-t pt-3">
              <button
                className={`tab tab-sm ${
                  activeTab === "setup" ? "tab-active" : ""
                }`}
                onClick={() => setActiveTab("setup")}
                disabled={isViewingResultMode} // Can't go to setup tab if viewing results
              >
                Setup
              </button>
              <button
                className={`tab tab-sm ${
                  activeTab === "execution" ? "tab-active" : ""
                }`}
                onClick={() => setActiveTab("execution")}
                disabled={!currentSchedule && !isViewingResultMode} // Cannot switch to execution if no schedule and not viewing results
              >
                Execution
              </button>
            </div>

            {/* Tab Content */}
            {activeTab === "setup" && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Schedule Parameters</h3>

                {/* Info despre schedule-ul curent sau "No schedule selected" */}
                {currentSchedule ? (
                  <div className="text-xs text-center font-medium bg-base-200 rounded p-2">
                    Editing: {currentSchedule.name}
                  </div>
                ) : (
                  <div className="text-xs text-center text-gray-500 bg-base-200 rounded p-2">
                    No schedule selected. Create a new one or load from history.
                  </div>
                )}

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
                    // --- UPDATED DISABLED LOGIC: Only disable if in viewing results mode ---
                    disabled={isViewingResultMode}
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
                      // --- UPDATED DISABLED LOGIC: Only disable if in viewing results mode ---
                      disabled={isViewingResultMode}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-xs">
                        Deadline (hours)
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
                      // --- UPDATED DISABLED LOGIC: Only disable if in viewing results mode ---
                      disabled={isViewingResultMode}
                    />
                  </div>
                </div>

                {/* Schedule Action Buttons */}
                <div className="space-y-2">
                  {!currentSchedule ? (
                    <button
                      onClick={handleCreateSchedule}
                      className="btn btn-primary w-full btn-sm"
                      disabled={
                        isScheduleCreating ||
                        !scheduleParams?.name?.trim() ||
                        isViewingResultMode // Also disable if viewing results
                      }
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {isScheduleCreating
                        ? "Creating..."
                        : "Create New Schedule"}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleUpdateSchedule}
                        className="btn btn-primary w-full btn-sm"
                        disabled={
                          !isEditingEnabled || // Use the consolidated editing check
                          isScheduleCreating || // Still creating/updating
                          !scheduleParams?.name?.trim() // Name required
                        }
                      >
                        <Edit className="w-4 h-4 mr-2" />
                        {isScheduleCreating ? "Updating..." : "Update Schedule"}
                      </button>
                      <button
                        onClick={handleSaveAsNew}
                        className="btn btn-outline btn-primary w-full btn-sm"
                        disabled={
                          isScheduleCreating ||
                          !scheduleParams?.name?.trim() ||
                          isViewingResultMode // Disable if viewing results
                        }
                      >
                        <Save className="w-4 h-4 mr-2" />
                        {isScheduleCreating ? "Saving..." : "Save as New"}
                      </button>
                    </>
                  )}

                  <button
                    onClick={() => setIsAddingJob(true)}
                    className="btn btn-success w-full btn-sm"
                    disabled={
                      isJobCreating || // Prop from parent
                      !isEditingEnabled // Use the consolidated editing check
                    }
                  >
                    {isJobCreating ? "Creating..." : "+ Add Job"}
                  </button>

                  <button
                    onClick={clearAll}
                    className="btn btn-error btn-outline w-full btn-sm"
                    disabled={
                      (!currentSchedule && jobs.length === 0) || // Disable if truly empty
                      isViewingResultMode // Disable if viewing results
                    }
                  >
                    <X className="w-4 h-4 mr-2" />
                    Clear Current Schedule
                  </button>
                </div>
              </div>
            )}

            {activeTab === "execution" && (
              <div className="space-y-3">
                {!isViewingResultMode ? (
                  <>
                    {currentSchedule ? (
                      <div className="text-xs text-center font-medium bg-base-200 rounded p-2">
                        Schedule: {currentSchedule.name}
                      </div>
                    ) : (
                      <div className="text-xs text-center text-gray-500 bg-base-200 rounded p-2">
                        No schedule saved yet
                      </div>
                    )}

                    <div className="space-y-2">
                      <button
                        // --- IMPORTANT: Use the new wrapper function here ---
                        onClick={handleRunScheduleAndSwitchTab}
                        className="btn btn-success w-full btn-sm"
                        disabled={
                          isScheduleRunning ||
                          jobs.length === 0 ||
                          !currentSchedule // Need a current schedule to run
                        }
                      >
                        <Play className="w-4 h-4 mr-2" />
                        {isScheduleRunning ? "Running..." : "Run Schedule"}
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <button
                      onClick={backToEditingMode}
                      className="btn btn-info w-full btn-sm"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Editing
                    </button>

                    {currentResult && (
                      <div className="card bg-base-200 mt-3">
                        <div className="card-body p-3">
                          <h3 className="card-title text-sm mb-3">
                            Latest Results
                          </h3>

                          <div className="mb-3">
                            <div className="text-xs font-semibold text-gray-600 mb-1">
                              Algorithm
                            </div>
                            <div className="text-sm bg-base-100 rounded px-2 py-1">
                              {currentResult?.algorithm_used || "N/A"}
                            </div>
                          </div>

                          <div className="mb-3">
                            <div className="text-xs font-semibold text-gray-600 mb-1">
                              Colored Jobs
                            </div>
                            <div className="text-sm bg-base-100 rounded px-2 py-1">
                              {currentResult?.fully_colored_jobs?.length || 0} /{" "}
                              {jobs.length}
                            </div>
                          </div>

                          <div className="grid grid-cols-3 gap-2">
                            <div className="text-center">
                              <div className="text-xs font-semibold text-gray-600">
                                F1
                              </div>
                              <div className="text-sm text-black bg-white rounded px-2 py-1">
                                {currentResult?.f1 !== undefined
                                  ? currentResult.f1
                                  : "N/A"}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs font-semibold text-gray-600">
                                F2
                              </div>
                              <div className="text-sm text-black bg-white rounded px-2 py-1">
                                {currentResult?.f2 !== undefined
                                  ? currentResult.f2
                                  : "N/A"}
                              </div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs font-semibold text-gray-600">
                                F3
                              </div>
                              <div className="text-sm text-black bg-white rounded px-2 py-1">
                                {currentResult?.f3 !== undefined
                                  ? currentResult.f3
                                  : "N/A"}
                              </div>
                            </div>
                          </div>

                          <div className="mt-3 text-xs text-gray-500 text-center">
                            {currentResult?.timestamp &&
                              new Date(
                                currentResult.timestamp
                              ).toLocaleString()}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Instructions Modal */}
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
