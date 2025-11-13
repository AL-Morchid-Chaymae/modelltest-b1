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

  const t = text.toLowerCase();
  let score = 0;

  /* ------------------------------
     1) Longueur du texte (10 pts)
  ------------------------------ */
  const wc = t.split(/\s+/).length;
  if (wc >= 50) score += 4;
  if (wc >= 80) score += 7;
  if (wc >= 120) score += 10;

  /* -----------------------------------------
     2) Respect du thème "Email / Meeting" (10 pts)
  ------------------------------------------ */
  const thematicWords = [
    "meeting","projekt","termin","email","teilnehmen",
    "absage","vorschlag","leiterin","datum","planung"
  ];
  let thematicCount = thematicWords.filter(w => t.includes(w)).length;

  if (thematicCount >= 5) score += 10;
  else if (thematicCount >= 3) score += 7;
  else if (thematicCount >= 1) score += 4;

  /* ------------------------------------------
     3) Connecteurs B1 (10 pts)
  ------------------------------------------ */
  const connectors = [
    "weil","deshalb","trotzdem","außerdem","danach",
    "dann","zuerst","später","damit","obwohl"
  ];
  let connectorsUsed = connectors.filter(c => t.includes(c)).length;

  if (connectorsUsed >= 5) score += 10;
  else if (connectorsUsed >= 3) score += 7;
  else if (connectorsUsed >= 2) score += 5;
  else if (connectorsUsed >= 1) score += 2;

  /* ------------------------------------------
     4) Structure d'un mail (5 pts)
  ------------------------------------------ */
  if (t.includes("sehr geehrte") || t.includes("hallo")) score += 1;
  if (t.includes("vorschlag") || t.includes("termin")) score += 1;
  if (t.includes("mit freundlichen grüßen")) score += 3;

  /* ------------------------------------------
     5) Grammaire B1 (Modalverben, phrases)
  ------------------------------------------ */
  const modals = ["kann","könnte","muss","soll","würde","möchte"];
  const modalCount = modals.filter(m => t.includes(m)).length;

  if (modalCount >= 3) score += 5;
  else if (modalCount >= 1) score += 3;

  /* Score final */
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
