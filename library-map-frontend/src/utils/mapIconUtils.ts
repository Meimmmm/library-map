// src/utils/mapIconUtils.ts
import L from "leaflet";

export function createStatusIcon(label: string, isOpen: boolean) {
  const color = isOpen ? "#16a34a" : "#4b5563"; // Green or Gray

  const html = `
    <div style="display:flex;flex-direction:column;align-items:center;transform:translateY(-8px);">
      <!-- Small label on top -->
      <div
        style="
          background:${color};
          color:white;
          font-size:11px;
          padding:2px 6px;
          border-radius:999px;
          box-shadow:0 1px 3px rgba(0,0,0,0.4);
          white-space:nowrap;
        "
      >
        ${label}
      </div>

      <!-- Round head of the pin -->
      <div
        style="
          width:16px;
          height:16px;
          border-radius:999px;
          background:${color};
          border:2px solid white;
          box-shadow:0 1px 3px rgba(0,0,0,0.4);
          margin-top:3px;
        "
      ></div>

      <!-- Pin's triangle (bottom point) -->
      <div
        style="
          width:0;
          height:0;
          border-left:6px solid transparent;
          border-right:6px solid transparent;
          border-top:8px solid ${color};
          margin-top:-2px;
        "
      ></div>
    </div>
  `;

  return L.divIcon({
    html,
    className: "",
    iconSize: [0, 0],
    // Library position = Adjust so that it is near the tip of the triangle
    iconAnchor: [10, 28],
  });
}
