import Graphic from "@arcgis/core/Graphic";
import Point from "@arcgis/core/geometry/Point";
import PictureMarkerSymbol from "@arcgis/core/symbols/PictureMarkerSymbol";
import PopupTemplate from "@arcgis/core/PopupTemplate";
import TextSymbol from "@arcgis/core/symbols/TextSymbol";
import Polyline from "@arcgis/core/geometry/Polyline";
import { USER_COLORS, ZOOM_THRESHOLD } from "../constants/mapConstants";
import {
  getCenterPoint,
  hexToRgb,
  getThrottledAddress,
} from "../utils/mapUtils";

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

const createGroupMarkerSymbol = () => {
  const svg = `<?xml version="1.0" encoding="iso-8859-1"?>
    <svg fill="#4CAF50" height="32px" width="32px" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 611.998 611.998">
      <g>
        <g>
          <path d="M382.167,150.945c9.702,10.875,16.557,24.306,20.381,39.921c3.629,14.822,4.44,31.308,2.414,49.006 c-0.751,6.546-1.861,13.96-3.479,21.802c12.532,12.135,28.95,19.839,50.296,19.838c59.22-0.005,80.529-59.3,86.105-108.006 c6.872-60.004-21.498-105.163-86.105-105.163c-50.698,0-79.079,27.82-85.628,68.798 C372.076,141.062,377.449,145.655,382.167,150.945z"/>
          <path d="M611.973,422.704c-0.645-18.899-2.861-37.887-6.161-56.495c-3.992-22.539-9.08-55.585-28.759-70.275 c-11.38-8.491-26.117-11.278-39.143-16.398c-6.343-2.492-12.024-4.967-17.354-7.784c-17.995,19.734-41.459,30.055-68.782,30.057 c-21.261,0-40.172-6.281-56.001-18.358c-3.644,11.272-8.522,22.623-15.044,32.994c5.728,3.449,11.923,6.204,19.451,9.162 c3.332,1.31,6.99,2.506,10.864,3.771c10.472,3.422,22.339,7.301,32.994,15.255c25.329,18.907,31.564,54.336,36.117,80.207 l0.49,2.792c2.355,13.266,4.084,26.299,5.197,38.961c20.215-2.071,40.327-5.61,60.047-9.774 c15.941-3.365,31.774-7.471,47.109-13.003C605.247,439.397,612.476,437.343,611.973,422.704z"/>
          <path d="M160.216,281.511c21.345,0.002,37.762-7.703,50.295-19.838c-1.618-7.841-2.728-15.256-3.479-21.802 c-2.026-17.697-1.214-34.184,2.414-49.006c3.823-15.614,10.679-29.046,20.381-39.921c4.718-5.291,10.09-9.884,16.014-13.805 c-6.549-40.978-34.93-68.798-85.628-68.798c-64.606,0-92.977,45.16-86.106,105.163 C79.687,222.212,100.996,281.507,160.216,281.511z"/>
          <path d="M167.957,344.634c10.655-7.954,22.524-11.833,32.994-15.255c3.875-1.265,7.531-2.461,10.864-3.771 c7.528-2.957,13.725-5.711,19.451-9.162c-6.52-10.369-11.4-21.722-15.043-32.994c-15.829,12.077-34.741,18.358-56.001,18.358 c-27.322-0.001-50.788-10.324-68.782-30.057c-5.329,2.817-11.012,5.291-17.354,7.784c-13.026,5.12-27.763,7.907-39.143,16.398 c-19.678,14.691-24.767,47.735-28.759,70.275c-3.3,18.607-5.516,37.595-6.161,56.495c-0.502,14.64,6.726,16.693,18.974,21.112 c15.334,5.531,31.17,9.637,47.109,13.003c19.72,4.165,39.833,7.704,60.047,9.774c1.112-12.662,2.841-25.693,5.197-38.961 l0.49-2.792C136.394,398.971,142.628,363.541,167.957,344.634z"/>
          <path d="M470.351,429.405l-0.493-2.805c-4.258-24.197-10.091-57.334-32.191-73.832c-9.321-6.957-19.872-10.404-30.078-13.74 c-4.019-1.313-7.812-2.554-11.427-3.974c-5.269-2.07-10.016-4.097-14.464-6.338c-18.684,24.932-44.58,38.059-75.383,38.062 c-30.795,0-56.687-13.128-75.371-38.062c-4.449,2.243-9.196,4.269-14.467,6.34c-3.61,1.418-7.406,2.659-11.424,3.972 c-10.207,3.335-20.761,6.784-30.079,13.74c-22.107,16.5-27.936,49.645-32.193,73.846l-0.493,2.795 c-3.557,20.086-5.68,39.572-6.308,57.914c-0.737,21.519,12.62,26.316,24.403,30.55l1.269,0.457 c14.17,5.112,30.021,9.492,48.457,13.388c37.646,7.946,68.197,11.74,96.138,11.938h0.072h0.072 c27.946-0.199,58.495-3.992,96.135-11.938c18.439-3.894,34.289-8.274,48.453-13.387l1.268-0.456 c11.786-4.233,25.147-9.029,24.41-30.553C476.03,468.931,473.906,449.447,470.351,429.405z"/>
          <path d="M221.005,243.009c5.577,48.709,26.883,108.009,86.103,108.006s80.529-59.297,86.106-108.006 c6.871-60.002-21.503-105.16-86.106-105.16C242.515,137.847,214.123,183.002,221.005,243.009z"/>
        </g>
      </g>
    </svg>`;
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

const popupTemplate = new PopupTemplate({
  title: "User {user} Location",
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

export const createUserSymbols = () => {
  const userSymbols = {};
  Object.entries(USER_COLORS).forEach(([user, color]) => {
    userSymbols[user] = new PictureMarkerSymbol({
      url: createColoredSvgUrl(color),
      width: "32px",
      height: "32px",
    });
  });
  return userSymbols;
};

export const createMarkerGraphic = (point, symbol, attributes) => {
  return new Graphic({
    geometry: point,
    symbol,
    attributes,
    popupTemplate,
  });
};

export const createTextGraphic = (point, text) => {
  const textSymbol = new TextSymbol({
    text,
    color: "black",
    haloColor: "white",
    haloSize: "1px",
    yoffset: 15,
    font: {
      size: 10,
      family: "sans-serif",
    },
  });

  return new Graphic({
    geometry: point,
    symbol: textSymbol,
  });
};

export const createGroupMarker = (centerPoint, users) => {
  const groupSymbol = new PictureMarkerSymbol({
    url: createGroupMarkerSymbol(),
    width: "48px",
    height: "48px",
  });

  return new Graphic({
    geometry: centerPoint,
    symbol: groupSymbol,
    attributes: {
      isGroupMarker: true,
      users,
      type: "group",
      userCount: users.length,
      userList: users.map((user) => `• User ${user}`).join("\n"),
    },
    popupTemplate: new PopupTemplate({
      title: "{userCount} Users in this Area",
      content: [
        {
          type: "text",
          text: "{userList}",
        },
      ],
    }),
  });
};

export const setupAddressLoading = (view) => {
  view.on("click", async (event) => {
    const response = await view.hitTest(event);
    const graphic = response.results[0]?.graphic;

    if (
      graphic?.attributes?.user &&
      !graphic.attributes?.isGroupMarker &&
      !graphic.attributes?.addressLoaded
    ) {
      const address = await getThrottledAddress(
        graphic.attributes.longitude,
        graphic.attributes.latitude
      );
      graphic.attributes.address = address;
      graphic.attributes.addressLoaded = true;
      view.popup.visible = false;
      view.popup.open({
        features: [graphic],
      });
    }
  });
};

export const updateMarkerVisibility = (view, zoom) => {
  const showGrouped = zoom < ZOOM_THRESHOLD;

  const individualMarkers = view.graphics.filter(
    (g) => g.attributes?.user && !g.attributes?.isGroupMarker
  );

  const labelMarkers = view.graphics.filter((g) => g.symbol?.type === "text");

  let groupMarker = view.graphics.find((g) => g.attributes?.isGroupMarker);

  if (showGrouped) {
    individualMarkers.forEach((m) => {
      m.visible = false;
    });
    labelMarkers.forEach((m) => {
      m.visible = false;
    });

    if (!groupMarker) {
      const userLocations = {};
      individualMarkers.forEach((marker) => {
        const user = marker.attributes.user;
        if (!userLocations[user]) {
          userLocations[user] = [];
        }
        userLocations[user].push([
          marker.geometry.longitude,
          marker.geometry.latitude,
        ]);
      });

      const users = Object.keys(userLocations);
      const centerPoint = getCenterPoint(
        individualMarkers.map((m) => m.geometry)
      );

      groupMarker = createGroupMarker(centerPoint, users);
      view.graphics.add(groupMarker);
    }

    groupMarker.visible = true;
  } else {
    individualMarkers.forEach((m) => (m.visible = true));
    labelMarkers.forEach((m) => (m.visible = true));

    if (groupMarker) {
      groupMarker.visible = false;
    }
  }
};

export const updateTrails = (view, showTrail) => {
  const existingTrails = view.graphics.filter(
    (g) => g.attributes?.type === "trail"
  );
  view.graphics.removeMany(existingTrails);

  if (!showTrail) return;

  const visibleGraphics = view.graphics.filter((graphic) => {
    return (
      graphic.visible &&
      graphic.attributes?.user &&
      !graphic.symbol?.type?.includes("text")
    );
  });

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

  Object.entries(userGroups).forEach(([user, coordinates]) => {
    if (coordinates.length < 2) return;

    const polyline = new Polyline({
      paths: [coordinates],
      spatialReference: { wkid: 4326 },
    });

    const trailGraphic = new Graphic({
      geometry: polyline,
      symbol: {
        type: "simple-line",
        color: [...hexToRgb(USER_COLORS[user]), 0.6],
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
