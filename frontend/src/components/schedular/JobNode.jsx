import React, { useState } from "react";
import { Handle, Position, useReactFlow } from "reactflow";
import { useJobStore } from "../../store/useJobStore";
import { useConflictStore } from "../../store/useConflictStore";
import { Trash, Pencil } from "lucide-react";

export default function JobNode({ data, id }) {
  const { fetchConflicts } = useConflictStore();
  const { setNodes } = useReactFlow();
  const { updateJob, deleteJob, isJobUpdating, isJobDeleting } = useJobStore();
  const [editData, setEditData] = useState({
    name: data.name,
    gain: data.gain,
    processing_time: data.processing_time,
  });

  const handleSave = async () => {
    try {
      await updateJob(data._id, editData);
      setNodes((nodes) =>
        nodes.map((node) =>
          node.id === id
            ? {
                ...node,
                data: {
                  ...node.data,
                  name: editData.name,
                  gain: editData.gain,
                  processing_time: editData.processing_time,
                  isEditing: false,
                },
              }
            : node
        )
      );
    } catch (error) {
      console.error("Failed to save job:", error);
    }
  };

  const handleEdit = () => {
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, isEditing: true } }
          : node
      )
    );
  };

  const handleCancel = () => {
    setEditData({
      name: data.name,
      gain: data.gain,
      processing_time: data.processing_time,
    });
    setNodes((nodes) =>
      nodes.map((node) =>
        node.id === id
          ? { ...node, data: { ...node.data, isEditing: false } }
          : node
      )
    );
  };

  const handleDelete = async () => {
    try {
      await deleteJob(data._id);
      setNodes((nodes) => nodes.filter((node) => node.id !== id));
      await fetchConflicts();
    } catch (error) {
      console.error("Failed to delete job:", error);
    }
  };

  if (data.isEditing) {
    return (
      <div className="card bg-base-100 shadow-xl border-2 border-primary p-4 min-w-[200px]">
        <Handle type="target" position={Position.Top} />
        <div className="space-y-2">
          <input
            type="text"
            value={editData.name}
            onChange={(e) => setEditData({ ...editData, name: e.target.value })}
            placeholder="Job name"
            className="input input-bordered input-sm w-full"
          />
          <input
            type="number"
            value={editData.gain}
            onChange={(e) =>
              setEditData({ ...editData, gain: Number(e.target.value) })
            }
            placeholder="Gain"
            className="input input-bordered input-sm w-full"
          />
          <input
            type="number"
            value={editData.processing_time}
            onChange={(e) =>
              setEditData({
                ...editData,
                processing_time: Number(e.target.value),
              })
            }
            placeholder="Processing time"
            className="input input-bordered input-sm w-full"
          />
          <div className="flex gap-1">
            <button
              onClick={handleSave}
              className="btn btn-success btn-sm flex-1"
              disabled={isJobUpdating}
            >
              {isJobUpdating ? "..." : "✓"}
            </button>
            <button
              onClick={handleCancel}
              className="btn btn-outline btn-sm flex-1"
            >
              ✕
            </button>
          </div>
        </div>
        <Handle type="source" position={Position.Bottom} />
      </div>
    );
  }

  return (
    <div
      className="card shadow-lg hover:shadow-xl transition-all border-2 p-3 min-w-[180px]"
      style={{
        backgroundColor: data.nodeColor || "#ffffff",
        borderColor: data.nodeColor ? "#374151" : "#d1d5db",
        color: data.nodeColor ? "#ffffff" : "#000000",
      }}
    >
      <Handle type="target" position={Position.Top} />
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-sm truncate">{data.name}</h3>
          <div className="flex gap-1">
            <button
              onClick={handleEdit}
              className="btn btn-ghost btn-xs"
              style={{ color: data.nodeColor ? "#ffffff" : "#000000" }}
            >
              <Pencil size={16} color="black" />
            </button>
            <button
              onClick={handleDelete}
              className="btn btn-ghost btn-xs text-error"
              style={{ color: data.nodeColor ? "#ffffff" : "#ef4444" }}
              disabled={isJobDeleting}
            >
              {isJobDeleting ? "..." : <Trash size={16} color="black" />}
            </button>
          </div>
        </div>
        <div className="flex gap-2">
          <div
            className="badge badge-sm"
            style={{
              backgroundColor: data.nodeColor
                ? "rgba(255,255,255,0.2)"
                : undefined,
              color: data.nodeColor ? "#ffffff" : undefined,
              borderColor: data.nodeColor ? "rgba(255,255,255,0.3)" : undefined,
            }}
          >
            Gain: {data.gain}
          </div>
          <div
            className="badge badge-outline badge-sm"
            style={{
              backgroundColor: data.nodeColor
                ? "rgba(255,255,255,0.2)"
                : undefined,
              color: data.nodeColor ? "#ffffff" : undefined,
              borderColor: data.nodeColor ? "rgba(255,255,255,0.3)" : undefined,
            }}
          >
            Time: {data.processing_time}
          </div>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}
