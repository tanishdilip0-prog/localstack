import React, { useEffect, useState } from "react";
import Navbar from "./components/Navbar";
import CustomerView from "./components/CustomerView";
import ShopkeeperView from "./components/ShopkeeperView";
import ProductModal from "./components/ProductModal";
import AuthModal from "./components/AuthModal";
import ReservationSuccessModal from "./components/ReservationSuccessModal";
import Toast from "./components/Toast";
import LocationModal from "./components/LocationModal";
import { Store, Heart, ShieldCheck } from "lucide-react";

const API =
  typeof window !== "undefined" && window.location.hostname
    ? `http://${window.location.hostname}:8000`
    : "http://172.28.82.219:8000";

function App() {
  const [mode, setMode] = useState("customer"); // "customer" | "shopkeeper"

  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("localstock_user") || "null")
  );
  const [token, setToken] = useState(
    localStorage.getItem("localstock_token") || ""
  );

  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchData, setSearchData] = useState(null);
  const [message, setMessage] = useState("");

  const [inventory, setInventory] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);

  const [reservations, setReservations] = useState([]);
  const [reservationLoading, setReservationLoading] = useState(false);
  const [customerReservations, setCustomerReservations] = useState([]);

  const [showLocationModal, setShowLocationModal] = useState(false);
  const [location, setLocation] = useState(() => {
    try {
      const saved = localStorage.getItem("localstock_location");
      if (saved) return JSON.parse(saved);
    } catch (e) {}
    return {
      latitude: 12.9716,
      longitude: 77.5946,
      name: "Bengaluru Central",
      enabled: true,
    };
  });
  const [locationLoading, setLocationLoading] = useState(false);

  const handleSelectLocation = (newLoc) => {
    setLocation(newLoc);
    try {
      localStorage.setItem("localstock_location", JSON.stringify(newLoc));
    } catch (e) {}
    setMessage("📍 Location set to " + newLoc.name + ". Store inventory updated.");
    if (query.trim()) {
      searchProducts(query, newLoc.latitude, newLoc.longitude);
    }
  };

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reservationSuccess, setReservationSuccess] = useState(null);

  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const [form, setForm] = useState({
    shop: "",
    product: "",
    category: "",
    price: "",
    online_price: "",
    stock: "",
    distance: "",
    rating: "",
    address: "",
    latitude: "",
    longitude: "",
  });

  // =========================================================
  // LOCATION
  // =========================================================

  // IP-based location fallback (works on HTTP)
  const getLocationByIP = async () => {
    try {
      const res = await fetch("https://ipapi.co/json/");
      const data = await res.json();
      if (data.latitude && data.longitude) {
        setLocation({ latitude: data.latitude, longitude: data.longitude, enabled: true });
        setMessage("Location set via network: " + (data.city || "your area") + ". Distances are approximate.");
      } else {
        setLocation({ latitude: 12.9716, longitude: 77.5946, enabled: true });
        setMessage("Using default location (Bengaluru). Distances are approximate.");
      }
    } catch (e) {
      setLocation({ latitude: 12.9716, longitude: 77.5946, enabled: true });
      setMessage("Using demo location. You can still search and see results.");
    } finally {
      setLocationLoading(false);
    }
  };

  const getLocation = () => {
    setLocationLoading(true);
    setMessage("");

    // On plain HTTP (not localhost), browsers block GPS entirely
    const isSecure =
      window.location.protocol === "https:" ||
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    if (!isSecure || !navigator.geolocation) {
      getLocationByIP();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          enabled: true,
        });
        setLocationLoading(false);
        setMessage("GPS location detected. Store distances prioritized.");
      },
      (err) => {
        // err.code 1=permission denied, 2=unavailable, 3=timeout
        getLocationByIP();
      },
      {
        enableHighAccuracy: false,
        timeout: 8000,
        maximumAge: 300000,
      }
    );
  };

  // =========================================================
  // MAP NAVIGATION
  // =========================================================

  const openMap = (product) => {
    if (!product) return;

    if (product.latitude && product.longitude) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${product.latitude},${product.longitude}`,
        "_blank"
      );
      return;
    }

    if (product.address) {
      window.open(
        `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
          product.address
        )}`,
        "_blank"
      );
      return;
    }

    window.open(
      `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        product.shop
      )}`,
      "_blank"
    );
  };

  // =========================================================
  // AI SEARCH & INVENTORY
  // =========================================================

  const searchProducts = async (customQuery = null, customLat = null, customLng = null) => {
    const searchText = customQuery !== null ? customQuery : query;

    if (!searchText.trim()) {
      setMessage("Please enter what product you are looking for.");
      return;
    }

    setLoading(true);
    setMessage("");
    setSearchData(null);

    const lat = customLat !== null ? customLat : location.latitude;
    const lng = customLng !== null ? customLng : location.longitude;

    try {
      const response = await fetch(`${API}/ai/search`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: searchText,
          latitude: lat,
          longitude: lng,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Search failed");
      }

      setSearchData(data);

      if (!data.results?.products?.length) {
        setMessage(
          "No matching local products found. Try a different product or budget."
        );
      }
    } catch (error) {
      console.error(error);
      setMessage(
        "Unable to connect to LocalStock backend. Please verify FastAPI is running."
      );
    } finally {
      setLoading(false);
    }
  };

  const loadInventory = async () => {
    setInventoryLoading(true);
    try {
      const response = await fetch(`${API}/inventory`);
      const data = await response.json();
      setInventory(data.products || []);
    } catch (error) {
      console.error(error);
      setMessage("Could not load inventory.");
    } finally {
      setInventoryLoading(false);
    }
  };

  const loadReservations = async () => {
    setReservationLoading(true);
    try {
      const response = await fetch(`${API}/reservations`);
      const data = await response.json();
      const list = data.reservations || [];
      setReservations(list);
      setCustomerReservations(list);
    } catch (error) {
      console.error(error);
      setMessage("Could not load reservations.");
    } finally {
      setReservationLoading(false);
    }
  };

  // =========================================================
  // AUTHENTICATION
  // =========================================================

  const handleLogin = async (email, password) => {
    try {
      const response = await fetch(`${API}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.detail || "Login failed.");
        return false;
      }
      localStorage.setItem("localstock_token", data.token);
      localStorage.setItem("localstock_user", JSON.stringify(data.user));
      setToken(data.token);
      setUser(data.user);
      if (data.user?.role === "shopkeeper") {
        setMode("shopkeeper");
      }
      setShowAuth(false);
      setMessage(`Welcome back, ${data.user.name}.`);
      return true;
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to LocalStock backend.");
      return false;
    }
  };

  const handleRegister = async (name, email, password, role) => {
    try {
      const response = await fetch(`${API}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await response.json();
      if (!response.ok) {
        setMessage(data.detail || "Registration failed.");
        return false;
      }
      setAuthMode("login");
      setMessage("Account created. Please log in.");
      return true;
    } catch (error) {
      console.error(error);
      setMessage("Unable to connect to LocalStock backend.");
      return false;
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("localstock_token");
    localStorage.removeItem("localstock_user");
    setToken("");
    setUser(null);
    setMode("customer");
    setMessage("You have been logged out.");
  };

  const requireShopkeeper = () => {
    if (user?.role !== "shopkeeper") {
      setAuthMode("login");
      setShowAuth(true);
      setMessage("Please sign in with a shopkeeper account to access the store dashboard.");
      return false;
    }
    return true;
  };

  // =========================================================
  // LIFECYCLE
  // =========================================================

  useEffect(() => {
    loadInventory();
    loadReservations();
  }, []);

  useEffect(() => {
    if (mode === "shopkeeper") {
      loadInventory();
      loadReservations();
    } else {
      loadReservations();
    }
  }, [mode]);

  // =========================================================
  // RESERVATION ACTIONS
  // =========================================================

  const reserveProduct = async (product) => {
    setMessage("");

    const customerName = user?.name
      ? user.name
      : window.prompt("Enter your name for the store reservation:", "Guest Customer") || "Guest Customer";

    try {
      const response = await fetch(`${API}/reserve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: product.id,
          shop: product.shop,
          customer_name: customerName,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setMessage(data.message || "Reservation failed.");
        return;
      }

      // Trigger modern confirmation modal
      setReservationSuccess({
        id: data.reservation_id,
        product: product.product,
        shop: product.shop,
        price: product.price,
        customer_name: customerName,
        address: product.address,
        latitude: product.latitude,
        longitude: product.longitude,
      });

      setSelectedProduct(null);

      // Refresh data
      await loadReservations();
      await loadInventory();
      if (query) {
        await searchProducts(query);
      }
    } catch (error) {
      console.error(error);
      setMessage("Reservation failed. Please try again.");
    }
  };

  // =========================================================
  // SHOPKEEPER FORM & CRUD
  // =========================================================

  const handleFormChange = (event) => {
    setForm({
      ...form,
      [event.target.name]: event.target.value,
    });
  };

  const addProduct = async (event) => {
    event.preventDefault();
    setMessage("");

    try {
      const response = await fetch(`${API}/inventory`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          shop: form.shop,
          product: form.product,
          category: form.category,
          price: Number(form.price),
          online_price: Number(form.online_price || form.price),
          stock: Number(form.stock || 0),
          distance: Number(form.distance || 0),
          rating: Number(form.rating || 0),
          address: form.address,
          latitude: form.latitude ? Number(form.latitude) : null,
          longitude: form.longitude ? Number(form.longitude) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to add product");
      }

      setMessage("✅ Product added to inventory.");
      setForm({
        shop: "",
        product: "",
        category: "",
        price: "",
        online_price: "",
        stock: "",
        distance: "",
        rating: "",
        address: "",
        latitude: "",
        longitude: "",
      });

      await loadInventory();
    } catch (error) {
      console.error(error);
      setMessage("Could not add product.");
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setUploading(true);
    setUploadResult(null);
    setMessage("");

    try {
      const response = await fetch(`${API}/inventory/upload`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "Upload failed");
      }
      setUploadResult(data);
      if (data.success) {
        setMessage(`✅ ${data.message}`);
        await loadInventory();
      } else {
        setMessage(`⚠️ ${data.message}`);
      }
    } catch (error) {
      console.error(error);
      setMessage(error.message || "Failed to upload catalog file.");
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  const deleteProduct = async (productId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to remove this product from inventory?"
    );
    if (!confirmDelete) return;

    try {
      const response = await fetch(`${API}/inventory/${productId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      if (data.success) {
        setMessage("✅ Product deleted from inventory.");
        await loadInventory();
      } else {
        setMessage(data.message || "Delete failed.");
      }
    } catch (error) {
      console.error(error);
      setMessage("Could not delete product.");
    }
  };

  const updateReservationStatus = async (reservationId, newStatus) => {
    try {
      const response = await fetch(`${API}/reservations/${reservationId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await response.json();
      if (!data.success) {
        setMessage(data.message || "Status update failed.");
        return;
      }
      setMessage(`✅ Reservation #${reservationId} updated to ${formatStatus(newStatus)}.`);
      await loadReservations();
    } catch (error) {
      console.error(error);
      setMessage("Could not update reservation status.");
    }
  };

  // =========================================================
  // HELPERS
  // =========================================================

  const formatStatus = (status) => {
    if (status === "reserved") return "Reserved";
    if (status === "ready") return "Ready for Pickup";
    if (status === "completed") return "Completed";
    if (status === "cancelled") return "Cancelled";
    return status;
  };

  const statusStyle = (status) => {
    if (status === "reserved") return "bg-amber-50 text-amber-800 border border-amber-200/80";
    if (status === "ready") return "bg-indigo-50 text-indigo-800 border border-indigo-200/80";
    if (status === "completed") return "bg-emerald-50 text-emerald-800 border border-emerald-200/80";
    if (status === "cancelled") return "bg-rose-50 text-rose-800 border border-rose-200/80";
    return "bg-slate-100 text-slate-800";
  };

  const getSavings = (product) => {
    if (product.savings !== undefined && product.savings !== null) {
      return Number(product.savings);
    }
    return Math.max(
      0,
      Number(product.online_price || 0) - Number(product.price || 0)
    );
  };

  const getUrgencyMessage = () => {
    const understanding = searchData?.understanding;
    if (!understanding) return null;
    const urgency = String(understanding.urgency || "").toLowerCase();
    if (
      urgency.includes("high") ||
      urgency.includes("urgent") ||
      urgency.includes("today")
    ) {
      return (
        "⚡ Time-sensitive search detected. Local stock is held for immediate walk-in pickup."
      );
    }
    return null;
  };

  const exampleSearch = (text) => {
    setQuery(text);
    searchProducts(text);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col justify-between selection:bg-emerald-500 selection:text-white">
      
      {/* Top Sticky Header */}
      <div>
        <Navbar
          mode={mode}
          setMode={setMode}
          user={user}
          token={token}
          handleLogout={handleLogout}
          setShowAuth={setShowAuth}
          setAuthMode={setAuthMode}
          location={location}
          getLocation={getLocation}
          locationLoading={locationLoading}
          requireShopkeeper={requireShopkeeper}
          onOpenLocationModal={() => setShowLocationModal(true)}
        />

        {/* Main Body View */}
        {mode === "customer" ? (
          <CustomerView
            query={query}
            setQuery={setQuery}
            searchProducts={searchProducts}
            loading={loading}
            searchData={searchData}
            location={location}
            getLocation={getLocation}
            locationLoading={locationLoading}
            exampleSearch={exampleSearch}
            setSelectedProduct={setSelectedProduct}
            reserveProduct={reserveProduct}
            openMap={openMap}
            getSavings={getSavings}
            getUrgencyMessage={getUrgencyMessage}
            customerReservations={customerReservations}
            formatStatus={formatStatus}
            statusStyle={statusStyle}
            loadInventory={loadInventory}
            inventory={inventory}
            onOpenLocationModal={() => setShowLocationModal(true)}
          />
        ) : (
          <ShopkeeperView
            inventory={inventory}
            inventoryLoading={inventoryLoading}
            loadInventory={loadInventory}
            form={form}
            handleFormChange={handleFormChange}
            addProduct={addProduct}
            deleteProduct={deleteProduct}
            handleFileUpload={handleFileUpload}
            uploading={uploading}
            uploadResult={uploadResult}
            reservations={reservations}
            reservationLoading={reservationLoading}
            updateReservationStatus={updateReservationStatus}
            formatStatus={formatStatus}
            statusStyle={statusStyle}
            openMap={openMap}
          />
        )}
      </div>

      {/* Global Product Detail Modal */}
      {/* Global Location Selection Modal */}
      <LocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        currentLocation={location}
        onSelectLocation={handleSelectLocation}
        onAutoDetect={getLocation}
        locationLoading={locationLoading}
      />

      <ProductModal
        selectedProduct={selectedProduct}
        setSelectedProduct={setSelectedProduct}
        onReserve={reserveProduct}
        onOpenMap={openMap}
        getSavings={getSavings}
      />

      {/* Global Authentication Modal */}
      <AuthModal
        showAuth={showAuth}
        setShowAuth={setShowAuth}
        authMode={authMode}
        setAuthMode={setAuthMode}
        handleLogin={handleLogin}
        handleRegister={handleRegister}
        message={message}
      />

      {/* Global Reservation Confirmation Modal */}
      <ReservationSuccessModal
        reservationDetails={reservationSuccess}
        onClose={() => setReservationSuccess(null)}
        onOpenMap={openMap}
      />

      {/* Toast Alert */}
      <Toast message={message} onClose={() => setMessage("")} />

      {/* Modern Startup Footer */}
      <footer className="mt-16 border-t border-slate-200 bg-white py-8 sm:py-10 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Store className="w-3.5 h-3.5" />
            </div>
            <span className="font-bold text-slate-900 text-sm">
              Local<span className="text-emerald-600">Stock</span>
            </span>
            <span className="text-slate-400">· Real-time local store inventory platform</span>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
            <span>Zero delivery lag</span>
            <span>·</span>
            <span>Real store pricing</span>
            <span>·</span>
            <span>Direct pickup</span>
          </div>
        </div>
      </footer>

    </div>
  );
}

export default App;
