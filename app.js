let currentUser = null;

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

    if (data.message === "Login erfolgreich") {
        currentUser = username;
        authBox.classList.add("hidden");
        notesPage.classList.remove("hidden");
        loadNotes();
    }

    authMsg.innerText = data.message;
}

function logout() {
    currentUser = null;
    authBox.classList.remove("hidden");
    notesPage.classList.add("hidden");
}

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
        div.className = "note";
        div.innerHTML = `
            <p>${n.content}</p>
            <small>${new Date(n.created).toLocaleString()}</small>
        `;
        notesList.appendChild(div);
    });
}
