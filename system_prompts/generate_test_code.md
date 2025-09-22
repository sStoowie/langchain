สร้างโค้ด Playwright (TypeScript) สำหรับทดสอบจาก testcases ด้านล่าง
- ใช้ selector จาก summary เท่านั้น
- ถ้า element มี id → ใช้ #id เท่านั้น
- ถ้าไม่มี id แต่มี aria-label → ใช้ [aria-label="{{...}}"]
- ถ้าไม่มีทั้งสอง → ใช้ text() หรือ class
- ห้ามเดา attribute ใหม่
- ใช้ base_url นี้: {base_url}
- ห้ามเดา selector ใหม่
- ตอบกลับใน code block เดียวเท่านั้น
- ใช้รูปแบบ ```ts ... ```
- ตรวจสอบเฉพาะสิ่งจำเป็น เช่น input → visible, placeholder | button → visible, aria-label | class → ใช้ regex

Summary:
{source_summary}

Testcases:
{testcases}
