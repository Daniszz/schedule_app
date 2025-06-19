import { useState, useCallback, useRef, useEffect } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  ReactFlowProvider,
  Handle,
  Position,
  useReactFlow,
} from "reactflow";
import "reactflow/dist/style.css";
import { useJobStore } from "../store/useJobStore";
import { useConflictStore } from "../store/useConflictStore";
import { useScheduleStore } from "../store/useScheduleStore";

function JobNode({ data, id }) {
  const { setNodes } = useReactFlow();
  const { updateJob, deleteJob, isJobUpdating, isJobDeleting } = useJobStore();
  const [editData, setEditData] = useState({
    name: data.name,
    gain: data.gain,
    processing_time: data.processing_time,
  });

  const handleSave = async () => {
    try {
      await updateJob(data._id, editData);
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === id
            ? {
                ...node,
                data: {
                  ...node.data,
                  name: editData.name,
                  gain: editData.gain,
                  processing_time: editData.processing_time,
                  isEditing: false,
                },
              }
            : node
        )
      );
    } catch (error) {
      console.error("Failed to save job:", error);
    }
  };
  const handleEdit = () => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, isEditing: true } }
          : node
      )
    );
  };
  const handleCancel = () => {
    setEditData({
      name: data.name,
      gain: data.gain,
      processing_time: data.processing_time,
    });
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, isEditing: false } }
          : node
      )
    );
  };
  const handleDelete = async () => {
    try {
      await deleteJob(data._id);
      setNodes((nodes) => nodes.filter((node) => node.id !== id));
    } catch (error) {
      console.error("Failed to delete job:", error);
    }
  };
  if (data.isEditing) {
    return (
      <div className="card bg-base-100 shadow-xl border-2 border-primary p-4 min-w-[200px]">
        <Handle type="target" position={Position.Top} />
        <div className="space-y-2">
          <input
            type="text"
            value={editData.name}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            placeholder="Job name"
            className="input input-bordered input-sm w-full"
          />
          <input
            type="number"
            value={editData.gain}
            onChange={(e) =>
              setEditData({ ...editData, gain: Number(e.target.value) })
            }
            placeholder="Gain"
            className="input input-bordered input-sm w-full"
          />
          <input
            type="number"
            value={editData.processing_time}
            onChange={(e) =>
              setEditData({
                ...editData,
                processing_time: Number(e.target.value),
              })
            }
            placeholder="Processing time"
            className="input input-bordered input-sm w-full"
          />
          <div className="flex gap-1">
            <button
              onClick={handleSave}
              className="btn btn-success btn-sm flex-1"
              disabled={isJobUpdating}
            >
              {isJobUpdating ? "..." : "✓"}
            </button>
            <button
              onClick={handleCancel}
              className="btn btn-outline btn-sm flex-1"
            >
              ✕
            </button>
          </div>
        </div>
        <Handle type="source" position={Position.Bottom} />
      </div>
    );
  }
  return (
    <div
      className="card shadow-lg hover:shadow-xl transition-all border-2 p-3 min-w-[180px]"
      style={{
        backgroundColor: data.nodeColor || "#ffffff",
        borderColor: data.nodeColor ? "#374151" : "#d1d5db",
        color: data.nodeColor ? "#ffffff" : "#000000",
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm truncate">{data.name}</h3>
          <div className="flex gap-1">
            <button
              onClick={handleEdit}
              className="btn btn-ghost btn-xs"
              style={{ color: data.nodeColor ? "#ffffff" : "#000000" }}
            >
              ✏️
            </button>
            <button
              onClick={handleDelete}
              className="btn btn-ghost btn-xs text-error"
              style={{ color: data.nodeColor ? "#ffffff" : "#ef4444" }}
              disabled={isJobDeleting}
            >
              {isJobDeleting ? "..." : "🗑️"}
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <div
            className="badge badge-sm"
            style={{
              backgroundColor: data.nodeColor
                ? "rgba(255,255,255,0.2)"
                : undefined,
              color: data.nodeColor ? "#ffffff" : undefined,
              borderColor: data.nodeColor ? "rgba(255,255,255,0.3)" : undefined,
            }}
          >
            Gain: {data.gain}
          </div>
          <div
            className="badge badge-outline badge-sm"
            style={{
              backgroundColor: data.nodeColor
                ? "rgba(255,255,255,0.2)"
                : undefined,
              color: data.nodeColor ? "#ffffff" : undefined,
              borderColor: data.nodeColor ? "rgba(255,255,255,0.3)" : undefined,
            }}
          >
            Time: {data.processing_time}
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
const nodeTypes = {
  jobNode: JobNode,
};

export default function JobScheduler() {
  return (
    <div className="w-full h-screen bg-base-200" data-theme="light">
      <ReactFlowProvider>
        <SchedulerFlow />
      </ReactFlowProvider>
    </div>
  );
}
function SchedulerFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [newJob, setNewJob] = useState({
    name: "",
    gain: 0,
    processing_time: 1,
  });
  const [isAddingJob, setIsAddingJob] = useState(false);
  const [scheduleParams, setScheduleParams] = useState({
    name: "",
    l: 1,
    D: 1,
  });
  const [isCreatingSchedule, setIsCreatingSchedule] = useState(false);

  const reactFlowInstance = useReactFlow();
  const nodeIdRef = useRef(1);

  // Zustand store hooks
  const { jobs, createJob, fetchJobs, isJobCreating, isJobLoading } =
    useJobStore();

  const {
    conflicts,
    createConflict,
    fetchConflicts,
    deleteConflict,
    isConflictCreating,
  } = useConflictStore();

  const {
    currentSchedule,
    runSchedule,
    createSchedule,
    isScheduleRunning,
    isScheduleCreating,
    scheduleResults,
    fetchScheduleResults,
  } = useScheduleStore();

  // Load data on mount
  useEffect(() => {
    fetchJobs();
    fetchConflicts();
  }, []);

  // Update nodes when jobs change
  useEffect(() => {
    const newNodes = jobs.map((job, index) => ({
      id: job._id,
      type: "jobNode",
      position: {
        x: (index % 3) * 200 + 100,
        y: Math.floor(index / 3) * 150 + 100,
      },
      data: {
        ...job,
        isEditing: false,
        nodeColor: currentSchedule?.color_map?.get?.(job._id)
          ? "#3b82f6"
          : null,
      },
    }));
    setNodes(newNodes);
    nodeIdRef.current = jobs.length + 1;
  }, [jobs, currentSchedule, setNodes]);

  // Update edges when conflicts change
  useEffect(() => {
    const newEdges = conflicts.map((conflict) => ({
      id: conflict._id,
      source: conflict.job1,
      target: conflict.job2,
      label: "Conflict",
      style: { stroke: "#ef4444" },
      data: { conflictId: conflict._id },
    }));
    setEdges(newEdges);
  }, [conflicts, setEdges]);

  const onConnect = useCallback(
    async (params) => {
      try {
        await createConflict(params.source, params.target);
      } catch (error) {
        console.error("Failed to create conflict:", error);
      }
    },
    [createConflict]
  );

  const addNewJob = async () => {
    if (!newJob.name.trim()) return;

    try {
      await createJob(newJob);
      setNewJob({ name: "", gain: 0, processing_time: 1 });
      setIsAddingJob(false);
    } catch (error) {
      console.error("Failed to create job:", error);
    }
  };

  const handleCreateSchedule = async () => {
    if (!scheduleParams.name.trim()) {
      toast.error("Please enter a schedule name");
      return;
    }

    if (jobs.length === 0) {
      toast.error("No jobs available to schedule");
      return;
    }

    try {
      const scheduleData = {
        name: scheduleParams.name,
        jobs: jobs.map((job) => job._id),
        conflicts: conflicts.map((conflict) => conflict._id),
        l: scheduleParams.l,
        D: scheduleParams.D,
      };

      const result = await createSchedule(scheduleData);
      toast.success("Schedule created successfully");
      setScheduleParams({ name: "", l: 1, D: 1 });
      setIsCreatingSchedule(false);
    } catch (error) {
      console.error("Failed to create schedule:", error);
    }
  };

  const handleRunSchedule = async () => {
    if (!currentSchedule) {
      toast.error("Please create a schedule first");
      return;
    }

    try {
      await runSchedule(currentSchedule._id);
    } catch (error) {
      console.error("Failed to run schedule:", error);
    }
  };

  const clearAll = async () => {
    // This would need backend implementation to delete all jobs and conflicts
    toast.info("Clear all functionality needs backend implementation");
  };

  const getTotalGain = () => {
    return jobs.reduce((total, job) => total + job.gain, 0);
  };

  const getTotalProcessingTime = () => {
    return jobs.reduce((total, job) => total + job.processing_time, 0);
  };

  if (isJobLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full">
      {/* Control Panel */}
      <div className="absolute top-4 left-4 z-10 space-y-4">
        <div className="card bg-base-100 shadow-xl w-80">
          <div className="card-body">
            <h2 className="card-title text-lg">Job Scheduler</h2>

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

            <div className="space-y-2">
              {!currentSchedule ? (
                <button
                  onClick={() => setIsCreatingSchedule(true)}
                  className="btn btn-primary w-full"
                  disabled={jobs.length === 0}
                >
                  📊 Create Schedule
                </button>
              ) : (
                <div className="space-y-2">
                  <div className="text-xs text-center font-medium">
                    Current: {currentSchedule.name}
                  </div>
                  <button
                    onClick={handleRunSchedule}
                    className="btn btn-success w-full"
                    disabled={isScheduleRunning}
                  >
                    {isScheduleRunning ? "Running..." : "▶️ Run Schedule"}
                  </button>
                  <button
                    onClick={() => setIsCreatingSchedule(true)}
                    className="btn btn-outline w-full"
                  >
                    📊 New Schedule
                  </button>
                </div>
              )}
            </div>

            {scheduleResults.length > 0 && (
              <div className="card bg-base-200 mt-4">
                <div className="card-body p-3">
                  <h3 className="card-title text-sm">Latest Results</h3>
                  <div className="space-y-2 text-xs">
                    <div>Algorithm: {scheduleResults[0]?.algorithm_used}</div>
                    <div>
                      Colored Jobs:{" "}
                      {scheduleResults[0]?.fully_colored_jobs?.length}
                    </div>
                    {scheduleResults[0]?.f1 && (
                      <div>F1: {scheduleResults[0].f1}</div>
                    )}
                    {scheduleResults[0]?.f2 && (
                      <div>F2: {scheduleResults[0].f2}</div>
                    )}
                    {scheduleResults[0]?.f3 && (
                      <div>F3: {scheduleResults[0].f3}</div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <button
                onClick={() => setIsAddingJob(true)}
                className="btn btn-success w-full"
                disabled={isJobCreating}
              >
                {isJobCreating ? "Creating..." : "+ Add Job"}
              </button>

              <button
                onClick={clearAll}
                className="btn btn-error btn-outline w-full"
              >
                🗑️ Clear All
              </button>
            </div>
          </div>
        </div>

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
      </div>

      {/* Add Job Modal */}
      {isAddingJob && (
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
                  onChange={(e) =>
                    setNewJob({ ...newJob, name: e.target.value })
                  }
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
      )}

      {/* Create Schedule Modal */}
      {isCreatingSchedule && (
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
              <button
                onClick={() => setIsCreatingSchedule(false)}
                className="btn"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* React Flow */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid={true}
        snapGrid={[15, 15]}
        defaultEdgeOptions={{
          style: { strokeWidth: 2 },
          markerEnd: { type: "arrowclosed" },
        }}
      >
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === "jobNode") return "#3b82f6";
            return "#6b7280";
          }}
        />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
