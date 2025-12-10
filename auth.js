const fs = require("fs");
const bcrypt = require("bcrypt");

const USERS_FILE = "./backend/db/users.json";

function loadUsers() {
    if (!fs.existsSync(USERS_FILE)) fs.writeFileSync(USERS_FILE, "{}");
    return JSON.parse(fs.readFileSync(USERS_FILE));
}

function saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

module.exports = {
    register(username, password) {
        const users = loadUsers();
        if (users[username]) return { ok: false, msg: "Benutzer existiert bereits." };

        const hash = bcrypt.hashSync(password, 12);

        users[username] = {
            password: hash,
            lastActive: Date.now()
        };

        saveUsers(users);
        return { ok: true };
    },

    login(username, password) {
        const users = loadUsers();
        if (!users[username]) return { ok: false, msg: "User existiert nicht." };

        if (!bcrypt.compareSync(password, users[username].password))
            return { ok: false, msg: "Falsches Passwort." };

        users[username].lastActive = Date.now();
        saveUsers(users);

        return { ok: true };
    },

    getUsers() {
        return loadUsers();
    },

    saveUsers
};