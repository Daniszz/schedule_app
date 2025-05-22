import React from "react";
import Sidebar from "../components/Sidebar";
import CreateContainer from "../components/CreateContainer";
import { useCreateStore } from "../store/useCreateStore";
import ScheduleForm from "../components/ScheduleForm";

const HomePage = () => {
  const { createForm } = useCreateStore();

  return (
    <div className="flex h-[calc(100vh-4rem)] bg-base-200 mt-16 overflow-hidden">
      <Sidebar />
      <div className="flex-1 p-6 h-full overflow-hidden">
        <div className="bg-base-100 rounded-lg shadow w-full h-full p-4 flex flex-col">
          {!createForm ? <CreateContainer /> : <ScheduleForm />}
        </div>
      </div>
    </div>
  );
};

export default HomePage;
