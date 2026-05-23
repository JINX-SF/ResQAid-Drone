import { useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  MapPin,
  Check,
  Search,
  Package,
  Users as UsersIcon,
  Activity,
  AlertTriangle,
  Upload,
  Mic,
  Send,
  Siren,
  ArrowRight,
} from "lucide-react";
import DroneIcon from "@/components/DroneIcon";
import AppShell from "@/components/AppShell";
import LeafletMap, { LatLng } from "@/components/LeafletMap";

// ─── Glass ───────────────────────────────────────────────────────────────────

function Glass({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.45)] ${className}`}>
      {children}
    </div>
  );
}

// ─── StepBadge ───────────────────────────────────────────────────────────────

function StepBadge({ n, label, sub }: { n: number; label: string; sub: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
        {n}
      </div>
      <div>
        <div className="text-base font-semibold text-white">{label}</div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
    </div>
  );
}

// ─── Detail helpers ───────────────────────────────────────────────────────────

function DetailRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <Activity className="mt-1 h-4 w-4 text-primary shrink-0" />
      <span className="w-28 shrink-0 text-sm text-muted-foreground">{label}</span>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}

function InputRow({
  label, value, onChange, placeholder = "", type = "text",
}: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string;
}) {
  return (
    <div className="flex items-center gap-4">
      <Activity className="h-4 w-4 text-primary shrink-0" />
      <span className="w-28 shrink-0 text-sm text-muted-foreground">{label}</span>
      <input
        type={type}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-muted-foreground focus:border-primary focus:outline-none"
      />
    </div>
  );
}

// ─── Mini location picker (for logistics "From") ──────────────────────────────

function LocationPicker({
  label,
  location,
  locationLabel,
  onLocation,
  onLabel,
}: {
  label: string;
  location: LatLng | null;
  locationLabel: string;
  onLocation: (ll: LatLng) => void;
  onLabel: (s: string) => void;
}) {
  const [q, setQ] = useState("");
  const [locating, setLocating] = useState(false);

  const useGPS = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const ll = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        onLocation(ll);
        onLabel(`Lat: ${ll.lat.toFixed(5)} · Lon: ${ll.lng.toFixed(5)}`);
        setLocating(false);
      },
      () => setLocating(false)
    );
  };

  const search = async () => {
    if (!q.trim()) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&limit=1`
      );
      const data = await res.json();
      if (data.length > 0) {
        const ll = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        onLocation(ll);
        onLabel(data[0].display_name.split(",").slice(0, 3).join(", "));
      }
    } catch { /* ignore */ }
  };

  return (
    <div className="space-y-2">
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</p>
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && search()}
            placeholder={`Search ${label.toLowerCase()}…`}
            className="w-full rounded-lg border border-white/10 bg-black/40 py-2 pl-9 pr-3 text-sm text-white placeholder:text-muted-foreground focus:border-primary focus:outline-none"
          />
        </div>
        <button onClick={search} className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-xs text-white hover:border-primary">Go</button>
        <button onClick={useGPS} disabled={locating} className="rounded-lg bg-primary px-3 py-2 text-xs text-primary-foreground hover:opacity-90 disabled:opacity-60">
          <MapPin className="h-4 w-4" />
        </button>
      </div>
      {location ? (
        <div className="rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-xs text-muted-foreground truncate">
          <span className="text-primary font-medium">✓ </span>{locationLabel}
        </div>
      ) : (
        <div className="rounded-lg border border-white/10 bg-black/20 px-3 py-2 text-xs text-muted-foreground">
          No location set
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type ServiceType = "sar" | "logistics" | "oilgas" | "industrial" | "security";

const RequestAssistancePage = () => {
  const navigate = useNavigate();

  const [service, setService] = useState<ServiceType>("sar");
  const [details, setDetails] = useState<any>({
    people: "1",
    conditions: ["Conscious", "Trapped"],
    urgencyTypes: ["Bleeding"],
    urgency: "critical",
  });

  const updateDetails = (key: string, value: any) =>
    setDetails((prev: any) => ({ ...prev, [key]: value }));

  const [description, setDescription] = useState("");

  // destination location (all services)
  const [location, setLocation] = useState<LatLng | null>(null);
  const [locationLabel, setLocationLabel] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [locating, setLocating] = useState(false);

  // pickup location (logistics only)
  const [fromLocation, setFromLocation] = useState<LatLng | null>(null);
  const [fromLabel, setFromLabel] = useState("");

  const [loading, setLoading] = useState(false);

  // ── services catalogue ────────────────────────────────────────────────────

  const services = [
    {
      id: "sar",
      title: "Search & Rescue",
      icon: <DroneIcon className="mx-auto mb-2 h-10 w-10 text-white" />,
      text: "Locate missing, injured, or trapped people",
      example: "Floods, fires, lost persons, disaster rescue",
      defaultDetails: { people: "1", conditions: ["Conscious", "Trapped"], urgencyTypes: ["Bleeding"], urgency: "critical" },
    },
    {
      id: "logistics",
      title: "Remote Logistics",
      icon: <Package className="mx-auto mb-2 h-10 w-10 text-white" />,
      text: "Deliver supplies to remote areas",
      example: "Medical supplies, food, water, equipment",
      defaultDetails: { payloadType: "Medical Supplies", payloadWeight: "", priority: "Urgent", scheduleType: "ASAP", scheduleTime: "" },
    },
    {
      id: "oilgas",
      title: "Oil & Gas Monitoring",
      icon: <Activity className="mx-auto mb-2 h-10 w-10 text-white" />,
      text: "Monitor pipelines and energy sites",
      example: "Leaks, fire risk, overheating, anomalies",
      defaultDetails: { infrastructureType: "Pipeline", monitoringPurpose: "Leak Detection", areaSize: "", frequency: "One Time", riskLevel: "High", sensorType: "Thermal Camera" },
    },
    {
      id: "industrial",
      title: "Industrial Inspection",
      icon: <AlertTriangle className="mx-auto mb-2 h-10 w-10 text-white" />,
      text: "Inspect industrial structures",
      example: "Factories, towers, bridges, power plants",
      defaultDetails: { facilityType: "Factory", inspectionType: "Structural Damage", height: "", priority: "Important", aiAnalysis: "Enabled" },
    },
    {
      id: "security",
      title: "Security Patrol",
      icon: <UsersIcon className="mx-auto mb-2 h-10 w-10 text-white" />,
      text: "Patrol and detect suspicious activity",
      example: "Intrusion, vehicles, night patrol, borders",
      defaultDetails: { patrolType: "Perimeter Patrol", threatType: "Intrusion", duration: "", surveillanceMode: "Live Monitoring", alertSensitivity: "High", nightVision: "Enabled" },
    },
  ];

  // ── button helpers ────────────────────────────────────────────────────────

  const Btn = ({ value, active, onClick }: { value: string; active: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`rounded-md border px-3 py-1.5 text-sm transition ${
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-white/10 bg-black/30 text-primary-foreground hover:border-white/20"
      }`}
    >
      {value}
    </button>
  );

  // ── dynamic detail form ────────────────────────────────────────────────────

  const renderDetails = () => {
    if (service === "sar") return (
      <>
        <DetailRow label="People">
          {["1", "2", "3", "4+"].map((p) => (
            <button key={p} onClick={() => updateDetails("people", p)}
              className={`h-9 w-9 rounded-md border text-sm ${details.people === p ? "border-primary bg-primary text-primary-foreground" : "border-white/10 bg-black/30 text-primary-foreground hover:border-white/20"}`}>
              {p}
            </button>
          ))}
        </DetailRow>
        <DetailRow label="Condition">
          {["Conscious", "Can move", "Trapped"].map((c) => (
            <Btn key={c} value={c} active={details.conditions?.includes(c)}
              onClick={() => updateDetails("conditions", details.conditions?.includes(c) ? details.conditions.filter((x: string) => x !== c) : [...(details.conditions || []), c])} />
          ))}
        </DetailRow>
        <DetailRow label="Urgency Type">
          {["Bleeding", "Fracture", "Burned", "Other"].map((u) => (
            <Btn key={u} value={u} active={details.urgencyTypes?.includes(u)}
              onClick={() => updateDetails("urgencyTypes", details.urgencyTypes?.includes(u) ? details.urgencyTypes.filter((x: string) => x !== u) : [...(details.urgencyTypes || []), u])} />
          ))}
        </DetailRow>
        <DetailRow label="Urgency">
          {["minor", "critical"].map((u) => (
            <button key={u} onClick={() => updateDetails("urgency", u)}
              className={`rounded-full border px-4 py-1.5 text-sm transition ${details.urgency === u ? (u === "critical" ? "border-destructive bg-destructive text-destructive-foreground" : "border-warning bg-warning/20 text-warning") : "border-white/10 bg-black/30 text-primary-foreground hover:border-white/20"}`}>
              {u === "minor" ? "Minor" : "Critical"}
            </button>
          ))}
        </DetailRow>
      </>
    );

    if (service === "logistics") return (
      <>
        <DetailRow label="Payload">
          {["Medical Supplies", "Food", "Water", "Equipment", "Documents", "Other"].map((v) => (
            <Btn key={v} value={v} active={details.payloadType === v} onClick={() => updateDetails("payloadType", v)} />
          ))}
        </DetailRow>
        <InputRow label="Weight (kg)" value={details.payloadWeight} onChange={(v) => updateDetails("payloadWeight", v)} placeholder="e.g. 5" />
        <DetailRow label="Priority">
          {["Standard", "Urgent", "Critical"].map((v) => (
            <Btn key={v} value={v} active={details.priority === v} onClick={() => updateDetails("priority", v)} />
          ))}
        </DetailRow>
        <DetailRow label="Schedule">
          {["ASAP", "Scheduled"].map((v) => (
            <Btn key={v} value={v} active={details.scheduleType === v} onClick={() => updateDetails("scheduleType", v)} />
          ))}
        </DetailRow>
        {details.scheduleType === "Scheduled" && (
          <InputRow label="Time" value={details.scheduleTime} onChange={(v) => updateDetails("scheduleTime", v)} type="datetime-local" />
        )}
      </>
    );

    if (service === "oilgas") return (
      <>
        <DetailRow label="Site Type">
          {["Pipeline", "Oil Well", "Gas Station", "Refinery", "Storage Tank"].map((v) => (
            <Btn key={v} value={v} active={details.infrastructureType === v} onClick={() => updateDetails("infrastructureType", v)} />
          ))}
        </DetailRow>
        <DetailRow label="Purpose">
          {["Leak Detection", "Thermal Monitoring", "Fire Risk", "Unauthorized Activity"].map((v) => (
            <Btn key={v} value={v} active={details.monitoringPurpose === v} onClick={() => updateDetails("monitoringPurpose", v)} />
          ))}
        </DetailRow>
        <InputRow label="Area (km²)" value={details.areaSize} onChange={(v) => updateDetails("areaSize", v)} placeholder="e.g. 10" />
        <DetailRow label="Sensor">
          {["Thermal Camera", "HD Camera", "Gas Sensor", "LiDAR"].map((v) => (
            <Btn key={v} value={v} active={details.sensorType === v} onClick={() => updateDetails("sensorType", v)} />
          ))}
        </DetailRow>
      </>
    );

    if (service === "industrial") return (
      <>
        <DetailRow label="Facility">
          {["Factory", "Warehouse", "Power Plant", "Bridge", "Telecom Tower"].map((v) => (
            <Btn key={v} value={v} active={details.facilityType === v} onClick={() => updateDetails("facilityType", v)} />
          ))}
        </DetailRow>
        <DetailRow label="Inspection">
          {["Structural Damage", "Thermal Inspection", "Maintenance Check", "Safety Inspection"].map((v) => (
            <Btn key={v} value={v} active={details.inspectionType === v} onClick={() => updateDetails("inspectionType", v)} />
          ))}
        </DetailRow>
        <InputRow label="Height (m)" value={details.height} onChange={(v) => updateDetails("height", v)} placeholder="e.g. 30" />
        <DetailRow label="AI Analysis">
          {["Enabled", "Disabled"].map((v) => (
            <Btn key={v} value={v} active={details.aiAnalysis === v} onClick={() => updateDetails("aiAnalysis", v)} />
          ))}
        </DetailRow>
      </>
    );

    if (service === "security") return (
      <>
        <DetailRow label="Patrol">
          {["Perimeter Patrol", "Border Surveillance", "Facility Security", "Night Patrol"].map((v) => (
            <Btn key={v} value={v} active={details.patrolType === v} onClick={() => updateDetails("patrolType", v)} />
          ))}
        </DetailRow>
        <DetailRow label="Threat">
          {["Intrusion", "Suspicious Vehicle", "Unauthorized Person", "Fire"].map((v) => (
            <Btn key={v} value={v} active={details.threatType === v} onClick={() => updateDetails("threatType", v)} />
          ))}
        </DetailRow>
        <InputRow label="Duration" value={details.duration} onChange={(v) => updateDetails("duration", v)} placeholder="e.g. 60 min" />
        <DetailRow label="Mode">
          {["Live Monitoring", "AI Auto Detection", "Recording Only"].map((v) => (
            <Btn key={v} value={v} active={details.surveillanceMode === v} onClick={() => updateDetails("surveillanceMode", v)} />
          ))}
        </DetailRow>
      </>
    );
  };

  // ── location helpers ──────────────────────────────────────────────────────

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const ll = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setLocation(ll);
        setLocationLabel(`Lat: ${ll.lat.toFixed(5)} · Lon: ${ll.lng.toFixed(5)}`);
        setLocating(false);
      },
      () => setLocating(false)
    );
  };

  const handleMapPick = (ll: LatLng) => {
    setLocation(ll);
    setLocationLabel(`Lat: ${ll.lat.toFixed(5)} · Lon: ${ll.lng.toFixed(5)}`);
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&format=json&limit=1`
      );
      const data = await res.json();
      if (data.length > 0) {
        const ll = { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
        setLocation(ll);
        setLocationLabel(data[0].display_name.split(",").slice(0, 3).join(", "));
      }
    } catch { /* ignore */ }
  };

  // ── submit ────────────────────────────────────────────────────────────────

  const submitRequest = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const payload = {
        type: service,
        description,
        urgency:
          details.urgency === "critical" || details.priority === "Critical" || details.riskLevel === "Critical"
            ? "Critical"
            : details.priority === "Urgent" || details.riskLevel === "High"
            ? "High"
            : "Medium",
        details,
        locationName: locationLabel,
        lat: location?.lat || 0,
        lng: location?.lng || 0,
        ...(service === "logistics" && {
          fromLocationName: fromLabel,
          fromLat: fromLocation?.lat || 0,
          fromLng: fromLocation?.lng || 0,
        }),
      };

      console.log("SENDING:", payload);

      const res = await fetch("http://localhost:5000/api/emergency-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      console.log("REQUEST CREATED:", data);
      alert("Emergency request sent successfully ✅");
    } catch (err) {
      console.error(err);
      alert("Failed to send request");
    } finally {
      setLoading(false);
    }
  };

  // ── render ────────────────────────────────────────────────────────────────

  return (
    <AppShell>
      <div className="relative z-10 w-full px-6 py-8">
        {/* Wrapped inside a maximum width constraint center layer */}
        <div className="max-w-5xl mx-auto space-y-6">

          {/* ── Header ── */}
          <Glass className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Request Assistance</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Fill in the details below to request drone support. Our team will respond as quickly as possible.
                </p>
              </div>
              <button
                onClick={() => navigate("/my-requests")}
                className="shrink-0 bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-xl text-white font-semibold transition text-sm"
              >
                My Requests
              </button>
            </div>
            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <StepBadge n={1} label="Service" sub="What do you need?" />
              <StepBadge n={2} label="Location" sub="Where are you?" />
              <StepBadge n={3} label="Details" sub="Provide more info" />
              <StepBadge n={4} label="Confirm" sub="Review and send" />
            </div>
          </Glass>

          {/* ── Step 1: Service ── */}
          <Glass className="p-6">
            <StepBadge n={1} label="Service" sub="What type of drone mission do you need?" />
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-5">
              {services.map((item) => {
                const active = service === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => { setService(item.id as ServiceType); setDetails(item.defaultDetails); }}
                    className={`relative rounded-xl border py-4 px-3 text-center transition ${
                      active ? "border-primary bg-primary/10" : "border-white/10 bg-black/30 hover:border-white/20"
                    }`}
                  >
                    {active && (
                      <div className="absolute right-2.5 top-2.5 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground">
                        <Check className="h-3 w-3" />
                      </div>
                    )}
                    <div className={`transition-opacity duration-200 ${active ? "opacity-80" : "opacity-50"} [&_svg]:text-white [&_svg]:stroke-white`}>
                      {item.icon}
                    </div>
                    <div className="mt-1 text-[13px] font-bold text-white leading-tight">{item.title}</div>
                    <p className="mt-1.5 text-[11px] text-muted-foreground/90 leading-snug">{item.text}</p>
                    <p className="mt-1 text-[10px] text-muted-foreground/60 leading-snug">{item.example}</p>
                  </button>
                );
              })}
            </div>
          </Glass>

          {/* ── Step 2: Location ── */}
          <Glass className="p-6">
            <StepBadge n={2} label="Location" sub={service === "logistics" ? "Pickup and delivery locations" : "Where are you or where is assistance needed?"} />

            {service === "logistics" ? (
              /* Logistics: from → to with map */
              <div className="mt-5 grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* from / to pickers */}
                <div className="space-y-5">
                  <LocationPicker
                    label="Pickup Location (From)"
                    location={fromLocation}
                    locationLabel={fromLabel}
                    onLocation={setFromLocation}
                    onLabel={setFromLabel}
                  />

                  {/* arrow */}
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-white/10" />
                    <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/30">
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="h-px flex-1 bg-white/10" />
                  </div>

                  <LocationPicker
                    label="Delivery Location (To)"
                    location={location}
                    locationLabel={locationLabel}
                    onLocation={setLocation}
                    onLabel={setLocationLabel}
                  />
                </div>

                {/* map */}
                <div className="h-64 lg:h-auto rounded-lg border border-white/10 bg-black/40 overflow-hidden">
                  <LeafletMap userPin={location} onLocationPick={handleMapPick} className="h-full w-full" />
                </div>
              </div>
            ) : (
              /* All other services: single location */
              <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <button
                    onClick={useMyLocation}
                    disabled={locating}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground hover:opacity-90 disabled:opacity-60"
                  >
                    <MapPin className="h-4 w-4" />
                    {locating ? "Detecting…" : "Use My Location"}
                  </button>
                  <div className="text-center text-xs text-muted-foreground">or search / tap the map</div>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        placeholder="Search address…"
                        className="w-full rounded-lg border border-white/10 bg-black/40 py-2 pl-9 pr-3 text-sm text-white placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                      />
                    </div>
                    <button onClick={handleSearch} className="rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white hover:border-primary">Go</button>
                  </div>
                  {location ? (
                    <div className="rounded-lg border border-primary/30 bg-primary/10 p-3">
                      <div className="flex items-center gap-2 text-primary-foreground font-medium text-sm">
                        <MapPin className="h-4 w-4 text-primary" /> Location set
                      </div>
                      <div className="mt-1 text-xs text-muted-foreground truncate">{locationLabel}</div>
                      <div className="mt-0.5 text-[10px] text-muted-foreground/70">
                        {location.lat.toFixed(6)}°N · {location.lng.toFixed(6)}°E
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-white/10 bg-black/20 p-3 text-sm text-muted-foreground">
                      No location selected — tap the map or use GPS
                    </div>
                  )}
                </div>
                <div className="h-56 md:h-auto rounded-lg border border-white/10 bg-black/40 overflow-hidden">
                  <LeafletMap userPin={location} onLocationPick={handleMapPick} className="h-full w-full" />
                </div>
              </div>
            )}
          </Glass>

          {/* ── Steps 3 + 4 side by side ── */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">

            {/* Step 3 — dynamic details */}
            <Glass className="p-6">
              <StepBadge n={3} label="Details" sub="Tell us more about your mission" />
              <div className="mt-5 space-y-5 text-sm">
                {renderDetails()}
              </div>
            </Glass>

            {/* Step 4 — additional info */}
            <Glass className="p-6">
              <StepBadge n={4} label="Additional Info" sub="Add any extra context" />
              <div className="mt-5 space-y-4 text-sm">
                <div>
                  <label className="block text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Describe the situation</label>
                  <textarea
                    rows={6}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full rounded-lg border border-white/10 bg-black/30 p-3 text-sm text-white placeholder:text-muted-foreground focus:border-primary focus:outline-none resize-none"
                    placeholder="Describe what happened or what you need…"
                  />
                </div>
                <div className="flex items-center gap-3">
                  <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 bg-black/30 text-white px-3 py-2.5 text-sm hover:border-white/20 transition">
                    <Upload className="h-4 w-4 text-blue-300" /> Upload Photo
                  </button>
                  <button className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-white/10 bg-black/30 text-white px-3 py-2.5 text-sm hover:border-white/20 transition">
                    <span className="h-2 w-2 rounded-full bg-destructive" />
                    <Mic className="h-4 w-4 text-red-400" /> Record Voice
                  </button>
                </div>
                <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                  <input type="checkbox" className="accent-primary" />
                  Share my location with the rescue team
                </label>
                <button
                  onClick={submitRequest}
                  disabled={loading}
                  className="w-full rounded-xl bg-green-600 py-4 font-semibold text-white flex items-center justify-center gap-2 hover:bg-green-700 disabled:opacity-60 transition text-base"
                >
                  <Send className="h-5 w-5" />
                  {loading ? "Sending…" : "Confirm and Send Request"}
                </button>
              </div>
            </Glass>
          </div>

          {/* ── Quick SOS ── */}
          <div className="flex items-center justify-between rounded-2xl border border-destructive/40 bg-destructive/80 px-6 py-4 backdrop-blur-xl">
            <div className="flex items-center gap-4">
              <Siren className="h-6 w-6 text-destructive-foreground shrink-0" />
              <div>
                <span className="font-bold text-destructive-foreground text-base">QUICK SOS </span>
                <span className="text-destructive-foreground/90 text-sm">
                  Send an instant SOS alert with your location
                </span>
              </div>
            </div>
            <button className="rounded-lg bg-background/95 px-5 py-2.5 text-sm font-bold text-destructive hover:bg-background transition">
              SEND SOS NOW
            </button>
          </div>

        </div>
      </div>
    </AppShell>
  );
};

export default RequestAssistancePage;