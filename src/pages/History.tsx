import { useState, useEffect } from "react";
import { Clock, Filter, CheckCircle, XCircle, Info } from "lucide-react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ActivityLog {
  id: string;
  created_at: string;
  event_type: string;
  description: string;
  status_encryption?: string;
  script_name?: string;
}

export default function History() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("all");
  const { toast } = useToast();

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
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
      .from("activity_logs")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      toast({
        title: "Erro",
        description: "Não foi possível carregar o histórico.",
        variant: "destructive",
      });
      return;
    }

    setLogs(data || []);
    setLoading(false);
  };

  const getEventIcon = (log: ActivityLog) => {
    // Para eventos de criptografia, usar status_encryption
    if (log.event_type.includes("encryption")) {
      if (log.status_encryption === "success") {
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      }
      if (log.status_encryption === "failed") {
        return <XCircle className="h-4 w-4 text-red-500" />;
      }
      if (log.status_encryption === "pending") {
        return <Info className="h-4 w-4 text-yellow-500" />;
      }
    }
    
    // Para outros eventos, usar lógica padrão
    if (log.event_type.includes("error") || log.event_type.includes("fail") || log.event_type.includes("deleted") || log.event_type.includes("revoked")) {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    if (log.event_type.includes("success") || log.event_type.includes("created") || log.event_type.includes("protected")) {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    return <Info className="h-4 w-4 text-blue-500" />;
  };

  const getEventBadge = (log: ActivityLog) => {
    const variants: Record<string, { label: string; className: string }> = {
      signup: { label: "Cadastro", className: "bg-blue-500/20 text-blue-500" },
      encryption: { label: "Criptografia", className: "bg-green-500/20 text-green-500" },
      key_created: { label: "Chave Criada", className: "bg-purple-500/20 text-purple-500" },
      key_deleted: { label: "Chave Deletada", className: "bg-red-500/20 text-red-500" },
      key_revoked: { label: "Chave Revogada", className: "bg-red-500/20 text-red-500" },
      analysis: { label: "Análise", className: "bg-yellow-500/20 text-yellow-500" },
    };

    // Para eventos de criptografia, mostrar status específico
    if (log.event_type === "encryption") {
      if (log.status_encryption === "success") {
        return <Badge className="bg-green-500/20 text-green-500">Sucesso 🟢</Badge>;
      }
      if (log.status_encryption === "failed") {
        return <Badge className="bg-red-500/20 text-red-500">Falha 🔴</Badge>;
      }
      if (log.status_encryption === "pending") {
        return <Badge className="bg-yellow-500/20 text-yellow-500">Pendente 🟠</Badge>;
      }
    }

    const variant = variants[log.event_type] || { label: log.event_type, className: "bg-gray-500/20 text-gray-500" };
    
    return (
      <Badge className={variant.className}>
        {variant.label}
      </Badge>
    );
  };

  const filteredLogs = filterType === "all" 
    ? logs 
    : logs.filter(log => log.event_type === filterType);

  const eventTypes = Array.from(new Set(logs.map(log => log.event_type)));

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
                  <Clock className="h-8 w-8 text-primary" />
                  Histórico de Atividades
                </h1>
                <p className="text-muted-foreground mt-2">
                  Visualize todas as ações realizadas em sua conta
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Filter className="h-5 w-5 text-muted-foreground" />
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[200px] glass">
                    <SelectValue placeholder="Filtrar por tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as Ações</SelectItem>
                    {eventTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Carregando histórico...</p>
              </div>
            ) : filteredLogs.length === 0 ? (
              <Card className="glass border-primary/10">
                <CardContent className="py-12 text-center">
                  <Clock className="h-16 w-16 text-primary/60 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Nenhuma Atividade Encontrada</h3>
                  <p className="text-muted-foreground">
                    {filterType === "all" 
                      ? "Suas atividades aparecerão aqui" 
                      : "Nenhuma atividade deste tipo encontrada"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <Card className="glass border-primary/10">
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-primary/10">
                        <TableHead className="font-bold">Data/Hora</TableHead>
                        <TableHead className="font-bold">Ação</TableHead>
                        <TableHead className="font-bold">Descrição</TableHead>
                        <TableHead className="font-bold">Status</TableHead>
                        <TableHead className="text-right font-bold">Detalhes</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.map((log) => (
                        <TableRow key={log.id} className="border-primary/10">
                          <TableCell className="font-medium">
                            {format(new Date(log.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </TableCell>
                          <TableCell>
                            {getEventBadge(log)}
                          </TableCell>
                          <TableCell className="max-w-md truncate">
                            {log.description}
                          </TableCell>
                          <TableCell>
                            {getEventIcon(log)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  Ver Mais
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="glass">
                                <DialogHeader>
                                  <DialogTitle>Detalhes da Atividade</DialogTitle>
                                  <DialogDescription>
                                    Informações completas sobre esta ação
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="font-medium mb-1">Data e Hora</h4>
                                    <p className="text-sm text-muted-foreground">
                                      {format(new Date(log.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm:ss", { locale: ptBR })}
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-1">Tipo de Ação</h4>
                                    <p className="text-sm text-muted-foreground">{log.event_type}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-1">Descrição Completa</h4>
                                    <p className="text-sm text-muted-foreground">{log.description}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-medium mb-1">ID da Atividade</h4>
                                    <p className="text-sm text-muted-foreground font-mono">{log.id}</p>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}