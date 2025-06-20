import React from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from "reactflow";
import { nodeTypes } from "../../constants/nodeTypes";
import { useSchedulerLogic } from "../../hooks/useSchedulerLogic";
import ControlPanel from "./ControlPanel";
import AddJobModal from "./AddJobModal";
import LoadingSpinner from "../ui/LoadingSpinner";

export default function SchedulerFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const {
    // State
    newJob,
    setNewJob,
    isAddingJob,
    setIsAddingJob,
    scheduleParams,
    setScheduleParams,
    isCreatingSchedule,
    setIsCreatingSchedule,
    // Store data
    jobs,
    conflicts,
    currentSchedule,
    scheduleResults,
    currentResult,
    // Loading states
    isJobLoading,
    isJobCreating,
    isScheduleCreating,
    isScheduleRunning,
    // Actions
    onConnect,
    handleNodeDragStop,
    addNewJob,
    handleCreateSchedule,
    handleUpdateSchedule,
    handleRunSchedule,
    handleEdgesDelete,
    clearAll,
    getTotalGain,
    getTotalProcessingTime,
  } = useSchedulerLogic({ setNodes, setEdges });

  if (isJobLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="relative w-full h-full">
      {/* Control Panel */}
      <ControlPanel
        jobs={jobs}
        conflicts={conflicts}
        currentSchedule={currentSchedule}
        scheduleResults={scheduleResults}
        isScheduleRunning={isScheduleRunning}
        getTotalGain={getTotalGain}
        getTotalProcessingTime={getTotalProcessingTime}
        currentResult={currentResult}
        scheduleParams={scheduleParams}
        setScheduleParams={setScheduleParams}
        isScheduleCreating={isScheduleCreating}
        handleCreateSchedule={handleCreateSchedule}
        handleUpdateSchedule={handleUpdateSchedule}
        setIsAddingJob={setIsAddingJob}
        handleRunSchedule={handleRunSchedule}
        clearAll={clearAll}
        isJobCreating={isJobCreating}
      />

      {/* Add Job Modal */}
      {isAddingJob && (
        <AddJobModal
          newJob={newJob}
          setNewJob={setNewJob}
          isJobCreating={isJobCreating}
          addNewJob={addNewJob}
          setIsAddingJob={setIsAddingJob}
        />
      )}

      {/* React Flow */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onEdgesDelete={handleEdgesDelete}
        onConnect={onConnect}
        onNodeDragStop={handleNodeDragStop}
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
