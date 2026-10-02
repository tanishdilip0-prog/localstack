import React, { useState, useMemo } from "react";
import {
  Store,
  Plus,
  Trash2,
  RefreshCw,
  UploadCloud,
  FileText,
  Download,
  AlertTriangle,
  Package,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  TrendingUp,
  Tag,
  DollarSign,
  MapPin,
  ExternalLink
} from "lucide-react";

export default function ShopkeeperView({
  inventory,
  inventoryLoading,
  loadInventory,
  form,
  handleFormChange,
  addProduct,
  deleteProduct,
  handleFileUpload,
  uploading,
  uploadResult,
  reservations,
  reservationLoading,
  updateReservationStatus,
  formatStatus,
  statusStyle,
  openMap
}) {
  const [activeTab, setActiveTab] = useState("inventory"); // "inventory" | "add" | "bulk" | "reservations"
  const [tableSearch, setTableSearch] = useState("");
  const [tableCategory, setTableCategory] = useState("all");

  // KPI Metrics calculation
  const stats = useMemo(() => {
    const totalItems = inventory.length;
    const lowStock = inventory.filter((p) => Number(p.stock) > 0 && Number(p.stock) <= 3).length;
    const outOfStock = inventory.filter((p) => Number(p.stock) <= 0).length;
    const totalValue = inventory.reduce(
      (sum, p) => sum + (Number(p.price) || 0) * (Number(p.stock) || 0),
      0
    );
    const activeReservations = reservations.filter(
      (r) => r.status === "reserved" || r.status === "ready"
    ).length;

    return { totalItems, lowStock, outOfStock, totalValue, activeReservations };
  }, [inventory, reservations]);

  // Inventory Table filtering
  const filteredInventory = useMemo(() => {
    return inventory.filter((item) => {
      const matchesSearch =
        tableSearch === "" ||
        (item.product || "").toLowerCase().includes(tableSearch.toLowerCase()) ||
        (item.shop || "").toLowerCase().includes(tableSearch.toLowerCase()) ||
        (item.category || "").toLowerCase().includes(tableSearch.toLowerCase());

      const matchesCat =
        tableCategory === "all" ||
        (item.category || "").toLowerCase() === tableCategory.toLowerCase();

      return matchesSearch && matchesCat;
    });
  }, [inventory, tableSearch, tableCategory]);

  const categories = useMemo(() => {
    const set = new Set();
    inventory.forEach((p) => {
      if (p.category) set.add(p.category.toLowerCase());
    });
    return ["all", ...Array.from(set)];
  }, [inventory]);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10 space-y-8">
      
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200/60 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Store className="w-3.5 h-3.5" />
            <span>Store Partner Dashboard</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Inventory & Store Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Manage your live products, stock levels, bulk catalog uploads, and incoming customer reservations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadInventory}
            disabled={inventoryLoading}
            className="px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${inventoryLoading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("add")}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Product</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Cards */}
      <section className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Total SKUs</span>
            <Package className="w-4 h-4 text-slate-400" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">{stats.totalItems}</p>
          <span className="text-[11px] font-semibold text-slate-400">Active in catalog</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-amber-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Low Stock</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl font-extrabold text-amber-700">{stats.lowStock}</p>
          <span className="text-[11px] font-semibold text-amber-800">Under 3 units left</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-rose-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Out of Stock</span>
            <AlertTriangle className="w-4 h-4 text-rose-500" />
          </div>
          <p className="text-2xl font-extrabold text-rose-700">{stats.outOfStock}</p>
          <span className="text-[11px] font-semibold text-rose-800">Requires restocking</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-emerald-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Stock Value</span>
            <TrendingUp className="w-4 h-4 text-emerald-500" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900">₹{stats.totalValue.toLocaleString()}</p>
          <span className="text-[11px] font-semibold text-slate-400">Total catalog value</span>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-white rounded-2xl border border-slate-200/90 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-indigo-600 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Reservations</span>
            <Clock className="w-4 h-4 text-indigo-500" />
          </div>
          <p className="text-2xl font-extrabold text-indigo-700">{stats.activeReservations}</p>
          <span className="text-[11px] font-semibold text-indigo-800">Pending customer pickups</span>
        </div>

      </section>

      {/* Navigation Tab Pills */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-4 overflow-x-auto scrollbar-none">
        {[
          { id: "inventory", label: "Inventory List", count: inventory.length },
          { id: "add", label: "Add Single Product", count: null },
          { id: "bulk", label: "Bulk CSV/JSON Import", count: null },
          { id: "reservations", label: "Customer Reservations", count: reservations.length },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`pb-3 px-2 text-xs sm:text-sm font-bold border-b-2 whitespace-nowrap transition flex items-center gap-1.5 ${
              activeTab === tab.id
                ? "border-emerald-600 text-emerald-700"
                : "border-transparent text-slate-500 hover:text-slate-900"
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${activeTab === tab.id ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ========================================================= */}
      {/* TAB 1: INVENTORY TABLE */}
      {/* ========================================================= */}
      {activeTab === "inventory" && (
        <section className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          
          {/* Table Toolbar */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="Search products or shops..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 outline-none focus:border-emerald-500 focus:bg-white transition font-medium"
              />
            </div>

            {categories.length > 2 && (
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-slate-500 font-semibold">Category:</span>
                <select
                  value={tableCategory}
                  onChange={(e) => setTableCategory(e.target.value)}
                  className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 outline-none cursor-pointer"
                >
                  {categories.map((c) => (
                    <option key={c} value={c} className="capitalize">
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 sm:px-6">Product & Shop</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Stock</th>
                  <th className="py-3.5 px-4">Rating / Dist</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInventory.length > 0 ? (
                  filteredInventory.map((item) => {
                    const stockNum = Number(item.stock || 0);
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3.5 px-4 sm:px-6">
                          <p className="font-bold text-slate-900">{item.product}</p>
                          <p className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5 font-medium">
                            <Store className="w-3 h-3 text-emerald-600" />
                            <span>{item.shop}</span>
                          </p>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-semibold capitalize">
                            {item.category || "General"}
                          </span>
                        </td>

                        <td className="py-3.5 px-4">
                          <span className="font-extrabold text-slate-900 text-sm">₹{item.price}</span>
                          {item.online_price > item.price && (
                            <span className="block text-[10px] text-slate-400 line-through">
                              Online ₹{item.online_price}
                            </span>
                          )}
                        </td>

                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-bold text-[11px] ${
                              stockNum <= 0
                                ? "bg-rose-50 text-rose-700"
                                : stockNum <= 3
                                ? "bg-amber-50 text-amber-700"
                                : "bg-emerald-50 text-emerald-700"
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${stockNum <= 0 ? "bg-rose-500" : stockNum <= 3 ? "bg-amber-500" : "bg-emerald-500"}`}></span>
                            {stockNum <= 0 ? "Out of stock" : `${stockNum} units`}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-slate-500">
                          <span>{item.rating || 0} ★</span>
                          <span className="mx-1">·</span>
                          <span>{item.distance || 0} km</span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => deleteProduct(item.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="py-10 text-center text-slate-400">
                      No products found matching filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </section>
      )}

      {/* ========================================================= */}
      {/* TAB 2: ADD PRODUCT FORM */}
      {/* ========================================================= */}
      {activeTab === "add" && (
        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs max-w-3xl">
          <div className="mb-6">
            <h3 className="text-xl font-bold text-slate-900">Add New Product to Store</h3>
            <p className="text-xs text-slate-500 mt-1">
              List a single product with price, stock, and store coordinates for nearby discovery.
            </p>
          </div>

          <form onSubmit={addProduct} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Shop Name *</label>
              <input
                name="shop"
                value={form.shop}
                onChange={handleFormChange}
                required
                placeholder="E.g. Sri Electronics"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-emerald-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Product Title *</label>
              <input
                name="product"
                value={form.product}
                onChange={handleFormChange}
                required
                placeholder="E.g. Fast Charging Adapter 65W"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-emerald-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Category *</label>
              <input
                name="category"
                value={form.category}
                onChange={handleFormChange}
                required
                placeholder="E.g. fast charger, audio, adapter"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-emerald-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Local Selling Price (₹) *</label>
              <input
                name="price"
                type="number"
                value={form.price}
                onChange={handleFormChange}
                required
                min="1"
                placeholder="E.g. 649"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-emerald-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Reference Online Price (₹)</label>
              <input
                name="online_price"
                type="number"
                value={form.online_price}
                onChange={handleFormChange}
                placeholder="E.g. 799"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-emerald-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Stock Quantity *</label>
              <input
                name="stock"
                type="number"
                value={form.stock}
                onChange={handleFormChange}
                required
                min="0"
                placeholder="E.g. 10"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-emerald-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Distance (km)</label>
              <input
                name="distance"
                type="number"
                step="0.1"
                value={form.distance}
                onChange={handleFormChange}
                placeholder="E.g. 1.2"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-emerald-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Rating (1-5)</label>
              <input
                name="rating"
                type="number"
                step="0.1"
                min="1"
                max="5"
                value={form.rating}
                onChange={handleFormChange}
                placeholder="E.g. 4.8"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-emerald-500 focus:bg-white transition"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 mb-1">Shop Address</label>
              <input
                name="address"
                value={form.address}
                onChange={handleFormChange}
                placeholder="E.g. 12 Gandhi Road, T Nagar, Chennai"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-emerald-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Latitude</label>
              <input
                name="latitude"
                type="number"
                step="any"
                value={form.latitude}
                onChange={handleFormChange}
                placeholder="E.g. 13.0827"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-emerald-500 focus:bg-white transition"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Longitude</label>
              <input
                name="longitude"
                type="number"
                step="any"
                value={form.longitude}
                onChange={handleFormChange}
                placeholder="E.g. 80.2707"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-emerald-500 focus:bg-white transition"
              />
            </div>

            <div className="md:col-span-2 pt-4 flex justify-end">
              <button
                type="submit"
                className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition"
              >
                + Save Product to Inventory
              </button>
            </div>
          </form>
        </section>
      )}

      {/* ========================================================= */}
      {/* TAB 3: BULK CSV/JSON IMPORT */}
      {/* ========================================================= */}
      {activeTab === "bulk" && (
        <section className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs max-w-3xl space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xl font-bold text-slate-900">Bulk Catalog Upload</h3>
              <p className="text-xs text-slate-500 mt-1">
                Upload your entire store inventory in CSV or JSON with pattern check.
              </p>
            </div>

            <a
              href="data:text/csv;charset=utf-8,shop,product,category,price,online_price,stock,distance,rating,address,latitude,longitude%0ASri%20Electronics,Fast%20Charger%2065W,fast%20charger,699,899,10,1.2,4.8,Chennai,13.08,80.27"
              download="localstock_inventory_template.csv"
              className="px-3.5 py-2 rounded-xl border border-slate-200 hover:border-emerald-500 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-white transition flex items-center gap-1.5 self-start shadow-2xs"
            >
              <Download className="w-3.5 h-3.5 text-emerald-600" />
              <span>Sample CSV Template</span>
            </a>
          </div>

          <div className="border-2 border-dashed border-slate-200 hover:border-emerald-500/60 rounded-2xl p-8 text-center transition bg-slate-50/50">
            <input
              type="file"
              id="bulk-file-input"
              accept=".csv,.json"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
            <label
              htmlFor="bulk-file-input"
              className="cursor-pointer flex flex-col items-center justify-center gap-2"
            >
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mb-1">
                <UploadCloud className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-slate-900">
                {uploading ? "Parsing & importing catalog..." : "Click to select CSV or JSON file"}
              </span>
              <span className="text-xs text-slate-400 max-w-sm">
                Columns: shop, product, category, price, online_price, stock, distance, rating, address, latitude, longitude
              </span>
            </label>
          </div>

          {uploadResult && (
            <div className={`p-4 rounded-2xl border text-xs ${uploadResult.success ? "bg-emerald-50 border-emerald-200 text-emerald-900" : "bg-rose-50 border-rose-200 text-rose-900"}`}>
              <p className="font-bold">{uploadResult.message}</p>
              {uploadResult.inserted_count > 0 && (
                <p className="mt-1 font-medium">✓ {uploadResult.inserted_count} products added to live catalog.</p>
              )}
              {uploadResult.errors?.length > 0 && (
                <div className="mt-2 space-y-1">
                  <p className="font-bold text-red-700">Notices:</p>
                  {uploadResult.errors.map((e, idx) => (
                    <p key={idx} className="text-red-600">⚠️ {e}</p>
                  ))}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* ========================================================= */}
      {/* TAB 4: CUSTOMER RESERVATIONS */}
      {/* ========================================================= */}
      {activeTab === "reservations" && (
        <section className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-slate-200">
            <h3 className="text-lg font-bold text-slate-900">Incoming Customer Reservations</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Set status as items are prepped for walk-in pickup.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
                  <th className="py-3.5 px-4 sm:px-6">Reservation</th>
                  <th className="py-3.5 px-4">Customer</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Update Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reservations.length > 0 ? (
                  reservations.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50/70 transition">
                      <td className="py-3.5 px-4 sm:px-6">
                        <p className="font-bold text-slate-900">{res.product}</p>
                        <p className="text-[11px] text-slate-400 font-mono">ID #{res.id}</p>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-slate-800">
                        {res.customer_name || "Guest Customer"}
                      </td>

                      <td className="py-3.5 px-4 font-extrabold text-slate-900 text-sm">
                        ₹{res.price}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${statusStyle(res.status)}`}>
                          {formatStatus(res.status)}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {res.status === "reserved" && (
                            <button
                              type="button"
                              onClick={() => updateReservationStatus(res.id, "ready")}
                              className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-[11px] font-bold transition"
                            >
                              Ready for Pickup
                            </button>
                          )}
                          {(res.status === "reserved" || res.status === "ready") && (
                            <button
                              type="button"
                              onClick={() => updateReservationStatus(res.id, "completed")}
                              className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-[11px] font-bold transition"
                            >
                              Complete
                            </button>
                          )}
                          {res.status !== "cancelled" && res.status !== "completed" && (
                            <button
                              type="button"
                              onClick={() => updateReservationStatus(res.id, "cancelled")}
                              className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-[11px] font-bold transition"
                            >
                              Cancel
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="py-10 text-center text-slate-400">
                      No customer reservations yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

    </main>
  );
}
