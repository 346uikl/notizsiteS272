const express = require("express");
const cors = require("cors");
const auth = require("./auth");
const notes = require("./notes");
require("./cleanup");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static("frontend"));

// Registrierung
app.post("/api/register", (req, res) => {
    const result = auth.register(req.body.username, req.body.password);
    res.json(result);
});

// Login
app.post("/api/login", (req, res) => {
    const result = auth.login(req.body.username, req.body.password);
    res.json(result);
});

// Notiz speichern
app.post("/api/save", (req, res) => {
    notes.saveNote(req.body.username, req.body.text);
    res.json({ ok: true });
});

// Notizen abrufen
app.get("/api/notes", (req, res) => {
    const n = notes.getNotes(req.query.username);
    res.json(n);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log("Server läuft auf Port " + PORT));
