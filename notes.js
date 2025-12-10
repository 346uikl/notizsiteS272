const fs = require("fs");
const { encrypt, decrypt } = require("./crypto");

const NOTES_FILE = "./backend/db/notes.json";

function loadNotes() {
    if (!fs.existsSync(NOTES_FILE)) fs.writeFileSync(NOTES_FILE, "{}");
    return JSON.parse(fs.readFileSync(NOTES_FILE));
}

function saveNotesFile(n) {
    fs.writeFileSync(NOTES_FILE, JSON.stringify(n, null, 2));
}

module.exports = {
    saveNote(username, text) {
        const notes = loadNotes();
        if (!notes[username]) notes[username] = [];

        const encrypted = encrypt(text);
        notes[username].push(encrypted);

        saveNotesFile(notes);
    },

    getNotes(username) {
        const notes = loadNotes();
        if (!notes[username]) return [];

        return notes[username].map(n => decrypt(n));
    }
};
