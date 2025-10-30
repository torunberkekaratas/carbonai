import React, { useMemo } from "react";
import { Link, useLocation } from "react-router-dom";

// Header yüksekliği sabit olarak export edildi
export const HEADER_HEIGHT = "64px";

export default function AppHeader({
  activePage,
  notesCount = 0,
  onToggleNotes,
  onDownloadPdf,
  onToggleTheme,
  themeDark = false,
  facility = null,
  emissions = null,
}) {
  const location = useLocation();
  const currentPath = location.pathname;

  // Memoized değerler
  const isDashboard = useMemo(() => currentPath === "/", [currentPath]);
  const isDataEntry = useMemo(() => currentPath === "/data-entry", [currentPath]);

  // Memoized theme classes
  const headerClass = useMemo(
    () =>
      `fixed top-0 left-0 right-0 z-50 border-b shadow-sm backdrop-blur ${
        themeDark
          ? "bg-slate-900/90 border-slate-700 text-slate-100"
          : "bg-white/90 border-slate-200 text-slate-700"
      }`,
    [themeDark]
  );

  const brandClass = useMemo(
    () => `font-semibold ${themeDark ? "text-white" : "text-slate-900"}`,
    [themeDark]
  );

  const navLinkClass = useMemo(
    () =>
      `hover:underline transition-colors ${
        themeDark
          ? "text-slate-300 hover:text-white"
          : "text-slate-600 hover:text-slate-900"
      }`,
    [themeDark]
  );

  const dividerClass = useMemo(
    () => (themeDark ? "text-slate-600 select-none" : "text-slate-300 select-none"),
    [themeDark]
  );

  const facilityClass = useMemo(
    () =>
      `uppercase tracking-wide font-medium ${
        themeDark ? "text-slate-400" : "text-slate-500"
      }`,
    [themeDark]
  );

  const titleClass = useMemo(
    () =>
      `font-semibold ${
        themeDark ? "text-white" : "text-slate-900"
      } text-[13px] leading-tight`,
    [themeDark]
  );

  const badgeClass = useMemo(
    () =>
      `text-[10px] font-medium rounded px-2 py-[2px] border ${
        themeDark
          ? "text-emerald-300 bg-emerald-900/30 border-emerald-700"
          : "text-emerald-700 bg-emerald-100 border-emerald-300"
      }`,
    [themeDark]
  );

  const descriptionClass = useMemo(
    () =>
      `block w-full sm:w-auto text-[11px] sm:ml-2 ${
        themeDark ? "text-slate-400" : "text-slate-600"
      }`,
    [themeDark]
  );

  const notesButtonClass = useMemo(
    () =>
      "relative inline-flex items-center justify-center rounded-md border border-amber-600 bg-amber-500 px-3 py-1.5 text-[12px] font-semibold text-white shadow-sm hover:bg-amber-600 transition-colors",
    []
  );

  const pdfButtonClass = useMemo(
    () =>
      `inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-[12px] font-semibold shadow-sm transition-colors ${
        themeDark
          ? "bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700 shadow-emerald-800/30"
          : "bg-emerald-600 text-white border-emerald-700/20 hover:bg-emerald-700 shadow-emerald-600/20"
      }`,
    [themeDark]
  );

  const themeButtonClass = useMemo(
    () =>
      `inline-flex items-center justify-center rounded-md border px-3 py-1.5 text-[12px] font-semibold shadow-sm transition-colors ${
        themeDark
          ? "border-slate-600 bg-slate-700 text-slate-200 hover:bg-slate-600"
          : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
      }`,
    [themeDark]
  );

  // Sayfa başlığı dinamik
  const pageTitle = useMemo(() => {
    if (isDashboard) return "Karbon Emisyon Özeti";
    if (isDataEntry) return "Veri Girişi";
    return "CarbonAI";
  }, [isDashboard, isDataEntry]);

  // Sayfa açıklaması dinamik
  const pageDescription = useMemo(() => {
    if (isDashboard) {
      return "Bu ekran tesis bazlı CO₂ ayak izinizi özetler. Aşağıda trend, dağılım ve önerilen aksiyonları görürsünüz.";
    }
    if (isDataEntry) {
      return "Enerji tüketimi, filo, personel ve operasyonel verilerinizi buradan girebilirsiniz.";
    }
    return "";
  }, [isDashboard, isDataEntry]);

  return (
    <header className={headerClass} style={{ height: HEADER_HEIGHT }} role="banner">
      <div className="h-full flex items-start justify-between gap-4 px-4 sm:px-6 py-3">
        {/* SOL TARAF */}
        <div className="min-w-0 flex flex-col gap-1">
          {/* Üst satır: marka + nav + tesis bilgisi */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-[12px] leading-tight">
            {/* logo / marka */}
            <span className={brandClass}>CarbonAI</span>

            {/* nav links */}
            <nav
              className="flex items-center gap-2 sm:gap-3 font-medium"
              aria-label="Ana navigasyon"
            >
              <Link
                to="/"
                className={navLinkClass}
                aria-current={isDashboard ? "page" : undefined}
                aria-label="Dashboard sayfasına git"
              >
                Dashboard
              </Link>
              <Link
                to="/data-entry"
                className={navLinkClass}
                aria-current={isDataEntry ? "page" : undefined}
                aria-label="Veri girişi sayfasına git"
              >
                Veri Girişi
              </Link>
            </nav>

            {/* dikey ayraç */}
            <span className={dividerClass} aria-hidden="true">
              |
            </span>

            {/* tesis + ay */}
            <span className={facilityClass}>
              {facility?.name || "Tesis"} • {emissions?.month || "-"}
            </span>
          </div>

          {/* Alt satır: sayfa başlığı + badge + açıklama */}
          <div className="flex flex-wrap items-center gap-2 text-[11px] leading-snug">
            <h1 className={titleClass}>{pageTitle}</h1>

            <span className={badgeClass} aria-label="Versiyon 1.2 Beta">
              v1.2 (Beta)
            </span>

            {pageDescription && (
              <span className={descriptionClass}>{pageDescription}</span>
            )}
          </div>
        </div>

        {/* SAĞ TARAF */}
        <div
          className="shrink-0 flex flex-col sm:flex-row flex-wrap items-end sm:items-start gap-2 text-[13px] leading-none"
          role="group"
          aria-label="Hızlı eylemler"
        >
          {/* Notlarım */}
          <button
            onClick={onToggleNotes}
            className={notesButtonClass}
            aria-label={
              notesCount > 0
                ? `Notlarım - ${notesCount} not mevcut`
                : "Notlarım - Not yok"
            }
            aria-pressed={false}
          >
            <span>Notlarım</span>
            {notesCount > 0 && (
              <span
                className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[16px] h-4 rounded-full bg-white text-amber-600 text-[10px] font-bold shadow ring-2 ring-amber-500 px-[4px] leading-none"
                aria-label={`${notesCount} not`}
              >
                {notesCount}
              </span>
            )}
          </button>

          {/* PDF */}
          <button
            onClick={onDownloadPdf}
            className={pdfButtonClass}
            aria-label="Raporu PDF olarak indir"
          >
            Raporu PDF Al
          </button>

          {/* Tema toggle */}
          <button
            onClick={onToggleTheme}
            className={themeButtonClass}
            aria-label={themeDark ? "Açık temaya geç" : "Koyu temaya geç"}
            aria-pressed={themeDark}
          >
            {themeDark ? "🌙 Dark" : "☀️ Light"}
          </button>
        </div>
      </div>
    </header>
  );
}