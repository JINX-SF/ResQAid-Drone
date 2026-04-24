const requests = [
    {
      id: "REQ-9",
      type: "missing person",
      badge: "SOS",
      badgeColor: "bg-danger text-danger-foreground",
      urgency: "critical",
      urgencyColor: "bg-danger/15 text-danger",
      time: "2min ago",
    },
    {
      id: "REQ-1",
      type: "fire",
      badge: "🔥",
      badgeColor: "",
      urgency: "minor",
      urgencyColor: "bg-warning/15 text-warning",
      time: "10min ago",
    },
    {
      id: "REQ-5",
      type: "flood",
      badge: "🌊",
      badgeColor: "",
      urgency: "critical",
      urgencyColor: "bg-danger/15 text-danger",
      time: "12min ago",
    },
  ];
  
  const EmergencyRequests = () => {
    return (
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="text-lg font-bold text-foreground mb-4">Emergency requests</h2>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-muted-foreground text-left">
              <th className="py-2 font-medium">ID</th>
              <th className="py-2 font-medium">TYPE</th>
              <th className="py-2 font-medium">URGENCY</th>
              <th className="py-2 font-medium">TIME</th>
              <th className="py-2 font-medium">LOCATION</th>
              <th className="py-2 font-medium">ACTIONS</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((r) => (
              <tr key={r.id} className="border-b border-border/50">
                <td className="py-3 font-medium text-foreground">{r.id}</td>
                <td className="py-3">
                  {r.badgeColor ? (
                    <span className="flex items-center gap-1.5">
                      <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${r.badgeColor}`}>{r.badge}</span>
                      {r.type}
                    </span>
                  ) : (
                    <span>{r.badge} {r.type}</span>
                  )}
                </td>
                <td className="py-3">
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${r.urgencyColor}`}>
                    {r.urgency}
                  </span>
                </td>
                <td className="py-3 text-muted-foreground">{r.time}</td>
                <td className="py-3 text-muted-foreground">··············</td>
                <td className="py-3">
                  <button className="bg-primary text-primary-foreground text-xs px-4 py-1.5 rounded-full hover:opacity-90 transition-opacity">
                    review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };
  
  export default EmergencyRequests;
  