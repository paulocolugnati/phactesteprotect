import { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { stepOneSchema, stepTwoSchema, type StepOneData, type StepTwoData } from "@/lib/validations";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export default function Cadastro() {
  const [step, setStep] = useState(1);
  const [stepOneData, setStepOneData] = useState<StepOneData | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user, signUp } = useAuth();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const stepOneForm = useForm<StepOneData>({
    resolver: zodResolver(stepOneSchema),
  });

  const stepTwoForm = useForm<StepTwoData>({
    resolver: zodResolver(stepTwoSchema),
  });

  const onStepOneSubmit = (data: StepOneData) => {
    setStepOneData(data);
    setStep(2);
  };

  const onStepTwoSubmit = async (data: StepTwoData) => {
    if (!stepOneData) return;

    const { error } = await signUp(stepOneData.email, data.password, {
      name: stepOneData.name,
      company_name: stepOneData.companyName,
      age: stepOneData.age,
    });

    if (error) {
      toast({
        title: "Erro ao criar conta",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Conta criada com sucesso!",
      description: "Redirecionando para o dashboard...",
    });
    
    setTimeout(() => {
      navigate("/dashboard");
    }, 1500);
  };

  const passwordValue = stepTwoForm.watch("password") || "";

  // Password strength indicators
  const passwordChecks = {
    length: passwordValue.length >= 8,
    number: /[0-9]/.test(passwordValue),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(passwordValue),
    letter: /[a-zA-Z]/.test(passwordValue),
  };

  const allChecksPassed = Object.values(passwordChecks).every((check) => check);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 pt-32 pb-16">
        <div className="max-w-md mx-auto">
          {/* Progress Indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-sm ${step >= 1 ? "text-primary" : "text-muted-foreground"}`}>
                Dados Pessoais
              </span>
              <span className={`text-sm ${step >= 2 ? "text-primary" : "text-muted-foreground"}`}>
                Segurança
              </span>
            </div>
            <div className="h-2 bg-secondary rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-500"
                style={{ width: `${(step / 2) * 100}%` }}
              />
            </div>
          </div>

          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="glass-card p-8 rounded-2xl space-y-6 animate-fade-in">
              <div>
                <h2 className="text-3xl font-bold mb-2">Crie sua conta</h2>
                <p className="text-muted-foreground">Vamos começar com suas informações básicas</p>
              </div>

              <form onSubmit={stepOneForm.handleSubmit(onStepOneSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    {...stepOneForm.register("name")}
                    className="glass"
                  />
                  {stepOneForm.formState.errors.name && (
                    <p className="text-sm text-destructive">{stepOneForm.formState.errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="companyName">Nome do Servidor/Loja/Empresa</Label>
                  <Input
                    id="companyName"
                    {...stepOneForm.register("companyName")}
                    className="glass"
                  />
                  {stepOneForm.formState.errors.companyName && (
                    <p className="text-sm text-destructive">{stepOneForm.formState.errors.companyName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...stepOneForm.register("email")}
                    className="glass"
                  />
                  {stepOneForm.formState.errors.email && (
                    <p className="text-sm text-destructive">{stepOneForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Idade</Label>
                  <Input
                    id="age"
                    type="number"
                    {...stepOneForm.register("age")}
                    className="glass"
                  />
                  {stepOneForm.formState.errors.age && (
                    <p className="text-sm text-destructive">{stepOneForm.formState.errors.age.message}</p>
                  )}
                  <p className="text-xs text-muted-foreground">Você deve ter pelo menos 18 anos</p>
                </div>

                <Button type="submit" variant="hero" className="w-full" size="lg">
                  Avançar para Segurança
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </form>
            </div>
          )}

          {/* Step 2: Password Security */}
          {step === 2 && (
            <div className="glass-card p-8 rounded-2xl space-y-6 animate-fade-in">
              <div>
                <h2 className="text-3xl font-bold mb-2">Proteja sua conta</h2>
                <p className="text-muted-foreground">Crie uma senha forte para garantir a segurança</p>
              </div>

              <form onSubmit={stepTwoForm.handleSubmit(onStepTwoSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input
                    id="password"
                    type="password"
                    {...stepTwoForm.register("password")}
                    className="glass"
                  />
                </div>

                {/* Password Strength Indicators */}
                <div className="space-y-2 p-4 glass rounded-lg">
                  <p className="text-sm font-medium mb-2">Requisitos de Segurança:</p>
                  
                  <div className="space-y-1">
                    <div className={`flex items-center gap-2 text-sm ${passwordChecks.length ? "text-primary" : "text-muted-foreground"}`}>
                      {passwordChecks.length ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      Mínimo de 8 caracteres
                    </div>
                    <div className={`flex items-center gap-2 text-sm ${passwordChecks.number ? "text-primary" : "text-muted-foreground"}`}>
                      {passwordChecks.number ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      Pelo menos 1 número
                    </div>
                    <div className={`flex items-center gap-2 text-sm ${passwordChecks.special ? "text-primary" : "text-muted-foreground"}`}>
                      {passwordChecks.special ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      Pelo menos 1 caractere especial (!@#$...)
                    </div>
                    <div className={`flex items-center gap-2 text-sm ${passwordChecks.letter ? "text-primary" : "text-muted-foreground"}`}>
                      {passwordChecks.letter ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                      Pelo menos 1 letra
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-3 h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        allChecksPassed ? "bg-primary" : "bg-primary/50"
                      }`}
                      style={{
                        width: `${(Object.values(passwordChecks).filter(Boolean).length / 4) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    {...stepTwoForm.register("confirmPassword")}
                    className="glass"
                  />
                  {stepTwoForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive">{stepTwoForm.formState.errors.confirmPassword.message}</p>
                  )}
                </div>

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="glass"
                    onClick={() => setStep(1)}
                    className="flex-1"
                    size="lg"
                  >
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Voltar
                  </Button>
                  <Button type="submit" variant="hero" className="flex-1" size="lg" disabled={!allChecksPassed}>
                    Criar Minha Conta Segura
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
