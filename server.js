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

  let score = 0;
  const lower = text.toLowerCase();
  const wc = text.trim().split(/\s+/).length;

  /* =====================================================
        1) LONGUEUR DU TEXTE – 8 points
  ====================================================== */
  if (wc >= 50) score += 4;
  if (wc >= 80) score += 6;
  if (wc >= 120) score += 8;

  /* =====================================================
        2) RESPECT DU THÈME – 10 points
  ====================================================== */
  const keywords = [
    "meeting", "projekt", "termin", "email", "teilnehmen",
    "absage", "vorschlag", "leiterin", "verpflichtung"
  ];

  const relevantCount = keywords.filter(k => lower.includes(k)).length;

  if (relevantCount >= 5) score += 10;
  else if (relevantCount >= 3) score += 6;
  else if (relevantCount >= 1) score += 3;
  else score -= 5;  // ❗ Pénalité hors sujet

  /* =====================================================
        3) CONNECTEURS B1 – 10 points
  ====================================================== */
  const connectors = [
    "weil", "deshalb", "trotzdem", "außerdem",
    "danach", "zuerst", "später", "damit"
  ];
  const usedConnectors = connectors.filter(c => lower.includes(c)).length;

  if (usedConnectors >= 4) score += 10;
  else if (usedConnectors >= 3) score += 8;
  else if (usedConnectors >= 2) score += 5;
  else if (usedConnectors >= 1) score += 2;

  /* =====================================================
        4) STRUCTURE EMAIL – 7 points
  ====================================================== */
  if (lower.includes("sehr geehrte") || lower.includes("hallo")) score += 2;
  if (lower.includes("vorschlag") || lower.includes("termin")) score += 2;
  if (lower.includes("mit freundlichen grüßen")) score += 3;

  /* =====================================================
        5) MODALVERBEN / GRAMMAIRE – 5 points
  ====================================================== */
  const modals = ["kann", "könnte", "muss", "soll", "würde", "möchte"];
  const modalUsed = modals.filter(m => lower.includes(m)).length;

  if (modalUsed >= 2) score += 5;
  else if (modalUsed >= 1) score += 3;

  /* =====================================================
        6) ERREURS FRÉQUENTES – (das/dass, Großschreibung)
        → max -7 points de pénalité
  ====================================================== */

  let penalty = 0;

  // Erreur das/dass
  const dasCount = (lower.match(/\bdas\b/g) || []).length;
  const dassCount = (lower.match(/\bdass\b/g) || []).length;

  if (dasCount > 0 && dassCount === 0) penalty += 2;  // mauvais usage probable

  // Gross/Kleinschreibung
  const wrongCaps = (text.match(/\b(Ich|Wir|Es|Man)\b/g) || []).length;
  if (wrongCaps < 1) penalty += 2;

  // Verbes non conjugués
  const infinitives = (lower.match(/\b(gehen|machen|haben|sein|arbeiten|kommen)\b/g) || []).length;
  if (infinitives > 3) penalty += 3;

  score -= penalty;


  /* =====================================================
        7) ANTI-PLAGIAT – pénalité si copie du sujet
        → max -10 points
  ====================================================== */

  const sujet =
    "projekt meeting persönliche gründe familie teilnehmen termin alternative unterlagen telefon video";

  let copiedWords = 0;
  sujet.split(" ").forEach(word => {
    if (lower.includes(word)) copiedWords++;
  });

  if (copiedWords > 6) score -= 10;
  else if (copiedWords > 3) score -= 5;


  /* =====================================================
        Score final
  ====================================================== */
  return Math.max(0, Math.min(score, 40));
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
