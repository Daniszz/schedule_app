import ForceGraph2D from "react-force-graph-2d";

const GraphBlob = () => {
  const data = {
    nodes: [{ id: "A" }, { id: "B" }, { id: "C" }, { id: "D" }],
    links: [
      { source: "A", target: "B" },
      { source: "A", target: "C" },
      { source: "B", target: "D" },
    ],
  };

  return (
    <div className="absolute top-0 left-0 w-full h-full z-0 opacity-30 pointer-events-none">
      <ForceGraph2D
        graphData={data}
        nodeAutoColorBy="id"
        linkColor={() => "rgba(0,0,0,0.2)"}
        backgroundColor="transparent"
      />
    </div>
  );
};

export default GraphBlob;
