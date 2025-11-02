import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import heroImage from "@/assets/hero-security.jpg";
import { Shield, Lock, Zap } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroImage}
          alt="PhacProtect Security Shield"
          className="w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background"></div>
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }}></div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 z-10 text-center animate-fade-in">
        <div className="max-w-4xl mx-auto space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            <span className="text-primary">Phac</span>Protect: O Escudo de IA Contra{" "}
            <span className="text-primary">Vazamentos de Scripts Lua</span>
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
            Use criptografia indestrutível e gerenciamento de licenças para proteger o IP do seu
            servidor FiveM, sem comprometer a performance.
          </p>

          <div className="flex flex-wrap gap-4 justify-center mt-8">
            <Link to="/cadastro">
              <Button variant="hero" size="lg" className="text-lg">
                Começar Agora
              </Button>
            </Link>
            <Button variant="glass" size="lg" className="text-lg">
              Saiba Mais
            </Button>
          </div>

          {/* Feature Pills */}
          <div className="flex flex-wrap gap-4 justify-center mt-12">
            <div className="glass-card px-6 py-3 rounded-full flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              <span>Criptografia Forte</span>
            </div>
            <div className="glass-card px-6 py-3 rounded-full flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" />
              <span>Gerenciamento de Licenças</span>
            </div>
            <div className="glass-card px-6 py-3 rounded-full flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              <span>Performance Máxima</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
