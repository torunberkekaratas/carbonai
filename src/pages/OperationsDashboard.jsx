// src/pages/OperationsDashboard.jsx
import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import {
  fetchOperationsSummary,
  fetchEmployeeCarbon,
} from "../api.js";

/**
 * OperationsDashboard - Operasyonel karbon etkisi detay sayfası
 * @param {boolean} themeDark - Koyu tema aktif mi?
 */
export default function OperationsDashboard({ themeDark = false }) {
  const FACILITY_ID = 1;
  const MONTH = "2025-10";

  const [loading, setLoading] = useState(true);
  const [opsSummary, setOpsSummary] = useState(null);
  const [people, setPeople] = useState([]);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState("co2_kg");
  const [sortDirection, setSortDirection] = useState("desc");

  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    async function run() {
      try {
        const [ops, emp] = await Promise.all([
          fetchOperationsSummary(FACILITY_ID, MONTH),
          fetchEmployeeCarbon(FACILITY_ID),
        ]);

        if (!isMountedRef.current) return;

        // Sort by co2 desc initially
        emp.sort((a, b) => b.co2_kg - a.co2_kg);

        setOpsSummary(ops);
        setPeople(emp);
      } catch (err) {
        console.error("Operasyon verisi çekme hatası:", err);
        if (!isMountedRef.current) return;
        setError(`Veriler yüklenemedi: ${err.message || 'Bilinmeyen hata'}`);
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    }
    run();

    return () => {
      isMountedRef.current = false;
    };
  }, [FACILITY_ID, MONTH]);

  // Memoized theme classes
  const pageBg = useMemo(
    () =>
      themeDark
        ? "bg-slate-900 text-slate-100"
        : "bg-gradient-to-b from-white to-emerald-50 text-slate-700",
    [themeDark]
  );

  const cardClass = useMemo(
    () =>
      themeDark
        ? "rounded-lg border border-slate-700 bg-slate-800 text-slate-100 shadow-sm transition-colors"
        : "rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition-colors",
    [themeDark]
  );

  const headerText = useMemo(
    () =>
      themeDark
        ? "text-[11px] font-medium uppercase tracking-wide text-slate-400"
        : "text-[11px] font-medium uppercase tracking-wide text-slate-500",
    [themeDark]
  );

  // Filtered and sorted people
  const filteredPeople = useMemo(() => {
    let result = [...people];

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (p) =>
          p.name?.toLowerCase().includes(term) ||
          p.department?.toLowerCase().includes(term) ||
          p.commute_mode?.toLowerCase().includes(term)
      );
    }

    // Sort
    result.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      // Handle string sorting
      if (typeof aVal === "string") {
        aVal = aVal.toLowerCase();
        bVal = bVal.toLowerCase();
      }

      if (sortDirection === "asc") {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      } else {
        return aVal < bVal ? 1 : aVal > bVal ? -1 : 0;
      }
    });

    return result;
  }, [people, searchTerm, sortField, sortDirection]);

  // Stats calculations
  const stats = useMemo(() => {
    if (!people.length) return null;

    const totalCo2 = people.reduce((sum, p) => sum + p.co2_kg, 0);
    const avgCo2 = totalCo2 / people.length;
    const maxCo2 = Math.max(...people.map((p) => p.co2_kg));
    const minCo2 = Math.min(...people.map((p) => p.co2_kg));

    // Commute mode breakdown
    const modeCount = {};
    people.forEach((p) => {
      modeCount[p.commute_mode] = (modeCount[p.commute_mode] || 0) + 1;
    });

    return {
      totalCo2,
      avgCo2,
      maxCo2,
      minCo2,
      modeCount,
    };
  }, [people]);

  // Callbacks
  const handleSort = useCallback(
    (field) => {
      if (sortField === field) {
        setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortDirection("desc");
      }
    },
    [sortField]
  );

  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  const downloadCSV = useCallback(() => {
    if (!filteredPeople.length) {
      alert("İndirilecek veri yok");
      return;
    }

    try {
      const rows = [
        ["Çalışan", "Departman", "Ulaşım", "Günlük km", "CO₂ (kg/gün)"],
        ...filteredPeople.map((p) => [
          p.name,
          p.department,
          p.commute_mode,
          p.daily_km,
          p.co2_kg.toFixed(2),
        ]),
      ];

      const BOM = "\uFEFF";
      const csvContent =
        "data:text/csv;charset=utf-8," +
        BOM +
        rows.map((r) => r.map((cell) => `"${cell}"`).join(";")).join("\n");

      const a = document.createElement("a");
      a.setAttribute("href", encodeURI(csvContent));
      a.setAttribute(
        "download",
        `operasyon_personel_${MONTH}.csv`
      );
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } catch (err) {
      console.error("CSV indirme hatası:", err);
      alert("CSV indirilemedi");
    }
  }, [filteredPeople, MONTH]);

  // Loading state
  if (loading) {
    return (
      <div className={`min-h-screen p-4 sm:p-6 ${pageBg}`}>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
          <div
            className={
              "text-sm " + (themeDark ? "text-slate-400" : "text-slate-500")
            }
          >
            Yükleniyor...
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`min-h-screen p-4 sm:p-6 ${pageBg}`}>
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
          <div className="text-red-600 text-5xl">⚠️</div>
          <h2 className="text-lg font-semibold">Bir Hata Oluştu</h2>
          <p className="text-sm text-slate-500">{error}</p>
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
          >
            Yeniden Dene
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen p-4 sm:p-6 ${pageBg}`}>
      {/* SAYFA ÜSTÜ */}
      <header className="mb-6">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
          <div>
            <div className="text-[11px] font-medium tracking-wide uppercase flex flex-wrap gap-2 items-center">
              <Link
                to="/"
                className={`hover:underline transition-colors ${
                  themeDark
                    ? "text-slate-400 hover:text-slate-200"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                ← Dashboard
              </Link>
              <span className={themeDark ? "text-slate-600" : "text-slate-400"}>
                /
              </span>
              <span className={themeDark ? "text-slate-300" : "text-slate-700"}>
                Operasyon
              </span>
              <span className={themeDark ? "text-slate-500" : "text-slate-500"}>
                {MONTH}
              </span>
            </div>

            <h1
              className={
                "text-[13px] font-semibold leading-snug mt-2 " +
                (themeDark ? "text-white" : "text-slate-900")
              }
            >
              Günlük Saha ve Personel Karbon Etkisi
            </h1>
            <p
              className={
                "text-[11px] leading-relaxed max-w-2xl " +
                (themeDark ? "text-slate-400" : "text-slate-600")
              }
            >
              Filo km, personel ulaşım modu, aktif makineler ve yemekhane kaynaklı
              ayak izi burada detaylı.
            </p>
          </div>

          {stats && (
            <div
              className={`px-4 py-2 rounded-lg border text-center ${
                themeDark
                  ? "bg-slate-800 border-slate-600"
                  : "bg-white border-slate-200"
              }`}
            >
              <div className="text-[10px] uppercase tracking-wide text-slate-500">
                Toplam Personel CO₂
              </div>
              <div className="text-xl font-bold text-emerald-600">
                {stats.totalCo2.toFixed(1)}
              </div>
              <div className="text-[10px] text-slate-500">kg/gün</div>
            </div>
          )}
        </div>
      </header>

      {/* ÖZET BLOKLAR */}
      {opsSummary && (
        <section className={cardClass + " mb-6"}>
          <div className="p-4 flex flex-col gap-4 text-sm">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className={headerText}>Operasyon Özeti</div>
                <div className="text-[13px] font-semibold">
                  Filo / Personel / Üretim / Yemekhane
                </div>
              </div>

              <div
                className={
                  "text-[10px] font-medium rounded px-2 py-[2px] border leading-none " +
                  (themeDark
                    ? "text-emerald-300 bg-emerald-900/30 border-emerald-700"
                    : "text-emerald-700 bg-emerald-100 border-emerald-300")
                }
              >
                İç Kullanım
              </div>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 text-[11px]">
              {/* Filo */}
              <div
                className={
                  "rounded border p-3 transition-colors " +
                  (themeDark
                    ? "bg-slate-800 border-slate-600"
                    : "bg-white border-slate-200")
                }
              >
                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-1">
                  🚗 Filo (Şirket Araçları)
                </div>
                <div className="text-[13px] font-semibold leading-snug">
                  {opsSummary.fleet_daily_km} km / gün
                </div>
                <div className="text-slate-500">
                  ~{opsSummary.fleet_co2_kg} kg CO₂
                </div>
                <div className="mt-1 text-slate-500">Rota & km takibi</div>
              </div>

              {/* Personel ulaşım */}
              <div
                className={
                  "rounded border p-3 transition-colors " +
                  (themeDark
                    ? "bg-slate-800 border-slate-600"
                    : "bg-white border-slate-200")
                }
              >
                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-1">
                  👥 Personel Ulaşımı
                </div>

                <div className="text-[13px] font-semibold leading-snug">
                  {opsSummary.commute_breakdown.personel_sayisi} kişi
                </div>

                <div className="text-slate-500">
                  Servis %
                  {Math.round(opsSummary.commute_breakdown.servis_yuzde * 100)}, Toplu
                  taşıma %{" "}
                  {Math.round(
                    opsSummary.commute_breakdown.toplu_tasima_yuzde * 100
                  )}
                  , Şahsi araç %{" "}
                  {Math.round(opsSummary.commute_breakdown.sahsi_arac_yuzde * 100)}
                </div>

                <div className="mt-1 text-slate-500">
                  ~{opsSummary.commute_breakdown.tahmini_co2_kg} kg CO₂ / gün
                </div>
              </div>

              {/* Makineler */}
              <div
                className={
                  "rounded border p-3 transition-colors " +
                  (themeDark
                    ? "bg-slate-800 border-slate-600"
                    : "bg-white border-slate-200")
                }
              >
                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-1">
                  🏭 Makineler
                </div>
                <div className="text-[13px] font-semibold leading-snug">
                  {opsSummary.factory_machines.aktif_makine_sayisi} aktif
                </div>
                <div className="text-slate-500">
                  {opsSummary.factory_machines.gunluk_elektrik_kwh} kWh/gün
                </div>
                <div className="mt-1 text-slate-500">
                  ~{opsSummary.factory_machines.tahmini_co2_kg} kg CO₂
                </div>
              </div>

              {/* Yemekhane */}
              <div
                className={
                  "rounded border p-3 transition-colors " +
                  (themeDark
                    ? "bg-slate-800 border-slate-600"
                    : "bg-white border-slate-200")
                }
              >
                <div className="text-[10px] font-semibold uppercase tracking-wide text-slate-500 mb-1">
                  🍽️ Yemekhane
                </div>
                <div className="text-[13px] font-semibold leading-snug">
                  {opsSummary.canteen.bugun_menu}
                </div>
                <div className="mt-1 text-slate-500">
                  ~{opsSummary.canteen.tahmini_co2_kg} kg CO₂
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* İSTATİSTİKLER */}
      {stats && (
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className={cardClass + " p-4"}>
            <div className={headerText}>Ortalama CO₂</div>
            <div className="text-2xl font-bold text-emerald-600">
              {stats.avgCo2.toFixed(1)}
            </div>
            <div className="text-[10px] text-slate-500">kg/gün/kişi</div>
          </div>

          <div className={cardClass + " p-4"}>
            <div className={headerText}>En Yüksek</div>
            <div className="text-2xl font-bold text-red-600">
              {stats.maxCo2.toFixed(1)}
            </div>
            <div className="text-[10px] text-slate-500">kg/gün</div>
          </div>

          <div className={cardClass + " p-4"}>
            <div className={headerText}>En Düşük</div>
            <div className="text-2xl font-bold text-blue-600">
              {stats.minCo2.toFixed(1)}
            </div>
            <div className="text-[10px] text-slate-500">kg/gün</div>
          </div>

          <div className={cardClass + " p-4"}>
            <div className={headerText}>Toplam Personel</div>
            <div className="text-2xl font-bold">{people.length}</div>
            <div className="text-[10px] text-slate-500">kişi</div>
          </div>
        </section>
      )}

      {/* PERSONEL DETAY TABLOSU */}
      <section className={cardClass}>
        <div className="p-4 text-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <div className="text-[13px] font-semibold">Personel Karbon Etkisi</div>
              <div className={headerText + " normal-case"}>
                Günlük ulaşım bazlı tahmini CO₂
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {/* Search */}
              <input
                type="text"
                placeholder="Ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`px-3 py-1.5 rounded-lg border text-[12px] outline-none transition-colors ${
                  themeDark
                    ? "bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 focus:border-emerald-400"
                    : "bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-emerald-600"
                }`}
              />

              {/* CSV Download */}
              <button
                onClick={downloadCSV}
                className={`px-3 py-1.5 rounded-lg border text-[11px] font-medium transition-colors ${
                  themeDark
                    ? "border-slate-600 bg-slate-700 text-slate-200 hover:bg-slate-600"
                    : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                }`}
              >
                CSV İndir
              </button>
            </div>
          </div>

          <div
            className={
              "overflow-x-auto rounded border " +
              (themeDark
                ? "border-slate-700 bg-slate-800"
                : "border-slate-200 bg-white")
            }
          >
            <table className="w-full text-[12px]">
              <thead
                className={
                  themeDark
                    ? "bg-slate-800 text-slate-300"
                    : "bg-slate-50 text-slate-600"
                }
              >
                <tr>
                  <th
                    scope="col"
                    className="text-left font-medium px-3 py-2 border-b border-slate-600/20 cursor-pointer hover:bg-slate-700/50"
                    onClick={() => handleSort("name")}
                  >
                    Çalışan{" "}
                    {sortField === "name" && (sortDirection === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    scope="col"
                    className="text-left font-medium px-3 py-2 border-b border-slate-600/20 cursor-pointer hover:bg-slate-700/50"
                    onClick={() => handleSort("department")}
                  >
                    Departman{" "}
                    {sortField === "department" &&
                      (sortDirection === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    scope="col"
                    className="text-left font-medium px-3 py-2 border-b border-slate-600/20 cursor-pointer hover:bg-slate-700/50"
                    onClick={() => handleSort("commute_mode")}
                  >
                    Ulaşım{" "}
                    {sortField === "commute_mode" &&
                      (sortDirection === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    scope="col"
                    className="text-left font-medium px-3 py-2 border-b border-slate-600/20 cursor-pointer hover:bg-slate-700/50"
                    onClick={() => handleSort("daily_km")}
                  >
                    Günlük km{" "}
                    {sortField === "daily_km" &&
                      (sortDirection === "asc" ? "↑" : "↓")}
                  </th>
                  <th
                    scope="col"
                    className="text-left font-medium px-3 py-2 border-b border-slate-600/20 cursor-pointer hover:bg-slate-700/50"
                    onClick={() => handleSort("co2_kg")}
                  >
                    Tahmini CO₂ (kg){" "}
                    {sortField === "co2_kg" && (sortDirection === "asc" ? "↑" : "↓")}
                  </th>
                </tr>
              </thead>

              <tbody className={themeDark ? "text-slate-100" : "text-slate-700"}>
                {filteredPeople.length > 0 ? (
                  filteredPeople.map((p, i) => {
                    const originalIndex = people.findIndex(
                      (person) => person.employee_id === p.employee_id
                    );
                    return (
                      <tr
                        key={p.employee_id}
                        className={
                          themeDark
                            ? "border-t border-slate-600/20 hover:bg-slate-700/30"
                            : "border-t border-slate-200 hover:bg-slate-50"
                        }
                      >
                        <td className="px-3 py-2 font-medium text-[12px]">
                          {originalIndex < 3 && sortField === "co2_kg" && sortDirection === "desc" ? (
                            <span
                              className={
                                "inline-flex items-center rounded px-1.5 py-[1px] mr-2 text-[10px] font-semibold border " +
                                (originalIndex === 0
                                  ? themeDark
                                    ? "bg-red-900/30 border-red-700 text-red-300"
                                    : "bg-red-100 border-red-300 text-red-700"
                                  : originalIndex === 1
                                  ? themeDark
                                    ? "bg-amber-900/20 border-amber-600 text-amber-300"
                                    : "bg-amber-100 border-amber-300 text-amber-700"
                                  : themeDark
                                  ? "bg-slate-700 border-slate-500 text-slate-200"
                                  : "bg-slate-100 border-slate-300 text-slate-700")
                              }
                            >
                              {originalIndex + 1}
                            </span>
                          ) : null}
                          {p.name}
                        </td>
                        <td className="px-3 py-2">{p.department}</td>
                        <td className="px-3 py-2">{p.commute_mode}</td>
                        <td className="px-3 py-2">{p.daily_km} km</td>
                        <td className="px-3 py-2 font-semibold">
                          {p.co2_kg.toFixed(1)} kg
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-3 py-8 text-center text-slate-500"
                    >
                      {searchTerm
                        ? `"${searchTerm}" için sonuç bulunamadı`
                        : "Veri bulunamadı"}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div className="flex flex-wrap justify-between items-center gap-3 mt-4">
            <div
              className={
                "text-[10px] " + (themeDark ? "text-slate-600" : "text-slate-400")
              }
            >
              Personel bazlı veriler yalnızca iç kullanım amaçlıdır.
            </div>

            <div
              className={
                "text-[11px] font-medium " +
                (themeDark ? "text-slate-400" : "text-slate-500")
              }
            >
              Gösterilen: {filteredPeople.length} / {people.length} kişi
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}