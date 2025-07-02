import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useScheduleStore = create((set, get) => ({
  isScheduleCreating: false,
  isScheduleLoading: false,
  schedules: [],
  currentSchedule: null,

  // Funcție utilitară pentru a verifica unicitatea numelor joburilor
  _checkJobNameUniqueness: (jobs) => {
    if (!jobs || jobs.length === 0) {
      return true; // Nu sunt joburi, deci nu pot exista duplicate
    }
    const jobNames = new Set();
    for (const job of jobs) {
      if (jobNames.has(job.name)) {
        return false; // Nume duplicat găsit
      }
      jobNames.add(job.name);
    }
    return true; // Toate numele sunt unice
  },

  createSchedule: async (data) => {
    set({ isScheduleCreating: true });
    try {
      // Verificarea unicității numelor joburilor înainte de a trimite
      if (data.jobs && !get()._checkJobNameUniqueness(data.jobs)) {
        toast.error("Job names must be unique within a schedule.");
        return; // Oprim execuția dacă există nume duplicate
      }

      const res = await axiosInstance.post("/schedule", data);
      toast.success("Schedule created successfully");
      get().fetchSchedules();
      return res.data;
    } catch (error) {
      toast.error("Failed to create schedule");
      throw error;
    } finally {
      set({ isScheduleCreating: false });
    }
  },
  fetchSchedules: async () => {
    set({ isScheduleLoading: true });
    try {
      const res = await axiosInstance.get("/schedule");
      set({ schedules: res.data });
    } catch (error) {
      toast.error("Failed to fetch schedules");
    } finally {
      set({ isScheduleLoading: false });
    }
  },

  updateSchedule: async (scheduleId, data, showToast = true) => {
    set({ isScheduleCreating: true });
    try {
      if (data.jobs && !get()._checkJobNameUniqueness(data.jobs)) {
        if (showToast) {
          toast.error("Job names must be unique within a schedule.");
        }
        return;
      }

      const res = await axiosInstance.put(`/schedule/${scheduleId}`, data);
      if (showToast) {
        toast.success("Schedule updated successfully");
      }

      await get().fetchSchedules();

      const current = get().currentSchedule;
      if (current && current._id === scheduleId) {
        set({ currentSchedule: res.data });
      }

      return res.data;
    } catch (error) {
      if (showToast) {
        toast.error("Failed to update schedule");
      }
      throw error;
    } finally {
      set({ isScheduleCreating: false });
    }
  },

  deleteSchedule: async (scheduleId) => {
    try {
      await axiosInstance.delete(`/schedule/${scheduleId}`);
      toast.success("Schedule deleted successfully");

      await get().fetchSchedules();

      const current = get().currentSchedule;
      if (current && current._id === scheduleId) {
        set({ currentSchedule: null });
      }
    } catch (error) {
      toast.error("Failed to delete schedule");
      throw error;
    }
  },
  setCurrentSchedule: (schedule) => {
    set({ currentSchedule: schedule });
  },
}));
