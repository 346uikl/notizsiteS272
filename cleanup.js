const cron = require("cron");
const auth = require("./auth");
const fs = require("fs");

const NOTES_FILE = "./backend/db/notes.json";

new cron.CronJob("0 3 * * *", () => {
    console.log("Starte Inaktivitäts-Cleanup...");

    const users = auth.getUsers();
    const notes = JSON.parse(fs.readFileSync(NOTES_FILE));

    const TWO_MONTHS = 1000 * 60 * 60 * 24 * 60;
    const now = Date.now();

    for (let u in users) {
        if (now - users[u].lastActive > TWO_MONTHS) {
            console.log("Lösche User + Daten:", u);
            delete users[u];
            delete notes[u];
        }
    }

    auth.saveUsers(users);
    fs.writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2));
}).start();
