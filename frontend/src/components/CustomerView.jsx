import React, { useState, useMemo } from "react";
import {
  Search,
  MapPin,
  Sparkles,
  ShoppingBag,
  Store,
  Clock,
  ArrowUpDown,
  Filter,
  Zap,
  TrendingDown,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight
} from "lucide-react";
import ProductCard from "./ProductCard";


function computeDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1));
}

export default function CustomerView({
  query,
  setQuery,
  searchProducts,
  loading,
  searchData,
  location,
  getLocation,
  locationLoading,
  exampleSearch,
  setSelectedProduct,
  reserveProduct,
  openMap,
  getSavings,
  getUrgencyMessage,
  customerReservations,
  formatStatus,
  statusStyle,
  loadInventory,
  inventory,
  onOpenLocationModal
}) {
  // Client-side Sorting & Filtering State
  const [sortBy, setSortBy] = useState("distance"); // "distance" | "price_low" | "rating" | "savings" | "stock"
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [inStockOnly, setInStockOnly] = useState(false);

  // Raw products with dynamic distance calculated from selected location
  const rawProducts = useMemo(() => {
    const list = searchData?.results?.products || inventory || [];
    if (!location?.latitude || !location?.longitude) return list;
    return list.map((p) => {
      if (p.latitude && p.longitude) {
        const d = computeDistance(
          location.latitude,
          location.longitude,
          p.latitude,
          p.longitude
        );
        return { ...p, distance: d !== null ? d : p.distance };
      }
      return p;
    });
  }, [searchData, inventory, location]);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set();
    rawProducts.forEach((p) => {
      if (p.category) set.add(p.category.toLowerCase());
    });
    return ["all", ...Array.from(set)];
  }, [rawProducts]);

  // Filtered & Sorted Products
  const displayedProducts = useMemo(() => {
    let list = [...rawProducts];

    // Filter: Category
    if (selectedCategory !== "all") {
      list = list.filter(
        (p) => (p.category || "").toLowerCase() === selectedCategory
      );
    }

    // Filter: In Stock Only
    if (inStockOnly) {
      list = list.filter((p) => Number(p.stock || 0) > 0);
    }

    // Sorting
    list.sort((a, b) => {
      if (sortBy === "distance") {
        return (Number(a.distance) || 0) - (Number(b.distance) || 0);
      }
      if (sortBy === "price_low") {
        return (Number(a.price) || 0) - (Number(b.price) || 0);
      }
      if (sortBy === "rating") {
        return (Number(b.rating) || 0) - (Number(a.rating) || 0);
      }
      if (sortBy === "savings") {
        const savA = (a.online_price || 0) - (a.price || 0);
        const savB = (b.online_price || 0) - (b.price || 0);
        return savB - savA;
      }
      if (sortBy === "stock") {
        return (Number(b.stock) || 0) - (Number(a.stock) || 0);
      }
      return 0;
    });

    return list;
  }, [rawProducts, selectedCategory, inStockOnly, sortBy]);

  const urgencyAlert = getUrgencyMessage ? getUrgencyMessage() : null;

  // Quick category shortcuts for Hero
  const heroCategories = [
    { label: "⚡ Fast Chargers", query: "Fast charger under 800" },
    { label: "🔋 Power Banks", query: "Power bank 20000mAh" },
    { label: "🎧 Earphones & Audio", query: "Wireless earbuds under 1500" },
    { label: "💻 Laptop Adapters", query: "Laptop charger 65W" },
    { label: "🔌 USB-C Cables", query: "Fast charging type c cable" },
    { label: "📱 Phone Accessories", query: "Screen protector and case" },
  ];

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    searchProducts(query);
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-10 sm:space-y-14">
      
      {/* ========================================================= */}
      {/* 1. HERO & SEARCH SECTION */}
      {/* ========================================================= */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-emerald-950 via-slate-900 to-slate-950 text-white p-6 sm:p-10 lg:p-12 shadow-xl border border-slate-800">
        
        {/* Subtle Background Elements */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          
          {/* Header Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>Real-Time Local Store Inventory</span>
          </div>

          {/* Hero Heading */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Find products in nearby shops. <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400">
              Pick up in 15 minutes.
            </span>
          </h1>

          <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-slate-300 font-medium max-w-2xl mx-auto">
            Search what you need, compare local vs online pricing, see live in-store stock, and reserve for zero-wait pickup.
          </p>

          {/* Search Bar Form */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-6 sm:mt-8 p-1.5 sm:p-2 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl flex flex-col sm:flex-row items-center gap-2"
          >
            <div className="relative flex-1 w-full flex items-center">
              <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="E.g. Fast charger under ₹800, 20000mAh powerbank..."
                className="w-full bg-transparent pl-11 pr-4 py-3 sm:py-3.5 text-sm text-white placeholder:text-slate-400 outline-none font-medium"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onOpenLocationModal}
                className="px-3.5 py-3 rounded-xl border border-white/20 bg-white/10 hover:bg-white/20 text-xs font-bold text-emerald-300 flex items-center justify-center gap-1.5 transition shrink-0 group"
                title="Click to choose or enter your location"
              >
                <MapPin className="w-4 h-4 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="truncate max-w-[120px] sm:max-w-none">
                  {location?.name || "Choose Area"}
                </span>
              </button>

              <button
                type="submit"
                disabled={loading}
                className="flex-1 sm:flex-none px-6 py-3.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-extrabold shadow-lg shadow-emerald-500/25 active:scale-[0.98] transition flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                {loading ? (
                  <span className="inline-block animate-spin w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full"></span>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Search Stores</span>
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Quick Categories Pills */}
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 mr-1 hidden sm:inline">
              Popular:
            </span>
            {heroCategories.map((item, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => exampleSearch(item.query)}
                className="px-3 py-1 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 hover:border-emerald-400/40 text-xs text-slate-200 font-medium transition active:scale-95"
              >
                {item.label}
              </button>
            ))}
          </div>

        </div>

      </section>

      {/* ========================================================= */}
      {/* 2. AI QUERY UNDERSTANDING & URGENCY BANNER */}
      {/* ========================================================= */}
      {searchData?.understanding && (
        <section className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-slate-900">AI Search Intent:</span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-semibold capitalize">
                  Product: {searchData.understanding.product}
                </span>
                {searchData.understanding.budget && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-xs font-semibold">
                    Max Budget: ₹{searchData.understanding.budget}
                  </span>
                )}
                {searchData.understanding.urgency && (
                  <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-xs font-semibold capitalize">
                    Urgency: {searchData.understanding.urgency}
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {searchData.message}
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-slate-600 self-start md:self-center shrink-0 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
            {searchData.results?.count || 0} Nearby Options Found
          </span>
        </section>
      )}

      {/* Urgency Highlight Banner */}
      {urgencyAlert && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 text-xs font-medium flex items-center gap-3">
          <Zap className="w-5 h-5 text-amber-600 shrink-0" />
          <span>{urgencyAlert}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* 3. PRODUCT DISCOVERY, FILTERS & PRODUCT GRID */}
      {/* ========================================================= */}
      <section className="space-y-6">
        
        {/* Section Header & Toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Nearby Available Products</span>
              <span className="text-sm font-semibold text-slate-400 bg-slate-100 px-2.5 py-0.5 rounded-full">
                {displayedProducts.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Verified in stock at local retail stores near you
            </p>
          </div>

          {/* Controls: Sorting & Filter Toggles */}
          <div className="flex flex-wrap items-center gap-2.5">
            
            {/* In Stock Only Checkbox Button */}
            <button
              type="button"
              onClick={() => setInStockOnly(!inStockOnly)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center gap-1.5 ${
                inStockOnly
                  ? "bg-emerald-50 border-emerald-300 text-emerald-800"
                  : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${inStockOnly ? "bg-emerald-500" : "bg-slate-300"}`}></span>
              <span>In Stock Only</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs">
              <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-slate-900 outline-none font-bold cursor-pointer"
              >
                <option value="distance">Nearest Store</option>
                <option value="price_low">Lowest Price</option>
                <option value="rating">Highest Rating</option>
                <option value="savings">Biggest Savings</option>
                <option value="stock">Most Stock</option>
              </select>
            </div>

          </div>
        </div>

        {/* Category Pills Filter Bar */}
        {categories.length > 2 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <span className="text-xs font-bold text-slate-400 shrink-0 flex items-center gap-1">
              <Filter className="w-3 h-3" /> Category:
            </span>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Products Grid / Skeletons / Empty State */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4 animate-pulse">
                <div className="flex justify-between">
                  <div className="h-5 w-20 bg-slate-200 rounded-full"></div>
                  <div className="h-5 w-16 bg-slate-200 rounded-md"></div>
                </div>
                <div className="h-6 w-3/4 bg-slate-200 rounded"></div>
                <div className="h-4 w-1/2 bg-slate-200 rounded"></div>
                <div className="h-8 w-1/3 bg-slate-200 rounded mt-4"></div>
                <div className="h-10 w-full bg-slate-200 rounded-xl"></div>
              </div>
            ))}
          </div>
        ) : displayedProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
            {displayedProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelect={setSelectedProduct}
                onReserve={reserveProduct}
                onOpenMap={openMap}
                getSavings={getSavings}
              />
            ))}
          </div>
        ) : (
          /* Professional Empty State */
          <div className="bg-white rounded-3xl border border-slate-200 p-10 sm:p-14 text-center max-w-lg mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <Store className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900">
              No matching local products found
            </h3>
            <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto">
              We couldn't find available stock for your search. Try broadening your keywords or browse all catalog products.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setSelectedCategory("all");
                  loadInventory();
                }}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs"
              >
                View All Local Inventory
              </button>
            </div>
          </div>
        )}

      </section>

      {/* ========================================================= */}
      {/* 4. ACTIVE CUSTOMER RESERVATIONS */}
      {/* ========================================================= */}
      {customerReservations.length > 0 && (
        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-emerald-600" />
                <span>My Active Reservations</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Items reserved for in-person pickup at local stores
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {customerReservations.map((res) => (
              <div
                key={res.id}
                className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 hover:border-slate-300 transition flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusStyle(res.status)}`}>
                      {formatStatus(res.status)}
                    </span>
                    <span className="font-mono text-xs font-bold text-slate-400">
                      #{res.id}
                    </span>
                  </div>
                  
                  <h4 className="text-sm font-bold text-slate-900 line-clamp-1">
                    {res.product}
                  </h4>
                  
                  <div className="flex items-center gap-1 text-xs text-slate-600 mt-1 font-semibold">
                    <Store className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{res.shop}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-200/60 flex items-center justify-between">
                  <span className="text-base font-extrabold text-slate-900">
                    ₹{res.price}
                  </span>

                  <button
                    type="button"
                    onClick={() => openMap(res)}
                    className="flex items-center gap-1 text-xs font-bold text-emerald-600 hover:text-emerald-700 hover:underline"
                  >
                    <MapPin className="w-3 h-3" />
                    <span>Directions</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ========================================================= */}
      {/* 5. "HOW LOCALSTOCK WORKS" VALUE PROPOSITION BANNER */}
      {/* ========================================================= */}
      <section className="bg-slate-100 rounded-3xl p-6 sm:p-10 border border-slate-200/80">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h3 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            How LocalStock Works
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Get products immediately from trusted local stores without waiting for 2-day eCommerce delivery.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              title: "Search What You Need",
              desc: "Type naturally in plain English (e.g., 'Fast charger under ₹800'). LocalStock indexes local store catalogs.",
              icon: Search
            },
            {
              step: "02",
              title: "Compare Price & Stock",
              desc: "See real-time stock availability, distance, customer ratings, and savings compared to online platforms.",
              icon: TrendingDown
            },
            {
              step: "03",
              title: "Reserve & Pickup Free",
              desc: "Reserve your product with zero upfront payment. Walk in, inspect the item in person, and pay at the counter.",
              icon: CheckCircle2
            }
          ].map((card, idx) => (
            <div key={idx} className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-2xs">
              <span className="text-xs font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                Step {card.step}
              </span>
              <h4 className="text-base font-bold text-slate-900 mt-2.5">
                {card.title}
              </h4>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                {card.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

    </main>
  );
}
