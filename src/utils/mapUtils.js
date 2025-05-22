import Point from "@arcgis/core/geometry/Point";

export const getCenterPoint = (points) => {
  const sumLon = points.reduce((sum, point) => sum + point.longitude, 0);
  const sumLat = points.reduce((sum, point) => sum + point.latitude, 0);
  return new Point({
    longitude: sumLon / points.length,
    latitude: sumLat / points.length,
  });
};

export const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [
        parseInt(result[1], 16),
        parseInt(result[2], 16),
        parseInt(result[3], 16),
      ]
    : [0, 0, 0];
};

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const getThrottledAddress = async (longitude, latitude) => {
  try {
    await delay(1000);
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
      {
        headers: {
          "User-Agent": "YourAppName/1.0",
        },
      }
    );
    const data = await response.json();
    return data?.display_name || "Address not found";
  } catch {
    return "Address not found";
  }
};
