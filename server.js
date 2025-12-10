const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const path = require("path");

const authRoutes = require("./auth.js");
const notesRoutes = require("./notes.js");
require("./cleanup.js");

const app = express();

app.use(cors());
app.use(bodyParser.json());

// Statische Dateien (Frontend) ausliefern
app.use(express.static(path.join(__dirname, "public")));

// API-Routen
app.use("/auth", authRoutes);
app.use("/notes", notesRoutes);

// Damit index.html bei / angezeigt wird
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Render Port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server läuft auf Port ${PORT}`);
});
