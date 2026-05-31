
/* LeafletMap — a lightweight wrapper around react-leaflet.
 *
 * Props
 * ─────
 * userPin      – { lat, lng } shown as a blue "you are here" pin (RequestAssistancePage)
 * dronePin     – { lat, lng } animated green drone marker        (Controle)
 * targetPin    – { lat, lng } red target / victim marker         (Controle)
 * onLocationPick – fires when user clicks the map (RequestAssistancePage)
 * interactive  – if false the map only pans/zooms (default true)
 * className    – extra tailwind classes on the wrapper div
 */
import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Marker, Polyline, Circle, Popup } from "react-leaflet";

// ── fix the broken default icon paths that Vite breaks ──────────────────────
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon   from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl:       markerIcon,
  shadowUrl:     markerShadow,
});

// ── custom icons ─────────────────────────────────────────────────────────────
const makeIcon = (color: string, emoji: string) =>
  L.divIcon({
    className: "",
    html: `<div style="display:flex;align-items:center;justify-content:center;width:32px;height:32px;
    border-radius:50% 50% 50% 0;background:${color};
    border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,.5);transform:rotate(-45deg);font-size:14px;"><span style="transform:rotate(45deg)">${emoji}</span></div>`,
    iconSize:   [32, 32],
    iconAnchor: [16, 32],
    popupAnchor:[0, -34],
  });

const userIcon   = makeIcon("#3b82f6", "📍");
const droneIcon  = makeIcon("#22c55e", "🚁");
const targetIcon = L.divIcon({
  className: "",
html: `
<div style="
  width:12px;
  height:12px;
  border:2px solid #111827;
  border-radius:50%;
  background:white;
"></div>
`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

// ── types ─────────────────────────────────────────────────────────────────────
export interface LatLng { lat: number; lng: number }

interface LeafletMapProps {
  userPin?: LatLng | null;
  dronePin?: LatLng | null;
  targetPin?: LatLng | null;

  route?: LatLng[];

  onLocationPick?: (ll: LatLng) => void;
  interactive?: boolean;
  className?: string;
}

// ── component ─────────────────────────────────────────────────────────────────
export default function LeafletMap({
  userPin,
  dronePin,
  targetPin,
  route = [],
  onLocationPick,
  interactive = true,
  className = "",
}: LeafletMapProps){
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef       = useRef<L.Map | null>(null);
  const userMarker   = useRef<L.Marker | null>(null);
  const droneMarker  = useRef<L.Marker | null>(null);
  const targetMarker = useRef<L.Marker | null>(null);
  const routeLine    = useRef<L.Polyline | null>(null);
  const trailLine = useRef<L.Polyline | null>(null);

  // ── initialise map once ───────────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const defaultCenter: L.LatLngExpression =
      userPin  ? [userPin.lat,  userPin.lng]  :
      dronePin ? [dronePin.lat, dronePin.lng] :
      [35.6971, -0.6308]; // Oran

    const map = L.map(containerRef.current, {
      center:           defaultCenter,
      zoom:             14,
      zoomControl:      true,
      scrollWheelZoom:  true,
      dragging:         interactive,
      doubleClickZoom:  interactive,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "© OpenStreetMap contributors",
      maxZoom: 19,
    }).addTo(map);

    if (onLocationPick) {
      map.on("click", (e: L.LeafletMouseEvent) => {
        onLocationPick({ lat: e.latlng.lat, lng: e.latlng.lng });
      });
    }

    mapRef.current = map;
    return () => { map.remove(); mapRef.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


// ── helper: upsert a marker ───────────────────────────────────────────────
  function upsert(
    ref:   React.MutableRefObject<L.Marker | null>,
    pin:   LatLng | null | undefined,
    icon:  L.DivIcon,
    label: string,
  ) {
    const map = mapRef.current;
    if (!map) return;
    if (!pin) { ref.current?.remove(); ref.current = null; return; }

    if (ref.current) {
      ref.current.setLatLng([pin.lat, pin.lng]);
    } else {
      ref.current = L.marker([pin.lat, pin.lng], { icon })
        .bindPopup(label)
        .addTo(map);
    }
  }

  // ── sync userPin ──────────────────────────────────────────────────────────
  useEffect(() => {
    upsert(userMarker, userPin, userIcon, "📍 Your location");
    if (userPin && mapRef.current) {
      mapRef.current.setView([userPin.lat, userPin.lng], 15, { animate: true });
    }
  }, [userPin]);

  // ── sync dronePin ─────────────────────────────────────────────────────────
  useEffect(() => {
    upsert(droneMarker, dronePin, droneIcon, "🚁 Drone");
  }, [dronePin]);

  // ── sync targetPin ────────────────────────────────────────────────────────
  useEffect(() => {
    upsert(targetMarker, targetPin, targetIcon, "🎯 Target");
  }, [targetPin]);

  // ── draw / update route line between drone ↔️ target ──────────────────────
useEffect(() => {
  const map = mapRef.current;
  if (!map) return;

  routeLine.current?.remove();
  trailLine.current?.remove();

  if (dronePin && targetPin) {
   routeLine.current = L.polyline(
  [
    [dronePin.lat, dronePin.lng],
    [targetPin.lat, targetPin.lng],
  ],
  {
    color: "#17673b",
    weight: 2,
    dashArray: "8 8",
    opacity: 0.8,
  }
).addTo(map);

    map.fitBounds(
      [
        [dronePin.lat, dronePin.lng],
        [targetPin.lat, targetPin.lng],
      ],
      {
        padding: [40, 40],
        animate: true,
      }
    );
  }

  if (route.length > 1) {
    trailLine.current = L.polyline(
      route.map((p) => [p.lat, p.lng]),
      {
       color: "#c13d15",
weight: 2,
dashArray: "8 8",
opacity: 0.8
      }
    ).addTo(map);
  }
}, [dronePin, targetPin, route]);

  return (
    <div
      ref={containerRef}
      className={'w-full h-full rounded-lg overflow-hidden ' + className}
      style={{ minHeight: 160 }}
    />
  );
}