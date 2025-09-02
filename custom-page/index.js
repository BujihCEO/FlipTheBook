const bookContainer = document.querySelector('.book-container');
const book = document.querySelector('.book');
const textInput = document.querySelector('.text-input');
const frontCover = document.querySelector('.front');
const sideCorver = document.querySelector('.book>.side');
const loaderPopup = document.querySelector('.loader-popup');
const loaderMsg = document.querySelector('.loader-popup>p');
let onPreview;

function loader(action, msg) {
    if (action === 'on') {
        loaderPopup.classList.remove('hidden');
    }
    if (action === 'off') {
        loaderPopup.classList.add('hidden');
        loaderMsg.textContent = '';
    }
    if (msg) {
        loaderMsg.textContent = msg;
    } else {
        loaderMsg.textContent = 'Carregando';
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
    if (onPreview) return;
    startX = e.touches[0].clientX;
    startValue = parseFloat(slider.value);
    book.classList.add('noTransition');
});

bookContainer.addEventListener('touchmove', (e) => {
    if (onPreview) return;
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
const minPages = 5;
const maxPages = 10;
const initialCropRatio = 20;
const minCropRatio = 5;
const maxCropRatio = 30;
let fps = 10;
let videoPages;
let videoCropStart;
let videoCropEnd;
let currentCropRatio;
let cropSize;


function updateCropper(type, start, end) {
    playVideoEditor();

    if (type == 'L') {
        videoCropStart = start;
        
        startVideoCrop.textContent = videoCropStart;
        videoContainer.currentTime = videoCropStart / 10;
        
        
        timerCropper.style.left = (videoCropStart * currentCropRatio) + "px";
        timerCropper.style.width = `${(videoCropEnd - videoCropStart) * currentCropRatio}px`;
        
    } else if (type == 'R') {
        videoCropEnd = end;
        endVideoCrop.textContent = videoCropEnd;
        videoContainer.currentTime = videoCropEnd / 10;
        
        timerCropper.style.width = `${(videoCropEnd - videoCropStart) * currentCropRatio}px`;
        
    } else if (type == 'M' && videoCropStart !== start && videoCropEnd !== end) {
        videoCropEnd = end === true ?
        (start - videoCropStart) + videoCropEnd : end;

        videoCropStart = start;
        startVideoCrop.textContent = videoCropStart;
        videoContainer.currentTime = videoCropStart / 10;
        
        endVideoCrop.textContent = videoCropEnd;
        
        timerCropper.style.left = (videoCropStart * currentCropRatio) + "px";
    } else {
        const maxLeft = sliderCropper.parentNode.offsetWidth - sliderCropper.offsetWidth;
        const newLeft = Math.min(0, Math.max(maxLeft, sliderCropper.offsetLeft));
        sliderCropper.style.left = newLeft + "px";

        timerCropper.style.left = (videoCropStart * currentCropRatio) + "px";
        timerCropper.style.width = `${(videoCropEnd - videoCropStart) * currentCropRatio}px`;
    }

    videoTimer.style.setProperty("--start", videoCropStart * currentCropRatio + 'px');
    videoTimer.style.setProperty("--end", videoCropEnd * currentCropRatio + 'px');

    console.log(videoCropStart, videoCropEnd);
}

function updateCropRatio(newCropRatio) {
    currentCropRatio = newCropRatio;
    videoTimer.style.width = `${videoPages * currentCropRatio}px`;
    sliderCropper.style.width = `${videoPages * currentCropRatio + 40}px`;
    timerCropper.style.width = `${videoCropEnd * currentCropRatio}px`;
    videoTimer.style.setProperty("--div-w", currentCropRatio + 'px');
}

let LCstartX = 0;
let LCinitialLeft = 0;
let isPanning = false;   // flag para pan
let isPinching = false;  // flag para pinch

sliderCropper.addEventListener("touchstart", (e) => {
    if (e.touches.length === 1 && !isPinching) {
        // início do pan
        if (e.target.closest(".timer-cropper")) return;
        isPanning = true;
        LCstartX = e.touches[0].clientX;
        LCinitialLeft = sliderCropper.offsetLeft;
    } else if (e.touches.length === 2) {
        // início do pinch
        isPanning = false;
        isPinching = true;

        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        pinchStartDist = Math.sqrt(dx * dx + dy * dy);
        pinchStartRatio = currentCropRatio;
    }
}, { passive: false });

sliderCropper.addEventListener("touchmove", (e) => {
    if (isPanning && e.touches.length === 1) {
        if (e.target.closest(".timer-cropper")) return;
        // mover slider
        const currentX = e.touches[0].clientX;
        const deltaX = currentX - LCstartX;
        const maxLeft = sliderCropper.parentNode.offsetWidth - sliderCropper.offsetWidth;
        const newLeft = Math.min(0, Math.max(maxLeft, LCinitialLeft + deltaX));
        sliderCropper.style.left = newLeft + "px";
    } 
    else if (isPinching && e.touches.length === 2) {
        // lógica de pinch (zoom)
        if (e.cancelable) e.preventDefault();
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const newDist = Math.sqrt(dx * dx + dy * dy);

        let delta = (newDist - pinchStartDist) / 20;
        let newCR = pinchStartRatio + Math.round(delta);
        newCR = Math.min(Math.max(minCropRatio, newCR), maxCropRatio);

        if (newCR !== currentCropRatio) {
            const cropCenter = Math.round((videoCropStart + videoCropEnd) / 2);
            let cropDuration = videoCropEnd - videoCropStart;

            updateCropRatio(newCR);

            videoCropStart = Math.max(0, cropCenter - Math.floor(cropDuration / 2));
            videoCropEnd   = Math.min(videoPages, videoCropStart + cropDuration);

            if (videoCropEnd - videoCropStart < minPages) {
                videoCropEnd = videoCropStart + minPages;
            }
            if (videoCropEnd - videoCropStart > maxPages) {
                videoCropEnd = videoCropStart + maxPages;
            }
            if (videoCropEnd > videoPages) {
                videoCropEnd = videoPages;
                videoCropStart = videoPages - (videoCropEnd - videoCropStart);
            }

            updateCropper("M", videoCropStart, videoCropEnd);
        }
    }
}, { passive: false });

sliderCropper.addEventListener("touchend", (e) => {
    if (e.touches.length === 0) {
        isPanning = false;
        isPinching = false;
        pinchStartDist = null;
        pinchStartRatio = null;
    }
});


const leftCropper = document.querySelector('.left-cropper');
const rightCropper = document.querySelector('.right-cropper');

let CropstartX;
let CropinitialValue;

[timerCropper, leftCropper, rightCropper].forEach((el, i) => {
    el.addEventListener("touchstart", (e) => {
        if (isPinching) return;
        if (i == 0 && e.target.closest(".left-cropper, .right-cropper")) return;

        CropstartX = e.touches[0].clientX;

        if (i == 0) CropinitialValue = videoCropStart;
        if (i == 1) CropinitialValue = videoCropStart;
        if (i == 2) CropinitialValue = videoCropEnd;
    });

    el.addEventListener("touchmove", (e) => {
        if (isPinching) return;
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

sliderCropper.addEventListener("wheel", (e) => { 
    e.preventDefault();

    // passo do zoom (ajuste a sensibilidade)
    let newCR = currentCropRatio + Math.round(e.deltaY * -0.2); 
    newCR = Math.min(Math.max(minCropRatio, newCR), maxCropRatio);

    if (newCR === currentCropRatio) return; // sem mudança

    // calcula o centro atual em inteiros
    const cropCenter = Math.round((videoCropStart + videoCropEnd) / 2);
    let cropDuration = videoCropEnd - videoCropStart;

    // atualiza o ratio
    updateCropRatio(newCR);

    // recalcula o start e end mantendo o centro
    videoCropStart = Math.max(0, cropCenter - Math.floor(cropDuration / 2));
    videoCropEnd   = Math.min(videoPages, videoCropStart + cropDuration);

    // garante limites min/max
    if (videoCropEnd - videoCropStart < minPages) {
        videoCropEnd = videoCropStart + minPages;
    }
    if (videoCropEnd - videoCropStart > maxPages) {
        videoCropEnd = videoCropStart + maxPages;
    }

    // ajuste final se ultrapassar o limite direito
    if (videoCropEnd > videoPages) {
        videoCropEnd = videoPages;
        videoCropStart = videoPages - (videoCropEnd - videoCropStart);
    }

    // aplica no cropper
    updateCropper();
});



let videoFile;
inputVideo.addEventListener('change', (e)=> {
    videoFile = e.target.files[0];
    if (!videoFile) return;
    loader('on');
    const reader = new FileReader();
    reader.onload = async () => {
        videoContainer.src = reader.result;
        let currentPage = 0;
        videoTimer.innerHTML = '';
        sliderCropper.style.left = "0px";
        videoContainer.addEventListener("loadedmetadata", () => {
            videoPages = Math.floor(videoContainer.duration * 10);
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
                    console.log(videoTimer.childElementCount);
                    return;
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

                    const img = document.createElement("img");
                    img.src = canvas.toDataURL("image/jpeg", 0.7);
                    img.width = w;
                    img.height = h;

                    const div = document.createElement("div");
                    div.appendChild(img);
                    videoTimer.appendChild(div);

                    videoContainer.removeEventListener("seeked", handler);

                    currentPage++;
                    captureFrame();
                });
            }
            captureFrame();
            
        }, { once: true });

        inputVideo.value = '';
    };
    reader.readAsDataURL(videoFile);
});

playPauseBtn.fnt = (url)=> {
    var video = document.createElement('video');
    video.src = url;
    videoPage.replaceChildren(video);
    playPauseBtn.textContent = 'Play';
    playPauseBtn.classList.remove('hidden');
    playPauseBtn.onclick = ()=> {
        book.style.transform = 'rotateY(0deg)';
        frontCover.classList.add('open');
        playPauseBtn.classList.add('hidden');
        sliderWrap.classList.add('hidden');
        setTimeout(() => {
            onPreview = true;
            video.play();
        }, 1000);
    }
    video.onended = () => {
        frontCover.classList.remove('open');
        setTimeout(() => {
            playPauseBtn.classList.remove('hidden');
            sliderWrap.classList.remove('hidden');
            video.currentTime = 0;
            onPreview = false;
        }, 1000);
    };
}

async function criarVideoDeFrames(videoEl, start, end) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;

    // captura a 10 fps
    const stream = canvas.captureStream(10);
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });

    let chunks = [];
    recorder.ondataavailable = e => chunks.push(e.data);

    const fim = new Promise(resolve => {
        recorder.onstop = () => resolve(new Blob(chunks, { type: "video/webm" }));
    });

    recorder.start();

    function drawFrame(now, metadata) {
        if (videoEl.currentTime >= start && videoEl.currentTime <= end) {
        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
        }

        const EPSILON = 0.05;

        if (videoEl.currentTime + EPSILON < end && !videoEl.paused && !videoEl.ended) {
            videoEl.requestVideoFrameCallback(drawFrame);
        } else {
            recorder.stop();
            videoEl.pause();
        }
    }

    // começa no ponto inicial
    videoEl.currentTime = start;

    await new Promise(r => {
        videoEl.onseeked = () => {
        videoEl.onseeked = null;
        videoEl.play();
        videoEl.requestVideoFrameCallback(drawFrame);
            r();
        };
    });

  return fim;
}

let croppedStart;
let croppedEnd;
let croppedVideoUrl;
let croppedVideoCanvas;

confirmCrop.addEventListener("click", async () => {
    croppedStart = videoCropStart;
    croppedEnd = videoCropEnd;
    const inicio = videoCropStart / 10;
    const fim = videoCropEnd / 10;
    const video = videoContainer;
    croppedVideoUrl = video.src;
    croppedVideoCanvas = [...videoTimer.childNodes];
    croppedVideoPages = videoPages;

    if (video.readyState < 2) {
        await new Promise(r => video.onloadeddata = r);
    }

    loader('on', 'Cortando vídeo');
    videoEditorPopup.classList.add('hidden');
    playVideoEditor();

    const blob = await criarVideoDeFrames(video, inicio, fim);
    
    const file = new File([blob], "video.webm", { type: "video/webm" });
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    videoInput.files = dataTransfer.files;
    
    const url = URL.createObjectURL(blob);
    playPauseBtn.fnt(url);
    labelVideo.classList.add('hidden');
    videoEditorWrap.classList.remove('hidden');
    loader('off');
});


let playInterval = null;

videoContainer.onPlay = (status) => {
    const video = videoContainer;
    const step = 1 / fps;

    if (playInterval) clearInterval(playInterval);

    videoContainer.status = status;

    if (status === 'onPlay') {
        video.currentTime = videoCropStart / fps;

        playInterval = setInterval(() => {
            if (video.currentTime + step < videoCropEnd / fps && videoContainer.status === 'onPlay') {
                video.currentTime += step;
            } else {
                clearInterval(playInterval);
                videoContainer.status = 'onReplay';
                playVideoEditor('onReplay');
            }
        }, 1000 / fps);
    }

    if (status === 'onPause') {
        video.currentTime = videoCropStart / fps;
    }
    
};

function playVideoEditor(action) {
    if (action === 'onPlay') {
        playPauseEdit.classList.remove('play-icon', 'replay-icon');
        playPauseEdit.classList.add('pause-icon');
        videoContainer.onPlay('onPlay');
    } else if (action === 'onPause') {
        playPauseEdit.classList.remove('pause-icon', 'replay-icon');
        playPauseEdit.classList.add('play-icon');
        videoContainer.onPlay('onPause');
    } else if (action === 'onReplay') {
        playPauseEdit.classList.remove('pause-icon', 'play-icon');
        playPauseEdit.classList.add('replay-icon');
    } else {
        playPauseEdit.classList.remove('pause-icon', 'replay-icon');
        playPauseEdit.classList.add('play-icon');
        videoContainer.onPlay();
    }
}

playPauseEdit.addEventListener('click', () => {
    if (videoContainer.status === 'onPlay') {
        playVideoEditor('onPause');
    } else if (videoContainer.status === 'onPause') {
        playVideoEditor('onPlay');
    } else if (videoContainer.status === 'onReplay') {
        playVideoEditor('onPlay');
    } else {
        playVideoEditor('onPlay');
    }
});


cancelEditVideo.addEventListener('click', ()=> {
    if (croppedVideoUrl && croppedVideoUrl !== videoContainer.src) {
        videoPages = croppedVideoPages;
        videoContainer.src = croppedVideoUrl;
        videoTimer.replaceChildren(...croppedVideoCanvas);
        console.log(true);
    } else {
        console.log(false);
    }
    playVideoEditor();
    videoEditorPopup.classList.add('hidden');
});

editVideoBtn.addEventListener('click', ()=> {
    updateCropper('M', croppedStart, croppedEnd);
    sliderCropper.style.left = -(croppedStart * currentCropRatio) + 'px';
    videoContainer.currentTime = croppedStart / fps;
    videoEditorPopup.classList.remove('hidden');
});