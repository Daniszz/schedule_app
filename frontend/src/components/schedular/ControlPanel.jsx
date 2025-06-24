import React, { useState, useEffect, useRef } from "react";
import Instructions from "./Instructions";
import Papa from "papaparse";
import toast from "react-hot-toast"; // <-- Asigură-te că toast este importat direct
import {
  Play,
  X,
  HelpCircle,
  Save,
  Edit,
  Plus,
  ArrowLeft,
  Upload,
  FileText,
  Download,
  Eye,
  AlertCircle,
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
  handleCreateScheduleFromCSV, // Această funcție va fi apelată din ControlPanel
}) {
  const [showInstructions, setShowInstructions] = useState(false);
  const [activeTab, setActiveTab] = useState("setup");
  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState(null);
  const [csvError, setCsvError] = useState("");
  const [showCsvPreview, setShowCsvPreview] = useState(false);
  const [isProcessingCSV, setIsProcessingCSV] = useState(false);
  const fileInputRef = useRef(null);

  // Effect to force "Setup" tab if no current schedule and not viewing results
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

  // Funcția pentru procesarea fișierului CSV
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith(".csv")) {
      setCsvError("Please select a CSV file.");
      return;
    }

    setCsvFile(file);
    setCsvError("");
    setCsvData(null);
    setShowCsvPreview(false);
  };

  // Funcția pentru parsarea CSV-ului
  const parseCSV = () => {
    if (!csvFile) return;

    setIsProcessingCSV(true);
    setCsvError("");

    Papa.parse(csvFile, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: true,
      transformHeader: (header) =>
        header.trim().toLowerCase().replace(/\s+/g, "_"),
      complete: (results) => {
        setIsProcessingCSV(false);

        if (results.errors.length > 0) {
          setCsvError(
            `CSV parsing errors: ${results.errors
              .map((e) => e.message)
              .join(", ")}`
          );
          return;
        }

        const validationResult = validateCSVData(results.data);
        if (validationResult.isValid) {
          setCsvData(validationResult.processedData);
          setShowCsvPreview(true);
        } else {
          setCsvError(validationResult.error);
        }
      },
      error: (error) => {
        setIsProcessingCSV(false);
        setCsvError(`Failed to parse CSV: ${error.message}`);
      },
    });
  };

  // Funcția pentru validarea datelor CSV
  const validateCSVData = (data) => {
    if (!data || data.length === 0) {
      return { isValid: false, error: "CSV file is empty." };
    }

    const requiredJobColumns = ["name", "gain", "processing_time"];
    const firstRow = data[0];

    // Verifică dacă există coloanele necesare pentru job-uri
    const missingJobColumns = requiredJobColumns.filter(
      (col) => !(col in firstRow)
    );

    if (missingJobColumns.length > 0) {
      return {
        isValid: false,
        error: `Missing required columns: ${missingJobColumns.join(
          ", "
        )}. Required: name, gain, processing_time. Optional: job1, job2 (for conflicts).`,
      };
    }

    const processedJobs = [];
    const processedConflicts = [];
    const jobNameToId = new Map(); // Store names to IDs for job-job conflicts

    // First pass: create jobs and map names to IDs
    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      // Validate job data
      if (!row.name || typeof row.name !== "string" || !row.name.trim()) {
        return {
          isValid: false,
          error: `Row ${
            i + 1
          }: Job name is required and must be a non-empty string.`,
        };
      }

      // Check for job name uniqueness (case-insensitive)
      const jobName = row.name.trim();
      if (jobNameToId.has(jobName.toLowerCase())) {
        return {
          isValid: false,
          error: `Row ${
            i + 1
          }: Duplicate job name '${jobName}'. Job names must be unique.`,
        };
      }

      if (typeof row.gain !== "number" || row.gain < 0) {
        return {
          isValid: false,
          error: `Row ${i + 1}: Gain must be a non-negative number (got: ${
            row.gain
          }).`,
        };
      }

      if (typeof row.processing_time !== "number" || row.processing_time <= 0) {
        return {
          isValid: false,
          error: `Row ${
            i + 1
          }: Processing time must be a positive number (got: ${
            row.processing_time
          }).`,
        };
      }

      const jobId = `job_${Date.now()}_${i}`; // Unique string ID
      const job = {
        _id: jobId,
        name: jobName,
        gain: row.gain,
        processing_time: row.processing_time,
        position: {
          x: 100 + (i % 5) * 200, // Distribute jobs in a grid
          y: 100 + Math.floor(i / 5) * 150,
        },
      };

      processedJobs.push(job);
      jobNameToId.set(jobName.toLowerCase(), jobId);
    }

    // Second pass: process conflicts using the mapped job IDs
    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      // Check for conflict columns 'job1' and 'job2'
      if (row.job1 && row.job2) {
        const job1Name = String(row.job1).trim();
        const job2Name = String(row.job2).trim();

        if (
          job1Name &&
          job2Name &&
          job1Name.toLowerCase() !== job2Name.toLowerCase()
        ) {
          const job1Id = jobNameToId.get(job1Name.toLowerCase());
          const job2Id = jobNameToId.get(job2Name.toLowerCase());

          if (!job1Id) {
            return {
              isValid: false,
              error: `Row ${
                i + 1
              }: Job '${job1Name}' specified in 'job1' column not found in 'name' column.`,
            };
          }
          if (!job2Id) {
            return {
              isValid: false,
              error: `Row ${
                i + 1
              }: Job '${job2Name}' specified in 'job2' column not found in 'name' column.`,
            };
          }

          const conflictId = `conflict_${Date.now()}_${i}`; // Unique string ID for conflict

          // Avoid duplicate conflicts (check both directions)
          const isDuplicate = processedConflicts.some(
            (c) =>
              (c.job1 === job1Id && c.job2 === job2Id) ||
              (c.job1 === job2Id && c.job2 === job1Id)
          );

          if (!isDuplicate) {
            processedConflicts.push({
              _id: conflictId,
              job1: job1Id,
              job2: job2Id,
            });
          }
        }
      }
    }

    return {
      isValid: true,
      processedData: {
        jobs: processedJobs,
        conflicts: processedConflicts,
        totalRows: data.length,
        totalJobs: processedJobs.length,
        totalConflicts: processedConflicts.length,
      },
    };
  };

  // Funcția pentru crearea schedule-ului din CSV
  const handleCreateFromCSV = async () => {
    if (!csvData || !scheduleParams.name.trim()) {
      toast.error(
        "Please provide a schedule name and valid CSV data to create."
      );
      return;
    }
    if (currentSchedule) {
      toast.error(
        "Please clear the current schedule or save as new before creating from CSV."
      );
      return;
    }

    try {
      setIsProcessingCSV(true);

      // Pregătește datele complete pentru schema ta MongoDB
      const scheduleDataToSave = {
        name: scheduleParams.name,
        l: scheduleParams.l,
        D: scheduleParams.D,
        jobs: csvData.jobs,
        conflicts: csvData.conflicts,
      };

      // Apelează funcția din parent (SchedulerFlow) pentru a crea schedule-ul în bază de date
      await handleCreateScheduleFromCSV(scheduleDataToSave);

      // Reset state after success
      setCsvFile(null);
      setCsvData(null);
      setShowCsvPreview(false);
      setCsvError("");
      if (fileInputRef.current) {
        fileInputRef.current.value = ""; // Clear file input field
      }
      setIsProcessingCSV(false);
      toast.success("Schedule created successfully from CSV!");
    } catch (error) {
      setIsProcessingCSV(false);
      const errorMessage = error.message || "An unexpected error occurred.";
      setCsvError(`Failed to create schedule: ${errorMessage}`);
      toast.error(`Failed to create schedule: ${errorMessage}`);
    }
  };

  // Funcția pentru resetarea CSV
  const resetCSV = () => {
    setCsvFile(null);
    setCsvData(null);
    setShowCsvPreview(false);
    setCsvError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Funcția pentru descărcarea template-ului CSV
  const downloadCSVTemplate = () => {
    const csvContent = `name,gain,processing_time,job1,job2
Job A,10,2,Job C,
Job B,8,3,,
Job C,12,1,Job A,
Job D,5,4,Job E,
Job E,9,2,,
Job F,15,6,Job G,
Job F,15,6,Job H,
Job G,7,3,,
Job H,11,5,,`; // Updated example with empty job2 for single conflicts

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "schedule_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

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

            {/* Stats Overview */}
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
            {activeTab === "setup" && (
              <div className="space-y-3">
                <h3 className="text-sm font-semibold">Schedule Parameters</h3>

                {/* Info despre schedule-ul curent */}
                {currentSchedule ? (
                  <div className="text-xs text-center font-medium bg-base-200 rounded p-2">
                    Editing: {currentSchedule.name}
                  </div>
                ) : (
                  <div className="text-xs text-center text-gray-500 bg-base-200 rounded p-2">
                    No schedule selected. Create a new one or load from CSV.
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
                    disabled={isViewingResultMode || isProcessingCSV} // Disable during CSV processing
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-xs">
                        Shared Resources (L)
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
                      disabled={isViewingResultMode || isProcessingCSV} // Disable during CSV processing
                    />
                  </div>
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-xs">Deadline (D)</span>
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
                      disabled={isViewingResultMode || isProcessingCSV} // Disable during CSV processing
                    />
                  </div>
                </div>

                {/* CSV Upload Section - Vizual fixat aici */}
                <div className="divider text-xs">CSV Import</div>

                <div className="space-y-2">
                  <div className="flex gap-2 items-center">
                    <button
                      onClick={downloadCSVTemplate}
                      className="btn btn-outline btn-info btn-sm flex-shrink-0"
                      title="Download CSV Template"
                      disabled={isProcessingCSV || isViewingResultMode}
                    >
                      <Download className="w-3 h-3 mr-1" />
                      Template
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".csv"
                      onChange={handleFileSelect}
                      className="file-input file-input-bordered file-input-sm w-full"
                      disabled={isViewingResultMode || isProcessingCSV}
                    />
                  </div>

                  {csvFile && (
                    <div className="bg-base-200 rounded p-2 text-xs flex items-center justify-between">
                      <span className="flex items-center">
                        <FileText className="w-3 h-3 mr-1" />
                        {csvFile.name}
                      </span>
                      <button
                        onClick={resetCSV}
                        className="btn btn-ghost btn-xs"
                        title="Remove file"
                        disabled={isProcessingCSV}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {csvFile && !csvData && !csvError && (
                    <button
                      onClick={parseCSV}
                      className="btn btn-primary btn-sm w-full"
                      disabled={isProcessingCSV || isViewingResultMode} // Disable if viewing results
                    >
                      <Eye className="w-3 h-3 mr-1" />
                      {isProcessingCSV ? "Processing..." : "Preview CSV"}
                    </button>
                  )}

                  {csvError && (
                    <div className="alert alert-error py-2">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-xs">{csvError}</span>
                    </div>
                  )}

                  {showCsvPreview && csvData && (
                    <div className="bg-base-200 rounded p-2">
                      <div className="text-xs font-semibold mb-2">
                        CSV Preview:
                      </div>
                      <div className="text-xs space-y-1">
                        <div>• Jobs: {csvData.totalJobs}</div>
                        <div>• Conflicts: {csvData.totalConflicts}</div>
                        <div>
                          • Total Gain:{" "}
                          {csvData.jobs.reduce((sum, job) => sum + job.gain, 0)}
                        </div>
                      </div>
                      <div className="mt-2 space-y-1">
                        <button
                          onClick={handleCreateFromCSV}
                          className="btn btn-success btn-sm w-full"
                          disabled={
                            isProcessingCSV ||
                            !scheduleParams.name.trim() ||
                            isViewingResultMode ||
                            !!currentSchedule // Disable if a schedule is already selected
                          }
                        >
                          <Upload className="w-3 h-3 mr-1" />
                          {isProcessingCSV
                            ? "Creating..."
                            : "Create Schedule from CSV"}
                        </button>
                        <button
                          onClick={() => setShowCsvPreview(false)}
                          className="btn btn-ghost btn-sm w-full"
                          disabled={isProcessingCSV}
                        >
                          Hide Preview
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="divider text-xs">Manual Creation</div>

                {/* Schedule Action Buttons */}
                <div className="space-y-2">
                  {!currentSchedule ? (
                    <button
                      onClick={handleCreateSchedule}
                      className="btn btn-primary w-full btn-sm"
                      disabled={
                        isScheduleCreating ||
                        !scheduleParams?.name?.trim() ||
                        isViewingResultMode ||
                        !!csvFile // Disable if CSV is in progress
                      }
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {isScheduleCreating
                        ? "Creating..."
                        : "Create Empty Schedule"}
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={handleUpdateSchedule}
                        className="btn btn-primary w-full btn-sm"
                        disabled={
                          !isEditingEnabled ||
                          isScheduleCreating ||
                          !scheduleParams?.name?.trim()
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
                          isViewingResultMode
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
                        onClick={handleRunScheduleAndSwitchTab}
                        className="btn btn-success w-full btn-sm"
                        disabled={
                          isScheduleRunning ||
                          jobs.length === 0 ||
                          !currentSchedule
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
