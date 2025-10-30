import React, { useMemo, useCallback } from "react";
import LogoBadge from "./LogoBadge.jsx";

/**
 * Navbar - Ana navigasyon ve aksiyon barı
 * @param {boolean} themeDark - Koyu tema aktif mi?
 * @param {function} onToggleTheme - Tema değiştirme callback'i
 * @param {function} onToggleNotes - Notlar panelini aç/kapa callback'i
 * @param {function} onDownloadPdf - PDF indirme callback'i
 * @param {number} notesCount - Toplam not sayısı
 * @param {string} facilityName - Tesis adı
 * @param {string} periodLabel - Dönem etiketi
 * @param {string} versionTag - Versiyon etiketi
 */
export default function Navbar({
  themeDark = false,
  onToggleTheme,
  onToggleNotes,
  onDownloadPdf,
  notesCount = 0,
  facilityName = "Tesis",
  periodLabel = "-",
  versionTag = "v1.3 (Beta)",
}) {
  // Memoized theme classes
  const headerClass = useMemo(
    () =>
      `rounded-2xl border shadow-sm px-4 py-3 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between transition-colors ${
        themeDark
          ? "bg-slate-800/80 border-slate-700 text-slate-100 shadow-slate-900/40"
          : "bg-white/80 border-slate-200 text-slate-700 backdrop-blur-sm shadow-slate-900/5"
      }`,
    [themeDark]
  );

  const notesButtonClass = useMemo(
    () =>
      `relative inline-flex items-center justify-center rounded-lg border px-4 py-2 text-[13px] font-semibold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        themeDark
          ? "bg-slate-800 text-slate-200 border-slate-600 hover:bg-slate-700 focus:ring-slate-500"
          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 focus:ring-slate-400"
      }`,
    [themeDark]
  );

  const pdfButtonClass = useMemo(
    () =>
      "inline-flex items-center justify-center rounded-lg bg-emerald-600 text-white border border-emerald-700/20 px-4 py-2 text-[13px] font-semibold shadow-sm shadow-emerald-600/20 hover:bg-emerald-700 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
    []
  );

  const themeButtonClass = useMemo(
    () =>
      `inline-flex items-center justify-center rounded-lg border px-3 py-2 text-[13px] font-medium shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ${
        themeDark
          ? "bg-slate-800 text-slate-200 border-slate-600 hover:bg-slate-700 focus:ring-slate-500"
          : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50 focus:ring-slate-400"
      }`,
    [themeDark]
  );

  // Callback handlers with validation
  const handleToggleTheme = useCallback(() => {
    if (onToggleTheme && typeof onToggleTheme === 'function') {
      onToggleTheme();
    } else {
      console.warn('onToggleTheme callback is not defined');
    }
  }, [onToggleTheme]);

  const handleToggleNotes = useCallback(() => {
    if (onToggleNotes && typeof onToggleNotes === 'function') {
      onToggleNotes();
    } else {
      console.warn('onToggleNotes callback is not defined');
    }
  }, [onToggleNotes]);

  const handleDownloadPdf = useCallback(() => {
    if (onDownloadPdf && typeof onDownloadPdf === 'function') {
      onDownloadPdf();
    } else {
      console.warn('onDownloadPdf callback is not defined');
    }
  }, [onDownloadPdf]);

  // Notlar badge label
  const notesAriaLabel = useMemo(() => {
    if (notesCount === 0) return "Notlarım - Not yok";
    if (notesCount === 1) return "Notlarım - 1 not mevcut";
    return `Notlarım - ${notesCount} not mevcut`;
  }, [notesCount]);

  return (
    <header className={headerClass} role="banner">
      {/* left side: Logo + info */}
      <LogoBadge
        facilityName={facilityName}
        periodLabel={periodLabel}
        versionTag={versionTag}
        dark={themeDark}
      />

      {/* right side: actions */}
      <nav
        className="flex flex-col-reverse sm:flex-row sm:items-center gap-2 sm:gap-3"
        role="navigation"
        aria-label="Ana eylemler"
      >
        {/* NOTLARIM */}
        <button
          onClick={handleToggleNotes}
          className={notesButtonClass}
          aria-label={notesAriaLabel}
          type="button"
        >
          <span>Notlarım</span>

          {notesCount > 0 && (
            <span
              className={`absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full text-[10px] font-bold shadow ring-2 transition-transform hover:scale-110 ${
                themeDark
                  ? "bg-amber-500 text-white ring-slate-800"
                  : "bg-amber-500 text-white ring-white"
              }`}
              aria-label={`${notesCount} yeni not`}
            >
              {notesCount > 9 ? "9+" : notesCount}
            </span>
          )}
        </button>

        {/* PDF İndir */}
        <button
          onClick={handleDownloadPdf}
          className={pdfButtonClass}
          aria-label="Raporu PDF olarak indir"
          type="button"
        >
          <svg
            className="w-4 h-4 mr-1.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          Raporu PDF Al
        </button>

        {/* Tema toggle */}
        <button
          onClick={handleToggleTheme}
          className={themeButtonClass}
          aria-label={themeDark ? "Açık temaya geç" : "Koyu temaya geç"}
          aria-pressed={themeDark}
          type="button"
        >
          <span className="mr-1" aria-hidden="true">
            {themeDark ? "🌙" : "☀️"}
          </span>
          {themeDark ? "Dark" : "Light"}
        </button>
      </nav>
    </header>
  );
}