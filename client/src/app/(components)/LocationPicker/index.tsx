"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  MapPin, Search, X, Loader2, LocateFixed, Copy, Check,
  Trash2, Map, Satellite, ZoomIn, ZoomOut, Maximize2, Minimize2,
} from "lucide-react";

/* ─────────────────────────── types ─────────────────────────── */
type Props = {
  value: string;
  onChange: (address: string, lat?: number, lng?: number) => void;
};

type NominatimResult = {
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  importance: number;
};

type Coords = { lat: number; lng: number };

type TileLayer = "street" | "satellite";

/* ─────────────── singleton leaflet module reference ─────────── */
let Lref: typeof import("leaflet") | null = null;

const TILE_LAYERS: Record<TileLayer, { url: string; attr: string; label: string }> = {
  street: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attr: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    label: "Street",
  },
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attr: "© Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community",
    label: "Satellite",
  },
};

/* ═══════════════════════ LocationPicker ════════════════════════ */
const LocationPicker = ({ value, onChange }: Props) => {
  /* refs */
  const mapRef        = useRef<HTMLDivElement>(null);
  const mapInst       = useRef<import("leaflet").Map | null>(null);
  const markerInst    = useRef<import("leaflet").Marker | null>(null);
  const tileLayerInst = useRef<import("leaflet").TileLayer | null>(null);
  const searchRef     = useRef<HTMLInputElement>(null);
  const resultsRef    = useRef<HTMLDivElement>(null);

  /* state */
  const [mapReady,      setMapReady]      = useState(false);
  const [search,        setSearch]        = useState("");
  const [searching,     setSearching]     = useState(false);
  const [results,       setResults]       = useState<NominatimResult[]>([]);
  const [showResults,   setShowResults]   = useState(false);
  const [revLoading,    setRevLoading]    = useState(false);
  const [geoLoading,    setGeoLoading]    = useState(false);
  const [coords,        setCoords]        = useState<Coords | null>(null);
  const [copied,        setCopied]        = useState(false);
  const [tile,          setTile]          = useState<TileLayer>("street");
  const [fullscreen,    setFullscreen]    = useState(false);
  const [zoom,          setZoom]          = useState(11);

  /* ── fix Leaflet default icon webpack issue ── */
  const fixIcons = (L: typeof import("leaflet")) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    delete (L.Icon.Default.prototype as any)._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl:        "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl:      "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
  };

  /* ── init map ── */
  useEffect(() => {
    if (mapInst.current || !mapRef.current) return;

    import("leaflet").then((mod) => {
      const L = mod.default ?? mod;
      Lref = L;
      fixIcons(L);

      const map = L.map(mapRef.current!, {
        zoomControl: false,  // custom zoom buttons
        attributionControl: true,
      }).setView([-6.2, 106.8], 11);

      mapInst.current = map;

      tileLayerInst.current = L.tileLayer(TILE_LAYERS.street.url, {
        attribution: TILE_LAYERS.street.attr,
        maxZoom: 19,
      }).addTo(map);

      map.on("click", (e: import("leaflet").LeafletMouseEvent) => {
        const { lat, lng } = e.latlng;
        placeMarker(lat, lng, true);
      });

      map.on("zoomend", () => setZoom(map.getZoom()));

      setMapReady(true);
    });

    return () => {
      mapInst.current?.remove();
      mapInst.current = null;
      markerInst.current = null;
      tileLayerInst.current = null;
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── swap tile layer when toggle changes ── */
  useEffect(() => {
    if (!mapInst.current || !Lref || !tileLayerInst.current) return;
    tileLayerInst.current.remove();
    const cfg = TILE_LAYERS[tile];
    tileLayerInst.current = Lref.tileLayer(cfg.url, {
      attribution: cfg.attr,
      maxZoom: 19,
    }).addTo(mapInst.current);
  }, [tile]);

  /* ── place / move marker ── */
  const placeMarker = useCallback((lat: number, lng: number, doReverseGeocode = false) => {
    if (!mapInst.current || !Lref) return;

    if (markerInst.current) {
      markerInst.current.setLatLng([lat, lng]);
    } else {
      markerInst.current = Lref.marker([lat, lng], { draggable: true })
        .addTo(mapInst.current)
        .on("dragend", (e) => {
          const pos = (e.target as import("leaflet").Marker).getLatLng();
          setCoords({ lat: pos.lat, lng: pos.lng });
          reverseGeocode(pos.lat, pos.lng);
        });
    }

    mapInst.current.panTo([lat, lng]);
    setCoords({ lat, lng });
    if (doReverseGeocode) reverseGeocode(lat, lng);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ── reverse geocode ── */
  const reverseGeocode = async (lat: number, lng: number) => {
    setRevLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
        { headers: { "Accept-Language": "en" } }
      );
      const data = await res.json();
      if (data.display_name) onChange(data.display_name, lat, lng);
    } catch { /* fail silently */ }
    finally { setRevLoading(false); }
  };

  /* ── search ── */
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!search.trim()) return;
    setSearching(true);
    setResults([]);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(search)}&format=json&limit=6&addressdetails=1`,
        { headers: { "Accept-Language": "en" } }
      );
      const data: NominatimResult[] = await res.json();
      setResults(data.sort((a, b) => b.importance - a.importance));
      setShowResults(true);
    } catch { /* fail silently */ }
    finally { setSearching(false); }
  };

  const selectResult = (r: NominatimResult) => {
    const lat = parseFloat(r.lat);
    const lng = parseFloat(r.lon);
    placeMarker(lat, lng);
    mapInst.current?.setView([lat, lng], 16);
    onChange(r.display_name, lat, lng);
    setSearch("");
    setResults([]);
    setShowResults(false);
  };

  /* ── use my current location ── */
  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    setGeoLoading(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords: c }) => {
        placeMarker(c.latitude, c.longitude, true);
        mapInst.current?.setView([c.latitude, c.longitude], 16);
        setGeoLoading(false);
      },
      () => setGeoLoading(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  /* ── clear marker ── */
  const clearLocation = () => {
    markerInst.current?.remove();
    markerInst.current = null;
    setCoords(null);
    onChange("", undefined, undefined);
  };

  /* ── copy coordinates ── */
  const copyCoords = async () => {
    if (!coords) return;
    await navigator.clipboard.writeText(`${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* ── custom zoom ── */
  const zoomIn  = () => mapInst.current?.zoomIn();
  const zoomOut = () => mapInst.current?.zoomOut();

  /* ── close results on outside click ── */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (resultsRef.current && !resultsRef.current.contains(e.target as Node) &&
          searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  /* ── keyboard: Esc closes results ── */
  const onSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") { setShowResults(false); setSearch(""); }
  };

  const mapHeight = fullscreen ? "h-[520px]" : "h-[340px]";

  return (
    <div className={`space-y-3 ${fullscreen ? "fixed inset-0 z-50 bg-white p-6 overflow-y-auto" : ""}`}>

      {/* ── Search bar ── */}
      <form onSubmit={handleSearch} className="relative flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            ref={searchRef}
            value={search}
            onChange={(e) => { setSearch(e.target.value); if (!e.target.value) { setResults([]); setShowResults(false); } }}
            onKeyDown={onSearchKeyDown}
            onFocus={() => results.length > 0 && setShowResults(true)}
            placeholder="Search for a location or address…"
            autoComplete="off"
            className="w-full pl-9 pr-9 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors placeholder:text-gray-400"
          />
          {search && (
            <button type="button"
              onClick={() => { setSearch(""); setResults([]); setShowResults(false); searchRef.current?.focus(); }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button type="submit" disabled={searching || !search.trim()}
          className="px-4 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-1.5 shrink-0">
          {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Search className="w-3.5 h-3.5" /><span>Search</span></>}
        </button>
      </form>

      {/* ── Search results dropdown ── */}
      {showResults && (
        <div ref={resultsRef} className="border border-gray-200 rounded-xl bg-white shadow-xl overflow-hidden -mt-1">
          {results.length > 0 ? results.map((r, i) => (
            <button key={i} type="button" onClick={() => selectResult(r)}
              className="w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0 group">
              <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-blue-200 transition-colors">
                <MapPin className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-gray-800 line-clamp-1 font-medium">
                  {r.display_name.split(",")[0]}
                </p>
                <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
                  {r.display_name.split(",").slice(1).join(",").trim()}
                </p>
              </div>
            </button>
          )) : !searching && (
            <div className="px-4 py-5 text-center text-sm text-gray-400">
              No results found for &ldquo;{search}&rdquo;
            </div>
          )}
        </div>
      )}

      {/* ── Map container ── */}
      <div className={`relative rounded-xl overflow-hidden border border-gray-200 transition-all ${mapHeight}`}>

        {/* Map canvas */}
        <div ref={mapRef} className="w-full h-full" />

        {/* Loading overlay while Leaflet boots */}
        {!mapReady && (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
          </div>
        )}

        {/* Top-left: tile toggle */}
        <div className="absolute top-3 left-3 flex rounded-lg overflow-hidden shadow border border-gray-200 z-[1000]">
          {(["street", "satellite"] as TileLayer[]).map((t) => (
            <button key={t} type="button" onClick={() => setTile(t)}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium transition-colors ${
                tile === t ? "bg-blue-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50"
              }`}>
              {t === "street" ? <Map className="w-3 h-3" /> : <Satellite className="w-3 h-3" />}
              {TILE_LAYERS[t].label}
            </button>
          ))}
        </div>

        {/* Top-right: hint + fullscreen */}
        <div className="absolute top-3 right-3 flex items-center gap-2 z-[1000]">
          {!coords && (
            <div className="bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-1.5 text-xs text-gray-500 shadow border border-gray-100 pointer-events-none">
              Click map or drag pin to set location
            </div>
          )}
          <button type="button" onClick={() => setFullscreen((f) => !f)}
            className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg shadow border border-gray-100 flex items-center justify-center text-gray-500 hover:text-gray-800 transition-colors">
            {fullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>

        {/* Right-side: zoom buttons */}
        <div className="absolute right-3 bottom-16 flex flex-col gap-1 z-[1000]">
          <button type="button" onClick={zoomIn}
            className="w-8 h-8 bg-white rounded-lg shadow border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors font-bold text-lg leading-none">
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-8 h-6 bg-white/80 rounded text-center text-[10px] text-gray-500 flex items-center justify-center border border-gray-200 font-mono">
            {zoom}
          </div>
          <button type="button" onClick={zoomOut}
            className="w-8 h-8 bg-white rounded-lg shadow border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition-colors">
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        {/* Bottom: Use my location + reverse geocoding toast */}
        <div className="absolute bottom-3 left-3 z-[1000] flex items-center gap-2">
          <button type="button" onClick={useMyLocation} disabled={geoLoading}
            className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm hover:bg-white border border-gray-200 text-gray-700 text-xs font-medium px-3 py-1.5 rounded-lg shadow transition-colors disabled:opacity-50">
            {geoLoading
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : <LocateFixed className="w-3.5 h-3.5 text-blue-500" />}
            Use my location
          </button>
          {coords && (
            <button type="button" onClick={clearLocation}
              className="flex items-center gap-1.5 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 text-xs font-medium px-3 py-1.5 rounded-lg shadow transition-colors">
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          )}
        </div>

        {/* Reverse geocoding toast */}
        {revLoading && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow border border-gray-100 text-xs text-gray-600 z-[1000] whitespace-nowrap">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" /> Getting address…
          </div>
        )}
      </div>

      {/* ── Coordinates bar ── */}
      {coords && (
        <div className="flex items-center gap-3 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg">
          <MapPin className="w-4 h-4 text-blue-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500">Coordinates</p>
            <p className="text-sm font-mono text-gray-800">
              {coords.lat.toFixed(6)}, {coords.lng.toFixed(6)}
            </p>
          </div>
          <button type="button" onClick={copyCoords}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800 transition-colors px-2 py-1 rounded-md hover:bg-gray-200">
            {copied ? <><Check className="w-3.5 h-3.5 text-green-500" /><span className="text-green-600">Copied</span></>
                    : <><Copy className="w-3.5 h-3.5" /><span>Copy</span></>}
          </button>
        </div>
      )}

      {/* ── Address textarea ── */}
      <div className="relative">
        <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Address will auto-fill when you pick a location, or type manually…"
          rows={2}
          className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg bg-white focus:outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-400 transition-colors placeholder:text-gray-400 resize-none"
        />
        {value && (
          <button type="button"
            onClick={() => { onChange("", undefined, undefined); }}
            className="absolute right-2.5 top-2.5 text-gray-300 hover:text-gray-500 transition-colors">
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

export default LocationPicker;
