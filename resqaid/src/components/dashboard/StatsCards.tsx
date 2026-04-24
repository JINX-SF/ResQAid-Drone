import { Plane, AlertTriangle, Users } from "lucide-react";

const stats = [
  {
    icon: Plane,
    label: "Active missions",
    value: "10",
    sub: "3 in progress",
    iconColor: "text-primary",
  },
  {
    icon: Plane,
    label: "Available drones",
    value: "21",
    sub: "5 charging",
    iconColor: "text-primary",
  },
  {
    icon: AlertTriangle,
    label: "pending requests",
    value: "7",
    sub: "3 critical",
    iconColor: "text-danger",
    badge: "SOS",
  },
  {
    icon: Users,
    label: "Users",
    value: "1,347",
    sub: "+10 today",
    iconColor: "text-primary",
  },
];

const StatsCards = () => {
  return (
    <div className=" grid grid-cols-4 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-card border border-border rounded-xl p-4 flex items-center gap-4"
        >
          <div className="flex flex-col items-center">
            {s.badge && (
              <span className="bg-danger text-danger-foreground text-xs font-bold px-2 py-0.5 rounded mb-1">
                {s.badge}
              </span>
            )}
            {!s.badge && <s.icon className={`w-8 h-8 ${s.iconColor}`} />}
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{s.label}</p>
            <p className="text-2xl font-bold text-foreground">{s.value}</p>
            <p className="text-xs text-muted-foreground">{s.sub}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
