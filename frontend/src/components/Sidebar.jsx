import React, { useState, useEffect } from "react";
import {
  Album,
  ChevronLeft,
  ChevronRight,
  Calendar,
  AlarmClock,
  Users,
  Briefcase,
} from "lucide-react";
import { useScheduleStore } from "../store/useScheduleStore";

const iconMap = {
  Album,
  Calendar,
  AlarmClock,
  Users,
  Briefcase,
};

const Sidebar = () => {
  const { getSchedule, scheduledItem } = useScheduleStore();

  useEffect(() => {
    getSchedule();
  }, [getSchedule]);

  const filteredScheduledItem = [...scheduledItem].sort(
    (a, b) => new Date(b.created_at) - new Date(a.created_at)
  );
  const [collapsed, setCollapsed] = useState(false);

  const toggleSidebar = () => setCollapsed(!collapsed);

  return (
    <aside
      className={`h-screen ${
        collapsed ? "w-20" : "w-72"
      } border-r border-base-300 flex flex-col transition-all duration-300 ease-in-out bg-base-100`}
    >
      {/* Header */}
      <div className="p-5 border-b border-base-300 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Album className="w-6 h-6 " />
          {!collapsed && <span className="font-medium">Scheduled Items</span>}
        </div>
        <button onClick={toggleSidebar} className="ml-auto text-gray-500 ">
          {collapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Body content */}
      {/* Body content */}
      <div className="overflow-y-auto w-full py-3">
        {filteredScheduledItem.map((item) => {
          const IconComponent = iconMap[item.icon];

          if (!IconComponent) return null;

          return (
            <button
              key={item._id}
              className={`flex items-center w-full p-3 hover:bg-base-200 ${
                collapsed ? "justify-center" : "px-4 gap-3"
              }`}
            >
              <IconComponent className="w-5 h-5 " />
              {!collapsed && <span className="truncate">{item.name}</span>}
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
