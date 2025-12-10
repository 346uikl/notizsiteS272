// auth.js
const express = require("express");
const fs = require("fs");
const bcrypt = require("bcrypt");
const router = express.Router();

const USERS_FILE = "users.json";

if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, JSON.stringify([]));

function loadUsers() {
    return JSON.parse(fs.readFileSync(USERS_FILE));
}
function saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

router.post("/register", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Fehlende Daten" });
    const users = loadUsers();
    if (users.find(u => u.username === username)) return res.status(400).json({ message: "Benutzer existiert bereits" });

    const hashed = bcrypt.hashSync(password, 10);
    users.push({ username, password: hashed });
    saveUsers(users);
    res.json({ message: "Registrierung erfolgreich" });
});

router.post("/login", (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ message: "Fehlende Daten" });
    const users = loadUsers();
    const user = users.find(u => u.username === username);
    if (!user || !bcrypt.compareSync(password, user.password)) return res.status(400).json({ message: "Falsche Login-Daten" });
    res.json({ message: "Login erfolgreich" });
});

// Passwort ändern
router.post("/change-password", (req, res) => {
    const { username, oldPassword, newPassword } = req.body;
    if (!username || !oldPassword || !newPassword) return res.status(400).json({ message: "Fehlende Daten" });
    const users = loadUsers();
    const idx = users.findIndex(u => u.username === username);
    if (idx === -1) return res.status(404).json({ message: "Benutzer nicht gefunden" });
    if (!bcrypt.compareSync(oldPassword, users[idx].password)) return res.status(400).json({ message: "Altes Passwort ist falsch" });

    users[idx].password = bcrypt.hashSync(newPassword, 10);
    saveUsers(users);
    res.json({ message: "Passwort geändert" });
});

module.exports = router;
