"use client";

import { useEffect, useState } from "react";
import type { Map as LeafletMap } from "leaflet";
import "leaflet/dist/leaflet.css";

const SF: [number, number] = [33.2148, -97.1331];
const ZOOM = 2;

// Esri Ocean basemap — dark blue-green nautical theme, no API key needed
const TILE_URL =
  "https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}";
const TILE_ATTR =
  "Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri";

export default function MapComponent() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    let map: LeafletMap | null = null;

    const init = async () => {
      const L = (await import("leaflet")).default;

      const container = document.getElementById("bytescart-map");
      if (!container) return;

      // Avoid double-init on hot reload
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((container as any)._leaflet_id) return;

      map = L.map(container, {
        center: SF,
        zoom: ZOOM,
        zoomControl: true,
        scrollWheelZoom: false,
        attributionControl: true,
      });

      L.tileLayer(TILE_URL, {
        attribution: TILE_ATTR,
        maxZoom: 13,
      }).addTo(map);

      // Glowing violet pin marker
      const iconHtml = `
        <div style="position:relative;width:36px;height:36px;">
          <div style="
            position:absolute;inset:0;
            background:rgba(124,58,237,0.3);
            border-radius:50%;
            animation:ping 1.5s cubic-bezier(0,0,0.2,1) infinite;
          "></div>
          <div style="
            position:absolute;inset:4px;
            background:linear-gradient(135deg,#7c3aed,#2563eb);
            border-radius:50%;
            box-shadow:0 0 12px rgba(124,58,237,0.8);
            display:flex;align-items:center;justify-content:center;
          ">
            <div style="width:8px;height:8px;background:#fff;border-radius:50%;"></div>
          </div>
        </div>
        <style>
          @keyframes ping{75%,100%{transform:scale(2);opacity:0}}
        </style>
      `;

      const icon = L.divIcon({
        html: iconHtml,
        iconSize: [36, 36],
        iconAnchor: [18, 18],
        popupAnchor: [0, -20],
        className: "",
      });

      L.marker(SF, { icon })
        .addTo(map)
        .bindPopup(
          `<div style="font-family:sans-serif;padding:4px 2px;min-width:140px;">
            <strong style="font-size:13px;color:#1f2937;">Bytescart HQ</strong><br/>
            <span style="font-size:11px;color:#6b7280;">Denton, TX</span>
          </div>`,
          { maxWidth: 200 }
        )
        .openPopup();
    };

    init();

    return () => {
      map?.remove();
    };
  }, [mounted]);

  if (!mounted) return null;

  return (
    <div
      id="bytescart-map"
      style={{ width: "100%", height: "400px", display: "block" }}
    />
  );
}
