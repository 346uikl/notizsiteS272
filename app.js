let currentUser = localStorage.getItem("user");

// Wenn angemeldet bleiben aktiv → direkt Notes laden
if (currentUser) {
    authBox.classList.add("hidden");
    notesPage.classList.remove("hidden");
    loadNotes();
}

// ---------------- LOGIN ----------------

async function register() {
    const username = authUser.value.trim();
    const password = authPass.value.trim();

    const res = await fetch("/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    authMsg.innerText = data.message;
}

async function login() {
    const username = authUser.value.trim();
    const password = authPass.value.trim();

    const res = await fetch("/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    });

    const data = await res.json();

    authMsg.innerText = data.message;

    if (data.message === "Login erfolgreich") {
        currentUser = username;

        // ⭐ AUTOMATISCH EINGELOGGT BLEIBEN
        localStorage.setItem("user", username);

        authBox.classList.add("hidden");
        notesPage.classList.remove("hidden");
        loadNotes();
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem("user");

    authBox.classList.remove("hidden");
    notesPage.classList.add("hidden");
}

// ---------------- NOTES ----------------

async function saveNote() {
    const content = noteContent.value.trim();
    if (!content) return;

    await fetch("/notes/add", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: currentUser, content })
    });

    noteContent.value = "";
    loadNotes();
}

// Lade Notizen
async function loadNotes() {
    const res = await fetch("/notes/list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: currentUser })
    });

    const notes = await res.json();

    notesList.innerHTML = "";

    notes.forEach(n => {
        const div = document.createElement("div");
        div.className = "note fadeIn";

        div.innerHTML = `
            <p>${n.content}</p>
            <small>${new Date(n.created).toLocaleString()}</small>
            <button class="deleteBtn" onclick="deleteNote(${n.id})">Löschen</button>
        `;

        notesList.appendChild(div);
    });
}


// Notiz löschen
async function deleteNote(id) {
    await fetch("/notes/delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, username: currentUser })
    });

    loadNotes();
}
