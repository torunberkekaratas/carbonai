import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";

/**
 * PersonnelList - Personel listesi ve yönetim sayfası
 * @param {boolean} themeDark - Koyu tema aktif mi?
 */
export default function PersonnelList({ themeDark = false }) {
  const nav = useNavigate();
  const isMountedRef = useRef(true);

  // State
  const [personnel, setPersonnel] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortField, setSortField] = useState("name");
  const [sortDirection, setSortDirection] = useState("asc");
  const [deleteId, setDeleteId] = useState(null);

  // Load data on mount
  useEffect(() => {
    isMountedRef.current = true;

    const loadData = async () => {
      setLoading(true);
      setError(null);

      try {
        // Simulated API call - Production'da gerçek API kullanın
        await new Promise(resolve => setTimeout(resolve, 300));

        if (isMountedRef.current) {
          // Demo data
          const demoData = [
            {
              id: "1",
              name: "Ahmet Yılmaz",
              title: "Üretim Müdürü",
              department: "Üretim",
              companyEmail: "ahmet.yilmaz@carbonai.com",
              phone: "+90 555 123 4567",
              vehicleTag: "16ABC123",
              machineTag: "MAK-001",
              gender: "Erkek",
              maritalStatus: "Evli",
            },
            {
              id: "2",
              name: "Ayşe Demir",
              title: "Kalite Kontrol Uzmanı",
              department: "Kalite Kontrol",
              companyEmail: "ayse.demir@carbonai.com",
              phone: "+90 555 234 5678",
              vehicleTag: "",
              machineTag: "MAK-003",
              gender: "Kadın",
              maritalStatus: "Bekâr",
            },
            {
              id: "3",
              name: "Mehmet Kaya",
              title: "Lojistik Koordinatörü",
              department: "Lojistik",
              companyEmail: "mehmet.kaya@carbonai.com",
              phone: "+90 555 345 6789",
              vehicleTag: "16XYZ789",
              machineTag: "",
              gender: "Erkek",
              maritalStatus: "Evli",
            },
          ];

          setPersonnel(demoData);
          setLoading(false);
        }
      } catch (err) {
        if (isMountedRef.current) {
          setError("Personel verileri yüklenirken bir hata oluştu.");
          setLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Filter personnel
  const filteredPersonnel = useMemo(() => {
    if (!searchTerm.trim()) return personnel;

    const term = searchTerm.toLowerCase();
    return personnel.filter((person) => {
      const searchableFields = [
        person.name,
        person.title,
        person.department,
        person.companyEmail,
        person.phone,
        person.vehicleTag,
        person.machineTag,
      ];

      return searchableFields
        .filter(Boolean)
        .some((field) => String(field).toLowerCase().includes(term));
    });
  }, [personnel, searchTerm]);

  // Sort personnel
  const sortedPersonnel = useMemo(() => {
    const sorted = [...filteredPersonnel];

    sorted.sort((a, b) => {
      let aVal = a[sortField] || "";
      let bVal = b[sortField] || "";

      // Convert to lowercase for case-insensitive sorting
      if (typeof aVal === "string") aVal = aVal.toLowerCase();
      if (typeof bVal === "string") bVal = bVal.toLowerCase();

      if (aVal < bVal) return sortDirection === "asc" ? -1 : 1;
      if (aVal > bVal) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [filteredPersonnel, sortField, sortDirection]);

  // Statistics
  const stats = useMemo(() => {
    return {
      total: personnel.length,
      withVehicle: personnel.filter(p => p.vehicleTag).length,
      withMachine: personnel.filter(p => p.machineTag).length,
      departments: [...new Set(personnel.map(p => p.department).filter(Boolean))].length,
    };
  }, [personnel]);

  // Handle sort
  const handleSort = useCallback((field) => {
    if (sortField === field) {
      setSortDirection(prev => prev === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  }, [sortField]);

  // Handle delete
  const handleDelete = useCallback((id) => {
    setDeleteId(id);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!deleteId) return;

    setLoading(true);

    try {
      // Simulated API call
      await new Promise(resolve => setTimeout(resolve, 300));

      if (isMountedRef.current) {
        const updated = personnel.filter((p) => p.id !== deleteId);
        setPersonnel(updated);
        setDeleteId(null);
        setLoading(false);

        // Production'da: await deletePersonnel(deleteId);
      }
    } catch (err) {
      if (isMountedRef.current) {
        setError("Silme işlemi başarısız oldu.");
        setLoading(false);
      }
    }
  }, [deleteId, personnel]);

  const cancelDelete = useCallback(() => {
    setDeleteId(null);
  }, []);

  // Handle retry
  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  // Export to CSV
  const exportToCSV = useCallback(() => {
    const BOM = "\uFEFF";
    const headers = ["Ad Soyad", "Ünvan", "Departman", "E-posta", "Telefon", "Araç", "Makine"];
    const rows = [
      headers,
      ...sortedPersonnel.map(p => [
        p.name,
        p.title || "",
        p.department || "",
        p.companyEmail || "",
        p.phone || "",
        p.vehicleTag || "",
        p.machineTag || "",
      ])
    ];

    const csvContent = "data:text/csv;charset=utf-8," + BOM +
      rows.map(r => r.map(cell => `"${cell}"`).join(";")).join("\n");

    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `personel-listesi-${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [sortedPersonnel]);

  // Memoized class names
  const containerClass = useMemo(() =>
    `min-h-screen p-4 sm:p-6 transition-colors ${
      themeDark
        ? "bg-slate-900 text-slate-100"
        : "bg-gradient-to-b from-white to-emerald-50 text-slate-700"
    }`,
  [themeDark]);

  const cardClass = useMemo(() =>
    `rounded-xl border shadow-sm transition-colors ${
      themeDark
        ? "bg-slate-800 border-slate-700 text-slate-100"
        : "bg-white border-slate-200 text-slate-700"
    }`,
  [themeDark]);

  const inputClass = useMemo(() =>
    `w-full text-[13px] rounded-lg border px-4 py-2.5 outline-none transition-all focus:ring-2 focus:ring-offset-0 ${
      themeDark
        ? "bg-slate-700 border-slate-600 text-slate-100 placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/30"
        : "bg-white border-slate-300 text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:ring-emerald-500/30"
    }`,
  [themeDark]);

  // Loading state
  if (loading && personnel.length === 0) {
    return (
      <div className={containerClass}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="w-8 h-8 mx-auto mb-4 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"
                 role="status"
                 aria-live="polite"
                 aria-label="Yükleniyor" />
            <p className="text-sm text-slate-500">Personel listesi yükleniyor...</p>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && personnel.length === 0) {
    return (
      <div className={containerClass}>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center max-w-md">
            <div className="text-red-600 text-5xl mb-4">⚠️</div>
            <h2 className={`text-lg font-semibold mb-2 ${themeDark ? "text-white" : "text-slate-900"}`}>
              Bir Hata Oluştu
            </h2>
            <p className="text-sm text-slate-500 mb-6">{error}</p>
            <button
              onClick={handleRetry}
              className="inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium rounded-lg border border-emerald-600 bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
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
      {/* Header */}
      <header className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <div className="text-[10px] uppercase tracking-wide font-semibold text-emerald-600 mb-1">
              İnsan Kaynakları
            </div>
            <h1 className={`text-xl font-bold ${themeDark ? "text-white" : "text-slate-900"}`}>
              Personel Yönetimi
            </h1>
            <p className="text-[12px] text-slate-500 mt-1">
              Toplam {stats.total} personel
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={exportToCSV}
              disabled={sortedPersonnel.length === 0}
              className={`inline-flex items-center gap-2 px-4 py-2 text-[13px] font-medium rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                themeDark
                  ? "border-slate-600 bg-slate-700 hover:bg-slate-600 text-slate-200"
                  : "border-slate-300 bg-white hover:bg-slate-50 text-slate-700"
              }`}
              aria-label="CSV olarak indir"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              CSV İndir
            </button>

            <Link
              to="/personnel/new"
              className={`inline-flex items-center gap-2 px-4 py-2 text-[13px] font-semibold rounded-lg border shadow-sm transition-colors ${
                themeDark
                  ? "border-emerald-700 bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/40"
                  : "border-emerald-700/20 bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30"
              }`}
              aria-label="Yeni personel ekle"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Yeni Personel
            </Link>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className={cardClass + " p-3"}>
            <div className="text-[10px] uppercase tracking-wide font-medium text-slate-500 mb-1">
              Toplam Personel
            </div>
            <div className={`text-2xl font-bold ${themeDark ? "text-white" : "text-slate-900"}`}>
              {stats.total}
            </div>
          </div>

          <div className={cardClass + " p-3"}>
            <div className="text-[10px] uppercase tracking-wide font-medium text-slate-500 mb-1">
              Araç Kullanan
            </div>
            <div className={`text-2xl font-bold ${themeDark ? "text-white" : "text-slate-900"}`}>
              {stats.withVehicle}
            </div>
          </div>

          <div className={cardClass + " p-3"}>
            <div className="text-[10px] uppercase tracking-wide font-medium text-slate-500 mb-1">
              Makine Kullanan
            </div>
            <div className={`text-2xl font-bold ${themeDark ? "text-white" : "text-slate-900"}`}>
              {stats.withMachine}
            </div>
          </div>

          <div className={cardClass + " p-3"}>
            <div className="text-[10px] uppercase tracking-wide font-medium text-slate-500 mb-1">
              Departman
            </div>
            <div className={`text-2xl font-bold ${themeDark ? "text-white" : "text-slate-900"}`}>
              {stats.departments}
            </div>
          </div>
        </div>
      </header>

      {/* Search Bar */}
      <div className={cardClass + " p-4 mb-4"}>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className={inputClass + " pl-10"}
            placeholder="İsim, e-posta, telefon, ünvan, departman, araç veya makine ara..."
            aria-label="Personel ara"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
              aria-label="Aramayı temizle"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>

        {searchTerm && (
          <p className="mt-2 text-[11px] text-slate-500">
            {sortedPersonnel.length} sonuç bulundu
          </p>
        )}
      </div>

      {/* Table */}
      <div className={cardClass + " overflow-hidden"}>
        <div className="overflow-x-auto">
          <table className="w-full text-[12px]" role="table">
            <thead className={themeDark ? "bg-slate-900/50" : "bg-slate-50"}>
              <tr>
                <th
                  onClick={() => handleSort("name")}
                  className={`text-left font-semibold px-4 py-3 cursor-pointer select-none hover:bg-slate-100/5 transition-colors ${
                    themeDark ? "text-slate-300" : "text-slate-700"
                  }`}
                  scope="col"
                  role="columnheader"
                  aria-sort={sortField === "name" ? (sortDirection === "asc" ? "ascending" : "descending") : "none"}
                >
                  <div className="flex items-center gap-2">
                    <span>Ad Soyad</span>
                    {sortField === "name" && (
                      <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("title")}
                  className={`text-left font-semibold px-4 py-3 cursor-pointer select-none hover:bg-slate-100/5 transition-colors ${
                    themeDark ? "text-slate-300" : "text-slate-700"
                  }`}
                  scope="col"
                  role="columnheader"
                >
                  <div className="flex items-center gap-2">
                    <span>Ünvan</span>
                    {sortField === "title" && (
                      <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("department")}
                  className={`text-left font-semibold px-4 py-3 cursor-pointer select-none hover:bg-slate-100/5 transition-colors ${
                    themeDark ? "text-slate-300" : "text-slate-700"
                  }`}
                  scope="col"
                  role="columnheader"
                >
                  <div className="flex items-center gap-2">
                    <span>Departman</span>
                    {sortField === "department" && (
                      <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th
                  onClick={() => handleSort("companyEmail")}
                  className={`text-left font-semibold px-4 py-3 cursor-pointer select-none hover:bg-slate-100/5 transition-colors ${
                    themeDark ? "text-slate-300" : "text-slate-700"
                  }`}
                  scope="col"
                  role="columnheader"
                >
                  <div className="flex items-center gap-2">
                    <span>E-posta</span>
                    {sortField === "companyEmail" && (
                      <span>{sortDirection === "asc" ? "↑" : "↓"}</span>
                    )}
                  </div>
                </th>
                <th
                  className={`text-left font-semibold px-4 py-3 ${
                    themeDark ? "text-slate-300" : "text-slate-700"
                  }`}
                  scope="col"
                >
                  Telefon
                </th>
                <th
                  className={`text-left font-semibold px-4 py-3 ${
                    themeDark ? "text-slate-300" : "text-slate-700"
                  }`}
                  scope="col"
                >
                  Araç
                </th>
                <th
                  className={`text-left font-semibold px-4 py-3 ${
                    themeDark ? "text-slate-300" : "text-slate-700"
                  }`}
                  scope="col"
                >
                  Makine
                </th>
                <th
                  className={`text-right font-semibold px-4 py-3 ${
                    themeDark ? "text-slate-300" : "text-slate-700"
                  }`}
                  scope="col"
                >
                  İşlem
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedPersonnel.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center">
                    <div className="text-slate-400 text-4xl mb-3">👥</div>
                    <p className="text-sm text-slate-500">
                      {searchTerm ? "Arama sonucu bulunamadı" : "Henüz personel eklenmemiş"}
                    </p>
                    {!searchTerm && (
                      <Link
                        to="/personnel/new"
                        className="inline-flex items-center gap-2 mt-4 px-4 py-2 text-[13px] font-medium rounded-lg border border-emerald-600 bg-emerald-600 hover:bg-emerald-700 text-white transition-colors"
                      >
                        İlk Personeli Ekle
                      </Link>
                    )}
                  </td>
                </tr>
              ) : (
                sortedPersonnel.map((person, idx) => (
                  <tr
                    key={person.id}
                    className={`border-t transition-colors ${
                      themeDark
                        ? "border-slate-700 hover:bg-slate-700/30"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <td className="px-4 py-3">
                      <div className="font-medium">{person.name}</div>
                    </td>
                    <td className="px-4 py-3">{person.title || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${
                        themeDark
                          ? "bg-slate-700 text-slate-300"
                          : "bg-slate-100 text-slate-700"
                      }`}>
                        {person.department || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[11px]">
                      {person.companyEmail ? (
                        <a
                          href={`mailto:${person.companyEmail}`}
                          className="text-emerald-600 hover:underline"
                        >
                          {person.companyEmail}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-[11px]">
                      {person.phone ? (
                        <a
                          href={`tel:${person.phone}`}
                          className="text-emerald-600 hover:underline"
                        >
                          {person.phone}
                        </a>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {person.vehicleTag ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-blue-100 text-blue-700">
                          🚗 {person.vehicleTag}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {person.machineTag ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-amber-100 text-amber-700">
                          🏭 {person.machineTag}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => nav(`/personnel/${person.id}`)}
                          className={`inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-medium rounded-lg border transition-colors ${
                            themeDark
                              ? "border-slate-600 bg-slate-700 hover:bg-slate-600 text-slate-200"
                              : "border-slate-300 bg-white hover:bg-slate-50 text-slate-700"
                          }`}
                          aria-label={`${person.name} düzenle`}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Düzenle
                        </button>
                        <button
                          onClick={() => handleDelete(person.id)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-[11px] font-medium rounded-lg border border-red-600 bg-red-600 hover:bg-red-700 text-white transition-colors"
                          aria-label={`${person.name} sil`}
                        >
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
        >
          <div className={`max-w-md w-full rounded-xl shadow-2xl ${
            themeDark ? "bg-slate-800 border border-slate-700" : "bg-white"
          }`}>
            <div className="p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 id="delete-modal-title" className={`text-lg font-semibold mb-2 ${
                    themeDark ? "text-white" : "text-slate-900"
                  }`}>
                    Personeli Sil
                  </h3>
                  <p className="text-sm text-slate-500 mb-4">
                    <strong>{personnel.find(p => p.id === deleteId)?.name}</strong> isimli personeli silmek istediğinize emin misiniz? Bu işlem geri alınamaz.
                  </p>
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={cancelDelete}
                      className={`px-4 py-2 text-[13px] font-medium rounded-lg border transition-colors ${
                        themeDark
                          ? "border-slate-600 bg-slate-700 hover:bg-slate-600 text-slate-200"
                          : "border-slate-300 bg-white hover:bg-slate-50 text-slate-700"
                      }`}
                    >
                      İptal
                    </button>
                    <button
                      onClick={confirmDelete}
                      disabled={loading}
                      className="px-4 py-2 text-[13px] font-semibold rounded-lg border border-red-600 bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? "Siliniyor..." : "Evet, Sil"}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease;
        }
      `}</style>
    </div>
  );
}