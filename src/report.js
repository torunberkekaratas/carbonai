import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

/**
 * Kart çizici: başlık + (label:value) satırları
 * return => kartın alt y koordinatı
 */
function drawInfoCardKV(doc, { title, rows }, x, y, width) {
  const headerH = 8;
  const rowGap = 4.6;
  const padX = 5;
  const bodyPadTop = 6;
  const labelColW = 32; // mm

  // yükseklik hesabı
  const bodyH = rows.length * rowGap + bodyPadTop + 3;
  const totalH = headerH + bodyH;

  // kutu sınırı
  doc.setDrawColor(209, 213, 219); // border gray-300
  doc.setFillColor(249, 250, 251); // header bg gray-50
  doc.rect(x, y, width, totalH, "S");

  // header bg
  doc.rect(x, y, width, headerH, "F");

  // header alt çizgi
  doc.setDrawColor(226, 232, 240); // gray-200
  doc.line(x, y + headerH, x + width, y + headerH);

  // header text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59); // slate-800
  doc.text(title, x + padX, y + 5.2);

  // body rows
  let cy = y + headerH + bodyPadTop;
  rows.forEach((row) => {
    const label = row.label ?? "";
    const value = row.value ?? "";

    // label (bold)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(55, 65, 81); // slate-700
    doc.text(label, x + padX, cy);

    // value (normal)
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(30, 41, 59); // slate-800
    // maxWidth vermiyoruz ki harfler aralanmasın
    doc.text(String(value), x + padX + labelColW, cy);

    cy += rowGap;
  });

  return y + totalH;
}

export function generatePdfReport({ facility, emissions }) {
  const safeFacility = facility || {};
  const safeEmissions = emissions || {
    month: "-",
    total_co2_kg: 0,
    by_energy_type: [],
  };

  // toplam CO2
  const totalCo2Text = (safeEmissions.total_co2_kg ?? 0).toLocaleString(
    "tr-TR"
  );

  // jsPDF init
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  //
  // ===== ÜST BANT =====
  //
  const bandH = 26;
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, 210, bandH, "F");

  // Sol başlık
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(255, 255, 255);
  doc.text("CarbonAI Emisyon Raporu", 15, 13);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(203, 213, 225); // slate-300
  doc.text("Aylik sera gazi envanteri", 15, 18.5);

  // Sağ meta
  const generatedDate = new Date().toLocaleString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  const headerRightX = 195;
  doc.setFontSize(9);
  doc.setTextColor(226, 232, 240); // slate-200
  doc.text(`Olusturulma: ${generatedDate}`, headerRightX, 10, {
    align: "right",
  });
  doc.text(
    `Raporlanan Ay: ${safeEmissions.month || "-"}`,
    headerRightX,
    14,
    { align: "right" }
  );
  doc.setFontSize(8);
  doc.text("Ic kullanim / taslak", headerRightX, 18, {
    align: "right",
  });

  //
  // ===== LAYOUT SABİTLERİ =====
  //
  const marginL = 15;
  const colGap = 10;
  const colW = 85;
  const leftX = marginL;
  const rightX = marginL + colW + colGap;

  let cursorY = bandH + 8; // ~34mm

  //
  // ===== SOL KART: RAPOR ÖZETİ =====
  //
  const leftCardBottom = drawInfoCardKV(
    doc,
    {
      title: "RAPOR OZETI",
      rows: [
        { label: "Toplam CO2 (kg):", value: totalCo2Text },
        { label: "Donem:", value: safeEmissions.month || "-" },
        { label: "Kapsam:", value: "Tesis Bazli Kapsam 1-2" },
        {
          label: "Metodoloji:",
          value: "Emisyon faktoru x tuketim",
        },
      ],
    },
    leftX,
    cursorY,
    colW
  );

  //
  // ===== SAĞ KART: TESİS BİLGİLERİ =====
  //
  // burada facility.name bazen "Y a l o v a   F a b r i k a s ı 1" gibi
  // karakter+boşluk şeklinde geliyor. Bunu toparlıyoruz.
  const rawName = safeFacility.name || "-";

  // 1. "Y a l o v a" tarzı tek harf + boşluk pattern'lerini birleştir
  //   ör: "Y a l o v a" -> "Yalova"
  //   mantık: herhangi bir karakter + boşluk + sonraki karakter => sıkıştır
  //   Bu regex ardışık olarak uygulanınca tüm aralıklı isim toparlanıyor.
  let fixedName = rawName.replace(/(\S)\s(?=\S)/g, "$1");

  // 2. birden fazla boşluğu tek boşluğa indir
  fixedName = fixedName.replace(/\s{2,}/g, " ").trim();

  // Eğer geriye hiçbir şey kalmazsa en az "-" yaz
  const facilityName = fixedName || "-";

  // Lokasyon aynı kalsın
  const facilityLoc = [
    safeFacility.city || "-",
    safeFacility.country || "-",
  ]
    .filter(Boolean)
    .join(", ");

  const rightCardBottom = drawInfoCardKV(
    doc,
    {
      title: "TESIS BILGILERI",
      rows: [
        { label: "Tesis Adi:", value: facilityName },
        { label: "Lokasyon:", value: facilityLoc },
        {
          label: "Tesis ID:",
          value: String(safeFacility.id ?? "-"),
        },
      ],
    },
    rightX,
    cursorY,
    colW
  );

  // iki kartın altını hizala ve sonraki bloğa boşluk bırak
  cursorY = Math.max(leftCardBottom, rightCardBottom) + 14;

  //
  // ===== ÖZET KUTUSU =====
  //
  const summaryBoxX = marginL;
  const summaryBoxW = 180;
  const summaryHeaderH = 8;
  const summaryPadX = 5;
  const summaryPadBodyY = 6;

  const summaryBodyText = `Bu ay raporlanan toplam CO2 emisyonu ${totalCo2Text} kg olup, elektrik ve yakit tuketimi baz alinerek hesaplanmistir.`;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const wrappedText = doc.splitTextToSize(
    summaryBodyText,
    summaryBoxW - summaryPadX * 2
  );
  const bodyTextH =
    wrappedText.length * 4.5 + summaryPadBodyY + 4;
  const summaryBoxTotalH = summaryHeaderH + bodyTextH;

  // kutu + header bg
  doc.setDrawColor(209, 213, 219); // border
  doc.setFillColor(249, 250, 251); // header bg
  doc.rect(summaryBoxX, cursorY, summaryBoxW, summaryBoxTotalH, "S");
  doc.rect(summaryBoxX, cursorY, summaryBoxW, summaryHeaderH, "F");

  // header alt çizgi
  doc.setDrawColor(226, 232, 240);
  doc.line(
    summaryBoxX,
    cursorY + summaryHeaderH,
    summaryBoxX + summaryBoxW,
    cursorY + summaryHeaderH
  );

  // header text
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text(
    "Aylik Karbon Ayak Izi Ozeti",
    summaryBoxX + summaryPadX,
    cursorY + 5.2
  );

  // body text
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(
    wrappedText,
    summaryBoxX + summaryPadX,
    cursorY + summaryHeaderH + summaryPadBodyY,
    { maxWidth: summaryBoxW - summaryPadX * 2 }
  );

  cursorY += summaryBoxTotalH + 18;

  //
  // ===== KAYNAK BAZLI EMİSYON =====
  //
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(30, 41, 59);
  doc.text("Kaynak Bazli Emisyon Dagilimi", marginL, cursorY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139); // slate-500
  const noteLines = [
    "Not: CO2 (kg) degeri, ilgili tuketim turu icin belirlenmis emisyon faktorunun,",
    "tuketim miktari ile carpilmasi sonucu hesaplanmistir.",
  ];
  doc.text(noteLines[0], marginL, cursorY + 5);
  doc.text(noteLines[1], marginL, cursorY + 9);

  cursorY += 13;

  //
  // ===== TABLO =====
  //
  const tableBody =
    safeEmissions.by_energy_type &&
    safeEmissions.by_energy_type.length > 0
      ? safeEmissions.by_energy_type.map((row) => [
          row.energy_type,
          row.co2_kg.toLocaleString("tr-TR"),
        ])
      : [["-", "-"]];

  autoTable(doc, {
    startY: cursorY,
    head: [["Enerji Kaynagi", "CO2 (kg)"]],
    body: tableBody,
    styles: {
      font: "helvetica",
      fontSize: 9,
      textColor: [15, 23, 42],
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
      cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
      valign: "middle",
    },
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontStyle: "bold",
    },
    bodyStyles: {
      fillColor: [255, 255, 255],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 110, halign: "left" },
      1: { cellWidth: 60, halign: "right" },
    },
    margin: { left: marginL, right: 15 },
    theme: "grid",
  });

  const afterTableY = doc.lastAutoTable?.finalY || cursorY + 24;

  // tablo alt çizgi
  doc.setDrawColor(226, 232, 240);
  doc.line(marginL, afterTableY, marginL + 170, afterTableY);

  //
  // ===== FOOTER =====
  //
  const footerStartY = afterTableY + 16;

  // üst gri çizgi
  doc.setDrawColor(200, 200, 200);
  doc.line(marginL, footerStartY, marginL + 180, footerStartY);

  let fy = footerStartY + 5;

  // ilk iki satır (italik gri)
  doc.setFont("helvetica", "italic");
  doc.setFontSize(7);
  doc.setTextColor(107, 114, 128); // slate-500
  const footerLines = [
    "Bu dokuman dahili kullanim icindir ve on analiz amacli hazirlanmistir.",
    "Resmi surdurulebilirlik / denetim raporu icin dogrulanmis veriler ve metodolojiler kullanilmalidir.",
  ];
  footerLines.forEach((line) => {
    doc.text(line, marginL, fy, { maxWidth: 180 });
    fy += 3.6;
  });

  // Hazirlayan
  const prepLabel = "Hazirlayan: ";
  const prepName =
    "Enerji Sistemleri Muhendisi Torun Berke KARATAS";

  doc.setFont("helvetica", "normal");
  doc.setTextColor(71, 85, 105); // slate-600
  doc.text(prepLabel, marginL, fy);

  const prepLabelW = doc.getTextWidth(prepLabel);

  doc.setFont("helvetica", "bold");
  doc.setTextColor(55, 65, 81); // slate-700
  doc.text(prepName, marginL + prepLabelW, fy);

  //
  // ===== DOSYA KAYDET =====
  //
  const safeMonth = (safeEmissions.month || "rapor").replace(
    /[^0-9a-zA-Z_-]/g,
    ""
  );
  const safeFacilityName = facilityName
    .replace(/\s+/g, "_")
    .replace(/[^0-9a-zA-Z_-]/g, "");

  const filename = `CarbonAI_${safeFacilityName}_${safeMonth}.pdf`;
  doc.save(filename);
}