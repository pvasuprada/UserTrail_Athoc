export const MapControls = ({
  showTrail,
  setShowTrail,
  zoomToUsers,
  mapStatus,
}) => {
  return (
    <>
      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          zIndex: 1000,
          display: "flex",
          gap: "10px",
        }}
      >
        <button
          onClick={() => setShowTrail(!showTrail)}
          style={{
            padding: "8px 16px",
            backgroundColor: showTrail ? "#4CAF50" : "#f44336",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          }}
        >
          {showTrail ? "Hide Trail" : "Show Trail"}
        </button>
        <button
          onClick={zoomToUsers}
          style={{
            padding: "8px 16px",
            backgroundColor: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            display: "flex",
            alignItems: "center",
            gap: "5px",
          }}
        >
          Zoom to Users
        </button>
      </div>
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          right: "20px",
          zIndex: 1000,
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          padding: "8px 12px",
          borderRadius: "4px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          fontSize: "12px",
          fontFamily: "monospace",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          color: "#333333",
        }}
      >
        <div>Lat: {mapStatus.latitude}°</div>
        <div>Lon: {mapStatus.longitude}°</div>
        <div>Zoom: {mapStatus.zoom}</div>
      </div>
    </>
  );
};
