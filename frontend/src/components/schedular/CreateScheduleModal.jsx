import React from "react";

export default function CreateScheduleModal({
  scheduleParams,
  setScheduleParams,
  jobs,
  conflicts,
  isScheduleCreating,
  handleCreateSchedule,
  setIsCreatingSchedule,
}) {
  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Create Schedule</h3>
        <div className="py-4 space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Schedule Name</span>
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
              className="input input-bordered"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Parameter L</span>
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
                className="input input-bordered"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Parameter D</span>
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
                className="input input-bordered"
              />
            </div>
          </div>
          <div className="text-sm text-base-content/70">
            <p>Jobs: {jobs.length}</p>
            <p>Conflicts: {conflicts.length}</p>
          </div>
        </div>
        <div className="modal-action">
          <button
            onClick={handleCreateSchedule}
            className="btn btn-primary"
            disabled={isScheduleCreating}
          >
            {isScheduleCreating ? "Creating..." : "Create Schedule"}
          </button>
          <button onClick={() => setIsCreatingSchedule(false)} className="btn">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
