import { useEffect, useState } from "react";
import Point from "@arcgis/core/geometry/Point";
import { geojsonData } from "../userslocations/alluserslocations";
import { useMapView } from "../hooks/useMapView";
import { MapControls } from "./MapControls";
import {
  createMarkerGraphic,
  createTextGraphic,
  createUserSymbols,
  setupAddressLoading,
  updateMarkerVisibility,
  updateTrails,
} from "../services/mapService";

const ArcGISMap = () => {
  const [showTrail, setShowTrail] = useState(false);
  const { mapDiv, viewRef, mapStatus } = useMapView();

  useEffect(() => {
    if (viewRef.current) {
      updateTrails(viewRef.current, showTrail);
    }
  }, [showTrail]);

  const addUserLocationMarkers = async (view) => {
    const userSymbols = createUserSymbols();

    for (const feature of geojsonData.features) {
      const point = new Point({
        longitude: feature.geometry.coordinates[0],
        latitude: feature.geometry.coordinates[1],
      });

      const graphic = createMarkerGraphic(
        point,
        userSymbols[feature.properties.user],
        {
          user: feature.properties.user,
          longitude: feature.geometry.coordinates[0],
          latitude: feature.geometry.coordinates[1],
          address: "Loading address",
          addressLoaded: false,
        }
      );

      const textGraphic = createTextGraphic(point, feature.properties.user);
      view.graphics.addMany([graphic, textGraphic]);

      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const allPoints = geojsonData.features.map((feature) => ({
      type: "point",
      longitude: feature.geometry.coordinates[0],
      latitude: feature.geometry.coordinates[1],
    }));

    view.goTo(allPoints, { padding: 50 });
  };

  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.watch("zoom", (newZoom) => {
        updateMarkerVisibility(viewRef.current, newZoom);
      });

      viewRef.current.when(() => {
        addUserLocationMarkers(viewRef.current);
        setupAddressLoading(viewRef.current);
        updateMarkerVisibility(viewRef.current, viewRef.current.zoom);
      });
    }
  }, []);

  const zoomToUsers = () => {
    if (!viewRef.current) return;

    const allGraphics = viewRef.current.graphics.filter(
      (graphic) => !graphic.symbol?.type?.includes("text")
    );

    if (allGraphics.length > 0) {
      viewRef.current.goTo(allGraphics, {
        padding: 50,
        duration: 1000,
      });
    }
  };

  return (
    <>
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
      <MapControls
        showTrail={showTrail}
        setShowTrail={setShowTrail}
        zoomToUsers={zoomToUsers}
        mapStatus={mapStatus}
      />
    </>
  );
};

export default ArcGISMap;
