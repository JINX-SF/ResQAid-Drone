import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ClipboardList, Search, ChevronDown, ArrowRight, Eye } from "lucide-react";
import AppShell, { Glass } from "@/components/AppShell";
import API from "@/api";

type MissionStatus = "accepted" | "completed" | "active" | "rejected" | "failed" | "pending";

// ─── Status Pill ──────────────────────────────────────────────────────────────
function MissionStatusPill({ status }: { status: MissionStatus | string }) {
  const s = (status || "pending").toLowerCase();

  const styles: Record<string, string> = {
    active:    "bg-blue-500/15 text-blue-300 border border-blue-400/30",
    accepted:  "bg-blue-500/15 text-blue-300 border border-blue-400/30",
    completed: "bg-green-500/15 text-green-300 border border-green-400/30",
    pending:   "bg-yellow-500/15 text-yellow-300 border border-yellow-400/30",
    failed:    "bg-red-500/15 text-red-300 border border-red-400/30",
    rejected:  "bg-red-500/15 text-red-300 border border-red-400/30",
  };

  const labels: Record<string, string> = {
    active:    "Active",
    accepted:  "Accepted",
    completed: "Completed",
    pending:   "Pending",
    failed:    "Failed",
    rejected:  "Rejected",
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-5 py-1.5 text-base font-bold uppercase tracking-wider ${
        styles[s] ?? "bg-white/10 text-white/60"
      }`}
    >
      {labels[s] ?? status}
    </span>
  );
}

// ─── Urgency Pill ─────────────────────────────────────────────────────────────
function UrgencyPill({ urgency }: { urgency: string }) {
  const u = (urgency || "routine").toLowerCase();

  const styles: Record<string, string> = {
    critical: "bg-red-500/15 text-red-400 border border-red-500/30",
    high:     "bg-orange-500/15 text-orange-400 border border-orange-500/30",
    medium:   "bg-yellow-500/15 text-yellow-400 border border-yellow-500/30",
    routine:  "bg-blue-500/15 text-blue-400 border border-blue-500/30",
  };

  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wide border ${
        styles[u] ?? "bg-white/5 text-white/50 border-white/10"
      }`}
    >
      {urgency || "Routine"}
    </span>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function MissionReportsDirectory() {
  const navigate = useNavigate();
  const [missions, setMissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ─── Search State Extensions ──────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [searchField, setSearchField] = useState<"id" | "name">("name");

  const fetchMissions = () => {
    setLoading(true);
    API.get("/missions")
      .then((res) => {
        setMissions(res.data.data || res.data || []);
      })
      .catch((err) => console.error("Error fetching reports directory:", err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMissions();
  }, []);

  // ─── Dual Filter Logic ─────────────────────────────────────────────────────
  const filteredMissions = missions.filter((m) => {
    const cleanQuery = searchQuery.toLowerCase().trim();
    if (!cleanQuery) return true;

    if (searchField === "id") {
      return m._id?.toLowerCase().includes(cleanQuery);
    } else {
      const fieldToSearch = m.title || m.type || "";
      return fieldToSearch.toLowerCase().includes(cleanQuery);
    }
  });

  return (
    <div>
      <AppShell>
        <Glass className="overflow-hidden">
          
          {/* ── Header Toolbar Layout ── */}
          <div className="flex flex-col xl:flex-row xl:items-center justify-between bg-black/40 px-6 py-4 gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-4 flex-1 max-w-2xl">
              <h2 className="text-2xl font-semibold text-white/80 whitespace-nowrap">
                Mission Reports
              </h2>

              <div className="flex items-center gap-2 flex-1 w-full">
                {/* Search Target Mode Selector */}
                <select
                  value={searchField}
                  onChange={(e) => {
                    setSearchField(e.target.value as "id" | "name");
                    setSearchQuery(""); // Auto-clear to prevent view breakages
                  }}
                  className="px-3 py-2 text-sm rounded-lg border border-white/20 text-white/90 bg-white/10 backdrop-blur-md hover:bg-white/15 focus:outline-none focus:border-green-400/60 transition cursor-pointer"
                >
                  <option value="name" className="bg-[#161b26] text-white">Search Name</option>
                  <option value="id" className="bg-[#161b26] text-white">Search ID</option>
                </select>

                {/* Combined Search Bar */}
                <div className="relative flex-1">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="h-4 w-4 text-white/40" />
                  </span>
                  <input
                    type="text"
                    placeholder={searchField === "id" ? "Enter system ID..." : "Enter mission name/type..."}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 text-sm rounded-lg bg-white/5 border border-white/10 text-white placeholder-white/40 focus:outline-none focus:border-green-400/60 focus:bg-white/10 transition"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={fetchMissions}
              className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 self-start xl:self-auto"
            >
              Refresh Archive
            </button>
          </div>

          {/* ── Tableee Header Definition Row ── */}
          <div className="grid grid-cols-[1.2fr_1.1fr_0.8fr_0.9fr_1fr] items-center gap-6 border-b border-white/10 bg-black/30 px-8 py-5 text-sm font-bold uppercase tracking-[0.18em] text-white/80">
            <div>Mission Info</div>
            <div>Assigned UAV Asset</div>
            <div>Urgency</div>
            <div>Status Ledger</div>
            <div className="text-right">Actions</div>
          </div>

          {/* ── Dynamic Content Stream List ── */}
          <ul className="divide-y text-white/70 divide-white/5">
            {loading ? (
              <li className="px-8 py-12 text-center text-white/40 text-base">
                Querying system database file archives...
              </li>
            ) : filteredMissions.length > 0 ? (
              filteredMissions.map((m) => (
                <li
                  key={m._id}
                  className="grid grid-cols-[1.2fr_1.1fr_0.8fr_0.9fr_1fr] items-center gap-6 px-8 py-6 border-b border-white/5 text-base text-white/80 transition-all duration-300 hover:bg-white/[0.04]"
                >
                  {/* Mission Identity snippet and full structural name */}
                  <div>
                    <div className="font-semibold text-base text-white/90">
                      {m.title || m.type || "Rescue Operation"}
                    </div>
                    <div className="text-xs text-white/40 font-mono mt-0.5 truncate max-w-[200px]">
                      ID: {m._id}
                    </div>
                  </div>

                  {/* Allocated Drone hardware label element */}
                  <div className="font-medium text-base text-white/90">
                    <span className="inline-flex items-center gap-1.5 bg-black/30 border border-white/5 px-3 py-1.5 rounded-lg text-sm text-zinc-300 font-mono">
                      🚁 {m.drone?.name || (typeof m.drone === "string" ? m.drone : "Unassigned Fleet Asset")}
                    </span>
                  </div>

                  {/* Urgency Priority Rank Profile */}
                  <div>
                    <UrgencyPill urgency={m.urgency} />
                  </div>

                  {/* Operational Status Metric Tag */}
                  <div>
                    <MissionStatusPill status={m.status} />
                  </div>

                  {/* Action Link Interaction Controls */}
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => navigate(`/mission-report/${m._id}`)}
                      className="rounded-xl bg-green-500/90 px-4 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:scale-105 hover:bg-green-400 active:scale-95 flex items-center gap-1.5"
                    >
                      <Eye className="h-4 w-4" /> Open File
                    </button>
                  </div>
                </li>
              ))
            ) : (
              <li className="px-8 py-12 text-center text-white/40 text-base">
                No matching historic mission reports found for target criteria.
              </li>
            )}
          </ul>
        </Glass>
      </AppShell>
    </div>
  );
}