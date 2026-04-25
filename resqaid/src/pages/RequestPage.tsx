import {
  CheckSquare,
  Users,
  Sliders,
  Compass,
  Settings,
  Bell,
  User,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  Star,
} from "lucide-react";
import bg from "@/assets/rescue-bg.jpg";
import DroneIcon from "../components/DroneIcon";

function Glass({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-[0_8px_32px_rgba(0,0,0,0.35)] ${className}`}
    >
      {children}
    </div>
  );
}

type Variant = "progress" | "completed" | "rejected" | "accepted";

function StatusBadge({
  variant,
  children,
}: {
  variant: Variant;
  children: React.ReactNode;
}) {
  const styles: Record<Variant, string> = {
    progress: "bg-primary/90 text-primary-foreground",
    completed: "bg-warning/90 text-warning-foreground",
    rejected: "bg-destructive/90 text-destructive-foreground",
    accepted: "bg-primary/90 text-primary-foreground",
  };
  return (
    <span
      className={`inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium ${styles[variant]}`}
    >
      {children}
    </span>
  );
}

export default function RequestPage() {
  const navItems = ["Navigation", "Leasports", "Drones", "Ranitop"];
  const sideIcons = [DroneIcon, CheckSquare, Users, Sliders, Compass, Settings];
  const requests: { id: string; date: string; status: Variant; label: string }[] = [
    { id: "#24", date: "24/03/2026", status: "progress", label: "in progress" },
    { id: "#18", date: "24/03/2026", status: "completed", label: "Completed" },
    { id: "#05", date: "24/03/2026", status: "completed", label: "Completed" },
    { id: "#04", date: "24/03/2026", status: "rejected", label: "rejected" },
  ];

  return (
    <div
      className="relative min-h-screen w-full bg-cover bg-center bg-no-repeat text-foreground"
      style={{ backgroundImage: `url(${bg})` }}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-background/60 via-background/40 to-background/70" />

      <div className="relative z-10 flex min-h-screen">
        <aside className="flex w-14 flex-col items-center gap-6 border-r border-white/10 bg-black/20 py-6 backdrop-blur-xl">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/20 text-primary font-bold">
            R
          </div>
          <nav className="flex flex-col items-center gap-5 pt-4">
            {sideIcons.map((Icon, i) => (
              <button
                key={i}
                className="text-muted-foreground transition-colors hover:text-primary"
                aria-label={`nav-${i}`}
              >
                <Icon className="h-5 w-5" />
              </button>
            ))}
          </nav>
          <button className="mt-auto flex h-7 w-7 items-center justify-center rounded-full border border-white/20 text-muted-foreground hover:text-primary">
            <ChevronRight className="h-4 w-4" />
          </button>
        </aside>

        <main className="flex-1 px-6 py-5">
          <header className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-xl font-bold tracking-wide text-foreground">ResQAid</h1>
              <nav className="flex items-center gap-6">
                {navItems.map((item) => (
                  <a
                    key={item}
                    href="#"
                    className="text-sm text-muted-foreground transition-colors hover:text-primary"
                  >
                    {item}
                  </a>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-4">
              <button className="text-muted-foreground hover:text-primary" aria-label="Notifications">
                <Bell className="h-5 w-5" />
              </button>
              <button className="text-primary" aria-label="Profile">
                <User className="h-5 w-5" />
              </button>
            </div>
          </header>

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <Glass className="p-5 lg:col-span-2">
              <h2 className="mb-4 text-sm font-medium lowercase tracking-wide text-foreground/90">
                current request status
              </h2>
              <div className="flex items-center gap-6">
                <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full border-[3px] border-primary bg-black/40 shadow-[0_0_30px_rgba(120,220,140,0.35)]">
                  <DroneIcon className="h-14 w-14" />
                </div>
                <div className="flex-1 space-y-3 text-sm">
                  {[
                    ["mission type", "Search & rescue"],
                    ["start time", "14:30"],
                    ["Location", "Forest, oran algeria"],
                    ["Mission ID", "#24"],
                  ].map(([k, v]) => (
                    <div
                      key={k}
                      className="flex items-center justify-between border-b border-white/10 pb-2 last:border-0"
                    >
                      <span className="text-muted-foreground">{k}</span>
                      <span className="font-medium text-primary">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Glass>

            <Glass className="p-5">
              <h2 className="mb-4 text-sm font-medium text-foreground/90">My Profile</h2>
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary/30 to-warning/30">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div className="font-semibold tracking-wide">SARAH BENALI</div>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>Oran, algeria</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="h-4 w-4 text-primary" />
                  <span>+213 555 987 654</span>
                </div>
                <div className="flex items-center gap-3">
                  <Mail className="h-4 w-4 text-primary" />
                  <span>Sarah.Ali@gmail.com</span>
                </div>
              </div>
            </Glass>

            <Glass className="p-5">
              <h2 className="mb-4 text-sm font-medium text-foreground/90">my requests:</h2>
              <ul className="space-y-2">
                {requests.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between rounded-lg border border-white/5 bg-black/20 px-3 py-2"
                  >
                    <div>
                      <div className="text-sm font-medium">{r.id}</div>
                      <div className="text-xs text-muted-foreground">{r.date}</div>
                    </div>
                    <StatusBadge variant={r.status}>{r.label}</StatusBadge>
                  </li>
                ))}
              </ul>
            </Glass>

            <Glass className="p-5">
              <h2 className="mb-4 text-sm font-medium text-foreground/90">Last Request Summary:</h2>
              <div className="space-y-4 text-sm">
                {[
                  ["mission type", "Search & rescue"],
                  ["num persons", "1person"],
                  ["request time", "14:30"],
                  ["location", "Locatio…"],
                  ["drone assigned", "DR-8"],
                ].map(([k, v]) => (
                  <div
                    key={k}
                    className="flex items-center justify-between border-b border-white/10 pb-3 last:border-0"
                  >
                    <span className="text-muted-foreground">{k}</span>
                    <span className="font-medium text-primary">{v}</span>
                  </div>
                ))}
              </div>
            </Glass>

            <Glass className="p-5">
              <h2 className="mb-4 text-sm font-medium text-foreground/90">Emergency Contact</h2>
              <div className="text-lg font-semibold">Ahemed Ali</div>
              <div className="my-4 h-px bg-white/10" />
              <div className="flex items-center gap-3 text-sm">
                <Phone className="h-4 w-4 text-primary" />
                <span>+213 555 987 654</span>
              </div>
            </Glass>

            <Glass className="p-5 lg:col-span-2">
              <h2 className="mb-4 text-sm font-medium text-foreground/90">Mission report</h2>
              <div className="space-y-3 text-sm">
                <div className="flex items-center justify-between rounded-lg bg-black/20 px-3 py-2">
                  <span>Decision</span>
                  <StatusBadge variant="accepted">accepted</StatusBadge>
                </div>
                <div className="rounded-lg bg-black/20 px-3 py-2">
                  <div className="mb-1 text-muted-foreground">Reason</div>
                  <div className="text-xs text-muted-foreground/70">
                    Mission completed successfully. Target located and assistance dispatched.
                  </div>
                </div>
              </div>
            </Glass>

            <Glass className="p-5">
              <h2 className="mb-2 text-sm font-medium text-foreground/90">Feedback</h2>
              <p className="mb-4 text-xs text-muted-foreground">
                how was your experience with our service?
              </p>
              <div className="mb-4 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <button key={i} aria-label={`rate-${i}`}>
                    <Star className="h-6 w-6 text-muted-foreground transition-colors hover:fill-warning hover:text-warning" />
                  </button>
                ))}
              </div>
              <input
                type="text"
                placeholder="Leave a comment…"
                className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm placeholder:text-muted-foreground/60 focus:border-primary focus:outline-none"
              />
            </Glass>
          </div>
        </main>
      </div>
    </div>
  );
}