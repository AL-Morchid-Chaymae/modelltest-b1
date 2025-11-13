const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(bodyParser.json());

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

// 🧩 Fonction d’évaluation automatique du Schreiben B1
function evaluateWritingB1(text) {
  if (!text) return 0;

  const wordCount = text.trim().split(/\s+/).length;
  let score = 0;

  // Longueur du texte (max 20 pts)
  if (wordCount < 50) score += 5;
  else if (wordCount < 80) score += 10;
  else if (wordCount < 120) score += 15;
  else score += 20;

  // Richesse lexicale (max 10 pts)
  const uniqueWords = new Set(text.toLowerCase().match(/\b[a-zäöüß]+\b/g) || []);
  const diversity = uniqueWords.size / wordCount;
  if (diversity > 0.4) score += 10;
  else if (diversity > 0.3) score += 8;
  else if (diversity > 0.2) score += 5;

  // Grammaire simple (max 10 pts)
  const errors = (text.match(/\b(haben|sein|werden|würde|weil|dass|wenn|kann|soll|möchte)\b/gi) || []).length;
  if (errors > 5) score += 8;
  else if (errors > 2) score += 6;
  else score += 10;

  // Cohérence de phrases (max 10 pts)
  const connectives = (text.match(/\b(weil|deshalb|trotzdem|außerdem|dann|zuerst|danach|später)\b/gi) || []).length;
  if (connectives >= 3) score += 10;
  else if (connectives >= 2) score += 8;
  else if (connectives >= 1) score += 5;

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

// ✅ Route pour afficher les résultats
app.get("/results", async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM results ORDER BY date DESC`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Lancer serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur actif → http://localhost:${PORT}`);
});
