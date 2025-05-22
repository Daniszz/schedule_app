"use client";

import { useState, useEffect, useRef } from "react";
import { Search, ChevronDown, ChevronUp, X } from "lucide-react";
import { iconList } from "./icon-list";

export const IconPicker = ({
  value,
  onChange,
  placeholder = "Select an icon",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const selectedIcon = iconList.find((icon) => icon.name === value);

  const filteredIcons = iconList.filter((icon) =>
    icon.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSelectIcon = (iconName) => {
    onChange(iconName);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClearSelection = (e) => {
    e.stopPropagation();
    onChange("");
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div
        className="input input-bordered w-full flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-2">
          {selectedIcon ? (
            <>
              <span className="flex items-center justify-center w-6 h-6">
                {<selectedIcon.component className="h-5 w-5" />}
              </span>
              <span>{selectedIcon.name}</span>
            </>
          ) : (
            <span className="text-gray-400">{placeholder}</span>
          )}
        </div>
        <div className="flex items-center">
          {value && (
            <button
              type="button"
              onClick={handleClearSelection}
              className="p-1 hover:bg-gray-200 rounded-full mr-1"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          {isOpen ? (
            <ChevronUp className="h-4 w-4" />
          ) : (
            <ChevronDown className="h-4 w-4" />
          )}
        </div>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 mt-1 w-full bg-base-100 border border-gray-200 rounded-md shadow-lg max-h-80 overflow-hidden">
          {/* Search input */}
          <div className="p-2 border-b sticky top-0 bg-base-100">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                className="input input-bordered w-full pl-10 h-9"
                placeholder="Search icons..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Icons grid */}
          <div className="overflow-y-auto max-h-60 p-2">
            {filteredIcons.length > 0 ? (
              <div className="grid grid-cols-4 gap-2">
                {filteredIcons.map((icon) => (
                  <div
                    key={icon.name}
                    className={`flex flex-col items-center justify-center p-2 rounded-md cursor-pointer hover:bg-gray-100 ${
                      value === icon.name ? "bg-gray-100" : ""
                    }`}
                    onClick={() => handleSelectIcon(icon.name)}
                  >
                    <div className="flex items-center justify-center h-8 w-8">
                      {<icon.component className="h-5 w-5" />}
                    </div>
                    <span className="text-xs mt-1 text-center truncate w-full">
                      {icon.name}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-4 text-center text-gray-500">
                No icons found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
