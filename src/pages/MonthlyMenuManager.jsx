import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

export default function MonthlyMenuManager() {
  const [menuData, setMenuData] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [uploading, setUploading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [editingDay, setEditingDay] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Mevcut yemek listelerini localStorage'dan yükle
  useEffect(() => {
    const saved = localStorage.getItem('monthlyMenus');
    if (saved) {
      setMenuData(JSON.parse(saved));
    }
  }, []);

  // Kaydet
  const saveToStorage = (data) => {
    localStorage.setItem('monthlyMenus', JSON.stringify(data));
    setMenuData(data);
  };

  // Excel dosyası yükle
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Excel formatını parse et
      const parsedMenu = parseExcelMenu(jsonData);

      if (parsedMenu.length === 0) {
        throw new Error('Excel dosyası okunamadı veya boş!');
      }

      // Mevcut verilere ekle
      const updated = [...menuData.filter(m =>
        !(m.month === parsedMenu[0].month && m.year === parsedMenu[0].year)
      ), ...parsedMenu];

      saveToStorage(updated);
      setAlert({ type: 'success', message: `${parsedMenu.length} günlük yemek listesi yüklendi!` });
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      setAlert({ type: 'error', message: 'Excel yüklenirken hata: ' + error.message });
      setTimeout(() => setAlert(null), 5000);
    } finally {
      setUploading(false);
    }
  };

  // Excel'den menü parse et
  const parseExcelMenu = (data) => {
    const menus = [];
    let currentMonth = '';
    let currentYear = selectedYear;

    for (let i = 0; i < data.length; i++) {
      const row = data[i];

      // Ay başlığını bul (örn: "OCAK 2025")
      if (row[0] && typeof row[0] === 'string') {
        const monthMatch = row[0].match(/(OCAK|ŞUBAT|MART|NİSAN|MAYIS|HAZİRAN|TEMMUZ|AĞUSTOS|EYLÜL|EKİM|KASIM|ARALIK)\s*(\d{4})?/i);
        if (monthMatch) {
          currentMonth = monthMatch[1].toUpperCase();
          if (monthMatch[2]) currentYear = parseInt(monthMatch[2]);
          continue;
        }
      }

      // Tarih satırlarını bul
      if (row[0] && (typeof row[0] === 'number' || /^\d{1,2}$/.test(String(row[0])))) {
        const day = parseInt(row[0]);
        const dayName = row[1] || '';
        const soup = row[2] || '';
        const mainCourse = row[3] || '';
        const sideDish = row[4] || '';
        const salad = row[5] || '';
        const dessert = row[6] || '';

        if (soup || mainCourse) {
          menus.push({
            id: `${currentYear}-${currentMonth}-${day}`,
            date: `${currentYear}-${getMonthNumber(currentMonth)}-${String(day).padStart(2, '0')}`,
            day: day,
            dayName: dayName,
            month: currentMonth,
            year: currentYear,
            soup: soup,
            mainCourse: mainCourse,
            sideDish: sideDish,
            salad: salad,
            dessert: dessert,
            co2PerPortion: calculateCO2(soup, mainCourse, sideDish, salad, dessert)
          });
        }
      }
    }

    return menus;
  };

  // Ay adını numaraya çevir
  const getMonthNumber = (monthName) => {
    const months = {
      'OCAK': '01', 'ŞUBAT': '02', 'MART': '03', 'NİSAN': '04',
      'MAYIS': '05', 'HAZİRAN': '06', 'TEMMUZ': '07', 'AĞUSTOS': '08',
      'EYLÜL': '09', 'EKİM': '10', 'KASIM': '11', 'ARALIK': '12'
    };
    return months[monthName] || '01';
  };

  // CO2 hesapla (basit tahmin)
  const calculateCO2 = (soup, main, side, salad, dessert) => {
    let total = 0;

    // Çorba: ~0.3 kg CO2
    if (soup) total += 0.3;

    // Ana yemek
    if (main) {
      if (main.toLowerCase().includes('tavuk')) total += 1.2;
      else if (main.toLowerCase().includes('et') || main.toLowerCase().includes('köfte')) total += 2.5;
      else if (main.toLowerCase().includes('balık')) total += 1.5;
      else total += 0.8; // Vejetaryen
    }

    // Pilav/makarna: ~0.4 kg CO2
    if (side) total += 0.4;

    // Salata: ~0.2 kg CO2
    if (salad) total += 0.2;

    // Tatlı: ~0.3 kg CO2
    if (dessert) total += 0.3;

    return total.toFixed(2);
  };

  // Filtreleme
  const filteredMenu = menuData.filter(m => {
    const matchesMonth = !selectedMonth || m.month === selectedMonth;
    const matchesYear = m.year === selectedYear;
    const matchesSearch = !searchTerm ||
      m.soup.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.mainCourse.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.sideDish.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesMonth && matchesYear && matchesSearch;
  });

  // Manuel düzenleme
  const handleEdit = (menu) => {
    setEditingDay(menu);
  };

  const handleSaveEdit = () => {
    const updated = menuData.map(m => m.id === editingDay.id ? editingDay : m);
    saveToStorage(updated);
    setEditingDay(null);
    setAlert({ type: 'success', message: 'Menü güncellendi!' });
    setTimeout(() => setAlert(null), 2000);
  };

  // Sil
  const handleDelete = (id) => {
    if (window.confirm('Bu menüyü silmek istediğinize emin misiniz?')) {
      const updated = menuData.filter(m => m.id !== id);
      saveToStorage(updated);
      setAlert({ type: 'success', message: 'Menü silindi!' });
      setTimeout(() => setAlert(null), 2000);
    }
  };

  // Toplu sil
  const handleClearMonth = () => {
    if (window.confirm(`${selectedMonth} ${selectedYear} ayındaki tüm menüleri silmek istediğinize emin misiniz?`)) {
      const updated = menuData.filter(m => !(m.month === selectedMonth && m.year === selectedYear));
      saveToStorage(updated);
      setAlert({ type: 'success', message: 'Ay menüsü temizlendi!' });
      setTimeout(() => setAlert(null), 2000);
    }
  };

  // İstatistikler
  const stats = {
    totalDays: filteredMenu.length,
    avgCO2: filteredMenu.length > 0
      ? (filteredMenu.reduce((sum, m) => sum + parseFloat(m.co2PerPortion), 0) / filteredMenu.length).toFixed(2)
      : 0,
    totalCO2: filteredMenu.reduce((sum, m) => sum + parseFloat(m.co2PerPortion), 0).toFixed(2)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <span className="text-4xl">🍽️</span>
                Aylık Yemek Listesi Yönetimi
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Excel dosyası yükleyin veya manuel olarak yemek listelerini yönetin
              </p>
            </div>

            {/* Excel Yükleme */}
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
              <div className="px-6 py-3 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-200 flex items-center gap-2">
                {uploading ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
                    </svg>
                    Yükleniyor...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                    </svg>
                    Excel Yükle
                  </>
                )}
              </div>
            </label>
          </div>

          {/* Alert */}
          {alert && (
            <div className={`p-4 rounded-xl mb-6 ${
              alert.type === 'success' 
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800'
            }`}>
              {alert.message}
            </div>
          )}

          {/* Filtreler */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(parseInt(e.target.value))}
              className="px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
            >
              {[2024, 2025, 2026].map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>

            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
            >
              <option value="">Tüm Aylar</option>
              <option value="OCAK">Ocak</option>
              <option value="ŞUBAT">Şubat</option>
              <option value="MART">Mart</option>
              <option value="NİSAN">Nisan</option>
              <option value="MAYIS">Mayıs</option>
              <option value="HAZİRAN">Haziran</option>
              <option value="TEMMUZ">Temmuz</option>
              <option value="AĞUSTOS">Ağustos</option>
              <option value="EYLÜL">Eylül</option>
              <option value="EKİM">Ekim</option>
              <option value="KASIM">Kasım</option>
              <option value="ARALIK">Aralık</option>
            </select>

            <input
              type="text"
              placeholder="🔍 Yemek ara..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
            />

            {selectedMonth && (
              <button
                onClick={handleClearMonth}
                className="px-4 py-3 bg-red-500 text-white rounded-xl font-semibold hover:bg-red-600 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
                Ayı Temizle
              </button>
            )}
          </div>

          {/* İstatistikler */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
              <div className="text-blue-600 dark:text-blue-400 text-sm font-semibold mb-1">Toplam Gün</div>
              <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">{stats.totalDays}</div>
            </div>
            <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <div className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold mb-1">Ortalama CO₂ (porsiyon)</div>
              <div className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">{stats.avgCO2} kg</div>
            </div>
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 p-4 rounded-xl border border-amber-200 dark:border-amber-800">
              <div className="text-amber-600 dark:text-amber-400 text-sm font-semibold mb-1">Toplam CO₂</div>
              <div className="text-3xl font-bold text-amber-900 dark:text-amber-100">{stats.totalCO2} kg</div>
            </div>
          </div>
        </div>

        {/* Tablo */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-100 dark:bg-slate-700">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Tarih</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Gün</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Çorba</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Ana Yemek</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Garnitür</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Salata</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Tatlı</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">CO₂/Porsiyon</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredMenu.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                      <div className="text-6xl mb-4">📋</div>
                      <div className="text-lg font-semibold">Henüz yemek listesi yok</div>
                      <div className="text-sm mt-2">Yukarıdaki "Excel Yükle" butonuna tıklayarak başlayın</div>
                    </td>
                  </tr>
                ) : (
                  filteredMenu.map((menu) => (
                    <tr key={menu.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900 dark:text-white">
                        {new Date(menu.date).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 dark:text-slate-400">
                        {menu.dayName}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">{menu.soup}</td>
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-white font-semibold">{menu.mainCourse}</td>
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">{menu.sideDish}</td>
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">{menu.salad}</td>
                      <td className="px-6 py-4 text-sm text-slate-900 dark:text-white">{menu.dessert}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 rounded-full text-xs font-semibold">
                          {menu.co2PerPortion} kg
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(menu)}
                            className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-all"
                            title="Düzenle"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(menu.id)}
                            className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
                            title="Sil"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
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

        {/* Düzenleme Modal */}
        {editingDay && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full p-6">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Menü Düzenle</h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Çorba</label>
                  <input
                    type="text"
                    value={editingDay.soup}
                    onChange={(e) => setEditingDay({...editingDay, soup: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Ana Yemek</label>
                  <input
                    type="text"
                    value={editingDay.mainCourse}
                    onChange={(e) => setEditingDay({...editingDay, mainCourse: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Garnitür</label>
                  <input
                    type="text"
                    value={editingDay.sideDish}
                    onChange={(e) => setEditingDay({...editingDay, sideDish: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Salata</label>
                  <input
                    type="text"
                    value={editingDay.salad}
                    onChange={(e) => setEditingDay({...editingDay, salad: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">Tatlı</label>
                  <input
                    type="text"
                    value={editingDay.dessert}
                    onChange={(e) => setEditingDay({...editingDay, dessert: e.target.value})}
                    className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 px-6 py-3 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-200"
                >
                  Kaydet
                </button>
                <button
                  onClick={() => setEditingDay(null)}
                  className="flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-200"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// DataEntry.jsx'de kullanmak için yardımcı fonksiyon
export function getMenuForDate(date) {
  const menus = JSON.parse(localStorage.getItem('monthlyMenus') || '[]');
  return menus.find(m => m.date === date) || null;
}