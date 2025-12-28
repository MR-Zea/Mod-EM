// ==========================
// script.js - final cleaned version
// ==========================
let db;
const DB_NAME = 'CurseLiteDB';

// DOM elements
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const uploadBtn = document.getElementById('uploadBtn');
const deleteAllBtn = document.getElementById('deleteAllBtn');
const loginModal = document.getElementById('loginModal');
const uploadModal = document.getElementById('uploadModal');
const closeModal = document.querySelectorAll('.close');
const submitLogin = document.getElementById('submitLogin');
const adminPassInput = document.getElementById('adminPass');
const togglePassBtn = document.getElementById('togglePass');

const uploadForm = document.getElementById('uploadForm');
const modLogoInput = document.getElementById('modLogo');
const logoPreview = document.getElementById('logoPreview');
const modScreenshotInput = document.getElementById('modScreenshot');
const screenshotPreview = document.getElementById('screenshotPreview');
const modNameInput = document.getElementById('modName');
const modFileInput = document.getElementById('modFile');
const fileBtn = document.getElementById('fileBtn');
const fileName = document.getElementById('fileName');
const modDescriptionInput = document.getElementById('modDescription');
const modTypeInput = document.getElementById('modType');
const modCategoryInput = document.getElementById('modCategory');
const modVersionInput = document.getElementById('modVersion');

const modList = document.getElementById('modList');
const searchInput = document.getElementById('searchInput');
const categoryFilter = document.getElementById('categoryFilter');
const typeFilter = document.getElementById('typeFilter');

// detail modal elements
const detailModal = document.getElementById('detailModal');
const closeDetail = document.getElementById('closeDetail');
const detailName = document.getElementById('detailName');
const detailType = document.getElementById('detailType');
const detailCategory = document.getElementById('detailCategory');
const detailVersion = document.getElementById('detailVersion');
const detailDescription = document.getElementById('detailDescription');
const detailScreenshot = document.getElementById('detailScreenshot');
const confirmDownload = document.getElementById('confirmDownload');

const editModal = document.getElementById("editModal");
const closeEdit = document.getElementById("closeEdit");
const editName = document.getElementById("editName");
const editDescription = document.getElementById("editDescription");
const editType = document.getElementById("editType");
const editCategory = document.getElementById("editCategory");
const editVersion = document.getElementById("editVersion");
const editLogo = document.getElementById("editLogo");
const editScreenshot = document.getElementById("editScreenshot");
const editFile = document.getElementById("editFile");
const editLogoPreview = document.getElementById("editLogoPreview");
const editScreenshotPreview = document.getElementById("editScreenshotPreview");
const editFileBtn = document.getElementById("editFileBtn");
const editFileName = document.getElementById("editFileName");

let editingMod = null;
let isAdmin = false;
let currentMod = null;
let ADMIN_PASSWORDS = ["cilok", "Tahu", "Pro", "GGGAMING", "ZeaLoTT"];

// --------------------------
// IndexedDB init
// --------------------------
function initDB(){
  const req = indexedDB.open(DB_NAME, 1);
  req.onerror = ()=> console.error('failed to open indexeddb');
  req.onupgradeneeded = e => {
    db = e.target.result;
    if(!db.objectStoreNames.contains('mods')){
      const store = db.createObjectStore('mods', { keyPath: 'id', autoIncrement: true });
      store.createIndex('name','name',{unique:false});
      store.createIndex('category','category',{unique:false});
    }
  };
  req.onsuccess = e => {
    db = e.target.result;
    displayMods();
  };
}
initDB();

// --------------------------
// Login handlers (FINAL MULTI ADMIN)
// --------------------------

togglePassBtn.addEventListener('click', () => {  
  if(adminPassInput.type === 'password'){ 
    adminPassInput.type = 'text'; 
    togglePassBtn.textContent = 'Hide'; 
  } else { 
    adminPassInput.type = 'password'; 
    togglePassBtn.textContent = 'Show'; 
  }  
});  

loginBtn.addEventListener('click', () => loginModal.style.display = 'flex');  

submitLogin.addEventListener('click', () => {  
  if(ADMIN_PASSWORDS.includes(adminPassInput.value)){  
    isAdmin = true;  
    loginModal.style.display = 'none';  
    loginBtn.style.display = 'none';  
    logoutBtn.style.display = 'inline-block';  
    uploadBtn.style.display = 'inline-block';  
    deleteAllBtn.style.display = 'inline-block';  
    panelBtn.style.display = 'inline-block';
    adminPassInput.value = '';  
    displayMods();  
  } else {
    alert('Password salah!');
  }
});  

logoutBtn.addEventListener('click', () => {  
  isAdmin = false;  
  loginBtn.style.display = 'inline-block';  
  logoutBtn.style.display = 'none';  
  uploadBtn.style.display = 'none';  
  deleteAllBtn.style.display = 'none';  
  panelBtn.style.display = 'none';
  displayMods();  
});

// Delete all
deleteAllBtn.addEventListener('click', () => {
  if(!confirm('Apakah Anda yakin ingin menghapus semua mod?')) return;
  const tx = db.transaction('mods','readwrite');
  tx.objectStore('mods').clear();
  tx.oncomplete = ()=> displayMods();
});

// --------------------------
// Modal open/close helpers
// --------------------------
uploadBtn.addEventListener('click', ()=> uploadModal.style.display = 'flex');
closeModal.forEach(el => el.addEventListener('click', () => {
  // close the modal that this close button belongs to
  const modal = el.closest('.modal');
  if(modal) modal.style.display = 'none';
}));

// --------------------------
// File & image previews
// --------------------------
logoPreview.addEventListener('click', () => modLogoInput.click());
modLogoInput.addEventListener('change', () => {
  if(modLogoInput.files && modLogoInput.files[0]){
    const r = new FileReader();
    r.onload = e => { logoPreview.style.backgroundImage = `url(${e.target.result})`; logoPreview.textContent = ''; };
    r.readAsDataURL(modLogoInput.files[0]);
  }
});

screenshotPreview.addEventListener('click', () => modScreenshotInput.click());
modScreenshotInput.addEventListener('change', () => {
  if(modScreenshotInput.files && modScreenshotInput.files[0]){
    const r = new FileReader();
    r.onload = e => { screenshotPreview.style.backgroundImage = `url(${e.target.result})`; screenshotPreview.textContent = ''; };
    r.readAsDataURL(modScreenshotInput.files[0]);
  }
});

fileBtn.addEventListener('click', ()=> modFileInput.click());
modFileInput.addEventListener('change', ()=> {
  if(modFileInput.files && modFileInput.files[0]) fileName.textContent = modFileInput.files[0].name;
  else fileName.textContent = 'Belum ada file dipilih';
});

// --------------------------
// Upload handler (logo + screenshot + file + description)
// --------------------------
uploadForm.addEventListener('submit', e => {
  e.preventDefault();

  const modName = modNameInput.value.trim();
  const modFile = modFileInput.files[0];
  const modLogo = modLogoInput.files[0];
  const modScreenshot = modScreenshotInput.files[0];
  const type = modTypeInput.value;
  const category = modCategoryInput.value;
  const version = modVersionInput.value;
  const description = modDescriptionInput.value.trim();

  if(!modName || !modFile || !modLogo){
    return alert('Nama, file, dan logo wajib diisi!');
  }

  // Readers
  const readerLogo = new FileReader();
  const readerScreenshot = new FileReader();
  const readerFile = new FileReader();

  // chain reading: logo -> screenshot (if exists) -> file
  readerLogo.onload = () => {
    const logoData = readerLogo.result;
    const proceedWithScreenshot = () => {
      // if screenshot selected, read it, otherwise continue
      if(modScreenshot){
        readerScreenshot.onload = () => {
          const screenshotData = readerScreenshot.result;
          readerFile.onload = () => {
            const fileData = readerFile.result;
            // save into indexeddb
            const tx = db.transaction('mods','readwrite');
            const store = tx.objectStore('mods');
            store.add({
              name: modName,
              type,
              category,
              version,
              description,
              file: fileData,
              logo: logoData,
              screenshot: screenshotData || '',
              filename: modFile.name
            });
            tx.oncomplete = () => {
              uploadModal.style.display = 'none';
              uploadForm.reset();
              logoPreview.style.backgroundImage = '';
              logoPreview.textContent = 'Klik untuk pilih logo';
              screenshotPreview.style.backgroundImage = '';
              screenshotPreview.textContent = 'Klik untuk pilih screenshot';
              fileName.textContent = 'Belum ada file dipilih';
              displayMods();
            };
          };
          readerFile.readAsDataURL(modFile);
        };
        readerScreenshot.readAsDataURL(modScreenshot);
      } else {
        // no screenshot
        readerFile.onload = () => {
          const fileData = readerFile.result;
          const tx = db.transaction('mods','readwrite');
          const store = tx.objectStore('mods');
          store.add({
            name: modName,
            type,
            category,
            version,
            description,
            file: fileData,
            logo: logoData,
            screenshot: '',
            filename: modFile.name
          });
          tx.oncomplete = () => {
            uploadModal.style.display = 'none';
            uploadForm.reset();
            logoPreview.style.backgroundImage = '';
            logoPreview.textContent = 'Klik untuk pilih logo';
            screenshotPreview.style.backgroundImage = '';
            screenshotPreview.textContent = 'Klik untuk pilih screenshot';
            fileName.textContent = 'Belum ada file dipilih';
            displayMods();
          };
        };
        readerFile.readAsDataURL(modFile);
      }
    }; // proceedWithScreenshot
    proceedWithScreenshot();
  }; // readerLogo.onload

  // start by reading logo
  readerLogo.readAsDataURL(modLogo);
});

// --------------------------
// Search & filter listeners
// --------------------------
searchInput.addEventListener('input', displayMods);
categoryFilter.addEventListener('change', displayMods);
typeFilter.addEventListener('change', displayMods);

// --------------------------
// Display mods
// --------------------------
function displayMods(){
  if(!db) return;
  modList.innerHTML = '';
  const filterText = (searchInput.value || '').toLowerCase();
  const filterCategory = categoryFilter.value || 'All';
  const filterType = typeFilter.value || ' All';

  const tx = db.transaction('mods','readonly');
  const store = tx.objectStore('mods');
  // iterate with cursor to preserve id
  store.openCursor().onsuccess = e => {
    const cursor = e.target.result;
    if(cursor){
      const mod = cursor.value;
      if(filterText && !mod.name.toLowerCase().includes(filterText)){ cursor.continue(); return; }
      if(filterCategory !== 'All' && mod.category !== filterCategory){ cursor.continue(); return; }
      if(filterType !== 'All' && mod.type !== filterType){ cursor.continue(); return; }

      const card = document.createElement('div');
      const layouts = ['core'];
      const layout = layouts[Math.floor(Math.random()*layouts.length)];
      card.classList.add('modCard',);

      if(layout === 'core'){
        card.innerHTML = `<img src="${mod.logo}" alt="Logo"><div>
          <h3>${escapeHtml(mod.name)}</h3>
          <p>Type: ${escapeHtml(mod.type)}</p>
          <p>Category: ${escapeHtml(mod.category)}</p>
          <p>Version: ${escapeHtml(mod.version)}</p>
          <button onclick="downloadMod(${mod.id})">Download</button>
          ${isAdmin?`<button onclick="editMod(${mod.id})">Edit</button> <button onclick="deleteMod(${mod.id})">Delete</button>`:''}
        </div>`;
      }
      modList.appendChild(card);
      cursor.continue();
    }
  };
}

// --------------------------
// Download / detail modal
// --------------------------
function downloadMod(id){
  const tx = db.transaction('mods','readonly');
  const store = tx.objectStore('mods');
  const req = store.get(id);
  req.onsuccess = () => {
    const mod = req.result;
    if(!mod) return alert('Mod tidak ditemukan');
    currentMod = mod;
    detailName.textContent = mod.name;
    detailType.textContent = mod.type;
    detailCategory.textContent = mod.category;
    detailVersion.textContent = mod.version;
    detailDescription.textContent = mod.description || 'Deskripsi belum diisi';
    if(mod.screenshot){
      detailScreenshot.src = mod.screenshot;
      detailScreenshot.style.display = 'block';
    } else {
      detailScreenshot.style.display = 'none';
      detailScreenshot.src = '';
    }
    detailModal.style.display = 'flex';
  };
}

confirmDownload.addEventListener('click', () => {
  if(!currentMod) return;
  const a = document.createElement('a');
  a.href = currentMod.file;
  a.download = currentMod.filename || 'download';
  a.click();
  detailModal.style.display = 'none';
  currentMod = null;
});

closeDetail.addEventListener('click', ()=> { detailModal.style.display = 'none'; currentMod = null; });

// --------------------------
// Delete single
// --------------------------
function deleteMod(id){
  if(!confirm('Hapus mod ini?')) return;
  const tx = db.transaction('mods','readwrite');
  tx.objectStore('mods').delete(id);
  tx.oncomplete = () => displayMods();
}

// --------------------------
// Utilities
// --------------------------
function escapeHtml(str){
  if(!str) return '';
  return String(str).replace(/[&<>"'`=\/]/g, s => {
    return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;','/':'&#x2F;','`':'&#x60;','=':'&#x3D;'}[s];
  });
}

function editMod(id){
  const tx = db.transaction("mods", "readonly");
  const store = tx.objectStore("mods");
  const req = store.get(id);
  req.onsuccess = () => {
    editingMod = req.result;
    editName.value = editingMod.name;
    editDescription.value = editingMod.description;
    editType.value = editingMod.type;
    editCategory.value = editingMod.category;
    editVersion.value = editingMod.version;

    editLogoPreview.style.backgroundImage = `url(${editingMod.logo})`;
    editScreenshotPreview.style.backgroundImage = editingMod.screenshot ? `url(${editingMod.screenshot})` : "";
    editFileName.textContent = editingMod.filename;

    editModal.style.display = "flex";
  };
}

closeEdit.addEventListener("click", () => editModal.style.display = "none");

editLogoPreview.addEventListener("click", () => editLogo.click());
editScreenshotPreview.addEventListener("click", () => editScreenshot.click());
editFileBtn.addEventListener("click", () => editFile.click());

editLogo.addEventListener("change", () => {
  const r = new FileReader();
  r.onload = e => editLogoPreview.style.backgroundImage = `url(${e.target.result})`;
  r.readAsDataURL(editLogo.files[0]);
});

editScreenshot.addEventListener("change", () => {
  const r = new FileReader();
  r.onload = e => editScreenshotPreview.style.backgroundImage = `url(${e.target.result})`;
  r.readAsDataURL(editScreenshot.files[0]);
});

editFile.addEventListener("change", () => {
  editFileName.textContent = editFile.files.length ? editFile.files[0].name : editingMod.filename;
});

document.getElementById("editForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!editingMod) return;

  const name = editName.value.trim();
  const description = editDescription.value.trim();
  const type = editType.value;
  const category = editCategory.value;
  const version = editVersion.value;

  let newLogo = editingMod.logo;
  let newScreenshot = editingMod.screenshot;
  let newFile = editingMod.file;
  let newFilename = editingMod.filename;

  // Update Logo jika diganti
  if (editLogo.files.length > 0) {
    const r = new FileReader();
    newLogo = await new Promise(res => {
      r.onload = e => res(e.target.result);
      r.readAsDataURL(editLogo.files[0]);
    });
  }

  // Update Screenshot jika diganti
  if (editScreenshot.files.length > 0) {
    const r = new FileReader();
    newScreenshot = await new Promise(res => {
      r.onload = e => res(e.target.result);
      r.readAsDataURL(editScreenshot.files[0]);
    });
  }

  // Update File jika diganti
  if (editFile.files.length > 0) {
    const r = new FileReader();
    newFile = await new Promise(res => {
      r.onload = e => res(e.target.result);
      r.readAsDataURL(editFile.files[0]);
    });
    newFilename = editFile.files[0].name;
  }

  const tx = db.transaction("mods", "readwrite");
  const store = tx.objectStore("mods");

  store.put({
    id: editingMod.id,
    name,
    description,
    type,
    category,
    version,
    logo: newLogo,
    screenshot: newScreenshot,
    file: newFile,
    filename: newFilename
  });

  tx.oncomplete = () => {
    editModal.style.display = "none";
    editingMod = null;
    displayMods();
  };
});

// ==========================
// Tutup modal bila klik luar
// ==========================
window.addEventListener("click", (e) => {
  document.querySelectorAll(".modal").forEach(modal => {
    if (e.target === modal) modal.style.display = "none";
  });
});

// Helper Convert file → base64
function fileToDataURL(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

function showAds() {
  const data = JSON.parse(localStorage.getItem("customAdsData"));

  // Kalau belum ada data iklan → pakai default
  document.getElementById("ads-image").src = data?.image || "https://via.placeholder.com/300x150?text=Iklan";
  document.getElementById("ads-title").innerText = data?.title || "Judul Iklan";
  document.getElementById("ads-text").innerText = data?.text || "Deskripsi Iklan.";
  document.getElementById("ads-button").href = data?.link || "#";

  document.getElementById("popup-ads").style.display = "flex";
}

// Tutup
document.getElementById("close-ads").onclick = () => {
  document.getElementById("popup-ads").style.display = "none";
};

// Tampil pertama kali setelah 1 detik
setTimeout(showAds, 10000);

// Tampil ulang setiap 10 menit
setInterval(showAds, 600000);

