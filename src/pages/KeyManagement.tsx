import { useState, useEffect } from "react";
import { Key, Plus, Trash2, Copy, CheckCircle, AlertCircle } from "lucide-react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface LicenseKey {
  id: string;
  key_name: string;
  public_key: string;
  status: string;
  created_at: string;
  updated_at: string;
  scripts_vinculados: string[];
}

interface LinkedScript {
  id: string;
  script_name: string;
  created_at: string;
}

export default function KeyManagement() {
  const [keys, setKeys] = useState<LicenseKey[]>([]);
  const [loading, setLoading] = useState(true);
  const [newKeyName, setNewKeyName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [linkedScripts, setLinkedScripts] = useState<Record<string, LinkedScript[]>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadKeys();
  }, []);

  const loadKeys = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado.",
        variant: "destructive",
      });
      return;
    }

    // @ts-ignore - Types will be regenerated after migration
    const { data, error } = await supabase
      .from("license_keys")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar as chaves.",
        variant: "destructive",
      });
      return;
    }

    setKeys((data as LicenseKey[]) || []);
    
    // Carregar scripts vinculados para cada chave
    if (data && data.length > 0) {
      const scriptsMap: Record<string, LinkedScript[]> = {};
      
      for (const key of data) {
        const scriptIds = (key.scripts_vinculados as string[]) || [];
        if (scriptIds.length > 0) {
          // @ts-ignore
          const { data: scripts } = await supabase
            .from("scripts_protected")
            .select("id, script_name, created_at")
            .in("id", scriptIds);
          
          scriptsMap[key.id] = scripts || [];
        } else {
          scriptsMap[key.id] = [];
        }
      }
      
      setLinkedScripts(scriptsMap);
    }
    
    setLoading(false);
  };

  const revokeKey = async (keyId: string, keyName: string) => {
    // @ts-ignore
    const { error } = await supabase
      .from("license_keys")
      .update({ status: "revoked" })
      .eq("id", keyId);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível revogar a chave.",
        variant: "destructive",
      });
      return;
    }

    // Log activity
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // @ts-ignore
      await supabase.from("activity_logs").insert({
        user_id: user.id,
        event_type: "key_revoked",
        description: `Chave de licença revogada: ${keyName}`,
      });
    }

    toast({
      title: "Chave Revogada",
      description: `A chave "${keyName}" foi revogada. Scripts vinculados não funcionarão mais.`,
      variant: "destructive",
    });

    loadKeys();
  };

  const createKey = async () => {
    if (!newKeyName.trim()) {
      toast({
        title: "Nome obrigatório",
        description: "Por favor, insira um nome para a chave.",
        variant: "destructive",
      });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      toast({
        title: "Erro",
        description: "Usuário não autenticado.",
        variant: "destructive",
      });
      return;
    }

    // @ts-ignore - Types will be regenerated after migration
    const { data, error } = await supabase
      .from("license_keys")
      .insert({
        user_id: user.id,
        key_name: newKeyName,
        status: "active",
      })
      .select()
      .single();

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível criar a chave.",
        variant: "destructive",
      });
      return;
    }

    // Log activity
    // @ts-ignore - Types will be regenerated after migration
    await supabase.from("activity_logs").insert({
      user_id: user.id,
      event_type: "key_created",
      description: `Nova chave de licença criada: ${newKeyName}`,
    });

    toast({
      title: "Chave Criada!",
      description: `A chave "${newKeyName}" foi criada com sucesso.`,
    });

    setNewKeyName("");
    setDialogOpen(false);
    loadKeys();
  };

  const deleteKey = async (keyId: string, keyName: string) => {
    // @ts-ignore - Types will be regenerated after migration
    const { error } = await supabase
      .from("license_keys")
      .delete()
      .eq("id", keyId);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível deletar a chave.",
        variant: "destructive",
      });
      return;
    }

    // Log activity
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // @ts-ignore - Types will be regenerated after migration
      await supabase.from("activity_logs").insert({
        user_id: user.id,
        event_type: "key_deleted",
        description: `Chave de licença deletada: ${keyName}`,
      });
    }

    toast({
      title: "Chave Deletada",
      description: `A chave "${keyName}" foi removida.`,
    });

    loadKeys();
  };

  const copyToClipboard = (key: string, keyId: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(keyId);
    setTimeout(() => setCopiedKey(null), 2000);
    
    toast({
      title: "Copiado!",
      description: "Chave copiada para a área de transferência.",
    });
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold flex items-center gap-3">
                  <Key className="h-8 w-8 text-primary" />
                  Gerenciamento de Chaves
                </h1>
                <p className="text-muted-foreground mt-2">
                  Gerencie suas chaves de licença para vincular scripts protegidos
                </p>
              </div>

              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg">
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Chave
                  </Button>
                </DialogTrigger>
                <DialogContent className="glass">
                  <DialogHeader>
                    <DialogTitle>Criar Nova Chave de Licença</DialogTitle>
                    <DialogDescription>
                      Uma chave única será gerada automaticamente
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="key-name">Nome da Chave</Label>
                      <Input
                        id="key-name"
                        placeholder="Ex: Meu Servidor RP Principal"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        className="glass"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={createKey}>Criar Chave</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Carregando chaves...</p>
              </div>
            ) : keys.length === 0 ? (
              <Card className="glass border-primary/10">
                <CardContent className="py-12 text-center">
                  <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Key className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-lg font-medium mb-2">Nenhuma Chave Criada</h3>
                  <p className="text-muted-foreground mb-6">
                    Crie sua primeira chave de licença para começar a proteger seus scripts
                  </p>
                  <Button onClick={() => setDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Criar Primeira Chave
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4">
                {keys.map((key) => (
                  <Card key={key.id} className="glass border-primary/10">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="flex items-center gap-2">
                            <Key className="h-5 w-5 text-primary" />
                            {key.key_name}
                          </CardTitle>
                          <CardDescription>
                            Criada em {format(new Date(key.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </CardDescription>
                        </div>
                        <Badge variant={key.status === "active" ? "default" : "secondary"}>
                          {key.status === "active" ? "Ativa" : "Inativa"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <Label>Chave de Vínculo (UUID Completo)</Label>
                        <div className="flex gap-2">
                          <Input
                            value={key.public_key}
                            readOnly
                            className="glass font-mono text-sm"
                          />
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => copyToClipboard(key.public_key, key.id)}
                          >
                            {copiedKey === key.id ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Use esta chave ao criptografar seus scripts no módulo de Criptografia
                        </p>
                      </div>

                      {/* Scripts Vinculados */}
                      {linkedScripts[key.id] && linkedScripts[key.id].length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-primary/10">
                          <Label>Scripts Vinculados ({linkedScripts[key.id].length})</Label>
                          <div className="space-y-2 max-h-32 overflow-y-auto">
                            {linkedScripts[key.id].map((script) => (
                              <div 
                                key={script.id}
                                className="text-sm p-2 glass rounded border border-primary/10"
                              >
                                <p className="font-medium text-primary">{script.script_name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {format(new Date(script.created_at), "dd/MM/yyyy", { locale: ptBR })}
                                </p>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2 justify-end pt-2">
                        {key.status === "active" && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="border-primary/30 text-primary hover:bg-primary/10">
                                <AlertCircle className="mr-2 h-4 w-4" />
                                Revogar Acesso
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="glass">
                              <AlertDialogHeader>
                                <AlertDialogTitle>Revogar Acesso da Chave?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Ao revogar esta chave, todos os scripts vinculados ({linkedScripts[key.id]?.length || 0}) irão PARAR DE FUNCIONAR imediatamente. 
                                  Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => revokeKey(key.id, key.key_name)}
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                >
                                  Confirmar Revogação
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                        
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="mr-2 h-4 w-4" />
                              Deletar Chave
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="glass">
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja deletar permanentemente a chave "{key.key_name}"? 
                                Scripts vinculados a esta chave pararão de funcionar.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deleteKey(key.id, key.key_name)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Deletar
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}