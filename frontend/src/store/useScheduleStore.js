import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useScheduleStore = create((set, get) => ({
  scheduledItem: [],
  isScheduleLoading: false,

  getSchedule: async () => {
    set({ isScheduleLoading: true });
    try {
      const res = await axiosInstance.get("/scheduleSchema");
      set({ scheduledItem: res.data });
      console.log(res.data);
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isScheduleLoading: false });
    }
  },
}));
