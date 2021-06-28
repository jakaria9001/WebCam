        let body = document.querySelector("body");
        let video = document.querySelector("video");
        let recordBtn = document.querySelector("#record");
        let recordDiv = recordBtn.querySelector("div");
        
        let capture = document.querySelector("#capture");
        let captureDiv = capture.querySelector("div");

        let isRecording = false;

        let mediaRecorder;
        let chunks = [];
        let minZoom = 1;
        let maxZoom = 3;
        let currrentZoom = 1;
        let zoomInBtn = document.querySelector(".zoom-in");
        let zoomOutBtn = document.querySelector(".zoom-out");
        
        let appliedFilter;
        let filters = document.querySelectorAll(".filter");
        
        let galleryBtn = document.querySelector("#gallery");

        galleryBtn.addEventListener("click", function(){
            location.assign("/other_pages/gallery.html");
        })
        zoomInBtn.addEventListener("click", function(){
            if(currrentZoom < maxZoom){
                currrentZoom = currrentZoom + 0.2;
            }
            video.style.transform = `scale(${currrentZoom})`;
        })
        
        zoomOutBtn.addEventListener("click", function(){
            if(currrentZoom > minZoom){
                currrentZoom = currrentZoom - 0.2;
            }
            video.style.transform = `scale(${currrentZoom})`;
        })
        
        
        for(let i=0;i<filters.length;i++){
            // console.log(filters[i])
           
            filters[i].addEventListener("click",(e)=>{
                removeFilter();
                // console.log("ok");
                appliedFilter = (e.currentTarget.style.backgroundColor);
                let div = document.createElement("div");
                div.style.backgroundColor = appliedFilter;
                div.classList.add("temp-filter");
                body.append(div);

            })
        }

        recordBtn.addEventListener("click", function(e){
            // start recording
            if(isRecording) {
                mediaRecorder.stop();
                isRecording = false;
                // e.currentTarget.innerText = "Start"
                recordDiv.classList.remove("record-animation");
                
                
            }
            else {
                mediaRecorder.start();
                isRecording = true;
                recordDiv.classList.add("record-animation");
                removeFilter();
                appliedFilter="";
                currrentZoom = 1;
                video.style.transform = `scale(${currrentZoom})`;
                // e.currentTarget.innerText = "Stop"
            }
        });
        
        capture.addEventListener("click",()=>{
            if(isRecording) { return; }
            captureDiv.classList.add("capture-animation");
            setTimeout(function(){
                captureDiv.classList.remove("capture-animation"); // removing to 
            },1000);

            // capture the image showing in the screen now.
            let canvas = document.createElement("canvas");
            canvas.height = video.videoHeight
            canvas.width = video.videoWidth
            let tool = canvas.getContext("2d");

            tool.translate(canvas.width/2,canvas.height/2);
            tool.scale(currrentZoom, currrentZoom);
            tool.translate(-canvas.width/2,-canvas.height/2);

            tool.drawImage(video, 0, 0);

            if(appliedFilter){
                tool.fillStyle = appliedFilter;
                tool.fillRect(0,0, canvas.width, canvas.height);
            }

            // for image we'll store the dataURL to the db
            let link = canvas.toDataURL();
            addMedia(link, "image");
            // console.log(link);
            // let a = document.createElement("a");
            // a.href = link;
            // a.download = "image.png";
            // a.click();
            // a.remove();
            canvas.remove();

        });

        navigator.mediaDevices.getUserMedia({video:true, audio:true})
        .then(function (mediaStream){

            mediaRecorder = new MediaRecorder(mediaStream);

            mediaRecorder.addEventListener("dataavailable", function(e){
                chunks.push(e.data);
            });
            mediaRecorder.addEventListener("stop", function(e){
                let blob = new Blob(chunks, {type: "video/mp4"}) // large binary file = video 
                chunks = [];
                // for video, we will store the blob in the db
                addMedia(blob, "video");
                // added an anchor to download the chunks accumulated in the blob variable.
                // let a = document.createElement("a");
                // let url = window.URL.createObjectURL(blob);
                // a.href = url;
                // a.download = 'video.mp4'
                // a.click();
                // a.remove();
            });

            video.srcObject = mediaStream;
        }).catch(function(err){
            console.log(err);
            alert("Need Permission to record!!!");
        });

function removeFilter(){
    let tFilter = document.querySelector(".temp-filter");
    if(tFilter) tFilter.remove(); 
}
    