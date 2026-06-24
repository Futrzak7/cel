const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const DATA_FILE = path.join(__dirname, 'data.json');
const PORT = process.env.PORT || 4000;

function loadData(){
  try{
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(raw);
  }catch(e){
    const initial = { amounts: { kuba:0, adrian:0 }, current: 'kuba' };
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
}

function saveData(d){
  fs.writeFileSync(DATA_FILE, JSON.stringify(d, null, 2));
}

const app = express();
const cors = require('cors');
app.use(cors());
app.use(bodyParser.json());

// Serve static client files from project root
app.use(express.static(__dirname));

app.get('/api/state', (req, res) => {
  const d = loadData();
  res.json({ ok:true, state: d });
});

app.post('/api/change', (req, res) => {
  const { user, amount } = req.body || {};
  if(!user || typeof amount !== 'number') return res.status(400).json({ ok:false, error: 'Invalid payload' });
  // No password required — anyone can update
  const d = loadData();
  d.amounts[user] = Math.max(0, (d.amounts[user]||0) + amount);
  saveData(d);
  res.json({ ok:true, state: d });
});

app.post('/api/setCurrent', (req, res) => {
  const { current } = req.body || {};
  if(!current) return res.status(400).json({ ok:false });
  const d = loadData();
  d.current = current;
  saveData(d);
  res.json({ ok:true, state: d });
});

app.listen(PORT, ()=>{
  console.log('Server running on http://localhost:' + PORT);
});

