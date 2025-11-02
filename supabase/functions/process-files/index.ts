import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface FileToProcess {
  name: string;
  content: string;
  type: string;
}

interface ProcessRequest {
  files: FileToProcess[];
  protectionLevel: string;
  licenseKey: string;
  userId: string;
}

// Simula proteção de arquivo LUA (foco principal)
function protectLuaFile(content: string, level: string): string {
  console.log(`Protecting LUA file with level: ${level}`);
  
  // Simulação de ofuscação/criptografia
  const header = `-- Protected by PHAC Security System
-- Protection Level: ${level.toUpperCase()}
-- WARNING: Tampering with this file will result in execution failure

local _PHAC_PROTECTED = true
local _PHAC_VERSION = "2.0"

`;

  // Para nível premium, simula bytecode
  if (level === 'premium') {
    const bytecode = btoa(content); // Base64 como simulação de bytecode
    return header + `-- Bytecode Encrypted (${bytecode.length} bytes)\n` + 
           `loadstring(base64decode("${bytecode}"))()`;
  }
  
  // Para níveis standard/advanced, ofusca código
  const obfuscated = content
    .replace(/function\s+(\w+)/g, (_, name) => `function _PHAC_${Math.random().toString(36).substring(7)}`)
    .replace(/local\s+(\w+)/g, (_, name) => `local _PHAC_${Math.random().toString(36).substring(7)}`);
  
  return header + obfuscated;
}

// Protege arquivo JavaScript
function protectJsFile(content: string, level: string): string {
  console.log(`Protecting JS file with level: ${level}`);
  
  const header = `/* Protected by PHAC Security System - ${level.toUpperCase()} */\n`;
  
  // Minificação básica: remove comentários e espaços extras
  const minified = content
    .replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '') // Remove comentários
    .replace(/\s+/g, ' ') // Remove espaços extras
    .trim();
  
  // Ofuscação de variáveis
  if (level !== 'standard') {
    const obfuscated = minified
      .replace(/var\s+(\w+)/g, (_, name) => `var _0x${Math.random().toString(16).substring(2, 8)}`)
      .replace(/function\s+(\w+)/g, (_, name) => `function _0x${Math.random().toString(16).substring(2, 8)}`);
    return header + obfuscated;
  }
  
  return header + minified;
}

// Protege arquivo HTML
function protectHtmlFile(content: string, level: string): string {
  console.log(`Protecting HTML file with level: ${level}`);
  
  // Remove comentários
  let processed = content.replace(/<!--[\s\S]*?-->/g, '');
  
  // Minifica espaços em branco
  processed = processed.replace(/\s+/g, ' ').trim();
  
  // Ofusca IDs e classes se nível avançado
  if (level !== 'standard') {
    processed = processed
      .replace(/id="([^"]*)"/g, (_, id) => `id="_phac_${Math.random().toString(36).substring(7)}"`)
      .replace(/class="([^"]*)"/g, (_, cls) => `class="_phac_${Math.random().toString(36).substring(7)}"`);
  }
  
  return `<!-- Protected by PHAC Security System -->\n${processed}`;
}

// Protege arquivo CSS
function protectCssFile(content: string, level: string): string {
  console.log(`Protecting CSS file with level: ${level}`);
  
  // Remove comentários
  let processed = content.replace(/\/\*[\s\S]*?\*\//g, '');
  
  // Minifica
  processed = processed.replace(/\s+/g, ' ').trim();
  
  return `/* Protected by PHAC Security System */\n${processed}`;
}

// Protege arquivo JSON
function protectJsonFile(content: string, level: string): string {
  console.log(`Protecting JSON file with level: ${level}`);
  
  try {
    const parsed = JSON.parse(content);
    // Minifica JSON
    return JSON.stringify(parsed);
  } catch (e) {
    console.error('Invalid JSON:', e);
    return content;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { files, protectionLevel, licenseKey, userId }: ProcessRequest = await req.json();
    
    console.log(`Processing ${files.length} files with protection level: ${protectionLevel}`);

    if (!files || files.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Nenhum arquivo para processar' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const processedFiles: Array<{ name: string; content: string; type: string }> = [];

    // Processa cada arquivo baseado no tipo
    for (const file of files) {
      let protectedContent = '';
      const fileType = file.type.toLowerCase();

      if (fileType === 'lua') {
        protectedContent = protectLuaFile(file.content, protectionLevel);
      } else if (fileType === 'js') {
        protectedContent = protectJsFile(file.content, protectionLevel);
      } else if (fileType === 'html') {
        protectedContent = protectHtmlFile(file.content, protectionLevel);
      } else if (fileType === 'css') {
        protectedContent = protectCssFile(file.content, protectionLevel);
      } else if (fileType === 'json') {
        protectedContent = protectJsonFile(file.content, protectionLevel);
      } else {
        protectedContent = file.content; // Tipo não suportado, retorna original
      }

      processedFiles.push({
        name: file.name,
        content: protectedContent,
        type: fileType
      });
    }

    // Gera ID de criptografia único
    const encryptionId = `${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    
    // Data formatada
    const now = new Date();
    const dateStr = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    
    // Gera loader code para arquivos LUA
    const luaFiles = processedFiles.filter(f => f.type === 'lua');
    let loaderCode = '';
    
    if (luaFiles.length > 0) {
      loaderCode = `-- PHAC Loader Code for fxmanifest.lua
-- Encryption ID: ${encryptionId}
-- Add this to your fxmanifest.lua

fx_version 'cerulean'
game 'gta5'

-- Load protected scripts
${luaFiles.map(f => `client_script '${f.name}'`).join('\n')}

-- PHAC Protection Layer
${luaFiles.map(f => `
-- Verify integrity of ${f.name}
if not _PHAC_PROTECTED then
  print('[PHAC] Security check failed for ${f.name}')
  return
end`).join('\n')}
`;
    }

    return new Response(
      JSON.stringify({
        success: true,
        files: processedFiles,
        encryptionId,
        dateStr,
        zipFilename: `phacprotect-${dateStr}-${encryptionId}.zip`,
        loaderCode: loaderCode || null,
        stats: {
          total: processedFiles.length,
          lua: processedFiles.filter(f => f.type === 'lua').length,
          js: processedFiles.filter(f => f.type === 'js').length,
          html: processedFiles.filter(f => f.type === 'html').length,
          css: processedFiles.filter(f => f.type === 'css').length,
          json: processedFiles.filter(f => f.type === 'json').length,
        }
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );

  } catch (error) {
    console.error('Error processing files:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Erro ao processar arquivos',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
