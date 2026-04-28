import { useTheme } from "@/hooks";
import { Sun, Moon } from "lucide-react";

export default function ModeToggle() {
  const { theme, toggleTheme } = useTheme();
  return (
    <button className="text-main h-10 w-10 center rounded-full hover:bg-foreground transition-colors" onClick={toggleTheme}>
      {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
