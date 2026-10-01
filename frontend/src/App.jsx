import { useEffect, useState } from "react";



const API = "http://127.0.0.1:8000";



function App() {

  const [mode, setMode] = useState("customer");



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



  const [location, setLocation] = useState({

    latitude: null,

    longitude: null,

    enabled: false,

  });



  const [locationLoading, setLocationLoading] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);



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

  // GET USER LOCATION

  // =========================================================



  const getLocation = () => {

    if (!navigator.geolocation) {

      setMessage("Your browser does not support location.");

      return;

    }



    setLocationLoading(true);

    setMessage("");



    navigator.geolocation.getCurrentPosition(

      (position) => {

        setLocation({

          latitude: position.coords.latitude,

          longitude: position.coords.longitude,

          enabled: true,

        });



        setLocationLoading(false);

        setMessage("📍 Location enabled. Nearby stores will be prioritized.");

      },

      () => {

        setLocationLoading(false);

        setMessage(

          "Location permission was not granted. You can still search normally."

        );

      },

      {

        enableHighAccuracy: true,

        timeout: 10000,

        maximumAge: 300000,

      }

    );

  };



  // =========================================================

  // OPEN MAP

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

  // SEARCH PRODUCTS

  // =========================================================



  const searchProducts = async (customQuery = null) => {

    const searchText =

      customQuery !== null ? customQuery : query;



    if (!searchText.trim()) {

      setMessage("Please enter what you are looking for.");

      return;

    }



    setLoading(true);

    setMessage("");

    setSearchData(null);



    try {

      const response = await fetch(`${API}/ai/search`, {

        method: "POST",

        headers: {

          "Content-Type": "application/json",

        },

        body: JSON.stringify({

          message: searchText,

          latitude: location.latitude,

          longitude: location.longitude,

        }),

      });



      const data = await response.json();



      if (!response.ok) {

        throw new Error("Search failed");

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

        "Unable to connect to LocalStock backend. Make sure FastAPI is running."

      );

    } finally {

      setLoading(false);

    }

  };



  // =========================================================

  // LOAD INVENTORY

  // =========================================================



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



  // =========================================================

  // LOAD RESERVATIONS

  // =========================================================



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
      setMessage("Please log in with a shopkeeper account to open the dashboard.");
      return false;
    }
    return true;
  };

  // MODE CHANGE

  // =========================================================



  useEffect(() => {

    if (mode === "shopkeeper") {

      loadInventory();

      loadReservations();

    }



    if (mode === "customer") {

      loadReservations();

    }

  }, [mode]);



  // =========================================================

  // RESERVE PRODUCT

  // =========================================================



  const reserveProduct = async (product) => {

    setMessage("");



    const customerName =

      window.prompt(

        "Enter your name for the reservation:",

        "Guest Customer"

      ) || "Guest Customer";



    try {

      const response = await fetch(`${API}/reserve`, {

        method: "POST",

        headers: {

          "Content-Type": "application/json",

        },

        body: JSON.stringify({

          product_id: product.id,

          shop: product.shop,

          customer_name: customerName,

        }),

      });



      const data = await response.json();



      if (!response.ok) {

        throw new Error("Reservation failed");

      }



      if (!data.success) {

        setMessage(data.message || "Reservation failed.");

        return;

      }



      setMessage(

        `✅ Reserved successfully! Reservation #${data.reservation_id}`

      );



      setSelectedProduct(null);



      await searchProducts(query);

      await loadReservations();

      await loadInventory();

    } catch (error) {

      console.error(error);

      setMessage("Reservation failed. Please try again.");

    }

  };



  // =========================================================

  // FORM CHANGE

  // =========================================================



  const handleFormChange = (event) => {

    setForm({

      ...form,

      [event.target.name]: event.target.value,

    });

  };



  // =========================================================

  // ADD PRODUCT

  // =========================================================



  const addProduct = async (event) => {

    event.preventDefault();



    setMessage("");



    try {

      const response = await fetch(`${API}/inventory`, {

        method: "POST",

        headers: {

          "Content-Type": "application/json",

        },

        body: JSON.stringify({

          shop: form.shop,

          product: form.product,

          category: form.category,

          price: Number(form.price),

          online_price: Number(form.online_price),

          stock: Number(form.stock),

          distance: Number(form.distance || 0),

          rating: Number(form.rating || 0),



          // Supported if backend has these fields

          address: form.address,

          latitude: form.latitude

            ? Number(form.latitude)

            : null,

          longitude: form.longitude

            ? Number(form.longitude)

            : null,

        }),

      });



      const data = await response.json();



      if (!response.ok) {

        throw new Error("Failed");

      }



      if (!data.success) {

        setMessage(data.message || "Could not add product.");

        return;

      }



      setMessage("✅ Product added successfully.");



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



      loadInventory();

    } catch (error) {

      console.error(error);

      setMessage("Could not add product.");

    }

  };



  // =========================================================

  // DELETE PRODUCT

  // =========================================================



  const deleteProduct = async (productId) => {

    const confirmDelete = window.confirm(

      "Are you sure you want to delete this product?"

    );



    if (!confirmDelete) return;



    try {

      const response = await fetch(

        `${API}/inventory/${productId}`,

        {

          method: "DELETE",

        }

      );



      const data = await response.json();



      if (data.success) {

        setMessage("✅ Product deleted.");

        loadInventory();

      } else {

        setMessage(data.message || "Delete failed.");

      }

    } catch (error) {

      console.error(error);

      setMessage("Could not delete product.");

    }

  };



  // =========================================================

  // UPDATE RESERVATION STATUS

  // =========================================================



  const updateReservationStatus = async (

    reservationId,

    newStatus

  ) => {

    try {

      const response = await fetch(

        `${API}/reservations/${reservationId}/status`,

        {

          method: "PATCH",

          headers: {

            "Content-Type": "application/json",

          },

          body: JSON.stringify({

            status: newStatus,

          }),

        }

      );



      const data = await response.json();



      if (!data.success) {

        setMessage(data.message || "Status update failed.");

        return;

      }



      setMessage(

        `✅ Reservation #${reservationId} updated to ${formatStatus(

          newStatus

        )}.`

      );



      await loadReservations();

    } catch (error) {

      console.error(error);

      setMessage("Could not update reservation status.");

    }

  };



  // =========================================================

  // STATUS HELPERS

  // =========================================================



  const formatStatus = (status) => {

    if (status === "reserved") return "Reserved";

    if (status === "ready") return "Ready for Pickup";

    if (status === "completed") return "Completed";

    if (status === "cancelled") return "Cancelled";



    return status;

  };



  const statusStyle = (status) => {

    if (status === "reserved") {

      return "bg-yellow-100 text-yellow-800";

    }



    if (status === "ready") {

      return "bg-blue-100 text-blue-800";

    }



    if (status === "completed") {

      return "bg-green-100 text-green-800";

    }



    if (status === "cancelled") {

      return "bg-red-100 text-red-800";

    }



    return "bg-gray-100 text-gray-800";

  };



  // =========================================================

  // STOCK HELPERS

  // =========================================================



  const getStockText = (stock) => {

    const value = Number(stock || 0);



    if (value <= 0) return "Out of stock";

    if (value <= 3) return `Only ${value} left`;

    if (value <= 7) return `${value} available`;



    return `${value} in stock`;

  };



  const getStockStyle = (stock) => {

    const value = Number(stock || 0);



    if (value <= 0) {

      return "text-red-400 bg-red-500/10 border-red-500/20";

    }



    if (value <= 3) {

      return "text-orange-400 bg-orange-500/10 border-orange-500/20";

    }



    return "text-green-400 bg-green-500/10 border-green-500/20";

  };



  // =========================================================

  // SAVINGS

  // =========================================================



  const getSavings = (product) => {

    if (product.savings !== undefined && product.savings !== null) {

      return Number(product.savings);

    }



    return Math.max(

      0,

      Number(product.online_price || 0) -

        Number(product.price || 0)

    );

  };



  // =========================================================

  // URGENCY MESSAGE

  // =========================================================



  const getUrgencyMessage = () => {

    const understanding = searchData?.understanding;



    if (!understanding) return null;



    const urgency = String(

      understanding.urgency || ""

    ).toLowerCase();



    if (

      urgency.includes("high") ||

      urgency.includes("urgent") ||

      urgency.includes("today")

    ) {

      return (

        "⚡ Your request looks time-sensitive. " +

        "We found local options so you can check availability and pick up without waiting for delivery."

      );

    }



    return null;

  };



  // =========================================================

  // SEARCH EXAMPLES

  // =========================================================



  const exampleSearch = (text) => {

    setQuery(text);

    searchProducts(text);

  };



  // =========================================================

  // CUSTOMER VIEW

  // =========================================================



  const CustomerView = () => {

    const products = searchData?.results?.products || [];



    return (

      <main className="max-w-7xl mx-auto px-6 py-10">



        {/* HERO */}



        <section className="text-center max-w-4xl mx-auto mb-12">



          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm mb-6">

            <span className="text-green-400">●</span>

            AI-powered local inventory

          </div>



          <h2 className="text-4xl md:text-6xl font-bold leading-tight">

            Find products

            <span className="text-cyan-400">

              {" "}near you.

            </span>

          </h2>



          <p className="text-slate-400 mt-5 text-lg">

            Search naturally. Compare local prices.

            Reserve instantly. Pick up nearby.

          </p>



        </section>



        {/* SEARCH */}



        <section className="max-w-4xl mx-auto">



          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 shadow-2xl">



            <div className="flex flex-col md:flex-row gap-3">



              <input

                value={query}

                onChange={(e) => setQuery(e.target.value)}

                onKeyDown={(e) => {

                  if (e.key === "Enter") {

                    searchProducts();

                  }

                }}

                placeholder="Try: I need a fast charger under ₹800 today"

                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-5 py-4 outline-none focus:border-cyan-400 text-white"

              />



              <button

                onClick={() => searchProducts()}

                disabled={loading}

                className="px-7 py-4 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 disabled:opacity-50"

              >

                {loading ? "Searching..." : "Search"}

              </button>



            </div>



            {/* LOCATION */}



            <div className="flex flex-col sm:flex-row gap-3 mt-3">



              <button

                onClick={getLocation}

                disabled={locationLoading}

                className="flex-1 px-4 py-3 rounded-xl border border-slate-700 bg-slate-950 text-slate-200 hover:border-cyan-400 transition"

              >

                {locationLoading

                  ? "Getting location..."

                  : location.enabled

                  ? "📍 Location enabled"

                  : "📍 Use My Location"}

              </button>



              {location.enabled && (

                <div className="flex items-center justify-center px-4 py-3 rounded-xl bg-green-500/10 border border-green-500/20 text-green-400 text-sm">

                  Nearby search active

                </div>

              )}



            </div>



          </div>



          {/* EXAMPLES */}



          <div className="flex flex-wrap justify-center gap-2 mt-5">



            {[

              "Fast charger under ₹800",

              "Power bank under ₹1000",

              "Laptop charger today",

              "Phone charger near me",

            ].map((item) => (

              <button

                key={item}

                onClick={() => exampleSearch(item)}

                className="px-4 py-2 rounded-full border border-slate-800 bg-slate-900 text-slate-400 text-sm hover:border-cyan-400 hover:text-cyan-300 transition"

              >

                {item}

              </button>

            ))}



          </div>



        </section>



        {/* AI UNDERSTANDING */}



        {searchData?.understanding && (

          <section className="max-w-5xl mx-auto mt-12">



            <div className="flex items-center gap-3 mb-5">

              <div className="h-8 w-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">

                🤖

              </div>



              <div>

                <h3 className="font-semibold">

                  AI Understanding

                </h3>



                <p className="text-xs text-slate-500">

                  LocalStock understood your request

                </p>

              </div>

            </div>



            <div className="grid md:grid-cols-4 gap-4">



              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">

                <p className="text-xs text-slate-500">

                  PRODUCT

                </p>



                <p className="font-semibold mt-2">

                  {searchData.understanding.product || "—"}

                </p>

              </div>



              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">

                <p className="text-xs text-slate-500">

                  BUDGET

                </p>



                <p className="font-semibold mt-2">

                  {searchData.understanding.budget

                    ? `₹${searchData.understanding.budget}`

                    : "Any"}

                </p>

              </div>



              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">

                <p className="text-xs text-slate-500">

                  URGENCY

                </p>



                <p className="font-semibold mt-2">

                  {searchData.understanding.urgency || "Normal"}

                </p>

              </div>



              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">

                <p className="text-xs text-slate-500">

                  INTENT

                </p>



                <p className="font-semibold mt-2">

                  {searchData.understanding.sentiment || "Shopping"}

                </p>

              </div>



            </div>



          </section>

        )}



        {/* URGENCY MESSAGE */}



        {getUrgencyMessage() && (

          <section className="max-w-5xl mx-auto mt-6">



            <div className="rounded-xl border border-orange-500/20 bg-orange-500/10 px-5 py-4 text-orange-300 text-sm">

              {getUrgencyMessage()}

            </div>



          </section>

        )}



        {/* PRODUCTS */}



        {products.length > 0 && (

          <section className="mt-12">



            <div className="flex items-end justify-between mb-6">



              <div>

                <h3 className="text-2xl font-bold">

                  Nearby products

                </h3>



                <p className="text-slate-500 text-sm mt-1">

                  Compare local prices and reserve for pickup.

                </p>

              </div>



              <div className="text-sm text-slate-500">

                {products.length} result

                {products.length !== 1 ? "s" : ""}

              </div>



            </div>



            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">



              {products.map((product) => {



                const savings = getSavings(product);

                const stock = Number(product.stock || 0);



                return (

                  <div

                    key={product.id}

                    className="bg-slate-900 border border-slate-800 rounded-2xl p-5 hover:border-cyan-500/40 transition"

                  >



                    {/* CATEGORY */}



                    <div className="flex items-center justify-between">



                      <span className="text-xs uppercase tracking-wide text-cyan-400">

                        {product.category || "Product"}

                      </span>



                      <span className="text-yellow-400 text-sm">

                        ★ {product.rating || "—"}

                      </span>



                    </div>



                    {/* PRODUCT */}



                    <h4 className="text-xl font-semibold mt-3">

                      {product.product}

                    </h4>



                    {/* PRICE */}



                    <div className="mt-5">



                      <div className="flex items-end gap-3">



                        <span className="text-3xl font-bold text-white">

                          ₹{product.price}

                        </span>



                        {product.online_price && (

                          <span className="text-slate-500 line-through text-sm mb-1">

                            ₹{product.online_price}

                          </span>

                        )}



                      </div>



                      {savings > 0 && (

                        <div className="inline-flex mt-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium">

                          Save ₹{savings}

                        </div>

                      )}



                    </div>



                    {/* SHOP */}



                    <div className="mt-5 space-y-2">



                      <div className="flex items-center gap-2 text-sm text-slate-300">

                        <span>🏪</span>

                        <span>{product.shop}</span>

                      </div>



                      {product.address && (

                        <div className="flex items-start gap-2 text-xs text-slate-500">

                          <span>📍</span>

                          <span>{product.address}</span>

                        </div>

                      )}



                      <div className="flex items-center gap-2 text-sm text-slate-400">

                        <span>🚶</span>

                        <span>

                          {product.distance !== undefined &&

                          product.distance !== null

                            ? `${Number(product.distance).toFixed(1)} km away`

                            : "Distance unavailable"}

                        </span>

                      </div>



                    </div>



                    {/* STOCK */}



                    <div className="mt-4">



                      <span

                        className={`inline-flex px-3 py-1.5 rounded-lg border text-xs font-medium ${getStockStyle(

                          stock

                        )}`}

                      >

                        {stock > 0 ? "● " : "● "}

                        {getStockText(stock)}

                      </span>



                    </div>



                    {/* ACTIONS */}



                    <div className="flex gap-2 mt-5">



                      <button

                        onClick={() => setSelectedProduct(product)}

                        className="flex-1 px-4 py-3 rounded-xl border border-slate-700 text-slate-200 hover:border-cyan-400 hover:text-cyan-300 transition"

                      >

                        View Details

                      </button>



                      <button

                        disabled={stock <= 0}

                        onClick={() => reserveProduct(product)}

                        className="flex-1 px-4 py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 disabled:opacity-40 disabled:cursor-not-allowed"

                      >

                        Reserve

                      </button>



                    </div>



                  </div>

                );

              })}



            </div>



          </section>

        )}



        {/* RESERVATIONS */}



        <section className="mt-16">



          <div className="mb-6">

            <h3 className="text-2xl font-bold">

              My reservations

            </h3>



            <p className="text-slate-500 text-sm mt-1">

              Track your reserved products and pickup status.

            </p>

          </div>



          {reservationLoading ? (

            <div className="text-slate-500">

              Loading reservations...

            </div>

          ) : customerReservations.length === 0 ? (

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-500">

              No reservations yet.

            </div>

          ) : (

            <div className="grid md:grid-cols-2 gap-4">



              {customerReservations.map((reservation) => (



                <div

                  key={reservation.id}

                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5"

                >



                  <div className="flex justify-between gap-4">



                    <div>

                      <p className="text-xs text-slate-500">

                        RESERVATION #{reservation.id}

                      </p>



                      <h4 className="font-semibold mt-2">

                        {reservation.product}

                      </h4>



                      <p className="text-sm text-slate-400 mt-1">

                        {reservation.shop}

                      </p>

                    </div>



                    <span

                      className={`h-fit px-3 py-1 rounded-full text-xs font-medium ${statusStyle(

                        reservation.status

                      )}`}

                    >

                      {formatStatus(reservation.status)}

                    </span>



                  </div>



                  <div className="mt-5 text-sm text-slate-400">

                    ₹{reservation.price}

                  </div>



                </div>



              ))}



            </div>

          )}



        </section>



      </main>

    );

  };



  // =========================================================

  // SHOPKEEPER VIEW

  // =========================================================



  const ShopkeeperView = () => (

    <main className="max-w-7xl mx-auto px-6 py-10">



      <section className="mb-10">



        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm mb-4">

          🏪 Shopkeeper Dashboard

        </div>



        <h2 className="text-4xl font-bold">

          Manage your local inventory.

        </h2>



        <p className="text-slate-400 mt-3">

          Add products, manage stock and handle customer reservations.

        </p>



      </section>



      {/* ADD PRODUCT */}



      <section className="bg-slate-900 border border-slate-800 rounded-2xl p-6">



        <h3 className="text-xl font-bold mb-6">

          Add Product

        </h3>



        <form

          onSubmit={addProduct}

          className="grid md:grid-cols-2 lg:grid-cols-3 gap-4"

        >



          {[

            ["shop", "Shop name"],

            ["product", "Product name"],

            ["category", "Category"],

            ["price", "Local price"],

            ["online_price", "Online/reference price"],

            ["stock", "Stock"],

            ["distance", "Distance (km)"],

            ["rating", "Rating"],

            ["address", "Shop address"],

            ["latitude", "Latitude"],

            ["longitude", "Longitude"],

          ].map(([name, placeholder]) => (



            <input

              key={name}

              name={name}

              value={form[name]}

              onChange={handleFormChange}

              placeholder={placeholder}

              type={

                [

                  "price",

                  "online_price",

                  "stock",

                  "distance",

                  "rating",

                  "latitude",

                  "longitude",

                ].includes(name)

                  ? "number"

                  : "text"

              }

              step={

                ["distance", "rating", "latitude", "longitude"].includes(

                  name

                )

                  ? "any"

                  : undefined

              }

              required={

                [

                  "shop",

                  "product",

                  "category",

                  "price",

                  "online_price",

                  "stock",

                ].includes(name)

              }

              className="bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-cyan-400"

            />



          ))}



          <button

            type="submit"

            className="md:col-span-2 lg:col-span-3 px-5 py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400"

          >

            + Add Product

          </button>



        </form>



      </section>



      {/* INVENTORY */}



      <section className="mt-10">



        <div className="flex items-center justify-between mb-5">



          <div>

            <h3 className="text-2xl font-bold">

              Inventory

            </h3>



            <p className="text-slate-500 text-sm">

              Products currently available in your system.

            </p>

          </div>



          <button

            onClick={loadInventory}

            className="px-4 py-2 rounded-lg border border-slate-700 text-sm hover:border-cyan-400"

          >

            Refresh

          </button>



        </div>



        {inventoryLoading ? (

          <p className="text-slate-500">

            Loading inventory...

          </p>

        ) : inventory.length === 0 ? (

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-500">

            No products available.

          </div>

        ) : (

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">



            {inventory.map((product) => {



              const savings = getSavings(product);



              return (

                <div

                  key={product.id}

                  className="bg-slate-900 border border-slate-800 rounded-2xl p-5"

                >



                  <div className="flex justify-between">



                    <span className="text-xs text-cyan-400 uppercase">

                      {product.category}

                    </span>



                    <span className="text-yellow-400 text-sm">

                      ★ {product.rating || "—"}

                    </span>



                  </div>



                  <h4 className="text-xl font-semibold mt-3">

                    {product.product}

                  </h4>



                  <p className="text-sm text-slate-400 mt-1">

                    {product.shop}

                  </p>



                  {product.address && (

                    <p className="text-xs text-slate-500 mt-3">

                      📍 {product.address}

                    </p>

                  )}



                  <div className="flex items-center justify-between mt-5">



                    <div>

                      <p className="text-2xl font-bold">

                        ₹{product.price}

                      </p>



                      {savings > 0 && (

                        <p className="text-xs text-green-400 mt-1">

                          Save ₹{savings}

                        </p>

                      )}

                    </div>



                    <span

                      className={`px-3 py-1 rounded-lg border text-xs ${getStockStyle(

                        product.stock

                      )}`}

                    >

                      {getStockText(product.stock)}

                    </span>



                  </div>



                  <button

                    onClick={() => deleteProduct(product.id)}

                    className="w-full mt-5 px-4 py-3 rounded-xl border border-red-500/30 text-red-400 hover:bg-red-500/10"

                  >

                    Delete Product

                  </button>



                </div>

              );

            })}



          </div>

        )}



      </section>



      {/* RESERVATIONS */}



      <section className="mt-12">



        <div className="mb-5">

          <h3 className="text-2xl font-bold">

            Customer Reservations

          </h3>



          <p className="text-slate-500 text-sm">

            Manage pickup status for customers.

          </p>

        </div>



        {reservationLoading ? (

          <p className="text-slate-500">

            Loading reservations...

          </p>

        ) : reservations.length === 0 ? (

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 text-center text-slate-500">

            No reservations yet.

          </div>

        ) : (

          <div className="space-y-4">



            {reservations.map((reservation) => (



              <div

                key={reservation.id}

                className="bg-slate-900 border border-slate-800 rounded-2xl p-5"

              >



                <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">



                  <div>



                    <p className="text-xs text-slate-500">

                      RESERVATION #{reservation.id}

                    </p>



                    <h4 className="text-lg font-semibold mt-1">

                      {reservation.product}

                    </h4>



                    <p className="text-sm text-slate-400">

                      {reservation.shop}

                    </p>



                    <p className="text-sm text-slate-500 mt-2">

                      Customer: {reservation.customer_name}

                    </p>



                  </div>



                  <div className="flex flex-wrap gap-2">



                    {["reserved", "ready", "completed", "cancelled"].map(

                      (status) => (



                        <button

                          key={status}

                          onClick={() =>

                            updateReservationStatus(

                              reservation.id,

                              status

                            )

                          }

                          className={`px-3 py-2 rounded-lg text-xs font-medium border ${

                            reservation.status === status

                              ? statusStyle(status)

                              : "border-slate-700 text-slate-400 hover:border-cyan-400"

                          }`}

                        >

                          {formatStatus(status)}

                        </button>



                      )

                    )}



                  </div>



                </div>



              </div>



            ))}



          </div>

        )}



      </section>



    </main>

  );



  // =========================================================

  // AUTH MODAL
  // =========================================================

  const AuthModal = () => {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [role, setRole] = useState("customer");
    const [submitting, setSubmitting] = useState(false);

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

    return (
      <div className="fixed inset-0 z-[120] bg-black/70 backdrop-blur-sm flex items-center justify-center p-5" onClick={() => setShowAuth(false)}>
        <div className="w-full max-w-md bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl" onClick={(event) => event.stopPropagation()}>
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-xs uppercase tracking-widest text-cyan-400">LocalStock</p>
              <h3 className="text-2xl font-bold mt-1">{authMode === "login" ? "Welcome back" : "Create your account"}</h3>
              <p className="text-sm text-slate-500 mt-1">{authMode === "login" ? "Access your LocalStock account." : "Join LocalStock as a customer or shopkeeper."}</p>
            </div>
            <button type="button" onClick={() => setShowAuth(false)} className="text-slate-500 hover:text-white text-xl">✕</button>
          </div>

          <form onSubmit={submit} className="space-y-4">
            {authMode === "register" && (
              <div>
                <label className="text-xs text-slate-400">Name</label>
                <input value={name} onChange={(event) => setName(event.target.value)} required className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-cyan-400" placeholder="Your name" />
              </div>
            )}
            <div>
              <label className="text-xs text-slate-400">Email</label>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-cyan-400" placeholder="you@example.com" />
            </div>
            <div>
              <label className="text-xs text-slate-400">Password</label>
              <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={6} className="mt-1 w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 outline-none focus:border-cyan-400" placeholder="At least 6 characters" />
            </div>
            {authMode === "register" && (
              <div>
                <label className="text-xs text-slate-400">Account type</label>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  {["customer", "shopkeeper"].map((item) => (
                    <button key={item} type="button" onClick={() => setRole(item)} className={`px-4 py-3 rounded-xl border text-sm capitalize transition ${role === item ? "border-cyan-400 bg-cyan-500/10 text-cyan-300" : "border-slate-700 text-slate-400 hover:border-slate-500"}`}>
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <button type="submit" disabled={submitting} className="w-full px-4 py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 disabled:opacity-50">
              {submitting ? "Please wait..." : authMode === "login" ? "Login" : "Create Account"}
            </button>
          </form>

          <div className="text-center mt-5 text-sm text-slate-500">
            {authMode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button type="button" onClick={() => setAuthMode(authMode === "login" ? "register" : "login")} className="text-cyan-400 hover:text-cyan-300 font-medium">
              {authMode === "login" ? "Sign up" : "Login"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // PRODUCT DETAIL MODAL

  // =========================================================



  const ProductModal = () => {

    if (!selectedProduct) return null;



    const product = selectedProduct;

    const savings = getSavings(product);

    const stock = Number(product.stock || 0);



    return (

      <div

        className="fixed inset-0 z-[100] bg-black/70 backdrop-blur-sm flex items-center justify-center p-5"

        onClick={() => setSelectedProduct(null)}

      >



        <div

          className="w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl"

          onClick={(e) => e.stopPropagation()}

        >



          <div className="flex justify-between items-start">



            <div>



              <p className="text-xs uppercase text-cyan-400">

                {product.category || "Product"}

              </p>



              <h3 className="text-2xl font-bold mt-2">

                {product.product}

              </h3>



            </div>



            <button

              onClick={() => setSelectedProduct(null)}

              className="text-slate-500 hover:text-white text-xl"

            >

              ✕

            </button>



          </div>



          {/* PRICE */}



          <div className="mt-6 p-4 rounded-xl bg-slate-950 border border-slate-800">



            <div className="flex items-end gap-3">



              <span className="text-3xl font-bold">

                ₹{product.price}

              </span>



              {product.online_price && (

                <span className="line-through text-slate-500">

                  ₹{product.online_price}

                </span>

              )}



            </div>



            {savings > 0 && (

              <p className="text-green-400 text-sm mt-2">

                💚 You save ₹{savings} compared with the reference online price.

              </p>

            )}



          </div>



          {/* STORE */}



          <div className="mt-5 space-y-3">



            <div className="flex gap-3">

              <span>🏪</span>



              <div>

                <p className="text-sm text-slate-500">

                  Store

                </p>



                <p className="font-medium">

                  {product.shop}

                </p>

              </div>

            </div>



            <div className="flex gap-3">

              <span>📍</span>



              <div>

                <p className="text-sm text-slate-500">

                  Location

                </p>



                <p className="text-sm text-slate-300">

                  {product.address || "Address not available"}

                </p>

              </div>

            </div>



            <div className="flex gap-3">

              <span>🚶</span>



              <div>

                <p className="text-sm text-slate-500">

                  Distance

                </p>



                <p className="text-sm text-slate-300">

                  {product.distance !== undefined &&

                  product.distance !== null

                    ? `${Number(product.distance).toFixed(1)} km`

                    : "Not available"}

                </p>

              </div>

            </div>



            <div className="flex gap-3">

              <span>📦</span>



              <div>

                <p className="text-sm text-slate-500">

                  Availability

                </p>



                <p

                  className={

                    stock > 0

                      ? "text-green-400"

                      : "text-red-400"

                  }

                >

                  {getStockText(stock)}

                </p>

              </div>

            </div>



          </div>



          {/* ACTIONS */}



          <div className="flex gap-3 mt-7">



            <button

              onClick={() => openMap(product)}

              className="flex-1 px-4 py-3 rounded-xl border border-slate-700 hover:border-cyan-400 text-slate-200"

            >

              🗺️ Open Map

            </button>



            <button

              disabled={stock <= 0}

              onClick={() => reserveProduct(product)}

              className="flex-1 px-4 py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold hover:bg-cyan-400 disabled:opacity-40"

            >

              Reserve & Pickup

            </button>



          </div>



        </div>



      </div>

    );

  };



  // =========================================================

  // MAIN

  // =========================================================



  return (

    <div className="min-h-screen bg-slate-950 text-white">



      {/* NAVBAR */}



      <nav className="border-b border-slate-800 bg-slate-950/95 sticky top-0 z-50 backdrop-blur">



        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">



          <div>



            <h1 className="text-2xl font-bold">

              Local<span className="text-cyan-400">Stock</span>

            </h1>



            <p className="text-xs text-slate-400">

              Find it nearby. Reserve it instantly.

            </p>



          </div>



          <div className="flex gap-2 bg-slate-900 p-1 rounded-xl">



            <button

              onClick={() => setMode("customer")}

              className={`px-5 py-2 rounded-lg text-sm font-medium transition ${

                mode === "customer"

                  ? "bg-cyan-500 text-slate-950"

                  : "text-slate-300 hover:bg-slate-800"

              }`}

            >

              Customer

            </button>



            <button

              onClick={() => {
                if (requireShopkeeper()) setMode("shopkeeper");
              }}

              className={`px-5 py-2 rounded-lg text-sm font-medium transition ${

                mode === "shopkeeper"

                  ? "bg-cyan-500 text-slate-950"

                  : "text-slate-300 hover:bg-slate-800"

              }`}

            >

              Shopkeeper

            </button>



          </div>

          <div className="flex items-center gap-3 ml-3">
            {user ? (
              <>
                <div className="hidden sm:block text-right">
                  <p className="text-sm font-medium text-white">{user.name}</p>
                  <p className="text-[11px] uppercase tracking-wide text-slate-500">{user.role}</p>
                </div>
                <button onClick={handleLogout} className="px-4 py-2 rounded-lg border border-slate-700 text-sm text-slate-300 hover:border-cyan-400 hover:text-white transition">
                  Logout
                </button>
              </>
            ) : (
              <button onClick={() => { setAuthMode("login"); setShowAuth(true); }} className="px-4 py-2 rounded-lg bg-cyan-500 text-slate-950 text-sm font-bold hover:bg-cyan-400 transition">
                Login / Sign Up
              </button>
            )}
          </div>



        </div>



      </nav>



      {/* GLOBAL MESSAGE */}



      {message && (

        <div className="max-w-7xl mx-auto px-6 pt-5">



          <div className="bg-slate-900 border border-cyan-500/30 rounded-xl px-5 py-4 text-sm text-cyan-300">

            {message}

          </div>



        </div>

      )}



      {/* PAGE */}



      {mode === "customer" ? (

        <CustomerView />

      ) : (

        <ShopkeeperView />

      )}



      {/* MODAL */}



      <ProductModal />



    </div>

  );

}



export default App;
