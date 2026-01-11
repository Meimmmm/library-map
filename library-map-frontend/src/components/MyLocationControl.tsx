import { useEffect, useMemo } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";

type Props = {
  onStart?: () => void;
  onSuccess?: (lat: number, lng: number, accuracy?: number) => void;
  onError?: (message: string) => void;
  minZoomOnLocate?: number; // default 14
};

// Extending the Leaflet Control type
interface CustomControl extends L.Control {
  getContainer(): HTMLElement;
}

// Custom Container Types
interface CustomContainer extends HTMLDivElement {
  _btn: HTMLAnchorElement;
}

export default function MyLocationControl({
  onStart,      //Function called when position acquisition starts
  onSuccess,    //Function called when position acquisition is successful
  onError,      //Function called when position acquisition fails
  minZoomOnLocate = 14,
}: Props) {
  const map = useMap();

  const control = useMemo(() => {
    const C = L.Control.extend({
      onAdd: () => {
        const container = L.DomUtil.create(
          "div",
          "leaflet-bar leaflet-control"
        ) as CustomContainer;

        const btn = L.DomUtil.create("a", "", container) as HTMLAnchorElement;
        btn.href = "#";
        btn.title = "My location";
        btn.setAttribute("role", "button");
        btn.setAttribute("aria-label", "My location");

        // Same feel as Leaflet's zoom button
        btn.style.width = "34px";
        btn.style.height = "34px";
        btn.style.display = "grid";
        btn.style.placeItems = "center";
        btn.style.fontSize = "18px";
        btn.style.background = "white";

        btn.textContent = "🧭";

        // Does not interfere with map dragging etc
        L.DomEvent.disableClickPropagation(container);
        L.DomEvent.disableScrollPropagation(container);

        container._btn = btn;
        return container;
      },
    });

    return new C({ position: "topleft" }) as CustomControl;
  }, []);

  useEffect(() => {
    control.addTo(map);

    const container = control.getContainer() as CustomContainer;
    const btn = container._btn;

    let isLocating = false;

    const setButtonState = (state: "idle" | "loading") => {
      if (state === "loading") {
        btn.textContent = "⏳";
        btn.style.pointerEvents = "none";
        btn.style.opacity = "0.7";
      } else {
        btn.textContent = "🧭";
        btn.style.pointerEvents = "auto";
        btn.style.opacity = "1";
      }
    };

    const handleClick = (e: Event) => {
      e.preventDefault();
      if (isLocating) return;

      if (!navigator.geolocation) {
        onError?.("Geolocation is not supported on this browser.");
        return;
      }

      isLocating = true;
      onStart?.();
      setButtonState("loading");

      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude, accuracy } = pos.coords;

          const targetZoom = Math.max(map.getZoom(), minZoomOnLocate);
          map.flyTo([latitude, longitude], targetZoom, {
            animate: true,
            duration: 0.8,
          });

          onSuccess?.(latitude, longitude, accuracy);

          isLocating = false;
          setButtonState("idle");
        },
        (err) => {
          // err.code: 1 permission denied, 2 position unavailable, 3 timeout
          let msg = "Failed to get your location.";
          if (err.code === 1) msg = "Location permission is denied.";
          else if (err.code === 2) msg = "Location is unavailable.";
          else if (err.code === 3) msg = "Location request timed out.";

          onError?.(msg);

          isLocating = false;
          setButtonState("idle");
        },
        {
          enableHighAccuracy: true,
          timeout: 10_000,
          maximumAge: 30_000,
        }
      );
    };

    btn.addEventListener("click", handleClick);

    return () => {
      btn.removeEventListener("click", handleClick);
      control.remove();
    };
  }, [control, map, minZoomOnLocate, onError, onStart, onSuccess]);

  return null;
}