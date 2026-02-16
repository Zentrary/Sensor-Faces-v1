# Sensor Faces

![Demo](images/2.png)

**Sensor Faces** is a fully client-side web application for detecting and blurring faces in images and videos.  
All processing happens directly in your browser — no uploads, no servers, no tracking.

---

## ✨ Features

- On-device face detection and blurring
- No file uploads (100% browser-side processing)
- Multi-face detection with adaptive confidence tuning
- Blur regions:
  - Full face
  - Eyes only
  - Mouth only
  - Eyes + mouth
- Blur shapes:
  - Rectangle
  - Ellipse (more natural look)
- Manual custom blur areas (draw any region)
- Image export: PNG
- Video export: MP4 (if supported by your browser)
- EN / TH language toggle
- Light / Dark theme

---

## 📂 Supported Formats

### Images
- JPG
- PNG
- WEBP

### Videos
- MP4
- MOV
- WEBM  
(Exports as MP4 when supported)

---

## 🚀 Quick Start

1. Clone or download this repository.
2. Open `index.html` directly in your browser.

Optional (Local Server Preview):

```bash
python -m http.server 8000
```

Then open:

```
http://localhost:8000/
```

3. Drag an image or video into the drop zone.
4. Click **Detect faces and blur**.
5. Download the processed result.

---

## 🧠 Tech Stack

- HTML5
- CSS3
- Vanilla JavaScript
- Browser-based Face Detection API / ML model

---

## 🌐 Browser Support

- Google Chrome (Recommended)
- Microsoft Edge
- Firefox
- Safari (video export may be limited)

---

## 🔐 Privacy

All processing is performed locally in your browser.  
Files are never uploaded or transmitted to any server.

---

## 📁 Project Structure

```
Sensor-Faces/
│
├── index.html
├── css/
├── js/
├── images/
│   └── 2.png
└── start-localhost.bat
```

---

## 📄 License

This project is licensed under the MIT License.

---

---

# ภาษาไทย

## Sensor Faces คืออะไร

**Sensor Faces** คือเว็บแอปสำหรับตรวจจับและเบลอใบหน้าในรูปภาพและวิดีโอ  
ทำงานทั้งหมดภายในเบราว์เซอร์ของคุณ โดยไม่มีการอัปโหลดไฟล์ไปยังเซิร์ฟเวอร์ใด ๆ

---

## ✨ คุณสมบัติ

- ตรวจจับและเบลอใบหน้าในเครื่อง 100%
- ไม่อัปโหลดไฟล์
- รองรับหลายใบหน้า
- เลือกจุดเบลอได้:
  - ทั้งใบหน้า
  - เฉพาะตา
  - เฉพาะปาก
  - ตา + ปาก
- รูปทรงเบลอ:
  - สี่เหลี่ยม
  - วงรี (ดูเป็นธรรมชาติ)
- กำหนดพื้นที่เบลอเองได้
- บันทึกรูปเป็น PNG
- บันทึกวิดีโอเป็น MP4 (ถ้าเบราว์เซอร์รองรับ)
- สลับภาษา ไทย / อังกฤษ
- ธีมสว่าง / มืด

---

## 📂 รองรับไฟล์

### รูปภาพ
- JPG
- PNG
- WEBP

### วิดีโอ
- MP4
- MOV
- WEBM  
(บันทึกออกเป็น MP4 หากรองรับ)

---

## 🚀 วิธีใช้งาน

1. ดาวน์โหลดหรือโคลนโปรเจกต์นี้
2. เปิดไฟล์ `index.html` ในเบราว์เซอร์

หรือรันผ่าน Local Server:

```bash
python -m http.server 8000
```

เข้าใช้งานที่:

```
http://localhost:8000/
```

3. ลากไฟล์ลงในหน้าเว็บ
4. กดปุ่มตรวจจับและเบลอ
5. ดาวน์โหลดผลลัพธ์

---

## 🔐 ความเป็นส่วนตัว

ทุกอย่างทำงานภายในเครื่องของคุณ  
ไม่มีการส่งไฟล์ออกไปยังเซิร์ฟเวอร์ใด ๆ
