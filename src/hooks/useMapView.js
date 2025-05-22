import { useEffect, useRef, useState } from "react";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import esriConfig from "@arcgis/core/config";
import Basemap from "@arcgis/core/Basemap";
import WebTileLayer from "@arcgis/core/layers/WebTileLayer";
import { INITIAL_MAP_CONFIG } from "../constants/mapConstants";

esriConfig.assetsPath = "https://js.arcgis.com/4.28/@arcgis/core/assets";

export const useMapView = () => {
  const mapDiv = useRef(null);
  const viewRef = useRef(null);
  const [mapStatus, setMapStatus] = useState({
    latitude: 0,
    longitude: 0,
    zoom: INITIAL_MAP_CONFIG.zoom,
  });

  useEffect(() => {
    if (mapDiv.current) {
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
        zoom: INITIAL_MAP_CONFIG.zoom,
        center: INITIAL_MAP_CONFIG.center,
        popup: {
          dockEnabled: false,
          dockOptions: {
            buttonEnabled: false,
            breakpoint: false,
          },
          defaultPopupTemplateEnabled: true,
          alignment: "auto",
        },
      });

      viewRef.current = view;

      view.watch("zoom", (newZoom) => {
        setMapStatus((prev) => ({
          ...prev,
          zoom: Math.round(newZoom * 100) / 100,
        }));
      });

      view.on("pointer-move", (event) => {
        const point = view.toMap({ x: event.x, y: event.y });
        if (point) {
          setMapStatus((prev) => ({
            ...prev,
            longitude: Math.round(point.longitude * 100000) / 100000,
            latitude: Math.round(point.latitude * 100000) / 100000,
          }));
        }
      });

      return () => {
        if (view) {
          view.destroy();
        }
      };
    }
  }, []);

  return { mapDiv, viewRef, mapStatus };
};
