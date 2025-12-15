// server.js (簡易)
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors()); // テスト用 — 本番は origin を限定する
app.use(bodyParser.json());
app.use(express.static('public'));

const store = new Map();

app.post('/api/session', (req, res) => {
  const sessionId = uuidv4();
  store.set(sessionId, { createdAt: Date.now(), reported: null });
  res.json({ sessionId });
});

app.post('/api/report', (req, res) => {
  const { sessionId, payload } = req.body;
  if (!sessionId || !payload) return res.status(400).json({ error: 'sessionId and payload required' });
  const ip = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').toString().split(',')[0].trim();
  const rec = store.get(sessionId) || { createdAt: Date.now() };
  rec.reported = { payload, ip, reportedAt: Date.now() };
  store.set(sessionId, rec);
  res.json({ ok: true });
});

app.get('/api/session', (req, res) => {
  const sessionId = req.query.sessionId;
  if (!sessionId) return res.status(400).json({ error: 'sessionId required' });
  const rec = store.get(sessionId);
  if (!rec) return res.status(404).json({ error: 'not found' });
  res.json({ sessionId, ...rec });
});

app.listen(PORT, () => console.log(`Server listening on ${PORT}`));