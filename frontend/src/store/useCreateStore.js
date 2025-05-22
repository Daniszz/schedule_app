import { create } from "zustand";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

export const useCreateStore = create((set, get) => ({
  createForm: false,
  setCreateForm: (createForm) => set({ createForm }),
}));
