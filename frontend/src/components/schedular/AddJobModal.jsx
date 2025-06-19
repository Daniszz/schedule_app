import React from "react";

export default function AddJobModal({
  newJob,
  setNewJob,
  isJobCreating,
  addNewJob,
  setIsAddingJob,
}) {
  return (
    <div className="modal modal-open">
      <div className="modal-box">
        <h3 className="font-bold text-lg">Add New Job</h3>
        <div className="py-4 space-y-4">
          <div className="form-control">
            <label className="label">
              <span className="label-text">Job Name</span>
            </label>
            <input
              type="text"
              value={newJob.name}
              onChange={(e) => setNewJob({ ...newJob, name: e.target.value })}
              placeholder="Enter job name"
              className="input input-bordered"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Gain</span>
            </label>
            <input
              type="number"
              value={newJob.gain}
              onChange={(e) =>
                setNewJob({ ...newJob, gain: Number(e.target.value) })
              }
              placeholder="Enter gain value"
              className="input input-bordered"
            />
          </div>
          <div className="form-control">
            <label className="label">
              <span className="label-text">Processing Time</span>
            </label>
            <input
              type="number"
              min="1"
              value={newJob.processing_time}
              onChange={(e) =>
                setNewJob({
                  ...newJob,
                  processing_time: Number(e.target.value),
                })
              }
              placeholder="Enter processing time"
              className="input input-bordered"
            />
          </div>
        </div>
        <div className="modal-action">
          <button
            onClick={addNewJob}
            className="btn btn-primary"
            disabled={isJobCreating}
          >
            {isJobCreating ? "Creating..." : "Add Job"}
          </button>
          <button onClick={() => setIsAddingJob(false)} className="btn">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
