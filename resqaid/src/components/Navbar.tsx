import { Bell, User } from "lucide-react";
import { Link } from "react-router-dom";

const Navbar = () => {
  return (
    <nav className="absolute mb-12 left-0 right-0 top-0 z-20 flex items-center mb-11 justify-between px-6 py-4 md:px-12 ">
        <h2 className="text-2xl font-bold text-primary-foreground drop-shadow-lg">ResQAid</h2>
        <div className="hidden items-center gap-8 md:flex">
          {["features", "technology", "company", "contact"].map((item) => (
            <a key={item} href={`#${item}`} className="text-sm font-medium text-primary-foreground/90 transition-colors hover:text-black drop-shadow">
              {item}
            </a>
          ))}
          <span className="text-sm font-medium border rounded-md cursor-pointer hover:text-gray-400 px-2 py-1 text-primary-foreground/90 drop-shadow">eng</span>
        </div>
      </nav>
  );
};

export default Navbar;
