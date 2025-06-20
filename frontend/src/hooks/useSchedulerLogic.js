import { useState, useCallback, useRef, useEffect } from "react";
import { addEdge } from "reactflow";
import { useJobStore } from "../store/useJobStore";
import { useConflictStore } from "../store/useConflictStore";
import { useScheduleStore } from "../store/useScheduleStore";
import { useScheduleResultStore } from "../store/useScheduleResultStore";

export function useSchedulerLogic({ setNodes, setEdges }) {
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

  const nodeIdRef = useRef(1);

  // Zustand store hooks
  const {
    jobs,
    deleteAllJobs,
    createJob,
    updateJobPosition,
    fetchJobs,
    isJobCreating,
    isJobLoading,
  } = useJobStore();

  const { conflicts, createConflict, fetchConflicts, deleteConflict } =
    useConflictStore();

  const {
    currentSchedule,
    createSchedule,
    isScheduleCreating,

    fetchSchedules,
    setCurrentSchedule,
  } = useScheduleStore();

  const {
    results: scheduleResults,
    isRunning: isScheduleRunning,
    runScheduleSchema,
    fetchResults,
    currentResult,
    setCurrentResult,
  } = useScheduleResultStore();

  // Load data on mount
  useEffect(() => {
    fetchJobs();
    fetchConflicts();
    fetchSchedules();
    fetchResults();
  }, [fetchJobs, fetchConflicts, fetchSchedules, fetchResults]);

  // Update nodes when jobs change
  useEffect(() => {
    const newNodes = jobs.map((job, index) => {
      // Check if job is in the latest result's fully_colored_jobs
      const isColored =
        currentResult &&
        currentResult.fully_colored_jobs?.some(
          (coloredJobId) => coloredJobId.toString() === job._id.toString()
        );

      return {
        id: job._id,
        type: "jobNode",
        position: job.position || { x: 100, y: 100 },
        data: {
          ...job,
          isEditing: false,
          nodeColor: isColored ? "#10b981" : null, // Green for colored jobs
        },
      };
    });

    setNodes(newNodes);
    nodeIdRef.current = jobs.length + 1;
  }, [jobs, scheduleResults, setNodes]);

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

  const handleNodeDragStop = async (event, node) => {
    try {
      await updateJobPosition(node.id, node.position);
    } catch (error) {
      console.error("Failed to update node position:", error);
    }
  };

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
      console.error("Please enter a schedule name");
      return;
    }

    if (jobs.length === 0) {
      console.error("No jobs available to schedule");
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

      // Set the newly created schedule as current
      setCurrentSchedule(result);

      console.log("Schedule created successfully");
      setScheduleParams({ name: "", l: 1, D: 1 });
      setIsCreatingSchedule(false);
    } catch (error) {
      console.error("Failed to create schedule:", error);
    }
  };

  const handleRunSchedule = async () => {
    if (!currentSchedule) {
      console.error("Please create a schedule first");
      return;
    }

    try {
      const result = await runScheduleSchema(currentSchedule._id);
      setCurrentResult(result);
      console.log(result);
    } catch (error) {
      console.error("Failed to run schedule:", error);
    }
  };

  const clearAll = async () => {
    try {
      await deleteAllJobs();
      await fetchConflicts();
      setCurrentSchedule(null);
      setCurrentResult(null);
    } catch (error) {
      console.error("Failed to delete all jobs:", error);
    }
  };

  const handleEdgesDelete = async (edges) => {
    try {
      for (const edge of edges) {
        const conflictId = edge.data?.conflictId;
        if (conflictId) {
          await deleteConflict(conflictId);
        }
      }
    } catch (error) {
      console.error("Failed to delete conflict:", error);
    }
  };

  const getTotalGain = () => {
    return jobs.reduce((total, job) => total + job.gain, 0);
  };

  const getTotalProcessingTime = () => {
    return jobs.reduce((total, job) => total + job.processing_time, 0);
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
    addNewJob,
    handleNodeDragStop,
    handleCreateSchedule,
    handleEdgesDelete,
    handleRunSchedule,
    clearAll,
    getTotalGain,
    getTotalProcessingTime,
  };
}
