import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";

/**
 * Login - Ultra profesyonel giriş sayfası
 * - Animated splash screen
 * - Modern glassmorphism design
 * - Smooth transitions
 * - Accessibility compliant
 */
export default function Login() {
  const [dark, setDark] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // Splash screen timer
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  // Form validation
  const isFormValid = useMemo(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return email && password.length >= 6 && emailRegex.test(email);
  }, [email, password]);

  // Handle submit
  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      setError(null);

      if (!isFormValid) {
        setError("Lütfen geçerli bir e-posta ve şifre (min 6 karakter) girin.");
        return;
      }

      setLoadingSubmit(true);

      // Simulated API call
      setTimeout(() => {
        // Demo credentials
        if (email === "demo@carbonai.com" && password === "demo123") {
          navigate("/");
        } else {
          setLoadingSubmit(false);
          setError("Geçersiz e-posta veya şifre. Demo için: demo@carbonai.com / demo123");
        }
      }, 1200);
    },
    [email, password, isFormValid, navigate]
  );

  const handleToggleTheme = useCallback(() => {
    setDark((d) => !d);
  }, []);

  const handleForgotPassword = useCallback(() => {
    alert("Şifre sıfırlama özelliği yakında eklenecek.");
  }, []);

  // Splash Screen
  if (showSplash) {
    return (
      <div
        className={`min-h-screen flex items-center justify-center relative overflow-hidden transition-colors duration-700 ${
          dark ? "bg-slate-950 text-slate-100" : "bg-white text-slate-900"
        }`}
      >
        {/* Theme toggle */}
        <button
          onClick={handleToggleTheme}
          className={`absolute top-4 right-4 z-50 inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-[12px] font-medium shadow-lg transition-all hover:scale-105 backdrop-blur-xl ${
            dark
              ? "border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700/90 shadow-slate-900/50"
              : "border-slate-200 bg-white/80 text-slate-700 hover:bg-white/95 shadow-slate-900/10"
          }`}
          aria-label={dark ? "Açık temaya geç" : "Koyu temaya geç"}
        >
          <span className="text-lg leading-none" aria-hidden="true">
            {dark ? "🌙" : "☀️"}
          </span>
          <span>{dark ? "Dark" : "Light"}</span>
        </button>

        {/* Animated background glow */}
        <div
          className={`absolute blur-[120px] opacity-40 pointer-events-none rounded-full animate-pulse-slow ${
            dark ? "bg-emerald-500/30" : "bg-emerald-400/25"
          }`}
          style={{
            width: "50rem",
            height: "50rem",
            top: "40%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            animation: "breathe 4s ease-in-out infinite",
          }}
        />

        {/* Secondary glow */}
        <div
          className={`absolute blur-[100px] opacity-20 pointer-events-none rounded-full ${
            dark ? "bg-blue-500/20" : "bg-blue-400/15"
          }`}
          style={{
            width: "40rem",
            height: "40rem",
            top: "60%",
            left: "30%",
            animation: "float 6s ease-in-out infinite",
          }}
        />

        {/* Logo container */}
        <div className="relative flex flex-col items-center text-center select-none">
          {/* Main logo text */}
          <div className="relative">
            <div
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-[0.1em]"
              style={{
                color: "transparent",
                textShadow: dark
                  ? "0 0 2px #94a3b8, 0 0 4px #94a3b8, 0 0 8px #94a3b844"
                  : "0 0 2px #1e293b, 0 0 4px #1e293b, 0 0 8px #1e293b22",
              }}
            >
              CARBONAI
            </div>

            {/* Gradient fill animation */}
            <div
              className="absolute top-0 left-0 right-0 text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-[0.1em] bg-clip-text text-transparent"
              style={{
                backgroundImage: dark
                  ? "linear-gradient(110deg, rgba(16,185,129,1) 0%, rgba(52,211,153,0.9) 30%, rgba(16,185,129,0.6) 60%, rgba(16,185,129,0) 100%)"
                  : "linear-gradient(110deg, rgba(5,150,105,1) 0%, rgba(16,185,129,0.95) 30%, rgba(52,211,153,0.7) 60%, rgba(16,185,129,0) 100%)",
                WebkitBackgroundClip: "text",
                backgroundSize: "200% 100%",
                animation: "revealFill 3s cubic-bezier(0.4, 0, 0.2, 1) forwards",
              }}
            >
              CARBONAI
            </div>
          </div>

          {/* Subtitle */}
          <div
            className={`mt-6 text-[13px] font-semibold tracking-widest uppercase flex items-center gap-2 ${
              dark ? "text-slate-400" : "text-slate-500"
            }`}
            style={{ animation: "fadeInUp 1s ease 1.5s backwards" }}
          >
            <div className="h-px w-8 bg-current opacity-40" />
            <span>Kurumsal Karbon İzleme</span>
            <div className="h-px w-8 bg-current opacity-40" />
          </div>

          {/* Loading indicator */}
          <div
            className="mt-8 flex gap-1.5"
            style={{ animation: "fadeInUp 1s ease 2s backwards" }}
          >
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={`w-2 h-2 rounded-full ${
                  dark ? "bg-emerald-400" : "bg-emerald-600"
                }`}
                style={{
                  animation: `bounce 1.4s ease-in-out ${i * 0.2}s infinite`,
                }}
              />
            ))}
          </div>
        </div>

        <style>{`
          @keyframes revealFill {
            0%   { clip-path: inset(0 100% 0 0); opacity: 0.2; filter: brightness(0.7) blur(2px); }
            50%  { clip-path: inset(0 40% 0 0);  opacity: 0.9; filter: brightness(1.1) blur(0); }
            100% { clip-path: inset(0 0% 0 0);   opacity: 1;   filter: brightness(1.15) blur(0); }
          }
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to   { opacity: 1; transform: translateY(0); }
          }
          @keyframes breathe {
            0%, 100% { transform: translate(-50%, -50%) scale(1); }
            50%      { transform: translate(-50%, -50%) scale(1.1); }
          }
          @keyframes float {
            0%, 100% { transform: translate(0, 0); }
            50%      { transform: translate(20px, -20px); }
          }
          @keyframes bounce {
            0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
            40% { transform: translateY(-12px); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  // Login Form
  return (
    <div
      className={`min-h-screen flex flex-col relative transition-colors duration-500 ${
        dark
          ? "bg-slate-950 text-slate-100"
          : "bg-gradient-to-br from-white via-emerald-50/30 to-blue-50/20 text-slate-800"
      }`}
    >
      {/* Animated background elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className={`absolute blur-[140px] opacity-30 rounded-full ${
            dark ? "bg-emerald-500/20" : "bg-emerald-400/15"
          }`}
          style={{
            width: "60rem",
            height: "60rem",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            animation: "breathe 8s ease-in-out infinite",
          }}
        />
        <div
          className={`absolute blur-[100px] opacity-20 rounded-full ${
            dark ? "bg-blue-500/15" : "bg-blue-400/10"
          }`}
          style={{
            width: "40rem",
            height: "40rem",
            bottom: "10%",
            right: "10%",
            animation: "float 10s ease-in-out infinite",
          }}
        />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-5">
        <div className="flex items-center gap-3">
          <div
            className={`flex items-center justify-center w-11 h-11 rounded-xl text-white text-[13px] font-bold shadow-lg ring-1 transition-transform hover:scale-105 ${
              dark
                ? "bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-emerald-900/50 ring-emerald-500/30"
                : "bg-gradient-to-br from-emerald-600 to-emerald-700 shadow-emerald-600/40 ring-emerald-500/20"
            }`}
          >
            <span className="tracking-tighter">CO₂</span>
          </div>
          <div className="flex flex-col leading-tight">
            <div
              className={`text-[15px] font-bold ${
                dark ? "text-white" : "text-slate-900"
              }`}
            >
              CarbonAI
            </div>
            <div
              className={`text-[11px] tracking-wide ${
                dark ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Sustainability Platform
            </div>
          </div>
        </div>

        <button
          onClick={handleToggleTheme}
          className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2 text-[12px] font-medium shadow-sm transition-all hover:scale-105 backdrop-blur-xl ${
            dark
              ? "border-slate-700 bg-slate-800/80 text-slate-200 hover:bg-slate-700/90"
              : "border-slate-200 bg-white/80 text-slate-700 hover:bg-white/95"
          }`}
          aria-label={dark ? "Açık temaya geç" : "Koyu temaya geç"}
        >
          <span className="text-base leading-none" aria-hidden="true">
            {dark ? "🌙" : "☀️"}
          </span>
          <span className="hidden sm:inline">{dark ? "Dark" : "Light"}</span>
        </button>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 py-10 sm:py-16">
        <div
          className={`w-full max-w-md rounded-3xl border shadow-2xl backdrop-blur-2xl ring-1 transition-all duration-500 ${
            dark
              ? "bg-slate-900/70 border-slate-700/50 ring-slate-800/30 shadow-black/50"
              : "bg-white/70 border-white/40 ring-white/20 shadow-slate-900/10"
          }`}
          style={{
            animation: "fadeInScale 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards",
          }}
        >
          <div className="p-8 sm:p-10 flex flex-col gap-7">
            {/* Header */}
            <div className="flex flex-col gap-2 text-center">
              <h1
                className={`text-lg font-bold ${
                  dark ? "text-slate-100" : "text-slate-900"
                }`}
              >
                Hoş Geldiniz
              </h1>
              <p
                className={`text-[12px] leading-relaxed ${
                  dark ? "text-slate-400" : "text-slate-500"
                }`}
              >
                Hesabınıza giriş yaparak tesis emisyon verilerinizi yönetin ve
                sürdürülebilirlik hedeflerinizi takip edin.
              </p>
            </div>

            {/* Form */}
            <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
              {/* Email */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="email"
                  className={`text-[12px] font-semibold ${
                    dark ? "text-slate-200" : "text-slate-700"
                  }`}
                >
                  E-posta Adresi
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 text-[14px] outline-none transition-all focus:scale-[1.01] ${
                    dark
                      ? "bg-slate-800/70 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 focus:bg-slate-800"
                      : "bg-white/70 border-slate-300 text-slate-800 placeholder-slate-400 backdrop-blur-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 focus:bg-white"
                  }`}
                  placeholder="ornek@sirket.com"
                  autoComplete="email"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-2">
                <label
                  htmlFor="password"
                  className={`text-[12px] font-semibold ${
                    dark ? "text-slate-200" : "text-slate-700"
                  }`}
                >
                  Şifre
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full rounded-xl border px-4 py-3 pr-12 text-[14px] outline-none transition-all focus:scale-[1.01] ${
                      dark
                        ? "bg-slate-800/70 border-slate-700 text-slate-100 placeholder-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/30 focus:bg-slate-800"
                        : "bg-white/70 border-slate-300 text-slate-800 placeholder-slate-400 backdrop-blur-sm focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600/20 focus:bg-white"
                    }`}
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-lg transition-colors ${
                      dark
                        ? "text-slate-400 hover:text-slate-200 hover:bg-slate-700"
                        : "text-slate-500 hover:text-slate-700 hover:bg-slate-100"
                    }`}
                    aria-label={showPassword ? "Şifreyi gizle" : "Şifreyi göster"}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
                {password.length > 0 && password.length < 6 && (
                  <p className="text-[11px] text-amber-600 flex items-center gap-1">
                    <span>⚠️</span>
                    <span>Şifre en az 6 karakter olmalıdır</span>
                  </p>
                )}
              </div>

              {/* Error message */}
              {error && (
                <div
                  className={`px-4 py-3 rounded-xl text-[12px] font-medium flex items-start gap-2 ${
                    dark
                      ? "bg-red-900/30 border border-red-700/50 text-red-300"
                      : "bg-red-50 border border-red-200 text-red-700"
                  }`}
                >
                  <span className="text-base">❌</span>
                  <span className="flex-1">{error}</span>
                </div>
              )}

              {/* Submit button */}
              <button
                type="submit"
                disabled={loadingSubmit || !isFormValid}
                className={`mt-2 inline-flex items-center justify-center rounded-xl border px-4 py-3 text-[14px] font-bold shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] ${
                  dark
                    ? "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white border-emerald-700/50 hover:from-emerald-500 hover:to-emerald-600 shadow-emerald-900/40 focus:ring-emerald-500/60"
                    : "bg-gradient-to-r from-emerald-600 to-emerald-500 text-white border-emerald-700/20 hover:from-emerald-500 hover:to-emerald-600 shadow-emerald-600/30 focus:ring-emerald-500/60"
                }`}
              >
                {loadingSubmit ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-4 w-4 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Giriş yapılıyor...
                  </>
                ) : (
                  "Giriş Yap"
                )}
              </button>
            </form>

            {/* Footer */}
            <div className="flex flex-col gap-3 text-[12px] text-center">
              <button
                type="button"
                onClick={handleForgotPassword}
                className={`font-medium hover:underline underline-offset-2 transition-colors ${
                  dark
                    ? "text-emerald-400 hover:text-emerald-300"
                    : "text-emerald-600 hover:text-emerald-700"
                }`}
              >
                Şifrenizi mi unuttunuz?
              </button>

              <div
                className={`pt-3 border-t ${
                  dark ? "border-slate-700/50" : "border-slate-200/50"
                }`}
              >
                <p className={dark ? "text-slate-500" : "text-slate-400"}>
                  Demo Giriş:
                  <span className="font-mono text-[11px] ml-1">
                    demo@carbonai.com / demo123
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer
        className={`relative z-10 text-[11px] text-center py-6 ${
          dark ? "text-slate-600" : "text-slate-400"
        }`}
      >
        <p>CarbonAI © 2025 • Enterprise Carbon Management Platform</p>
      </footer>

      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: translateY(20px) scale(0.95); filter: blur(4px); }
          to   { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
        }
        @keyframes breathe {
          0%, 100% { transform: translate(-50%, 0) scale(1); }
          50%      { transform: translate(-50%, 0) scale(1.05); }
        }
        @keyframes float {
          0%, 100% { transform: translate(0, 0); }
          50%      { transform: translate(30px, -30px); }
        }
      `}</style>
    </div>
  );
}