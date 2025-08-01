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

  const nodeTypes = React.useMemo(
    () => ({
      jobNode: (nodeProps) => (
        <JobNode
          {...nodeProps}
          onUpdateJob={handleUpdateJobNodeData}
          onDeleteJob={handleDeleteJobNode}
          isScheduleUpdating={isScheduleUpdating}
          isViewingResultMode={isViewingResultMode}
        />
      ),
    }),
    [
      handleUpdateJobNodeData,
      handleDeleteJobNode,
      isScheduleUpdating,
      isViewingResultMode,
    ]
  );

  const handleNodesChange = useCallback(
    (changes) => {
      if (!isViewingResultMode && currentSchedule) {
        onNodesChange(changes);
      } else if (!currentSchedule) {
        console.warn("Cannot change nodes: No schedule selected.");
      } else {
      }
    },
    [onNodesChange, isViewingResultMode, currentSchedule]
  );

  const handleEdgesChange = useCallback(
    (changes) => {
      if (!isViewingResultMode && currentSchedule) {
        onEdgesChange(changes);
      } else if (!currentSchedule) {
        console.warn("Cannot change edges: No schedule selected.");
      } else {
      }
    },
    [onEdgesChange, isViewingResultMode, currentSchedule]
  );

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
        isViewingResultMode={isViewingResultMode}
        backToEditingMode={backToEditingMode}
        handleCreateScheduleFromCSV={handleCreateScheduleFromCSV}
      />

      {isAddingJob && !isViewingResultMode && (
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
        nodesDraggable={!isViewingResultMode && !!currentSchedule}
        nodesConnectable={!isViewingResultMode && !!currentSchedule}
        elementsSelectable={!isViewingResultMode && !!currentSchedule}
        panOnDrag={true}
        zoomOnScroll={true}
        zoomOnPinch={true}
        zoomOnDoubleClick={true}
      >
        <div className="absolute  bottom-2 z-10" style={{ right: "160px" }}>
          <Controls
            className="!relative"
            style={{
              height: 100,
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          />
        </div>
        <div className="absolute right-1 bottom-2 z-10">
          <MiniMap
            nodeColor={(node) => {
              if (node.type === "jobNode" && node.data.nodeColor) {
                return node.data.nodeColor;
              }
              if (node.type === "jobNode") return "#3b82f6";
              return "#6b7280";
            }}
            style={{
              width: 140,
              height: 100,
              borderRadius: "4px",
              border: "1px solid #e2e8f0",
            }}
          />
        </div>
        <Background variant="dots" gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
