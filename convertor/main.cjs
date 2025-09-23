const fs = require("fs");
const path = require("path");

const dir = __dirname; // current folder
const files = fs.readdirSync(dir);

// ไฟล์ที่ต้องข้าม
const exclude = ["main.cjs", "result.txt"];

// เตรียมโครงสร้าง JSON
const result = {
  base_url: "http://localhost:5173/login",
  source_code: []
};

files.forEach(file => {
  if (exclude.includes(file)) return; // ข้ามไฟล์ที่ไม่ต้องการ

  const filePath = path.join(dir, file);
  const content = fs.readFileSync(filePath, "utf8");

  // one-line
  const oneLine = content
    .replace(/\r?\n|\r/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  result.source_code.push({
    name: file,
    path: filePath,
    content: oneLine
  });
});

// เขียนผลลัพธ์ลงไฟล์ result.txt
fs.writeFileSync(path.join(dir, "result.txt"), JSON.stringify(result, null, 2), "utf8");

console.log("✅ Result written to result.txt");
