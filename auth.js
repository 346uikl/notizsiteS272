const express = require("express");
const fs = require("fs");
const bcrypt = require("bcrypt");
const router = express.Router();

const USERS_FILE = "users.json";

if (!fs.existsSync(USERS_FILE)) {
  fs.writeFileSync(USERS_FILE, JSON.stringify([]));
}

function loadUsers() {
  return JSON.parse(fs.readFileSync(USERS_FILE));
}
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

// Register
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

// Login
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Fehlende Daten" });
  const users = loadUsers();
  const user = users.find(u => u.username === username);
  if (!user || !bcrypt.compareSync(password, user.password)) return res.status(400).json({ message: "Falsche Login-Daten" });
  res.json({ message: "Login erfolgreich" });
});

// Change password
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

// Delete account (löscht Benutzer + alle Notizen des Benutzers)
router.post("/delete-account", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: "Fehlende Daten" });

  const users = loadUsers();
  const user = users.find(u => u.username === username);
  if (!user) return res.status(404).json({ message: "Benutzer existiert nicht" });
  if (!bcrypt.compareSync(password, user.password)) return res.status(400).json({ message: "Passwort falsch" });

  // user entfernen
  const newUsers = users.filter(u => u.username !== username);
  saveUsers(newUsers);

  // notizen entfernen
  try {
    if (fs.existsSync("notes.json")) {
      const notes = JSON.parse(fs.readFileSync("notes.json"));
      const filtered = notes.filter(n => n.username !== username);
      fs.writeFileSync("notes.json", JSON.stringify(filtered, null, 2));
    }
  } catch (err) {
    console.error("Fehler beim Löschen der Notizen:", err);
  }

  res.json({ message: "Account wurde gelöscht" });
});

module.exports = router;
