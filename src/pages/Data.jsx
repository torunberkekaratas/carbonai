// src/pages/Data.jsx
import React, { useEffect, useState, useMemo, useCallback, useRef } from "react";
import { fetchDerivedMetrics, computeDerivedFallback } from "../api.js";

/**
 * Data - Türetilmiş metrikler ve istatistikler sayfası
 * @param {boolean} themeDark - Koyu tema aktif mi?
 */
export default function Data({ themeDark = false }) {
  const FACILITY_ID = 1;
  const MONTH = "2025-10";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    (async () => {
      setLoading(true);
      setError(null);

      try {
        let data;
        try {
          data = await fetchDerivedMetrics(FACILITY_ID, MONTH);
        } catch (apiError) {
          console.warn("fetchDerivedMetrics failed, using fallback:", apiError);
          // Backend türetilmiş endpoint'i daha hazır değilse fallback
          data = await computeDerivedFallback(FACILITY_ID, MONTH);
        }

        if (!isMountedRef.current) return;

        if (data && typeof data === 'object') {
          setMetrics(data);
        } else {
          throw new Error("Invalid data format");
        }
      } catch (err) {
        console.error("Data fetch error:", err);
        if (!isMountedRef.current) return;
        setError(`Veriler alınamadı: ${err.message || 'Bilinmeyen hata'}`);
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    })();

    return () => {
      isMountedRef.current = false;
    };
  }, [FACILITY_ID, MONTH]);

  // Memoized theme classes
  const cardClass = useMemo(
    () =>
      `rounded-xl border p-4 shadow-sm transition-colors ${
        themeDark
          ? "bg-slate-800 border-slate-700 text-slate-100"
          : "bg-white border-slate-200 text-slate-800"
      }`,
    [themeDark]
  );

  const containerClass = useMemo(
    () =>
      `min-h-screen p-4 sm:p-6 transition-colors ${
        themeDark
          ? "bg-slate-900 text-slate-100"
          : "bg-gradient-to-b from-white to-emerald-50 text-slate-700"
      }`,
    [themeDark]
  );

  const headerClass = useMemo(
    () => `text-sm font-medium uppercase tracking-wide mb-2 ${
      themeDark ? "text-slate-400" : "text-slate-500"
    }`,
    [themeDark]
  );

  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className={containerClass} role="status" aria-live="polite">
        <div className="max-w-7xl mx-auto">
          <div className={cardClass}>
            <div className="flex items-center gap-3">
              <div className="w-6 h-6 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
              <span>Veriler yükleniyor...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={containerClass} role="alert" aria-live="assertive">
        <div className="max-w-7xl mx-auto">
          <div className={cardClass}>
            <div className="flex flex-col items-center justify-center gap-4 py-8">
              <div className="text-red-600 text-5xl">⚠️</div>
              <h2 className="text-lg font-semibold">Veri Yüklenemedi</h2>
              <p className="text-sm text-slate-500">{error}</p>
              <button
                onClick={handleRetry}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium"
              >
                Yeniden Dene
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // No data state
  if (!metrics) {
    return (
      <div className={containerClass}>
        <div className="max-w-7xl mx-auto">
          <div className={cardClass}>
            <div className="text-center py-8 text-slate-500">
              Görüntülenecek veri bulunamadı.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={containerClass}>
      <div className="max-w-7xl mx-auto">
        {/* Page Header */}
        <header className="mb-6">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <h1 className={`text-lg font-semibold ${themeDark ? "text-white" : "text-slate-900"}`}>
              Türetilmiş Metrikler
            </h1>
            <span className={`text-xs px-2 py-1 rounded border ${
              themeDark 
                ? "bg-slate-700 border-slate-600 text-slate-300" 
                : "bg-slate-100 border-slate-300 text-slate-600"
            }`}>
              {MONTH}
            </span>
          </div>
          <p className={`text-sm ${themeDark ? "text-slate-400" : "text-slate-600"}`}>
            Tesis bazında hesaplanmış istatistikler ve özet veriler.
          </p>
        </header>

        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Machine Count */}
          <div className={cardClass}>
            <div className={headerClass}>
              <span className="inline-flex items-center gap-1">
                🏭 Makine Sayısı
              </span>
            </div>
            <div className="text-3xl font-bold mb-1">
              {metrics.machine_count?.toLocaleString("tr-TR") || 0}
            </div>
            <div className={`text-xs ${themeDark ? "text-slate-400" : "text-slate-500"}`}>
              Aktif: {metrics.active_machine_count?.toLocaleString("tr-TR") || 0}
              {metrics.machine_count > 0 && (
                <span className="ml-2">
                  ({((metrics.active_machine_count / metrics.machine_count) * 100).toFixed(1)}%)
                </span>
              )}
            </div>
          </div>

          {/* Vehicle Count */}
          <div className={cardClass}>
            <div className={headerClass}>
              <span className="inline-flex items-center gap-1">
                🚗 Araç Sayısı
              </span>
            </div>
            <div className="text-3xl font-bold mb-1">
              {metrics.vehicle_count?.toLocaleString("tr-TR") || 0}
            </div>
            <div className={`text-xs ${themeDark ? "text-slate-400" : "text-slate-500"}`}>
              Aylık km: {metrics.vehicle_km?.toLocaleString("tr-TR") || 0}
              {metrics.vehicle_count > 0 && (
                <span className="ml-2">
                  (~{Math.round(metrics.vehicle_km / metrics.vehicle_count)} km/araç)
                </span>
              )}
            </div>
          </div>

          {/* Personnel Count */}
          <div className={cardClass}>
            <div className={headerClass}>
              <span className="inline-flex items-center gap-1">
                👥 Personel
              </span>
            </div>
            <div className="text-3xl font-bold mb-1">
              {metrics.personnel_count?.toLocaleString("tr-TR") || 0}
            </div>
            <div className={`text-xs ${themeDark ? "text-slate-400" : "text-slate-500"}`}>
              Toplam çalışan sayısı
            </div>
          </div>

          {/* Machine Usage Hours */}
          <div className={cardClass}>
            <div className={headerClass}>
              <span className="inline-flex items-center gap-1">
                ⏱️ Makine Kullanım
              </span>
            </div>
            <div className="text-3xl font-bold mb-1">
              {metrics.machine_usage_hours?.toLocaleString("tr-TR") || 0}
            </div>
            <div className={`text-xs ${themeDark ? "text-slate-400" : "text-slate-500"}`}>
              Toplam saat
              {metrics.machine_usage_hours > 0 && metrics.active_machine_count > 0 && (
                <span className="ml-2">
                  (~{Math.round(metrics.machine_usage_hours / metrics.active_machine_count)} saat/makine)
                </span>
              )}
            </div>
          </div>

          {/* Headcount by Title */}
          <div className={cardClass + " md:col-span-2"}>
            <div className={headerClass}>
              <span className="inline-flex items-center gap-1">
                📊 Ünvan Dağılımı
              </span>
            </div>
            {metrics.headcount_by_title && Object.keys(metrics.headcount_by_title).length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {Object.entries(metrics.headcount_by_title)
                  .sort(([, a], [, b]) => b - a) // Sayıya göre azalan sıralama
                  .map(([title, count]) => (
                    <div
                      key={title}
                      className={`flex justify-between items-center p-2 rounded border ${
                        themeDark 
                          ? "bg-slate-900/50 border-slate-600" 
                          : "bg-slate-50 border-slate-200"
                      }`}
                    >
                      <span className="text-sm truncate mr-2">{title}</span>
                      <span className={`text-sm font-bold ${
                        themeDark ? "text-emerald-400" : "text-emerald-600"
                      }`}>
                        {count}
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="text-sm text-slate-500 text-center py-4">
                Ünvan verisi bulunamadı
              </div>
            )}
          </div>

          {/* Additional Stats */}
          {metrics.vehicle_km > 0 && metrics.vehicle_count > 0 && (
            <div className={cardClass}>
              <div className={headerClass}>
                <span className="inline-flex items-center gap-1">
                  📈 Araç Verimliliği
                </span>
              </div>
              <div className="text-2xl font-bold mb-1">
                {Math.round(metrics.vehicle_km / metrics.vehicle_count)}
              </div>
              <div className={`text-xs ${themeDark ? "text-slate-400" : "text-slate-500"}`}>
                Ortalama km/araç (aylık)
              </div>
            </div>
          )}

          {metrics.machine_usage_hours > 0 && metrics.active_machine_count > 0 && (
            <div className={cardClass}>
              <div className={headerClass}>
                <span className="inline-flex items-center gap-1">
                  ⚡ Makine Verimliliği
                </span>
              </div>
              <div className="text-2xl font-bold mb-1">
                {Math.round(metrics.machine_usage_hours / metrics.active_machine_count)}
              </div>
              <div className={`text-xs ${themeDark ? "text-slate-400" : "text-slate-500"}`}>
                Ortalama saat/makine
              </div>
            </div>
          )}
        </div>

        {/* Footer Info */}
        <div className={`mt-6 text-center text-xs ${themeDark ? "text-slate-600" : "text-slate-400"}`}>
          Tesis ID: {FACILITY_ID} • Dönem: {MONTH} • Türetilmiş Metrikler
        </div>
      </div>
    </div>
  );
}