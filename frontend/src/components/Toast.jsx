import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export default function Toast({ message, onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4500);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  const isError =
    message.toLowerCase().includes("fail") ||
    message.toLowerCase().includes("error") ||
    message.toLowerCase().includes("unable") ||
    message.toLowerCase().includes("could not");

  const isWarning =
    message.toLowerCase().includes("not granted") ||
    message.toLowerCase().includes("please") ||
    message.toLowerCase().includes("⚠️");

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-full animate-fade-in">
      <div
        className={`p-4 rounded-2xl shadow-xl border flex items-start gap-3 backdrop-blur-md transition-all ${
          isError
            ? "bg-white border-rose-200 text-slate-800"
            : isWarning
            ? "bg-white border-amber-200 text-slate-800"
            : "bg-white border-emerald-200 text-slate-800"
        }`}
      >
        <div className="shrink-0 mt-0.5">
          {isError ? (
            <AlertCircle className="w-5 h-5 text-rose-600" />
          ) : isWarning ? (
            <AlertCircle className="w-5 h-5 text-amber-500" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          )}
        </div>

        <div className="flex-1 text-xs font-semibold leading-relaxed">
          {message}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-700 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
