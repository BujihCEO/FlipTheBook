const bookContainer = document.querySelector('.book-container');
const book = document.querySelector('.book');
const textInput = document.querySelector('.text-input');
const frontCover = document.querySelector('.front');
const sideCorver = document.querySelector('.book>.side');
const textTarget = document.querySelector('.book>.side>p');
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

function rotateBook(v) {
    book.style.transform = `rotateY(${v}deg)`;
    slider.value = v;
}

slider.addEventListener('input', () => {
    
    book.style.transform = `rotateY(${slider.value}deg)`;
});

slider.addEventListener('mousedown', () => {
    book.classList.add('noTransition');
    slider.style.cursor = 'grabbing';
});

slider.addEventListener('mouseup', () => {
    book.classList.remove('noTransition');
    slider.style.cursor = '';
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

    rotateBook(newValue);
});

bookContainer.addEventListener('touchend', (e) => {
    book.classList.remove('noTransition');
});

// mouse
let isDragging = false;

bookContainer.addEventListener('mousedown', (e) => {
    if (onPreview) return;
    isDragging = true;
    startX = e.clientX;
    startValue = parseFloat(slider.value);
    book.classList.add('noTransition');
});

bookContainer.addEventListener('mousemove', (e) => {
    if (!isDragging || onPreview || e.target == slider) return;
    e.preventDefault();
    const deltaX = e.clientX - startX;
    const sensitivity = 1; 
    let newValue = startValue + deltaX * sensitivity;
    newValue = Math.max(parseFloat(slider.min), Math.min(parseFloat(slider.max), newValue));
    rotateBook(newValue);
    bookContainer.style.cursor = 'grabbing';
});

bookContainer.addEventListener('mouseup', () => {
    if (!isDragging) return;
    isDragging = false;
    book.classList.remove('noTransition');
    bookContainer.style.cursor = '';
});

// TEXT //

const modelInput = document.querySelector('.model-input');
const isApple = /Mac|iPhone|iPod|iPad/i.test(navigator.userAgent);
const colorInput = document.querySelector('.color-input');
const fontInput = document.querySelector('.font-input');

modelInput.value = isApple ? 'Apple' : 'Outro';

textInput.addEventListener('click', ()=> {
    rotateBook(90);
});

function upadteText() {
    textTarget.textContent = textInput.value;
    while (textTarget.offsetWidth + 20 > sideCorver.offsetHeight) {
        textInput.value = textInput.value.slice(0, -1);
        textTarget.textContent = textInput.value;
    }
    if (textInput.value === '') {
        fontInput.value = '';
    } else {
        fontInput.value = fontInput.backup;
    }
}

textInput.addEventListener('input', ()=> {
    rotateBook(90);
    upadteText();
});

jscolor.presets.default = {
    width: Math.min(460, Math.max(window.innerWidth - 57)), height:165, 
    closeButton: true, closeText: '', sliderSize: 15
};

const colorList = ['#000', '#fff'];
const colorSlider = document.querySelector('.color-slider');
var colorPickers = [];

function updateColor(c1 = sideCorver.c1, c2 = sideCorver.c2) {
    if (c1) {
        sideCorver.style.setProperty('--cover-color', c1);
        sideCorver.c1 = c1;
        c2 = sideCorver.c2;
    }
    if (c2) {
        sideCorver.style.setProperty('--text-color', c2);
        sideCorver.c2 = c2;
        c1 = sideCorver.c1;
    }
    colorInput.value = `${c1}, ${c2}`;
}

colorSlider.create = () => {
    colorList.forEach((c, i) => {
        let wrap = document.createElement('div');
        let input = document.createElement('input');
        input.type = 'button';
        let picker = new JSColor(input, {
            value: c,
            closeButton: false,
            palette: null,
            onInput: () => {
                if (i == 0) {
                    updateColor(picker.toHEXString(), false);
                } else {
                    updateColor(false, picker.toHEXString());
                }
            }
        });

        if (i === 0) {
            updateColor(c, false);
            wrap.textContent = 'Fundo';
        } else {
            updateColor(false, c);
            wrap.textContent = 'Texto';
        }

        colorPickers.push(input);
        wrap.append(input);
        colorSlider.append(wrap);
    });
}

colorSlider.create();

const fontSlider = document.querySelector('.font-slider');

const fontList = [
    "Great Vibes",
    "Dancing Script",
    "Pacifico",
    "Satisfy",
    "Courgette",
    "Amatic SC",
    "Shadows Into Light"
];

WebFont.load({
    google: {
        families: fontList
    },
    active: () => {
        fontList.forEach((font, i) => {
        let div = document.createElement('div');
        div.className = "font-option";
        div.style.fontFamily = font;
        div.textContent = font;

        function select() {
            fontSlider.querySelector(".selected")?.classList.remove("selected");
            div.classList.add("selected");
            textTarget.style.fontFamily = font;
            fontInput.backup = font;
            if (textInput.value !== '') {
                fontInput.value = font;
            }
            upadteText();
        }

        div.onclick = () => {
            select();
            rotateBook(90);
        };

        if (i === 0) {
            select();
        }

        fontSlider.append(div);
        });
    }
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
    rotateBook(0);
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
    rotateBook(0);
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
    rotateBook(45);
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
const minPages = 30;
const maxPages = 60;
const initialCropRatio = 10;
const minCropRatio = 5;
const maxCropRatio = 30;
let fps = 10;
let videoPages;
let videoCropStart;
let videoCropEnd;
let currentCropRatio;
let cropSize;


function updateCropper(type, start, end) {
    if (type == 'L', type == 'R', type == 'M') playVideoEditor();

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
    } else if (type == 'Z') {
        const maxLeft = sliderCropper.parentNode.offsetWidth - sliderCropper.offsetWidth;
        const newLeft = Math.min(0, Math.max(maxLeft, sliderCropper.offsetLeft));
        sliderCropper.style.left = newLeft + "px";

        timerCropper.style.left = (videoCropStart * currentCropRatio) + "px";
        timerCropper.style.width = `${(videoCropEnd - videoCropStart) * currentCropRatio}px`;
    }

    videoTimer.style.setProperty("--start", videoCropStart * currentCropRatio + 'px');
    videoTimer.style.setProperty("--end", videoCropEnd * currentCropRatio + currentCropRatio + 'px');
    updateTimePointer();
}

function updateCropRatio(newCropRatio) {
    currentCropRatio = newCropRatio;
    videoTimer.style.width = `${videoPages * currentCropRatio}px`;
    sliderCropper.style.width = `${videoPages * currentCropRatio + 40}px`;
    timerCropper.style.width = `${videoCropEnd * currentCropRatio}px`;
    videoTimer.style.setProperty("--div-w", currentCropRatio + 'px');
}

function updateTimePointer() {
    let v = (videoContainer.currentTime * fps) * currentCropRatio + 20;
    sliderCropper.style.setProperty("--time", v + 'px');
}


let LCstartX = 0;
let LCinitialLeft = 0;
let isPanning = false;   // flag para pan
let isPinching = false;  // flag para pinch

function clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
}

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

            updateCropper("Z", videoCropStart, videoCropEnd);
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

sliderCropper.addEventListener("mousedown", (e) => {
    if (e.button !== 0) return; // só botão esquerdo
    if (e.target.closest(".timer-cropper")) return;

    isPanning = true;
    LCstartX = e.clientX;
    LCinitialLeft = sliderCropper.offsetLeft;
    sliderCropper.style.cursor = 'grabbing';

    const onMouseMove = (ev) => {
        if (!isPanning) return;
        const deltaX = ev.clientX - LCstartX;
        const maxLeft = sliderCropper.parentNode.offsetWidth - sliderCropper.offsetWidth;
        const newLeft = clamp(LCinitialLeft + deltaX, maxLeft, 0);
        sliderCropper.style.left = newLeft + "px";
    };

    const onMouseUp = () => {
        isPanning = false;
        document.removeEventListener("mousemove", onMouseMove);
        document.removeEventListener("mouseup", onMouseUp);
        sliderCropper.style.cursor = '';
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
});

const midCropper = document.querySelector('.mid-cropper');
const leftCropper = document.querySelector('.left-cropper');
const rightCropper = document.querySelector('.right-cropper');

let CropstartX;
let CropinitialValue;

[midCropper, leftCropper, rightCropper].forEach((el, i) => {
    el.addEventListener("touchstart", (e) => {
        if (isPinching) return;

        CropstartX = e.touches[0].clientX;

        if (i == 0) CropinitialValue = videoCropStart;
        if (i == 1) CropinitialValue = videoCropStart;
        if (i == 2) CropinitialValue = videoCropEnd;
    });

    el.addEventListener("touchmove", (e) => {
        if (isPinching) return;

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


    el.addEventListener("mousedown", (e) => {
        if (e.button !== 0) return;

        CropstartX = e.clientX;
        CropinitialValue = (i === 2) ? videoCropEnd : videoCropStart;
        if (i === 0) el.style.cursor = 'grabbing';

        const onMouseMove = (ev) => {
            e.preventDefault();
            const deltaX = ev.clientX - CropstartX;
            let newValue = CropinitialValue + Math.round(deltaX / currentCropRatio);

            if (i === 0) {
                newValue = clamp(newValue, 0, videoPages - (videoCropEnd - videoCropStart));
                updateCropper('M', newValue, true);
            }
            if (i === 1) {
                newValue = clamp(newValue, Math.max(0, videoCropEnd - maxPages), videoCropEnd - minPages);
                if (videoCropStart !== newValue) updateCropper('L', newValue, videoCropEnd);
            }
            if (i === 2) {
                newValue = clamp(newValue, videoCropStart + minPages, Math.min(videoPages, videoCropStart + maxPages));
                if (videoCropEnd !== newValue) updateCropper('R', videoCropStart, newValue);
            }
        };

        const onMouseUp = () => {
            document.removeEventListener("mousemove", onMouseMove);
            document.removeEventListener("mouseup", onMouseUp);
            if (i === 0) el.style.cursor = '';
        };

        document.addEventListener("mousemove", onMouseMove);
        document.addEventListener("mouseup", onMouseUp);
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
    updateCropper('Z');
});

let videoFile;
inputVideo.addEventListener('change', (e) => {
    videoFile = e.target.files[0];
    if (!videoFile) return;
    loader('on');

    const videoURL = URL.createObjectURL(videoFile);
    videoContainer.src = videoURL;

    videoTimer.innerHTML = '';
    sliderCropper.style.left = "0px";

    videoContainer.addEventListener("loadedmetadata", () => {
        videoPages = Math.floor(videoContainer.duration * 10);
        for (let i = 0; i < videoPages; i++) {
            let div = document.createElement('div');
            videoTimer.append(div);
        }

        cropSize = videoPages > maxPages ? maxPages : videoPages;
        CropstartX = 0;
        CropinitialValue = 0;
        currentCropRatio = initialCropRatio;
        videoEditorPopup.classList.remove('hidden');
        updateCropper('M', 0, cropSize);
        updateCropRatio(initialCropRatio);
        loader('off');
    }, { once: true });

    inputVideo.value = '';
});

async function criarVideoDeFrames(videoEl, start, end) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    canvas.width = videoEl.videoWidth;
    canvas.height = videoEl.videoHeight;

    const stream = canvas.captureStream(10);
    const recorder = new MediaRecorder(stream, { mimeType: "video/webm" });

    let chunks = [];
    recorder.ondataavailable = e => chunks.push(e.data);

    const fim = new Promise(resolve => {
        recorder.onstop = () => resolve(new Blob(chunks, { type: "video/webm" }));
    });

    let started = false;

    function drawFrame(now, metadata) {
        if (videoEl.currentTime >= start && videoEl.currentTime <= end) {
            ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height);

            if (!started) {
                recorder.start();   // só começa a gravar depois do 1º drawImage
                started = true;
            }
        }

        const EPSILON = 0.05;
        if (videoEl.currentTime + EPSILON < end && !videoEl.paused && !videoEl.ended) {
            videoEl.requestVideoFrameCallback(drawFrame);
        } else {
            if (started) recorder.stop();
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

function bookPlayer(url) {
    const video = document.createElement('video')
    video.src = url;
    video.playsInline = true;
    video.setAttribute('webkit-playsinline', '');
    video.muted = true;
    video.preload = 'auto';
    videoPage.replaceChildren(video);
    let paused;

    playPauseBtn.classList.remove('hidden');
    playPauseBtn.classList.add('play-icon');
    playPauseBtn.textContent = 'Play'; 

    playPauseBtn.onclick = () => {
        if (paused) {

        } else {

        }
        onPreview = true;
        rotateBook(0);
        frontCover.classList.add('open');
        playPauseBtn.classList.add('hidden');
        sliderWrap.classList.add('hidden');
        setTimeout(() => {
            video.play();
        }, 1000);
    };
    video.onended = () => {
        frontCover.classList.remove('open');
        setTimeout(() => {
            paused = true;
            onPreview = false;
            video.currentTime = 0;
            playPauseBtn.classList.remove('hidden');
            sliderWrap.classList.remove('hidden');
        }, 1000);
    }
}

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
    bookPlayer(url);
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
        updateTimePointer();
        playInterval = setInterval(() => {
            if (video.currentTime + step < videoCropEnd / fps && videoContainer.status === 'onPlay') {
                video.currentTime += step;
                updateTimePointer();
            } else {
                clearInterval(playInterval);
                videoContainer.status = 'onReplay';
                playVideoEditor('onReplay');
            }
        }, 1000 / fps);
    }

    if (status === 'onPause') {
        video.currentTime = videoCropStart / fps;
        updateTimePointer();
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
    updateTimePointer();
    videoEditorPopup.classList.remove('hidden');
});


window.addEventListener('resize', ()=> {
    colorPickers.forEach(e => {
        e.jscolor.width = Math.min(460, Math.max(window.innerWidth - 57));
    });
});