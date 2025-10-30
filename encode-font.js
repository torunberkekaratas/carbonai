// encode-font.js
// Bu script, TTF font dosyalarını Base64 stringe dönüştürür.
// Çıktıyı terminale yazar; jsPDF'e gömmede kullanılır.

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// __dirname alternatifi (ESM ortamında)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Font dosyalarının yolu
const fontsDir = path.join(__dirname, "src", "fonts");

function encodeFont(fontFileName) {
  const filePath = path.join(fontsDir, fontFileName);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Font dosyası bulunamadı: ${filePath}`);
    process.exit(1);
  }

  const data = fs.readFileSync(filePath);
  return data.toString("base64");
}

// Base64 stringleri oluştur
const regular = encodeFont("Roboto-Regular.ttf");
const bold = encodeFont("Roboto-Bold.ttf");
const italic = encodeFont("Roboto-Italic.ttf");

// Konsola düzenli biçimde yazdır
console.log("\n✅ ROBOTO FONTLARI BASE64 FORMATINDA\n");
console.log("----- REGULAR -----\n");
console.log(regular);
console.log("\n----- BOLD -----\n");
console.log(bold);
console.log("\n----- ITALIC -----\n");
console.log(italic);
console.log("\n✅ Kopyalama tamam: Bu üç değeri pdfFont.js içindeki <BASE64_...> alanlarına yapıştır.\n");