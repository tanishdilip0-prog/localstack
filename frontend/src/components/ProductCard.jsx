import React from "react";
import {
  Store,
  MapPin,
  Star,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ExternalLink,
  ShoppingBag,
  Zap,
  TrendingDown
} from "lucide-react";

export default function ProductCard({
  product,
  onSelect,
  onReserve,
  onOpenMap,
  getSavings
}) {
  const savings = getSavings ? getSavings(product) : Math.max(0, (product.online_price || 0) - (product.price || 0));
  const stock = Number(product.stock || 0);

  // Stock badge config
  const getStockBadge = () => {
    if (stock <= 0) {
      return {
        label: "Out of stock",
        dotColor: "bg-rose-500",
        badgeStyle: "bg-rose-50 text-rose-700 border-rose-200",
        disabled: true,
      };
    }
    if (stock <= 3) {
      return {
        label: `Only ${stock} left`,
        dotColor: "bg-amber-500",
        badgeStyle: "bg-amber-50 text-amber-700 border-amber-200",
        disabled: false,
      };
    }
    return {
      label: `${stock} in stock`,
      dotColor: "bg-emerald-500",
      badgeStyle: "bg-emerald-50 text-emerald-700 border-emerald-200",
      disabled: false,
    };
  };

  const stockBadge = getStockBadge();

  // Category Icon mapper
  const getCategoryEmoji = (category = "") => {
    const cat = category.toLowerCase();
    if (cat.includes("charger") || cat.includes("adapter")) return "⚡";
    if (cat.includes("power") || cat.includes("battery")) return "🔋";
    if (cat.includes("earphone") || cat.includes("audio") || cat.includes("headphone") || cat.includes("airpod")) return "🎧";
    if (cat.includes("cable") || cat.includes("wire") || cat.includes("usb")) return "🔌";
    if (cat.includes("laptop") || cat.includes("computer") || cat.includes("pc")) return "💻";
    if (cat.includes("mobile") || cat.includes("phone") || cat.includes("screen")) return "📱";
    if (cat.includes("mouse") || cat.includes("keyboard")) return "🖱️";
    return "📦";
  };

  const discountPercent =
    product.online_price && product.online_price > product.price
      ? Math.round(((product.online_price - product.price) / product.online_price) * 100)
      : null;

  return (
    <div className="group bg-white rounded-2xl border border-slate-200/80 hover:border-emerald-500/40 shadow-xs hover:shadow-lg transition-all duration-200 flex flex-col justify-between overflow-hidden">
      
      {/* Card Header & Product Preview */}
      <div className="p-4 sm:p-5">
        
        {/* Top bar: Category + Distance & Rating */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 text-slate-700 capitalize">
            <span>{getCategoryEmoji(product.category)}</span>
            <span className="truncate max-w-[110px]">{product.category || "General"}</span>
          </span>

          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
            {product.rating > 0 && (
              <span className="flex items-center gap-0.5 text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md border border-amber-200/50">
                <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                <span>{product.rating}</span>
              </span>
            )}
            <span className="flex items-center gap-0.5 text-slate-500 bg-slate-50 px-1.5 py-0.5 rounded-md border border-slate-200/50">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>{product.distance} km</span>
            </span>
          </div>
        </div>

        {/* Product Title */}
        <h3
          onClick={() => onSelect(product)}
          className="text-base font-bold text-slate-900 group-hover:text-emerald-600 transition-colors line-clamp-2 cursor-pointer leading-snug"
          title={product.product}
        >
          {product.product}
        </h3>

        {/* Shop Name & Neighborhood */}
        <div className="flex items-center justify-between gap-1.5 mt-2 text-xs text-slate-500">
          <div className="flex items-center gap-1.5 truncate">
            <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="font-semibold text-slate-700 truncate">{product.shop}</span>
          </div>
          {product.address && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onOpenMap(product);
              }}
              className="text-[11px] text-slate-400 hover:text-emerald-600 flex items-center gap-0.5 shrink-0 transition"
              title="Open map location"
            >
              <ExternalLink className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Stock Status Badge */}
        <div className="mt-3 flex items-center gap-2">
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${stockBadge.badgeStyle}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${stockBadge.dotColor}`}></span>
            <span>{stockBadge.label}</span>
          </span>

          {discountPercent && discountPercent > 0 && (
            <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200/60">
              <TrendingDown className="w-3 h-3 text-amber-600" />
              <span>{discountPercent}% OFF</span>
            </span>
          )}
        </div>
      </div>

      {/* Card Footer: Pricing & Action Buttons */}
      <div className="p-4 sm:p-5 pt-0 bg-gradient-to-b from-transparent to-slate-50/50">
        
        {/* Price Section */}
        <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between gap-2 mb-3.5">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                ₹{product.price}
              </span>
              {product.online_price > product.price && (
                <span className="text-xs line-through text-slate-400 font-medium">
                  ₹{product.online_price}
                </span>
              )}
            </div>
            {savings > 0 && (
              <p className="text-[11px] font-semibold text-emerald-600 mt-0.5">
                Save ₹{savings} vs online delivery
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => onSelect(product)}
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 hover:underline py-1"
          >
            Details
          </button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 gap-2">
          <button
            type="button"
            onClick={() => onReserve(product)}
            disabled={stockBadge.disabled}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition ${
              stockBadge.disabled
                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200"
                : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs hover:shadow-md hover:shadow-emerald-600/20 active:scale-[0.98]"
            }`}
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>{stockBadge.disabled ? "Out of Stock" : "Reserve & Pickup"}</span>
          </button>
        </div>

      </div>

    </div>
  );
}
