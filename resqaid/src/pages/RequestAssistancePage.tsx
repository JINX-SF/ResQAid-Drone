
import { useState } from "react";
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
} from "lucide-react";
import bg from "@/assets/rescue-bg.jpg";
import  DroneIcon  from "@/components/DroneIcon";
import Sidebar from "@/components/Sidebar";
import AppShell from "@/components/AppShell";


function Glass({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.45)] ${className}`}
    >
      {children}
    </div>
  );
}

function StepBadge({ n, label, sub }: { n: number; label: string; sub: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold">
        {n}
      </div>
      <div>
        <div className="text-sm font-semibold text-foreground">{label}</div>
        <div className="text-[11px] text-muted-foreground">{sub}</div>
      </div>
    </div>
  );
}

const RequestAssistancePage = () => { 
  const [service, setService] = useState<"rescue" | "delivery">("rescue");
  const [people, setPeople] = useState("1");
  const [conditions, setConditions] = useState<string[]>(["Conscious", "Trapped"]);
  const [urgencyTypes, setUrgencyTypes] = useState<string[]>(["Bleeding"]);
  const [urgency, setUrgency] = useState<"minor" | "critical">("critical");

  const toggle = (
    arr: string[],
    setArr: (v: string[]) => void,
    value: string,
  ) => {
    setArr(arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value]);
  };

  const peopleOptions = ["1", "2", "3", "4+"];
  const conditionOptions = ["Conscious", "Can move", "Trapped"];
  const urgencyOptions = ["Bleeding", "Fracture", "Burned", "Other"];

  return (
    <AppShell>
        
      
      <div className="relative z-10 mx-auto max-w-5xl px-4 py-6">
        {/* Top bar */}
        

        <div className="space-y-4">
          {/* Header card */}
          <Glass className="p-5">
            <h2 className="text-lg font-semibold">Request assistance</h2>
            <p className="mb-5 text-xs text-muted-foreground">
              Fill in the details below to request drone support. Our team will respond as quickly as possible.
            </p>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <StepBadge n={1} label="Service" sub="What do you need?" />
              <StepBadge n={2} label="Location" sub="Where are you?" />
              <StepBadge n={3} label="Details" sub="Provide more info" />
              <StepBadge n={4} label="Confirm" sub="Review and send" />
            </div>
          </Glass>

          {/* Step 1 — Service */}
          <Glass className="p-5">
            <StepBadge n={1} label="Service" sub="What type of assistance do you need?" />
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <button
                onClick={() => setService("rescue")}
                className={`relative rounded-xl border p-5 text-left transition ${
                  service === "rescue"
                    ? "border-primary bg-primary/10"
                    : "border-white/10 bg-black/30 hover:border-white/20"
                }`}
              >
                {service === "rescue" && (
                  <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-4 w-4" />
                  </div>
                )}
                <DroneIcon className="mx-auto mb-3 h-12 w-12" />
                <div className="text-center font-semibold">Search & Rescue</div>
                <p className="mt-1 text-center text-xs text-muted-foreground">
                  Drones will search for and locate people in need
                </p>
                <p className="mt-2 text-center text-[11px] text-muted-foreground/70">
                  Example: floods, fires, earthquakes, lost or missing persons
                </p>
              </button>

              <button
                onClick={() => setService("delivery")}
                className={`relative rounded-xl border p-5 text-left transition ${
                  service === "delivery"
                    ? "border-primary bg-primary/10"
                    : "border-white/10 bg-black/30 hover:border-white/20"
                }`}
              >
                {service === "delivery" && (
                  <div className="absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Check className="h-4 w-4" />
                  </div>
                )}
                <Package className="mx-auto mb-3 h-12 w-12 text-foreground" />
                <div className="text-center font-semibold">Delivery</div>
                <p className="mt-1 text-center text-xs text-muted-foreground">
                  Request essential supplies delivered by drone
                </p>
                <p className="mt-2 text-center text-[11px] text-muted-foreground/70">
                  For medical supplies, food, water, or equipment.
                </p>
              </button>
            </div>
          </Glass>

          {/* Step 2 — Location */}
          <Glass className="p-5">
            <StepBadge n={2} label="Location" sub="Where are you or where is assistance needed?" />
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-3">
                <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground hover:opacity-90">
                  <MapPin className="h-4 w-4" />
                  Use My Location
                </button>
                <div className="text-center text-xs text-muted-foreground">or</div>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search and enter address"
                    className="w-full rounded-lg border border-white/10 bg-black/40 py-2 pl-9 pr-3 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  />
                </div>
                <div className="text-sm">
                  <div>Oran city, Hannouchi Road</div>
                  <div className="text-xs text-muted-foreground">
                    Lat: 34.876 N · Lon: 4.908 E
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-center rounded-lg border border-white/10 bg-black/40 p-2">
                <div className="relative h-40 w-full overflow-hidden rounded-md bg-[linear-gradient(135deg,#1a3a2e_0%,#2d4a3e_50%,#1a3a2e_100%)]">
                  <div className="absolute inset-0 opacity-40 [background-image:repeating-linear-gradient(0deg,transparent_0,transparent_19px,rgba(255,255,255,0.1)_20px),repeating-linear-gradient(90deg,transparent_0,transparent_19px,rgba(255,255,255,0.1)_20px)]" />
                  <MapPin className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 text-destructive drop-shadow" />
                </div>
              </div>
            </div>
          </Glass>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {/* Step 3 — Details */}
            <Glass className="p-5">
              <StepBadge n={3} label="Details" sub="Tell us more about your situation" />
              <div className="mt-4 space-y-4 text-sm">
                <div className="flex items-center gap-3">
                  <UsersIcon className="h-4 w-4 text-primary" />
                  <span className="w-24 text-muted-foreground">People</span>
                  <div className="flex gap-2">
                    {peopleOptions.map((p) => (
                      <button
                        key={p}
                        onClick={() => setPeople(p)}
                        className={`h-8 w-8 rounded-md border text-xs ${
                          people === p
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-white/10 bg-black/30 text-foreground hover:border-white/20"
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Activity className="mt-1 h-4 w-4 text-primary" />
                  <span className="w-24 text-muted-foreground">Condition</span>
                  <div className="flex flex-wrap gap-2">
                    {conditionOptions.map((c) => {
                      const active = conditions.includes(c);
                      return (
                        <button
                          key={c}
                          onClick={() => toggle(conditions, setConditions, c)}
                          className={`rounded-md border px-2 py-1 text-xs ${
                            active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-white/10 bg-black/30 text-foreground hover:border-white/20"
                          }`}
                        >
                          {c}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <AlertTriangle className="mt-1 h-4 w-4 text-primary" />
                  <span className="w-24 text-muted-foreground">Urgency Type</span>
                  <div className="flex flex-wrap gap-2">
                    {urgencyOptions.map((u) => {
                      const active = urgencyTypes.includes(u);
                      return (
                        <button
                          key={u}
                          onClick={() => toggle(urgencyTypes, setUrgencyTypes, u)}
                          className={`rounded-md border px-2 py-1 text-xs ${
                            active
                              ? "border-primary bg-primary text-primary-foreground"
                              : "border-white/10 bg-black/30 text-foreground hover:border-white/20"
                          }`}
                        >
                          {u}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  <span className="w-24 text-muted-foreground">Urgency</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setUrgency("minor")}
                      className={`rounded-full border px-3 py-1 text-xs ${
                        urgency === "minor"
                          ? "border-warning bg-warning/20 text-warning"
                          : "border-white/10 bg-black/30 text-muted-foreground hover:border-white/20"
                      }`}
                    >
                      Minor
                    </button>
                    <button
                      onClick={() => setUrgency("critical")}
                      className={`rounded-full border px-3 py-1 text-xs ${
                        urgency === "critical"
                          ? "border-destructive bg-destructive text-destructive-foreground"
                          : "border-white/10 bg-black/30 text-muted-foreground hover:border-white/20"
                      }`}
                    >
                      Critical
                    </button>
                  </div>
                </div>
              </div>
            </Glass>

            {/* Step 4 — Addition */}
            <Glass className="p-5">
              <StepBadge n={4} label="Addition" sub="Add any additional information" />
              <div className="mt-4 space-y-3 text-sm">
                <label className="block text-xs text-muted-foreground">Describe the situation</label>
                <textarea
                  rows={5}
                  className="w-full resize-none rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm placeholder:text-muted-foreground focus:border-primary focus:outline-none"
                  placeholder="Describe what happened…"
                />
                <div className="flex items-center justify-between gap-2">
                  <button className="flex items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 py-2 text-xs hover:border-white/20">
                    <Upload className="h-3.5 w-3.5" /> Upload photo
                  </button>
                  <button className="flex items-center gap-2 rounded-md border border-white/10 bg-black/30 px-3 py-2 text-xs hover:border-white/20">
                    <span className="h-2 w-2 rounded-full bg-destructive" />
                    <Mic className="h-3.5 w-3.5" /> Record Voice
                  </button>
                </div>
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  <input type="checkbox" className="accent-primary" />
                  Share my location with rescue team
                </label>
                <a
                  href="/confirmation"
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 font-medium text-primary-foreground hover:opacity-90"
                >
                  <Send className="h-4 w-4" />
                  Confirm and send request
                </a>
              </div>
            </Glass>
          </div>

          {/* Quick SOS */}
          <div className="flex items-center justify-between rounded-2xl border border-destructive/40 bg-destructive/80 px-5 py-3 backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <Siren className="h-5 w-5 text-destructive-foreground" />
              <div className="text-sm">
                <span className="font-bold text-destructive-foreground">QUICK SOS </span>
                <span className="text-destructive-foreground/90">
                  Send an instant SOS alert with your location
                </span>
              </div>
            </div>
            <button className="rounded-md bg-background/95 px-4 py-2 text-xs font-bold text-destructive hover:bg-background">
              SEND SOS NOW
            </button>
          </div>
        </div>
      
    </div>
    
    </AppShell>
  );
}
export default RequestAssistancePage;