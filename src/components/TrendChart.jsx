import React, { forwardRef, useImperativeHandle, useRef, useMemo, useCallback } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  Legend,
  Area,
  ComposedChart,
} from "recharts";

/**
 * TrendChart - Zaman serisi CO2 trend grafiği
 * @param {Array} data - Trend verisi [{month: string, total_co2_kg: number}]
 * @param {boolean} themeDark - Koyu tema aktif mi?
 * @param {number} height - Grafik yüksekliği (px)
 * @param {boolean} showGrid - Grid çizgilerini göster
 * @param {boolean} showLegend - Legend göster
 * @param {boolean} showArea - Alan grafiği olarak göster
 * @param {string} dateFormat - Tarih formatı: 'full', 'short', 'month-only'
 */
const TrendChart = forwardRef(function TrendChart(
  {
    data = [],
    themeDark = false,
    height = 220,
    showGrid = true,
    showLegend = false,
    showArea = false,
    dateFormat = "short",
  },
  ref
) {
  const containerRef = useRef(null);

  // PNG capture API - html2canvas entegrasyonu
  useImperativeHandle(ref, () => ({
    capturePng: async () => {
      if (!containerRef.current) {
        console.warn("Chart container ref not available");
        return null;
      }

      try {
        if (typeof window !== "undefined" && window.html2canvas) {
          const canvas = await window.html2canvas(containerRef.current);
          return canvas.toDataURL("image/png");
        }

        console.warn("html2canvas not available. Install with: npm install html2canvas");
        return null;
      } catch (error) {
        console.error("Chart capture failed:", error);
        return null;
      }
    },
  }), []);

  // Tema bazlı renkler
  const colors = useMemo(() => ({
    axis: themeDark ? "#94a3b8" : "#64748b",
    grid: themeDark ? "#334155" : "#e2e8f0",
    line: themeDark ? "#10b981" : "#059669",
    lineGradientStart: themeDark ? "#10b981" : "#059669",
    lineGradientEnd: themeDark ? "#065f46" : "#047857",
    areaFill: themeDark ? "rgba(16, 185, 129, 0.15)" : "rgba(5, 150, 105, 0.1)",
    dot: themeDark ? "#34d399" : "#10b981",
    dotStroke: themeDark ? "#1e293b" : "#fff",
  }), [themeDark]);

  // Tooltip stilleri
  const tooltipStyle = useMemo(() => ({
    fontSize: "12px",
    backgroundColor: themeDark ? "#1e293b" : "#fff",
    borderColor: themeDark ? "#475569" : "#cbd5e1",
    color: themeDark ? "#f8fafc" : "#0f172a",
    borderRadius: "8px",
    padding: "8px 12px",
    boxShadow: themeDark
      ? "0 4px 6px -1px rgba(0, 0, 0, 0.3)"
      : "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  }), [themeDark]);

  // Veri validasyonu
  const validData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.filter(item =>
      item &&
      typeof item === 'object' &&
      'month' in item &&
      'total_co2_kg' in item &&
      typeof item.total_co2_kg === 'number' &&
      !isNaN(item.total_co2_kg)
    );
  }, [data]);

  // Y-axis formatter
  const formatYAxis = useCallback((value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toString();
  }, []);

  // X-axis formatter
  const formatXAxis = useCallback((value) => {
    if (!value) return "";

    try {
      if (dateFormat === "month-only") {
        // "2025-10" → "Eki"
        const [year, month] = value.split("-");
        const monthNames = ["Oca", "Şub", "Mar", "Nis", "May", "Haz", "Tem", "Ağu", "Eyl", "Eki", "Kas", "Ara"];
        return monthNames[parseInt(month) - 1] || value;
      }

      if (dateFormat === "short") {
        // "2025-10" → "10/25"
        const [year, month] = value.split("-");
        return `${month}/${year.slice(-2)}`;
      }

      // "full" - orijinal değer
      return value;
    } catch (error) {
      return value;
    }
  }, [dateFormat]);

  // Custom Tooltip
  const CustomTooltip = useCallback(({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;

    const value = payload[0].value;
    const formattedValue = Number(value).toLocaleString("tr-TR");

    return (
      <div
        style={tooltipStyle}
        className="shadow-lg"
      >
        <p className="text-[11px] font-semibold mb-1 opacity-75">
          {label}
        </p>
        <p className="text-[13px] font-bold text-emerald-600">
          {formattedValue} kg CO₂
        </p>
        {validData.length > 1 && (
          <p className="text-[10px] mt-1 opacity-60">
            Aylık Toplam
          </p>
        )}
      </div>
    );
  }, [tooltipStyle, validData.length]);

  // Boş veri durumu
  if (validData.length === 0) {
    return (
      <div
        ref={containerRef}
        className={`flex items-center justify-center h-full text-[11px] ${
          themeDark ? "text-slate-500" : "text-slate-400"
        }`}
        style={{ height }}
        role="status"
        aria-live="polite"
      >
        Trend verisi bulunamadı.
      </div>
    );
  }

  // Tek veri noktası uyarısı
  if (validData.length === 1) {
    return (
      <div
        ref={containerRef}
        className={`flex items-center justify-center h-full text-[11px] ${
          themeDark ? "text-amber-400" : "text-amber-600"
        }`}
        style={{ height }}
        role="status"
        aria-live="polite"
      >
        Trend gösterimi için en az 2 veri noktası gerekli.
      </div>
    );
  }

  // ComposedChart ile alan + çizgi birleştirme
  if (showArea) {
    return (
      <div ref={containerRef} className="w-full" style={{ height }}>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={validData}
            margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorCo2" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={colors.lineGradientStart} stopOpacity={0.3} />
                <stop offset="95%" stopColor={colors.lineGradientEnd} stopOpacity={0} />
              </linearGradient>
            </defs>
            {showGrid && (
              <CartesianGrid
                stroke={colors.grid}
                strokeDasharray="3 3"
                strokeOpacity={0.5}
              />
            )}
            <XAxis
              dataKey="month"
              stroke={colors.axis}
              tick={{ fill: colors.axis, fontSize: 11 }}
              tickFormatter={formatXAxis}
              axisLine={{ stroke: colors.grid }}
            />
            <YAxis
              stroke={colors.axis}
              tick={{ fill: colors.axis, fontSize: 11 }}
              tickFormatter={formatYAxis}
              axisLine={{ stroke: colors.grid }}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && (
              <Legend
                wrapperStyle={{ fontSize: "10px" }}
                iconType="line"
              />
            )}
            <Area
              type="monotone"
              dataKey="total_co2_kg"
              fill="url(#colorCo2)"
              stroke={colors.line}
              strokeWidth={2}
              name="CO₂ Emisyonu"
            />
            <Line
              type="monotone"
              dataKey="total_co2_kg"
              stroke={colors.line}
              strokeWidth={2}
              dot={{
                r: 4,
                fill: colors.dot,
                stroke: colors.dotStroke,
                strokeWidth: 2
              }}
              activeDot={{
                r: 6,
                fill: colors.dot,
                stroke: colors.dotStroke,
                strokeWidth: 2
              }}
              name="CO₂ Emisyonu"
              animationDuration={500}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Standart çizgi grafik
  return (
    <div ref={containerRef} className="w-full" style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={validData}
          margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
        >
          {showGrid && (
            <CartesianGrid
              stroke={colors.grid}
              strokeDasharray="3 3"
              strokeOpacity={0.5}
            />
          )}
          <XAxis
            dataKey="month"
            stroke={colors.axis}
            tick={{ fill: colors.axis, fontSize: 11 }}
            tickFormatter={formatXAxis}
            axisLine={{ stroke: colors.grid }}
          />
          <YAxis
            stroke={colors.axis}
            tick={{ fill: colors.axis, fontSize: 11 }}
            tickFormatter={formatYAxis}
            axisLine={{ stroke: colors.grid }}
          />
          <Tooltip content={<CustomTooltip />} />
          {showLegend && (
            <Legend
              wrapperStyle={{ fontSize: "10px" }}
              iconType="line"
            />
          )}
          <Line
            type="monotone"
            dataKey="total_co2_kg"
            stroke={colors.line}
            strokeWidth={2}
            dot={{
              r: 4,
              fill: colors.dot,
              stroke: colors.dotStroke,
              strokeWidth: 2
            }}
            activeDot={{
              r: 6,
              fill: colors.dot,
              stroke: colors.dotStroke,
              strokeWidth: 2
            }}
            name="CO₂ Emisyonu"
            animationDuration={500}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
});

TrendChart.displayName = "TrendChart";

export default TrendChart;