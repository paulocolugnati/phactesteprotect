import { useState } from "react";
import { AlertTriangle, Upload, CheckCircle, XCircle, FileText } from "lucide-react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

interface Vulnerability {
  line: number;
  severity: "low" | "medium" | "high";
  type: string;
  description: string;
  suggestion: string;
}

export default function Analysis() {
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);
  const [fileName, setFileName] = useState("");
  const [vulnerabilities, setVulnerabilities] = useState<Vulnerability[]>([]);
  const { toast } = useToast();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith(".lua")) {
      toast({
        title: "Formato Inválido",
        description: "Por favor, envie apenas arquivos .lua",
        variant: "destructive",
      });
      return;
    }

    setFileName(file.name);
    analyzeFile();
  };

  const analyzeFile = () => {
    setAnalyzing(true);
    
    // Simular análise
    setTimeout(() => {
      const mockVulnerabilities: Vulnerability[] = [
        {
          line: 45,
          severity: "high",
          type: "Comando Perigoso",
          description: "Uso de os.execute() sem sanitização detectado",
          suggestion: 'Remova ou sanitize o uso de os.execute(). Considere usar uma whitelist de comandos permitidos.',
        },
        {
          line: 78,
          severity: "medium",
          type: "Variável Global Desprotegida",
          description: "Variável 'playerData' não declarada como local",
          suggestion: 'Declare a variável como local: "local playerData = {}" para prevenir manipulação externa.',
        },
        {
          line: 120,
          severity: "low",
          type: "Acesso de Rede",
          description: "Requisição HTTP sem validação de resposta",
          suggestion: 'Adicione validação da resposta HTTP e tratamento de erros adequado.',
        },
      ];

      setVulnerabilities(mockVulnerabilities);
      setAnalyzed(true);
      setAnalyzing(false);

      toast({
        title: "Análise Concluída",
        description: `${mockVulnerabilities.length} vulnerabilidade(s) encontrada(s)`,
      });
    }, 2000);
  };

  const getRiskLevel = () => {
    const highCount = vulnerabilities.filter(v => v.severity === "high").length;
    const mediumCount = vulnerabilities.filter(v => v.severity === "medium").length;
    
    if (highCount > 0) return { level: "Alto", color: "text-red-500", bg: "bg-red-500/10" };
    if (mediumCount > 0) return { level: "Médio", color: "text-yellow-500", bg: "bg-yellow-500/10" };
    return { level: "Baixo", color: "text-green-500", bg: "bg-green-500/10" };
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      high: { label: "Alto", className: "bg-red-500/20 text-red-500 border-red-500/30" },
      medium: { label: "Médio", className: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30" },
      low: { label: "Baixo", className: "bg-green-500/20 text-green-500 border-green-500/30" },
    };
    
    const variant = variants[severity as keyof typeof variants];
    return (
      <Badge className={`${variant.className} border`}>
        {variant.label}
      </Badge>
    );
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 flex items-center border-b border-primary/10 px-6 glass">
            <SidebarTrigger className="mr-4" />
            <DashboardHeader />
          </header>

          <main className="flex-1 p-6 space-y-6 overflow-auto">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <AlertTriangle className="h-8 w-8 text-primary" />
                Análise de Vulnerabilidade
              </h1>
              <p className="text-muted-foreground mt-2">
                Escaneie seu código Lua para identificar falhas de segurança antes da criptografia
              </p>
            </div>

            {!analyzed ? (
              <Card className="glass border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-primary" />
                    Upload de Script para Análise
                  </CardTitle>
                  <CardDescription>
                    Envie seu arquivo .lua para análise de segurança
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    className="border-2 border-dashed border-primary/20 rounded-lg p-12 text-center hover:border-primary/40 transition-colors cursor-pointer"
                    onClick={() => document.getElementById("analysis-upload")?.click()}
                  >
                    <Upload className="h-12 w-12 mx-auto mb-4 text-primary/60" />
                    <p className="text-lg mb-2">Clique para selecionar arquivo</p>
                    <p className="text-sm text-muted-foreground">Apenas arquivos .lua</p>
                    <input
                      id="analysis-upload"
                      type="file"
                      accept=".lua"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

                  {analyzing && (
                    <div className="text-center py-6">
                      <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-lg font-medium">Analisando {fileName}...</p>
                      <p className="text-sm text-muted-foreground">Escaneando código em busca de vulnerabilidades</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Risk Summary */}
                <Card className={`glass border-primary/10 ${getRiskLevel().bg}`}>
                  <CardContent className="py-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Nível de Risco</h3>
                        <p className={`text-3xl font-bold ${getRiskLevel().color}`}>
                          {getRiskLevel().level}
                        </p>
                      </div>
                      <div className="text-right">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Vulnerabilidades Encontradas</h3>
                        <p className="text-3xl font-bold">{vulnerabilities.length}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* File Info */}
                <Alert className="glass border-primary/10">
                  <FileText className="h-4 w-4" />
                  <AlertTitle>Arquivo Analisado</AlertTitle>
                  <AlertDescription>{fileName}</AlertDescription>
                </Alert>

                {/* Vulnerabilities List */}
                <div className="space-y-4">
                  <h2 className="text-xl font-bold">Relatório de Vulnerabilidades</h2>
                  
                  {vulnerabilities.map((vuln, index) => (
                    <Card key={index} className="glass border-primary/10">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <CardTitle className="text-lg flex items-center gap-2">
                              <AlertTriangle className={`h-5 w-5 ${
                                vuln.severity === "high" ? "text-red-500" :
                                vuln.severity === "medium" ? "text-yellow-500" : "text-green-500"
                              }`} />
                              {vuln.type}
                            </CardTitle>
                            <CardDescription>Linha {vuln.line}</CardDescription>
                          </div>
                          {getSeverityBadge(vuln.severity)}
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <XCircle className="h-4 w-4 text-destructive" />
                            Problema Identificado
                          </h4>
                          <p className="text-sm text-muted-foreground pl-6">{vuln.description}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-medium mb-2 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            Sugestão de Correção
                          </h4>
                          <p className="text-sm text-muted-foreground pl-6">{vuln.suggestion}</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setAnalyzed(false);
                      setFileName("");
                      setVulnerabilities([]);
                    }}
                    className="flex-1"
                  >
                    Analisar Outro Arquivo
                  </Button>
                  <Button className="flex-1">
                    Prosseguir para Criptografia
                  </Button>
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}