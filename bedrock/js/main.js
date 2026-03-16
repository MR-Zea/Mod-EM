let addons = []
let currentAddon = 0
let selectedRating = 0

fetch("addons.json")
.then(r=>r.json())
.then(data=>{
addons=data
renderAddons()
})


function renderAddons(){

let container=document.getElementById("addons")

container.innerHTML=""

addons.forEach((a,i)=>{

let card=document.createElement("div")
card.className="card"

card.innerHTML=`

      <h3>${a.name}</h3>
      <img src="${a.logo}" class="card-logo">
      <p class="card-desc">${a.description}</p>
      <img src="${a.screenshot}" class="card-screen">
      <br>
      <a href="download.html?name=${a.name}" class="btn-download">
      Open
      </a>
      <br>
      <div class="card-rating">
${generateStars(a.rating)}
</div>

`

container.appendChild(card)

})

}



function openModal(i){

currentAddon=i

let addon=addons[i]

document.getElementById("addonModal").style.display="block"

document.getElementById("modalName").innerText=addon.name
document.getElementById("modalScreenshot").src=addon.screenshot
document.getElementById("modalDescription").innerText=addon.description
document.getElementById("modalDownload").href=addon.file
document.getElementById("modalDownloads").innerText=addon.downloads || 0

loadReviews()

}


function closeModal(){
document.getElementById("addonModal").style.display="none"
}



function downloadAddon(){

let addon=addons[currentAddon]

addon.downloads=(addon.downloads||0)+1

document.getElementById("modalDownloads").innerText=addon.downloads
document.getElementById("downloads-"+currentAddon).innerText=addon.downloads

window.open(addon.file,"_blank")

}



function selectRating(r){
selectedRating=r
}



function submitReview(){

let name=document.getElementById("reviewName").value.trim()
let text=document.getElementById("reviewText").value.trim()

if(name===""){
alert("Name required")
return
}

if(selectedRating===0){
alert("Select rating")
return
}

if(text===""){
alert("Review message required")
return
}

let key=addons[currentAddon].folder+"_reviews"

let reviews=JSON.parse(localStorage.getItem(key) || "[]")

reviews.push({
name:name,
rating:selectedRating,
text:text,
replies:[]
})

localStorage.setItem(key,JSON.stringify(reviews))

document.getElementById("reviewName").value=""
document.getElementById("reviewText").value=""

selectedRating=0

loadReviews()

}



function loadReviews(){

let key=addons[currentAddon].folder+"_reviews"

let reviews=JSON.parse(localStorage.getItem(key) || "[]")

let container=document.getElementById("reviewList")

container.innerHTML=""

let total=0


reviews.forEach((r,i)=>{

total+=r.rating

let div=document.createElement("div")

div.className="review"

div.innerHTML=`

<div class="review-name">${r.name}</div>

<div class="review-stars">${"⭐".repeat(r.rating)}</div>

<div class="review-text">${r.text}</div>

<button onclick="showReply(${i})">Reply</button>

<button onclick="deleteReview(${i})">Delete</button>

<div id="replyBox${i}" style="display:none">

<input id="replyName${i}" placeholder="Name">

<textarea id="replyText${i}" placeholder="Reply"></textarea>

<button onclick="submitReply(${i})">Send</button>

</div>

<div id="replyList${i}"></div>

`

container.appendChild(div)


if(r.replies){

r.replies.forEach(rep=>{

let el=document.createElement("div")

el.className="reply"

el.innerHTML=`<b>${rep.name}</b>: ${rep.text}`

document.getElementById("replyList"+i).appendChild(el)

})

}

})


let avg=reviews.length ? (total/reviews.length).toFixed(1) : 0

document.getElementById("avgRating").innerText=avg
document.getElementById("ratingCount").innerText=reviews.length

}



function showReply(i){

let box=document.getElementById("replyBox"+i)

box.style.display = box.style.display==="none" ? "block":"none"

}



function submitReply(i){

let name=document.getElementById("replyName"+i).value.trim()
let text=document.getElementById("replyText"+i).value.trim()

if(name===""){
alert("Name required")
return
}

if(text===""){
alert("Reply message required")
return
}

let key=addons[currentAddon].folder+"_reviews"

let reviews=JSON.parse(localStorage.getItem(key) || "[]")

reviews[i].replies.push({
name:name,
text:text
})

localStorage.setItem(key,JSON.stringify(reviews))

loadReviews()

}



function deleteReview(i){

let key=addons[currentAddon].folder+"_reviews"

let reviews=JSON.parse(localStorage.getItem(key) || "[]")

reviews.splice(i,1)

localStorage.setItem(key,JSON.stringify(reviews))

loadReviews()

}

function filterAddons(){
  let category = document.getElementById("categorySelect").value
  let search = document.getElementById("searchInput").value.trim().toLowerCase()

  let container = document.getElementById("addons")
  container.innerHTML=""

  let filtered = addons

  if(category !== "all"){
    filtered = filtered.filter(a => a.category.toLowerCase() === category.toLowerCase())
  }

  if(search){
    filtered = filtered.filter(a => a.name.toLowerCase().includes(search))
  }

  filtered.forEach((a,i)=>{
    let card=document.createElement("div")
    card.className="card"

    card.innerHTML=`
     <h3>${a.name}</h3>
      <img src="${a.logo}" class="card-logo">
      <p class="card-desc">${a.description}</p>
      <img src="${a.screenshot}" class="card-screen">
      <br>
      <a href="download.html?name=${a.name}" class="btn-download">
      Open
      </a>
      <br>
      <div class="card-rating">
${generateStars(a.rating)}
</div>

    `
    container.appendChild(card)
  })
}

function generateStars(rating){

let r = parseFloat(rating) || 0

let fullStars = Math.floor(r)
let halfStar = r % 1 >= 0.5

let html = ""

for(let i=0;i<fullStars;i++){
html += '<img src="assets/star_full.png" class="star">'
}

if(halfStar){
html += '<img src="assets/star_half.png" class="star">'
}

let empty = 5 - fullStars - (halfStar ? 1 : 0)

for(let i=0;i<empty;i++){
html += '<img src="assets/star_empty.png" class="star">'
}

return html

}

setTimeout(()=>{

let modal = document.getElementById("imgModal")
let modalImg = document.getElementById("imgShow")
let closeBtn = document.getElementById("closeImg")

document.querySelectorAll("card img").forEach(img=>{

  img.style.cursor="pointer"

  img.onclick = function(){
    modal.style.display="block"
    modalImg.src = this.src
  }

})

closeBtn.onclick = function(){
  modal.style.display="none"
}

modal.onclick = function(){
  modal.style.display="none"
}

},500)
