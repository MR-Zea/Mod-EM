/* FIREBASE */

const firebaseConfig = {

apiKey:"AIzaSyAWjM6SpLP7jwzNxWauXvW6PnqQe7jHXwI",
authDomain:"mod-em.firebaseapp.com",
projectId:"mod-em",
storageBucket:"mod-em.firebasestorage.app",
messagingSenderId:"1008975533709",
appId:"1:1008975533709:web:9a68d6ca1886fbb7bbf4c4"

}

firebase.initializeApp(firebaseConfig)

const db = firebase.firestore()
const storage = firebase.storage()

/* LOGIN SYSTEM */

firebase.auth().onAuthStateChanged(user=>{

let profile=document.getElementById("profile")

if(!profile) return

if(user){

profile.innerHTML=

`

<img src="assets/avatar.png" class="avatar">

<p>${user.email}</p>

<a href="upload.html">
<button>Upload</button>
</a>

<button onclick="logout()">Logout</button>

`

}else{

profile.innerHTML=

`

<input id="email" placeholder="email">

<input id="password" type="password">

<button onclick="login()">Login</button>

<button onclick="register()">Register</button>

`

}

})

function login(){

let email=document.getElementById("email").value
let pass=document.getElementById("password").value

firebase.auth().signInWithEmailAndPassword(email,pass)

}

function register(){

let email=document.getElementById("email").value
let pass=document.getElementById("password").value

firebase.auth().createUserWithEmailAndPassword(email,pass)

}

function logout(){

firebase.auth().signOut()

}

/* UPLOAD MOD */

async function uploadMod(){

const user=firebase.auth().currentUser

if(!user){
alert("Login dulu")
return
}

let name=document.getElementById("modName").value
let platform=document.getElementById("platform").value
let category=document.getElementById("category").value

let logo=document.getElementById("logo").files[0]
let file=document.getElementById("file").files[0]

let logoRef=storage.ref("logos/"+Date.now()+logo.name)

await logoRef.put(logo)

let logoURL=await logoRef.getDownloadURL()

let fileRef=storage.ref("mods/"+Date.now()+file.name)

await fileRef.put(file)

let fileURL=await fileRef.getDownloadURL()

await db.collection("mods").add({

name:name,
platform:platform,
category:category,
logo:logoURL,
file:fileURL,
downloads:0,
rating:0,
ratingCount:0,
uploader:user.email,
date:Date.now()

})

alert("Mod berhasil diupload!")

}

/* LOAD MODS */

async function loadMods(platform){

let snapshot=await db.collection("mods")
.where("platform","==",platform)
.get()

let container=document.getElementById("mods")

if(!container) return

container.innerHTML=""

snapshot.forEach(doc=>{

let mod=doc.data()

container.innerHTML+=`

<div class="mod-card">

<img src="${mod.logo}">

<h3>${mod.name}</h3>

<p>${mod.category}</p>

<a href="${mod.file}" target="_blank">
<button onclick="downloadMod('${doc.id}')">Download</button>
</a>

<p>⬇ ${mod.downloads}</p>

</div>

`

})

}

/* DOWNLOAD COUNTER */

async function downloadMod(id){

await db.collection("mods").doc(id).update({

downloads:firebase.firestore.FieldValue.increment(1)

})

}

/* SEARCH */

async function searchMods(){

let text=document.getElementById("search").value.toLowerCase()

let snapshot=await db.collection("mods").get()

let container=document.getElementById("mods")

container.innerHTML=""

snapshot.forEach(doc=>{

let mod=doc.data()

if(mod.name.toLowerCase().includes(text)){

container.innerHTML+=`

<div class="mod-card">

<img src="${mod.logo}">

<h3>${mod.name}</h3>

</div>

`

}

})

}

/* DARK MODE */

let toggle=document.getElementById("themeToggle")

if(toggle){

toggle.onclick=()=>{

if(document.body.classList.contains("dark")){

document.body.classList.remove("dark")

}else{

document.body.classList.add("dark")

}

}

}