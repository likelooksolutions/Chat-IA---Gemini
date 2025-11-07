// server.js — RODAR LOCALMENTE APENAS
const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const bodyParser = require('body-parser');
const { exec } = require('child_process');

const app = express();
app.use(helmet());

// Allow only localhost by default
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  methods: ['POST'],
}));

app.use(bodyParser.json({ limit: '100kb' }));

// Configure a secret token — alter para um valor forte antes de rodar
const SECRET_TOKEN = process.env.TERMINAL_TOKEN || 'troque-por-um-token-muito-forte';

function checkAuth(req, res, next) {
  const auth = req.headers['authorization'] || '';
  if (!auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Unauthorized' });
  const token = auth.slice(7);
  if (token !== SECRET_TOKEN) return res.status(403).json({ error: 'Forbidden' });
  next();
}

// Exec endpoint — cuidado: executa comandos
app.post('/exec', checkAuth, (req, res) => {
  const { command } = req.body || {};
  if (!command || typeof command !== 'string') {
    return res.status(400).json({ error: 'Comando inválido' });
  }

  // Segurança adicional: pode restringir comandos ou caminhos aqui
  // Exemplo: bloquear pipes/redirecionamentos que exfiltram dados:
  if (/[|&;]/.test(command)) {
    return res.status(400).json({ error: 'Comando potencialmente inseguro — caracteres proibidos' });
  }

  // Exec — limite de tempo e tamanho
  exec(command, { timeout: 15000, maxBuffer: 5 * 1024 * 1024 }, (err, stdout, stderr) => {
    if (err && err.killed) {
      return res.json({ stdout: stdout || '', stderr: stderr || '', error: 'Tempo esgotado' });
    }
    if (err) {
      // Retornar saída e mensagem de erro
      return res.json({ stdout: stdout || '', stderr: stderr || '', error: err.message });
    }
    res.json({ stdout, stderr });
  });
});

// Apenas aceitar conexões locais
const PORT = process.env.PORT || 3001;
app.listen(PORT, '127.0.0.1', () => {
  console.log(`Terminal seguro rodando em http://127.0.0.1:${PORT} (APENAS LOCAL). Token via TERMINAL_TOKEN env var.`);
});
