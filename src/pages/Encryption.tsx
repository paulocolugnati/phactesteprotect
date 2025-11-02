import { useState, useEffect } from "react";
import { Upload, Lock, Download, ChevronRight, AlertTriangle, Copy, Code } from "lucide-react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { EncryptionTutorial } from "@/components/EncryptionTutorial";

type ProtectionLevel = "standard" | "advanced" | "premium";

interface UploadedFile {
  name: string;
  size: number;
  file: File;
}

export default function Encryption() {
  const [step, setStep] = useState(1);
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [protectionLevel, setProtectionLevel] = useState<ProtectionLevel>("standard");
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [licenseKeys, setLicenseKeys] = useState<any[]>([]);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processedData, setProcessedData] = useState<any>(null);
  const [loaderCode, setLoaderCode] = useState<string>("");
  const { toast } = useToast();

  // Load license keys on component mount
  useEffect(() => {
    loadKeys();
  }, []);

  // Load license keys
  const loadKeys = async () => {
    // @ts-ignore - Types will be regenerated after migration
    const { data: keys, error } = await supabase
      .from("license_keys")
      .select("*")
      .eq("status", "active");

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as chaves de licença.",
        variant: "destructive",
      });
      return;
    }

    setLicenseKeys(keys || []);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(e.target.files || []);
    const luaFiles = uploadedFiles.filter(
      (file) => file.name.endsWith(".lua") || file.name.endsWith(".zip")
    );

    if (luaFiles.length === 0) {
      toast({
        title: "Formato Inválido",
        description: "Por favor, envie apenas arquivos .lua ou .zip",
        variant: "destructive",
      });
      return;
    }

    const formattedFiles: UploadedFile[] = luaFiles.map((file) => ({
      name: file.name,
      size: file.size,
      file,
    }));

    setFiles([...files, ...formattedFiles]);
    toast({
      title: "Arquivos Carregados",
      description: `${luaFiles.length} arquivo(s) adicionado(s) com sucesso.`,
    });
  };

  // Handle drag and drop
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    const luaFiles = droppedFiles.filter(
      (file) => file.name.endsWith(".lua") || file.name.endsWith(".zip")
    );

    if (luaFiles.length === 0) {
      toast({
        title: "Formato Inválido",
        description: "Por favor, envie apenas arquivos .lua ou .zip",
        variant: "destructive",
      });
      return;
    }

    const formattedFiles: UploadedFile[] = luaFiles.map((file) => ({
      name: file.name,
      size: file.size,
      file,
    }));

    setFiles([...files, ...formattedFiles]);
    toast({
      title: "Arquivos Carregados",
      description: `${luaFiles.length} arquivo(s) adicionado(s) com sucesso.`,
    });
  };

  // Process files
  const handleProcess = async () => {
    if (!selectedKey) {
      toast({
        title: "Chave Necessária",
        description: "Por favor, selecione uma chave de licença.",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    setProgress(0);

    try {
      // Simulate processing with progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 300);

      // Get user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        clearInterval(interval);
        throw new Error("Usuário não autenticado");
      }

      // Call edge function to process files
      const filesToProcess = await Promise.all(
        files.map(async (file) => {
          const content = await file.file.text();
          const fileType = file.name.split('.').pop()?.toLowerCase() || 'lua';
          return {
            name: file.name,
            content,
            type: fileType
          };
        })
      );

      const { data: processData, error: processError } = await supabase.functions.invoke('process-files', {
        body: {
          files: filesToProcess,
          protectionLevel,
          licenseKey: selectedKey,
          userId: user.id
        }
      });

      if (processError) throw processError;

      clearInterval(interval);
      setProgress(100);

      // Log activity
      // @ts-ignore
      await supabase.from("activity_logs").insert({
        user_id: user.id,
        event_type: "encryption",
        description: `${files.length} arquivo(s) criptografado(s) com nível ${protectionLevel}`,
      });

      // Insert scripts_protected and update license key
      const insertedScriptIds: string[] = [];
      
      for (const file of files) {
        // @ts-ignore
        const { data: insertedScript } = await supabase
          .from("scripts_protected")
          .insert({
            user_id: user.id,
            script_name: file.name,
            original_size: file.size,
            encrypted_size: Math.floor(file.size * 1.2),
            status: "protected",
            status_encryption: "success",
          })
          .select()
          .single();
        
        if (insertedScript) {
          insertedScriptIds.push(insertedScript.id);
        }
      }

      // Update license key with linked scripts
      if (insertedScriptIds.length > 0) {
        // @ts-ignore
        const { data: currentKey } = await supabase
          .from("license_keys")
          .select("scripts_vinculados")
          .eq("id", selectedKey)
          .single();

        const currentScripts = (currentKey?.scripts_vinculados as string[]) || [];
        const updatedScripts = [...currentScripts, ...insertedScriptIds];

        // @ts-ignore
        await supabase
          .from("license_keys")
          .update({ scripts_vinculados: updatedScripts })
          .eq("id", selectedKey);
      }

      // Armazenar dados processados e código do loader
      setProcessedData(processData);
      setLoaderCode(processData.loaderCode || '');

      toast({
        title: "Processamento Concluído!",
        description: "Seus arquivos foram criptografados com sucesso.",
      });

      setStep(3);
      setProcessing(false);

    } catch (error) {
      console.error('Error processing files:', error);
      setProcessing(false);
      
      // Registrar falha no banco de dados
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        for (const file of files) {
          // @ts-ignore
          await supabase
            .from("scripts_protected")
            .insert({
              user_id: user.id,
              script_name: file.name,
              original_size: file.size,
              status: "failed",
              status_encryption: "failed",
            });
        }
      }
      
      toast({
        title: "Erro no Processamento",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  };

  const protectionLevels = {
    standard: {
      name: "Padrão (Rápido)",
      description: "Ofuscação básica de variáveis e strings",
      credits: 1,
      badge: undefined,
    },
    advanced: {
      name: "Avançado",
      description: "Ofuscação de bytecode, código morto e fluxo de controle",
      credits: 3,
      badge: undefined,
    },
    premium: {
      name: "Indetectável (IA-Driven)",
      description: "Análise por IA e ofuscação otimizada",
      credits: 5,
      badge: "Premium",
    },
  };

  const totalCredits = files.length * protectionLevels[protectionLevel].credits;

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col">
          <header className="h-16 flex items-center border-b border-primary/10 px-6 glass">
            <SidebarTrigger className="mr-4" />
            <DashboardHeader />
          </header>

          <main className="flex-1 p-6 overflow-auto">
            <div className="grid lg:grid-cols-[1fr_400px] gap-6">
              <div className="space-y-6">
            {/* Progress Indicator */}
            <div className="flex items-center justify-center gap-4 mb-8">
              <div className={`flex items-center gap-2 ${step >= 1 ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 1 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  1
                </div>
                <span className="text-sm font-medium">Upload</span>
              </div>
              <ChevronRight className="text-muted-foreground" />
              <div className={`flex items-center gap-2 ${step >= 2 ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 2 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  2
                </div>
                <span className="text-sm font-medium">Configuração</span>
              </div>
              <ChevronRight className="text-muted-foreground" />
              <div className={`flex items-center gap-2 ${step >= 3 ? "text-primary" : "text-muted-foreground"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step >= 3 ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  3
                </div>
                <span className="text-sm font-medium">Processamento</span>
              </div>
            </div>

            {/* Step 1: Upload */}
            {step === 1 && (
              <Card className="glass border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Upload className="h-5 w-5 text-primary" />
                    Upload de Scripts
                  </CardTitle>
                  <CardDescription>
                    Arraste e solte seus arquivos Lua aqui ou clique para selecionar
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    className="border-2 border-dashed border-primary/20 rounded-lg p-12 text-center hover:border-primary/40 transition-colors cursor-pointer"
                    onClick={() => document.getElementById("file-upload")?.click()}
                  >
                    <Upload className="h-12 w-12 mx-auto mb-4 text-primary/60" />
                    <p className="text-lg mb-2">Arraste e solte seus arquivos aqui</p>
                    <p className="text-sm text-muted-foreground">ou clique para selecionar (*.lua, *.zip)</p>
                    <input
                      id="file-upload"
                      type="file"
                      multiple
                      accept=".lua,.zip"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

                  {files.length > 0 && (
                    <div className="space-y-2">
                      <h3 className="font-medium">Arquivos Carregados:</h3>
                      {files.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 glass rounded-lg border border-primary/10"
                        >
                          <div className="flex items-center gap-3">
                            <Lock className="h-4 w-4 text-primary" />
                            <div>
                              <p className="font-medium">{file.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {(file.size / 1024).toFixed(2)} KB
                              </p>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setFiles(files.filter((_, i) => i !== index))}
                          >
                            Remover
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  <Button
                    onClick={() => {
                      if (files.length === 0) {
                        toast({
                          title: "Nenhum arquivo",
                          description: "Por favor, adicione pelo menos um arquivo.",
                          variant: "destructive",
                        });
                        return;
                      }
                      loadKeys();
                      setStep(2);
                    }}
                    className="w-full"
                    size="lg"
                  >
                    Continuar para Configuração
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            )}

            {/* Step 2: Configuration */}
            {step === 2 && (
              <Card className="glass border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5 text-primary" />
                    Configuração da Criptografia
                  </CardTitle>
                  <CardDescription>
                    Escolha o nível de proteção e vincule à chave de licença
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Protection Level */}
                  <div className="space-y-3">
                    <Label>Nível de Proteção</Label>
                    <RadioGroup value={protectionLevel} onValueChange={(value) => setProtectionLevel(value as ProtectionLevel)}>
                      {Object.entries(protectionLevels).map(([key, level]) => (
                        <div
                          key={key}
                          className={`flex items-center space-x-2 p-4 glass rounded-lg border ${
                            protectionLevel === key ? "border-primary" : "border-primary/10"
                          }`}
                        >
                          <RadioGroupItem value={key} id={key} />
                          <label htmlFor={key} className="flex-1 cursor-pointer">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{level.name}</span>
                              {level.badge && (
                                <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full">
                                  {level.badge}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">{level.description}</p>
                            <p className="text-xs text-primary mt-1">{level.credits} créditos por arquivo</p>
                          </label>
                        </div>
                      ))}</RadioGroup>
                  </div>

                  {/* License Key Selection */}
                  <div className="space-y-3">
                    <Label>Chave de Licença</Label>
                    <Select value={selectedKey} onValueChange={setSelectedKey}>
                      <SelectTrigger className="glass">
                        <SelectValue placeholder="Selecione uma chave de licença" />
                      </SelectTrigger>
                      <SelectContent>
                        {licenseKeys.length === 0 ? (
                          <div className="p-4 text-center text-muted-foreground">
                            Nenhuma chave encontrada. Crie uma em Gerenciamento de Chaves.
                          </div>
                        ) : (
                          licenseKeys.map((key) => (
                            <SelectItem key={key.id} value={key.id}>
                              {key.key_name} - {key.public_key.substring(0, 16)}...
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Cost Summary */}
                  <div className="p-4 glass rounded-lg border border-primary/10">
                    <h3 className="font-medium mb-2">Resumo de Custos</h3>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Arquivos:</span>
                        <span>{files.length}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Créditos por arquivo:</span>
                        <span>{protectionLevels[protectionLevel].credits}</span>
                      </div>
                      <div className="flex justify-between font-medium text-primary pt-2 border-t border-primary/10">
                        <span>Total:</span>
                        <span>{totalCredits} créditos</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                      Voltar
                    </Button>
                    <Button onClick={handleProcess} className="flex-1" disabled={!selectedKey}>
                      Processar e Proteger Arquivos
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Processing/Download */}
            {step === 3 && (
              <Card className="glass border-primary/10">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5 text-primary" />
                    {processing ? "Processando..." : "Download Pronto!"}
                  </CardTitle>
                  <CardDescription>
                    {processing
                      ? "Aguarde enquanto seus arquivos são criptografados"
                      : "Seus arquivos estão prontos para download"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {processing ? (
                    <div className="space-y-4">
                      <Progress value={progress} className="h-2" />
                      <div className="text-center space-y-2">
                        <p className="text-lg font-medium">{progress}% Completo</p>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          {progress < 30 && <p>Ofuscando código...</p>}
                          {progress >= 30 && progress < 60 && <p>Criptografando...</p>}
                          {progress >= 60 && progress < 90 && <p>Vinculando chave...</p>}
                          {progress >= 90 && <p>Finalizando...</p>}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {/* Success Card */}
                      <div className="p-6 glass rounded-lg border border-primary/10 text-center">
                        <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Download className="h-8 w-8 text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold mb-2">CRIPTOGRAFIA CONCLUÍDA COM SUCESSO!</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          {files.length} arquivo(s) criptografado(s) com nível {protectionLevels[protectionLevel].name}
                        </p>
                        <div className="flex gap-4 text-sm text-muted-foreground mb-4">
                          <div>
                            <span className="font-medium">Tempo:</span> 2.3s
                          </div>
                          <div>
                            <span className="font-medium">Créditos:</span> {totalCredits}
                          </div>
                        </div>
                      </div>

                      {/* Security Warning */}
                      <div className="p-4 glass rounded-lg border border-primary/30 bg-primary/5">
                        <div className="flex gap-3">
                          <AlertTriangle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                          <div>
                            <h4 className="font-medium mb-1">GUARDE SEU BACKUP!</h4>
                            <p className="text-sm text-muted-foreground">
                              O PhacProtect armazena o arquivo criptografado por apenas <strong>72 horas</strong> por segurança. 
                              Mantenha o arquivo original em local seguro.
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Tutorial de Implementação */}
                      <div className="p-6 glass rounded-lg border border-primary/20 bg-primary/5 space-y-4">
                        <h3 className="text-xl font-bold flex items-center gap-2">
                          ✅ Seu IP Está Protegido! O Que Fazer Agora?
                        </h3>
                        <div className="space-y-3">
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-primary font-bold">1</span>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-1">Substituição</h4>
                              <p className="text-sm text-muted-foreground">
                                Baixe o ZIP Completo abaixo. Exclua os arquivos LUA originais do seu recurso e substitua-os pelos arquivos de mesmo nome que estão dentro do ZIP.
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-primary font-bold">2</span>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-1">Injetar o Loader</h4>
                              <p className="text-sm text-muted-foreground">
                                Na seção "Loader/Injector", clique em "Copiar Código". Abra o seu fxmanifest.lua (ou __resource.lua) e cole o código do Loader no topo.
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                              <span className="text-primary font-bold">3</span>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-1">Teste</h4>
                              <p className="text-sm text-muted-foreground">
                                Reinicie o recurso. O sistema de proteção do PhacProtect deve carregar o código ofuscado com sucesso.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Seção 1: Arquivo Protegido Completo (ZIP) */}
                      <div className="space-y-3">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <Lock className="h-5 w-5 text-primary" />
                          Arquivo Protegido (Completo)
                        </h3>
                        <Button 
                          size="lg" 
                          className="w-full h-auto py-4 flex flex-col gap-2 bg-[#e98b1b] hover:bg-[#d17915]"
                          onClick={async () => {
                            try {
                              toast({
                                title: "Preparando Download",
                                description: "Gerando arquivo ZIP...",
                              });

                              if (!processedData) {
                                throw new Error('Dados processados não disponíveis');
                              }

                              const response = await fetch(
                                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/download-protected`,
                                {
                                  method: 'POST',
                                  headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                                  },
                                  body: JSON.stringify({
                                    files: processedData.files,
                                    encryptionId: processedData.encryptionId,
                                    licenseKey: selectedKey,
                                  }),
                                }
                              );

                              if (!response.ok) {
                                throw new Error('Erro ao gerar ZIP');
                              }

                              const blob = await response.blob();
                              
                              if (blob.size === 0) {
                                throw new Error('Arquivo ZIP vazio ou corrompido');
                              }

                              const url = window.URL.createObjectURL(blob);
                              const a = document.createElement('a');
                              a.href = url;
                              a.download = processedData.zipFilename || 'phacprotect.zip';
                              document.body.appendChild(a);
                              a.click();
                              window.URL.revokeObjectURL(url);
                              document.body.removeChild(a);

                              toast({
                                title: "Download Concluído!",
                                description: `Arquivo ZIP baixado com sucesso (${(blob.size / 1024).toFixed(2)} KB).`,
                              });
                            } catch (error) {
                              console.error('Download error:', error);
                              toast({
                                title: "Erro no Download",
                                description: error instanceof Error ? error.message : "Erro desconhecido",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          <Download className="h-6 w-6" />
                          <div>
                            <div className="font-bold">Download ZIP Completo</div>
                            <div className="text-xs opacity-80">Pacote com todos os arquivos protegidos</div>
                          </div>
                        </Button>
                      </div>

                      {/* Seção 2: Loader/Injector (Código FXMANIFEST) */}
                      <div className="space-y-3 pt-4 border-t border-primary/10">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <Code className="h-5 w-5 text-primary" />
                          Loader/Injector (Código FXMANIFEST)
                        </h3>
                        <div className="grid md:grid-cols-2 gap-3">
                          <Button 
                            variant="outline"
                            size="lg" 
                            className="w-full h-auto py-4 flex flex-col gap-2 glass border-primary/20"
                            onClick={() => {
                              if (loaderCode && processedData) {
                                const blob = new Blob([loaderCode], { type: 'text/plain' });
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `phacprotect_loader_${processedData.encryptionId}.lua`;
                                document.body.appendChild(a);
                                a.click();
                                window.URL.revokeObjectURL(url);
                                document.body.removeChild(a);

                                toast({
                                  title: "Loader Baixado!",
                                  description: "Arquivo .lua do loader baixado com sucesso.",
                                });
                              } else {
                                toast({
                                  title: "Erro",
                                  description: "Código do loader não disponível.",
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            <Download className="h-6 w-6" />
                            <div>
                              <div className="font-bold">Download .lua</div>
                              <div className="text-xs opacity-80">Arquivo do Loader</div>
                            </div>
                          </Button>

                          <Button 
                            variant="outline"
                            size="lg" 
                            className="w-full h-auto py-4 flex flex-col gap-2 glass border-primary/20"
                            onClick={() => {
                              if (loaderCode) {
                                navigator.clipboard.writeText(loaderCode);
                                toast({
                                  title: "Código Copiado!",
                                  description: "Código do loader copiado para área de transferência.",
                                });
                              } else {
                                toast({
                                  title: "Erro",
                                  description: "Código do loader não disponível.",
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            <Copy className="h-6 w-6" />
                            <div>
                              <div className="font-bold">Copiar Código</div>
                              <div className="text-xs opacity-80">Para FXMANIFEST</div>
                            </div>
                          </Button>
                        </div>
                      </div>

                      {/* Seção 3: Código Ofuscado (Script Principal) */}
                      <div className="space-y-3 pt-4 border-t border-primary/10">
                        <h3 className="font-semibold text-lg flex items-center gap-2">
                          <Code className="h-5 w-5 text-primary" />
                          Código Ofuscado (Script Principal)
                        </h3>
                        <div className="grid md:grid-cols-2 gap-3">
                          <Button 
                            variant="outline"
                            size="lg" 
                            className="w-full h-auto py-4 flex flex-col gap-2 glass border-primary/20"
                            onClick={() => {
                              if (processedData?.files && processedData.files.length > 0) {
                                const firstFile = processedData.files[0];
                                
                                const blob = new Blob([firstFile.content], { type: 'text/plain' });
                                const url = window.URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = firstFile.name;
                                document.body.appendChild(a);
                                a.click();
                                window.URL.revokeObjectURL(url);
                                document.body.removeChild(a);

                                toast({
                                  title: "Código Baixado!",
                                  description: `Arquivo ${firstFile.name} baixado com sucesso.`,
                                });
                              } else {
                                toast({
                                  title: "Erro",
                                  description: "Nenhum arquivo processado disponível.",
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            <Download className="h-6 w-6" />
                            <div>
                              <div className="font-bold">Download .{processedData?.files?.[0]?.type || 'lua'}</div>
                              <div className="text-xs opacity-80">Arquivo Ofuscado</div>
                            </div>
                          </Button>

                          <Button 
                            variant="outline"
                            size="lg" 
                            className="w-full h-auto py-4 flex flex-col gap-2 glass border-primary/20"
                            onClick={() => {
                              if (processedData?.files && processedData.files.length > 0) {
                                navigator.clipboard.writeText(processedData.files[0].content);
                                toast({
                                  title: "Código Copiado!",
                                  description: "Código ofuscado copiado para área de transferência.",
                                });
                              } else {
                                toast({
                                  title: "Erro",
                                  description: "Nenhum arquivo processado disponível.",
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            <Copy className="h-6 w-6" />
                            <div>
                              <div className="font-bold">Copiar Código</div>
                              <div className="text-xs opacity-80">Script Ofuscado</div>
                            </div>
                          </Button>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        onClick={() => {
                          setStep(1);
                          setFiles([]);
                          setSelectedKey("");
                          setProtectionLevel("standard");
                        }}
                        className="w-full"
                      >
                        Criptografar Mais Arquivos
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
              </div>
              
              {/* Tutorial Sidebar - Hidden on mobile, visible on lg+ */}
              <aside className="hidden lg:block">
                <EncryptionTutorial />
              </aside>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}

