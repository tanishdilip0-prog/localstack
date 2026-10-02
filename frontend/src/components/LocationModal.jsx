import React, { useState, useMemo } from "react";
import {
  MapPin,
  Search,
  Navigation,
  Check,
  X,
  Compass,
  Sliders,
  Sparkles,
  Building2,
  ChevronRight
} from "lucide-react";

export const BENGALURU_PRESETS = [
  {
    name: "Koramangala",
    landmark: "Forum Mall & Sony World",
    latitude: 12.9352,
    longitude: 77.6245,
    tag: "South Tech Hub",
  },
  {
    name: "Indiranagar",
    landmark: "100 Ft Rd & CMH Road",
    latitude: 12.9719,
    longitude: 77.6412,
    tag: "Central East",
  },
  {
    name: "Whitefield",
    landmark: "ITPL & Phoenix Marketcity",
    latitude: 12.9698,
    longitude: 77.7499,
    tag: "East Tech Hub",
  },
  {
    name: "HSR Layout",
    landmark: "27th Main & Sectors 1-7",
    latitude: 12.9116,
    longitude: 77.6389,
    tag: "Startup Hub",
  },
  {
    name: "Jayanagar",
    landmark: "4th Block Shopping Complex",
    latitude: 12.9256,
    longitude: 77.5934,
    tag: "South Bangalore",
  },
  {
    name: "SP Road / Chickpet",
    landmark: "Electronics & PC Parts Market",
    latitude: 12.9726,
    longitude: 77.5750,
    tag: "Electronics Bazaar",
  },
  {
    name: "MG Road / Brigade Rd",
    landmark: "Trinity Circle & Metro",
    latitude: 12.9752,
    longitude: 77.6077,
    tag: "Central CBD",
  },
  {
    name: "Electronic City",
    landmark: "Infosys Gate & Phase 1/2",
    latitude: 12.8458,
    longitude: 77.6681,
    tag: "South Tech Corridor",
  },
  {
    name: "Malleshwaram",
    landmark: "Sampige Rd & 8th Cross",
    latitude: 13.0035,
    longitude: 77.5674,
    tag: "North West",
  },
  {
    name: "BTM Layout",
    landmark: "Outer Ring Rd & Udupi Garden",
    latitude: 12.9166,
    longitude: 77.6101,
    tag: "South Bangalore",
  },
  {
    name: "Marathahalli",
    landmark: "Bridge & Outer Ring Rd",
    latitude: 12.9560,
    longitude: 77.7011,
    tag: "East Corridor",
  },
  {
    name: "Hebbal",
    landmark: "Flyover & Elements Mall",
    latitude: 13.0358,
    longitude: 77.5970,
    tag: "North Bangalore",
  },
  {
    name: "Rajajinagar",
    landmark: "Orion Mall & Dr Rajkumar Rd",
    latitude: 12.9922,
    longitude: 77.5488,
    tag: "West Bangalore",
  },
  {
    name: "Commercial Street",
    landmark: "Shivajinagar & Tasker Town",
    latitude: 12.9819,
    longitude: 77.6082,
    tag: "Retail District",
  },
  {
    name: "Frazer Town",
    landmark: "Mosque Road & Coles Park",
    latitude: 12.9885,
    longitude: 77.6169,
    tag: "Central East",
  },
  {
    name: "JP Nagar",
    landmark: "Central Mall & Phase 1-7",
    latitude: 12.9081,
    longitude: 77.5858,
    tag: "South Bangalore",
  },
  {
    name: "Banashankari",
    landmark: "BDA Complex & Temple Rd",
    latitude: 12.9330,
    longitude: 77.5536,
    tag: "South West",
  },
  {
    name: "Vijayanagar",
    landmark: "Pipeline Rd & RPC Layout",
    latitude: 12.9726,
    longitude: 77.5202,
    tag: "West Bangalore",
  },
  {
    name: "Yelahanka",
    landmark: "New Town & Airport Road",
    latitude: 13.1005,
    longitude: 77.5963,
    tag: "North Airport Zone",
  },
  {
    name: "Bellandur / Sarjapur",
    landmark: "EcoSpace & Central Jail Rd",
    latitude: 12.9265,
    longitude: 77.6718,
    tag: "ORR Tech Parks",
  },
];

export default function LocationModal({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
  onAutoDetect,
  locationLoading,
}) {
  const [searchFilter, setSearchFilter] = useState("");
  const [showCustomCoord, setShowCustomCoord] = useState(false);
  const [customLat, setCustomLat] = useState("");
  const [customLng, setCustomLng] = useState("");
  const [customName, setCustomName] = useState("");

  const filteredPresets = useMemo(() => {
    if (!searchFilter.trim()) return BENGALURU_PRESETS;
    const q = searchFilter.toLowerCase();
    return BENGALURU_PRESETS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.landmark.toLowerCase().includes(q) ||
        p.tag.toLowerCase().includes(q)
    );
  }, [searchFilter]);

  if (!isOpen) return null;

  const handleApplyCustomCoords = (e) => {
    e.preventDefault();
    const lat = parseFloat(customLat);
    const lng = parseFloat(customLng);
    if (isNaN(lat) || isNaN(lng)) {
      alert("Please enter valid latitude and longitude numbers.");
      return;
    }
    onSelectLocation({
      latitude: lat,
      longitude: lng,
      name: customName.trim() || `Coords (${lat.toFixed(3)}, ${lng.toFixed(3)})`,
      enabled: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/90 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-start justify-between bg-gradient-to-r from-slate-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                Choose Your Location
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Select your area to discover nearby store stock & accurate distances
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Current Selected Location Indicator */}
        <div className="px-6 py-3 bg-emerald-50/70 border-b border-emerald-100/80 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 text-emerald-900 font-semibold truncate">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Active:</span>
            <span className="font-bold underline truncate">
              {currentLocation?.name || "Bengaluru Central"}
            </span>
            {currentLocation?.latitude && (
              <span className="text-emerald-700 font-normal hidden sm:inline text-[11px]">
                ({currentLocation.latitude.toFixed(3)}, {currentLocation.longitude.toFixed(3)})
              </span>
            )}
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
            200+ Stores Live
          </span>
        </div>

        {/* Body content */}
        <div className="p-5 sm:p-6 space-y-4 overflow-y-auto flex-1">
          
          {/* Quick Action: Auto-Detect */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onAutoDetect}
              disabled={locationLoading}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs disabled:opacity-50"
            >
              <Navigation className="w-3.5 h-3.5 text-emerald-400" />
              <span>{locationLoading ? "Detecting Location..." : "Auto-Detect My GPS / IP"}</span>
            </button>

            <button
              type="button"
              onClick={() => setShowCustomCoord(!showCustomCoord)}
              className="py-2.5 px-3.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition flex items-center gap-1.5"
            >
              <Sliders className="w-3.5 h-3.5 text-slate-500" />
              <span>{showCustomCoord ? "Hide Custom" : "Custom GPS"}</span>
            </button>
          </div>

          {/* Custom Coordinates Form */}
          {showCustomCoord && (
            <form
              onSubmit={handleApplyCustomCoords}
              className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 animate-fade-in"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">
                  Enter Exact Coordinates
                </span>
                <span className="text-[10px] text-slate-500">
                  Test any location in Karnataka
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Latitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={customLat}
                    onChange={(e) => setCustomLat(e.target.value)}
                    placeholder="E.g. 12.9716"
                    required
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                    Longitude
                  </label>
                  <input
                    type="number"
                    step="any"
                    value={customLng}
                    onChange={(e) => setCustomLng(e.target.value)}
                    placeholder="E.g. 77.5946"
                    required
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div>
                <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                  Location Label (Optional)
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="E.g. My Office, MG Road Hub"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white text-slate-800 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-xs"
              >
                Set Custom Coordinates
              </button>
            </form>
          )}

          {/* Search Localities */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              placeholder="Search Bangalore locality (e.g. Koramangala, Whitefield, HSR)..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200/90 text-xs text-slate-800 placeholder:text-slate-400 bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Preset Locations Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Popular Bangalore Areas ({filteredPresets.length})
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Click any to set as active location
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredPresets.map((preset) => {
                const isSelected =
                  currentLocation?.name?.toLowerCase() === preset.name.toLowerCase() ||
                  (Math.abs((currentLocation?.latitude || 0) - preset.latitude) < 0.005 &&
                    Math.abs((currentLocation?.longitude || 0) - preset.longitude) < 0.005);

                return (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      onSelectLocation({
                        latitude: preset.latitude,
                        longitude: preset.longitude,
                        name: preset.name,
                        enabled: true,
                      });
                      onClose();
                    }}
                    className={`text-left p-3 rounded-xl border transition flex items-center justify-between group ${
                      isSelected
                        ? "bg-emerald-50/90 border-emerald-300 ring-1 ring-emerald-400"
                        : "bg-white hover:bg-slate-50 border-slate-200/80 hover:border-emerald-200"
                    }`}
                  >
                    <div className="min-w-0 pr-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition truncate">
                          {preset.name}
                        </span>
                        <span className="text-[9px] font-semibold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600 shrink-0">
                          {preset.tag}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {preset.landmark}
                      </p>
                    </div>

                    {isSelected ? (
                      <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    ) : (
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition shrink-0" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Stores and stock update instantly for your chosen location.</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold transition"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
