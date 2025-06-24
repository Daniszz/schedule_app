import React from "react";
import { Play, ArrowLeft } from "lucide-react";

export default function ExecutionTab({
  currentSchedule,
  currentResult,
  jobs,
  isScheduleRunning,
  isViewingResultMode,
  handleRunSchedule,
  backToEditingMode,
}) {
  if (isViewingResultMode) {
    return (
      <div className="space-y-3">
        <button
          onClick={backToEditingMode}
          className="btn btn-info w-full btn-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Editing
        </button>

        {currentResult && (
          <div className="card bg-base-200">
            <div className="card-body p-3">
              <h3 className="card-title text-sm mb-3">Latest Results</h3>

              <div className="space-y-2">
                <div>
                  <div className="text-xs font-semibold text-base-content/60 mb-1">
                    Algorithm
                  </div>
                  <div className="text-sm bg-base-100 rounded px-2 py-1">
                    {currentResult?.algorithm_used || "N/A"}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-base-content/60 mb-1">
                    Colored Jobs
                  </div>
                  <div className="text-sm bg-base-100 rounded px-2 py-1">
                    {currentResult?.fully_colored_jobs?.length || 0} /{" "}
                    {jobs.length}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {["f1", "f2", "f3"].map((f, index) => (
                    <div key={f} className="text-center">
                      <div className="text-xs font-semibold text-base-content/60">
                        {f.toUpperCase()}
                      </div>
                      <div className="text-sm text-base-content bg-base-100 rounded px-2 py-1">
                        {currentResult?.[f] !== undefined
                          ? currentResult[f]
                          : "N/A"}
                      </div>
                    </div>
                  ))}
                </div>

                {currentResult?.timestamp && (
                  <div className="text-xs text-base-content/60 text-center mt-2">
                    {new Date(currentResult.timestamp).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {currentSchedule ? (
        <div className="text-xs text-center font-medium bg-primary/10 text-primary rounded p-2">
          Schedule: {currentSchedule.name}
        </div>
      ) : (
        <div className="text-xs text-center text-base-content/60 bg-base-200 rounded p-2">
          No schedule saved yet
        </div>
      )}

      <button
        onClick={handleRunSchedule}
        className="btn btn-success w-full btn-sm"
        disabled={isScheduleRunning || jobs.length === 0 || !currentSchedule}
      >
        <Play className="w-4 h-4 mr-2" />
        {isScheduleRunning ? "Running..." : "Run Schedule"}
      </button>
    </div>
  );
}
