// src/api.js
// ==========================================================
//  CarbonAI - Tekil API katmanı (axios + fallback/mock)
// ==========================================================

import axios from "axios";

// Tek axios instance
export const api = axios.create({
  baseURL: "http://127.0.0.1:8010", // backend burada çalışıyorsa direkt buradan çeker
  // withCredentials: true, // gerekiyorsa aç
});

// ----------------------------------------------------------
// 1) TESİS / EMİSYON VERİLERİ
// ----------------------------------------------------------

export async function fetchFacility(facilityId) {
  try {
    const { data } = await api.get(`/facility/${facilityId}`);
    return data;
  } catch {
    // Backend yoksa minimal mock
    return { id: facilityId, name: "YALOVA FABRİKASI" };
  }
}

export async function fetchEmissions(facilityId, month) {
  try {
    const { data } = await api.get(`/facility/${facilityId}/emissions`, {
      params: { month },
    });
    return data;
  } catch {
    // Fallback mock
    return {
      facility_id: facilityId,
      month,
      total_co2_kg: 26040,
      by_energy_type: [{ energy_type: "Elektrik", co2_kg: 26040 }],
    };
  }
}

// Veri girişi (elektrik/doğalgaz vs.)
export async function createEnergyRecord(payload) {
  const { data } = await api.post("/energy-record", payload);
  return data;
}

// ----------------------------------------------------------
// 2) OPERASYON ÖZETİ (filo / servis / makine / yemekhane)
// ----------------------------------------------------------

export async function fetchOperationsSummary(facilityId, month) {
  try {
    const { data } = await api.get(`/operations-summary`, {
      params: { facility_id: facilityId, month },
    });
    return data;
  } catch {
    // UI çalışsın diye örnek mock
    return {
      fleet_daily_km: 480,
      fleet_co2_kg: 92.4,
      commute_breakdown: {
        personel_sayisi: 128,
        toplu_tasima_yuzde: 0.42,
        servis_yuzde: 0.37,
        sahsi_arac_yuzde: 0.21,
        tahmini_co2_kg: 51.3,
      },
      factory_machines: {
        aktif_makine_sayisi: 37,
        gunluk_elektrik_kwh: 1820,
        tahmini_co2_kg: 26.0,
      },
      canteen: {
        bugun_menu: "Tavuk sote, pilav, ayran",
        tahmini_co2_kg: 14.2,
      },
    };
  }
}

// ----------------------------------------------------------
// 3) PERSONEL KARBON TAKİBİ (işe gidip gelme)
// ----------------------------------------------------------

export async function fetchEmployeeCarbon(facilityId) {
  try {
    // Backend hazır olduğunda aç:
    // const { data } = await api.get(`/employee-carbon`, { params: { facility_id: facilityId }});
    // return data;
    throw new Error("no-backend");
  } catch {
    // Günlük (kg CO2) örnek mock
    return [
      {
        employee_id: 101,
        name: "Ahmet Yılmaz",
        department: "Üretim",
        commute_mode: "Şahsi Araç (Dizel)",
        daily_km: 38,
        co2_kg: 7.4,
      },
      {
        employee_id: 102,
        name: "Elif Koç",
        department: "Kalite",
        commute_mode: "Servis",
        daily_km: 26,
        co2_kg: 3.1,
      },
      {
        employee_id: 103,
        name: "Murat Demir",
        department: "Bakım",
        commute_mode: "Şahsi Araç (Benzin)",
        daily_km: 52,
        co2_kg: 9.2,
      },
      {
        employee_id: 104,
        name: "Zeynep Arslan",
        department: "Ar-Ge",
        commute_mode: "Toplu Taşıma",
        daily_km: 22,
        co2_kg: 1.8,
      },
      {
        employee_id: 105,
        name: "Berk Can",
        department: "Lojistik",
        commute_mode: "Firma Aracı",
        daily_km: 64,
        co2_kg: 11.3,
      },
      {
        employee_id: 106,
        name: "Gamze Şahin",
        department: "Satınalma",
        commute_mode: "Elektrikli Araç",
        daily_km: 31,
        co2_kg: 1.2,
      },
    ];
  }
}

// ----------------------------------------------------------
// 4) PERSONEL CRUD (localStorage bazlı dev helper’lar)
//    Backend geldiğinde aynı arayüzü gerçek endpoint’e bağlarız.
// ----------------------------------------------------------

const PERSONNEL_KEY = "carbonai_personnel_v1";
const MACHINES_KEY = "carbonai_machines_v1";       // isteğe bağlı fallback
const VEHICLES_KEY = "carbonai_vehicles_v1";       // isteğe bağlı fallback
const ASSIGNMENTS_KEY = "carbonai_assignments_v1"; // isteğe bağlı fallback

function getLocalList(key) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalList(key, list) {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch (e) {
    console.error("localStorage write failed:", key, e);
  }
}

export function listPersonnel() {
  return getLocalList(PERSONNEL_KEY);
}

export function savePersonnelList(list) {
  setLocalList(PERSONNEL_KEY, list);
}

export function createPersonnel(person) {
  const list = listPersonnel();
  const id = Date.now(); // basit id
  const item = { ...person, id };
  list.push(item);
  savePersonnelList(list);
  return item;
}

export function updatePersonnel(id, patch) {
  const list = listPersonnel();
  const idx = list.findIndex((p) => p.id === id);
  if (idx === -1) throw new Error("Person not found");
  list[idx] = { ...list[idx], ...patch };
  savePersonnelList(list);
  return list[idx];
}

export function deletePersonnel(id) {
  const list = listPersonnel();
  const nl = list.filter((p) => p.id !== id);
  savePersonnelList(nl);
  return true;
}

// ----------------------------------------------------------
// 5) TÜRETİLMİŞ METRİKLER (Dashboard üst kartlar vb.)
//    Öncelik backend /fallback computeDerivedFallback
// ----------------------------------------------------------

export async function fetchDerivedMetrics(facilityId, month) {
  try {
    const { data } = await api.get(`/facility/${facilityId}/derived-metrics`, {
      params: { month },
    });
    return data; // { machine_count, active_machine_count, vehicle_count, ... }
  } catch {
    return computeDerivedFallback(facilityId, month);
  }
}

/**
 * Backend yoksa localStorage ve/veya basit GET’lerle
 * metrik hesaplayan fallback.
 */
export async function computeDerivedFallback(facilityId, month) {
  // Önce backend endpoint’lerini dene; olmazsa localStorage’tan oku.
  let machines = [];
  let vehicles = [];
  let personnel = [];
  let assignments = [];

  // Backend’i dene
  try {
    const [mRes, vRes, pRes, aRes] = await Promise.all([
      api.get(`/machines`, { params: { facility_id: facilityId } }),
      api.get(`/vehicles`, { params: { facility_id: facilityId } }),
      api.get(`/personnel`, { params: { facility_id: facilityId } }),
      api.get(`/assignments`, { params: { facility_id: facilityId, month } }),
    ]);
    machines = mRes.data || [];
    vehicles = vRes.data || [];
    personnel = pRes.data || [];
    assignments = aRes.data || [];
  } catch {
    // localStorage fallback
    machines = getLocalList(MACHINES_KEY);
    vehicles = getLocalList(VEHICLES_KEY);
    personnel = getLocalList(PERSONNEL_KEY);
    assignments = getLocalList(ASSIGNMENTS_KEY);
  }

  const machine_count = machines.length;
  const active_machine_count = machines.filter((m) => m.status === "active").length;

  const vehicle_count = vehicles.length;

  const personnel_count = personnel.length;
  const headcount_by_title = personnel.reduce((acc, p) => {
    const t = p.title || "Bilinmiyor";
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  const machine_usage_hours = assignments
    .filter((a) => a.type === "machine_usage")
    .reduce((sum, a) => sum + (Number(a.hours) || 0), 0);

  const vehicle_km = assignments
    .filter((a) => a.type === "vehicle_trip")
    .reduce((sum, a) => sum + (Number(a.km) || 0), 0);

  return {
    facility_id: facilityId,
    month,
    machine_count,
    active_machine_count,
    vehicle_count,
    personnel_count,
    headcount_by_title,
    machine_usage_hours,
    vehicle_km,
  };
}

// ----------------------------------------------------------
// (İsteğe bağlı) localStorage’a makine/araç/atama yazmak için
// yardımcı setter’lar — UI’dan seed etmek istersen kullan.
// ----------------------------------------------------------

export function saveMachines(list) {
  setLocalList(MACHINES_KEY, list);
}
export function saveVehicles(list) {
  setLocalList(VEHICLES_KEY, list);
}
export function saveAssignments(list) {
  setLocalList(ASSIGNMENTS_KEY, list);
}