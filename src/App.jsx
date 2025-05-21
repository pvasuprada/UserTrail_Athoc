import ArcGISMap from "./components/Map";

function App() {
  return (
    <div
      style={{
        width: "100%",
        height: "100vh",
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflow: "hidden",
      }}
    >
      <ArcGISMap />
    </div>
  );
}

export default App;
