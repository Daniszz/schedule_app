import { Plus } from "lucide-react";
import { useCreateStore } from "../store/useCreateStore";

const CreateContainer = () => {
  const { setCreateForm } = useCreateStore();

  return (
    <div className="flex flex-col items-center justify-center gap-4 h-full ">
      <span className="text-2xl font-bold">Create a schedule</span>
      <button className="btn btn-primary" onClick={() => setCreateForm(true)}>
        <Plus className="size-4" />
      </button>
    </div>
  );
};
export default CreateContainer;
