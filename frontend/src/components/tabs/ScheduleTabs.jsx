const ScheduleTabs = ({ tab, setTab, onClose }) => {
  const tabs = [
    { key: "parameters", label: "Schedule Parameters" },
    { key: "jobs", label: "Jobs" },
    { key: "review", label: "Review & Submit" },
  ];

  return (
    <div className="bg-base-100 border-b border-base-300">
      <div className="flex justify-end pr-2 pt-2">
        <button
          className="btn btn-sm btn-circle btn-ghost"
          aria-label="Close"
          onClick={onClose}
        >
          ✕
        </button>
      </div>

      {/* Tab buttons */}
      <div className="grid grid-cols-3 w-full">
        {tabs.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`py-3 px-1 md:px-2 text-center transition-colors duration-200 text-xs sm:text-sm md:text-base ${
              tab === key
                ? "border-b-2 border-primary text-primary font-medium"
                : "border-b-2 border-transparent hover:bg-base-200"
            }`}
          >
            <h1 className="text-lg font-bold">{label}</h1>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ScheduleTabs;
