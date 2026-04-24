const QuickActions = () => (
    <div className="rounded-xl  backdrop-blur-md border border-white/10 bg-black/20  p-4 space-y-3">
      <h3 className="font-semibold text-white text-sm">Quick actions</h3>
      <div className="space-y-2">
        <button className="w-full py-2.5 rounded-lg bg-primary/90 text-black hover:bg-primary  font-medium text-sm transition-colors">
          Launch drone
        </button>
        <button className="w-full py-2.5 text-white rounded-lg glass hover:bg-gray-950 text-foreground font-medium text-sm transition-colors">
          Return to base
        </button>
        <button className="w-full text-white py-2.5 rounded-lg glass hover:bg-gray-950 text-foreground font-medium text-sm transition-colors">
          Hold position
        </button>
        <button className="w-full py-2.5 text-white rounded-lg bg-destructive/80 hover:bg-destructive text-destructive-foreground font-medium text-sm transition-colors">
          Activate siren
        </button>
      </div>
    </div>
  );
  
  export default QuickActions;
  