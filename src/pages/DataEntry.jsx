import React, { useState } from 'react';

export default function DataEntry() {
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [alert, setAlert] = useState(null);

  // Form data
  const [formData, setFormData] = useState({
    // Filo
    vehicleCount: 0,
    totalKm: 0,
    fuelType: 'Benzin',

    // Personel Ulaşımı
    personnelCount: 0,
    commuteMode: 'Toplu Taşıma',
    avgCommuteKm: 25,

    // Makineler
    machineCount: 0,
    machineType: 'Orta',
    totalKwh: 0,

    // Yemekhane
    canteenPortions: 0,
    menuType: 'Standart'
  });

  // CO2 Factors
  const fuelFactors = {
    'Dizel': 0.171,
    'Benzin': 0.192,
    'LPG': 0.163,
    'Elektrik': 0.041,
    'Hibrit': 0.090
  };

  const commuteFactors = {
    'Toplu Taşıma': 0.082,
    'Servis': 0.120,
    'Şahsi Araç': 0.192,
    'Yürüyüş/Bisiklet': 0
  };

  const machineKwh = {
    'Ağır': 80,
    'Orta': 50,
    'Hafif': 30,
    'Standart': 50
  };

  const menuCO2 = {
    'Standart': 1.8,
    'Vejetaryen': 1.2,
    'Vegan': 0.9,
    'Et Ağırlıklı': 2.5
  };

  // Calculate CO2
  const calculateFleetCO2 = () => {
    const factor = fuelFactors[formData.fuelType];
    return (formData.totalKm * factor).toFixed(2);
  };

  const calculateCommuteCO2 = () => {
    const factor = commuteFactors[formData.commuteMode];
    const totalKm = formData.personnelCount * formData.avgCommuteKm;
    return (totalKm * factor).toFixed(2);
  };

  const calculateMachineCO2 = () => {
    const electricityFactor = 0.014; // Turkey mix
    return (formData.totalKwh * electricityFactor).toFixed(2);
  };

  const calculateCanteenCO2 = () => {
    const factor = menuCO2[formData.menuType];
    return (formData.canteenPortions * factor).toFixed(2);
  };

  const totalCO2 = (
    parseFloat(calculateFleetCO2()) +
    parseFloat(calculateCommuteCO2()) +
    parseFloat(calculateMachineCO2()) +
    parseFloat(calculateCanteenCO2())
  ).toFixed(2);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['vehicleCount', 'totalKm', 'personnelCount', 'avgCommuteKm', 'machineCount', 'totalKwh', 'canteenPortions'].includes(name)
        ? parseFloat(value) || 0
        : value
    }));
  };

  // Save data
  const handleSave = () => {
    const dataEntry = {
      date: selectedDate,
      formData: formData,
      calculations: {
        fleet: calculateFleetCO2(),
        commute: calculateCommuteCO2(),
        machines: calculateMachineCO2(),
        canteen: calculateCanteenCO2(),
        total: totalCO2
      },
      timestamp: new Date().toISOString()
    };

    try {
      const existing = JSON.parse(localStorage.getItem('dailyOperations') || '[]');
      const filtered = existing.filter(e => e.date !== selectedDate);
      filtered.push(dataEntry);
      localStorage.setItem('dailyOperations', JSON.stringify(filtered));

      setAlert({ type: 'success', message: 'Veri başarıyla kaydedildi!' });
      setTimeout(() => setAlert(null), 3000);
    } catch (error) {
      setAlert({ type: 'error', message: 'Kayıt hatası!' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
                <span className="text-4xl">📊</span>
                Günlük Veri Girişi
              </h1>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Günlük operasyon verilerini girin
              </p>
            </div>

            <input
              type="date"
              value={selectedDate}
              max={new Date().toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-6 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-semibold focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
            />
          </div>

          {/* Alert */}
          {alert && (
            <div className={`p-4 rounded-xl mb-6 ${
              alert.type === 'success' 
                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300'
                : 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300'
            }`}>
              {alert.message}
            </div>
          )}

          {/* Total CO2 */}
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 rounded-xl p-6 border-2 border-emerald-200 dark:border-emerald-800">
            <div className="text-emerald-600 dark:text-emerald-400 text-sm font-semibold mb-2 uppercase tracking-wider">
              Günlük Toplam Emisyon
            </div>
            <div className="text-5xl font-bold text-emerald-900 dark:text-emerald-100">
              {totalCO2} <span className="text-2xl">kg CO₂</span>
            </div>
          </div>
        </div>

        {/* Input Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Filo */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">🚗</span>
              Filo
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Araç Sayısı
                </label>
                <input
                  type="number"
                  name="vehicleCount"
                  value={formData.vehicleCount}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Toplam KM
                </label>
                <input
                  type="number"
                  name="totalKm"
                  value={formData.totalKm}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Yakıt Tipi
                </label>
                <select
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                >
                  <option value="Dizel">Dizel</option>
                  <option value="Benzin">Benzin</option>
                  <option value="LPG">LPG</option>
                  <option value="Elektrik">Elektrik</option>
                  <option value="Hibrit">Hibrit</option>
                </select>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">CO₂ Emisyonu</span>
                  <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{calculateFleetCO2()} kg</span>
                </div>
              </div>
            </div>
          </div>

          {/* Personel Ulaşımı */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">🚌</span>
              Personel Ulaşımı
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Personel Sayısı
                </label>
                <input
                  type="number"
                  name="personnelCount"
                  value={formData.personnelCount}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Ulaşım Şekli
                </label>
                <select
                  name="commuteMode"
                  value={formData.commuteMode}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                >
                  <option value="Toplu Taşıma">Toplu Taşıma</option>
                  <option value="Servis">Servis</option>
                  <option value="Şahsi Araç">Şahsi Araç</option>
                  <option value="Yürüyüş/Bisiklet">Yürüyüş/Bisiklet</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Ortalama KM (kişi başı)
                </label>
                <input
                  type="number"
                  name="avgCommuteKm"
                  value={formData.avgCommuteKm}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">CO₂ Emisyonu</span>
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">{calculateCommuteCO2()} kg</span>
                </div>
              </div>
            </div>
          </div>

          {/* Makineler */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">⚙️</span>
              Makineler
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Makine Sayısı
                </label>
                <input
                  type="number"
                  name="machineCount"
                  value={formData.machineCount}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Makine Tipi
                </label>
                <select
                  name="machineType"
                  value={formData.machineType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                >
                  <option value="Ağır">Ağır (80 kWh/gün)</option>
                  <option value="Orta">Orta (50 kWh/gün)</option>
                  <option value="Hafif">Hafif (30 kWh/gün)</option>
                  <option value="Standart">Standart (50 kWh/gün)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Toplam kWh
                </label>
                <input
                  type="number"
                  name="totalKwh"
                  value={formData.totalKwh}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">CO₂ Emisyonu</span>
                  <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">{calculateMachineCO2()} kg</span>
                </div>
              </div>
            </div>
          </div>

          {/* Yemekhane */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-6">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">🍽️</span>
              Yemekhane
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Porsiyon Sayısı
                </label>
                <input
                  type="number"
                  name="canteenPortions"
                  value={formData.canteenPortions}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  Menü Tipi
                </label>
                <select
                  name="menuType"
                  value={formData.menuType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-emerald-500 outline-none"
                >
                  <option value="Standart">Standart (1.8 kg/porsiyon)</option>
                  <option value="Vejetaryen">Vejetaryen (1.2 kg/porsiyon)</option>
                  <option value="Vegan">Vegan (0.9 kg/porsiyon)</option>
                  <option value="Et Ağırlıklı">Et Ağırlıklı (2.5 kg/porsiyon)</option>
                </select>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">CO₂ Emisyonu</span>
                  <span className="text-2xl font-bold text-red-600 dark:text-red-400">{calculateCanteenCO2()} kg</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="mt-6">
          <button
            onClick={handleSave}
            className="w-full px-8 py-4 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-2xl font-bold text-lg shadow-2xl hover:shadow-emerald-500/50 hover:scale-[1.02] transition-all duration-200"
          >
            💾 Kaydet
          </button>
        </div>
      </div>
    </div>
  );
}