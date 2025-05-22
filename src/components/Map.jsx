import { useEffect, useRef, useState } from "react";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import esriConfig from "@arcgis/core/config";
import Basemap from "@arcgis/core/Basemap";
import WebTileLayer from "@arcgis/core/layers/WebTileLayer";
import Graphic from "@arcgis/core/Graphic";
import Point from "@arcgis/core/geometry/Point";
import PictureMarkerSymbol from "@arcgis/core/symbols/PictureMarkerSymbol";
import PopupTemplate from "@arcgis/core/PopupTemplate";
import Polyline from "@arcgis/core/geometry/Polyline";
import { geojsonData } from "../userslocations/alluserslocations";
import TextSymbol from "@arcgis/core/symbols/TextSymbol";
esriConfig.assetsPath = "https://js.arcgis.com/4.28/@arcgis/core/assets";

const ArcGISMap = () => {
  const mapDiv = useRef(null);
  const [showTrail, setShowTrail] = useState(false);
  const viewRef = useRef(null);

  const userColors = {
    A: "#FF0000", // Red
    B: "#0000FF", // Blue
    C: "#00FF00", // Green
    D: "#FFA500", // Orange
    E: "#800080", // Purple
    F: "#008080", // Teal
  };

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
        zoom: 16,
        center: [78.3816, 17.4484],
        popup: {
          dockEnabled: true,
          dockOptions: {
            buttonEnabled: false,
            breakpoint: false,
            position: "top-right",
          },
        },
      });

      viewRef.current = view;

      addUserLocationMarkers(view);
      showUserTrail(view);

      return () => {
        if (view) {
          view.destroy();
        }
      };
    }
  }, []);

  useEffect(() => {
    if (viewRef.current) {
      showUserTrail(viewRef.current);
    }
  }, [showTrail]);

  const addUserLocationMarkers = async (view) => {
    const createColoredSvgUrl = (color) => {
      const svg = `<?xml version="1.0" encoding="UTF-8"?>
        <svg width="32" height="32" version="1.1" viewBox="0 0 53.545 53.545" xmlns="http://www.w3.org/2000/svg">
          <g fill="${color}">
            <circle cx="26.686" cy="4.507" r="4.507"/>
            <path d="m28.256 11.163c-1.123-0.228-2.344-0.218-3.447 0.042-7.493 0.878-9.926 9.551-9.239 16.164 0.298 2.859 4.805 2.889 4.504 0-0.25-2.41-0.143-6.047 1.138-8.632v9.425c0 0.111 0.011 0.215 0.016 0.322-0.003 0.051-0.015 0.094-0.015 0.146 0 7.479-0.013 14.955-0.322 22.428-0.137 3.322 5.014 3.309 5.15 0 0.242-5.857 0.303-11.717 0.317-17.578 0.244 0.016 0.488 0.016 0.732 0.002 0.015 5.861 0.074 11.721 0.314 17.576 0.137 3.309 5.288 3.322 5.15 0-0.309-7.473-0.32-14.949-0.32-22.428 0-0.232-0.031-0.443-0.078-0.646-0.007-3.247-0.131-6.497-0.093-9.742 1.534 2.597 1.674 6.558 1.408 9.125-0.302 2.887 4.206 2.858 4.504 0 0.686-6.614-1.864-15.387-9.736-15.943z"/>
          </g>
        </svg>`;
      return `data:image/svg+xml;base64,${btoa(svg)}`;
    };

    const userSymbols = {};
    Object.entries(userColors).forEach(([user, color]) => {
      userSymbols[user] = new PictureMarkerSymbol({
        url: createColoredSvgUrl(color),
        width: "32px",
        height: "32px",
      });
    });

    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    const getThrottledAddress = async (longitude, latitude) => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
          {
            headers: {
              "User-Agent": "YourAppName/1.0 (your@email.com)",
            },
          }
        );
        const data = await response.json();
        return data?.display_name || "Address not found";
      } catch (error) {
        console.error("Error fetching address:", error);
        return "Address not found";
      }
    };

    const popupTemplate = new PopupTemplate({
      title: "User Location Details",
      content: [
        {
          type: "fields",
          fieldInfos: [
            {
              fieldName: "user",
              label: "User",
              visible: true,
            },
            {
              fieldName: "longitude",
              label: "Longitude",
              visible: true,
              format: {
                places: 6,
              },
            },
            {
              fieldName: "latitude",
              label: "Latitude",
              visible: true,
              format: {
                places: 6,
              },
            },
            {
              fieldName: "address",
              label: "Address",
              visible: true,
            },
          ],
        },
      ],
      actions: [],
    });

    // Add click event handler for address loading
    view.on("click", async (event) => {
      const response = await view.hitTest(event);
      const graphic = response.results[0]?.graphic;

      if (graphic?.attributes?.user && !graphic.attributes.addressLoaded) {
        graphic.attributes.address = "Loading address...";
        const address = await getThrottledAddress(
          graphic.attributes.longitude,
          graphic.attributes.latitude
        );
        graphic.attributes.address = address;
        graphic.attributes.addressLoaded = true;
      }
    });

    // Add markers one by one with animation
    for (const feature of geojsonData.features) {
      await delay(300); // Wait 100ms between each marker

      const point = new Point({
        longitude: feature.geometry.coordinates[0],
        latitude: feature.geometry.coordinates[1],
      });

      const graphic = new Graphic({
        geometry: point,
        symbol: userSymbols[feature.properties.user],
        attributes: {
          user: feature.properties.user,
          longitude: feature.geometry.coordinates[0],
          latitude: feature.geometry.coordinates[1],
          address: "Click to load address",
          addressLoaded: false,
        },
        popupTemplate: popupTemplate,
      });

      const textSymbol = new TextSymbol({
        text: feature.properties.user,
        color: "black",
        haloColor: "white",
        haloSize: "1px",
        yoffset: 15,
        font: {
          size: 10,
          family: "sans-serif",
        },
      });

      const textGraphic = new Graphic({
        geometry: point,
        symbol: textSymbol,
      });

      view.graphics.addMany([graphic, textGraphic]);
    }

    const allPoints = geojsonData.features.map((feature) => ({
      type: "point",
      longitude: feature.geometry.coordinates[0],
      latitude: feature.geometry.coordinates[1],
    }));

    view.goTo(allPoints, { padding: 50 });
  };

  const showUserTrail = (view) => {
    view.graphics.removeMany(
      view.graphics.filter((g) => g.attributes?.type === "trail")
    );

    if (!showTrail) return;

    // Get only visible points
    const visibleGraphics = view.graphics.filter((graphic) => {
      return (
        graphic.visible &&
        graphic.attributes?.user &&
        !graphic.symbol?.type?.includes("text")
      );
    });

    // Group visible points by user
    const userGroups = {};
    visibleGraphics.forEach((graphic) => {
      const user = graphic.attributes.user;
      if (!userGroups[user]) {
        userGroups[user] = [];
      }
      userGroups[user].push([
        graphic.geometry.longitude,
        graphic.geometry.latitude,
      ]);
    });

    // Draw trails for visible points
    Object.entries(userGroups).forEach(([user, coordinates]) => {
      if (coordinates.length < 2) return; // Need at least 2 points for a trail

      const polyline = new Polyline({
        paths: [coordinates],
        spatialReference: { wkid: 4326 },
      });

      const trailGraphic = new Graphic({
        geometry: polyline,
        symbol: {
          type: "simple-line",
          color: [...hexToRgb(userColors[user]), 0.6],
          width: 4,
          style: "short-dot",
        },
        attributes: {
          type: "trail",
          user: user,
        },
      });

      view.graphics.add(trailGraphic);
    });
  };

  // Add view extent change handler to update trails
  useEffect(() => {
    if (viewRef.current) {
      viewRef.current.watch("extent", () => {
        if (showTrail) {
          showUserTrail(viewRef.current);
        }
      });
    }
  }, [showTrail]);

  const hexToRgb = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
        ]
      : [0, 0, 0];
  };

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
    </>
  );
};

export default ArcGISMap;
