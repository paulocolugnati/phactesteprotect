import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DownloadRequest {
  files: Array<{ name: string; content: string; type: string }>;
  encryptionId: string;
  licenseKey: string;
}

// Função para criar o loader configurado
function generateLoader(encryptionId: string, licenseKey: string, fileNames: string[]): string {
  return `-- ============================================
-- PHAC PROTECT LOADER v2.0
-- Encryption ID: ${encryptionId}
-- License Key: ${licenseKey}
-- Protected Files: ${fileNames.length}
-- ============================================

-- PHAC Protection Verification Layer
local _PHAC_PROTECTED = true
local _PHAC_VERSION = "2.0"
local _PHAC_ENC_ID = "${encryptionId}"
local _PHAC_LICENSE = "${licenseKey}"

-- Integrity check function
local function verifyIntegrity()
    if not _PHAC_PROTECTED then
        print("[PHAC] ^1SECURITY VIOLATION: Protection layer compromised^0")
        return false
    end
    
    if not _PHAC_LICENSE or _PHAC_LICENSE == "" then
        print("[PHAC] ^1SECURITY VIOLATION: Invalid license key^0")
        return false
    end
    
    print("[PHAC] ^2Protection Active - Encryption ID: " .. _PHAC_ENC_ID .. "^0")
    return true
end

-- Verificar integridade na inicialização
if not verifyIntegrity() then
    print("[PHAC] ^1CRITICAL: Script protection failed. Execution halted.^0")
    return
end

-- Add this loader code to your fxmanifest.lua:
-- 
-- fx_version 'cerulean'
-- game 'gta5'
-- 
-- -- Load the PHAC Loader first
-- client_script 'phacprotect_loader_${encryptionId}.lua'
-- 
-- -- Then load your protected scripts
${fileNames.map(name => `-- client_script '${name}'`).join('\n')}

print("[PHAC] ^2Protection System Loaded Successfully^0")
`;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { files, encryptionId, licenseKey }: DownloadRequest = await req.json();
    
    console.log(`Generating ZIP for encryption ID: ${encryptionId}`);

    if (!files || files.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Nenhum arquivo para download' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Importar JSZip via CDN com versão fixa
    const JSZip = await import("https://cdn.skypack.dev/jszip@3.10.1");
    const zip = new JSZip.default();

    // Adicionar o loader configurado
    const fileNames = files.map(f => f.name); // Manter nome original
    const loaderCode = generateLoader(encryptionId, licenseKey, fileNames);
    zip.file(`phacprotect_loader_${encryptionId}.lua`, loaderCode);

    // Adicionar os arquivos protegidos mantendo nome original
    for (const file of files) {
      // Manter o nome original do arquivo
      zip.file(file.name, file.content);
    }

    // Adicionar um README com instruções
    const readme = `PHAC PROTECT - INSTRUÇÕES DE INSTALAÇÃO
========================================

ID de Criptografia: ${encryptionId}
Chave de Licença: ${licenseKey}
Arquivos Protegidos: ${files.length}

PASSOS PARA INSTALAÇÃO:
------------------------

1. BACKUP: Faça backup dos seus arquivos originais antes de prosseguir.

2. SUBSTITUIR ARQUIVOS:
   - Exclua os arquivos .lua originais do seu resource
   - Extraia TODOS os arquivos deste ZIP para a pasta do resource
   
3. ATUALIZAR fxmanifest.lua (ou __resource.lua):
   - Abra o arquivo de manifesto do seu resource
   - ADICIONE no topo (antes de qualquer outro script):
   
   client_script 'phacprotect_loader_${encryptionId}.lua'
   
   - Depois, atualize as referências dos scripts protegidos com os nomes originais:
${files.map(f => `   client_script '${f.name}'`).join('\n')}

4. REINICIAR O RESOURCE:
   - No console do servidor: restart [nome-do-resource]
   
5. VERIFICAR:
   - Confira o console do servidor
   - Você deve ver: "[PHAC] Protection System Loaded Successfully"

IMPORTANTE:
-----------
• NÃO modifique os arquivos .bin ou o loader
• NÃO compartilhe sua chave de licença
• Se você revogar a chave, os scripts pararão de funcionar
• Arquivos criptografados são armazenados por apenas 72h no dashboard

SUPORTE:
--------
Para dúvidas ou problemas, acesse o dashboard PhacProtect.

© 2025 PHAC Security System - Todos os direitos reservados.
`;
    
    zip.file('README.txt', readme);

    // Gerar o arquivo ZIP em memória com compressão mínima para evitar corrupção
    const zipBuffer = await zip.generateAsync({ 
      type: "arraybuffer",
      compression: "STORE", // Sem compressão para evitar problemas
      compressionOptions: { level: 0 }
    });

    // Preparar nome do arquivo com timestamp preciso
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const zipFilename = `phacprotect-${dateStr}-${encryptionId}.zip`;

    // Verificar integridade do buffer
    if (!zipBuffer || zipBuffer.byteLength === 0) {
      console.error('ZIP buffer is empty or invalid');
      throw new Error('Falha ao gerar arquivo ZIP: buffer vazio');
    }

    console.log(`ZIP generated successfully: ${zipFilename} (${zipBuffer.byteLength} bytes)`);

    // Retornar o ZIP com headers precisos (raw stream, sem logs no meio)
    return new Response(zipBuffer, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/zip',
        'Content-Disposition': `attachment; filename="${zipFilename}"`,
        'Content-Length': String(zipBuffer.byteLength),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });

  } catch (error) {
    console.error('Error generating ZIP:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro ao gerar arquivo ZIP',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
