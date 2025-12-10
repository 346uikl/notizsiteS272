// app.js - Crystal Ice (Glasmorphismus)
// Globals
let currentUser = localStorage.getItem("user") || null;
let notes = [];
let editingNoteId = null;

const userDisplay = document.getElementById("userDisplay");
const notesGrid = document.getElementById("notesGrid");
const editorModal = document.getElementById("editorModal");
const noteEditor = document.getElementById("noteEditor");
const noteTitle = document.getElementById("noteTitle");
const tagInput = document.getElementById("tagInput");
const colorInput = document.getElementById("colorInput");
const pinInput = document.getElementById("pinInput");
const searchInput = document.getElementById("searchInput");

const authModal = document.getElementById("authModal");
const authUser = document.getElementById("authUser");
const authPass = document.getElementById("authPass");
const authMsg = document.getElementById("authMsg");

const pwdModal = document.getElementById("pwdModal");
const deleteModal = document.getElementById("deleteModal");

const pwdMsg = document.getElementById("pwdMsg");
const deleteMsg = document.getElementById("deleteMsg");

// ---------- UTIL ----------
function qsel(id){ return document.getElementById(id); }
function show(el){ el.classList.remove("hidden"); }
function hide(el){ el.classList.add("hidden"); }
function escapeHtml(t){ if(!t) return ""; return t.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

// ---------- AUTH ----------
async function register(){
  const username = authUser.value && authUser.value.trim();
  const password = authPass.value && authPass.value.trim();
  if(!username || !password){ authMsg.innerText = "Bitte Benutzername & Passwort"; return; }

  const res = await fetch("/auth/register", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  authMsg.innerText = data.message || "Fehler";
  if(data.message === "Registrierung erfolgreich"){
    // direkt einloggen
    await login();
  }
}

async function login(){
  const username = authUser.value && authUser.value.trim();
  const password = authPass.value && authPass.value.trim();
  if(!username || !password){ authMsg.innerText = "Bitte ausfüllen"; return; }

  const res = await fetch("/auth/login", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ username, password })
  });
  const data = await res.json();
  authMsg.innerText = data.message || "Fehler";
  if(data.message === "Login erfolgreich"){
    currentUser = username;
    localStorage.setItem("user", username); // angemeldet bleiben
    hide(authModal);
    authUser.value = ""; authPass.value = "";
    userDisplay.innerText = currentUser;
    await loadNotes();
  }
}

function logout(){
  localStorage.removeItem("user");
  currentUser = null;
  location.reload();
}

// ---------- NOTES ----------
async function loadNotes(){
  if(!currentUser) return;
  const res = await fetch("/notes/list", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ username: currentUser })
  });
  notes = await res.json();
  renderFiltered();
}

function renderFiltered(){
  const q = (searchInput.value || "").trim().toLowerCase();
  notesGrid.innerHTML = "";
  let toRender = notes.slice();

  if(q){
    toRender = toRender.filter(n =>
      (n.content || "").toLowerCase().includes(q) ||
      (n.tags || []).join(",").toLowerCase().includes(q)
    );
  }

  if(!toRender.length){
    notesGrid.innerHTML = `<div class="empty glass">Keine Notizen</div>`;
    return;
  }

  toRender.forEach(n => {
    const card = document.createElement("div");
    card.className = "note-card glass";
    card.style.background = n.color || "rgba(255,255,255,0.6)";

    card.innerHTML = `
      <div class="note-body">
        <div class="note-title">${n.title ? `<strong>${escapeHtml(n.title)}</strong>` : ""}</div>
        <div class="note-text">${escapeHtml(n.content)}</div>
      </div>
      <div class="note-meta">
        <div class="tags">${(n.tags||[]).map(t => `<span class="tag-chip" onclick="searchTag('${escapeHtml(t)}')">${escapeHtml(t)}</span>`).join(" ")}</div>
        <div class="meta-right">
          <small>${new Date(n.created).toLocaleString()}</small>
          ${n.edited ? `<small> • bearbeitet</small>` : ""}
        </div>
      </div>
      <div class="card-actions">
        <button class="icon" onclick='openEditor(${n.id})' title="Bearbeiten">✎</button>
        <button class="icon" onclick='confirmDelete(${n.id})' title="Löschen">🗑</button>
        <button class="icon" onclick='togglePin(${n.id})' title="Pinnen">${n.pinned ? "📌" : "📍"}</button>
      </div>
    `;
    notesGrid.appendChild(card);
  });
}

function searchTag(t){
  searchInput.value = t;
  renderFiltered();
}

async function saveFromEditor(){
  const content = noteEditor.value && noteEditor.value.trim();
  const title = noteTitle.value && noteTitle.value.trim();
  const tags = (tagInput.value || "").split(",").map(x=>x.trim()).filter(Boolean);
  const color = colorInput.value || "#e6f0ff";
  const pinned = !!pinInput.checked;

  if(!content){ alert("Notiz ist leer"); return; }

  if(editingNoteId){
    await fetch("/notes/edit", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ id: editingNoteId, username: currentUser, content, tags, color, pinned, title })
    });
  } else {
    await fetch("/notes/add", {
      method:"POST", headers:{"Content-Type":"application/json"},
      body: JSON.stringify({ username: currentUser, content, tags, color, pinned, title })
    });
  }

  closeEditor();
  await loadNotes();
}

function openEditor(id){
  editingNoteId = null;
  noteEditor.value = "";
  noteTitle.value = "";
  tagInput.value = "";
  colorInput.value = "#e6f0ff";
  pinInput.checked = false;

  if(typeof id === "number"){
    const n = notes.find(x => x.id === id);
    if(!n) return;
    editingNoteId = id;
    noteEditor.value = n.content;
    noteTitle.value = n.title || "";
    tagInput.value = (n.tags || []).join(",");
    colorInput.value = n.color || "#e6f0ff";
    pinInput.checked = !!n.pinned;
  }
  show(editorModal);
  setTimeout(()=> editorModal.classList.add("open"), 10);
}
function closeEditor(){
  editorModal.classList.remove("open");
  setTimeout(()=> hide(editorModal), 180);
  editingNoteId = null;
}

function confirmDelete(id){
  if(!confirm("Willst du diese Notiz wirklich löschen?")) return;
  deleteNote(id);
}

async function deleteNote(id){
  await fetch("/notes/delete", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ id, username: currentUser })
  });
  await loadNotes();
}

async function togglePin(id){
  const n = notes.find(x => x.id === id);
  if(!n) return;
  await fetch("/notes/edit", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ id, username: currentUser, pinned: !n.pinned })
  });
  await loadNotes();
}

// ---------- Password change ----------
function showChangePassword(){ show(pwdModal); }
function hideChangePassword(){ hide(pwdModal); pwdMsg.innerText = ""; }

async function changePassword(){
  const oldPwd = qsel("oldPwd").value;
  const newPwd = qsel("newPwd").value;
  if(!oldPwd || !newPwd){ pwdMsg.innerText = "Bitte ausfüllen"; return; }
  const res = await fetch("/auth/change-password", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ username: currentUser, oldPassword: oldPwd, newPassword: newPwd })
  });
  const data = await res.json();
  pwdMsg.innerText = data.message || "Fehler";
  if(data.message === "Passwort geändert"){ setTimeout(hideChangePassword, 900); }
}

// ---------- Account delete ----------
function openDeleteAccount(){ show(deleteModal); }
function closeDeleteAccount(){ hide(deleteModal); deleteMsg.innerText = ""; }

async function deleteAccount(){
  const pwd = qsel("deletePwd").value;
  if(!pwd){ deleteMsg.innerText = "Bitte Passwort eingeben"; return; }
  const res = await fetch("/auth/delete-account", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ username: currentUser, password: pwd })
  });
  const data = await res.json();
  deleteMsg.innerText = data.message || "Fehler";
  if(data.message === "Account wurde gelöscht"){
    localStorage.removeItem("user");
    setTimeout(()=> location.reload(), 1200);
  }
}

// ---------- Theme (Crystal Ice) ----------
function toggleTheme(){
  const t = document.documentElement.getAttribute("data-theme");
  if(t === "dark"){ document.documentElement.removeAttribute("data-theme"); localStorage.removeItem("theme"); }
  else { document.documentElement.setAttribute("data-theme","dark"); localStorage.setItem("theme","dark"); }
}
(function applyTheme(){ if(localStorage.getItem("theme")==="dark") document.documentElement.setAttribute("data-theme","dark"); })();

// ---------- Init ----------
async function init(){
  if(currentUser){
    userDisplay.innerText = currentUser;
    await loadNotes();
  } else {
    // show auth modal
    show(authModal);
  }

  // bind some global keys: ESC closes modals
  window.addEventListener("keydown", e => {
    if(e.key === "Escape"){
      hide(editorModal); hide(pwdModal); hide(deleteModal); hide(authModal);
    }
  });
}
init();
