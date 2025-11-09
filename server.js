// server.js  — RODAR LOCALMENTE APENAS
// Requisitos: node >= 16
const express = require('express');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const fetch = require('node-fetch'); // npm i node-fetch
const { exec } = require('child_process');

const app = express();
app.use(helmet());
app.use(bodyParser.json({ limit: '200kb' }));

// CONFIGURAÇÃO — defina variáveis de ambiente antes de rodar
const PORT = process.env.PORT || 3001;
const BIND_ADDR = '127.0.0.1';
const SECRET = process.env.TERMINAL_TOKEN || 'troque-por-um-token-muito-forte';
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || ''; // sua chave Gemini

if (!GEMINI_API_KEY) {
  console.warn('Aviso: GEMINI_API_KEY não definido. Defina a variável de ambiente antes de usar.');
}

// Função simples de checagem de autenticação via Bearer token
function checkAuth(req, res, next) {
  const auth = req.headers['authorization'] || '';
  if (!auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = auth.slice(7);
  if (token !== SECRET) return res.status(403).json({ error: 'Forbidden' });
  next();
}

// OPTIONAL: Lista branca de comandos (apenas exemplos).
// Se preferir permissivo, mantenha a lista vazia e confie na confirmação manual.
const WHITELIST = [
  // comandos simples permitidos
  '^whoami$',
  '^date$',
  '^uptime$',
  '^ls($|\\s)',
  '^dir($|\\s)',
  '^echo\\s.+',
  '^systeminfo$',
  '^ping\\s+\\S+$'
].map(r => new RegExp(r, 'i'));

// Utilitário: verifica se o comando é permitido
function isAllowedCommand(cmd) {
  if (!WHITELIST || WHITELIST.length === 0) return true; // permitir se lista vazia
  return WHITELIST.some(rx => rx.test(cmd.trim()));
}

// Endpoint: pedir à IA sugestões de comando (não executa)
app.post('/suggest', checkAuth, async (req, res) => {
  const { prompt } = req.body || {};
  if (!prompt || typeof prompt !== 'string') return res.status(400).json({ error: 'Prompt inválido' });

  // Monte um system prompt claro: IA deve retornar comandos sugeridos, com explicação breve
  const systemPrompt = `Você é um assistente que sugere comandos de PowerShell/CLI para executar em um ambiente controlado.
Retorne uma resposta JSON com campo "suggestions": array de objetos { "command": "...", "explanation": "..." }.
Apenas comandos aprovados serão executados manualmente pelo usuário.`;

  try {
    // Chamada genérica para a API do Gemini (exemplo; adapte conforme o endpoint real)
    const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(process.env.GEMINI_MODEL || 'gemini-2.0')} :generateContent?key=${GEMINI_API_KEY}`;
    // Observação: confirme formato de request/response da sua versão da API Gemini e adapte.
    const body = {
      systemInstruction: { parts: [{ text: systemPrompt }] },
      // user content
      contents: [{ parts: [{ text: prompt }] }],
      // opções conforme API (ajuste conforme docs)
      temperature: 0.2,
      maxOutputTokens: 512
    };

    const r = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await r.json();
    // Aqui depende de como a API retorna texto. Ajuste conforme sua resposta real.
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || JSON.stringify(data).slice(0,2000);

    // O ideal é que a IA retorne JSON; se não retornar, você pode tentar extrair linhas que pareçam comandos.
    // Para máxima segurança, retornamos 'raw' e deixamos o cliente mostrar pro usuário.
    res.json({ ok: true, raw: text });
  } catch (err) {
    console.error('Erro /suggest:', err);
    res.status(500).json({ error: 'Erro ao contatar a API Gemini', details: String(err) });
  }
});

// Endpoint: executar comando (só com token e após checagens)
// Repare: este endpoint executa comandos no host — USE SOMENTE EM LOCALHOST e COM TOKEN SEGURO.
app.post('/exec', checkAuth, (req, res) => {
  const { command, requireWhitelist } = req.body || {};
  if (!command || typeof command !== 'string') return res.status(400).json({ error: 'Comando inválido' });

  // Segurança: bloquear uso de caracteres perigosos por padrão (pipes, redirecionamentos, etc.)
  if (/[|&;<>]/.test(command)) {
    return res.status(400).json({ error: 'Comando contém caracteres proibidos (| & ; < >).' });
  }

  // Se for requerido, verifique lista branca
  if (requireWhitelist && !isAllowedCommand(command)) {
    return res.status(403).json({ error: 'Comando não está na lista branca.' });
  }

  // Executa com timeout e limite de buffer
  const containerCmd = `docker exec powershell-container pwsh -Command "${command}"`;
exec(containerCmd, { timeout: 15_000, maxBuffer: 5 * 1024 * 1024 }, (err, stdout, stderr) => {

    if (err) {
      return res.json({ ok: false, stdout: stdout || '', stderr: stderr || '', error: String(err) });
    }
    res.json({ ok: true, stdout, stderr });
  });
});

app.listen(PORT, BIND_ADDR, () => {
  console.log(`Servidor terminal local rodando em http://${BIND_ADDR}:${PORT}`);
  console.log('USE APENAS LOCAL. Configure GEMINI_API_KEY e TERMINAL_TOKEN nas variáveis de ambiente.');
});
