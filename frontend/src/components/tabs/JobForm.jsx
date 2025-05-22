import { ArrowRight, Loader2 } from "lucide-react";
import { useJobStore } from "../../store/useJobStore";
import ResourcePicker from "./ResourcePicker";

const JobForm = ({
  jobData,
  setJobData,
  resourceData,
  setResourceData,
  onNext,
}) => {
  const { createJob, isJobCreating } = useJobStore();
  const handleSubmit = async (e) => {
    e.preventDefault();
    createJob(jobData);
  };

  const handleResourceChange = (e) => {
    setJobData({
      ...jobData,
      critical_resources: e.target.value, // e.target.value va fi array-ul de resurse selectate
    });
  };
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="text-center mb-4 p-4">
        <h1 className="text-2xl font-bold">Jobs</h1>
      </div>

      {/* Scrollable form section */}
      <div className="flex-1 overflow-y-auto px-4">
        <div className="flex justify-center w-full">
          <div className="w-full max-w-md space-y-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSubmit(e);
              }}
              className="space-y-6"
            >
              {/* Name Field */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Name</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter name"
                  className="input input-bordered w-full"
                  value={jobData.name}
                  onChange={(e) =>
                    setJobData({ ...jobData, name: e.target.value })
                  }
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Select Critical Resources
                  </span>
                </label>
                <ResourcePicker
                  value={jobData.critical_resources || []}
                  onChange={handleResourceChange}
                  resourceData={resourceData}
                  setResourceData={setResourceData}
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Processing time
                  </span>
                </label>
                <input
                  type="number"
                  placeholder="Enter value"
                  className="input input-bordered w-full"
                  value={jobData.processing_time}
                  onChange={(e) =>
                    setJobData({ ...jobData, processing_time: e.target.value })
                  }
                />
              </div>

              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Gain</span>
                </label>
                <input
                  type="number"
                  placeholder="Enter value"
                  className="input input-bordered w-full"
                  value={jobData.gain}
                  onChange={(e) =>
                    setJobData({ ...jobData, gain: e.target.value })
                  }
                />
              </div>
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isJobCreating}
              >
                {isJobCreating ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Create"
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Footer with Next Button */}
      <div className="flex justify-end p-4 border-t">
        <button onClick={onNext} className="btn btn-primary">
          Next <ArrowRight className="ml-2 h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default JobForm;
