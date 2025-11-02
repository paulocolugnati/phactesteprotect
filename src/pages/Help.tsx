import { HelpCircle, BookOpen, MessageCircle, Mail, ExternalLink } from "lucide-react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardSidebar } from "@/components/DashboardSidebar";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function Help() {
  const faqs = [
    {
      question: "Como configurar o loader LUA no meu fxmanifest.lua?",
      answer: "Para usar scripts protegidos pelo PhacProtect, adicione as linhas fornecidas após a criptografia ao seu fxmanifest.lua. O loader garante que o script seja carregado corretamente e verifica a integridade da proteção antes da execução.",
    },
    {
      question: "Como vincular um script à minha Chave de Licença?",
      answer: "Durante o processo de criptografia, selecione a chave de licença desejada no passo 2 (Configuração). Isso vincula permanentemente o script àquela chave específica. Scripts vinculados só funcionarão em servidores que possuam a chave correspondente.",
    },
    {
      question: "O que fazer se o Windows disser que meu ZIP é inválido?",
      answer: "Se o Windows mostrar erro ao abrir o ZIP: 1) Verifique se o download foi completo (tamanho do arquivo), 2) Desative temporariamente o antivírus/firewall, 3) Tente extrair com ferramentas alternativas (7-Zip, WinRAR), 4) Baixe novamente se o problema persistir.",
    },
    {
      question: "O que é Ofuscação de Bytecode e como ela protege meu IP?",
      answer: "A ofuscação de bytecode converte seu código LUA em formato binário compilado, tornando extremamente difícil reverter para código-fonte legível. Isso protege sua lógica de negócio, algoritmos e segredos contra cópia e análise. No nível Premium, usamos IA para aplicar múltiplas camadas de proteção.",
    },
    {
      question: "Como funciona a criptografia de scripts?",
      answer: "O PhacProtect utiliza múltiplas camadas de ofuscação e criptografia no seu código Lua, tornando-o praticamente impossível de ser desofuscado. O processo inclui ofuscação de variáveis, bytecode e fluxo de controle, além de vinculação com chave de licença.",
    },
    {
      question: "O que são as chaves de licença?",
      answer: "As chaves de licença são códigos únicos gerados para vincular seus scripts criptografados a servidores específicos. Isso garante que apenas servidores autorizados possam executar seu código protegido. Você pode desativar chaves a qualquer momento para revogar acesso.",
    },
    {
      question: "Como funciona o sistema de créditos?",
      answer: "Cada nível de criptografia consome uma quantidade específica de créditos: Padrão (1 crédito), Avançado (3 créditos) e Premium/IA (5 créditos). Você pode adquirir pacotes de créditos de acordo com suas necessidades.",
    },
    {
      question: "Posso recuperar o código original após criptografar?",
      answer: "Não. A criptografia é irreversível por design de segurança. Sempre mantenha um backup do código original em local seguro antes de criptografar. Nunca delete seus arquivos originais.",
    },
    {
      question: "O que é a Análise de Vulnerabilidade?",
      answer: "É uma ferramenta que escaneia seu código antes da criptografia, identificando possíveis falhas de segurança como comandos perigosos, variáveis globais desprotegidas e padrões suspeitos de backdoor.",
    },
    {
      question: "Meu script protegido não está carregando no FiveM",
      answer: "Verifique se: 1) O loader foi adicionado corretamente ao fxmanifest.lua, 2) A chave de licença está ativa, 3) O script está na pasta correta do resource, 4) Não há erros no console (F8). Se o problema persistir, contate o suporte.",
    },
    {
      question: "Posso proteger múltiplos arquivos de uma vez?",
      answer: "Sim! O PhacProtect suporta upload de múltiplos arquivos .lua, .js, .html, .css, .json e .zip. Todos serão processados em lote e empacotados em um único arquivo ZIP para download. O foco principal é proteção de scripts LUA para FiveM.",
    },
  ];

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
                <HelpCircle className="h-8 w-8 text-primary" />
                Ajuda e Suporte
              </h1>
              <p className="text-muted-foreground mt-2">
                Encontre respostas para suas dúvidas e entre em contato conosco
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-4">
              <Card className="glass border-primary/10 hover:border-primary/30 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <BookOpen className="h-5 w-5 text-primary" />
                    Documentação
                  </CardTitle>
                  <CardDescription>
                    Guias completos sobre todas as funcionalidades
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Acessar Documentação
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass border-primary/10 hover:border-primary/30 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <MessageCircle className="h-5 w-5 text-primary" />
                    Chat ao Vivo
                  </CardTitle>
                  <CardDescription>
                    Fale com nossa equipe em tempo real
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    Iniciar Chat
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>

              <Card className="glass border-primary/10 hover:border-primary/30 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Mail className="h-5 w-5 text-primary" />
                    Email
                  </CardTitle>
                  <CardDescription>
                    Envie sua dúvida por email
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="outline" className="w-full">
                    suporte@phacprotect.com
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* FAQ Section */}
            <Card className="glass border-primary/10">
              <CardHeader>
                <CardTitle className="text-2xl">Perguntas Frequentes</CardTitle>
                <CardDescription>
                  Respostas rápidas para as dúvidas mais comuns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`} className="border-primary/10">
                      <AccordionTrigger className="text-left hover:text-primary">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            {/* Getting Started Guide */}
            <Card className="glass border-primary/10">
              <CardHeader>
                <CardTitle className="text-2xl">Guia de Início Rápido</CardTitle>
                <CardDescription>
                  Passos para começar a proteger seus scripts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold">1</span>
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Crie uma Chave de Licença</h3>
                      <p className="text-sm text-muted-foreground">
                        Acesse &quot;Gerenciamento de Chaves&quot; e gere sua primeira chave para vincular aos scripts.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold">2</span>
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Analise Vulnerabilidades (Opcional)</h3>
                      <p className="text-sm text-muted-foreground">
                        Use a &quot;Análise de Vulnerabilidade&quot; para verificar seu código antes de criptografar.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold">3</span>
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Criptografe Seus Scripts</h3>
                      <p className="text-sm text-muted-foreground">
                        Faça upload dos arquivos .lua, escolha o nível de proteção e vincule à sua chave.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold">4</span>
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Baixe ou Copie o Código</h3>
                      <p className="text-sm text-muted-foreground">
                        Após o processamento, baixe o ZIP ou copie o código direto para usar no servidor.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Support */}
            <Card className="glass border-primary/10 bg-primary/5">
              <CardContent className="py-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium mb-1">Não encontrou o que procura?</h3>
                    <p className="text-sm text-muted-foreground">
                      Nossa equipe está pronta para ajudar você
                    </p>
                  </div>
                  <Button size="lg">
                    Entrar em Contato
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}