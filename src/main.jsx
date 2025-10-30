import React, { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  Route,
  useNavigate,
  Outlet,
  Navigate,
} from "react-router-dom";

/* ========== IMPORT PAGES ========== */
import Dashboard from "./pages/Dashboard";
import DataEntry from "./pages/DataEntry";
import OperationsDashboard from "./pages/OperationsDashboard";
import PersonalList from "./pages/PersonalList";
import PersonalEdit from "./pages/PersonalEdit";
import MonthlyMenuManager from "./pages/MonthlyMenuManager";

/* ========== GLOBAL STYLES ========== */
import "./index.css";

/* ========== NOTIFICATIONS ========== */
const NotificationSystem = ({ notifications, onClose }) => {
  return (
    <div className="fixed top-20 right-6 z-50 space-y-3 max-w-sm">
      {notifications.map((notif) => (
        <div
          key={notif.id}
          className={`
            backdrop-blur-xl rounded-2xl p-4 shadow-2xl border
            animate-slide-in-right
            ${notif.type === 'success' 
              ? 'bg-emerald-500/90 border-emerald-300/50 text-white' 
              : notif.type === 'error'
              ? 'bg-red-500/90 border-red-300/50 text-white'
              : 'bg-blue-500/90 border-blue-300/50 text-white'
            }
          `}
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl">
              {notif.type === 'success' ? '✓' : notif.type === 'error' ? '⚠' : 'ℹ'}
            </div>
            <div className="flex-1">
              <p className="font-semibold">{notif.title}</p>
              <p className="text-sm opacity-90">{notif.message}</p>
            </div>
            <button
              onClick={() => onClose(notif.id)}
              className="text-white/80 hover:text-white"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

/* ========== NOTES PANEL ========== */
function NotesPanel({ onClose, themeDark }) {
  const [notes, setNotes] = useState(() => {
    return JSON.parse(localStorage.getItem('myNotes') || '[]');
  });
  const [newNote, setNewNote] = useState('');
  const [filter, setFilter] = useState('all');

  const handleAdd = () => {
    if (newNote.trim()) {
      const updated = [...notes, {
        id: Date.now(),
        text: newNote,
        date: new Date().toISOString(),
        category: 'general',
        priority: 'normal'
      }];
      setNotes(updated);
      localStorage.setItem('myNotes', JSON.stringify(updated));
      setNewNote('');
    }
  };

  const handleDelete = (id) => {
    const updated = notes.filter(n => n.id !== id);
    setNotes(updated);
    localStorage.setItem('myNotes', JSON.stringify(updated));
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className={`${themeDark ? 'bg-slate-800' : 'bg-white'} rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] flex flex-col`}>
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-3">
              <span className="text-3xl">📝</span>
              Notlarım
              <span className="px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 text-sm font-semibold rounded-full">
                {notes.length}
              </span>
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
            >
              <svg className="w-6 h-6 text-slate-600 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"/>
              </svg>
            </button>
          </div>

          <div className="flex gap-2">
            {['all', 'today', 'week'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                  filter === f
                    ? 'bg-emerald-500 text-white'
                    : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                }`}
              >
                {f === 'all' ? 'Tümü' : f === 'today' ? 'Bugün' : 'Bu Hafta'}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <div className="relative">
              <textarea
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Yeni not ekle... (Markdown destekli)"
                className="w-full px-4 py-3 rounded-xl border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none resize-none"
                rows="3"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.metaKey) {
                    handleAdd();
                  }
                }}
              />
              <button
                onClick={handleAdd}
                disabled={!newNote.trim()}
                className="mt-2 px-6 py-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-emerald-500/50 hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ✓ Ekle (⌘ + Enter)
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {notes.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📋</div>
                <p className="text-slate-500 dark:text-slate-400 text-lg">Henüz not yok</p>
                <p className="text-slate-400 dark:text-slate-500 text-sm mt-2">İlk notunuzu ekleyin</p>
              </div>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  className="group p-4 bg-slate-50 dark:bg-slate-700 rounded-xl hover:shadow-lg transition-all border border-slate-200 dark:border-slate-600"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="text-slate-900 dark:text-white leading-relaxed">{note.text}</p>
                      <div className="flex items-center gap-3 mt-3">
                        <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                          </svg>
                          {new Date(note.date).toLocaleString('tr-TR')}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-all"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ========== ERROR BOUNDARY ========== */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("❌ ErrorBoundary caught:", error, errorInfo);
    this.setState({ errorInfo });

    // Send to error tracking service (Sentry, DataDog, etc.)
    // trackError(error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl p-8 max-w-2xl w-full border border-slate-200 dark:border-slate-700">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-red-100 dark:bg-red-900/30 rounded-2xl">
                <svg className="w-8 h-8 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Beklenmeyen Bir Hata Oluştu
                </h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">
                  Teknik ekibimiz bilgilendirildi
                </p>
              </div>
            </div>

            <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 mb-6 max-h-40 overflow-y-auto">
              <p className="text-sm text-slate-700 dark:text-slate-300 font-mono">
                {this.state.error?.toString()}
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-6 py-3 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-emerald-500/50 hover:scale-105 transition-all duration-200"
              >
                <span className="flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
                  </svg>
                  Sayfayı Yenile
                </span>
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="flex-1 px-6 py-3 bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white rounded-xl font-semibold hover:bg-slate-300 dark:hover:bg-slate-600 transition-all duration-200"
              >
                Ana Sayfaya Dön
              </button>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Error ID: {Date.now()} | {new Date().toISOString()}
              </p>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/* ========== APP LAYOUT ========== */
function AppLayout({
  themeDark,
  toggleTheme,
  showNotesPanel,
  setShowNotesPanel,
  notifications,
  removeNotification,
}) {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [notesCount, setNotesCount] = useState(0);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const notes = JSON.parse(localStorage.getItem("myNotes") || "[]");
    setNotesCount(notes.length);
  }, [showNotesPanel]);

  const isActive = (path) => {
    return window.location.pathname === path;
  };

  const NavLink = ({ to, icon, label, badge }) => (
    <button
      onClick={() => navigate(to)}
      className={`
        px-4 py-2.5 rounded-xl font-semibold text-sm
        transition-all duration-300 flex items-center gap-2
        ${isActive(to)
          ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-600/30 scale-105"
          : themeDark
          ? "text-slate-300 hover:text-emerald-400 hover:bg-slate-800/50"
          : "text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/50"
        }
        hover:scale-105
      `}
    >
      <span className="text-lg">{icon}</span>
      <span className="hidden lg:inline">{label}</span>
      {badge > 0 && (
        <span className="px-2 py-0.5 bg-red-500 text-white text-xs font-bold rounded-full">
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  );

  return (
    <>
      {/* NOTIFICATIONS */}
      <NotificationSystem notifications={notifications} onClose={removeNotification} />

      {/* NAVBAR */}
      <nav
        className={`
          fixed top-0 left-0 right-0 z-40
          backdrop-blur-2xl
          ${themeDark 
            ? "bg-slate-950/80 border-slate-800/60" 
            : "bg-white/95 border-slate-200/60"
          }
          border-b
          transition-all duration-500
          ${scrolled ? "py-2 shadow-2xl" : "py-4 shadow-xl"}
          ${themeDark ? "shadow-slate-900/50" : "shadow-slate-900/10"}
        `}
      >
        <div className="max-w-[1800px] mx-auto px-6">
          <div className="flex items-center justify-between gap-6">
            {/* LOGO */}
            <button
              onClick={() => navigate("/")}
              className="flex items-center gap-3 group relative"
            >
              <div className="relative">
                <div className={`
                  absolute inset-0 rounded-2xl blur-xl transition-opacity duration-300
                  ${themeDark ? "bg-emerald-500/50 group-hover:opacity-75" : "bg-emerald-500/20 group-hover:opacity-30"}
                `} />

                <div className={`
                  relative w-12 h-12 rounded-2xl flex items-center justify-center
                  ${themeDark ? "bg-slate-900" : "bg-white"}
                  border-2
                  ${themeDark ? "border-emerald-500/30" : "border-emerald-500/20"}
                  group-hover:scale-110 transition-transform duration-300
                  shadow-xl
                `}>
                  <svg className="w-7 h-7 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                </div>
              </div>

              <div className="hidden md:block">
                <div className={`text-xl font-bold tracking-tight ${themeDark ? "text-white" : "text-slate-900"}`}>
                  CarbonAI
                </div>
                <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                  Global Sustainability Platform
                </div>
              </div>
            </button>

            {/* NAVIGATION */}
            <div className="flex-1 hidden xl:flex items-center justify-center">
              <div className={`
                flex items-center gap-2 px-4 py-3 rounded-2xl
                ${themeDark 
                  ? "bg-gradient-to-br from-slate-900/50 to-slate-800/50 border border-slate-700/50" 
                  : "bg-gradient-to-br from-slate-50/50 to-slate-100/50 border border-slate-200/60"
                }
                shadow-lg
              `}>
                <NavLink to="/" icon="📊" label="Dashboard" />
                <NavLink to="/data-entry" icon="📝" label="Veri Girişi" />
                <NavLink to="/operations" icon="⚡" label="Operasyonlar" />
                <NavLink to="/personnel" icon="👥" label="Personel" />
                <NavLink to="/menu-manager" icon="🍽️" label="Yemek" />
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center gap-3">
              {/* Notes */}
              <button
                onClick={() => setShowNotesPanel(!showNotesPanel)}
                className="relative px-4 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-br from-amber-500 to-amber-600 text-white shadow-lg hover:shadow-amber-500/50 hover:scale-105 transition-all hidden md:flex items-center gap-2"
              >
                <span>📝</span>
                <span className="hidden lg:inline">Notlar</span>
                {notesCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-pulse">
                    {notesCount > 9 ? "9+" : notesCount}
                  </span>
                )}
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`
                  p-3 rounded-xl transition-all shadow-lg
                  ${themeDark
                    ? "bg-slate-800 text-amber-400 hover:bg-slate-700 shadow-slate-900/50"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200 shadow-slate-900/10"
                  }
                  hover:scale-110
                `}
                aria-label="Tema değiştir"
              >
                {themeDark ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
                  </svg>
                )}
              </button>

              {/* User Menu */}
              <div className="relative hidden xl:block">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className={`
                    flex items-center gap-3 px-4 py-2.5 rounded-xl
                    ${themeDark ? "bg-slate-800/50 hover:bg-slate-800" : "bg-slate-50 hover:bg-slate-100"}
                    border ${themeDark ? "border-slate-700" : "border-slate-200"}
                    transition-all shadow-lg
                  `}
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center text-white font-bold text-sm shadow-lg">
                    K
                  </div>
                  <div className="text-left">
                    <div className={`text-sm font-semibold ${themeDark ? "text-white" : "text-slate-900"}`}>
                      Kullanıcı
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">
                      Administrator
                    </div>
                  </div>
                  <svg className={`w-4 h-4 ${themeDark ? 'text-slate-400' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>

                {showUserMenu && (
                  <div className={`
                    absolute top-full right-0 mt-2 w-64 rounded-xl shadow-2xl border
                    ${themeDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}
                    overflow-hidden z-50
                  `}>
                    <div className="p-4 border-b border-slate-200 dark:border-slate-700">
                      <p className={`font-semibold ${themeDark ? 'text-white' : 'text-slate-900'}`}>Kullanıcı</p>
                      <p className="text-sm text-slate-500 dark:text-slate-400">admin@carbonai.com</p>
                    </div>
                    <div className="p-2">
                      <button className="w-full text-left px-4 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors">
                        ⚙️ Ayarlar
                      </button>
                      <button className="w-full text-left px-4 py-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors">
                        👤 Profil
                      </button>
                      <button className="w-full text-left px-4 py-2.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors">
                        🚪 Çıkış Yap
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* MOBILE MENU */}
          <div className="xl:hidden mt-4 grid grid-cols-3 gap-2">
            <NavLink to="/" icon="📊" label="Dashboard" />
            <NavLink to="/data-entry" icon="📝" label="Veri" />
            <NavLink to="/operations" icon="⚡" label="Ops" />
            <NavLink to="/personnel" icon="👥" label="Personel" />
            <NavLink to="/menu-manager" icon="🍽️" label="Yemek" />
            <button
              onClick={() => setShowNotesPanel(!showNotesPanel)}
              className="relative px-4 py-2.5 rounded-xl font-semibold text-sm bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center gap-2"
            >
              <span>📝</span>
              <span>Not</span>
              {notesCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  {notesCount > 9 ? "9+" : notesCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <div className="pt-24 md:pt-20">
        <Outlet context={{ themeDark }} />
      </div>

      {/* NOTES PANEL */}
      {showNotesPanel && (
        <NotesPanel
          onClose={() => setShowNotesPanel(false)}
          themeDark={themeDark}
        />
      )}
    </>
  );
}

/* ========== MAIN APP ========== */
function App() {
  const [themeDark, setThemeDark] = useState(() => {
    const saved = localStorage.getItem("theme");
    return saved ? saved === "dark" : true;
  });

  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const toggleTheme = () => {
    setThemeDark((prev) => {
      const newTheme = !prev;
      localStorage.setItem("theme", newTheme ? "dark" : "light");
      return newTheme;
    });
  };

  const addNotification = (type, title, message) => {
    const id = Date.now();
    setNotifications(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      removeNotification(id);
    }, 5000);
  };

  const removeNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  useEffect(() => {
    if (themeDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [themeDark]);

  // Welcome notification
  useEffect(() => {
    addNotification('success', 'Hoş Geldiniz!', 'CarbonAI Global Platform');
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route
            element={
              <AppLayout
                themeDark={themeDark}
                toggleTheme={toggleTheme}
                showNotesPanel={showNotesPanel}
                setShowNotesPanel={setShowNotesPanel}
                notifications={notifications}
                removeNotification={removeNotification}
              />
            }
          >
            <Route path="/" element={<Dashboard />} />
            <Route path="/data-entry" element={<DataEntry />} />
            <Route path="/operations" element={<OperationsDashboard />} />
            <Route path="/personnel" element={<PersonalList />} />
            <Route path="/personnel/new" element={<PersonalEdit />} />
            <Route path="/personnel/edit/:id" element={<PersonalEdit />} />
            <Route path="/menu-manager" element={<MonthlyMenuManager />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

/* ========== RENDER ========== */
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);