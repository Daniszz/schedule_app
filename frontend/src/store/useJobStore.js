import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useJobStore = create((set, get) => ({
  isJobCreating: false,
  isJobLoading: false,
  isJobUpdating: false,
  isJobDeleting: false,
  jobs: [],

  createJob: async (data) => {
    set({ isJobCreating: true });
    try {
      const res = await axiosInstance.post("/job", data);
      toast.success("Job created successfully");
      get().fetchJobs();
      return res.data;
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isJobCreating: false });
    }
  },

  fetchJobs: async () => {
    set({ isJobLoading: true });
    try {
      const res = await axiosInstance.get("/job");
      set({ jobs: res.data });
    } catch (error) {
      toast.error("Failed to fetch jobs");
    } finally {
      set({ isJobLoading: false });
    }
  },
  updateJob: async (id, data) => {
    set({ isJobUpdating: true });
    try {
      await axiosInstance.put(`/job/${id}`, data);

      toast.success("Job updated successfully");
      get().fetchJobs();
    } catch (error) {
      toast.error("Failed to update job");
      throw error;
    } finally {
      set({ isJobUpdating: false });
    }
  },
  deleteJob: async (id) => {
    set({ isJobDeleting: true });
    try {
      await axiosInstance.delete(`/job/${id}`);
      toast.success("Job deleted successfully");
      get().fetchJobs();
    } catch (error) {
      toast.error("Failed to delete job");
      throw error;
    } finally {
      set({ isJobDeleting: false });
    }
  },

  deleteAllJobs: async () => {
    set({ isJobDeleting: true });
    try {
      await axiosInstance.delete(`/job`);
      toast.success("All jobs deleted successfully");
      get().fetchJobs();
    } catch (error) {
      toast.error("Failed to delete all jobs");
      throw error;
    } finally {
      set({ isJobDeleting: false });
    }
  },
  updateJobPosition: async (id, position) => {
    try {
      console.log("Updating position for job:", id, position); // Debug log

      await axiosInstance.put(`/job/${id}/position`, { position });
    } catch (error) {
      toast.error("Failed to update job position");
      throw error;
    }
  },
}));
