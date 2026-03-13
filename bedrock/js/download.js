let currentAddon=null
let selectedRating=0
const ADMIN_PASSWORD = "mieayam"
let deleteTarget = null
let deleteType = null
let downloadFile = ""
let captchaAnswer = 0

const params=new URLSearchParams(window.location.search)
const addonFolder=params.get("addon")

fetch("addons.json")
.then(r=>r.json())
.then(data=>{

currentAddon=data.find(a=>a.folder===addonFolder)

if(!currentAddon){
document.body.innerHTML="Addon tidak ditemukan"
return
}

document.getElementById("addonName").innerText=currentAddon.name
document.getElementById("addonDesc").innerText=currentAddon.description
document.getElementById("addonScreenshot").src=currentAddon.screenshot
document.getElementById("addonLogo").src=currentAddon.logo
document.getElementById("downloadBtn").href=currentAddon.file

loadReviews()

})

function selectRating(r){

selectedRating=r

document.querySelectorAll(".star").forEach((s,i)=>{

s.classList.toggle("active",i<r)

})

}

function submitReview(){

let name=document.getElementById("reviewName").value.trim()
let text=document.getElementById("reviewText").value.trim()
let avatarInput=document.getElementById("reviewAvatar")

if(!name){
alert("Name required")
return
}

if(selectedRating===0){
alert("Select rating")
return
}

if(!text){
alert("Review message required")
return
}

let key=currentAddon.folder+"_reviews"

let reviews=JSON.parse(localStorage.getItem(key)||"[]")

function saveReview(avatar){

reviews.push({
name:name,
rating:selectedRating,
text:text,
avatar:avatar,
time:Date.now(),
replies:[]
})

localStorage.setItem(key,JSON.stringify(reviews))

document.getElementById("reviewName").value=""
document.getElementById("reviewText").value=""
document.getElementById("reviewAvatar").value=""

selectedRating=0

loadReviews()

}

if(avatarInput.files.length>0){

let reader=new FileReader()

reader.onload=function(){
saveReview(reader.result)
}

reader.readAsDataURL(avatarInput.files[0])

}else{

saveReview(null)

}

}

function loadReviews(){

let key=currentAddon.folder+"_reviews"

let reviews=JSON.parse(localStorage.getItem(key)||"[]")

let container=document.getElementById("reviewList")

container.innerHTML=""

let total=0

reviews.forEach((r,i)=>{

total+=r.rating

let avatarHTML=""

if(r.avatar){

avatarHTML=`<img src="${r.avatar}" class="avatar">`

}else{

let letter=r.name.charAt(0).toUpperCase()

avatarHTML=`<div class="avatar-generated">${letter}</div>`

}

let div=document.createElement("div")

div.className="review"

div.innerHTML=`

<div class="review-top">

${avatarHTML}

<div>

<b>${r.name}</b>

<div>${"⭐".repeat(r.rating)}</div>

</div>

</div>

<p>${r.text}</p>

<button class="btn-plus" onclick="showReply(${i})">Reply</button>
<button onclick="deleteReview(${i})">Delete</button>

<div id="replyBox${i}" style="display:none">

<input id="replyName${i}" placeholder="Your Name">

<input id="replyAvatar${i}" type="file" accept="image/*" hidden>

<button onclick="document.getElementById('replyAvatar${i}').click()" class="avatar-btn">
Upload Avatar
</button>

<textarea id="replyText${i}" placeholder="Reply"></textarea>

<button onclick="submitReply(${i})">Send</button>

</div>

<div id="replyList${i}"></div>

`

container.appendChild(div)

if(r.replies){

r.replies.forEach((rep,j)=>{

let avatarHTML=""

if(rep.avatar){

avatarHTML=`<img src="${rep.avatar}" class="avatar">`

}else{

let letter=rep.name.charAt(0).toUpperCase()

avatarHTML=`<div class="avatar-generated">${letter}</div>`

}

let el=document.createElement("div")

el.className="reply"

el.innerHTML=`

<div class="review-top">

${avatarHTML}

<div>

<b>${rep.name}</b>

</div>

</div>

<p>${rep.text}</p>

<button onclick="deleteReply(${i},${j})">Delete</button>

`

document.getElementById("replyList"+i).appendChild(el)

})

}

})

let avg=reviews.length?(total/reviews.length).toFixed(1):0

document.getElementById("avgRating").innerText=avg
document.getElementById("ratingCount").innerText=reviews.length

}

function showReply(i){

let box=document.getElementById("replyBox"+i)

box.style.display=box.style.display==="none"?"block":"none"

}

function submitReply(i){

let name=document.getElementById("replyName"+i).value.trim()
let text=document.getElementById("replyText"+i).value.trim()
let avatarInput=document.getElementById("replyAvatar"+i)

if(!name){
alert("Name required")
return
}

if(!text){
alert("Reply message required")
return
}

let key=currentAddon.folder+"_reviews"

let reviews=JSON.parse(localStorage.getItem(key)||"[]")

function saveReply(avatar){

reviews[i].replies.push({
name:name,
text:text,
avatar:avatar,
time:Date.now()
})

localStorage.setItem(key,JSON.stringify(reviews))

loadReviews()

}

if(avatarInput.files.length>0){

let reader=new FileReader()

reader.onload=function(){
saveReply(reader.result)
}

reader.readAsDataURL(avatarInput.files[0])

}else{

saveReply(null)

}

}

function deleteReview(index){

let key=currentAddon.folder+"_reviews"

let reviews=JSON.parse(localStorage.getItem(key) || "[]")

let review=reviews[index]

if(!review) return

let timePassed = Date.now() - review.time

// jika kurang dari 10 menit
if(timePassed < 300000){

if(!confirm("Delete this review?")) return

reviews.splice(index,1)

localStorage.setItem(key,JSON.stringify(reviews))

loadReviews()

return

}

// buka form owner
deleteTarget = index
deleteType = "review"

document.getElementById("adminPopup").style.display="flex"

}



function deleteReply(reviewIndex, replyIndex){

let key=currentAddon.folder+"_reviews"

let reviews=JSON.parse(localStorage.getItem(key) || "[]")

let reply=reviews[reviewIndex].replies[replyIndex]

if(!reply) return

let timePassed = Date.now() - reply.time

// user bisa delete ≤5 menit
if(timePassed < 120000){

if(!confirm("Delete this reply?")) return

reviews[reviewIndex].replies.splice(replyIndex,1)

localStorage.setItem(key,JSON.stringify(reviews))

loadReviews()

return

}

// buka popup owner
deleteTarget = {review:reviewIndex, reply:replyIndex}
deleteType = "reply"

document.getElementById("adminPopup").style.display="flex"

}

function confirmAdminDelete(){

let pass=document.getElementById("adminPassword").value

if(pass!==ADMIN_PASSWORD){
alert("Wrong password")
return
}

let key=currentAddon.folder+"_reviews"

let reviews=JSON.parse(localStorage.getItem(key) || "[]")

if(deleteType==="review"){

reviews.splice(deleteTarget,1)

}

if(deleteType==="reply"){

reviews[deleteTarget.review].replies.splice(deleteTarget.reply,1)

}

localStorage.setItem(key,JSON.stringify(reviews))

closeAdminPopup()

loadReviews()

}

function closeAdminPopup(){

document.getElementById("adminPopup").style.display="none"

document.getElementById("adminPassword").value=""

}

function togglePassword(){

let input=document.getElementById("adminPassword")

if(input.type==="password"){
input.type="text"
}else{
input.type="password"
}

}

function openDownloadConfirm(){

document.getElementById("confirmDownload").style.display="flex"

generateCaptcha()

}

function closeConfirm(){

document.getElementById("confirmDownload").style.display="none"

}

function generateCaptcha(){

let a=Math.floor(Math.random()*10)+1
let b=Math.floor(Math.random()*10)+1

captchaAnswer=a+b

document.getElementById("captchaText").innerText=a+" + "+b+" = ?"

}
function verifyDownload(){

let user=document.getElementById("captchaInput").value

if(Number(user)===captchaAnswer){

closeConfirm()

window.open(downloadFile,"_blank")

}else{

document.getElementById("captchaResult").innerText="Wrong answer"
generateCaptcha()

}

}
function openDownloadConfirm(){

let addon = addons[currentAddon]

downloadFile = addon.file

document.getElementById("confirmDownload").style.display="flex"

generateCaptcha()

}
function goBack(){
window.history.back()
}
