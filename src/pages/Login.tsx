import { useEffect } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginData } from "@/lib/validations";
import { useToast } from "@/hooks/use-toast";
import { Link, useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function Login() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, signIn } = useAuth();
  
  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
  });

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const onSubmit = async (data: LoginData) => {
    const { error } = await signIn(data.email, data.password);

    if (error) {
      toast({
        title: "Erro ao fazer login",
        description: error.message === "Invalid login credentials" 
          ? "Email ou senha incorretos" 
          : error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Login bem-sucedido!",
      description: "Redirecionando para o dashboard...",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 pt-32 pb-16">
        <div className="max-w-md mx-auto">
          <div className="glass-card p-8 rounded-2xl space-y-6 animate-fade-in">
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-3xl font-bold">Bem-vindo de volta</h2>
              <p className="text-muted-foreground">Entre na sua conta PhacProtect</p>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...form.register("email")}
                  className="glass"
                  placeholder="seu@email.com"
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Senha</Label>
                  <Button variant="link" className="px-0 text-sm text-primary">
                    Esqueceu a senha?
                  </Button>
                </div>
                <Input
                  id="password"
                  type="password"
                  {...form.register("password")}
                  className="glass"
                  placeholder="••••••••"
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
                )}
              </div>

              <Button type="submit" variant="hero" className="w-full" size="lg">
                Entrar
              </Button>
            </form>

            <div className="text-center text-sm text-muted-foreground">
              Não tem uma conta?{" "}
              <Link to="/cadastro" className="text-primary hover:underline">
                Cadastre-se agora
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
