import React from "react";
import {
  PlusCircle,
  Grab,
  Link,
  Pencil,
  AlertCircle,
  Settings,
  SaveAll,
  PlayCircle,
  Download,
} from "lucide-react";

export default function Instructions() {
  return (
    // Removed fixed 'w-80' to allow the card to expand within the modal
    <div className="card bg-base-100 shadow-xl w-full">
      <div className="card-body">
        <h3 className="card-title text-sm mb-3">Quick Start Guide</h3>

        {/* New: Grid container for two columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 text-xs text-base-content/70">
          {/* Setup Phase */}
          <div className="flex items-start gap-3">
            <Settings size={16} className="text-info flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-base-content mb-0.5">
                Configure Schedule Parameters
              </p>
              <p>
                In the **Setup tab**, define your schedule's **Name**, set the
                number of **Shared Resources**, and specify the **Deadline**
                (planning horizon in hours).
              </p>
            </div>
          </div>

          {/* Job Creation */}
          <div className="flex items-start gap-3">
            <PlusCircle
              size={16}
              className="text-primary flex-shrink-0 mt-0.5"
            />
            <div>
              <p className="font-semibold text-base-content mb-0.5">
                Create & Manage Jobs
              </p>
              <p>
                Add jobs manually with **"+ Add Job"**, or import a full
                schedule using the **CSV Importer**. You can also **edit**
                individual job's gain, processing time, and name on the canvas.
              </p>
            </div>
          </div>

          {/* Canvas Interaction */}
          <div className="flex items-start gap-3">
            <Grab size={16} className="text-accent flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-base-content mb-0.5">
                Arrange & Connect Jobs
              </p>
              <p>
                Drag jobs to reposition them. **Connect two jobs** by dragging a
                handle to create a conflict (meaning they share a critical
                resource).
              </p>
            </div>
          </div>

          {/* Conflicts */}
          <div className="flex items-start gap-3">
            <AlertCircle
              size={16}
              className="text-error flex-shrink-0 mt-0.5"
            />
            <div>
              <p className="font-semibold text-base-content mb-0.5">
                Understand Conflicts
              </p>
              <p>
                **Red edges** between jobs visually highlight where conflicts
                exist, helping you identify shared critical resources.
              </p>
            </div>
          </div>

          {/* Saving */}
          <div className="flex items-start gap-3">
            <SaveAll size={16} className="text-success flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-base-content mb-0.5">
                Save & Manage Schedules
              </p>
              <p>
                Use **"Update"** to save changes to the current schedule,
                **"Save New"** to create a copy, or **"Clear"** to remove the
                current schedule (make sure to copy if needed!).
              </p>
            </div>
          </div>

          {/* Execution & Results */}
          <div className="flex items-start gap-3">
            <PlayCircle
              size={16}
              className="text-secondary flex-shrink-0 mt-0.5"
            />
            <div>
              <p className="font-semibold text-base-content mb-0.5">
                Run & Analyze
              </p>
              <p>
                Switch to the **Execution tab** to run the scheduling
                algorithms. View **stats (F1, F2, F3)** for gain, interruptions,
                and color range. Jobs on the canvas will also display their
                assigned colors.
              </p>
            </div>
          </div>

          {/* Download Result */}
          <div className="flex items-start gap-3">
            <Download size={16} className="text-warning flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-base-content mb-0.5">
                Save Results
              </p>
              <p>
                After running, you can **download a photo** of the resulting
                schedule for easy sharing or record-keeping.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
