// src/components/GoogleMapView.jsx
import React from "react";

export default function GoogleMapView({ gps }) {
  // gps expected as "lat,lng" string like "9.9312,76.2673"
  if (!gps) {
    return (
      <div style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#666"
      }}>
        Waiting for location…
      </div>
    );
  }

  const parts = gps.split(",").map(s => parseFloat(s.trim()));
  if (parts.length < 2 || isNaN(parts[0]) || isNaN(parts[1])) {
    return (
      <div style={{
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#666"
      }}>
        Invalid GPS data
      </div>
    );
  }

  const [lat, lng] = parts;
  const mapSrc = `https://www.google.com/maps?q=${lat},${lng}&z=15&output=embed`;

  return (
    <div style={{ height: "100%", width: "100%" }}>
      <iframe
        title="Pod Location"
        src={mapSrc}
        style={{ border: "none", width: "100%", height: "100%" }}
        loading="lazy"
      />
    </div>
  );
}
