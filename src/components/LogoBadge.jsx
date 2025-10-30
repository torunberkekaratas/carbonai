import React, { useMemo } from "react";

/**
 * LogoBadge - CarbonAI marka ve tesis bilgisi komponenti
 * @param {string} facilityName - Tesis adı
 * @param {string} periodLabel - Dönem etiketi (örn: "2025-10")
 * @param {string} versionTag - Versiyon etiketi (örn: "v1.3 Beta")
 * @param {boolean} dark - Koyu tema aktif mi?
 * @param {string} size - Logo boyutu: 'sm', 'md', 'lg'
 * @param {boolean} showSubtitle - Alt başlık gösterilsin mi?
 */
export default function LogoBadge({
  facilityName = "Tesis",
  periodLabel = "-",
  versionTag = "v1.3",
  dark = false,
  size = "md",
  showSubtitle = true,
}) {
  // Boyut değerleri
  const sizeConfig = useMemo(() => {
    const configs = {
      sm: {
        logoSize: "w-8 h-8",
        co2Text: "text-[8px]",
        intelText: "text-[6px]",
        titleText: "text-[10px]",
        subtitleText: "text-[10px]",
        badgeText: "text-[9px]",
      },
      md: {
        logoSize: "w-10 h-10",
        co2Text: "text-[10px]",
        intelText: "text-[8px]",
        titleText: "text-[11px]",
        subtitleText: "text-[11px]",
        badgeText: "text-[10px]",
      },
      lg: {
        logoSize: "w-12 h-12",
        co2Text: "text-[12px]",
        intelText: "text-[9px]",
        titleText: "text-[13px]",
        subtitleText: "text-[12px]",
        badgeText: "text-[11px]",
      },
    };
    return configs[size] || configs.md;
  }, [size]);

  // Memoized theme classes
  const logoClass = useMemo(
    () =>
      `flex flex-col items-center justify-center ${sizeConfig.logoSize} shrink-0 rounded-xl border ${sizeConfig.co2Text} font-bold leading-tight shadow transition-colors ${
        dark
          ? "bg-emerald-900/30 border-emerald-700 text-emerald-300 shadow-emerald-900/50"
          : "bg-emerald-50 border-emerald-300 text-emerald-700 shadow-emerald-200"
      }`,
    [dark, sizeConfig]
  );

  const titleClass = useMemo(
    () =>
      `${sizeConfig.titleText} font-semibold leading-tight transition-colors ${
        dark ? "text-white" : "text-slate-900"
      }`,
    [dark, sizeConfig]
  );

  const subtitleClass = useMemo(
    () =>
      `${sizeConfig.subtitleText} leading-tight transition-colors ${
        dark ? "text-slate-400" : "text-slate-500"
      }`,
    [dark, sizeConfig]
  );

  const badgeClass = useMemo(
    () =>
      `inline-flex items-center rounded border px-1.5 py-[2px] ${sizeConfig.badgeText} font-medium transition-colors ${
        dark
          ? "text-emerald-300 border-emerald-700 bg-emerald-900/30"
          : "text-emerald-700 border-emerald-300 bg-emerald-50"
      }`,
    [dark, sizeConfig]
  );

  const intelClass = useMemo(
    () => `${sizeConfig.intelText} font-normal tracking-wide`,
    [sizeConfig]
  );

  return (
    <div
      className="flex items-start gap-3"
      role="banner"
      aria-label="CarbonAI logo ve tesis bilgileri"
    >
      {/* Logo cube */}
      <div
        className={logoClass}
        aria-hidden="true"
      >
        <span>CO₂</span>
        <span className={intelClass}>intel</span>
      </div>

      {/* Text block */}
      <div className="flex flex-col gap-0.5">
        <h1 className={titleClass}>
          CarbonAI Sustainability Console
        </h1>

        {showSubtitle && (
          <div className={subtitleClass}>
            <span className="font-medium">{facilityName}</span>
            {" • "}
            <time dateTime={periodLabel}>{periodLabel}</time>
            {" • "}
            <span
              className={badgeClass}
              role="status"
              aria-label={`Versiyon ${versionTag}`}
            >
              {versionTag}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}