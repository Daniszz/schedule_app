import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";
import { deletedResource } from "../../../backend/src/controllers/resource.controller";

export const useResourceStore = create((set, get) => ({
  isResourceCreating: false,
  isResourceLoading: false,
  resourceItem: [],

  createResource: async (data) => {
    set({ isResourceCreating: true });
    try {
      const res = await axiosInstance.post("/resources", data);
      toast.success("Resource created succesfully");
      return res.data;
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isResourceCreating: false });
    }
  },

  getResources: async () => {
    set({ isResourceLoading: true });
    try {
      const res = await axiosInstance.get("/resources");
      set({ resourceItem: res.data });
      console.log(res.data);
    } catch (error) {
      toast.error(error.response.data.message);
    } finally {
      set({ isResourceLoading: false });
    }
  },

  deleteResource: async (id) => {
    try {
      const res = await axiosInstance.delete(`/resources/${id}`); // fixed template string
      toast.success("Resursa a fost ștearsă cu succes");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Eroare la ștergere");
    }
  },
}));
