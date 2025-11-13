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
  if (!text || text.trim().length < 20) return 0;

  const lower = text.toLowerCase();
  let score = 0;

  /* =====================================================
     1) LONGUEUR DU TEXTE – 8 points
     (Goethe B1 demande 100–120 mots)
  ====================================================== */
  const wc = text.trim().split(/\s+/).length;

  if (wc >= 60) score += 2;
  if (wc >= 80) score += 4;
  if (wc >= 100) score += 6;
  if (wc >= 130) score += 8; // excellent


  /* =====================================================
     2) RESPECT DU THÈME – 10 points
     (Meeting, Absage, Vorschlag, Termin, E-Mail)
  ====================================================== */
  const keywordsTheme = [
    "meeting", "projekt", "termin", "absage", 
    "teilnehmen", "vorschlag", "leiterin",
    "email", "besprechung", "datum"
  ];

  const themeMatches = keywordsTheme.filter(k => lower.includes(k)).length;

  if (themeMatches >= 6) score += 10;
  else if (themeMatches >= 4) score += 7;
  else if (themeMatches >= 2) score += 4;
  else score += 0; // ❌ hors sujet (telc : résultat = 0)


  /* =====================================================
     3) CONNECTEURS B1 – 10 points
     (weil, deshalb, trotzdem, danach…)
  ====================================================== */
  const connectors = [
    "weil", "deshalb", "trotzdem", "außerdem",
    "danach", "damit", "zuerst", "später"
  ];

  const usedConn = connectors.filter(c => lower.includes(c)).length;

  if (usedConn >= 4) score += 10;
  else if (usedConn >= 3) score += 8;
  else if (usedConn >= 2) score += 5;
  else if (usedConn >= 1) score += 2;


  /* =====================================================
     4) STRUCTURE FORMELLE – 7 points
     (Anrede + Schlussformel + Vorschläge)
  ====================================================== */
  let structPoints = 0;

  if (lower.includes("sehr geehrte") || lower.includes("hallo")) structPoints += 2;
  if (lower.includes("termin") || lower.includes("vorschlag")) structPoints += 2;
  if (lower.includes("mit freundlichen grüßen")) structPoints += 3;

  score += structPoints;


  /* =====================================================
     5) GRAMMATIK B1 – 5 points
     Modalverben + Nebensätze (weil, dass…)
  ====================================================== */
  const modalverbs = ["kann", "muss", "soll", "würde", "könnte", "möchte"];

  const modalCount = modalverbs.filter(m => lower.includes(m)).length;
  const subClauses = (lower.match(/\b(weil|dass|wenn)\b/g) || []).length;

  let grammarScore = 0;

  if (modalCount >= 2) grammarScore += 2;
  if (subClauses >= 1) grammarScore += 3;

  score += grammarScore;


  /* =====================================================
     SCORE FINAL (Max 40)
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
