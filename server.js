const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const cors = require("cors");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
app.use(bodyParser.json());

// ✅ Base de données SQLite
const db = new sqlite3.Database("results.db", (err) => {
  if (err) console.error(err);
  console.log("✅ Base de données SQLite ouverte");
});

// ✅ Création de la table si elle n'existe pas
db.run(`
CREATE TABLE IF NOT EXISTS results (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT,
  lesen INTEGER,
  hoeren INTEGER,
  schreiben INTEGER,
  total INTEGER,
  date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
`);

// ✅ Route pour enregistrer les résultats (appelée depuis le test)
app.post("/save", (req, res) => {
  const { name, lesen, hoeren, schreiben, total } = req.body;

  db.run(
    `INSERT INTO results (name, lesen, hoeren, schreiben, total) VALUES (?, ?, ?, ?, ?)`,
    [name, lesen, hoeren, schreiben, total],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true });
    }
  );
});

// ✅ Route ADMIN → renvoie la liste des résultats au tableau DataTables
app.get("/results", (req, res) => {
  db.all(`SELECT * FROM results ORDER BY date DESC`, [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// ✅ Servir les fichiers (index.html + admin.html)
app.use(express.static("./"));

app.listen(3000, () => {
  console.log("✅ Serveur en cours → http://localhost:3000");
  console.log("📊 Page Admin → http://localhost:3000/admin.html");
});
