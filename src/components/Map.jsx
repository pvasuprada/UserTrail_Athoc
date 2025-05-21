import { useEffect, useRef } from "react";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import esriConfig from "@arcgis/core/config";
import Basemap from "@arcgis/core/Basemap";
import WebTileLayer from "@arcgis/core/layers/WebTileLayer";

// Set the base URL for ArcGIS API assets
esriConfig.assetsPath = "https://js.arcgis.com/4.28/@arcgis/core/assets";

const ArcGISMap = () => {
  const mapDiv = useRef(null);

  useEffect(() => {
    if (mapDiv.current) {
      // Create OSM basemap
      const osmBasemap = new Basemap({
        baseLayers: [
          new WebTileLayer({
            urlTemplate:
              "https://{subDomain}.tile.openstreetmap.org/{level}/{col}/{row}.png",
            subDomains: ["a", "b", "c"],
            copyright: "© OpenStreetMap contributors",
          }),
        ],
      });

      const map = new Map({
        basemap: osmBasemap,
      });

      const view = new MapView({
        container: mapDiv.current,
        map: map,
        zoom: 15,
        center: [78.3816, 17.4484],
        padding: {
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        },
      });

      // Force the view to resize and redraw
      view.when(() => {
        view.padding = {
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        };
        view.resize();
      });

      return () => {
        if (view) {
          view.destroy();
        }
      };
    }
  }, []);

  return (
    <div
      ref={mapDiv}
      style={{
        width: "100%",
        height: "100%",
        position: "absolute",
        top: 0,
        bottom: 0,
        left: 0,
        right: 0,
      }}
    />
  );
};

export default ArcGISMap;
