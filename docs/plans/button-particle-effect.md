# button-particle-effect

เริ่มจาก react-vite-template · ไอเดีย: gamo/notes/2026-10-22-button-particle-effect.md

# button-particle-effect: กดปุ่มแล้วปุ่มสลายเป็น particle ด้วย WebGL + ฟิสิกส์

> สร้าง project button-particle-effect ทำแบบนี้ด้วย webGL ใช้ฟิสิกให้ การทำคือจะเอาไปใช้กับ button กดแล้วแสดง effect แต่ต้องไม่ไปกวนพื้นที่ปุ่มใน element จริง จะซ่อน canvas ไว้ก็ได้หรือมี idea อื่นไหม

ภาพอ้างอิง: ปุ่ม "Add to cart" สีแดง ฝั่งซ้ายสลายเป็นจุดกลมสีเดียวกับปุ่ม ขนาดต่างกัน ขอบนุ่ม (blur) ลอยฟุ้งออกไปทางซ้ายเป็นกลุ่มเมฆ ฝั่งขวายังเป็นปุ่มจริง ขอบรอยต่อสลายเป็นแนวตั้ง

## ปัญหาจริง

micro-interaction ตอน "เพิ่มลงตะกร้า" ที่ให้ความรู้สึก premium กว่า ripple/confetti ทั่วไป ของที่มี (canvas-confetti, Thanos snap ด้วย html2canvas) หนัก หรือยิงจาก DOM snapshot ช้า หรือไปยุ่งกับ layout ของปุ่ม

## ไอเดียหลัก: overlay canvas เดียวทั้งหน้า

- canvas `position: fixed; inset: 0; pointer-events: none` หนึ่งตัว ใช้ร่วมทุกปุ่ม (WebGL context มีจำกัด ~16 ต่อหน้า ห้ามทำ canvas ต่อปุ่ม)
- ปุ่มจริงไม่ถูกแตะ layout เลย: อ่าน `getBoundingClientRect()` + สี/รัศมีจาก `getComputedStyle` แล้วสร้าง particle เต็มกรอบปุ่ม
- ปุ่มหายแบบไล่ขอบ ด้วย CSS `clip-path: inset(0 0 0 X%)` (หรือ mask-image) บนปุ่มเอง ไม่ขยับ box, ไม่ reflow, ยังกดได้ / focus ได้ จบแล้วคืนค่า
- สร้าง/ทำลาย canvas lazy: มีเฉพาะตอน effect เล่นอยู่, ไม่มี rAF วิ่งตอนว่าง
- `prefers-reduced-motion` → ข้าม effect

## v1

- core ไม่มี dependency: raw WebGL2, particle เป็น point sprite วงกลมขอบนุ่ม, ฟิสิกส์บน GPU (transform feedback) หรือ CPU Float32Array ถ้า particle < ~5k
- ฟิสิกส์: แรงระเบิดออกจากจุดที่กด + curl noise ให้ฟุ้งเป็นเมฆ + drag + แรงโน้มถ่วงอ่อน, ปล่อย particle ไล่จากขอบหนึ่งไปอีกขอบ (dissolve front)
- API เดียว: `burst(button, options)` + helper `attach(button, options)`
- playground ปรับค่าได้ (จำนวน, ทิศ, แรง, ขนาด, blur, สี) และ preset 2-3 แบบ

## ไม่ทำใน v1

- react wrapper, publish npm, ประกอบปุ่มกลับจาก particle (reassemble), sampling ตัวอักษรบนปุ่มเป็น particle

## เสี่ยง

ฟีลต้องเหมือนภาพ: จุดขนาดต่างกัน มีความลึก (ใกล้-ไกล) ฟุ้งเป็นก้อนเมฆ ไม่ใช่ confetti กระจาย ถ้าฟีลไม่ได้ project ไม่มีค่า → phase 1 ทำ prototype ปรับค่าจนตรงภาพก่อนทำ API

## stack + template

`react-vite-template` เป็น playground (มี leva ไว้จูนค่า), ตัว effect อยู่ `src/particle/` เขียน raw WebGL2 + TS ไม่พึ่ง three/React เพื่อแยกเป็น npm lib ได้ภายหลัง

## phases

1. prototype: overlay canvas + ปุ่ม Add to cart ในหน้า playground, ฟิสิกส์ + shader จนฟีลตรงภาพ, จูนด้วย leva
2. API `burst/attach`, clip-path dissolve ของปุ่มจริง, reduced-motion, หลายปุ่มพร้อมกัน, resize/scroll, cleanup context
3. preset + playground สวย พร้อมแยกเป็น npm lib (Vite library mode) ถ้าอยากไปต่อ

## สถานะ (updated 2026-10-22)
ทำแล้ว: สร้าง project จาก template
ค้าง: -
ค้นพบ: -
ถัดไป: /go phase 1 ตาม docs/plans/button-particle-effect.md
