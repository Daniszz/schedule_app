import React from "react";
import Sidebar from "../components/Sidebar";
import CreateContainer from "../components/CreateContainer";
import GraphBlob from "../components/GraphBlob";
const HomePage = () => {
  return (
    <div className="flex h-[calc(100vh-4rem)] bg-base-200 mt-16 overflow-hidden">
      <Sidebar />
      <div className="flex-1 p-6 ">
        <div className="bg-base-100 rounded-lg shadow w-full h-full p-4">
          <div className="relative h-full">
            <GraphBlob />
            <div className="relative z-10">
              <CreateContainer />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
