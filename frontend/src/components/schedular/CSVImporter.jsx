import React, { useState, useRef } from "react";
import Papa from "papaparse";
import toast from "react-hot-toast";
import { X, Upload, FileText, Download, Eye, AlertCircle } from "lucide-react";

export default function CSVImporter({
  scheduleParams,
  currentSchedule,
  isViewingResultMode,
  handleCreateScheduleFromCSV,
}) {
  const [csvFile, setCsvFile] = useState(null);
  const [csvData, setCsvData] = useState(null);
  const [csvError, setCsvError] = useState("");
  const [showCsvPreview, setShowCsvPreview] = useState(false);
  const [isProcessingCSV, setIsProcessingCSV] = useState(false);
  const fileInputRef = useRef(null);

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

  const validateCSVData = (data) => {
    if (!data || data.length === 0) {
      return { isValid: false, error: "CSV file is empty." };
    }

    const requiredJobColumns = ["name", "gain", "processing_time"];
    const firstRow = data[0];

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
    const jobNameToId = new Map();

    // First pass: create jobs and map names to IDs
    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      if (!row.name || typeof row.name !== "string" || !row.name.trim()) {
        return {
          isValid: false,
          error: `Row ${
            i + 1
          }: Job name is required and must be a non-empty string.`,
        };
      }

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

      const jobId = `job_${Date.now()}_${i}`;
      const job = {
        _id: jobId,
        name: jobName,
        gain: row.gain,
        processing_time: row.processing_time,
        position: {
          x: 100 + (i % 5) * 200,
          y: 100 + Math.floor(i / 5) * 150,
        },
      };

      processedJobs.push(job);
      jobNameToId.set(jobName.toLowerCase(), jobId);
    }

    // Second pass: process conflicts
    for (let i = 0; i < data.length; i++) {
      const row = data[i];

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

          const conflictId = `conflict_${Date.now()}_${i}`;

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

      const scheduleDataToSave = {
        name: scheduleParams.name,
        l: scheduleParams.l,
        D: scheduleParams.D,
        jobs: csvData.jobs,
        conflicts: csvData.conflicts,
      };

      await handleCreateScheduleFromCSV(scheduleDataToSave);

      resetCSV();
      setIsProcessingCSV(false);
      toast.success("Schedule created successfully from CSV!");
    } catch (error) {
      setIsProcessingCSV(false);
      const errorMessage = error.message || "An unexpected error occurred.";
      setCsvError(`Failed to create schedule: ${errorMessage}`);
      toast.error(`Failed to create schedule: ${errorMessage}`);
    }
  };

  const resetCSV = () => {
    setCsvFile(null);
    setCsvData(null);
    setShowCsvPreview(false);
    setCsvError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const downloadCSVTemplate = () => {
    const csvContent = `name,gain,processing_time,job1,job2
Job A,10,2,Job C,
Job B,8,3,,
Job C,12,1,Job A,
Job D,5,4,Job E,
Job E,9,2,,
Job F,15,6,Job G,Job H
Job G,7,3,,
Job H,11,5,,`;

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
    <div className="space-y-3">
      <div className="flex gap-2">
        <button
          onClick={downloadCSVTemplate}
          className="btn btn-outline btn-info btn-xs flex-shrink-0"
          title="Download CSV Template"
          disabled={isProcessingCSV || isViewingResultMode}
        >
          <Download className="w-3 h-3" />
        </button>
        <div className="flex-1 min-w-0">
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileSelect}
            className="file-input file-input-bordered file-input-xs w-full text-xs"
            disabled={isViewingResultMode || isProcessingCSV}
          />
        </div>
      </div>

      {csvFile && (
        <div className="bg-base-200 rounded p-2 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center min-w-0 flex-1">
              <FileText className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="truncate" title={csvFile.name}>
                {csvFile.name}
              </span>
            </div>
            <button
              onClick={resetCSV}
              className="btn btn-ghost btn-xs ml-2 flex-shrink-0"
              title="Remove file"
              disabled={isProcessingCSV}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {csvFile && !csvData && !csvError && (
        <button
          onClick={parseCSV}
          className="btn btn-primary btn-xs w-full"
          disabled={isProcessingCSV || isViewingResultMode}
        >
          <Eye className="w-3 h-3 mr-1" />
          {isProcessingCSV ? "Processing..." : "Preview CSV"}
        </button>
      )}

      {csvError && (
        <div className="alert alert-error py-1 px-2">
          <AlertCircle className="w-3 h-3 flex-shrink-0" />
          <span className="text-xs leading-tight">{csvError}</span>
        </div>
      )}

      {showCsvPreview && csvData && (
        <div className="bg-base-200 rounded p-2 space-y-2">
          <div className="text-xs font-semibold">CSV Preview:</div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div>Jobs: {csvData.totalJobs}</div>
            <div>Conflicts: {csvData.totalConflicts}</div>
            <div className="col-span-2">
              Total Gain: {csvData.jobs.reduce((sum, job) => sum + job.gain, 0)}
            </div>
          </div>
          <div className="space-y-1">
            <button
              onClick={handleCreateFromCSV}
              className="btn btn-success btn-xs w-full"
              disabled={
                isProcessingCSV ||
                !scheduleParams.name.trim() ||
                isViewingResultMode ||
                !!currentSchedule
              }
            >
              <Upload className="w-3 h-3 mr-1" />
              {isProcessingCSV ? "Creating..." : "Create from CSV"}
            </button>
            <button
              onClick={() => setShowCsvPreview(false)}
              className="btn btn-ghost btn-xs w-full"
              disabled={isProcessingCSV}
            >
              Hide Preview
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
