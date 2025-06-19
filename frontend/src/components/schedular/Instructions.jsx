import React from "react";

export default function Instructions() {
  return (
    <div className="card bg-base-100 shadow-xl w-80">
      <div className="card-body">
        <h3 className="card-title text-sm">Instructions</h3>
        <div className="text-xs text-base-content/70 space-y-1">
          <p>• Click "Add Job" to create new job nodes</p>
          <p>• Drag nodes to reposition them</p>
          <p>• Connect nodes by dragging from one handle to another</p>
          <p>• Edit jobs by clicking the edit icon</p>
          <p>• Red edges represent conflicts between jobs</p>
          <p>• Create schedule with L and D parameters</p>
        </div>
      </div>
    </div>
  );
}
