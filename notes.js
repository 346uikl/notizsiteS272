const express = require("express");
const fs = require("fs");
const router = express.Router();

const NOTES_FILE = "notes.json";

if (!fs.existsSync(NOTES_FILE)) {
  fs.writeFileSync(NOTES_FILE, JSON.stringify([]));
}

function loadNotes() {
  return JSON.parse(fs.readFileSync(NOTES_FILE));
}
function saveNotes(notes) {
  fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2));
}

// Add
router.post("/add", (req, res) => {
  const { username, content, tags = [], color = "#ffffff", pinned = false } = req.body;
  if (!username || !content) return res.status(400).json({ message: "Fehlende Daten" });

  const notes = loadNotes();
  const note = {
    id: Date.now() + Math.floor(Math.random()*10000),
    username,
    content,
    tags: Array.isArray(tags) ? tags : [],
    color: color || "#ffffff",
    pinned: !!pinned,
    created: Date.now(),
    edited: null
  };
  notes.push(note);
  saveNotes(notes);
  res.json({ message: "Notiz gespeichert", note });
});

// List
router.post("/list", (req, res) => {
  const { username } = req.body;
  if (!username) return res.status(400).json([]);
  const notes = loadNotes().filter(n => n.username === username);
  // pinned first, then newest
  notes.sort((a,b) => {
    if (a.pinned && !b.pinned) return -1;
    if (!a.pinned && b.pinned) return 1;
    return b.created - a.created;
  });
  res.json(notes);
});

// Delete
router.post("/delete", (req, res) => {
  const { id, username } = req.body;
  if (!id || !username) return res.status(400).json({ message: "Fehlende Daten" });
  let notes = loadNotes();
  const before = notes.length;
  notes = notes.filter(n => !(n.id === id && n.username === username));
  saveNotes(notes);
  res.json({ message: "Notiz gelöscht", deleted: before - notes.length });
});

// Edit
router.post("/edit", (req, res) => {
  const { id, username, content, tags, color, pinned } = req.body;
  if (!id || !username) return res.status(400).json({ message: "Fehlende Daten" });
  const notes = loadNotes();
  const idx = notes.findIndex(n => n.id === id && n.username === username);
  if (idx === -1) return res.status(404).json({ message: "Notiz nicht gefunden" });

  if (typeof content === "string") notes[idx].content = content;
  if (Array.isArray(tags)) notes[idx].tags = tags;
  if (typeof color === "string") notes[idx].color = color;
  if (typeof pinned === "boolean") notes[idx].pinned = pinned;

  notes[idx].edited = Date.now();
  saveNotes(notes);
  res.json({ message: "Notiz aktualisiert", note: notes[idx] });
});

module.exports = router;
