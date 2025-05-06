const express = require('express');
const cors = require('cors');
const app = express();
app.use(cors());

const PORT = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('LogixTech Rabatt-API läuft!');
});

app.get('/create', (req, res) => {
  const discount = parseInt(req.query.discount || '0');
  const valid = [5, 10, 15, 20, 25, 30];

  if (!valid.includes(discount)) {
    return res.status(400).json({ error: 'Ungültiger Rabattwert' });
  }

  const code = `LOGIX-${discount}-${Math.random().toString(36).substring(6).toUpperCase()}`;
  const validUntil = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  res.json({
    code: code,
    valid_until: validUntil.toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Läuft auf Port ${PORT}`);
});
