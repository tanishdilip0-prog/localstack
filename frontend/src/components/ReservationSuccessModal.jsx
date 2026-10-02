import React from "react";
import {
  CheckCircle2,
  X,
  Store,
  MapPin,
  Calendar,
  ExternalLink,
  ShieldCheck,
  ShoppingBag
} from "lucide-react";

export default function ReservationSuccessModal({
  reservationDetails,
  onClose,
  onOpenMap,
  onViewReservations
}) {
  if (!reservationDetails) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-white rounded-3xl border border-slate-200/90 shadow-2xl p-6 sm:p-8 overflow-hidden my-auto text-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Success Icon */}
        <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-inner">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-2">
          Stock Held For You
        </span>

        <h3 className="text-2xl font-extrabold text-slate-900 tracking-tight">
          Reservation Confirmed!
        </h3>

        <p className="text-xs text-slate-500 mt-1">
          Your item has been set aside at the shop. No advance payment required.
        </p>

        {/* Reserved Summary Card */}
        <div className="mt-5 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 text-left space-y-2.5">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs text-slate-400 font-semibold uppercase">Product</p>
              <p className="text-sm font-bold text-slate-900 line-clamp-1">
                {reservationDetails.product}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-400 font-semibold uppercase">Price</p>
              <p className="text-sm font-extrabold text-emerald-600">
                ₹{reservationDetails.price}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-1 font-semibold">
              <Store className="w-3.5 h-3.5 text-emerald-600" />
              {reservationDetails.shop}
            </span>
            <span className="font-mono bg-white px-2 py-0.5 rounded border border-slate-200 font-bold text-slate-700">
              #{reservationDetails.id}
            </span>
          </div>
        </div>

        {/* Next steps */}
        <div className="mt-4 p-3 rounded-xl bg-amber-50/60 border border-amber-200/60 text-left text-xs text-amber-900/90 space-y-1">
          <p className="font-bold flex items-center gap-1 text-amber-900">
            <span>👉 How to pick up:</span>
          </p>
          <p className="text-[11px] text-amber-800">
            1. Visit <strong>{reservationDetails.shop}</strong> anytime today.<br />
            2. Tell the shopkeeper your name (<strong>{reservationDetails.customer_name}</strong>) or Reservation #{reservationDetails.id}.<br />
            3. Inspect your product and pay directly in the shop.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
          {reservationDetails && (
            <button
              type="button"
              onClick={() => {
                onOpenMap(reservationDetails);
              }}
              className="w-full py-3 px-4 rounded-xl text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition flex items-center justify-center gap-1.5"
            >
              <MapPin className="w-3.5 h-3.5 text-emerald-600" />
              <span>Get Directions</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-4 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
