import React, { useEffect, useState } from "react";
import { useScheduleStore } from "../store/useScheduleStore";
import { useNavigate } from "react-router-dom";
import { Edit, Trash2, Calendar, Clock } from "lucide-react";
import { toast } from "react-hot-toast";
const HistoryPage = () => {
  const {
    schedules,
    isScheduleLoading,
    fetchSchedules,
    deleteSchedule,
    setCurrentSchedule,
  } = useScheduleStore();

  const navigate = useNavigate();
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    fetchSchedules();
  }, [fetchSchedules]);

  const handleEdit = (schedule) => {
    setCurrentSchedule(schedule);
    navigate("/");
  };

  const handleDelete = (scheduleId, scheduleName) => {
    toast(
      (t) => (
        <div className="flex flex-col">
          <div className="mb-3">
            <p className="font-medium">Delete Schedule</p>
            <p className="text-sm text-gray-600">
              Are you sure you want to delete "{scheduleName}"?
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                setDeletingId(scheduleId);
                try {
                  await deleteSchedule(scheduleId);
                } catch (error) {
                  console.error("Error deleting schedule:", error);
                } finally {
                  setDeletingId(null);
                }
              }}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
            >
              Delete
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
            >
              Cancel
            </button>
          </div>
        </div>
      ),
      {
        duration: 0,
        style: {
          minWidth: "300px",
        },
      }
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("ro-RO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isScheduleLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center mb-8">
        <Calendar className="mr-3 text-blue-500" size={32} />
        <h1 className="text-3xl font-bold text-gray-800">Schedule History</h1>
      </div>

      {schedules.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-gray-400 mb-4">
            <Calendar size={64} className="mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No schedules found</h3>
            <p className="text-gray-500">
              Create your first schedule to get started!
            </p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Create Schedule
          </button>
        </div>
      ) : (
        <div className="grid gap-4 md:gap-6">
          {schedules.map((schedule) => (
            <div
              key={schedule._id}
              className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    {schedule.name}
                  </h3>

                  <div className="flex items-center text-gray-600 mb-3">
                    <Clock className="mr-2" size={16} />
                    <span className="text-sm">
                      Created: {formatDate(schedule.created_at)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Jobs:</span>{" "}
                      {schedule.jobs ? schedule.jobs.length : "undefined"}
                    </div>
                    <div>
                      <span className="font-medium">Conflicts:</span>{" "}
                      {schedule.conflicts
                        ? schedule.conflicts.length
                        : "undefined"}
                    </div>
                    <div>
                      <span className="font-medium">L (Length):</span>{" "}
                      {schedule.l}
                    </div>
                    <div>
                      <span className="font-medium">D (Days):</span>{" "}
                      {schedule.D}
                    </div>
                  </div>

                  {schedule.updated_at !== schedule.created_at && (
                    <div className="mt-2 text-xs text-gray-500">
                      Last updated: {formatDate(schedule.updated_at)}
                    </div>
                  )}
                </div>

                <div className="flex space-x-2 ml-4">
                  <button
                    onClick={() => handleEdit(schedule)}
                    className="flex items-center px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors text-sm"
                    title="Edit Schedule"
                  >
                    <Edit size={16} className="mr-1" />
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(schedule._id, schedule.name)}
                    disabled={deletingId === schedule._id}
                    className="flex items-center px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Delete Schedule"
                  >
                    {deletingId === schedule._id ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-1"></div>
                    ) : (
                      <Trash2 size={16} className="mr-1" />
                    )}
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoryPage;
