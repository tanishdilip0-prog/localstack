import React, { useState, useEffect } from "react";
import {
  X,
  User,
  Mail,
  Lock,
  Store,
  ShoppingBag,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";

export default function AuthModal({
  showAuth,
  setShowAuth,
  authMode,
  setAuthMode,
  handleLogin,
  handleRegister,
  message,
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("customer");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setShowAuth(false);
    };
    if (showAuth) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [showAuth, setShowAuth]);

  if (!showAuth) return null;

  const submit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    if (authMode === "login") {
      await handleLogin(email, password);
    } else {
      await handleRegister(name, email, password, role);
    }
    setSubmitting(false);
  };

  // Quick fill helper for demo
  const quickFill = (demoRole) => {
    if (demoRole === "shopkeeper") {
      setEmail("tanishdilip0@gmail.com");
      setPassword("password123");
    } else {
      setEmail("customer@localstock.com");
      setPassword("password123");
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in"
      onClick={() => setShowAuth(false)}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-8 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => setShowAuth(false)}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition"
          title="Close (Esc)"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="mb-6">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Store className="w-3.5 h-3.5" />
            <span>LocalStock Account</span>
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            {authMode === "login" ? "Welcome back" : "Create your account"}
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            {authMode === "login"
              ? "Access your live reservations and store inventory."
              : "Discover local inventory or list your store catalog."}
          </p>
        </div>

        {/* Inline Feedback Banner */}
        {message && (
          <div className="p-3 mb-4 rounded-xl bg-emerald-50 border border-emerald-200/80 text-xs text-emerald-800 font-medium flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{message}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={submit} className="space-y-3.5">
          {authMode === "register" && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:bg-white transition"
                  placeholder="Your Name / Store Name"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:bg-white transition"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 outline-none focus:border-emerald-500 focus:bg-white transition"
                placeholder="At least 6 characters"
              />
            </div>
          </div>

          {authMode === "register" && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                I am signing up as:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("customer")}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                    role === "customer"
                      ? "border-emerald-500 bg-emerald-50/70 text-emerald-800"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Customer</span>
                </button>

                <button
                  type="button"
                  onClick={() => setRole("shopkeeper")}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1 transition ${
                    role === "shopkeeper"
                      ? "border-emerald-500 bg-emerald-50/70 text-emerald-800"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  <Store className="w-4 h-4" />
                  <span>Shopkeeper</span>
                </button>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs hover:shadow-md hover:shadow-emerald-600/20 active:scale-[0.98] transition flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {submitting ? "Processing..." : authMode === "login" ? "Sign In" : "Create Free Account"}
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </form>

        {/* Quick Demo Fill Pills for Testing / Demo */}
        {authMode === "login" && (
          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <p className="text-[11px] font-semibold text-slate-400 mb-2">⚡ Quick demo login:</p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={() => quickFill("shopkeeper")}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition"
              >
                🏪 Demo Shopkeeper
              </button>
              <button
                type="button"
                onClick={() => quickFill("customer")}
                className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition"
              >
                🛍️ Demo Customer
              </button>
            </div>
          </div>
        )}

        {/* Switch mode */}
        <div className="text-center mt-5 text-xs text-slate-500">
          {authMode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setAuthMode(authMode === "login" ? "register" : "login")}
            className="text-emerald-600 hover:text-emerald-700 font-bold hover:underline"
          >
            {authMode === "login" ? "Sign up now" : "Log in"}
          </button>
        </div>

      </div>
    </div>
  );
}
