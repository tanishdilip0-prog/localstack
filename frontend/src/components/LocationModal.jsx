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

export const CHENNAI_PRESETS = [
  {
    name: "Ritchie Street",
    landmark: "Meeran Sahib St, Mount Road",
    latitude: 13.0694,
    longitude: 80.2704,
    tag: "Asia's 2nd Largest Electronics Market",
  },
  {
    name: "T. Nagar",
    landmark: "Pondy Bazaar & Usman Road",
    latitude: 13.0418,
    longitude: 80.2341,
    tag: "Prime Retail Hub",
  },
  {
    name: "Anna Nagar",
    landmark: "2nd Avenue & Roundtana",
    latitude: 13.0850,
    longitude: 80.2101,
    tag: "North West Hub",
  },
  {
    name: "Velachery",
    landmark: "Phoenix Marketcity & Bypass Rd",
    latitude: 12.9815,
    longitude: 80.2180,
    tag: "South Mall Hub",
  },
  {
    name: "Adyar",
    landmark: "LB Road & Gandhi Nagar",
    latitude: 13.0012,
    longitude: 80.2565,
    tag: "South Chennai",
  },
  {
    name: "OMR Thoraipakkam",
    landmark: "Rajiv Gandhi Salai IT Corridor",
    latitude: 12.9348,
    longitude: 80.2312,
    tag: "IT Express Highway",
  },
  {
    name: "OMR Sholinganallur",
    landmark: "ELCOT SEZ & Toll Junction",
    latitude: 12.9010,
    longitude: 80.2279,
    tag: "South IT SEZ",
  },
  {
    name: "Vadapalani",
    landmark: "Forum Vijaya Mall & Arcot Rd",
    latitude: 13.0500,
    longitude: 80.2121,
    tag: "Central Cinema & Retail",
  },
  {
    name: "Mylapore",
    landmark: "Luz Corner & Kutchery Road",
    latitude: 13.0368,
    longitude: 80.2676,
    tag: "Cultural & Retail District",
  },
  {
    name: "Tambaram",
    landmark: "GST Road & West Market",
    latitude: 12.9249,
    longitude: 80.1000,
    tag: "South Gateway",
  },
  {
    name: "Nungambakkam",
    landmark: "Khader Nawaz Khan & Sterling Rd",
    latitude: 13.0569,
    longitude: 80.2425,
    tag: "Central Commercial",
  },
  {
    name: "Porur",
    landmark: "Mount Poonamallee Road",
    latitude: 13.0382,
    longitude: 80.1565,
    tag: "West Tech Hub",
  },
  {
    name: "Royapettah / EA",
    landmark: "Express Avenue Mall",
    latitude: 13.0588,
    longitude: 80.2642,
    tag: "Mall & Retail Hub",
  },
  {
    name: "Guindy",
    landmark: "Kathipara & Race Course Rd",
    latitude: 13.0067,
    longitude: 80.2025,
    tag: "Industrial & Metro Hub",
  },
  {
    name: "Chromepet",
    landmark: "GST Road & Radha Nagar",
    latitude: 12.9516,
    longitude: 80.1462,
    tag: "South Suburb Hub",
  },
  {
    name: "Purasawalkam",
    landmark: "High Road & Doveton",
    latitude: 13.0900,
    longitude: 80.2580,
    tag: "North Central Retail",
  },
  {
    name: "Ambattur",
    landmark: "OT & Industrial Estate",
    latitude: 13.1143,
    longitude: 80.1548,
    tag: "North West Industrial",
  },
  {
    name: "Thiruvanmiyur / ECR",
    landmark: "Tidel Park & East Coast Road",
    latitude: 12.9830,
    longitude: 80.2594,
    tag: "Coastal Tech Hub",
  },
  {
    name: "Kilpauk",
    landmark: "EVR Periyar Salai & Taylors Rd",
    latitude: 13.0784,
    longitude: 80.2412,
    tag: "Central West",
  },
  {
    name: "Besant Nagar",
    landmark: "Elliot's Beach Road",
    latitude: 13.0003,
    longitude: 80.2707,
    tag: "Beachside District",
  },
  {
    name: "Alwarpet",
    landmark: "TTK Road & Eldams Rd",
    latitude: 13.0334,
    longitude: 80.2505,
    tag: "Central South",
  },
  {
    name: "Perambur",
    landmark: "Madhavaram High Road & ICF",
    latitude: 13.1075,
    longitude: 80.2334,
    tag: "North Chennai",
  },
  {
    name: "Egmore",
    landmark: "Railway Station & Pantheon Rd",
    latitude: 13.0732,
    longitude: 80.2609,
    tag: "Transit & Commercial",
  },
  {
    name: "Triplicane",
    landmark: "Bharathi Salai & Pycrofts Rd",
    latitude: 13.0587,
    longitude: 80.2757,
    tag: "Heritage Retail",
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
    if (!searchFilter.trim()) return CHENNAI_PRESETS;
    const q = searchFilter.toLowerCase();
    return CHENNAI_PRESETS.filter(
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
                Choose Chennai Location
              </h2>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Explore local stock across Ritchie St, T.Nagar, Anna Nagar, OMR & all of Chennai
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition"
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
              {currentLocation?.name || "Chennai Central"}
            </span>
            {currentLocation?.latitude && (
              <span className="text-emerald-700 font-normal hidden sm:inline text-[11px]">
                ({currentLocation.latitude.toFixed(3)}, {currentLocation.longitude.toFixed(3)})
              </span>
            )}
          </div>
          <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full uppercase tracking-wider shrink-0">
            210+ Chennai Stores
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
                  Test any location in Chennai / Tamil Nadu
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
                    placeholder="E.g. 13.0694"
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
                    placeholder="E.g. 80.2704"
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
                  placeholder="E.g. My Home, DLF Porur, Tidel Park"
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
              placeholder="Search Chennai locality (e.g. Ritchie St, T.Nagar, Velachery, OMR)..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200/90 text-xs text-slate-800 placeholder:text-slate-400 bg-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          {/* Preset Locations Grid */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Chennai Localities ({filteredPresets.length})
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Click any to set active location
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
          <span>Stores and stock update instantly for your chosen Chennai location.</span>
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
