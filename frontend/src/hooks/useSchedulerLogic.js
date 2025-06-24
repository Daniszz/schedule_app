import { useState, useCallback, useRef, useEffect } from "react";
import { addEdge } from "reactflow";
import { useJobStore } from "../store/useJobStore";
import { useConflictStore } from "../store/useConflictStore";
import { useScheduleStore } from "../store/useScheduleStore";
import { useScheduleResultStore } from "../store/useScheduleResultStore";

import { v4 as uuidv4 } from "uuid";

export function useSchedulerLogic({ setNodes, setEdges, nodes, edges }) {
  // ... (restul state-ului tău, nicio modificare aici)
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
  const [isViewingResultMode, setIsViewingResultMode] = useState(false);

  // Zustand store hooks -
  const { isJobCreating, isJobLoading } = useJobStore();

  const {} = useConflictStore();

  const {
    currentSchedule,
    createSchedule,
    isScheduleCreating,
    updateSchedule,
    fetchSchedules,
    setCurrentSchedule,
    deleteSchedule,
  } = useScheduleStore();

  const {
    results: scheduleResults,
    isRunning: isScheduleRunning,
    runScheduleSchema,
    fetchResults,
    currentResult,
    setCurrentResult,
  } = useScheduleResultStore();

  // Load data on mount (doar schedules și rezultate)
  useEffect(() => {
    fetchSchedules();
    fetchResults();
  }, [fetchSchedules, fetchResults]);

  // Update nodes and edges when currentSchedule or currentResult change
  // This useEffect is crucial for loading initial state and after explicit saves
  useEffect(() => {
    if (!currentSchedule) {
      setNodes([]);
      setEdges([]);
      return;
    }

    const newNodes = currentSchedule.jobs.map((job) => {
      const isColored =
        isViewingResultMode &&
        currentResult &&
        currentResult.fully_colored_jobs?.some(
          (coloredJobId) => coloredJobId.toString() === job._id.toString()
        );

      const jobColorMap = currentResult?.color_map?.[job._id.toString()];
      const colorMap = Array.isArray(jobColorMap) ? jobColorMap : [];

      return {
        id: job._id,
        type: "jobNode",
        position: job.position || { x: 100, y: 100 },
        data: {
          ...job,
          isEditing: false,
          nodeColor: isColored ? "#10b981" : null,
          color_map: colorMap,
          isViewingResult: isViewingResultMode,
        },
      };
    });
    setNodes(newNodes);

    const newEdges = currentSchedule.conflicts.map((conflict) => ({
      id: conflict._id,
      source: conflict.job1,
      target: conflict.job2,
      style: { stroke: "#ef4444" },
      data: { conflictId: conflict._id },
    }));
    setEdges(newEdges);
  }, [currentSchedule, currentResult, isViewingResultMode, setNodes, setEdges]);

  // Update scheduleParams when currentSchedule changes
  useEffect(() => {
    if (currentSchedule) {
      setScheduleParams({
        name: currentSchedule.name,
        l: currentSchedule.l,
        D: currentSchedule.D,
      });
    } else {
      setScheduleParams({ name: "", l: 1, D: 1 });
    }
  }, [currentSchedule]);

  // NEW: Function to commit (save) current React Flow state to the backend
  const commitScheduleChanges = useCallback(
    async (params) => {
      if (!currentSchedule) {
        console.error("Cannot save: No current schedule selected.");
        return;
      }

      try {
        const updatedScheduleData = {
          name: params.name || currentSchedule.name,
          l: params.l || currentSchedule.l,
          D: params.D || currentSchedule.D,
          jobs: nodes.map((node) => ({
            _id: node.id,
            name: node.data.name,
            gain: node.data.gain,
            processing_time: node.data.processing_time,
            position: node.position,
          })),
          conflicts: edges.map((edge) => ({
            _id: edge.id,
            job1: edge.source,
            job2: edge.target,
          })),
        };

        const result = await updateSchedule(
          currentSchedule._id,
          updatedScheduleData
        );
        setCurrentSchedule(result);
        console.log("Schedule state updated successfully.");
      } catch (error) {
        console.error("Failed to save current schedule state:", error);
      }
    },
    [currentSchedule, updateSchedule, setCurrentSchedule, nodes, edges] // Dependencies: nodes and edges are crucial here
  );

  const onConnect = useCallback(
    async (params) => {
      if (isViewingResultMode || !currentSchedule) {
        console.warn(
          "Cannot create conflicts in result viewing mode or no schedule selected."
        );
        return;
      }

      const newConflictId = uuidv4();
      const newEdge = {
        ...params,
        id: newConflictId,
        data: { conflictId: newConflictId },
        style: { stroke: "#ef4444" },
      };

      setEdges((eds) => addEdge(newEdge, eds)); // Update React Flow's local state
      // IMPORTANT: No call to commitScheduleChanges here
    },
    [isViewingResultMode, currentSchedule, setEdges]
  );

  const handleNodeDragStop = useCallback(
    async (event, node) => {
      if (isViewingResultMode || !currentSchedule) {
        console.warn(
          "Cannot drag nodes in result viewing mode or no schedule selected."
        );
        return;
      }

      // Update React Flow's local state
      setNodes((nds) =>
        nds.map((n) =>
          n.id === node.id ? { ...n, position: node.position } : n
        )
      );
      // IMPORTANT: No call to commitScheduleChanges here
    },
    [isViewingResultMode, currentSchedule, setNodes]
  );

  const addNewJob = async () => {
    if (isViewingResultMode) {
      console.warn("Cannot add new jobs in result viewing mode.");
      return;
    }
    if (!currentSchedule) {
      console.warn("Please create or select a schedule first to add jobs.");
      return;
    }
    if (!newJob.name.trim()) return;

    try {
      const jobToAdd = {
        _id: uuidv4(), // Generate temporary ID for immediate display
        name: newJob.name,
        gain: newJob.gain,
        processing_time: newJob.processing_time,
        position: { x: 100, y: 100 },
      };

      const newReactFlowJobNode = {
        id: jobToAdd._id,
        type: "jobNode",
        position: jobToAdd.position,
        data: {
          ...jobToAdd,
          isEditing: false,
          nodeColor: null,
          color_map: [],
          isViewingResult: false,
        },
      };

      setNodes((nds) => [...nds, newReactFlowJobNode]); // Update React Flow's local state
      // IMPORTANT: No call to commitScheduleChanges here

      setNewJob({ name: "", gain: 0, processing_time: 1 });
      setIsAddingJob(false);
    } catch (error) {
      console.error("Failed to add job:", error);
    }
  };

  const handleCreateSchedule = async () => {
    if (!scheduleParams.name.trim()) {
      console.error("Please enter a schedule name");
      return;
    }
    const scheduleData = {
      name: scheduleParams.name,
      l: scheduleParams.l,
      D: scheduleParams.D,
      jobs: [],
      conflicts: [],
    };

    try {
      setIsCreatingSchedule(true);
      const result = await createSchedule(scheduleData);
      setCurrentSchedule(result);
      console.log("Schedule created successfully");
      setIsCreatingSchedule(false);
    } catch (error) {
      console.error("Failed to create schedule:", error);
      setIsCreatingSchedule(false);
    }
  };

  // This is the primary save action now
  const handleUpdateSchedule = async () => {
    if (!currentSchedule) {
      console.error("No schedule selected to update");
      return;
    }
    // Now, explicitly commit the current state of nodes and edges from React Flow to the backend
    await commitScheduleChanges(scheduleParams);
    console.log("Schedule updated successfully");
  };

  const handleSaveAsNew = async () => {
    if (!scheduleParams.name.trim()) {
      console.error("Please enter a name for the new schedule");
      return;
    }

    try {
      setIsCreatingSchedule(true);

      const oldToNewJobIdMap = new Map();
      const newJobsForSchedule = nodes.map((node) => {
        const newJobId = uuidv4();
        oldToNewJobIdMap.set(node.id, newJobId);
        return {
          _id: newJobId,
          name: node.data.name,
          gain: node.data.gain,
          processing_time: node.data.processing_time,
          position: node.position,
        };
      });

      const newConflictsForSchedule = edges.map((edge) => ({
        _id: uuidv4(),
        job1: oldToNewJobIdMap.get(edge.source),
        job2: oldToNewJobIdMap.get(edge.target),
      }));

      const newScheduleData = {
        name: scheduleParams.name,
        l: scheduleParams.l,
        D: scheduleParams.D,
        jobs: newJobsForSchedule,
        conflicts: newConflictsForSchedule,
      };

      const result = await createSchedule(newScheduleData);
      setCurrentSchedule(result);
      console.log("Schedule saved as new successfully");
      setIsCreatingSchedule(false);
    } catch (error) {
      console.error("Failed to save as new schedule:", error);
      setIsCreatingSchedule(false);
    }
  };

  const handleRunSchedule = async () => {
    if (!currentSchedule) {
      console.error("Please create or select a schedule first to run.");
      return;
    }

    try {
      const result = await runScheduleSchema(currentSchedule._id);
      setCurrentResult(result);
      setIsViewingResultMode(true);
      console.log(result);
    } catch (error) {
      console.error("Failed to run schedule:", error);
    }
  };

  const backToEditingMode = () => {
    setIsViewingResultMode(false);
    setCurrentResult(null);
  };

  const clearAll = async () => {
    if (currentSchedule && currentSchedule._id) {
      try {
        await deleteSchedule(currentSchedule._id);
        console.log("Current schedule deleted from backend.");
      } catch (error) {
        console.error("Failed to delete current schedule from backend:", error);
      }
    }
    setNodes([]);
    setEdges([]);
    setCurrentSchedule(null);
    setCurrentResult(null);
    setIsViewingResultMode(false);
    setScheduleParams({ name: "", l: 1, D: 1 });
    console.log("React Flow canvas cleared locally.");
  };

  const handleEdgesDelete = useCallback(
    async (edgesToDelete) => {
      if (isViewingResultMode || !currentSchedule) {
        console.warn(
          "Cannot delete edges in result viewing mode or no schedule selected."
        );
        return;
      }

      // Filter out the deleted edges from React Flow's state
      setEdges((eds) =>
        eds.filter(
          (edge) =>
            !edgesToDelete.some((deletedEdge) => deletedEdge.id === edge.id)
        )
      );
      // IMPORTANT: No call to commitScheduleChanges here
    },
    [isViewingResultMode, currentSchedule, setEdges]
  );

  const handleNodesDelete = useCallback(
    async (nodesToDelete) => {
      if (isViewingResultMode || !currentSchedule) {
        console.warn(
          "Cannot delete nodes in result viewing mode or no schedule selected."
        );
        return;
      }

      // Filter out the deleted nodes from React Flow's state
      setNodes((nds) =>
        nds.filter(
          (node) =>
            !nodesToDelete.some((deletedNode) => deletedNode.id === node.id)
        )
      );

      // Filter out edges connected to deleted nodes from React Flow's state
      setEdges((eds) =>
        eds.filter(
          (edge) =>
            !nodesToDelete.some(
              (deletedNode) =>
                deletedNode.id === edge.source || deletedNode.id === edge.target
            )
        )
      );
      // IMPORTANT: No call to commitScheduleChanges here
    },
    [isViewingResultMode, currentSchedule, setNodes, setEdges]
  );

  const getTotalGain = useCallback(() => {
    return currentSchedule
      ? currentSchedule.jobs.reduce((total, job) => total + job.gain, 0)
      : 0;
  }, [currentSchedule]);

  const getTotalProcessingTime = useCallback(() => {
    return currentSchedule
      ? currentSchedule.jobs.reduce(
          (total, job) => total + job.processing_time,
          0
        )
      : 0;
  }, [currentSchedule]);

  const handleCreateScheduleFromCSV = async (csvScheduleData) => {
    if (!csvScheduleData.name.trim()) {
      throw new Error("Please enter a schedule name");
    }

    try {
      setIsCreatingSchedule(true);

      // Creează schedule-ul cu datele din CSV
      // csvScheduleData conține deja jobs și conflicts în formatul corect pentru schema ta
      const result = await createSchedule(csvScheduleData);

      // Setează schedule-ul nou ca fiind activ
      setCurrentSchedule(result);

      console.log("Schedule created successfully from CSV:", {
        name: result.name,
        jobsCount: result.jobs.length,
        conflictsCount: result.conflicts.length,
      });

      setIsCreatingSchedule(false);
      return result;
    } catch (error) {
      console.error("Failed to create schedule from CSV:", error);
      setIsCreatingSchedule(false);
      throw error; // Re-throw pentru a fi prins în ControlPanel
    }
  };

  return {
    // State
    newJob,
    setNewJob,
    isAddingJob,
    setIsAddingJob,
    scheduleParams,
    setScheduleParams,
    isCreatingSchedule,
    setIsCreatingSchedule,
    isViewingResultMode,
    setIsViewingResultMode,
    // Store data
    jobs: currentSchedule ? currentSchedule.jobs : [],
    conflicts: currentSchedule ? currentSchedule.conflicts : [],
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
    addNewJob,
    handleNodeDragStop,
    handleCreateSchedule,
    handleUpdateSchedule, // This is now the explicit save for current schedule
    handleSaveAsNew,
    handleRunSchedule,
    handleEdgesDelete,
    handleNodesDelete,
    clearAll,
    backToEditingMode,
    getTotalGain,
    getTotalProcessingTime,
    handleCreateScheduleFromCSV,
  };
}
