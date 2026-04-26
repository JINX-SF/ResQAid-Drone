import { Search, User, Bell } from "lucide-react";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <header className="bg-card/20 backdrop-blur-md flex items-center justify-between px-6 py-4 border-border bg-card">
      <div className="flex-1" />
      <div className="flex items-center bg-background border border-border rounded-full px-4 py-2 w-80">
        <Search className="w-4 h-4 text-muted-foreground mr-2" />
        <input
          type="text"
          placeholder="Search(drones, missions...)"
          className="bg-transparent outline-none text-sm text-foreground placeholder:text-muted-foreground w-full"
        />
      </div>
      <div className="flex-1 flex justify-end items-center gap-4">
        <Link to={"/profile"}><User className="w-6 h-6 text-foreground/70 cursor-pointer" /></Link>
        <Bell className="w-6 h-6 text-foreground/70 cursor-pointer" />
      </div>
    </header>
  );
};

export default Header;
