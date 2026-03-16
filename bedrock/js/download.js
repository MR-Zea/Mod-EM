let currentAddon=null
let selectedRating=0

fetch("addons.json")
.then(r => r.json())
.then(data => {

  // Ambil nama addon dari URL ?name=
  const params = new URLSearchParams(window.location.search)
  const addonName = params.get("name")
  if(!addonName){
    document.body.innerHTML = "Addon tidak ditemukan"
    return
  }

  // Cari addon berdasarkan name
  currentAddon = data.find(a => a.name === addonName)

  if(!currentAddon){
    document.body.innerHTML = "Addon tidak ditemukan"
    return
  }

  // Tampilkan info addon
  document.getElementById("addonName").innerText = currentAddon.name
  // Tampilkan deskripsi lengkap
  document.getElementById("addonDesc").innerText = currentAddon.fullDescription
  document.getElementById("addonScreenshot").src = currentAddon.screenshot
  document.getElementById("addonLogo").src = currentAddon.logo
  document.getElementById("downloadBtn").href = currentAddon.file
  document.getElementById("addonRating").innerText = currentAddon.rating
  
let rating = parseFloat(currentAddon.rating) || 0

let fullStars = Math.floor(rating)
let halfStar = rating % 1 >= 0.5

let starsHTML = ""

// bintang penuh
for(let i=0;i<fullStars;i++){
starsHTML += '<img src="assets/star_full.png" class="star">'
}

// setengah bintang
if(halfStar){
starsHTML += '<img src="assets/star_half.png" class="star">'
}

// sisa bintang kosong
let emptyStars = 5 - fullStars - (halfStar ? 1 : 0)

for(let i=0;i<emptyStars;i++){
starsHTML += '<img src="assets/star_empty.png" class="star">'
}

document.getElementById("addonRating").innerHTML = starsHTML + " ("+rating+"/5)"

  // Load review & rating
  loadReviews()

})


function goBack(){
window.location.href = "https://mod-em.vercel.app/bedrock/bedrock.html";
}
