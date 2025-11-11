const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg"); // ✅ PostgreSQL

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Base PostgreSQL (COLLE ICI TON URL EXACTE)
const pool = new Pool({
  connectionString: "postgresql://postgres:SHWMkIlzbUwjsEnilEXEWnMViMNLWrvC@mainline.proxy.rlwy.net:10061/railway",
  ssl: { rejectUnauthorized: false }
});

// ✅ Création de la table si elle n'existe pas
pool.query(`
CREATE TABLE IF NOT EXISTS results (
  id SERIAL PRIMARY KEY,
  name TEXT,
  lesen INTEGER,
  hoeren INTEGER,
  schreiben INTEGER,
  total INTEGER,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`);


// ✅ Route pour enregistrer les résultats
app.post("/save", async (req, res) => {
  try {
    const { name, lesen, hoeren, schreiben, total } = req.body;

    await pool.query(
      `INSERT INTO results (name, lesen, hoeren, schreiben, total)
       VALUES ($1, $2, $3, $4, $5)`,
      [name, lesen, hoeren, schreiben, total]
    );

    res.json({ success: true });

  } catch (err) {
    console.error("❌ Erreur DB:", err);
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

// ✅ Servir les fichiers HTML
app.use(express.static("./"));

// ✅ PORT pour Railway
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Serveur en ligne → http://localhost:${PORT}`);
});
