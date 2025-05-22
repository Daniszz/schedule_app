import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useJobStore = create((set, get) => ({
  isJobCreating: false,
  isJobLoading: false,
  jobItem: [],

  createJob: async (data) => {
    set({ isJobCreating: true });
    try {
      const res = await axiosInstance.post("/job", data);
      toast.success("Job created successfully");
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isJobCreating: false });
    }
  },
}));
