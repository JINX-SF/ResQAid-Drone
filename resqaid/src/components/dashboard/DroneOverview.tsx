import { MapPin, Trash2, Edit } from "lucide-react";

const drones = [
  { id: "DR-1", type: "Search & rescue", emoji: "🔍", location: "Algeria, oran" },
  { id: "DR-2", type: "Delivery", emoji: "📦", location: "Algeria, oran" },
  { id: "DR-3", type: "Situational awareness", emoji: "🎯", location: "Algeria, oran" },
];

const DroneOverview = () => {
  return (
    <div className="bg-card border border-border rounded-xl p-5">
      <h2 className="text-lg font-bold text-foreground mb-4">Drone overview</h2>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-muted-foreground text-left">
            <th className="py-2 font-medium">ID</th>
            <th className="py-2 font-medium">TYPE</th>
            <th className="py-2 font-medium">STATUS</th>
            <th className="py-2 font-medium">BATTERY</th>
            <th className="py-2 font-medium">LOCATION</th>
            <th className="py-2 font-medium">ACTIONS</th>
          </tr>
        </thead>
        <tbody>
          {drones.map((d) => (
            <tr key={d.id} className="border-b border-border/50">
              <td className="py-3 font-medium text-foreground">{d.id}</td>
              <td className="py-3">
                <span className="mr-1">{d.emoji}</span> {d.type}
              </td>
              <td className="py-3" />
              <td className="py-3" />
              <td className="py-3 flex items-center gap-1">
                <MapPin className="w-4 h-4 text-foreground/60" />
                {d.location}
              </td>
              <td className="py-3">
                <div className="flex gap-2">
                  <Trash2 className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-red-700 transition-colors" />
                  <Edit className="w-4 h-4 text-muted-foreground cursor-pointer hover:text-primary transition-colors" />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default DroneOverview;
