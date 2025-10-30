import React, { forwardRef, useImperativeHandle, useRef, useMemo, useCallback } from "react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  AreaChart,
  Area,
  ResponsiveContainer,
  Legend,
} from "recharts";

// Renk paleti - daha erişilebilir ve tema uyumlu
const COLORS = {
  light: ["#10b981", "#0ea5e9", "#6366f1", "#facc15", "#f97316", "#ef4444", "#8b5cf6", "#ec4899"],
  dark: ["#34d399", "#38bdf8", "#818cf8", "#fde047", "#fb923c", "#f87171", "#a78bfa", "#f472b6"],
};

/**
 * EmissionsChart - CO2 emisyon verilerini görselleştiren çok amaçlı grafik komponenti
 * @param {Array} data - Görselleştirilecek veri [{name: string, value: number}]
 * @param {string} chartType - Grafik tipi: 'donut', 'bar', 'line', 'area'
 * @param {boolean} themeDark - Koyu tema aktif mi?
 * @param {number} height - Grafik yüksekliği (px)
 * @param {boolean} showLegend - Legend gösterimi
 */
const EmissionsChart = forwardRef(function EmissionsChart(
  {
    data = [],
    chartType = "donut",
    themeDark = false,
    height = 120,
    showLegend = false,
  },
  ref
) {
  const containerRef = useRef(null);

  // Tema bazlı renkler
  const colors = useMemo(
    () => themeDark ? COLORS.dark : COLORS.light,
    [themeDark]
  );

  // Tema bazlı stil değerleri
  const textColor = useMemo(
    () => themeDark ? "#cbd5e1" : "#64748b",
    [themeDark]
  );

  const gridColor = useMemo(
    () => themeDark ? "#334155" : "#e2e8f0",
    [themeDark]
  );

  const lineStroke = useMemo(
    () => themeDark ? "#94a3b8" : "#0f172a",
    [themeDark]
  );

  // PNG capture API - html2canvas entegrasyonu için hazır
  useImperativeHandle(ref, () => ({
    capturePng: async () => {
      if (!containerRef.current) {
        console.warn("Chart container ref not available");
        return null;
      }

      try {
        // html2canvas kurulu olması durumunda:
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

  // Tooltip formatter
  const formatTooltipValue = useCallback((value, name) => {
    const formattedValue = Number(value).toLocaleString("tr-TR");
    return [`${formattedValue} kg CO₂`, name];
  }, []);

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

  // Custom tooltip
  const CustomTooltip = useCallback(({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    return (
      <div
        className={`rounded-lg border px-3 py-2 shadow-lg ${
          themeDark 
            ? "bg-slate-800 border-slate-600 text-slate-100" 
            : "bg-white border-slate-200 text-slate-900"
        }`}
      >
        <p className="text-[11px] font-semibold mb-1">
          {payload[0].name || payload[0].payload.name}
        </p>
        <p className="text-[12px] font-bold text-emerald-600">
          {Number(payload[0].value).toLocaleString("tr-TR")} kg CO₂
        </p>
      </div>
    );
  }, [themeDark]);

  // Veri validasyonu
  const validData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.filter(item =>
      item &&
      typeof item === 'object' &&
      'name' in item &&
      'value' in item &&
      typeof item.value === 'number' &&
      !isNaN(item.value)
    );
  }, [data]);

  // Boş veri durumu
  if (validData.length === 0) {
    return (
      <div
        ref={containerRef}
        className={`flex items-center justify-center h-full text-[11px] ${
          themeDark ? "text-slate-500" : "text-slate-400"
        }`}
        role="status"
        aria-live="polite"
      >
        Görselleştirilecek veri yok.
      </div>
    );
  }

  // Ortak grafik props
  const commonProps = {
    margin: { top: 5, right: 5, bottom: 5, left: 5 },
  };

  // Donut Chart
  if (chartType === "donut") {
    return (
      <div ref={containerRef} style={{ width: "100%", height }}>
        <ResponsiveContainer>
          <PieChart {...commonProps}>
            <Pie
              data={validData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius="50%"
              outerRadius="80%"
              paddingAngle={2}
              stroke={themeDark ? "#1e293b" : "#fff"}
              strokeWidth={2}
              label={false}
              animationDuration={500}
            >
              {validData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            {showLegend && (
              <Legend
                wrapperStyle={{ fontSize: "10px" }}
                iconType="circle"
              />
            )}
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Bar Chart
  if (chartType === "bar") {
    return (
      <div ref={containerRef} style={{ width: "100%", height }}>
        <ResponsiveContainer>
          <BarChart data={validData} {...commonProps}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: textColor }}
              stroke={gridColor}
              axisLine={{ stroke: gridColor }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: textColor }}
              tickFormatter={formatYAxis}
              stroke={gridColor}
              axisLine={{ stroke: gridColor }}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend wrapperStyle={{ fontSize: "10px" }} />}
            <Bar
              dataKey="value"
              radius={[4, 4, 0, 0]}
              animationDuration={500}
            >
              {validData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={colors[index % colors.length]}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Line Chart
  if (chartType === "line") {
    return (
      <div ref={containerRef} style={{ width: "100%", height }}>
        <ResponsiveContainer>
          <LineChart data={validData} {...commonProps}>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: textColor }}
              stroke={gridColor}
              axisLine={{ stroke: gridColor }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: textColor }}
              tickFormatter={formatYAxis}
              stroke={gridColor}
              axisLine={{ stroke: gridColor }}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend wrapperStyle={{ fontSize: "10px" }} />}
            <Line
              type="monotone"
              dataKey="value"
              stroke={colors[0]}
              strokeWidth={2}
              dot={{
                r: 3,
                stroke: colors[0],
                strokeWidth: 2,
                fill: themeDark ? "#1e293b" : "#fff"
              }}
              activeDot={{
                r: 5,
                stroke: colors[0],
                strokeWidth: 2,
                fill: themeDark ? "#1e293b" : "#fff"
              }}
              animationDuration={500}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Area Chart
  if (chartType === "area") {
    return (
      <div ref={containerRef} style={{ width: "100%", height }}>
        <ResponsiveContainer>
          <AreaChart data={validData} {...commonProps}>
            <defs>
              <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor={colors[0]}
                  stopOpacity={0.3}
                />
                <stop
                  offset="95%"
                  stopColor={colors[0]}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="name"
              tick={{ fontSize: 10, fill: textColor }}
              stroke={gridColor}
              axisLine={{ stroke: gridColor }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: textColor }}
              tickFormatter={formatYAxis}
              stroke={gridColor}
              axisLine={{ stroke: gridColor }}
            />
            <Tooltip content={<CustomTooltip />} />
            {showLegend && <Legend wrapperStyle={{ fontSize: "10px" }} />}
            <Area
              type="monotone"
              dataKey="value"
              stroke={colors[0]}
              strokeWidth={2}
              fill="url(#colorValue)"
              dot={{
                r: 3,
                stroke: colors[0],
                strokeWidth: 2,
                fill: themeDark ? "#1e293b" : "#fff"
              }}
              activeDot={{
                r: 5,
                stroke: colors[0],
                strokeWidth: 2,
                fill: themeDark ? "#1e293b" : "#fff"
              }}
              animationDuration={500}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Bilinmeyen grafik tipi
  return (
    <div
      ref={containerRef}
      className={`flex items-center justify-center h-full text-[11px] ${
        themeDark ? "text-red-400" : "text-red-600"
      }`}
      role="alert"
    >
      Geçersiz grafik tipi: {chartType}
    </div>
  );
});

EmissionsChart.displayName = "EmissionsChart";

export default EmissionsChart;