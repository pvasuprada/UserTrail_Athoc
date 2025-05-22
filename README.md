# 🗺️ User Trail Mapping App (Esri)

A React-based map visualization tool using the Esri JavaScript API, featuring user location trails, clustering, and rich map interactions.

---

## 🛠️ Setup Instructions

```bash
npm install       # Install the dependencies
npm start         # Start the development server
npm run build     # Build the production version
npm run lint      # Run linting
```

## 📦 Project Structure

Provide user trail on map using esri library. --- DONE
Blue dotted line - semi transparent color -— DONE
Line arrows for directions - light blue color
show text on top of User marker - DONE
Add a toggle button in the map to enable and disable trail --- DONE
Have a provision to enable user trail for multiple users. --- DONE
When we click on the user marker should show the Lat, long values and the physical address in the popup. ——DONE
When user trail is enabled zoom and click on “Zoom To” , the high level zoom should cover the all the points of user trail rather than navigate to last stable position. --- DONE
In case of user(s) clustering , show the list of users in the popup. --- DONE
For clustering , implement the group icon. --- DONE

## TODO:

1. Snap to Road
2. Arrow Directions

## Description :

Initially two user locations should appear on the map (100ms to get new points).On click of "Show trail" should show the dotted line. (I have not removed the old user markers for better visualisation)On click of "Zoom to Users" should zoom to the extent of all users.On click of user markers give Address.In alluserslocations.js there is a User C code to test the functionality for 3 users.
On zooming out to 13 and less, Group icon appears and popup shows user names.

## Files

src/components/Map.jsx - Main map component
src/components/MapControls.jsx - Map controls component
src/constants/mapConstants.js - Constants
src/hooks/useMapView.js - Custom hook for map view
src/services/mapService.js - Map Service file
src/utils/mapUtils.js - Utility functions

```

```
