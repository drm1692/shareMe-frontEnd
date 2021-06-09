const dropzone = document.querySelector(".drop-zone")
const fileInput = document.querySelector("#fileInput")
const browseBtn = document.querySelector(".browseBtn")
const bgProgress = document.querySelector(".bg-progress")
const percentDiv = document.querySelector("#percent")
const ProgressBar = document.querySelector(".progress-bar")
const ProgressContainer = document.querySelector(".progress-container")
const fileUrlInput = document.querySelector("#fileUrl")
const sharingContainer = document.querySelector(".sharing-container")
const copyBtn = document.querySelector("#copyBtn")
const emailForm = document.querySelector("#emailForm")

const baseURL = "https://shareme-project.herokuapp.com"
const uploadUrl = `${baseURL}/api/files`;
const emailUrl = `${baseURL}/api/files/send`;

const toast = document.querySelector(".toast")
const maxAllowedSize = 100 * 1024 * 1024 //10 Mb

dropzone.addEventListener("dragover", (e)=>{

    e .preventDefault();
    if(!dropzone.classList.contains("dragged")){

        dropzone.classList.add("dragged"); 

    }
})

dropzone.addEventListener("dragleave", (e)=>    {

    dropzone.classList.remove("dragged")
})
dropzone.addEventListener("drop", (e)=>{

    dropzone.classList.remove("dragged")
    e.preventDefault()
    const files = e.dataTransfer.files
    if(files.length){

        fileInput.files = files
        uploadFile()
    }
    
})

fileInput.addEventListener("change", () => {

    uploadFile()
})

browseBtn.addEventListener("click",()=>{

     fileInput.click()
})

copyBtn.addEventListener("click", () => {

    fileUrlInput.select()
    document.execCommand("copy")
    showToast("link copied")
})

const uploadFile = ()=>{

    if(fileInput.files.length > 1){
        resetFileInput()
        showToast("You can nly upload 1 file at a time")
        return
    }

    const file = fileInput.files[0]
    if(file.size > maxAllowedSize){
        resetFileInput()
        showToast("can't upload more than 100 Mb file")
        return
    }

    ProgressContainer.style.display = "block"

    const formData = new FormData()
    formData.append("myfile", file)
    
    const xhr = new XMLHttpRequest()
    xhr.onreadystatechange = () => {

        if(xhr.readyState === XMLHttpRequest.DONE){

            console.log(xhr.response);
            onUploadSuccess(JSON.parse(xhr.response))
        }
    }
    xhr.upload.onprogress = updateProgress
    xhr.upload.onerror = () => {

        resetFileInput()
        showToast(`Error in upload: ${xhr.statusText}`)
    }

    xhr.open("POST",uploadUrl)
    xhr.send(formData)
}

const updateProgress = (e) => {
    const percent = Math.round((e.loaded / e.total) * 100)
    //  console.log(e)
    bgProgress.style.width = `${percent}%`
    percentDiv.innerText = percentDiv
    ProgressBar.style.transform = `scaleX(${percent/100})`

}

const onUploadSuccess = ({file: url}) => {

    console.log(file);
    resetFileInput()
    emailFrom[2].removeAttribute("disabled")
    ProgressContainer.style.display = "none"
    fileUrlInput.value = url
    sharingContainer.style.display = "block"
}
emailForm.addEventListener("submit", (e) => {

    e.preventDefault();
    const url = (fileUrlInput.value)
    
    const formData = {
        uuid: url.split("/").splice(-1,1)[0],
        emailTo: emailForm.elements["to-email"].value,
        emailFrom: emailForm.elements["from-email"].value,
    }

    emailFrom[2].setAttribute("disabled","true")
     fetch(emailUrl,{

        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
     })
     .then((res) => res.json())
     .then(({ success }) => {

        if(success){

            sharingContainer.style.display = "none"
            showToast("Email sent")
        }
     })
})

const resetFileInput = () => {

    fileInput.value = ""
}

let toastTimer
const showToast = (msg) => {

    toast.innerText = msg;
    toast.style.transform = "translate(-50%,0)"

    clearTimeout(toastTimer)
    toastTimer = setTimeout(() => {
        toast.style.transform = "translate(-50%,60px)"
    }, 2000);
}
