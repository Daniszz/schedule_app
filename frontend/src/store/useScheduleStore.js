import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useScheduleStore = create((set, get) => ({
  isScheduleCreating: false,
  isScheduleRunning: false,
  isScheduleLoading: false,
  schedules: [],
  currentSchedule: null,
  scheduleResults: [],

  createSchedule: async (data) => {
    set({ isScheduleCreating: true });
    try {
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
  setCurrentSchedule: (schedule) => {
    set({ currentSchedule: schedule });
  },
}));
