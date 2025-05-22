import { useState } from "react";
import { useCreateStore } from "../store/useCreateStore";
import ScheduleTabs from "./tabs/ScheduleTabs";
import ScheduleParameters from "./tabs/ScheduleParamaters";
import JobForm from "./tabs/JobForm";
import ReviewSubmit from "./tabs/ReviewSubmit";
const ScheduleForm = () => {
  const { setCreateForm } = useCreateStore();
  const [tab, setTab] = useState("parameters");

  const [scheduleData, setScheduleData] = useState({
    name: "",
    icon: "",
    jobs: [], // Will contain job IDs or job objects
    l: 0,
    D: 0,
  });

  const [jobData, setJobData] = useState([
    // Optional: You can manage multiple jobs if needed
    {
      name: "",
      processing_time: 0,
      gain: 0,
      critical_resources: [], // Resource IDs
    },
  ]);

  const [resourceData, setResourceData] = useState([
    // Optional: Multiple resources
    {
      name: "",
      description: "",
    },
  ]);

  const handleFinalSubmit = () => {
    // 🔒 Validate and combine data here before sending to the backend
    const payload = {
      ...scheduleData,
      jobs: jobData,
    };

    console.log("Submitting full schedule:", payload);

    // Send to backend...
    setCreateForm(false);
  };

  return (
    <div className="relative w-full h-full flex flex-col overflow-hidden">
      <ScheduleTabs
        tab={tab}
        setTab={setTab}
        onClose={() => setCreateForm(false)}
      />

      <div className="flex-1 overflow-y-auto p-4">
        {tab === "parameters" && (
          <ScheduleParameters
            scheduleData={scheduleData}
            setScheduleData={setScheduleData}
            onNext={() => setTab("jobs")}
          />
        )}

        {tab === "jobs" && (
          <JobForm
            jobData={jobData}
            setJobData={setJobData}
            resourceData={resourceData}
            setResourceData={setResourceData}
            onNext={() => setTab("review")}
          />
        )}

        {tab === "review" && (
          <ReviewSubmit
            scheduleData={scheduleData}
            jobData={jobData}
            resourceData={resourceData}
            onSubmit={handleFinalSubmit}
          />
        )}
      </div>
    </div>
  );
};

export default ScheduleForm;
