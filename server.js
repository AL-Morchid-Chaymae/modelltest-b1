const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { Pool } = require("pg");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Connexion PostgreSQL (Railway)
const db = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ✅ Création table si elle n'existe pas
db.query(`
CREATE TABLE IF NOT EXISTS results (
  id SERIAL PRIMARY KEY,
  name TEXT,
  lesen INTEGER,
  hoeren INTEGER,
  schreiben INTEGER,
  total INTEGER,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)`).catch(console.error);

// ✅ Route d'enregistrement
app.post("/save", async (req, res) => {
  const { name, lesen, hoeren, schreiben, total } = req.body;
  try {
    await db.query(
      `INSERT INTO results (name, lesen, hoeren, schreiben, total) VALUES ($1,$2,$3,$4,$5)`,
      [name, lesen, hoeren, schreiben, total]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Route admin
app.get("/results", async (req, res) => {
  try {
    const data = await db.query(`SELECT * FROM results ORDER BY date DESC`);
    res.json(data.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ Servir ton site
app.use(express.static("./"));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
