const bookContainer = document.querySelector('.book-container');
const book = document.querySelector('.book');
const textInput = document.querySelector('.text-input');
const frontCover = document.querySelector('.front');
const sideCorver = document.querySelector('.book>.side');
const loaderPopup = document.querySelector('.loader-popup');

function loader(action) {
    if (action === 'on') {
        loaderPopup.classList.remove('hidden');
    }
    if (action === 'off') {
        loaderPopup.classList.add('hidden');
    }
}

// ROTATE //

const sliderWrap = document.querySelector('.slider-wrap');
const slider = document.querySelector('.slider-book');
let startX = 0;        
let startValue = 0;

slider.addEventListener('input', () => {
    book.style.transform = `rotateY(${slider.value}deg)`;
});

slider.addEventListener('touchstart', () => {
    book.classList.add('noTransition');
});

slider.addEventListener('touchend', () => {
    book.classList.remove('noTransition');
});

bookContainer.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    startValue = parseFloat(slider.value);
    book.classList.add('noTransition');
});

bookContainer.addEventListener('touchmove', (e) => {
    const deltaX = e.touches[0].clientX - startX;
    const sensitivity = 1; 
    let newValue = startValue + deltaX * sensitivity;
    newValue = Math.max(parseFloat(slider.min), Math.min(parseFloat(slider.max), newValue));

    slider.value = newValue;
    book.style.transform = `rotateY(${newValue}deg)`;
});

bookContainer.addEventListener('touchend', (e) => {
    book.classList.remove('noTransition');
});

// TEXT //

textInput.addEventListener('click', ()=> {
    book.style.transform = `rotateY(90deg)`;
});

textInput.addEventListener('input', ()=> {
    book.style.transform = `rotateY(90deg)`;
    sideCorver.textContent = textInput.value;
});

sideCorver.addEventListener('click', ()=> {
    book.style.transform = `rotateY(90deg)`;
    textInput.focus();
});


// IMAGE //

const popupCropper = document.querySelector('.popup-cropper');
const cropImage = document.querySelector('.crop-image');
const cropConfirm = document.querySelector('.crop-confirm');
const cropCancel = document.querySelector('.crop-cancel');
const inputImage = document.querySelector('.input-image');
const frontCoverInput = document.querySelector('.front-cover-input');
const imgEditorWrap = document.querySelector('.editor-wrap.img');
const labelImage = document.querySelector('.label-input.img');
const editImgBtn = document.querySelector('.edit-img-btn');
const removeImgBtn = document.querySelector('.remove-img-btn');

let cropper;

let lastCropBoxData = null;
let lastCanvasData = null;

inputImage.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    book.style.transform = 'rotate(0deg)';
    const reader = new FileReader();
    reader.onload = () => {
        cropImage.src = reader.result;
        popupCropper.classList.remove('hidden');

        if (cropper) cropper.destroy();

        cropper = new Cropper(cropImage, { 
            aspectRatio: 1 / 1,
            viewMode: 1,
            background: true,
            movable: true,
            zoomable: false,
            scalable: false,
            cropBoxMovable: true,
            cropBoxResizable: true,
        });

        inputImage.value = '';
    };
    reader.readAsDataURL(file);
});

cropConfirm.addEventListener('click', () => {
    const canvas = cropper.getCroppedCanvas();
    const croppedImage = canvas.toDataURL('image/png');
    frontCover.style.backgroundImage = `url(${croppedImage})`;
    frontCover.img = true;

    lastCropBoxData = cropper.getCropBoxData();
    lastCanvasData = cropper.getCanvasData();

    canvas.toBlob((blob) => {
        const file = new File([blob], "capa-frente.png", { type: "image/png" });
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(file);
        frontCoverInput.files = dataTransfer.files;
    }, 'image/png');

    labelImage.classList.add('hidden');

    popupCropper.classList.add('hidden');
    imgEditorWrap.classList.remove('hidden');
});


cropCancel.addEventListener('click', ()=> {
    popupCropper.classList.add('hidden');
});

editImgBtn.addEventListener('click', ()=> {
    book.style.transform = 'rotate(0deg)';
    popupCropper.classList.remove('hidden');
    
    if (cropper && lastCropBoxData && lastCanvasData) {
        cropper.setCropBoxData(lastCropBoxData);
        cropper.setCanvasData(lastCanvasData);
    }
});

removeImgBtn.addEventListener('click', ()=> {
    frontCover.style.backgroundImage = ``;
    frontCoverInput.value = '';
    frontCover.img = false;
    imgEditorWrap.classList.add('hidden');
    labelImage.classList.remove('hidden');
});

frontCover.addEventListener('click', ()=> {
    book.style.transform = 'rotate(0deg)';
    if (frontCover.img == true) {
        popupCropper.classList.remove('hidden');

        if (cropper && lastCropBoxData && lastCanvasData) {
            cropper.setCropBoxData(lastCropBoxData);
            cropper.setCanvasData(lastCanvasData);
        }
    }
});

// VIDEO //

const videoEditorWrap = document.querySelector('.editor-wrap.video');
const labelVideo = document.querySelector('.label-input.video');
const editVideoBtn = document.querySelector('.edit-video-btn');
const removeVideoBtn = document.querySelector('.remove-video-btn');
const videoPage = document.querySelector('.video-page');
const inputVideo = document.querySelector('.input-video');
const videoInput = document.querySelector('.video-input');
const playPauseBtn = document.querySelector('.play-pause-btn');

const videoEditorPopup = document.querySelector('.video-editor-popup');
const videoContainer = document.querySelector('.video-container>video');
const cancelEditVideo = document.querySelector('.cancel-edit');
const startVideoCrop = document.querySelector('.start-video-crop');
const playPauseEdit = document.querySelector('.play-pause-edit');
const endVideoCrop = document.querySelector('.end-video-crop');
const confirmCrop = document.querySelector('.confirm-edit');
const sliderCropper = document.querySelector('.slider-cropper');
const videoTimer = document.querySelector('.video-timer');
const timerCropper = document.querySelector('.timer-cropper');
const minPages = 30;
const maxPages = 60;
const initialCropRatio = 5;
const minCropRatio = 5;
const maxCropRatio = 30;
let videoPages;
let videoCropStart;
let videoCropEnd;
let currentCropRatio;
let cropSize;
// const aaaaaaa = document.querySelector('.aaaaa');


function updateCropper(type, start, end) {

    if (type == 'L') {
        console.log('L');
        videoCropStart = start;
        
        startVideoCrop.textContent = videoCropStart;
        videoContainer.currentTime = videoCropStart / 10;
        
        
        timerCropper.style.left = (videoCropStart * currentCropRatio) + "px";
        timerCropper.style.width = `${(videoCropEnd - videoCropStart) * currentCropRatio}px`;
        
    } else if (type == 'R') {
        console.log('R');
        videoCropEnd = end;
        endVideoCrop.textContent = videoCropEnd;
        videoContainer.currentTime = videoCropEnd / 10;
        
        timerCropper.style.width = `${(videoCropEnd - videoCropStart) * currentCropRatio}px`;
        
    } else if (type == 'M' && videoCropStart !== start && videoCropEnd !== end) {
        console.log('M');
        videoCropEnd = end === true ?
        (start - videoCropStart) + videoCropEnd : end;

        videoCropStart = start;
        startVideoCrop.textContent = videoCropStart;
        videoContainer.currentTime = videoCropStart / 10;
        
        endVideoCrop.textContent = videoCropEnd;
        
        timerCropper.style.left = (videoCropStart * currentCropRatio) + "px";
    }
}

function updateCropRatio(newCropRatio) {
    currentCropRatio = newCropRatio;
    videoTimer.style.width = `${videoPages * currentCropRatio}px`;
    sliderCropper.style.width = `${videoPages * currentCropRatio}px`;
    timerCropper.style.width = `${videoCropEnd * currentCropRatio}px`;
    videoTimer.style.setProperty("--div-w", currentCropRatio + 'px');
}

let LCstartX = 0;
let LCinitialLeft = 0;

sliderCropper.addEventListener("touchstart", (e) => {
    if (e.target.closest(".timer-cropper")) return;
    LCstartX = e.touches[0].clientX;
    LCinitialLeft = sliderCropper.offsetLeft;
});

sliderCropper.addEventListener("touchmove", (e) => {
    if (e.target.closest(".timer-cropper")) return;
    const currentX = e.touches[0].clientX;
    const deltaX = currentX - LCstartX;
    const maxLeft = sliderCropper.parentNode.offsetWidth - sliderCropper.offsetWidth; // limite direita
    const newLeft = Math.min(0, Math.max(maxLeft, LCinitialLeft + deltaX));
    sliderCropper.style.left = newLeft + "px";
});

const leftCropper = document.querySelector('.left-cropper');
const rightCropper = document.querySelector('.right-cropper');

let CropstartX;
let CropinitialValue;

[timerCropper, leftCropper, rightCropper].forEach((el, i) => {
    el.addEventListener("touchstart", (e) => {
        if (i == 0 && e.target.closest(".left-cropper, .right-cropper")) return;

        CropstartX = e.touches[0].clientX;

        // Em vez de pegar offsetLeft, pega a variável de estado
        if (i == 0) CropinitialValue = videoCropStart;
        if (i == 1) CropinitialValue = videoCropStart;
        if (i == 2) CropinitialValue = videoCropEnd;
    });

    el.addEventListener("touchmove", (e) => {
        if (i == 0 && e.target.closest(".left-cropper, .right-cropper")) return;

        const currentX = e.touches[0].clientX;
        const deltaX = currentX - CropstartX;

        let newValue = CropinitialValue + Math.round(deltaX / currentCropRatio);
        
        if (i == 0) {
            newValue = Math.min(videoPages - (videoCropEnd - videoCropStart), 
                Math.max(0, newValue));
            updateCropper('M', newValue, true);
        }
        if (i == 1) {
            newValue = Math.min( videoCropEnd - minPages, 
                Math.max(Math.max(0, videoCropEnd - maxPages), newValue));
            if(videoCropStart == newValue) return;
            updateCropper('L', newValue, videoCropEnd);
        }
        if (i == 2) {
            newValue = Math.min(
                Math.min(videoCropStart + maxPages, videoPages),
                Math.max(videoCropStart + minPages, newValue)
            );
            if(videoCropEnd == newValue) return;
            updateCropper('R', videoCropStart, newValue);
        }
    });
});

// sliderCropper.addEventListener("wheel", (e) => { 
//     e.preventDefault();

//     let newCR = currentCropRatio;

//     newCR += e.deltaY * -0.05;

//     // Restrict scale
//     newCR = Math.min(Math.max(minCropRatio, newCR), maxCropRatio);

//     // updateCropper('M', 0, cropSize);
//     updateCropRatio(newCR);
// });

const apiKey = "HXuGjdPH41ijOgJ75Ok8mZGXM49uF9NWO2KMoZG3nDl";
const videoTest = document.querySelector('.videoTest');
let videoFile;
inputVideo.addEventListener('change', (e)=> {
    videoFile = e.target.files[0];
    if (!videoFile) return;
    loader('on');
    const reader = new FileReader();
    reader.onload = async () => {
        videoContainer.src = reader.result;
        
        videoContainer.addEventListener("loadedmetadata", () => {
            videoPages = Math.floor(videoContainer.duration * 10);
            let currentPage = 0;
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            function captureFrame() {
                if (currentPage >= videoPages) {
                    cropSize = videoPages > maxPages ? maxPages : videoPages;
                    CropstartX = 0;
                    CropinitialValue = 0;
                    currentCropRatio = initialCropRatio;
                    videoEditorPopup.classList.remove('hidden');
                    updateCropper('M', 0, cropSize);
                    updateCropRatio(initialCropRatio);
                    loader('off');
                    return
                };

                videoContainer.currentTime = currentPage * 0.1;

                videoContainer.addEventListener("seeked", function handler() {
                    let w = videoContainer.videoWidth;
                    let h = videoContainer.videoHeight;

                    const maxSize = 50;
                    if (w > h) {
                        const scale = maxSize / w;
                        w = maxSize;
                        h = Math.round(h * scale);
                    } else {
                        const scale = maxSize / h;
                        h = maxSize;
                        w = Math.round(w * scale);
                    }

                    canvas.width = w;
                    canvas.height = h;

                    ctx.drawImage(videoContainer, 0, 0, w, h);

                    // cria thumb
                    const img = document.createElement("img");
                    img.src = canvas.toDataURL("image/jpeg", 0.7);
                    img.width = w;
                    img.height = h;

                    // insere no videoTimer
                    const div = document.createElement("div");
                    div.appendChild(img);
                    videoTimer.appendChild(div);

                    videoContainer.removeEventListener("seeked", handler);

                    // próximo frame
                    currentPage++;
                    captureFrame();
                });
            }
            captureFrame();
        });

        inputVideo.value = '';
    };
    reader.readAsDataURL(videoFile);
});



playPauseBtn.fnt = (action, video = undefined)=> {
    if (action == 'showPlay') {
        playPauseBtn.textContent = 'Play';
        playPauseBtn.classList.remove('hidden');
        playPauseBtn.onclick = ()=> {
            book.style.transform = 'rotateY(0deg)';
            frontCover.classList.add('open');
            playPauseBtn.classList.add('hidden');
            sliderWrap.classList.add('hidden');
            setTimeout(() => {
                video.play();
            }, 1000);
        }
        video.onended = () => {
            frontCover.classList.remove('open');
            setTimeout(() => {
                playPauseBtn.classList.remove('hidden');
                sliderWrap.classList.remove('hidden');
            }, 1000);
        };
    }
}

async function waitForVideoReady(videoId) {
    let state = "";
    while (state !== "ready") {
        await new Promise(res => setTimeout(res, 3000)); // espera 3s
        try {
            const res = await fetch(`https://ws.api.video/videos/${videoId}`, {
                headers: { "Authorization": `Bearer ${apiKey}` }
            });
            if (res.status === 404) {
                console.log("Vídeo ainda não registrado, tentando novamente...");
                continue;
            }
            const data = await res.json();
            state = data.state;
            console.log("Estado do vídeo:", state);
        } catch (err) {
            console.log("Erro ao checar estado, tentando novamente...", err);
        }
    }
}

const statusEl = document.createElement('div');

// confirmCrop.addEventListener('click', async () => {
//     if (!videoFile) return alert("Nenhum vídeo selecionado!");

//     const inicio = videoCropStart;
//     const fim = videoCropEnd;

//     statusEl.innerText = "Criando vídeo na API...";

//     try {
//         // 1. Cria vídeo
//         const createRes = await fetch("https://ws.api.video/videos", {
//             method: "POST",
//             headers: {
//                 "Authorization": `Bearer ${apiKey}`,
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify({ title: videoFile.name, public: false })
//         });
//         const videoData = await createRes.json();
//         const videoId = videoData.videoId;
//         console.log("Vídeo criado:", videoId);

//         // 2. Upload do arquivo
//         statusEl.innerText = "Enviando arquivo...";
//         const formData = new FormData();
//         formData.append("file", videoFile);
//         await fetch(`https://ws.api.video/videos/${videoId}/source`, {
//             method: "POST",
//             headers: { "Authorization": `Bearer ${apiKey}` },
//             body: formData
//         });
//         console.log("Upload finalizado");

//         // 3. Espera vídeo processar
//         statusEl.innerText = "Aguardando processamento do vídeo...";
//         await waitForVideoReady(videoId);

//         // 4. Cria clip cortado
//         statusEl.innerText = "Criando clip...";
//         const clipRes = await fetch(`https://ws.api.video/videos/${videoId}/clips`, {
//             method: "POST",
//             headers: {
//                 "Authorization": `Bearer ${apiKey}`,
//                 "Content-Type": "application/json"
//             },
//             body: JSON.stringify({ start: inicio, end: fim })
//         });
//         const clipData = await clipRes.json();
//         console.log("Clip criado:", clipData);

//         // 5. Mostra preview do clip
//         const clipUrl = clipData.assets.mp4;
//         const videobook = document.createElement('video');
//         videobook.src = clipUrl;
//         videobook.controls = true;
//         videoPage.replaceChildren(videobook);

//         statusEl.innerText = "Clip pronto e visualizado!";
//     } catch (err) {
//         console.error("Erro ao criar clip:", err);
//         statusEl.innerText = "Erro ao criar clip";
//     }
// });


async function criarVideoDeFrames(videoEl) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;

    // Cria o stream do canvas
    const stream = canvas.captureStream(30); // 30 FPS
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });

    let chunks = [];
    recorder.ondataavailable = e => chunks.push(e.data);

    const fim = new Promise(resolve => {
    recorder.onstop = () => resolve(new Blob(chunks, { type: "video/webm" }));
    });

    recorder.start();

    // Percorre os frames do vídeo
    for (let t = 0; t < videoEl.duration; t += 1/30) { // 30fps
    videoEl.currentTime = t;
    await new Promise(r => videoEl.onseeked = r);
    ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
    await new Promise(r => setTimeout(r, 1000/30));
    }

    recorder.stop();
    return fim;
}

confirmCrop.addEventListener("click", async () => {
    const inicio = videoCropStart;
    const fim = videoCropEnd;
    const video = videoContainer;

    // Garante que o vídeo está carregado
    if (video.readyState < 2) {
        await new Promise(r => video.onloadeddata = r);
    }

    const blob = await criarVideoDeFrames(video);
    const url = URL.createObjectURL(blob);

    document.querySelector(".videoTest").src = url;
});

cancelEditVideo.addEventListener('click', ()=> {
    videoEditorPopup.classList.add('hidden');
});