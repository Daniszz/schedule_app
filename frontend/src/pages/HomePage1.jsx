import React from "react";

import { useCreateStore } from "../store/useCreateStore";

const HomePage = () => {
  return (
    <div className="flex h-[calc(100vh-4rem)] bg-base-200 mt-16 overflow-hidden">
      <div className="flex-1 p-6 h-full overflow-hidden">
        <div className="bg-base-100 rounded-lg shadow w-full h-full p-4 flex flex-col">
          "Miau "
        </div>
      </div>
    </div>
  );
};

export default HomePage;
