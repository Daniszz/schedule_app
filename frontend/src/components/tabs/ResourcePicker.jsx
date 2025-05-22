import { useEffect, useState } from "react";
import { useResourceStore } from "../../store/useResourceStore";
import {
  ChevronDown,
  Search,
  Plus,
  X,
  Loader2,
  Check,
  Trash2,
} from "lucide-react";

const ResourcePicker = ({ value, onChange, resourceData, setResourceData }) => {
  const {
    resourceItem,
    getResources,
    isResourceLoading,
    createResource,
    isResourceCreating,
    deleteResource,
  } = useResourceStore();

  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedResources, setSelectedResources] = useState(value || []);
  const [resourceToDelete, setResourceToDelete] = useState(null);

  useEffect(() => {
    getResources();
  }, [getResources]);

  useEffect(() => {
    setSelectedResources(value || []);
  }, [value]);

  const filteredResourceItems = resourceItem
    .filter((item) =>
      item.name.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const handleResourceToggle = (resource) => {
    const isSelected = selectedResources.some((r) => r._id === resource._id);
    const newSelection = isSelected
      ? selectedResources.filter((r) => r._id !== resource._id)
      : [...selectedResources, resource];

    setSelectedResources(newSelection);
    onChange({ target: { value: newSelection } });
  };

  const handleRemoveResource = (resourceId) => {
    const newSelection = selectedResources.filter((r) => r._id !== resourceId);
    setSelectedResources(newSelection);
    onChange({ target: { value: newSelection } });
  };

  const handleAddResource = async () => {
    if (resourceData.name && resourceData.description) {
      await createResource(resourceData);
      setResourceData({ name: "", description: "" });
      setShowAddForm(false);
      getResources();
    }
  };

  const confirmDelete = async () => {
    if (!resourceToDelete) return;
    await deleteResource(resourceToDelete._id);
    setResourceToDelete(null);
    getResources();
  };

  const isResourceSelected = (resource) =>
    selectedResources.some((r) => r._id === resource._id);

  return (
    <div className="relative w-full">
      {/* Selected Resources Display */}
      {selectedResources.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {selectedResources.map((resource) => (
            <div key={resource._id} className="badge badge-primary gap-2">
              {resource.name}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveResource(resource._id);
                }}
                className="btn btn-ghost btn-xs p-0 min-h-0 h-4 w-4"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Dropdown Trigger */}
      <div
        className="input input-bordered w-full flex items-center justify-between cursor-pointer"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className={selectedResources.length === 0 ? "text-gray-400" : ""}>
          {selectedResources.length === 0
            ? "Select resources..."
            : `${selectedResources.length} resource(s) selected`}
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </div>

      {/* Dropdown Content */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-base-100 border border-base-300 rounded-lg shadow-lg z-50 max-h-80 overflow-hidden">
          {/* Search Bar */}
          <div className="p-3 border-b border-base-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search resources..."
                className="input input-sm w-full pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onClick={(e) => e.stopPropagation()}
              />
            </div>
          </div>

          {/* Add New Resource Button */}
          <div className="p-2 border-b border-base-200">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setShowAddForm(!showAddForm);
              }}
              className="btn btn-ghost btn-sm w-full justify-start gap-2"
            >
              <Plus className="h-4 w-4" />
              Add New Resource
            </button>
          </div>

          {/* Add Resource Form */}
          {showAddForm && (
            <div className="p-3 border-b border-base-200 bg-base-50">
              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Resource name"
                  className="input input-sm w-full"
                  value={resourceData.name}
                  onChange={(e) =>
                    setResourceData({ ...resourceData, name: e.target.value })
                  }
                  onClick={(e) => e.stopPropagation()}
                />
                <input
                  type="text"
                  placeholder="Description"
                  className="input input-sm w-full"
                  value={resourceData.description}
                  onChange={(e) =>
                    setResourceData({
                      ...resourceData,
                      description: e.target.value,
                    })
                  }
                  onClick={(e) => e.stopPropagation()}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddResource();
                    }}
                    disabled={
                      isResourceCreating ||
                      !resourceData.name ||
                      !resourceData.description
                    }
                    className="btn btn-primary btn-sm flex-1"
                  >
                    {isResourceCreating ? (
                      <>
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Adding...
                      </>
                    ) : (
                      "Add"
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setResourceData({ name: "", description: "" });
                    }}
                    className="btn btn-ghost btn-sm"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Resources List */}
          <div className="max-h-48 overflow-y-auto">
            {isResourceLoading ? (
              <div className="p-4 text-center">
                <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                <p className="text-sm text-gray-500 mt-2">
                  Loading resources...
                </p>
              </div>
            ) : filteredResourceItems.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                {searchTerm ? "No resources found" : "No resources available"}
              </div>
            ) : (
              filteredResourceItems.map((item) => (
                <div
                  key={item._id}
                  className={`w-full p-3 flex items-center justify-between hover:bg-base-200 ${
                    isResourceSelected(item) ? "bg-primary bg-opacity-10" : ""
                  }`}
                >
                  <div
                    className="flex-1 cursor-pointer"
                    onClick={() => handleResourceToggle(item)}
                  >
                    <div className="font-medium">{item.name}</div>
                    {item.description && (
                      <div className="text-sm text-gray-500">
                        {item.description}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 ml-2">
                    {isResourceSelected(item) && (
                      <Check className="h-4 w-4 text-primary" />
                    )}
                    <button
                      onClick={(e) => {
                        setResourceToDelete(item);
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      className="btn btn-ghost btn-xs p-0 text-red-500"
                      title="Delete resource"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
      )}

      {/* Delete Confirmation Modal */}
      {resourceToDelete && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg">Confirm Delete</h3>
            <p className="py-4">
              Are you sure you want to delete resource{" "}
              <strong>{resourceToDelete.name}</strong>?
            </p>
            <div className="modal-action">
              <button className="btn" onClick={() => setResourceToDelete(null)}>
                No
              </button>
              <button
                className="btn btn-error"
                onClick={(e) => {
                  confirmDelete();
                  e.preventDefault();

                  e.stopPropagation();
                }}
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcePicker;
