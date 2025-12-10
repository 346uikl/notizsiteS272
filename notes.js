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

router.post("/add", (req, res) => {
    const { username, content } = req.body;

    let notes = loadNotes();

    notes.push({
        username,
        content,
        created: Date.now()
    });

    saveNotes(notes);

    res.json({ message: "Notiz gespeichert" });
});

router.post("/list", (req, res) => {
    const { username } = req.body;

    const notes = loadNotes().filter(n => n.username === username);

    res.json(notes);
});

module.exports = router;