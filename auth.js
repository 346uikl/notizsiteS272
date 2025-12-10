const express = require("express");
const fs = require("fs");
const bcrypt = require("bcrypt");
const router = express.Router();

const USERS_FILE = "users.json";

// Datei erstellen, falls nicht vorhanden
if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify([]));
}

// Benutzer laden
function loadUsers() {
    return JSON.parse(fs.readFileSync(USERS_FILE));
}

// Benutzer speichern
function saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Registrierung
router.post("/register", (req, res) => {
    const { username, password } = req.body;
    const users = loadUsers();

    if (users.find(u => u.username === username)) {
        return res.status(400).json({ message: "Benutzer existiert bereits" });
    }

    const hashed = bcrypt.hashSync(password, 10);

    users.push({ username, password: hashed });
    saveUsers(users);

    res.json({ message: "Registrierung erfolgreich" });
});

// Login
router.post("/login", (req, res) => {
    const { username, password } = req.body;
    const users = loadUsers();

    const user = users.find(u => u.username === username);

    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.status(400).json({ message: "Falsche Login-Daten" });
    }

    res.json({ message: "Login erfolgreich" });
});

module.exports = router;
