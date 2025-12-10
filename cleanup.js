const { CronJob } = require("cron");
const fs = require("fs");

const NOTES_FILE = "notes.json";

function loadNotes() {
    if (!fs.existsSync(NOTES_FILE)) return [];
    return JSON.parse(fs.readFileSync(NOTES_FILE));
}

function saveNotes(notes) {
    fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2));
}

function cleanupOldNotes() {
    console.log("Cleanup gestartet:", new Date().toISOString());

    const notes = loadNotes();
    const twoMonths = 1000 * 60 * 60 * 24 * 60; // 60 Tage
    const now = Date.now();

    const filtered = notes.filter(n => (now - n.created) < twoMonths);

    if (filtered.length !== notes.length) {
        console.log("Alte Notizen gelöscht:", notes.length - filtered.length);
    }

    saveNotes(filtered);
}

// Läuft täglich um 03:00
const job = new CronJob("0 3 * * *", cleanupOldNotes, null, true, "Europe/Berlin");

module.exports = job;