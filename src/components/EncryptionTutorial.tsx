import { Info, CheckCircle2, Download, Code, Server } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function EncryptionTutorial() {
  return (
    <Card className="glass border-primary/20 sticky top-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Info className="h-5 w-5 text-primary" />
          Guia Rápido: 4 Passos para a Proteção
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Passo 1 */}
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold flex-shrink-0">
              1
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1">Vincular e Processar</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                No dropdown "Chave de Licença", escolha uma chave ativa (ou gere uma nova em{" "}
                <span className="text-primary font-medium">Gerenciamento de Chaves</span>). 
                Clique em "Processar".
              </p>
            </div>
          </div>
        </div>

        {/* Passo 2 */}
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold flex-shrink-0">
              2
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1 flex items-center gap-2">
                <Download className="h-3 w-3" />
                Baixar os Arquivos
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Após "Criptografia Concluída", baixe o arquivo ZIP. Ele contém:
              </p>
              <ul className="text-xs text-muted-foreground list-disc list-inside pl-2 mt-1 space-y-0.5">
                <li>
                  <code className="text-primary">phacprotect-loader.lua</code>
                </li>
                <li>
                  <code className="text-primary">seu_script_protegido.bin</code>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Passo 3 */}
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold flex-shrink-0">
              3
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1 flex items-center gap-2">
                <Server className="h-3 w-3" />
                Implementar no Servidor
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong className="text-primary">Substitua:</strong> Exclua seu script original. 
                Renomeie o <code className="text-primary">.bin</code> para o nome do seu script original 
                (ex: <code>hud.lua</code>).
              </p>
            </div>
          </div>
        </div>

        {/* Passo 4 */}
        <div className="space-y-2">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold flex-shrink-0">
              4
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-sm mb-1 flex items-center gap-2">
                <Code className="h-3 w-3" />
                Ativar o Loader
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Cole o código do Loader no topo do seu{" "}
                <code className="text-primary">fxmanifest.lua</code> (ou{" "}
                <code className="text-primary">__resource.lua</code>) e certifique-se 
                de que ele chama o arquivo protegido.
              </p>
            </div>
          </div>
        </div>

        {/* Nota de Sucesso */}
        <div className="p-3 glass rounded-lg border border-primary/30 bg-primary/5 mt-4">
          <div className="flex gap-2 items-start">
            <CheckCircle2 className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              <strong className="text-primary">Pronto!</strong> Seu script está protegido 
              e vinculado à sua chave. Qualquer tentativa de desofuscação será bloqueada.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
