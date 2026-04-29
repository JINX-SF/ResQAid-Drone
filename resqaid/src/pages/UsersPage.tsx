import { User } from "lucide-react";
import AppShell, { Glass } from "../components/AppShell";

const users = Array.from({ length: 7 }).map((_, i) => ({
  name: i === 0 ? "Sarah ali" : i === 2 ? "Samia B." : "yacine benali",
  email: "Sarah.Ali@gmail.com",
  phone: "+213 555 987 654",
  joined: "23/04/2026",
  location: "Oran,Algeria",
}));

export default function UsersPage() {
  return (
    <AppShell>
      <Glass className="overflow-hidden">
        <div className="flex items-center justify-between bg-black/40 px-6 py-4">
          <h2 className="text-2xl font-semibold text-white/80">All Users</h2>
        </div>
        <div className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr] gap-4 border-b border-white/10 bg-black/30 px-6 py-3 text-xs uppercase tracking-wider text-muted-foreground">
          <div>Users</div>
          <div>Email/Phone</div>
          <div>Joined on</div>
          <div>Location</div>
          <div className="text-right">Actions</div>
        </div>
        <ul className="divide-y text-white/60 divide-white/5">
          {users.map((u, i) => (
            <li
              key={i}
              className="grid grid-cols-[1.5fr_1.5fr_1fr_1fr_1fr] items-center gap-4 px-6 py-4 text-sm transition-colors hover:bg-white/5"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/30 text-warning">
                  <User className="h-5 text-gray-400 w-5" />
                </div>
                <span className="font-medium">{u.name}</span>
              </div>
              <div className="text-sm">
                <div className="underline underline-offset-2 text-black/90">{u.email}</div>
                <div className="text-xs text-white/50">{u.phone}</div>
              </div>
              <div className="text-white/60">{u.joined}</div>
              <div className="text-white/60">{u.location}</div>
              <div className="flex justify-end">
                <button className="rounded-lg bg-primary/80 px-4 py-2 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary">
                  view profile
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Glass>
    </AppShell>
  );
}