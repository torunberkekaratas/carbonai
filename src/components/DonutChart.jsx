import { PieChart, Pie, Cell, Tooltip } from "recharts";

// Basit tooltip formatlayıcı
function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const item = payload[0];
    return (
        <div className="rounded-lg bg-slate-800/90 border border-slate-700 px-3 py-2 text-xs text-slate-100 shadow-xl">
          <div className="font-semibold">{item.name}</div>
          <div>{item.value.toLocaleString("tr-TR")} kg CO₂</div>
        </div>
    );
  }
  return null;
}

// Not: Renkleri manuel seçiyoruz ki Tailwind sınıfı değil gerçek renk olsun.
// (Chart'ın içi canvas/svg olduğu için Tailwind sınıfı kullanamıyoruz burada.)
const COLORS = [
  "#38bdf8", // sky-400
  "#34d399", // emerald-400
  "#facc15", // yellow-400
  "#fb7185", // rose-400
  "#a78bfa", // violet-400
  "#f472b6", // pink-400
];

export default function DonutChart({ data }) {
  // data beklenen format:
  // [{ name: "electricity", value: 20832 }, { name: "natural_gas", value: 1234 }, ...]

  const total = data.reduce((acc, d) => acc + d.value, 0);

  return (
    <div className="flex flex-col items-center text-slate-200">
      <div className="text-xs text-slate-400 mb-2 tracking-wide uppercase">
        Kaynaklara Göre CO₂
      </div>

      <PieChart width={220} height={220}>
        <Pie
          dataKey="value"
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          stroke="#1e293b"   // slate-800 gibi koyu kenar çizgisi
          strokeWidth={2}
        >
          {data.map((entry, index) => (
            <Cell
              key={`slice-${index}`}
              fill={COLORS[index % COLORS.length]}
            />
          ))}
        </Pie>

        <Tooltip content={<CustomTooltip />} />
      </PieChart>

      <div className="text-center mt-2">
        <div className="text-xl font-semibold text-white">
          {total.toLocaleString("tr-TR")} kg
        </div>
        <div className="text-xs text-slate-500">
          Toplam CO₂
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-col gap-2 text-[11px] text-slate-300">
        {data.map((item, i) => (
          <div key={i} className="flex items-start gap-2">
            <span
              className="inline-block h-2 w-2 rounded-sm mt-[5px]"
              style={{ backgroundColor: COLORS[i % COLORS.length] }}
            />
            <div className="flex flex-col leading-tight">
              <span className="text-white font-medium">{item.name}</span>
              <span className="text-slate-500">
                {item.value.toLocaleString("tr-TR")} kg CO₂
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}