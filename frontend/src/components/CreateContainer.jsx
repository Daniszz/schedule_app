import { Plus } from "lucide-react";
import { motion } from "framer-motion";
const CreateContainer = () => {
  return (
    <div className="flex flex-col items-center justify-center gap-4 h-full ">
      <span className="text-2xl font-bold">Create a schedule</span>
      <button className="btn btn-primary">
        <Plus className="size-4" />
      </button>
    </div>
  );
};
export default CreateContainer;
