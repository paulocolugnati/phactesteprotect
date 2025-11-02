import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { Shield } from "lucide-react";

export const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-primary/10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Shield className="h-8 w-8 text-primary group-hover:animate-glow transition-all" />
          <span className="text-2xl font-bold">
            <span className="text-primary">Phac</span>Protect
          </span>
        </Link>

        <nav className="flex items-center gap-4">
          <Link to="/login">
            <Button variant="ghost">Login</Button>
          </Link>
          <Link to="/cadastro">
            <Button variant="hero">Cadastro</Button>
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
};
