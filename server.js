const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./auth.js");
const notesRoutes = require("./notes.js");
require("./cleanup.js"); // aktiviert Cron-Job

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Statische Dateien aus aktuellem Ordner ausliefern (ein Ordner Setup)
app.use(express.static(__dirname));

// API-Routen
app.use("/auth", authRoutes);
app.use("/notes", notesRoutes);

// Fallback: index.html für alle anderen Routen
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server läuft auf Port ${PORT}`);
});
