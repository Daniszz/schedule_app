import React, { useCallback } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from "reactflow";
import JobNode from "./JobNode";
import { useSchedulerLogic } from "../../hooks/useSchedulerLogic";
import ControlPanel from "./ControlPanel";
import AddJobModal from "./AddJobModal";
import LoadingSpinner from "../ui/LoadingSpinner";

export default function SchedulerFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const {
    newJob,
    setNewJob,
    isAddingJob,
    setIsAddingJob,
    scheduleParams,
    setScheduleParams,
    isCreatingSchedule,
    isViewingResultMode,
    setIsViewingResultMode,
    jobs,
    conflicts,
    currentSchedule,
    scheduleResults,
    currentResult,
    isScheduleRunning,
    isScheduleUpdating,
    onConnect: handleConnectLogic,
    handleNodeDragStop: handleNodeDragStopLogic,
    addNewJob: addNewJobLogic,
    handleCreateSchedule,
    handleUpdateSchedule,
    handleSaveAsNew,
    handleRunSchedule,
    handleEdgesDelete: onDeleteEdgesLogic,
    handleNodesDelete: onDeleteNodesLogic,
    clearAll,
    backToEditingMode,
    getTotalGain,
    getTotalProcessingTime,
    handleUpdateJobNodeData,
    handleDeleteJobNode,
    handleCreateScheduleFromCSV,
  } = useSchedulerLogic({ setNodes, setEdges, nodes, edges });

  // Define nodeTypes mapping here, passing custom props to JobNode
  const nodeTypes = React.useMemo(
    () => ({
      jobNode: (nodeProps) => (
        <JobNode
          {...nodeProps}
          onUpdateJob={handleUpdateJobNodeData}
          onDeleteJob={handleDeleteJobNode}
          isScheduleUpdating={isScheduleUpdating}
          isViewingResultMode={isViewingResultMode} // Ensure this is passed
        />
      ),
    }),
    [
      handleUpdateJobNodeData,
      handleDeleteJobNode,
      isScheduleUpdating,
      isViewingResultMode, // Important: re-memoize if this changes
    ]
  );

  // --- React Flow Callback Wrappers ---
  // These wrappers apply changes to React Flow's internal state (via onNodesChange/onEdgesChange)
  // but only if not in result viewing mode and a schedule is selected.
  // The logic in useSchedulerLogic then manages *persisting* these changes.

  const handleNodesChange = useCallback(
    (changes) => {
      if (!isViewingResultMode && currentSchedule) {
        onNodesChange(changes); // Apply changes to React Flow's internal state
      } else if (!currentSchedule) {
        console.warn("Cannot change nodes: No schedule selected.");
      } else {
        // No need to log this if interactive={false} is set globally,
        // as the user won't be able to initiate these changes.
        // console.warn("Cannot change nodes in result viewing mode.");
      }
    },
    [onNodesChange, isViewingResultMode, currentSchedule]
  );

  const handleEdgesChange = useCallback(
    (changes) => {
      if (!isViewingResultMode && currentSchedule) {
        onEdgesChange(changes); // Apply changes to React Flow's internal state
      } else if (!currentSchedule) {
        console.warn("Cannot change edges: No schedule selected.");
      } else {
        // No need to log this if interactive={false} is set globally.
        // console.warn("Cannot change edges in result viewing mode.");
      }
    },
    [onEdgesChange, isViewingResultMode, currentSchedule]
  );

  // Consolidated loading check for the entire component
  if (isScheduleUpdating || isCreatingSchedule || isScheduleRunning) {
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
        isScheduleCreating={isCreatingSchedule}
        isScheduleUpdating={isScheduleUpdating}
        handleCreateSchedule={handleCreateSchedule}
        handleUpdateSchedule={handleUpdateSchedule}
        handleSaveAsNew={handleSaveAsNew}
        setIsAddingJob={setIsAddingJob}
        handleRunSchedule={handleRunSchedule}
        clearAll={clearAll}
        isJobCreating={isScheduleUpdating}
        isViewingResultMode={isViewingResultMode} // Make sure this is passed to ControlPanel
        backToEditingMode={backToEditingMode}
        handleCreateScheduleFromCSV={handleCreateScheduleFromCSV}
      />

      {/* Add Job Modal - Ensure this is conditionally rendered/disabled */}
      {isAddingJob &&
        !isViewingResultMode && ( // <-- Add !isViewingResultMode here
          <AddJobModal
            newJob={newJob}
            setNewJob={setNewJob}
            isJobCreating={isScheduleUpdating}
            addNewJob={addNewJobLogic}
            setIsAddingJob={setIsAddingJob}
          />
        )}

      {/* React Flow */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onEdgesDelete={onDeleteEdgesLogic}
        onNodesDelete={onDeleteNodesLogic}
        onConnect={handleConnectLogic}
        onNodeDragStop={handleNodeDragStopLogic}
        nodeTypes={nodeTypes}
        fitView
        snapToGrid={true}
        snapGrid={[15, 15]}
        defaultEdgeOptions={{
          style: { strokeWidth: 2 },
          markerEnd: { type: "arrowclosed" },
        }}
        // --- CORRECTED CRITICAL CHANGES HERE ---
        nodesDraggable={!isViewingResultMode && !!currentSchedule}
        nodesConnectable={!isViewingResultMode && !!currentSchedule}
        elementsSelectable={!isViewingResultMode && !!currentSchedule}
        panOnDrag={!isViewingResultMode && !!currentSchedule}
        zoomOnScroll={true}
        zoomOnPinch={true}
        zoomOnDoubleClick={true}
      >
        <Controls />
        <MiniMap
          nodeColor={(node) => {
            if (node.type === "jobNode" && node.data.nodeColor) {
              return node.data.nodeColor;
            }
            if (node.type === "jobNode") return "#3b82f6";
            return "#6b7280";
          }}
        />
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
