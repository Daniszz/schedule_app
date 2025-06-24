import React from "react";

export default function ScheduleParams({
  scheduleParams,
  setScheduleParams,
  currentSchedule,
  isViewingResultMode,
  isProcessingCSV,
}) {
  return (
    <div className="space-y-3">
      {/* Status indicator */}
      {currentSchedule ? (
        <div className="text-xs text-center font-medium bg-primary/10 text-primary rounded p-2">
          Editing: {currentSchedule.name}
        </div>
      ) : (
        <div className="text-xs text-center text-base-content/60 bg-base-200 rounded p-2">
          No schedule selected
        </div>
      )}

      {/* Schedule name */}
      <div className="form-control">
        <label className="label py-1">
          <span className="label-text text-xs font-medium">Schedule Name</span>
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
          className="input input-bordered input-sm text-sm"
          disabled={isViewingResultMode || isProcessingCSV}
        />
      </div>

      {/* Parameters grid */}
      <div className="grid grid-cols-2 gap-2">
        <div className="form-control">
          <label className="label py-1">
            <span className="label-text text-xs font-medium">
              Resources (L)
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
            placeholder="L"
            className="input input-bordered input-sm text-sm"
            disabled={isViewingResultMode || isProcessingCSV}
          />
        </div>
        <div className="form-control">
          <label className="label py-1">
            <span className="label-text text-xs font-medium">Deadline (D)</span>
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
            placeholder="D"
            className="input input-bordered input-sm text-sm"
            disabled={isViewingResultMode || isProcessingCSV}
          />
        </div>
      </div>
    </div>
  );
}
