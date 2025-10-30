import React, { useRef } from "react";
import AppHeader from "./components/AppHeader.jsx";
import Dashboard from "./pages/Dashboard.jsx";

export default function App() {
  // Şimdilik dark mode KAPALI sabit
  const themeDark = false;

  // Dashboard içindeki fonksiyonlara dışarıdan ulaşmak için
  const dashboardRef = useRef(null);

  function handleToggleNotes() {
    dashboardRef.current?.toggleNotesPanel?.();
  }

  function handleDownloadPdf() {
    dashboardRef.current?.downloadPdf?.();
  }

  // Dark mode'u tamamen kilitle: buton basınca hiçbir şey yapma
  function handleToggleTheme() {
    console.log("Dark mode şimdilik kilitli 👍");
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-emerald-50 text-slate-700">
      <AppHeader
        notesCount={dashboardRef.current?.getNoteCount?.() || 0}
        onToggleNotes={handleToggleNotes}
        onDownloadPdf={handleDownloadPdf}
        onToggleTheme={handleToggleTheme}
        themeDark={themeDark}
      />

      <main className="p-6">
        <Dashboard ref={dashboardRef} themeDark={themeDark} />
      </main>
    </div>
  );
}