import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useScheduleResultStore = create((set, get) => ({
  isRunning: false,
  isResultsLoading: false,
  results: [],
  currentResult: null,

  runScheduleSchema: async (schemaId) => {
    set({ isRunning: true });
    try {
      const res = await axiosInstance.post(`/scheduleResult/${schemaId}/run`);
      toast.success("Schedule schema executed successfully");
      console.log(res.data);
      get().fetchResults();

      return res.data;
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to run schedule schema";
      toast.error(errorMessage);
      throw error;
    } finally {
      set({ isRunning: false });
    }
  },

  fetchResults: async () => {
    set({ isResultsLoading: true });
    try {
      const res = await axiosInstance.get("/scheduleResult");
      set({ results: res.data });
    } catch (error) {
      const errorMessage =
        error.response?.data?.message || "Failed to fetch results";
      toast.error(errorMessage);
    } finally {
      set({ isResultsLoading: false });
    }
  },

  setCurrentResult: (result) => {
    set({ currentResult: result });
  },
}));
