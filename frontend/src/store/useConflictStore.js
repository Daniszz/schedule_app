import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useConflictStore = create((set, get) => ({
  isConflictCreating: false,
  isConflictLoading: false,
  isConflictDeleting: false,
  conflicts: [],

  createConflict: async (job1Id, job2Id) => {
    set({ isConflictCreating: true });
    try {
      const res = await axiosInstance.post("/conflict", {
        job1: job1Id,
        job2: job2Id,
      });
      toast.success("Conflict created successfully");
      get().fetchConflicts();
      return res.data;
    } catch (error) {
      toast.error("Failed to create conflict");
      throw error;
    } finally {
      set({ isConflictCreating: false });
    }
  },
  fetchConflicts: async () => {
    set({ isConflictLoading: true });
    try {
      const res = await axiosInstance.get("/conflict");
      set({ conflicts: res.data });
    } catch (error) {
      toast.error("Failed to fetch conflicts");
    } finally {
      set({ isConflictLoading: false });
    }
  },

  deleteConflict: async (id) => {
    set({ isConflictDeleting: true });
    try {
      await axiosInstance.delete(`/conflict/${id}`);
      toast.success("Conflict deleted successfully");
      get().fetchConflicts();
    } catch (error) {
      toast.error("Failed to delete conflict");
      throw error;
    } finally {
      set({ isConflictDeleting: false });
    }
  },
}));
