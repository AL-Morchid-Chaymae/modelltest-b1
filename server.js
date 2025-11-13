const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// 👉 Très important : servir index.html, admin.html, script.js…
app.use(express.static(__dirname));


// ✅ Connexion PostgreSQL
const pool = new Pool({
  connectionString: "postgresql://postgres:SHWMkIlzbUwjsEnilEXEWnMViMNLWrvC@mainline.proxy.rlwy.net:10061/railway",
  ssl: { rejectUnauthorized: false }
});

// ✅ Création de la table
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
// 🧩 Évaluation Schreiben B1 (AI Rules)
function evaluateWritingB1(text) {
  if (!text || text.trim().length < 10) return 0;

  const lower = text.toLowerCase();
  let score = 0;

  /* =====================================================
      1) LONGUEUR DU TEXTE – 8 points max
  ====================================================== */
  const wc = text.trim().split(/\s+/).length;
  if (wc >= 50) score += 4;
  if (wc >= 80) score += 6;
  if (wc >= 120) score += 8;

  /* =====================================================
      2) RESPECT DU THÈME (hors-sujet) – 12 points max
      Vérifie si l'étudiant parle du Meeting, Termin, Email…
  ====================================================== */
  const keywords = [
    "meeting", "projekt", "projektleiterin", "leiterin", "team",
    "termin", "absage", "einladung", "teilnehmen", "ersatztermin",
    "email", "vorschlag", "unterlagen"
  ];

  let relevantCount = keywords.filter(k => lower.includes(k)).length;

  if (relevantCount >= 6) score += 12;   // très pertinent
  else if (relevantCount >= 4) score += 8;
  else if (relevantCount >= 2) score += 4;
  else score += 0;                       // hors sujet

  /* =====================================================
      3) CONNECTEURS B1 – 10 points max
  ====================================================== */
  const connectors = [
    "weil", "deshalb", "trotzdem", "außerdem", "danach", 
    "zuerst", "später", "damit", "dann", "jedoch"
  ];

  let usedConnectors = connectors.filter(c => lower.includes(c)).length;

  if (usedConnectors >= 4) score += 10;
  else if (usedConnectors >= 3) score += 8;
  else if (usedConnectors >= 2) score += 5;
  else if (usedConnectors >= 1) score += 2;

  /* =====================================================
      4) STRUCTURE FORMELLE D’UN MAIL – 8 points max
  ====================================================== */
  let structurePoints = 0;

  if (lower.includes("sehr geehrte") || lower.includes("hallo")) structurePoints += 2;
  if (lower.includes("vorschlag") || lower.includes("termin")) structurePoints += 2;
  if (lower.includes("mit freundlichen grüßen")) structurePoints += 4;

  score += structurePoints;

  /* =====================================================
      5) GRAMMAIRE B1 — Modalverben, verbe à la fin – 10 points max
  ====================================================== */
  const modalVerbs = ["kann", "könnte", "muss", "soll", "würde", "möchte"];
  const modalUsed = modalVerbs.filter(m => lower.includes(m)).length;

  if (modalUsed >= 3) score += 10;
  else if (modalUsed >= 2) score += 7;
  else if (modalUsed >= 1) score += 4;

  /* =====================================================
      SCORE FINAL (max = 40)
  ====================================================== */
  return Math.min(score, 40);
}


// ✅ Route pour enregistrer les résultats
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
    console.error("❌ Erreur SQL:", err);
    res.status(500).json({ error: err.message });
  }
});


// ✅ Route pour l’Admin
app.get("/results", async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM results ORDER BY date DESC`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 🚀 Démarrer serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Serveur prêt sur port " + PORT);
});
