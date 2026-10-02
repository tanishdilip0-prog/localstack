import React, { useEffect } from "react";
import {
  X,
  Store,
  MapPin,
  Star,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Clock,
  CheckCircle2,
  TrendingDown,
  Sparkles,
  Zap
} from "lucide-react";

export default function ProductModal({
  selectedProduct,
  setSelectedProduct,
  onReserve,
  onOpenMap,
  getSavings
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") setSelectedProduct(null);
    };
    if (selectedProduct) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "auto";
    };
  }, [selectedProduct, setSelectedProduct]);

  if (!selectedProduct) return null;

  const savings = getSavings
    ? getSavings(selectedProduct)
    : Math.max(0, (selectedProduct.online_price || 0) - (selectedProduct.price || 0));

  const stock = Number(selectedProduct.stock || 0);
  const isOutOfStock = stock <= 0;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in"
      onClick={() => setSelectedProduct(null)}
    >
      <div
        className="relative w-full max-w-2xl bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-8 overflow-hidden my-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={() => setSelectedProduct(null)}
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition"
          title="Close (Esc)"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="pr-10">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 capitalize">
              {selectedProduct.category || "Electronics"}
            </span>
            <span className="flex items-center gap-1 text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
              <MapPin className="w-3 h-3 text-slate-400" />
              {selectedProduct.distance} km away
            </span>
            {selectedProduct.rating > 0 && (
              <span className="flex items-center gap-1 text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200/50 px-2 py-0.5 rounded-full">
                <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                {selectedProduct.rating} Rating
              </span>
            )}
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {selectedProduct.product}
          </h2>
        </div>

        {/* Store & Location Card */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-slate-900">{selectedProduct.shop}</h4>
                <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800">
                  Verified Store
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {selectedProduct.address || "Local neighbourhood retail partner"}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onOpenMap(selectedProduct)}
            className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 shadow-2xs transition self-start sm:self-center shrink-0"
          >
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            <span>Open Directions</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </button>
        </div>

        {/* Price & Stock Grid */}
        <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
          
          {/* Price Box */}
          <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/60">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
              Local Store Price
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-extrabold text-slate-900 tracking-tight">
                ₹{selectedProduct.price}
              </span>
              {selectedProduct.online_price > selectedProduct.price && (
                <span className="text-sm line-through text-slate-400">
                  ₹{selectedProduct.online_price}
                </span>
              )}
            </div>
            {savings > 0 && (
              <div className="flex items-center gap-1 text-xs font-bold text-emerald-700 mt-1">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>You save ₹{savings} compared to standard online pricing</span>
              </div>
            )}
          </div>

          {/* Stock Box */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Live Stock Status
            </span>
            <div>
              <div className="flex items-center gap-2 mt-1">
                <span className={`w-2.5 h-2.5 rounded-full ${isOutOfStock ? "bg-rose-500" : stock <= 3 ? "bg-amber-500" : "bg-emerald-500"}`}></span>
                <span className="text-lg font-bold text-slate-900">
                  {isOutOfStock ? "Out of Stock" : stock <= 3 ? `Low Stock (${stock} left)` : `In Stock (${stock} available)`}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Ready for instant walk-in pickup today
              </p>
            </div>
          </div>

        </div>

        {/* "Why Buy Locally?" Trust Section */}
        <div className="mt-6 border-t border-slate-100 pt-5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
            Why Reserve on LocalStock?
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { icon: Zap, title: "Zero Wait Time", desc: "Pick up in 15 mins" },
              { icon: ShieldCheck, title: "Inspect First", desc: "Pay upon physical check" },
              { icon: TrendingDown, title: "Cheaper Price", desc: "No shipping markups" },
              { icon: Clock, title: "Held for You", desc: "Stock secured instantly" }
            ].map((item, idx) => (
              <div key={idx} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                <item.icon className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <p className="text-xs font-bold text-slate-800">{item.title}</p>
                <p className="text-[10px] text-slate-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-6 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setSelectedProduct(null)}
            className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition order-2 sm:order-1"
          >
            Cancel
          </button>
          
          <button
            type="button"
            onClick={() => {
              onReserve(selectedProduct);
            }}
            disabled={isOutOfStock}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition order-1 sm:order-2 ${
              isOutOfStock
                ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20 active:scale-[0.98]"
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{isOutOfStock ? "Currently Out of Stock" : "Reserve for Instant Pickup — Free"}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
