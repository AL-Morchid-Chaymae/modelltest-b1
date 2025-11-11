const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Connexion PostgreSQL (URL Railway)
const pool = new Pool({
  connectionString: "postgresql://postgres:SHWMkIlzbUwjsEnilEXEWnMViMNLWrvC@mainline.proxy.rlwy.net:10061/railway",
  ssl: { rejectUnauthorized: false }
});

// ✅ Création de la table (inclut schreiben_text)
pool.query(`
CREATE TABLE IF NOT EXISTS results (
  id SERIAL PRIMARY KEY,
  name TEXT,
  lesen INTEGER,
  hoeren INTEGER,
  schreiben INTEGER,
  total INTEGER,
  schreiben_text TEXT,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`).then(() => console.log("✅ Table vérifiée"))
  .catch(err => console.error("❌ Erreur création table:", err));


// ✅ Route pour enregistrer les résultats
app.post("/save", async (req, res) => {
  const { name, lesen, hoeren, schreiben, total, schreiben_text } = req.body;

  try {
    await pool.query(
      `INSERT INTO results (name, lesen, hoeren, schreiben, total, schreiben_text)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [name, lesen, hoeren, schreiben, total, schreiben_text]
    );
    res.json({ success: true });
  } catch (err) {
    console.error("❌ ERREUR SQL:", err);
    res.status(500).json({ error: err.message });
  }
});


// ✅ Route Admin → récupérer données
app.get("/results", async (req, res) => {
  try {
    const { rows } = await pool.query(`SELECT * FROM results ORDER BY date DESC`);
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Servir les fichiers du site
app.use(express.static("./"));

// ✅ Railway Port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("✅ Serveur en ligne sur port " + PORT);
});
