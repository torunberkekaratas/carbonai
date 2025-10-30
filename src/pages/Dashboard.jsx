// src/pages/Dashboard.jsx
import React, { useEffect, useMemo, useState, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  fetchFacility,
  fetchEmissions,
  fetchOperationsSummary,
} from "../api.js";
import EmissionsChart from "../components/EmissionsChart.jsx";
import TrendChart from "../components/TrendChart.jsx";

/**
 * Dashboard - Ana karbon emisyon özeti sayfası
 * @param {boolean} themeDark - Koyu tema aktif mi?
 * @param {object} dashboardApiRef - Ref objesi
 * @param {boolean} showNotesPanel - Notlar paneli açık mı?
 * @param {function} setShowNotesPanel - Panel state setter
 */
function Dashboard({
  themeDark = false,
  dashboardApiRef,
  showNotesPanel = false,
  setShowNotesPanel,
}) {
  const FACILITY_ID = 1;
  const MONTH = "2025-10";

  // ==== STATE ====
  const [loading, setLoading] = useState(true);
  const [facility, setFacility] = useState(null);
  const [emissions, setEmissions] = useState(null);
  const [opsSummary, setOpsSummary] = useState(null);
  const [topEmployees, setTopEmployees] = useState([]);
  const [error, setError] = useState(null);
  const [showActionDetails, setShowActionDetails] = useState(false);
  const [notes, setNotes] = useState([]);
  const [actionPlanned, setActionPlanned] = useState(false);
  const [chartType, setChartType] = useState("donut");

  const pieChartRef = useRef(null);
  const trendChartRef = useRef(null);
  const isMountedRef = useRef(true);

  // ==== DATA FETCH ====
  useEffect(() => {
    isMountedRef.current = true;

    (async () => {
      try {
        const [fac, emi, ops] = await Promise.all([
          fetchFacility(FACILITY_ID),
          fetchEmissions(FACILITY_ID, MONTH),
          fetchOperationsSummary(FACILITY_ID, MONTH),
        ]);

        if (!isMountedRef.current) return;

        setFacility(fac);
        setEmissions(emi);
        setOpsSummary(ops);

        // Mock data - ideally from API
        setTopEmployees([
          { employee_id: 1, name: "Ahmet Yılmaz", commute_mode: "Şahsi Araç (Benzin)", daily_km: 42, co2_kg: 7.3 },
          { employee_id: 2, name: "Elif Demir", commute_mode: "Servis", daily_km: 30, co2_kg: 4.1 },
          { employee_id: 3, name: "Mert Kaya", commute_mode: "Toplu Taşıma", daily_km: 22, co2_kg: 2.2 },
          { employee_id: 4, name: "Zeynep Akın", commute_mode: "Elektrikli Araç", daily_km: 35, co2_kg: 1.1 },
          { employee_id: 5, name: "Canan Uçar", commute_mode: "Yaya / Bisiklet", daily_km: 5, co2_kg: 0.0 },
        ]);
      } catch (err) {
        console.error("Veri çekme hatası:", err);
        if (!isMountedRef.current) return;
        setError(`Veri çekilemedi: ${err.message || 'Bilinmeyen hata'}`);
      } finally {
        if (isMountedRef.current) setLoading(false);
      }
    })();

    return () => {
      isMountedRef.current = false;
    };
  }, [FACILITY_ID, MONTH]);

  // ==== navbar API bağlama (PDF indir, Notlarım aç) ====
  const handleDownload = useCallback(async () => {
    try {
      let chartImage = null;

      if (pieChartRef.current?.capturePng) {
        chartImage = await pieChartRef.current.capturePng();
      } else if (trendChartRef.current?.capturePng) {
        chartImage = await trendChartRef.current.capturePng();
      }

      console.log("PDF TODO", {
        facility,
        emissions,
        chartImage,
        notes,
        actionDone: actionPlanned
      });

      alert("PDF oluşturma özelliği yakında eklenecek");
    } catch (err) {
      console.error("PDF oluşturulurken hata:", err);
      alert(`PDF oluşturulamadı: ${err.message || 'Bilinmeyen hata'}`);
    }
  }, [facility, emissions, notes, actionPlanned]);

  useEffect(() => {
    if (!dashboardApiRef) return;

    dashboardApiRef.current = {
      handleDownloadPDF: handleDownload,
      openNotesPanel: () => {
        if (setShowNotesPanel && typeof setShowNotesPanel === 'function') {
          setShowNotesPanel(true);
        }
      },
    };

    return () => {
      if (dashboardApiRef?.current) {
        dashboardApiRef.current.handleDownloadPDF = undefined;
        dashboardApiRef.current.openNotesPanel = undefined;
      }
    };
  }, [dashboardApiRef, setShowNotesPanel, handleDownload]);

  // ==== MEMOIZED DERIVATIVES ====
  const byEnergy = useMemo(() => (
    Array.isArray(emissions?.by_energy_type) ? emissions.by_energy_type : []
  ), [emissions]);

  const chartData = useMemo(() =>
    byEnergy.map((row) => ({
      name: row.energy_type || "Bilinmeyen",
      value: row.co2_kg || 0
    })),
  [byEnergy]);

  const topSource = useMemo(() => byEnergy[0] || null, [byEnergy]);

  const historyData = useMemo(() => ([
    { month: "2025-06", total_co2_kg: 12000 },
    { month: "2025-07", total_co2_kg: 13800 },
    { month: "2025-08", total_co2_kg: 13200 },
    { month: "2025-09", total_co2_kg: 14150 },
    { month: emissions?.month || MONTH, total_co2_kg: emissions?.total_co2_kg || 0 },
  ]), [emissions, MONTH]);

  const { pct, insightText, scenario } = useMemo(() => {
    const thisMonth = historyData[historyData.length - 1]?.total_co2_kg || 0;
    const prevMonth = historyData[historyData.length - 2]?.total_co2_kg || 0;
    const diff = thisMonth - prevMonth;
    const pct = prevMonth > 0 ? (diff / prevMonth) * 100 : 0;

    function buildInsight(topSourceRow, pctChange) {
      if (!topSourceRow) return "Bu ay için kayda değer bir kaynak bulunamadı.";
      const trendPart = pctChange > 5
        ? "geçen aya göre belirgin bir artış var."
        : pctChange < -5
        ? "geçen aya göre anlamlı bir düşüş var."
        : "geçen aya göre büyük bir değişim yok.";
      return `${topSourceRow.energy_type} bu ay en yüksek paya sahip kaynak. Ayrıca ${trendPart}`;
    }

    function simulateGreenScenario(list) {
      const electric = list.find((x) => x.energy_type?.toLowerCase().includes("elect"));
      if (!electric) return { savedKg: 0, newTotal: emissions?.total_co2_kg || 0 };
      const savedKg = electric.co2_kg * 0.2;
      const newTotal = (emissions?.total_co2_kg || 0) - savedKg;
      return { savedKg, newTotal };
    }

    return {
      pct,
      insightText: buildInsight(topSource, pct),
      scenario: simulateGreenScenario(byEnergy)
    };
  }, [historyData, topSource, byEnergy, emissions]);

  // Memoized theme classes
  const cardClass = useMemo(() =>
    themeDark
      ? "rounded-lg border border-slate-700 bg-slate-800 text-slate-100 shadow-sm transition-colors"
      : "rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors",
  [themeDark]);

  const cardHeaderText = useMemo(() =>
    themeDark
      ? "text-[11px] font-medium uppercase tracking-wide text-slate-400"
      : "text-[11px] font-medium uppercase tracking-wide text-slate-500",
  [themeDark]);

  const containerClass = useMemo(() =>
    `min-h-screen p-4 sm:p-6 transition-colors ${
      themeDark 
        ? "bg-slate-900 text-slate-100" 
        : "bg-gradient-to-b from-white to-emerald-50 text-slate-700"
    }`,
  [themeDark]);

  // ==== CALLBACKS ====
  const downloadCSV = useCallback(() => {
    if (!byEnergy || byEnergy.length === 0) {
      alert("İndirilecek veri yok");
      return;
    }

    try {
      const rows = [
        ["Enerji Tipi", "CO2 (kg)"],
        ...byEnergy.map((r) => [r.energy_type || "Bilinmeyen", r.co2_kg || 0])
      ];
      const BOM = "\uFEFF";
      const csvContent = "data:text/csv;charset=utf-8," + BOM +
        rows.map((r) => r.map(cell => `"${cell}"`).join(";")).join("\n");

      const a = document.createElement("a");
      a.setAttribute("href", encodeURI(csvContent));
      a.setAttribute("download", `carbonai_${facility?.name || "tesis"}_${emissions?.month || MONTH}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("CSV indirme hatası:", err);
      alert("CSV indirilemedi");
    }
  }, [byEnergy, facility, emissions, MONTH]);

  const handleSaveNote = useCallback(() => {
    const ts = new Date().toLocaleString("tr-TR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
    const text = "Elektrik tüketiminde talep yönetimi: Pik saatlerde gereksiz yükleri kapat, yüksek yükleri vardiya dışına kaydır, LED dönüşümü değerlendir.";

    setNotes((prev) => [{ text, ts }, ...prev]);
    setActionPlanned(true);
    setShowActionDetails(false);

    if (setShowNotesPanel && typeof setShowNotesPanel === 'function') {
      setShowNotesPanel(true);
    }
  }, [setShowNotesPanel]);

  const handleDeleteNote = useCallback((idx) => {
    setNotes((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  const handleChartTypeChange = useCallback((type) => {
    setChartType(type);
  }, []);

  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  const handleCloseNotes = useCallback(() => {
    if (setShowNotesPanel && typeof setShowNotesPanel === 'function') {
      setShowNotesPanel(false);
    }
  }, [setShowNotesPanel]);

  // ==== RENDER ====
  if (loading) {
    return (
      <div
        className={containerClass}
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <div className={"text-sm " + (themeDark ? "text-slate-400" : "text-slate-500")}>
            Yükleniyor...
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className={containerClass}
        role="alert"
        aria-live="assertive"
      >
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <div className="text-center max-w-md">
            <div className="text-red-600 text-5xl mb-4">⚠️</div>
            <h2 className="text-lg font-semibold mb-2">Bir Hata Oluştu</h2>
            <p className="text-sm mb-4 text-slate-500">{error}</p>
            <button
              onClick={handleRetry}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
            >
              Yeniden Dene
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <header className="mb-4">
        <div className="text-[11px] font-medium tracking-wide uppercase flex flex-wrap gap-2 items-center">
          <span className={themeDark ? "text-slate-300" : "text-slate-700"}>
            {facility?.name || "Tesis"}
          </span>
          <span className={themeDark ? "text-slate-500" : "text-slate-500"}>
            {emissions?.month || MONTH}
          </span>
          <span className={"text-[10px] font-semibold rounded px-2 py-[2px] border leading-none " + (themeDark ? "text-emerald-300 bg-emerald-900/30 border-emerald-700" : "text-emerald-700 bg-emerald-100 border-emerald-300")}>
            v1.3 (Beta)
          </span>
        </div>
        <h1 className={"text-[13px] font-semibold leading-snug mt-2 " + (themeDark ? "text-white" : "text-slate-900")}>
          Karbon Emisyon Özeti
        </h1>
        <p className={"text-[11px] leading-relaxed max-w-2xl " + (themeDark ? "text-slate-400" : "text-slate-600")}>
          Bu ekran tesis bazlı CO₂ ayak izinizi özetler. Aşağıda trend, dağılım ve önerilen aksiyonları görürsünüz.
        </p>
      </header>

      <section className="grid md:grid-cols-4 gap-4 mb-4">
        <div className={cardClass}>
          <div className="p-4 flex flex-col gap-2 text-sm">
            <div className={cardHeaderText}>Toplam CO₂ (kg)</div>
            <div className="text-2xl font-semibold">
              {emissions?.total_co2_kg?.toLocaleString("tr-TR") ?? "-"}
            </div>
            <div className="text-[10px] text-slate-500 flex flex-col gap-1">
              <span>{emissions?.month || MONTH} ayı toplamı</span>
              <span className={`inline-flex w-fit items-center rounded border px-1.5 py-[1px] text-[10px] font-semibold ${
                pct > 0 
                  ? "border-red-300 bg-red-50 text-red-700"
                  : pct < 0
                  ? "border-emerald-300 bg-emerald-50 text-emerald-700"
                  : "border-slate-300 bg-slate-50 text-slate-700"
              }`}>
                {pct > 0 ? `${pct.toFixed(1)}% ↑` : pct < 0 ? `${Math.abs(pct).toFixed(1)}% ↓` : "0%"}
              </span>
            </div>
          </div>
        </div>

        <div className={cardClass}>
          <div className="p-4 flex flex-col gap-2 text-sm">
            <div className={cardHeaderText}>En yüksek kaynak</div>
            <div className="text-[13px] font-semibold">
              {topSource?.energy_type || "-"}
            </div>
            <div className="text-[11px] text-slate-500">
              {topSource ? `${topSource.co2_kg?.toLocaleString("tr-TR")} kg CO₂` : "—"}
              <br />
              Bu, en çok CO₂ salan tüketim türünü gösterir.
            </div>
          </div>
        </div>

        <div className={cardClass}>
          <div className="p-4 flex flex-col gap-2 text-sm">
            <div className={cardHeaderText}>ESG / Raporlama</div>
            <div className="text-[13px] font-semibold">CO₂ veriniz kaydedildi</div>
            <div className="text-[11px] text-slate-500">
              Bu ayın emisyon verisi denetim ve raporlama için arşivlenebilir durumda.
            </div>
            <button
              className={"mt-2 inline-flex items-center justify-center rounded border px-2 py-1 text-[11px] font-medium transition-colors " + (themeDark ? "border-slate-600 bg-slate-700 text-slate-200 hover:bg-slate-600" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50")}
              aria-label="ESG detaylarını görüntüle"
            >
              Detaylı ESG Gör
            </button>
          </div>
        </div>

        <div className={cardClass}>
          <div className="p-4 flex flex-col gap-2 text-sm">
            <div className={cardHeaderText}>
              Emisyon Dağılımı
              <span className="ml-2 text-[10px] font-normal text-slate-400">
                Toplam: {emissions?.total_co2_kg?.toLocaleString("tr-TR") ?? "-"} kg
              </span>
            </div>
            <div className="flex items-center justify-center h-24">
              <EmissionsChart
                ref={pieChartRef}
                data={chartData}
                themeDark={themeDark}
                chartType={chartType}
              />
            </div>
            <div className="flex flex-wrap gap-1" role="group" aria-label="Grafik tipi seçimi">
              {[
                { key: "donut", label: "Dağılım (Donut)" },
                { key: "bar", label: "Bar Grafiği" },
                { key: "line", label: "Çizgi Grafiği" },
                { key: "area", label: "Alan Grafiği" }
              ].map((btn) => (
                <button
                  key={btn.key}
                  onClick={() => handleChartTypeChange(btn.key)}
                  className={"px-2 py-[2px] rounded border text-[10px] font-medium transition-colors " + (chartType === btn.key ? (themeDark ? "bg-slate-100 text-slate-900 border-slate-200" : "bg-slate-900 text-white border-slate-900") : themeDark ? "border-slate-600 text-slate-300 hover:bg-slate-700 hover:text-white" : "border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-900")}
                  aria-pressed={chartType === btn.key}
                  aria-label={`${btn.label} görünümüne geç`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="grid lg:grid-cols-2 gap-4 mb-4">
        <div className={cardClass}>
          <div className="p-4 flex flex-col gap-2 text-sm">
            <div className={cardHeaderText}>Aylık Trend</div>
            <div className="h-40">
              <TrendChart
                ref={trendChartRef}
                data={historyData}
                themeDark={themeDark}
                height={160}
              />
            </div>
            <div className="text-[10px] text-slate-500">
              Son 5 ay CO₂ toplamı (kg).
            </div>
          </div>
        </div>

        <div className={cardClass}>
          <div className="p-4 flex flex-col gap-3 text-sm">
            <div className={cardHeaderText}>İçgörü</div>
            <h3 className="text-[13px] font-semibold">Aylık trend yorumu</h3>
            <div className="text-[11px] leading-relaxed text-slate-500">
              {insightText}
            </div>
            <div className={"rounded border text-[11px] leading-relaxed p-3 " + (themeDark ? "bg-slate-800 border-slate-600 text-slate-300" : "bg-emerald-50 border-emerald-200 text-slate-700")}>
              <div className="text-[10px] font-semibold uppercase tracking-wide mb-1">
                Senaryo (%20 yenilenebilir elektrik)
              </div>
              <div>
                Tahmini tasarruf: <strong>{scenario.savedKg.toFixed(1)} kg CO₂</strong>
              </div>
              <div>
                Yeni toplam: <strong>{scenario.newTotal.toLocaleString("tr-TR")} kg CO₂</strong>
              </div>
            </div>
            <div className={"rounded border p-3 flex flex-col gap-2 " + (themeDark ? "bg-slate-800 border-slate-600" : "bg-amber-50 border-amber-200")}>
              <div className="flex flex-wrap items-center gap-2 text-[10px] font-semibold">
                <span className={"inline-flex items-center rounded px-1.5 py-[2px] leading-none border " + (themeDark ? "text-amber-300 border-amber-400/30 bg-amber-900/20" : "text-amber-700 border-amber-300 bg-amber-100")}>
                  Önerilen Aksiyon
                </span>
                {actionPlanned && (
                  <span className={"inline-flex items-center rounded px-1.5 py-[2px] leading-none border " + (themeDark ? "text-emerald-300 border-emerald-400/30 bg-emerald-900/20" : "text-emerald-700 border-emerald-300 bg-emerald-100")}>
                    ✔ Planlandı
                  </span>
                )}
                {showActionDetails && (
                  <span className={"inline-flex items-center rounded px-1.5 py-[2px] leading-none border " + (themeDark ? "text-slate-300 border-slate-500 bg-slate-700" : "text-slate-700 border-slate-300 bg-white")}>
                    İncele
                  </span>
                )}
              </div>
              <h4 className="text-[12px] font-semibold">
                Elektrik tüketiminde talep yönetimi
              </h4>
              <p className="text-[11px] leading-relaxed text-slate-600">
                Pik saatlerde gereksiz yükleri kapat, yüksek yükleri vardiya dışına kaydır, LED dönüşümü değerlendir.
              </p>
              <div className="flex flex-wrap gap-2 text-[11px]">
                {!showActionDetails && (
                  <button
                    className={"rounded border px-2 py-[3px] font-medium transition-colors " + (themeDark ? "border-slate-600 bg-slate-700 text-slate-200 hover:bg-slate-600" : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50")}
                    onClick={() => setShowActionDetails(true)}
                    aria-label="Aksiyonu incele"
                  >
                    İncele
                  </button>
                )}
                {!actionPlanned && (
                  <button
                    className={"rounded border px-2 py-[3px] font-medium transition-colors " + (themeDark ? "border-emerald-700 bg-emerald-600 text-white hover:bg-emerald-700" : "border-emerald-700/20 bg-emerald-600 text-white hover:bg-emerald-700")}
                    onClick={handleSaveNote}
                    aria-label="Aksiyonu not al"
                  >
                    Tamam, not al
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {opsSummary && (
        <section className={cardClass + " mb-4"}>
          <div className="p-4 flex flex-col gap-4 text-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className={cardHeaderText}>Operasyon Özeti</div>
                <h2 className="text-[13px] font-semibold">Günlük saha / filo / insanlar</h2>
                <p className={"text-[11px] leading-relaxed " + (themeDark ? "text-slate-400" : "text-slate-500")}>
                  Bu blok; araç km, personele ait ulaşım modu, makineler ve yemekhane kaynaklı CO₂'yi özetler.
                </p>
              </div>
              <Link
                to="/operations"
                className={"inline-flex items-center rounded border px-2 py-1 text-[11px] font-medium self-start transition-colors " + (themeDark ? "border-slate-600 bg-slate-700 text-slate-200 hover:bg-slate-600" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50")}
                aria-label="Operasyon detaylarına git"
              >
                Detaya Git →
              </Link>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-[11px]">
              <div className={"rounded border p-3 transition-colors " + (themeDark ? "bg-slate-800 border-slate-600" : "bg-white border-slate-200")}>
                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-1">
                  Filo (Şirket Araçları)
                </div>
                <div className="text-[13px] font-semibold leading-snug">
                  {opsSummary.fleet_daily_km || 0} km / gün
                </div>
                <div className="text-slate-500">
                  ~{opsSummary.fleet_co2_kg || 0} kg CO₂
                </div>
                <div className="mt-1 text-slate-500">
                  Güzergâh takibi, mesafe trendi
                </div>
              </div>

              <div className={"rounded border p-3 transition-colors " + (themeDark ? "bg-slate-800 border-slate-600" : "bg-white border-slate-200")}>
                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-1">
                  Personel Ulaşımı
                </div>
                <div className="text-[13px] font-semibold leading-snug">
                  {opsSummary.commute_breakdown?.personel_sayisi || 0} kişi
                </div>
                <div className="text-slate-500">
                  Servis %{Math.round((opsSummary.commute_breakdown?.servis_yuzde || 0) * 100)},
                  Toplu taşıma %{Math.round((opsSummary.commute_breakdown?.toplu_tasima_yuzde || 0) * 100)},
                  Şahsi araç %{Math.round((opsSummary.commute_breakdown?.sahsi_arac_yuzde || 0) * 100)}
                </div>
                <div className="mt-1 text-slate-500">
                  ~{opsSummary.commute_breakdown?.tahmini_co2_kg || 0} kg CO₂ / gün
                </div>
              </div>

              <div className={"rounded border p-3 transition-colors " + (themeDark ? "bg-slate-800 border-slate-600" : "bg-white border-slate-200")}>
                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-1">
                  Makineler
                </div>
                <div className="text-[13px] font-semibold leading-snug">
                  {opsSummary.factory_machines?.aktif_makine_sayisi || 0} aktif
                </div>
                <div className="text-slate-500">
                  {opsSummary.factory_machines?.gunluk_elektrik_kwh || 0} kWh/gün
                </div>
                <div className="mt-1 text-slate-500">
                  ~{opsSummary.factory_machines?.tahmini_co2_kg || 0} kg CO₂
                </div>
              </div>

              <div className={"rounded border p-3 transition-colors " + (themeDark ? "bg-slate-800 border-slate-600" : "bg-white border-slate-200")}>
                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-1">
                  Yemekhane
                </div>
                <div className="text-[13px] font-semibold leading-snug">
                  {opsSummary.canteen?.bugun_menu || "-"}
                </div>
                <div className="mt-1 text-slate-500">
                  ~{opsSummary.canteen?.tahmini_co2_kg || 0} kg CO₂
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {topEmployees.length > 0 && (
        <section className={cardClass + " mb-4"}>
          <div className="p-4 text-sm flex flex-col gap-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="flex flex-col">
                <div className={cardHeaderText}>Personel Etkisi</div>
                <h2 className="text-[13px] font-semibold leading-snug">
                  En yüksek ilk 5 çalışan (günlük CO₂)
                </h2>
                <p className={"text-[11px] leading-relaxed " + (themeDark ? "text-slate-400" : "text-slate-500")}>
                  Ulaşım kaynaklı tahmini ayak izi. Detay için Operasyon&apos;a gidin.
                </p>
              </div>
              <Link
                to="/operations"
                className={"inline-flex items-center rounded border px-2 py-1 text-[11px] font-medium self-start transition-colors " + (themeDark ? "border-slate-600 bg-slate-700 text-slate-200 hover:bg-slate-600" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50")}
                aria-label="Operasyon sayfasına git"
              >
                Operasyon →
              </Link>
            </div>

            <div className={"overflow-x-auto rounded border " + (themeDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white")}>
              <table className="w-full text-[12px]">
                <thead className={themeDark ? "bg-slate-800 text-slate-300" : "bg-slate-50 text-slate-600"}>
                  <tr>
                    <th scope="col" className="text-left font-medium px-3 py-2 border-b border-slate-600/20">
                      Çalışan
                    </th>
                    <th scope="col" className="text-left font-medium px-3 py-2 border-b border-slate-600/20">
                      Ulaşım
                    </th>
                    <th scope="col" className="text-left font-medium px-3 py-2 border-b border-slate-600/20">
                      km/gün
                    </th>
                    <th scope="col" className="text-left font-medium px-3 py-2 border-b border-slate-600/20">
                      CO₂ (kg/gün)
                    </th>
                  </tr>
                </thead>
                <tbody className={themeDark ? "text-slate-100" : "text-slate-700"}>
                  {topEmployees.map((emp, i) => (
                    <tr
                      key={emp.employee_id}
                      className={themeDark ? "border-t border-slate-600/20" : "border-t border-slate-200"}
                    >
                      <td className="px-3 py-2 font-medium text-[12px]">
                        <span
                          className={"inline-flex items-center rounded px-1.5 py-[1px] mr-2 text-[10px] font-semibold border " + (
                            i === 0
                              ? (themeDark ? "bg-red-900/30 border-red-700 text-red-300" : "bg-red-100 border-red-300 text-red-700")
                              : i === 1
                              ? (themeDark ? "bg-amber-900/20 border-amber-600 text-amber-300" : "bg-amber-100 border-amber-300 text-amber-700")
                              : (themeDark ? "bg-slate-700 border-slate-500 text-slate-200" : "bg-slate-100 border-slate-300 text-slate-700")
                          )}
                          aria-label={`Sıralama: ${i + 1}`}
                        >
                          {i + 1}
                        </span>
                        {emp.name}
                      </td>
                      <td className="px-3 py-2">{emp.commute_mode}</td>
                      <td className="px-3 py-2">{emp.daily_km} km</td>
                      <td className="px-3 py-2 font-semibold">{emp.co2_kg.toFixed(1)} kg</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className={"text-[10px] text-center " + (themeDark ? "text-slate-600" : "text-slate-400")}>
              Gösterilen değerler tahmindir.
            </div>
          </div>
        </section>
      )}

      <section className={cardClass}>
        <div className="p-4 text-sm">
          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
            <div className="flex flex-col">
              <h2 className="text-[13px] font-semibold">Kaynağa Göre Dağılım</h2>
              <div className={cardHeaderText + " normal-case"}>Enerji tipi bazında CO₂</div>
            </div>
            <button
              onClick={downloadCSV}
              className={"text-[11px] rounded border px-2 py-1 font-medium self-start transition-colors " + (themeDark ? "border-slate-600 bg-slate-700 text-slate-200 hover:bg-slate-600" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50")}
              aria-label="CSV dosyası indir"
            >
              CSV İndir
            </button>
          </div>

          <div className={"overflow-x-auto rounded border " + (themeDark ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-white")}>
            <table className="w-full text-[12px]">
              <thead className={themeDark ? "bg-slate-800 text-slate-300" : "bg-slate-50 text-slate-600"}>
                <tr>
                  <th scope="col" className="text-left font-medium px-3 py-2 border-b border-slate-600/20">
                    Enerji Tipi
                  </th>
                  <th scope="col" className="text-left font-medium px-3 py-2 border-b border-slate-600/20">
                    CO₂ (kg)
                  </th>
                </tr>
              </thead>
              <tbody className={themeDark ? "text-slate-100" : "text-slate-700"}>
                {byEnergy.length > 0 ? (
                  byEnergy.map((row, idx) => (
                    <tr
                      key={idx}
                      className={themeDark ? "border-t border-slate-600/20" : "border-t border-slate-200"}
                    >
                      <td className="px-3 py-2">{row.energy_type || "Bilinmeyen"}</td>
                      <td className="px-3 py-2">{(row.co2_kg || 0).toLocaleString("tr-TR")} kg</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="px-3 py-4 text-center text-slate-500">
                      Veri bulunamadı
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className={"text-[10px] text-center mt-6 " + (themeDark ? "text-slate-600" : "text-slate-400")}>
            CarbonAI • internal demo
          </div>
        </div>
      </section>

      {showNotesPanel && (
        <aside
          className={"fixed right-4 z-[60] w-72 max-h-[60vh] overflow-y-auto rounded-xl border shadow-xl transition-all " + (themeDark ? "border-slate-600 bg-slate-800 text-slate-100 shadow-slate-900/40" : "border-slate-300 bg-white text-slate-800 shadow-slate-900/20")}
          style={{ top: "4rem" }}
          role="complementary"
          aria-label="Notlar paneli"
        >
          <div className={"flex items-center justify-between px-4 py-3 border-b " + (themeDark ? "border-slate-700 text-slate-100" : "border-slate-200 text-slate-800")}>
            <div className="text-sm font-semibold flex items-center gap-2">
              <span>Notlarım</span>
              {notes.length > 0 && (
                <span
                  className="inline-flex items-center justify-center text-[10px] font-semibold rounded-full px-2 py-[2px] border shadow bg-amber-500 text-white border-amber-600"
                  aria-label={`${notes.length} not`}
                >
                  {notes.length}
                </span>
              )}
            </div>
            <button
              onClick={handleCloseNotes}
              className={"text-[11px] rounded-md px-2 py-[2px] leading-none border font-medium transition-colors " + (themeDark ? "text-slate-300 hover:text-white border-slate-600 bg-slate-700 hover:bg-slate-600" : "text-slate-500 hover:text-slate-700 border-slate-300 bg-white hover:bg-slate-50")}
              aria-label="Notlar panelini kapat"
            >
              Kapat
            </button>
          </div>

          {notes.length === 0 ? (
            <div className={"px-4 py-4 text-[12px] " + (themeDark ? "text-slate-400" : "text-slate-500")}>
              Henüz not yok.
            </div>
          ) : (
            <ul
              className={"text-[12px] divide-y " + (themeDark ? "divide-slate-700 text-slate-100" : "divide-slate-200 text-slate-800")}
              role="list"
            >
              {notes.map((n, i) => (
                <li key={i} className="px-4 py-3 leading-relaxed flex flex-col gap-2">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1">{n.text}</div>
                    <button
                      onClick={() => handleDeleteNote(i)}
                      className="text-[10px] bg-red-500 text-white px-2 py-[2px] rounded border border-red-600 hover:bg-red-600 transition-colors"
                      aria-label={`Notu sil: ${n.text.substring(0, 30)}...`}
                    >
                      Sil
                    </button>
                  </div>
                  <time className={"text-[10px] " + (themeDark ? "text-slate-500" : "text-slate-500")}>
                    Kaydedildi: {n.ts}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </aside>
      )}
    </div>
  );
}

export default Dashboard;