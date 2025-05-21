import { useEffect, useRef } from "react";
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import esriConfig from "@arcgis/core/config";
import Basemap from "@arcgis/core/Basemap";
import WebTileLayer from "@arcgis/core/layers/WebTileLayer";
import Graphic from "@arcgis/core/Graphic";
import Point from "@arcgis/core/geometry/Point";
import PictureMarkerSymbol from "@arcgis/core/symbols/PictureMarkerSymbol";
import PopupTemplate from "@arcgis/core/PopupTemplate";
import { geojsonData } from "../userslocations/alluserslocations";
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

      addUserLocationMarkers(view);

      return () => {
        if (view) {
          view.destroy();
        }
      };
    }
  }, []);

  const addUserLocationMarkers = async (view) => {
    // Create SVG data URLs for different colors
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

    // Create symbols for users A and B
    const symbolA = new PictureMarkerSymbol({
      url: createColoredSvgUrl("#FF0000"),
      width: "32px",
      height: "32px",
    });

    const symbolB = new PictureMarkerSymbol({
      url: createColoredSvgUrl("#0000FF"),
      width: "32px",
      height: "32px",
    });

    // Create popup template
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
    });

    //Another Geocoding API - Not having good address - So deleted
    const getAddress = async (longitude, latitude) => {
      try {
        const response = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
        );
        const data = await response.json();
        console.log(data);
        return (
          data?.localityInfo?.administrative[
            data?.localityInfo?.administrative.length - 1
          ]?.name || "Address not found"
        );
      } catch (error) {
        console.error("Error fetching address:", error);
        return "Address not found";
      }
    };

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
        console.log("Fetched address:", data.display_name);
        return data?.display_name || "Address not found";
      } catch (error) {
        console.error("Error fetching address:", error);
        return "Address not found";
      }
    };

    // Add points and fetch addresses
    for (const feature of geojsonData.features) {
      const point = new Point({
        longitude: feature.geometry.coordinates[0],
        latitude: feature.geometry.coordinates[1],
      });

      // Create graphic with initial "Loading..." address
      const graphic = new Graphic({
        geometry: point,
        symbol: feature.properties.user === "A" ? symbolA : symbolB,
        attributes: {
          user: feature.properties.user,
          longitude: feature.geometry.coordinates[0],
          latitude: feature.geometry.coordinates[1],
          address: "Loading address...",
        },
        popupTemplate: popupTemplate,
      });

      view.graphics.add(graphic);

      // Fetch and update address asynchronously
      try {
        const address = await getThrottledAddress(
          feature.geometry.coordinates[0],
          feature.geometry.coordinates[1]
        );
        graphic.attributes.address = address;
        await delay(1000);
      } catch (error) {
        console.error("Error updating address:", error);
      }
    }

    // Zoom to all graphics
    const allPoints = geojsonData.features.map((feature) => ({
      type: "point",
      longitude: feature.geometry.coordinates[0],
      latitude: feature.geometry.coordinates[1],
    }));

    view.goTo(allPoints, { padding: 50 });
  };

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
