const activities = [
    { time: "9:53", text: "Drone dr-3 assigned to mission" },
    { time: "9:32", text: "Drone dr-6 mission completed" },
    { time: "8:59", text: "User SARAH ALI registered" },
    { time: "8:15", text: "" },
  ];
  
  const ActivityFeed = () => {
    return (
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-foreground">Activity</h2>
          <button className="text-xs border border-border rounded-full px-3 py-1 text-muted-foreground hover:bg-accent transition-colors">
            view all
          </button>
        </div>
        <div className="space-y-4">
          {activities.map((a, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="flex flex-col items-center">
                <div className="w-2.5 h-2.5 rounded-full bg-success mt-1" />
                {i < activities.length - 1 && (
                  <div className="w-px h-8 bg-border" />
                )}
              </div>
              <div>
                <p className="text-xs text-muted-foreground">{a.time}</p>
                {a.text && <p className="text-sm text-foreground">{a.text}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  export default ActivityFeed;
  