import React, { useState, useEffect } from "react";
import CSVImporter from "./CSVImporter.jsx";
import ScheduleParams from "./ScheduleParams.jsx";
import StatsOverview from "./StatsOverview.jsx";
import ExecutionTab from "./ExecutionTab.jsx";
import Instructions from "./Instructions.jsx";
import {
  X,
  HelpCircle,
  Save,
  Edit,
  Plus,
  ChevronDown,
  ChevronUp,
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
  handleRunSchedule,
  setIsAddingJob,
  clearAll,
  isJobCreating,
  isViewingResultMode,
  backToEditingMode,
  handleCreateScheduleFromCSV,
}) {
  const [showInstructions, setShowInstructions] = useState(false);
  const [activeTab, setActiveTab] = useState("setup");
  const [isCollapsed, setIsCollapsed] = useState(false);

  useEffect(() => {
    if (!currentSchedule && !isViewingResultMode && activeTab === "execution") {
      setActiveTab("setup");
    }
    if (isViewingResultMode && activeTab !== "execution") {
      setActiveTab("execution");
    }
  }, [currentSchedule, activeTab, isViewingResultMode]);

  const isEditingEnabled = !isViewingResultMode && !!currentSchedule;

  const handleRunScheduleAndSwitchTab = () => {
    handleRunSchedule();
    setActiveTab("execution");
  };

  return (
    <>
      <div className="absolute -top-2 -left-2 z-10 scale-0.8">
        <div className="card bg-base-100 shadow-xl w-80">
          <div className="card-body p-4">
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
              <h2 className="card-title text-lg">Job Scheduler</h2>
              <div className="flex gap-1">
                <button
                  onClick={() => setIsCollapsed(!isCollapsed)}
                  className="btn btn-ghost btn-sm btn-circle"
                  title={isCollapsed ? "Expand" : "Collapse"}
                >
                  {isCollapsed ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronUp className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => setShowInstructions(true)}
                  className="btn btn-ghost btn-sm btn-circle"
                  title="Show Instructions"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Stats Overview - Always visible */}
            <StatsOverview
              jobs={jobs}
              conflicts={conflicts}
              getTotalGain={getTotalGain}
              getTotalProcessingTime={getTotalProcessingTime}
            />

            {/* Collapsible Content */}
            {!isCollapsed && (
              <>
                {/* Tabs */}
                <div className="tabs tabs-bordered border-t pt-3 mb-3">
                  <button
                    className={`tab tab-sm ${
                      activeTab === "setup" ? "tab-active" : ""
                    }`}
                    onClick={() => setActiveTab("setup")}
                    disabled={isViewingResultMode}
                  >
                    Setup
                  </button>
                  <button
                    className={`tab tab-sm ${
                      activeTab === "execution" ? "tab-active" : ""
                    }`}
                    onClick={() => setActiveTab("execution")}
                    disabled={!currentSchedule && !isViewingResultMode}
                  >
                    Execution
                  </button>
                </div>

                {/* Tab Content */}
                <div className="max-h-96 overflow-y-auto">
                  {activeTab === "setup" && (
                    <div className="space-y-4">
                      {/* Schedule Parameters */}
                      <ScheduleParams
                        scheduleParams={scheduleParams}
                        setScheduleParams={setScheduleParams}
                        currentSchedule={currentSchedule}
                        isViewingResultMode={isViewingResultMode}
                        isProcessingCSV={false}
                      />

                      {/* CSV Import */}
                      <div>
                        <div className="divider text-xs mb-2">CSV Import</div>
                        <CSVImporter
                          scheduleParams={scheduleParams}
                          currentSchedule={currentSchedule}
                          isViewingResultMode={isViewingResultMode}
                          handleCreateScheduleFromCSV={
                            handleCreateScheduleFromCSV
                          }
                        />
                      </div>

                      {/* Manual Creation */}
                      <div>
                        <div className="divider text-xs mb-2">
                          Manual Creation
                        </div>
                        <div className="space-y-2">
                          {!currentSchedule ? (
                            <button
                              onClick={handleCreateSchedule}
                              className="btn btn-primary w-full btn-sm"
                              disabled={
                                isScheduleCreating ||
                                !scheduleParams?.name?.trim() ||
                                isViewingResultMode
                              }
                            >
                              <Plus className="w-4 h-4 mr-2" />
                              {isScheduleCreating
                                ? "Creating..."
                                : "Create Empty Schedule"}
                            </button>
                          ) : (
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={handleUpdateSchedule}
                                className="btn btn-primary btn-sm"
                                disabled={
                                  !isEditingEnabled ||
                                  isScheduleCreating ||
                                  !scheduleParams?.name?.trim()
                                }
                              >
                                <Edit className="w-4 h-4 mr-1" />
                                {isScheduleCreating ? "Updating..." : "Update"}
                              </button>
                              <button
                                onClick={handleSaveAsNew}
                                className="btn btn-outline btn-primary btn-sm"
                                disabled={
                                  isScheduleCreating ||
                                  !scheduleParams?.name?.trim() ||
                                  isViewingResultMode
                                }
                              >
                                <Save className="w-4 h-4 mr-1" />
                                {isScheduleCreating ? "Saving..." : "Save New"}
                              </button>
                            </div>
                          )}

                          <button
                            onClick={() => setIsAddingJob(true)}
                            className="btn btn-success w-full btn-sm"
                            disabled={isJobCreating || !isEditingEnabled}
                          >
                            {isJobCreating ? "Creating..." : "+ Add Job"}
                          </button>

                          <button
                            onClick={clearAll}
                            className="btn btn-error btn-outline w-full btn-sm"
                            disabled={
                              (!currentSchedule && jobs.length === 0) ||
                              isViewingResultMode
                            }
                          >
                            <X className="w-4 h-4 mr-2" />
                            Clear Current Schedule
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === "execution" && (
                    <ExecutionTab
                      currentSchedule={currentSchedule}
                      currentResult={currentResult}
                      jobs={jobs}
                      isScheduleRunning={isScheduleRunning}
                      isViewingResultMode={isViewingResultMode}
                      handleRunSchedule={handleRunScheduleAndSwitchTab}
                      backToEditingMode={backToEditingMode}
                    />
                  )}
                </div>
              </>
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
