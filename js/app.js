const fileInput = document.getElementById("fileInput");
const dropZone = document.getElementById("dropZone");
const fileInfo = document.getElementById("fileInfo");
const originalPreview = document.getElementById("originalPreview");
const processedPreview = document.getElementById("processedPreview");
const originalPlaceholder = document.getElementById("originalPlaceholder");
const processedPlaceholder = document.getElementById("processedPlaceholder");
const imageOriginalCanvas = document.getElementById("imageOriginalCanvas");
const imageProcessedCanvas = document.getElementById("imageProcessedCanvas");
const processedVideoPlayer = document.getElementById("processedVideoPlayer");
const videoProcessedCanvas = document.getElementById("videoProcessedCanvas");
const videoOriginal = document.getElementById("videoOriginal");
const videoProcessed = document.getElementById("videoProcessed");
const processButton = document.getElementById("processButton");
const downloadButton = document.getElementById("downloadButton");
const progressFill = document.getElementById("progressFill");
const progressLabel = document.getElementById("progressLabel");
const blurModeGroup = document.getElementById("blurModeGroup");
const blurIntensityInput = document.getElementById("blurIntensity");
const blurIntensityValue = document.getElementById("blurIntensityValue");
const blurSizeInput = document.getElementById("blurSize");
const blurSizeValue = document.getElementById("blurSizeValue");
const blurRegionSelect = document.getElementById("blurRegion");
const blurShapeSelect = document.getElementById("blurShape");
const enableCustomRegionsInput = document.getElementById("enableCustomRegions");
const exportQualitySelect = document.getElementById("exportQuality");
const faceSelectionContainer = document.getElementById("faceSelection");
const themeToggle = document.getElementById("themeToggle");
const resetButton = document.getElementById("resetButton");
const processedVideoControls = document.getElementById("processedVideoControls");
const processedVideoProgress = document.getElementById("processedVideoProgress");
const langToggle = document.getElementById("langToggle");

const previewWrapper = document.querySelector(".preview-wrapper");
const previewTabs = document.querySelectorAll(".preview-tab");

let currentFile = null;
let currentMediaType = null;
let faceDetector = null;
let detectorReady = false;
let pendingDetectorResolver = null;

let imageDetections = [];
let selectedFaceIndices = [];
let originalImageMeta = null;

let processedBlob = null;
let processedFileName = null;

let videoProcessing = false;
let lastVideoFaceBoxes = [];
let lastVideoDetectionTime = 0;
let currentImageExtension = "png";
let currentVideoExtension = "webm";
let customRegions = [];
let drawingCustomRegion = false;
let customRegionStart = null;

function logDebug(tag, payload) {
    try {
        console.log("[SensorFaces]", tag, payload || {});
    } catch (e) {}
}

function logError(tag, error, extra) {
    try {
        console.error("[SensorFaces]", tag, error, extra || {});
    } catch (e) {}
}

const translations = {
    th: {
        "app.subtitle": "เบลอใบหน้าอัตโนมัติสำหรับรูปภาพและวิดีโอ",
        "panel.upload.title": "อัปโหลดไฟล์และตั้งค่า",
        "panel.upload.description": "รองรับ JPG, PNG, WEBP, MP4, MOV, WEBM • ประมวลผลบนเครื่องคุณเท่านั้น",
        "drop.main": "ลากแล้ววางไฟล์ที่นี่",
        "drop.secondary": "หรือ เลือกไฟล์จากเครื่อง",
        "drop.hint": "ระบบจะตรวจจับใบหน้าและเบลอให้คุณโดยอัตโนมัติ",
        "panel.settings.title": "ตั้งค่าและประมวลผล",
        "panel.preview.title": "กรอบแสดงภาพและวิดีโอ",
        "preview.empty": "โปรดอัปโหลดรูปภาพหรือวิดีโอเพื่อเริ่มใช้งาน",
        "preview.original.tab": "ต้นฉบับ",
        "preview.processed.tab": "หลังเบลอ",
        "preview.original.placeholder": "ยังไม่มีไฟล์ที่เลือก",
        "preview.processed.placeholder": "ผลลัพธ์จะปรากฏที่นี่หลังประมวลผล",
        "controls.blur.mode": "โหมดเบลอ",
        "controls.blur.intensity": "ความแรงการเบลอ",
        "controls.blur.size": "ขนาดพื้นที่เบลอ",
        "controls.blur.region": "ส่วนของใบหน้าที่ต้องการเบลอ",
        "controls.blur.shape": "รูปทรงของการเบลอ",
        "controls.custom.area": "พื้นที่ที่กำหนดเอง",
        "controls.custom.area.hint": "ลากบนรูปหรือวิดีโอเพื่อเพิ่มพื้นที่เบลอเอง",
        "controls.export.quality": "คุณภาพไฟล์ส่งออก",
        "controls.faces.title": "เลือกใบหน้าที่ต้องการเบลอ",
        "controls.actions.detect": "ตรวจจับใบหน้าและเบลอ",
        "controls.actions.reset": "เริ่มใหม่",
        "controls.actions.download": "ดาวน์โหลดไฟล์ที่เบลอแล้ว",
        "privacy.note": "ทุกอย่างประมวลผลภายในเบราว์เซอร์ของคุณ ไฟล์ของคุณจะไม่ถูกอัปโหลดไปยังเซิร์ฟเวอร์",
        "status.ready": "พร้อมสำหรับประมวลผล",
        "status.ready.image": "พร้อมตรวจจับใบหน้าในรูปภาพ",
        "status.ready.video.detect": "พร้อมตรวจจับใบหน้าในวิดีโอ",
        "status.ready.video.process": "พร้อมเริ่มประมวลผลวิดีโอ",
        "status.detecting.image": "กำลังตรวจจับใบหน้าในรูปภาพ…",
        "status.no.faces.image": "ไม่พบใบหน้าในรูปภาพ",
        "status.blurring.image": "กำลังเบลอใบหน้าที่ตรวจพบ…",
        "status.done": "ประมวลผลเสร็จสิ้น",
        "status.video.unsupported": "เบราว์เซอร์ไม่รองรับการบันทึกวิดีโอจากแคนวาส",
        "status.video.unreadable": "ไม่สามารถอ่านข้อมูลวิดีโอได้",
        "status.video.preparing.canvas": "กำลังเตรียมผิวแคนวาสสำหรับวิดีโอ…",
        "status.video.processing.frames": "กำลังประมวลผลวิดีโอแบบเฟรมต่อเฟรม…",
        "status.video.processing.percent": "กำลังประมวลผลวิดีโอ… {percent}%",
        "status.video.finalizing": "กำลังสรุปผลและสร้างไฟล์วิดีโอ…",
        "status.video.play_required": "กรุณากดเล่นวิดีโอก่อนเริ่มประมวลผลอีกครั้ง",
        "status.detecting.timeout": "ตรวจจับใบหน้านานเกินไป โปรดลองใหม่หรือลดขนาดรูปภาพ",
        "status.error.generic": "เกิดข้อผิดพลาดขณะประมวลผล กรุณาลองใหม่อีกครั้ง",
        "controls.processing.title": "การประมวลผล",
        "file.type.image": "รูปภาพ",
        "file.type.video": "วิดีโอ",
        "faces.label": "ใบหน้า {index}",
        "blur.region.full": "ทั้งใบหน้า",
        "blur.region.eyes": "เฉพาะดวงตา",
        "blur.region.mouth": "เฉพาะปาก",
        "blur.region.eyes_mouth": "ดวงตาและปาก",
        "blur.shape.rect": "สี่เหลี่ยม",
        "blur.shape.ellipse": "วงกลม / วงรี",
        "export.quality.high": "สูง (เหมาะสำหรับงานจริง)",
        "export.quality.medium": "ปานกลาง (สมดุลระหว่างขนาดไฟล์และคุณภาพ)",
        "export.quality.low": "ต่ำ (ขนาดไฟล์เล็กสุด)",
        "faces.none": "ไม่พบใบหน้าในรูปภาพ",
        "faces.found": "พบใบหน้า {count} ใบหน้า",
        "file.unsupported": "รองรับเฉพาะไฟล์รูปภาพและวิดีโอตามที่กำหนด"
    },
    en: {
        "app.subtitle": "Automatic face blurring for photos and videos",
        "panel.upload.title": "Upload file and settings",
        "panel.upload.description": "Supports JPG, PNG, WEBP, MP4, MOV, WEBM • Processed locally in your browser",
        "drop.main": "Drag and drop files here",
        "drop.secondary": "or Browse from device",
        "drop.hint": "The system will detect faces and blur them automatically",
        "panel.settings.title": "Settings and processing",
        "panel.preview.title": "Preview frame for images and videos",
        "preview.empty": "Please upload an image or video to get started",
        "preview.original.tab": "Original",
        "preview.processed.tab": "Blurred result",
        "preview.original.placeholder": "No file selected yet",
        "preview.processed.placeholder": "The result will appear here after processing",
        "controls.blur.mode": "Blur mode",
        "controls.blur.intensity": "Blur intensity",
        "controls.blur.size": "Blur area size",
        "controls.blur.region": "Face area to blur",
        "controls.blur.shape": "Blur shape",
        "controls.custom.area": "Custom areas",
        "controls.custom.area.hint": "Drag on the image or video to add blur regions",
        "controls.export.quality": "Export quality",
        "controls.faces.title": "Select faces to blur",
        "controls.actions.detect": "Detect faces and blur",
        "controls.actions.reset": "Reset",
        "controls.actions.download": "Download blurred file",
        "privacy.note": "Everything is processed inside your browser. Your files are never uploaded to a server.",
        "status.ready": "Ready to process",
        "status.ready.image": "Ready to detect faces in image",
        "status.ready.video.detect": "Ready to detect faces in video",
        "status.ready.video.process": "Ready to start processing video",
        "status.detecting.image": "Detecting faces in image…",
        "status.no.faces.image": "No faces found in the image",
        "status.blurring.image": "Blurring detected faces…",
        "status.done": "Processing complete",
        "status.video.unsupported": "Browser does not support recording video from canvas",
        "status.video.unreadable": "Cannot read video data",
        "status.video.preparing.canvas": "Preparing video canvas…",
        "status.video.processing.frames": "Processing video frame by frame…",
        "status.video.processing.percent": "Processing video… {percent}%",
        "status.video.finalizing": "Finishing and creating video file…",
        "status.video.play_required": "Please play the video once before processing again",
        "status.detecting.timeout": "Face detection took too long. Please try again or use a smaller image.",
        "status.error.generic": "An error occurred while processing. Please try again.",
        "controls.processing.title": "Processing",
        "file.type.image": "Image",
        "file.type.video": "Video",
        "faces.label": "Face {index}",
        "blur.region.full": "Full face",
        "blur.region.eyes": "Eyes only",
        "blur.region.mouth": "Mouth only",
        "blur.region.eyes_mouth": "Eyes and mouth",
        "blur.shape.rect": "Rectangle",
        "blur.shape.ellipse": "Circle / Ellipse",
        "export.quality.high": "High (best for real use)",
        "export.quality.medium": "Medium (balance of size and quality)",
        "export.quality.low": "Low (smallest file size)",
        "faces.none": "No faces found in the image",
        "faces.found": "Found {count} faces",
        "file.unsupported": "Only supported image and video formats are allowed"
    }
};

let currentLanguage = "th";

function t(key, vars) {
    const dict = translations[currentLanguage] || translations.th;
    let template = dict[key] || translations.th[key] || "";
    if (vars) {
        Object.keys(vars).forEach((name) => {
            const value = String(vars[name]);
            template = template.replace(`{${name}}`, value);
        });
    }
    return template;
}

function formatTime(seconds) {
    if (!isFinite(seconds)) return "0:00";
    const value = Math.max(0, seconds);
    const mins = Math.floor(value / 60);
    const secs = Math.floor(value % 60);
    return `${mins}:${String(secs).padStart(2, "0")}`;
}

function setThemeFromPreference() {
    const stored = window.localStorage.getItem("sf-theme");
    if (stored === "light") {
        document.body.classList.add("light");
    } else if (stored === "dark") {
        document.body.classList.remove("light");
    }
}

function toggleTheme() {
    document.body.classList.toggle("light");
    const mode = document.body.classList.contains("light") ? "light" : "dark";
    window.localStorage.setItem("sf-theme", mode);
}

setThemeFromPreference();

themeToggle.addEventListener("click", toggleTheme);

initLanguage();

function applyStaticTranslations() {
    const elements = document.querySelectorAll("[data-i18n]");
    elements.forEach((el) => {
        const key = el.getAttribute("data-i18n");
        if (!key) return;
        const text = t(key);
        if (!text) return;
        el.textContent = text;
    });
}

function setLanguage(lang) {
    if (!translations[lang]) return;
    currentLanguage = lang;
    document.documentElement.lang = lang;
    window.localStorage.setItem("sf-lang", lang);
    applyStaticTranslations();
    if (progressLabel) {
        progressLabel.textContent = t("status.ready");
    }
    if (faceSelectionContainer) {
        if (!imageDetections.length) {
            faceSelectionContainer.innerHTML =
                `<p class="face-selection-empty" data-i18n="faces.none">${t(
					"faces.none"
				)}</p>`;
        } else {
            updateFaceSelectionUI();
        }
    }
    if (currentFile) {
        setFileInfo(currentFile);
    }
    if (langToggle) {
        const buttons = langToggle.querySelectorAll(".lang-option");
        buttons.forEach((btn) => {
            const value = btn.getAttribute("data-lang");
            btn.classList.toggle("active", value === lang);
        });
    }
}

function initLanguage() {
    const stored = window.localStorage.getItem("sf-lang");
    const initial = stored && translations[stored] ? stored : "th";
    setLanguage(initial);
    if (langToggle) {
        langToggle.addEventListener("click", (event) => {
            const button = event.target.closest(".lang-option");
            if (!button) return;
            const value = button.getAttribute("data-lang");
            if (!value || value === currentLanguage) return;
            setLanguage(value);
        });
    }
}

previewTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
        previewTabs.forEach((t) => t.classList.remove("active"));
        tab.classList.add("active");
        const targetId = tab.getAttribute("data-target");
        document.querySelectorAll(".preview-surface").forEach((surface) => {
            surface.classList.toggle("active", surface.id === targetId);
        });
    });
});

function resetState() {
    currentFile = null;
    currentMediaType = null;
    imageDetections = [];
    selectedFaceIndices = [];
    originalImageMeta = null;
    processedBlob = null;
    processedFileName = null;
    videoProcessing = false;
    customRegions = [];
    drawingCustomRegion = false;
    customRegionStart = null;
    progressFill.style.width = "0%";
    progressLabel.textContent = t("status.ready");
    processButton.disabled = true;
    downloadButton.disabled = true;
    imageOriginalCanvas.hidden = true;
    imageProcessedCanvas.hidden = true;
    videoOriginal.hidden = true;
    videoProcessed.hidden = true;
    if (processedVideoPlayer) {
        processedVideoPlayer.hidden = true;
    }
    if (processedVideoControls) {
        processedVideoControls.hidden = true;
    }
    if (videoProcessedCanvas) {
        videoProcessedCanvas.hidden = true;
    }
    originalPlaceholder.hidden = false;
    processedPlaceholder.hidden = false;
    fileInfo.textContent = "";
    faceSelectionContainer.innerHTML =
        '<p class="face-selection-empty" data-i18n="faces.none">ระบบจะสร้างรายการใบหน้าหลังจากประมวลผลรูปภาพ</p>';
    if (enableCustomRegionsInput) {
        enableCustomRegionsInput.checked = false;
    }
    if (previewWrapper) {
        previewWrapper.classList.remove("has-media");
    }
}

resetState();

function formatBytes(bytes) {
    if (!bytes && bytes !== 0) return "";
    const units = ["B", "KB", "MB", "GB"];
    let index = 0;
    let value = bytes;
    while (value >= 1024 && index < units.length - 1) {
        value /= 1024;
        index += 1;
    }
    return `${value.toFixed(1)} ${units[index]}`;
}

function setFileInfo(file) {
    const isImage = file.type.startsWith("image/");
    const typeKey = isImage ? "file.type.image" : "file.type.video";
    const typeLabel = t(typeKey);
    const sizeLabel = formatBytes(file.size);
    fileInfo.innerHTML = `<span>${typeLabel}: ${file.name}</span><span>${sizeLabel}</span>`;
}

function activeBlurRegion() {
    if (!blurRegionSelect) return "full";
    return blurRegionSelect.value || "full";
}

function resolveActiveOriginalMedia() {
    if (currentMediaType === "image" && !imageOriginalCanvas.hidden) {
        return imageOriginalCanvas;
    }
    if (currentMediaType === "video" && !videoOriginal.hidden) {
        return videoOriginal;
    }
    return null;
}

function normalizePoint(event, element) {
    const rect = element.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width;
    const y = (event.clientY - rect.top) / rect.height;
    return {
        x: Math.min(1, Math.max(0, x)),
        y: Math.min(1, Math.max(0, y)),
    };
}

if (enableCustomRegionsInput && originalPreview) {
    originalPreview.addEventListener("pointerdown", (event) => {
        if (!enableCustomRegionsInput.checked) return;
        const target = resolveActiveOriginalMedia();
        if (!target) return;
        const start = normalizePoint(event, target);
        drawingCustomRegion = true;
        customRegionStart = start;
    });

    originalPreview.addEventListener("pointerup", (event) => {
        if (!drawingCustomRegion || !customRegionStart) return;
        const target = resolveActiveOriginalMedia();
        if (!target) {
            drawingCustomRegion = false;
            customRegionStart = null;
            return;
        }
        const end = normalizePoint(event, target);
        const x = Math.min(customRegionStart.x, end.x);
        const y = Math.min(customRegionStart.y, end.y);
        const width = Math.abs(end.x - customRegionStart.x);
        const height = Math.abs(end.y - customRegionStart.y);
        const minSize = 0.01;
        if (width >= minSize && height >= minSize) {
            customRegions.push({
                x,
                y,
                width,
                height
            });
        }
        drawingCustomRegion = false;
        customRegionStart = null;
    });

    originalPreview.addEventListener("pointerleave", () => {
        if (!drawingCustomRegion) return;
        drawingCustomRegion = false;
        customRegionStart = null;
    });

    enableCustomRegionsInput.addEventListener("change", () => {
        if (!enableCustomRegionsInput.checked) {
            customRegions = [];
        }
    });
}

function activeBlurShape() {
    if (!blurShapeSelect) return "rect";
    return blurShapeSelect.value || "rect";
}

function handleFileSelection(file) {
    resetState();
    if (!file) return;
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) {
        fileInfo.textContent = t("file.unsupported");
        return;
    }
    currentFile = file;
    currentMediaType = isImage ? "image" : "video";
    if (previewWrapper) {
        previewWrapper.classList.add("has-media");
    }
    setFileInfo(file);
    if (isImage) {
        loadImagePreview(file);
    } else {
        loadVideoPreview(file);
    }
}

fileInput.addEventListener("change", (event) => {
    const file = event.target.files && event.target.files[0];
    handleFileSelection(file || null);
});

dropZone.addEventListener("dragover", (event) => {
    event.preventDefault();
    dropZone.classList.add("drag-over");
});

dropZone.addEventListener("dragleave", () => {
    dropZone.classList.remove("drag-over");
});

dropZone.addEventListener("drop", (event) => {
    event.preventDefault();
    dropZone.classList.remove("drag-over");
    const file = event.dataTransfer.files && event.dataTransfer.files[0];
    if (file) {
        fileInput.files = event.dataTransfer.files;
        handleFileSelection(file);
    }
});

dropZone.addEventListener("click", () => {
    fileInput.click();
});

if (resetButton) {
    resetButton.addEventListener("click", () => {
        if (videoOriginal) {
            try {
                if (videoOriginal.src) {
                    URL.revokeObjectURL(videoOriginal.src);
                }
            } catch (e) {}
            videoOriginal.removeAttribute("src");
            videoOriginal.load();
        }
        if (videoProcessed) {
            try {
                if (videoProcessed.src) {
                    URL.revokeObjectURL(videoProcessed.src);
                }
            } catch (e) {}
            videoProcessed.removeAttribute("src");
            videoProcessed.load();
        }
        fileInput.value = "";
        resetState();
    });
}

function fitIntoBox(width, height, maxWidth, maxHeight) {
    let w = width;
    let h = height;
    const ratio = Math.min(maxWidth / w, maxHeight / h);
    return {
        width: Math.round(w * ratio),
        height: Math.round(h * ratio)
    };
}

function previewMaxSize() {
    const surface = document.querySelector(".preview-surface.active") || document.querySelector(".preview-surfaces");
    const pad = 24;
    const vw = Math.max(320, Math.min(window.innerWidth, 1200));
    const vh = Math.max(240, Math.min(window.innerHeight, 1000));
    const cw = surface && surface.clientWidth ? surface.clientWidth : vw;
    const ch = surface && surface.clientHeight ? surface.clientHeight : Math.round(vh * 0.65);
    const maxWidth = Math.max(320, Math.min(900, cw - pad));
    const maxHeight = Math.max(220, Math.min(600, ch - pad));
    return { maxWidth, maxHeight };
}

function loadImagePreview(file) {
    const reader = new FileReader();
    reader.onload = () => {
        const img = new Image();
        img.onload = () => {
            if (videoOriginal) {
                videoOriginal.hidden = true;
            }
            if (processedVideoPlayer) {
                processedVideoPlayer.hidden = true;
            }
            if (videoProcessedCanvas) {
                videoProcessedCanvas.hidden = true;
            }
            if (videoProcessed) {
                videoProcessed.hidden = true;
            }
            const pm = previewMaxSize();
            const size = fitIntoBox(img.width, img.height, pm.maxWidth, pm.maxHeight);
            imageOriginalCanvas.width = size.width;
            imageOriginalCanvas.height = size.height;
            imageProcessedCanvas.width = size.width;
            imageProcessedCanvas.height = size.height;
            const ctx = imageOriginalCanvas.getContext("2d");
            ctx.clearRect(0, 0, size.width, size.height);
            ctx.drawImage(img, 0, 0, size.width, size.height);
            originalImageMeta = {
                width: size.width,
                height: size.height,
                naturalWidth: img.width,
                naturalHeight: img.height,
            };
            imageOriginalCanvas.hidden = false;
            originalPlaceholder.hidden = true;
            processButton.disabled = false;
            progressLabel.textContent = t("status.ready.image");
        };
        img.src = reader.result;
    };
    reader.readAsDataURL(file);
}

function loadVideoPreview(file) {
    const url = URL.createObjectURL(file);
    imageOriginalCanvas.hidden = true;
    imageProcessedCanvas.hidden = true;
    videoOriginal.src = url;
    videoOriginal.hidden = false;
    originalPlaceholder.hidden = true;
    processButton.disabled = false;
    progressLabel.textContent = t("status.ready.video.detect");
    videoOriginal.addEventListener(
        "loadedmetadata",
        () => {
            progressLabel.textContent = t("status.ready.video.process");
            videoOriginal.currentTime = 0;
        }, {
            once: true
        }
    );
}

blurIntensityInput.addEventListener("input", () => {
    blurIntensityValue.textContent = blurIntensityInput.value;
    if (currentMediaType === "image" && imageDetections.length > 0) {
        renderBlurredImage();
    }
});

if (blurSizeInput && blurSizeValue) {
    blurSizeInput.addEventListener("input", () => {
        const scale = activeBlurSize();
        blurSizeValue.textContent = `${scale.toFixed(1)}x`;
        if (currentMediaType === "image" && imageDetections.length > 0) {
            renderBlurredImage();
        }
    });
}

blurModeGroup.addEventListener("click", (event) => {
    const button = event.target.closest(".segmented-option");
    if (!button) return;
    blurModeGroup.querySelectorAll(".segmented-option").forEach((b) => {
        b.classList.toggle("active", b === button);
    });
    if (currentMediaType === "image" && imageDetections.length > 0) {
        renderBlurredImage();
    }
});

function activeBlurMode() {
    const active = blurModeGroup.querySelector(".segmented-option.active");
    return active ? active.getAttribute("data-mode") : "gaussian";
}

function activeBlurSize() {
    if (!blurSizeInput) return 1;
    const value = parseFloat(blurSizeInput.value);
    if (!isFinite(value) || value <= 0) return 1;
    return value;
}

function exportQualityNumber() {
    const quality = exportQualitySelect.value;
    if (quality === "high") return 0.9;
    if (quality === "low") return 0.5;
    return 0.75;
}

async function ensureFaceDetector() {
    if (detectorReady && faceDetector) return;
    if (typeof FaceDetection === "undefined") {
        throw new Error("ไม่สามารถโหลดโมดูลตรวจจับใบหน้าได้");
    }
    faceDetector = new FaceDetection({
        locateFile: (file) =>
            `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection/${file}`,
    });
    faceDetector.setOptions({
        model: "full",
        minDetectionConfidence: 0.3,
    });
    faceDetector.onResults((results) => {
        if (pendingDetectorResolver) {
            pendingDetectorResolver(results);
            pendingDetectorResolver = null;
        }
    });
    detectorReady = true;
}

function detectFacesOnCanvas(canvas) {
    const startedAt = performance.now();
    logDebug("detectFacesOnCanvas:start", {
        width: canvas && canvas.width,
        height: canvas && canvas.height,
        ts: startedAt
    });
    return new Promise(async (resolve, reject) => {
        if (!faceDetector) {
            const error = new Error("Face detector not initialized");
            logError("detectFacesOnCanvas:noDetector", error);
            reject(error);
            return;
        }
        let settled = false;
        const timeoutMs = 10000;
        const timeoutId = setTimeout(() => {
            if (settled) return;
            settled = true;
            pendingDetectorResolver = null;
            const elapsed = performance.now() - startedAt;
            logError("detectFacesOnCanvas:timeout", null, {
                elapsed,
                width: canvas && canvas.width,
                height: canvas && canvas.height
            });
            progressLabel.textContent = t("status.detecting.timeout");
            progressFill.style.width = "0%";
            reject(new Error("Face detection timeout"));
        }, timeoutMs);
        pendingDetectorResolver = (results) => {
            if (settled) return;
            settled = true;
            clearTimeout(timeoutId);
            logDebug("detectFacesOnCanvas:success", {
                elapsed: performance.now() - startedAt,
                count: results && results.detections ? results.detections.length : 0
            });
            resolve(results);
        };
        try {
            await faceDetector.send({
                image: canvas
            });
        } catch (error) {
            if (settled) return;
            settled = true;
            clearTimeout(timeoutId);
            pendingDetectorResolver = null;
            logError("detectFacesOnCanvas:error", error);
            progressLabel.textContent = t("status.error.generic");
            progressFill.style.width = "0%";
            reject(error);
        }
    });
}

async function detectFacesWithConfidence(canvas, confidence) {
    if (!faceDetector) throw new Error("Face detector not initialized");
    faceDetector.setOptions({
        model: "full",
        minDetectionConfidence: confidence
    });
    const results = await detectFacesOnCanvas(canvas);
    return results;
}

async function detectFacesAdaptive(canvas, desiredCount) {
    const tries = [0.55, 0.45, 0.35, 0.28, 0.2];
    let best = null;
    let bestCount = -1;
    for (let i = 0; i < tries.length; i++) {
        let results;
        try {
            results = await detectFacesWithConfidence(canvas, tries[i]);
        } catch (e) {
            continue;
        }
        const count = results && results.detections ? results.detections.length : 0;
        if (count > bestCount) {
            best = results;
            bestCount = count;
        }
        if (desiredCount && count >= desiredCount) {
            return results;
        }
        if (!desiredCount && count > 0) {
            return results;
        }
    }
    return best || {
        detections: []
    };
}

processButton.addEventListener("click", async () => {
    if (!currentFile || !currentMediaType) return;
    processButton.disabled = true;
    downloadButton.disabled = true;
    progressFill.style.width = "4%";
    progressLabel.textContent = "กำลังโหลดโมเดลตรวจจับใบหน้า…";
    try {
        await ensureFaceDetector();
    } catch (error) {
        progressLabel.textContent = "เกิดข้อผิดพลาดในการโหลดโมเดล";
        processButton.disabled = false;
        return;
    }
    if (currentMediaType === "image") {
        await processImage();
    } else {
        await processVideo();
    }
});

async function processImage() {
    if (!imageOriginalCanvas.width || !imageOriginalCanvas.height) {
        progressLabel.textContent = t("status.no.faces.image");
        processButton.disabled = false;
        return;
    }
    logDebug("processImage:start", {
        width: imageOriginalCanvas.width,
        height: imageOriginalCanvas.height
    });
    progressLabel.textContent = t("status.detecting.image");
    progressFill.style.width = "18%";
    let results;
    try {
        results = await detectFacesAdaptive(imageOriginalCanvas, 2);
    } catch (error) {
        logError("processImage:detectFacesOnCanvas", error);
        processButton.disabled = false;
        downloadButton.disabled = true;
        return;
    }
    const detections = results && results.detections ? results.detections : [];
    if (!detections.length) {
        imageDetections = [];
        selectedFaceIndices = [];
        updateFaceSelectionUI();
        progressLabel.textContent = t("status.no.faces.image");
        processButton.disabled = false;
        return;
    }
    imageDetections = detections.map((d) => {
        const box = d.boundingBox;
        const x = box.xCenter - box.width / 2;
        const y = box.yCenter - box.height / 2;
        return {
            x: x * imageOriginalCanvas.width,
            y: y * imageOriginalCanvas.height,
            width: box.width * imageOriginalCanvas.width,
            height: box.height * imageOriginalCanvas.height,
            score: d.score && d.score[0] ? d.score[0] : 0,
        };
    });
    selectedFaceIndices = imageDetections.map((_, index) => index);
    updateFaceSelectionUI();
    progressFill.style.width = "45%";
    progressLabel.textContent = t("status.blurring.image");
    renderBlurredImage();
    previewTabs.forEach((tab) => {
        const targetId = tab.getAttribute("data-target");
        const isProcessed = targetId === "processedPreview";
        tab.classList.toggle("active", isProcessed);
    });
    document.querySelectorAll(".preview-surface").forEach((surface) => {
        surface.classList.toggle("active", surface.id === "processedPreview");
    });
    progressFill.style.width = "100%";
    progressLabel.textContent = t("status.done");
    processButton.disabled = false;
    downloadButton.disabled = false;
    if (processedVideoPlayer) {
        processedVideoPlayer.hidden = true;
    }
    if (videoProcessedCanvas) {
        videoProcessedCanvas.hidden = true;
    }
    if (videoProcessed) {
        videoProcessed.hidden = true;
    }
}

function updateFaceSelectionUI() {
    if (!imageDetections.length) {
        faceSelectionContainer.innerHTML =
            `<p class="face-selection-empty" data-i18n="faces.none">${t(
			"faces.none"
		)}</p>`;
        return;
    }
    const fragment = document.createDocumentFragment();
    imageDetections.forEach((det, index) => {
        const chip = document.createElement("div");
        chip.className = "face-chip";
        const main = document.createElement("div");
        main.className = "face-chip-main";
        const dot = document.createElement("div");
        dot.className = "face-chip-dot";
        const label = document.createElement("span");
        label.textContent = t("faces.label", {
            index: String(index + 1)
        });
        main.appendChild(dot);
        main.appendChild(label);
        const toggleLabel = document.createElement("label");
        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.checked = selectedFaceIndices.includes(index);
        checkbox.addEventListener("change", () => {
            if (checkbox.checked) {
                if (!selectedFaceIndices.includes(index)) {
                    selectedFaceIndices.push(index);
                }
            } else {
                selectedFaceIndices = selectedFaceIndices.filter((i) => i !== index);
            }
            if (currentMediaType === "image") {
                renderBlurredImage();
            }
        });
        const text = document.createElement("span");
        const scorePercent = Math.round(det.score * 100);
        text.textContent = `${scorePercent}%`;
        toggleLabel.appendChild(checkbox);
        toggleLabel.appendChild(text);
        chip.appendChild(main);
        chip.appendChild(toggleLabel);
        fragment.appendChild(chip);
    });
    const countLabel = document.createElement("p");
    countLabel.className = "face-selection-empty";
    countLabel.setAttribute("data-i18n", "faces.found");
    countLabel.textContent = t("faces.found", {
        count: String(imageDetections.length)
    });
    faceSelectionContainer.innerHTML = "";
    faceSelectionContainer.appendChild(fragment);
    faceSelectionContainer.appendChild(countLabel);
}

function renderBlurredImage() {
    if (!originalImageMeta || !imageDetections.length) return;
    const width = imageOriginalCanvas.width;
    const height = imageOriginalCanvas.height;
    imageProcessedCanvas.width = width;
    imageProcessedCanvas.height = height;
    const baseCtx = imageOriginalCanvas.getContext("2d");
    const outCtx = imageProcessedCanvas.getContext("2d");
    outCtx.clearRect(0, 0, width, height);
    outCtx.drawImage(imageOriginalCanvas, 0, 0, width, height);
    const blurMode = activeBlurMode();
    const intensity = Number(blurIntensityInput.value);
    const region = activeBlurRegion();
    const shape = activeBlurShape();
    const sizeScale = activeBlurSize();
    const baseFaces = imageDetections.filter((_, index) =>
        selectedFaceIndices.includes(index)
    );
    let faceBoxes = buildRegionBoxes(baseFaces, region);
    if (sizeScale && sizeScale !== 1) {
        faceBoxes = faceBoxes.map((box) =>
            scaleBox(box, sizeScale, width, height)
        );
    }
    const manualBoxes = [];
    if (
        enableCustomRegionsInput &&
        enableCustomRegionsInput.checked &&
        customRegions.length
    ) {
        customRegions.forEach((box) => {
            const px = box.x * width;
            const py = box.y * height;
            const pw = box.width * width;
            const ph = box.height * height;
            const x = Math.max(0, px);
            const y = Math.max(0, py);
            const w = Math.min(width - x, pw);
            const h = Math.min(height - y, ph);
            if (w > 0 && h > 0) {
                manualBoxes.push({
                    x,
                    y,
                    width: w,
                    height: h
                });
            }
        });
    }
    const boxes = faceBoxes.concat(manualBoxes);
    if (boxes.length) {
        if (blurMode === "gaussian") {
            applyGaussianBlurRegions(
                outCtx,
                imageOriginalCanvas,
                boxes,
                intensity,
                shape
            );
        } else if (blurMode === "pixelate") {
            applyPixelateRegions(
                outCtx,
                imageOriginalCanvas,
                boxes,
                intensity,
                shape
            );
        } else if (blurMode === "solid") {
            applySolidMaskRegions(
                outCtx,
                imageOriginalCanvas,
                boxes,
                intensity,
                shape
            );
        }
    }
    imageProcessedCanvas.hidden = false;
    processedPlaceholder.hidden = true;
    processedBlob = null;
    processedFileName = buildOutputFileName(currentFile, "image");
    currentImageExtension = "png";
    imageProcessedCanvas.toBlob((blob) => {
        processedBlob = blob;
    }, "image/png");
}

function applyGaussianBlurRegions(outCtx, sourceCanvas, boxes, intensity, shape) {
    const w = sourceCanvas.width;
    const h = sourceCanvas.height;
    const off = document.createElement("canvas");
    off.width = w;
    off.height = h;
    const offCtx = off.getContext("2d");
    offCtx.clearRect(0, 0, w, h);
    offCtx.filter = `blur(${intensity}px)`;
    offCtx.drawImage(sourceCanvas, 0, 0, w, h);
    offCtx.filter = "none";
    boxes.forEach((box) => {
        const x = Math.max(0, box.x);
        const y = Math.max(0, box.y);
        const width = Math.min(w - x, box.width);
        const height = Math.min(h - y, box.height);
        if (width <= 0 || height <= 0) return;
        if (shape === "ellipse") {
            outCtx.save();
            outCtx.beginPath();
            const cx = x + width / 2;
            const cy = y + height / 2;
            const rx = width / 2;
            const ry = height / 2;
            outCtx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
            outCtx.closePath();
            outCtx.clip();
            outCtx.drawImage(off, x, y, width, height, x, y, width, height);
            outCtx.restore();
        } else {
            outCtx.drawImage(off, x, y, width, height, x, y, width, height);
        }
    });
}

function applyPixelateRegions(outCtx, sourceCanvas, boxes, intensity, shape) {
    const factor = Math.max(4, Math.min(40, intensity * 2));
    const sourceCtx = sourceCanvas.getContext("2d");
    boxes.forEach((box) => {
        const x = Math.max(0, Math.floor(box.x));
        const y = Math.max(0, Math.floor(box.y));
        const width = Math.min(sourceCanvas.width - x, Math.floor(box.width));
        const height = Math.min(sourceCanvas.height - y, Math.floor(box.height));
        if (width <= 0 || height <= 0) return;
        const tinyWidth = Math.max(1, Math.floor(width / factor));
        const tinyHeight = Math.max(1, Math.floor(height / factor));
        const tinyCanvas = document.createElement("canvas");
        tinyCanvas.width = tinyWidth;
        tinyCanvas.height = tinyHeight;
        const tinyCtx = tinyCanvas.getContext("2d");
        tinyCtx.imageSmoothingEnabled = false;
        tinyCtx.clearRect(0, 0, tinyWidth, tinyHeight);
        tinyCtx.drawImage(
            sourceCanvas,
            x,
            y,
            width,
            height,
            0,
            0,
            tinyWidth,
            tinyHeight
        );
        if (shape === "ellipse") {
            outCtx.save();
            outCtx.beginPath();
            const cx = x + width / 2;
            const cy = y + height / 2;
            const rx = width / 2;
            const ry = height / 2;
            outCtx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
            outCtx.closePath();
            outCtx.clip();
            outCtx.imageSmoothingEnabled = false;
            outCtx.drawImage(
                tinyCanvas,
                0,
                0,
                tinyWidth,
                tinyHeight,
                x,
                y,
                width,
                height
            );
            outCtx.imageSmoothingEnabled = true;
            outCtx.restore();
        } else {
            outCtx.imageSmoothingEnabled = false;
            outCtx.drawImage(
                tinyCanvas,
                0,
                0,
                tinyWidth,
                tinyHeight,
                x,
                y,
                width,
                height
            );
            outCtx.imageSmoothingEnabled = true;
        }
    });
}

function applySolidMaskRegions(outCtx, sourceCanvas, boxes, intensity, shape) {
    const sourceCtx = sourceCanvas.getContext("2d");
    boxes.forEach((box) => {
        const x = Math.max(0, Math.floor(box.x));
        const y = Math.max(0, Math.floor(box.y));
        const width = Math.min(sourceCanvas.width - x, Math.floor(box.width));
        const height = Math.min(sourceCanvas.height - y, Math.floor(box.height));
        if (width <= 0 || height <= 0) return;
        const data = sourceCtx.getImageData(x, y, width, height).data;
        let r = 0;
        let g = 0;
        let b = 0;
        let count = 0;
        const step = Math.max(1, Math.floor(8 - intensity / 6));
        for (let py = 0; py < height; py += step) {
            for (let px = 0; px < width; px += step) {
                const index = (py * width + px) * 4;
                r += data[index];
                g += data[index + 1];
                b += data[index + 2];
                count += 1;
            }
        }
        if (!count) return;
        r = Math.round(r / count);
        g = Math.round(g / count);
        b = Math.round(b / count);
        outCtx.fillStyle = `rgba(${r},${g},${b},1)`;
        if (shape === "ellipse") {
            outCtx.beginPath();
            const cx = x + width / 2;
            const cy = y + height / 2;
            const rx = width / 2;
            const ry = height / 2;
            outCtx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
            outCtx.closePath();
            outCtx.fill();
        } else {
            outCtx.fillRect(x, y, width, height);
        }
    });
}

function buildRegionBoxes(faces, region) {
    const result = [];
    faces.forEach((face) => {
        const {
            x,
            y,
            width,
            height
        } = face;
        if (region === "eyes" || region === "eyes-mouth") {
            const eyeHeight = height * 0.2;
            const eyeWidth = width * 0.55;
            const eyeX = x + (width - eyeWidth) / 2;
            const eyeY = y + height * 0.23;
            result.push({
                x: eyeX,
                y: eyeY,
                width: eyeWidth,
                height: eyeHeight,
            });
        }
        if (region === "mouth" || region === "eyes-mouth") {
            const mouthHeight = height * 0.22;
            const mouthWidth = width * 0.5;
            const mouthX = x + (width - mouthWidth) / 2;
            const mouthY = y + height * 0.6;
            result.push({
                x: mouthX,
                y: mouthY,
                width: mouthWidth,
                height: mouthHeight,
            });
        }
        if (region === "full" || (!region && region !== "")) {
            const marginX = width * 0.08;
            const marginY = height * 0.08;
            result.push({
                x: x + marginX,
                y: y + marginY,
                width: width - marginX * 2,
                height: height - marginY * 2,
            });
        }
    });
    return result;
}

function scaleBox(box, scale, maxWidth, maxHeight) {
    if (!scale || scale === 1) return box;
    let width = box.width * scale;
    let height = box.height * scale;
    let centerX = box.x + box.width / 2;
    let centerY = box.y + box.height / 2;
    let x = centerX - width / 2;
    let y = centerY - height / 2;
    if (x < 0) {
        const diff = -x;
        x = 0;
        width = Math.max(1, width - diff);
    }
    if (y < 0) {
        const diff = -y;
        y = 0;
        height = Math.max(1, height - diff);
    }
    if (x + width > maxWidth) {
        const diff = x + width - maxWidth;
        width = Math.max(1, width - diff);
    }
    if (y + height > maxHeight) {
        const diff = y + height - maxHeight;
        height = Math.max(1, height - diff);
    }
    return {
        x,
        y,
        width,
        height
    };
}

function buildOutputFileName(file, kind) {
    const baseName = file.name.replace(/\.[^/.]+$/, "");
    const time = new Date();
    const stamp = `${time.getFullYear()}${String(time.getMonth() + 1).padStart(
2,
"0"
)}${String(time.getDate()).padStart(2, "0")}_${String(
time.getHours()
).padStart(2, "0")}${String(time.getMinutes()).padStart(
2,
"0"
)}${String(time.getSeconds()).padStart(2, "0")}`;
    const suffix = kind === "video" ? "blurred-video" : "blurred";
    return `${baseName}_${suffix}_${stamp}`;
}

async function processVideo() {
    lastVideoFaceBoxes = [];
    lastVideoDetectionTime = 0;
    if (!videoOriginal.duration || isNaN(videoOriginal.duration)) {
        progressLabel.textContent = t("status.video.unreadable");
        processButton.disabled = false;
        return;
    }
    videoProcessing = true;
    progressLabel.textContent = t("status.video.preparing.canvas");
    progressFill.style.width = "22%";
    const pmVideo = previewMaxSize();
    const maxWidth = pmVideo.maxWidth;
    const maxHeight = pmVideo.maxHeight;
    const fitted = fitIntoBox(
        videoOriginal.videoWidth,
        videoOriginal.videoHeight,
        maxWidth,
        maxHeight
    );
    const canvas = videoProcessedCanvas || document.createElement("canvas");
    canvas.width = fitted.width;
    canvas.height = fitted.height;
    const ctx = canvas.getContext("2d");
    const stream = canvas.captureStream();
    const qualitySetting = exportQualitySelect.value;
    let mimeType = "";
    let extension = "webm";
    const mp4Candidates = [
        "video/mp4;codecs=avc1.42E01E,mp4a.40.2",
        "video/mp4"
    ];
    for (const candidate of mp4Candidates) {
        if (MediaRecorder.isTypeSupported(candidate)) {
            mimeType = candidate;
            extension = "mp4";
            break;
        }
    }
    if (!mimeType) {
        mimeType =
            qualitySetting === "high" ?
            "video/webm;codecs=vp9" :
            "video/webm;codecs=vp8";
        if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = "video/webm";
        }
        extension = "webm";
    }
    currentVideoExtension = extension;
    let recorder;
    try {
        recorder = new MediaRecorder(stream, {
            mimeType
        });
    } catch (error) {
        progressLabel.textContent = t("status.video.unsupported");
        videoProcessing = false;
        processButton.disabled = false;
        return;
    }
    const chunks = [];
    recorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
            chunks.push(event.data);
        }
    };
    const recorderPromise = new Promise((resolve) => {
        recorder.onstop = () => {
            resolve();
        };
    });
    progressLabel.textContent = t("status.video.processing.frames");
    progressFill.style.width = "32%";
    const blurMode = activeBlurMode();
    const region = activeBlurRegion();
    const shape = activeBlurShape();
    videoOriginal.pause();
    videoOriginal.currentTime = 0;
    videoOriginal.muted = true;
    videoOriginal.playbackRate = 1;
    let lastTime = -1;
    let finished = false;
    recorder.start(200);
    videoOriginal.play().catch(() => {
        progressLabel.textContent = "กรุณากดเล่นวิดีโอก่อนเริ่มประมวลผลอีกครั้ง";
        videoProcessing = false;
        processButton.disabled = false;
        recorder.stop();
        return;
    });
    const totalDuration = videoOriginal.duration;
    if (videoProcessedCanvas) {
        videoProcessedCanvas.hidden = false;
    }
    processedPlaceholder.hidden = true;
    if (processedVideoPlayer) {
        processedVideoPlayer.hidden = false;
    }
    previewTabs.forEach((tab) => {
        const targetId = tab.getAttribute("data-target");
        const isProcessed = targetId === "processedPreview";
        tab.classList.toggle("active", isProcessed);
    });
    document.querySelectorAll(".preview-surface").forEach((surface) => {
        surface.classList.toggle("active", surface.id === "processedPreview");
    });
    async function step() {
        if (!videoProcessing) return;
        const current = videoOriginal.currentTime;
        // จบเมื่อเวลาเดินถึงความยาววิดีโอจริง ๆ
        if (current >= totalDuration - 0.05) {
            finished = true;
        } else if (videoOriginal.paused && !videoOriginal.ended) {
            // พยายามให้วิดีโอเล่นต่อ ถ้าหยุดกลางทาง
            videoOriginal.play().catch(() => {
                videoProcessing = false;
                processButton.disabled = false;
                progressLabel.textContent = t("status.video.play_required");
                try {
                    recorder.stop();
                } catch {}
            });
            requestAnimationFrame(step);
            return;
        } else if (current > lastTime) {
            lastTime = current;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(
                videoOriginal,
                0,
                0,
                videoOriginal.videoWidth,
                videoOriginal.videoHeight,
                0,
                0,
                canvas.width,
                canvas.height
            );
            const results = await detectFacesAdaptive(canvas, 0);
            const detections =
                results && results.detections ? results.detections : [];
            let faces = detections.map((d) => {
                const box = d.boundingBox;
                const x = box.xCenter - box.width / 2;
                const y = box.yCenter - box.height / 2;
                return {
                    x: x * canvas.width,
                    y: y * canvas.height,
                    width: box.width * canvas.width,
                    height: box.height * canvas.height,
                };
            });
            let boxes = buildRegionBoxes(faces, region);
            const sizeScale = activeBlurSize();
            if (sizeScale && sizeScale !== 1) {
                boxes = boxes.map((box) =>
                    scaleBox(box, sizeScale, canvas.width, canvas.height)
                );
            }
            if (lastVideoFaceBoxes.length && boxes.length === lastVideoFaceBoxes.length) {
                const alpha = 0.35;
                boxes = boxes.map((box, index) => {
                    const prev = lastVideoFaceBoxes[index];
                    if (!prev) return box;
                    return {
                        x: prev.x + (box.x - prev.x) * alpha,
                        y: prev.y + (box.y - prev.y) * alpha,
                        width: prev.width + (box.width - prev.width) * alpha,
                        height: prev.height + (box.height - prev.height) * alpha,
                    };
                });
            }
            let manualBoxes = [];
            if (
                enableCustomRegionsInput &&
                enableCustomRegionsInput.checked &&
                customRegions.length
            ) {
                customRegions.forEach((box) => {
                    const px = box.x * canvas.width;
                    const py = box.y * canvas.height;
                    const pw = box.width * canvas.width;
                    const ph = box.height * canvas.height;
                    const x = Math.max(0, px);
                    const y = Math.max(0, py);
                    const width = Math.min(canvas.width - x, pw);
                    const height = Math.min(canvas.height - y, ph);
                    if (width > 0 && height > 0) {
                        manualBoxes.push({
                            x,
                            y,
                            width,
                            height
                        });
                    }
                });
            }
            let allBoxes = boxes.concat(manualBoxes);
            if (!allBoxes.length && lastVideoFaceBoxes.length) {
                const gap = current - lastVideoDetectionTime;
                if (isFinite(gap) && gap <= 0.4) {
                    allBoxes = lastVideoFaceBoxes.map((b) => ({
                        x: b.x,
                        y: b.y,
                        width: b.width,
                        height: b.height
                    }));
                }
            }
            if (allBoxes.length) {
                const intensity = Number(blurIntensityInput.value);
                if (blurMode === "gaussian") {
                    applyGaussianBlurRegions(ctx, canvas, allBoxes, intensity, shape);
                } else if (blurMode === "pixelate") {
                    applyPixelateRegions(ctx, canvas, allBoxes, intensity, shape);
                } else if (blurMode === "solid") {
                    applySolidMaskRegions(ctx, canvas, allBoxes, intensity, shape);
                }
            }
            if (boxes.length) {
                lastVideoFaceBoxes = boxes.map((b) => ({
                    ...b
                }));
                lastVideoDetectionTime = current;
            }
            const progressRatio = current / totalDuration;
            const percent = Math.min(99, Math.round(progressRatio * 100));
            progressFill.style.width = `${percent}%`;
            progressLabel.textContent = t("status.video.processing.percent", {
                percent: `${percent}%`
            });
        }
        if (!finished) {
            window.requestAnimationFrame(step);
        } else {
            videoOriginal.pause();
            recorder.stop();
            progressFill.style.width = "100%";
            progressLabel.textContent = t("status.video.finalizing");
        }
    }
    window.requestAnimationFrame(step);
    await recorderPromise;
    videoProcessing = false;
    const blob = new Blob(chunks, {
        type: mimeType
    });
    processedBlob = blob;
    processedFileName = buildOutputFileName(currentFile, "video");
    const url = URL.createObjectURL(blob);
    videoProcessed.src = url;
    videoProcessed.hidden = false;
    if (videoProcessedCanvas) {
        videoProcessedCanvas.hidden = true;
    }
    if (processedVideoPlayer) {
        processedVideoPlayer.hidden = false;
    }
    if (processedVideoControls) {
        processedVideoControls.hidden = false;
    }
    progressLabel.textContent = t("status.done");
    downloadButton.disabled = false;
    processButton.disabled = false;
}

downloadButton.addEventListener("click", () => {
    if (!processedBlob || !processedFileName) return;
    const url = URL.createObjectURL(processedBlob);
    const link = document.createElement("a");
    const kind = currentMediaType === "video" ? currentVideoExtension : currentImageExtension;
    link.href = url;
    link.download = `${processedFileName}.${kind}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
});

if (processedVideoControls && videoProcessed && processedVideoProgress) {
    const playButton = processedVideoControls.querySelector(
        '[data-action="toggle-play"]'
    );
    const backButton = processedVideoControls.querySelector(
        '[data-action="seek-back"]'
    );
    const forwardButton = processedVideoControls.querySelector(
        '[data-action="seek-forward"]'
    );
    const muteButton = processedVideoControls.querySelector(
        '[data-action="toggle-mute"]'
    );
    const fullscreenButton = processedVideoControls.querySelector(
        '[data-action="toggle-fullscreen"]'
    );
    const currentTimeLabel = processedVideoControls.querySelector(
        '[data-role="current"]'
    );
    const durationLabel = processedVideoControls.querySelector(
        '[data-role="duration"]'
    );

    function ensureFiniteDuration() {
        if (videoProcessed.duration === Infinity) {
            const startTime = videoProcessed.currentTime || 0;
            videoProcessed.currentTime = 1e101;
            const handler = () => {
                if (isFinite(videoProcessed.duration)) {
                    videoProcessed.removeEventListener("timeupdate", handler);
                    videoProcessed.currentTime = startTime;
                    syncDuration();
                }
            };
            videoProcessed.addEventListener("timeupdate", handler);
        }
    }

    function syncDuration() {
        if (videoProcessed.duration && isFinite(videoProcessed.duration)) {
            durationLabel.textContent = formatTime(videoProcessed.duration);
            processedVideoProgress.max = videoProcessed.duration;
        }
    }

    function syncProgress() {
        processedVideoProgress.value = videoProcessed.currentTime;
        currentTimeLabel.textContent = formatTime(videoProcessed.currentTime);
        if (videoProcessed.duration && isFinite(videoProcessed.duration)) {
            const ratio = Math.min(
                1,
                Math.max(0, videoProcessed.currentTime / videoProcessed.duration)
            );
            processedVideoProgress.style.setProperty(
                "--video-progress",
                `${ratio * 100}%`
            );
        }
    }

    videoProcessed.addEventListener("loadedmetadata", () => {
        ensureFiniteDuration();
        syncDuration();
    });

    videoProcessed.addEventListener("timeupdate", () => {
        syncDuration();
        syncProgress();
    });

    playButton.addEventListener("click", () => {
        if (videoProcessed.paused) {
            videoProcessed.play();
            playButton.textContent = "⏸";
        } else {
            videoProcessed.pause();
            playButton.textContent = "▶";
        }
    });

    backButton.addEventListener("click", () => {
        if (!videoProcessed.duration) return;
        videoProcessed.currentTime = Math.max(
            0,
            videoProcessed.currentTime - 10
        );
    });

    forwardButton.addEventListener("click", () => {
        if (!videoProcessed.duration) return;
        videoProcessed.currentTime = Math.min(
            videoProcessed.duration,
            videoProcessed.currentTime + 10
        );
    });

    muteButton.addEventListener("click", () => {
        const nextMuted = !videoProcessed.muted;
        videoProcessed.muted = nextMuted;
        muteButton.textContent = nextMuted ? "🔇" : "🔊";
    });

    processedVideoProgress.addEventListener("input", () => {
        if (!videoProcessed.duration) return;
        videoProcessed.currentTime = Number(processedVideoProgress.value);
    });

    fullscreenButton.addEventListener("click", () => {
        const target = processedVideoPlayer || videoProcessed;
        if (!document.fullscreenElement) {
            if (target.requestFullscreen) {
                target.requestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            }
        }
    });
}
