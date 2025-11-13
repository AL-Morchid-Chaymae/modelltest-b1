const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✔ Connexion PostgreSQL Railway
const pool = new Pool({
  connectionString: "postgresql://postgres:SHWMkIlzbUwjsEnilEXEWnMViMNLWrvC@mainline.proxy.rlwy.net:10061/railway",
  ssl: { rejectUnauthorized: false }
});

// ✔ Création table
pool.query(`
CREATE TABLE IF NOT EXISTS results (
  id SERIAL PRIMARY KEY,
  name TEXT,
  lesen INTEGER,
  hoeren INTEGER,
  schreiben INTEGER,
  schreiben_text TEXT,
  total INTEGER,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`);

/* ----------------------------------------------------
   FONCTION : Correction automatique Schreiben B1
-----------------------------------------------------*/
function evaluateWritingB1(text) {
  if (!text || text.trim().length < 10) return 0;

  let score = 0;
  const lower = text.toLowerCase();

  // Longueur
  const wc = text.trim().split(/\s+/).length;
  if (wc >= 50) score += 4;
  if (wc >= 80) score += 6;
  if (wc >= 120) score += 8;

  // Respect du sujet
  const keywords = ["meeting", "projekt", "termin", "email", "teilnehmen", "absage", "vorschlag", "leiterin"];
  const relevantCount = keywords.filter(k => lower.includes(k)).length;
  if (relevantCount >= 5) score += 10;
  else if (relevantCount >= 3) score += 6;
  else if (relevantCount >= 1) score += 3;

  // Connecteurs B1
  const connectors = ["weil", "deshalb", "trotzdem", "außerdem", "danach", "zuerst", "später", "damit"];
  const usedConnectors = connectors.filter(c => lower.includes(c)).length;
  if (usedConnectors >= 4) score += 10;
  else if (usedConnectors >= 3) score += 8;
  else if (usedConnectors >= 2) score += 5;
  else if (usedConnectors >= 1) score += 2;

  // Structure mail
  if (lower.includes("sehr geehrte") || lower.includes("hallo")) score += 2;
  if (lower.includes("vorschlag") || lower.includes("termin")) score += 2;
  if (lower.includes("mit freundlichen grüßen")) score += 3;

  // Grammaire B1
  const modals = ["kann", "könnte", "muss", "soll", "würde", "möchte"];
  const modalUsed = modals.filter(m => lower.includes(m)).length;
  if (modalUsed >= 2) score += 5;
  else if (modalUsed >= 1) score += 3;

  return Math.min(score, 40);
}

/* ----------------------------------------------------
   ROUTE : Sauvegarder résultats
-----------------------------------------------------*/
app.post("/save", async (req, res) => {
  const { name, lesen, hoeren, schreiben_text } = req.body;

  const schreiben = evaluateWritingB1(schreiben_text || "");
  const total = lesen + hoeren + schreiben;

  try {
    await pool.query(
      `INSERT INTO results (name, lesen, hoeren, schreiben, schreiben_text, total)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [name, lesen, hoeren, schreiben, schreiben_text, total]
    );
    res.json({ success: true, schreiben, total });
  } catch (err) {
    console.error("❌ SQL Error:", err);
    res.status(500).json({ error: err.message });
  }
});

/* ----------------------------------------------------
   ROUTE : Liste des résultats admin
-----------------------------------------------------*/
app.get("/results", async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM results ORDER BY date DESC`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ----------------------------------------------------
   SERVIR LE SITE 🌍 (important!!)
-----------------------------------------------------*/
app.use(express.static("./"));

/* ----------------------------------------------------
   Lancer serveur
-----------------------------------------------------*/
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
