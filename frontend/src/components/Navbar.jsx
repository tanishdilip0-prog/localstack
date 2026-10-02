import React from "react";
import {
  Store,
  MapPin,
  ShoppingBag,
  User,
  LogIn,
  LogOut,
  Sparkles,
  Layers,
  ChevronDown
} from "lucide-react";

export default function Navbar({
  mode,
  setMode,
  user,
  token,
  handleLogout,
  setShowAuth,
  setAuthMode,
  location,
  getLocation,
  locationLoading,
  requireShopkeeper,
  onOpenLocationModal,
}) {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
          
          {/* Logo & Slogan */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMode("customer")}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                <Store className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-extrabold tracking-tight text-slate-900">
                    Local<span className="text-emerald-600">Stock</span>
                  </span>
                  <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                    Live
                  </span>
                </div>
                <p className="hidden md:block text-[11px] font-medium text-slate-600 -mt-0.5">
                  Real-time store inventory nearby
                </p>
              </div>
            </button>
          </div>

          {/* Location Pill */}
          <div className="hidden sm:flex items-center">
            <button
              type="button"
              onClick={onOpenLocationModal}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border bg-emerald-50 hover:bg-emerald-100/80 border-emerald-200 text-emerald-900 transition shadow-xs group"
              title="Click to change your location / select neighborhood"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              <span className="truncate max-w-[160px] font-bold">
                {location?.name || "Bengaluru Central"}
              </span>
              <ChevronDown className="w-3 h-3 text-emerald-600 opacity-60 group-hover:opacity-100 group-hover:translate-y-0.5 transition" />
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex p-1 bg-slate-100 rounded-xl border border-slate-200/80">
              <button
                type="button"
                onClick={() => setMode("customer")}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  mode === "customer"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                <span>Shop</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (user?.role === "shopkeeper") {
                    setMode("shopkeeper");
                  } else {
                    requireShopkeeper();
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  mode === "shopkeeper"
                    ? "bg-white text-slate-900 shadow-xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <Store className="w-3.5 h-3.5 text-indigo-600" />
                <span>Store Hub</span>
              </button>
            </div>

            {/* User Profile / Auth Button */}
            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="hidden sm:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800 truncate max-w-[120px]">
                    {user.name}
                  </span>
                  <span className="text-[10px] uppercase font-semibold text-slate-600">
                    {user.role}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-600 border border-slate-200/80 hover:border-rose-200 transition"
                  title="Log out"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setAuthMode("login");
                  setShowAuth(true);
                }}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs hover:shadow transition"
              >
                <LogIn className="w-3.5 h-3.5 text-slate-300" />
                <span>Sign In</span>
              </button>
            )}
          </div>

        </div>
      </div>
    </header>
  );
}
