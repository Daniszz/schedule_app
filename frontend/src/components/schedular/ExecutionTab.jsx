import React from "react";
import { Download, Play, ArrowLeft } from "lucide-react";
import { toPng } from "html-to-image";

export default function ExecutionTab({
  currentSchedule,
  currentResult,
  jobs,
  isScheduleRunning,
  isViewingResultMode,
  handleRunSchedule,
  backToEditingMode,
}) {
  const downloadSnapshot = async () => {
    try {
      const flowElement = document.querySelector(".react-flow");
      if (!flowElement) {
        console.warn("React Flow element not found");
        return;
      }

      // Stiluri îmbunătățite pentru noduri
      const style = document.createElement("style");
      style.innerHTML = `
        /* Stiluri pentru nodurile React Flow în snapshot */
        .react-flow__node {
          overflow: visible !important;
          white-space: normal !important;
          word-wrap: break-word !important;
          box-sizing: border-box !important;
          padding: 8px 12px !important;
          min-width: 180px !important;
          max-width: 220px !important;
          display: flex !important;
          flex-direction: column !important;
          align-items: center !important;
          justify-content: flex-start !important;
          text-align: center !important;
          height: auto !important;
          min-height: 100px !important;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif !important;
        }
        
        .react-flow__node .card {
          width: 100% !important;
          height: 100% !important;
          display: flex !important;
          flex-direction: column !important;
          justify-content: flex-start !important;
          align-items: center !important;
          padding: 8px 12px !important;
          box-sizing: border-box !important;
        }
        
        .react-flow__node h3 {
          font-size: 14px !important;
          font-weight: 600 !important;
          margin: 4px 0 6px 0 !important;
          line-height: 1.3 !important;
          text-align: center !important;
          word-break: break-word !important;
        }
        
        .react-flow__node .badge {
          display: inline-block !important;
          padding: 3px 6px !important;
          margin: 1px !important;
          border-radius: 12px !important;
          font-size: 10px !important;
          font-weight: 500 !important;
          white-space: nowrap !important;
          line-height: 1.2 !important;
        }
        
        .react-flow__node .flex {
          display: flex !important;
          flex-wrap: wrap !important;
          justify-content: center !important;
          gap: 3px !important;
          width: 100% !important;
        }
        
        .react-flow__node .space-y-2 > * {
          margin-bottom: 6px !important;
        }
        
        .react-flow__node .space-y-2 > *:last-child {
          margin-bottom: 0 !important;
        }
        
        /* Stiluri pentru textul de pe muchii */
        .react-flow__edge-text {
          fill: #ffffff !important;
          font-weight: 600 !important;
          font-size: 12px !important;
          text-shadow: 1px 1px 2px rgba(0,0,0,0.8) !important;
        }
        
        .react-flow__edge-textbg {
          fill: rgba(0,0,0,0.7) !important;
          rx: 4 !important;
          ry: 4 !important;
        }
      `;

      document.head.appendChild(style);

      // Capturăm doar flow-ul
      const flowDataUrl = await toPng(flowElement, {
        quality: 1,
        pixelRatio: 2,
        backgroundColor: "#ffffff",
        filter: (node) => {
          if (node.classList?.contains("react-flow__controls")) return false;
          if (node.classList?.contains("react-flow__minimap")) return false;
          if (node.classList?.contains("react-flow__attribution")) return false;
          return true;
        },
      });

      // Curățăm stilul temporar
      document.head.removeChild(style);

      // Dacă suntem în modul de vizualizare rezultate, creăm canvas combinat
      if (currentResult && isViewingResultMode) {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");

        // Încărcăm imaginea flow-ului
        const flowImg = new Image();
        await new Promise((resolve) => {
          flowImg.onload = resolve;
          flowImg.src = flowDataUrl;
        });

        // Calculăm dimensiunile pentru canvas
        const padding = 40;
        const tableHeight = 200;
        canvas.width = Math.max(flowImg.width + padding * 2, 800);
        canvas.height = flowImg.height + tableHeight + padding * 3;

        // Fundal alb
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Desenăm flow-ul
        ctx.drawImage(flowImg, padding, padding);

        // Desenăm tabelul cu rezultate
        const tableY = flowImg.height + padding * 2;

        // Fundal tabel
        ctx.fillStyle = "#f8fafc";
        ctx.fillRect(
          padding,
          tableY,
          canvas.width - padding * 2,
          tableHeight - padding
        );

        // Border tabel
        ctx.strokeStyle = "#e2e8f0";
        ctx.lineWidth = 2;
        ctx.strokeRect(
          padding,
          tableY,
          canvas.width - padding * 2,
          tableHeight - padding
        );

        // Text pentru tabel
        const coloredJobs = currentResult?.fully_colored_jobs?.length || 0;
        const totalJobs = jobs.length;

        // Titlu
        ctx.fillStyle = "#1e293b";
        ctx.font = "bold 18px Arial";
        ctx.fillText("Rezultate Algoritm", padding + 20, tableY + 30);

        // Timestamp
        ctx.fillStyle = "#64748b";
        ctx.font = "12px Arial";
        const timestamp = new Date(currentResult.timestamp).toLocaleString(
          "ro-RO"
        );
        ctx.fillText(
          timestamp,
          canvas.width - padding - 20 - ctx.measureText(timestamp).width,
          tableY + 30
        );

        // Datele în coloane
        const startX = padding + 20;
        const startY = tableY + 60;
        const colWidth = (canvas.width - padding * 2 - 40) / 5;

        const data = [
          {
            label: "Algoritm",
            value: currentResult?.algorithm_used || "N/A",
            color: "#3b82f6",
          },
          {
            label: "Joburi Colorate",
            value: `${coloredJobs}/${totalJobs}`,
            color: "#10b981",
          },
          {
            label: "F1",
            value:
              currentResult?.f1 !== undefined
                ? currentResult.f1.toString()
                : "N/A",
            color: "#f59e0b",
          },
          {
            label: "F2",
            value:
              currentResult?.f2 !== undefined
                ? currentResult.f2.toString()
                : "N/A",
            color: "#ef4444",
          },
          {
            label: "F3",
            value:
              currentResult?.f3 !== undefined
                ? currentResult.f3.toString()
                : "N/A",
            color: "#8b5cf6",
          },
        ];

        data.forEach((item, index) => {
          const x = startX + index * colWidth;

          // Background pentru fiecare item
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(x, startY, colWidth - 10, 80);

          // Border colorat
          ctx.fillStyle = item.color;
          ctx.fillRect(x, startY, 4, 80);

          // Label
          ctx.fillStyle = "#64748b";
          ctx.font = "12px Arial";
          ctx.fillText(item.label, x + 12, startY + 20);

          // Value
          ctx.fillStyle = "#1e293b";
          ctx.font = "bold 16px Arial";
          const value = item.value.toString();
          ctx.fillText(value, x + 12, startY + 45);
        });

        // Convertim canvas-ul la PNG
        const combinedDataUrl = canvas.toDataURL("image/png");

        // Descărcăm imaginea combinată
        const link = document.createElement("a");
        const timestamp_file = new Date()
          .toISOString()
          .slice(0, 19)
          .replace(/:/g, "-");
        link.download = `schedule-result-${timestamp_file}.png`;
        link.href = combinedDataUrl;
        link.click();
      } else {
        // Dacă nu suntem în modul rezultate, doar descărcăm flow-ul
        const link = document.createElement("a");
        const timestamp = new Date()
          .toISOString()
          .slice(0, 19)
          .replace(/:/g, "-");
        link.download = `schedule-${timestamp}.png`;
        link.href = flowDataUrl;
        link.click();
      }
    } catch (error) {
      console.error("Failed to capture snapshot:", error);
    }
  };

  if (isViewingResultMode) {
    return (
      <div className="space-y-3">
        <button
          onClick={backToEditingMode}
          className="btn btn-info w-full btn-sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Editing
        </button>
        <button
          onClick={downloadSnapshot}
          className="btn btn-secondary w-full btn-sm"
        >
          <Download className="w-4 h-4 mr-2" />
          Download Snapshot
        </button>
        {currentResult && (
          <div className="card bg-base-200">
            <div className="card-body p-3">
              <h3 className="card-title text-sm mb-3">Latest Results</h3>

              <div className="space-y-2">
                <div>
                  <div className="text-xs font-semibold text-base-content/60 mb-1">
                    Algorithm
                  </div>
                  <div className="text-sm bg-base-100 rounded px-2 py-1">
                    {currentResult?.algorithm_used || "N/A"}
                  </div>
                </div>

                <div>
                  <div className="text-xs font-semibold text-base-content/60 mb-1">
                    Colored Jobs
                  </div>
                  <div className="text-sm bg-base-100 rounded px-2 py-1">
                    {currentResult?.fully_colored_jobs?.length || 0} /{" "}
                    {jobs.length}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {["f1", "f2", "f3"].map((f, index) => (
                    <div key={f} className="text-center">
                      <div className="text-xs font-semibold text-base-content/60">
                        {f.toUpperCase()}
                      </div>
                      <div className="text-sm text-base-content bg-base-100 rounded px-2 py-1">
                        {currentResult?.[f] !== undefined
                          ? currentResult[f]
                          : "N/A"}
                      </div>
                    </div>
                  ))}
                </div>

                {currentResult?.timestamp && (
                  <div className="text-xs text-base-content/60 text-center mt-2">
                    {new Date(currentResult.timestamp).toLocaleString()}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {currentSchedule ? (
        <div className="text-xs text-center font-medium bg-primary/10 text-primary rounded p-2">
          Schedule: {currentSchedule.name}
        </div>
      ) : (
        <div className="text-xs text-center text-base-content/60 bg-base-200 rounded p-2">
          No schedule saved yet
        </div>
      )}

      <button
        onClick={handleRunSchedule}
        className="btn btn-success w-full btn-sm"
        disabled={isScheduleRunning || jobs.length === 0 || !currentSchedule}
      >
        <Play className="w-4 h-4 mr-2" />
        {isScheduleRunning ? "Running..." : "Run Schedule"}
      </button>
    </div>
  );
}
