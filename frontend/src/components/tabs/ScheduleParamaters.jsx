"use client";

import { ArrowRight } from "lucide-react";
import { IconPicker } from "../icon.utils/icon-picker";

const ScheduleParameters = ({ scheduleData, setScheduleData, onNext }) => {
  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <div className="text-center mb-4 p-4">
        <h1 className="text-2xl font-bold">Schedule Parameters</h1>
      </div>

      {/* Scrollable form section */}
      <div className="flex-1 overflow-y-auto px-4">
        <div className="flex justify-center w-full">
          <div className="w-full max-w-md space-y-6">
            <form className="space-y-6">
              {/* Name Field */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Name</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter name"
                  className="input input-bordered w-full"
                  value={scheduleData.name}
                  onChange={(e) =>
                    setScheduleData({ ...scheduleData, name: e.target.value })
                  }
                />
              </div>

              {/* Icon Picker */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">Icon</span>
                </label>
                <IconPicker
                  value={scheduleData.icon}
                  onChange={(iconName) =>
                    setScheduleData({ ...scheduleData, icon: iconName })
                  }
                  placeholder="Select an icon"
                />
              </div>

              {/* Shared Resources */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    Number of shared resources
                  </span>
                </label>
                <input
                  type="number"
                  placeholder="Enter value"
                  className="input input-bordered w-full"
                  value={scheduleData.l}
                  onChange={(e) =>
                    setScheduleData({ ...scheduleData, l: e.target.value })
                  }
                />
              </div>

              {/* Planning Horizon */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-medium">
                    End of planning horizon
                  </span>
                </label>
                <input
                  type="number"
                  placeholder="Enter value"
                  className="input input-bordered w-full"
                  value={scheduleData.D}
                  onChange={(e) =>
                    setScheduleData({ ...scheduleData, D: e.target.value })
                  }
                />
              </div>
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

export default ScheduleParameters;
