
let req = indexedDB.open("Camera", 1);
let db;
let gBody = document.querySelector("body");

req.addEventListener("success", function(){
    db = req.result;

})

req.addEventListener("upgradeneeded", function(){
    let accessToBD = req.result;
    accessToBD.createObjectStore("Gallery", {keyPath: "mId"});
})

req.addEventListener("error", function(){
    alert("Error in opening DB");
})

// called in script.js from index.html
function addMedia(media, type){ // media = dataUrl for image, blob for video
    if(!db) return;
    let obj = {mId: Date.now(), media, type};
    let tx = db.transaction("Gallery", "readwrite");
    let gallery = tx.objectStore("Gallery");
    gallery.add(obj);
}

// called in gallery.html
function viewMedia(){
    if(!db) return;

    let tx = db.transaction("Gallery","readonly");
    let gallery = tx.objectStore("Gallery");
    let cReq = gallery.openCursor();
    
    cReq.addEventListener("success", function(){
        let cursor = cReq.result;
        if(cursor){
            let mo = (cursor.value);

            let div = document.createElement("div");
            div.classList.add("media-container");

            let linkForDwnload = "";
            if(mo.type == "video"){
                
                let url = window.URL.createObjectURL(cursor.value.media);
                linkForDwnload = url;
                // render a video tag
                div.innerHTML = `<div class="media">
                    <video src="${url}" autoplay loop controls muted></video>
                    </div>
                    <button class="download">Download</button>
                    <button class="delete" data-id="${mo.mId}">Delete</button>` ;
            }else{
                linkForDwnload = cursor.value.media;
                // render an image tag
                div.innerHTML = `<div class="media">
                    <img src="${cursor.value.media }" />
                    </div>
                    <button class="download">Download</button>
                    <button class="delete" data-id="${mo.mId}">Delete</button>` ;
            }

            let dwnldBtn = div.querySelector(".download");
            dwnldBtn.addEventListener("click", function(){
                let a = document.createElement("a");
                a.href = linkForDwnload;

                if(mo.type == "video") 
                    a.download = "video.mp4";
                else 
                    a.download = "image.png";
                a.click();
                a.remove(); 
            }) 
            
            let deleteBtn  = div.querySelector(".delete");
            deleteBtn.addEventListener("click", function(e){
                // removing from DB
                let id = e.currentTarget.getAttribute("data-id");
                deleteMedia(id);
                // removing whole container from UI
                e.currentTarget.parentElement.remove();
            })
            gBody.append(div);
            cursor.continue();
        }
    })
}

function deleteMedia(id){

    if(!db) return;

    let tx = db.transaction("Gallery", "readwrite");
    let gallery = tx.objectStore("Gallery");
    
    gallery.delete(Number(id)); // the id should be in the number form
}