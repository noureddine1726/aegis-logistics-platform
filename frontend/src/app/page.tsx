"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const AlgiersMap = dynamic(() => import("./AlgiersMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[380px] w-full rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 text-sm">
      Loading Interactive Algiers Map...
    </div>
  ),
});

interface Organization {
  id: string;
  name: string;
  type: string;
}

interface Resource {
  id: string;
  name: string;
  quantity: number;
  type: string;
  lat: number;
  lng: number;
  organizationId: string;
  updatedAt: string;
  organization?: Organization;
}

const CATEGORIES = ["ALL", "MEDICAL", "FOOD", "SHELTER", "FUEL", "RESCUE"];
const LOW_STOCK_THRESHOLD = 30;

export default function AegisDashboard() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Filter & Search states
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedOrgFilter, setSelectedOrgFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // Form states for Resource
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState(50);
  const [type, setType] = useState("MEDICAL");
  const [lat, setLat] = useState(36.7538);
  const [lng, setLng] = useState(3.0588);
  const [organizationId, setOrganizationId] = useState("");

  // Form states for Organization
  const [orgName, setOrgName] = useState("");
  const [orgType, setOrgType] = useState("NGO");

  const API_BASE = "http://localhost:3000";

  const fetchData = async () => {
    try {
      const [invRes, orgRes] = await Promise.all([
        fetch(`${API_BASE}/inventory`),
        fetch(`${API_BASE}/organization`),
      ]);

      if (!invRes.ok || !orgRes.ok) {
        throw new Error("Could not fetch from NestJS backend on port 3000");
      }

      const invData: Resource[] = await invRes.json();
      const orgData: Organization[] = await orgRes.json();

      setResources(invData);
      setOrganizations(orgData);
      if (orgData.length > 0) {
        setOrganizationId((prev) => prev || orgData[0].id);
      }
      setError("");
    } catch {
      setError(
        "Backend connection error: Make sure NestJS is running on http://localhost:3000 and app.enableCors() is saved in main.ts."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchData();
  }, []);

  const handleCreateOrganization = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) return;

    await fetch(`${API_BASE}/organization`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: orgName, type: orgType }),
    });

    setOrgName("");
    void fetchData();
  };

  const handleCreateResource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !organizationId) return;

    await fetch(`${API_BASE}/inventory`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        quantity: Number(quantity),
        type,
        lat: Number(lat),
        lng: Number(lng),
        organizationId,
      }),
    });

    setName("");
    setQuantity(50);
    void fetchData();
  };

  const handleUpdateQuantity = async (id: string, newQty: number) => {
    if (newQty < 0) return;
    await fetch(`${API_BASE}/inventory/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity: newQty }),
    });
    void fetchData();
  };

  const handleDeleteResource = async (id: string) => {
    await fetch(`${API_BASE}/inventory/${id}`, {
      method: "DELETE",
    });
    void fetchData();
  };

  // Filtered resources for both Map and Inventory list
  const filteredResources = resources.filter((item) => {
    const matchesCategory =
      selectedCategory === "ALL" || item.type === selectedCategory;
    const matchesOrg =
      selectedOrgFilter === "ALL" || item.organizationId === selectedOrgFilter;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.organization?.name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesOrg && matchesSearch;
  });

  const lowStockCount = resources.filter(
    (r) => r.quantity < LOW_STOCK_THRESHOLD
  ).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-10 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-3 w-3 rounded-full bg-emerald-400 animate-pulse" />
              <h1 className="text-3xl font-bold tracking-tight text-white">
                AEGIS COMMAND CENTER
              </h1>
            </div>
            <p className="text-slate-400 text-sm mt-1">
              Live Inventory & Emergency Logistics • Connected to NestJS + PostgreSQL (Port 3000)
            </p>
          </div>
          <button
            onClick={() => void fetchData()}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-sm font-medium transition border border-slate-700"
          >
            ↻ Refresh Data
          </button>
        </header>

        {error && (
          <div className="p-4 bg-red-950/60 border border-red-700 rounded-xl text-red-200 text-sm">
            {error}
          </div>
        )}

        {/* Stats Row (4 Cards including Critical Low Stock) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl">
            <p className="text-xs uppercase tracking-wider text-slate-400">
              Total Resource Batches
            </p>
            <p className="text-3xl font-bold text-white mt-2">
              {resources.length}
            </p>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl">
            <p className="text-xs uppercase tracking-wider text-slate-400">
              Total Units in Stock
            </p>
            <p className="text-3xl font-bold text-emerald-400 mt-2">
              {resources.reduce((sum, r) => sum + r.quantity, 0)}
            </p>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 p-5 rounded-xl">
            <p className="text-xs uppercase tracking-wider text-slate-400">
              Active Organizations
            </p>
            <p className="text-3xl font-bold text-sky-400 mt-2">
              {organizations.length}
            </p>
          </div>
          <div
            className={`p-5 rounded-xl border ${
              lowStockCount > 0
                ? "bg-red-950/40 border-red-700/80"
                : "bg-slate-900/90 border-slate-800"
            }`}
          >
            <p className="text-xs uppercase tracking-wider text-slate-400">
              Critical Low Stock (&lt;{LOW_STOCK_THRESHOLD})
            </p>
            <p
              className={`text-3xl font-bold mt-2 ${
                lowStockCount > 0
                  ? "text-red-400 animate-pulse"
                  : "text-slate-400"
              }`}
            >
              {lowStockCount}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Forms */}
          <div className="space-y-6">
            <form
              onSubmit={handleCreateResource}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4"
            >
              <h2 className="text-lg font-semibold text-white">
                + Deploy New Resource
              </h2>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Resource Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Water Purification Tablets"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Quantity
                  </label>
                  <input
                    type="number"
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Category Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white"
                  >
                    <option value="MEDICAL">MEDICAL</option>
                    <option value="FOOD">FOOD</option>
                    <option value="SHELTER">SHELTER</option>
                    <option value="FUEL">FUEL</option>
                    <option value="RESCUE">RESCUE</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Latitude (Algiers)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={lat}
                    onChange={(e) => setLat(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">
                    Longitude (Algiers)
                  </label>
                  <input
                    type="number"
                    step="0.0001"
                    value={lng}
                    onChange={(e) => setLng(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Assigned Organization
                </label>
                <select
                  value={organizationId}
                  onChange={(e) => setOrganizationId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white"
                >
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name} ({org.type})
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-sm transition"
              >
                Add to Inventory (POST /inventory)
              </button>
            </form>

            <form
              onSubmit={handleCreateOrganization}
              className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4"
            >
              <h2 className="text-lg font-semibold text-white">
                + Register Organization
              </h2>
              <div>
                <label className="block text-xs text-slate-400 mb-1">
                  Organization Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Civil Protection Algiers"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Type</label>
                <select
                  value={orgType}
                  onChange={(e) => setOrgType(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white"
                >
                  <option value="NGO">NGO</option>
                  <option value="GOVERNMENT">GOVERNMENT</option>
                  <option value="HOSPITAL">HOSPITAL</option>
                  <option value="LOGISTICS">LOGISTICS</option>
                </select>
              </div>
              <button
                type="submit"
                className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white font-medium rounded-lg text-sm transition"
              >
                Create Organization (POST /organization)
              </button>
            </form>
          </div>

          {/* Right Column: Filter Bar + Map + Live Inventory */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
            {/* Search & Category Filter Controls */}
            <div className="space-y-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="text"
                  placeholder="Search by resource or organization name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white"
                />
                <select
                  value={selectedOrgFilter}
                  onChange={(e) => setSelectedOrgFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white"
                >
                  <option value="ALL">All Organizations</option>
                  {organizations.map((org) => (
                    <option key={org.id} value={org.id}>
                      {org.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-wrap gap-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
                      selectedCategory === cat
                        ? "bg-emerald-600 text-white"
                        : "bg-slate-900 text-slate-400 hover:bg-slate-800 border border-slate-800"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Interactive Map */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-lg font-semibold text-white">
                  Algiers Tactical Map (Blue = Normal, Red = Low Stock &lt;30)
                </h2>
                <span className="text-xs text-slate-400">
                  Selected: {lat.toFixed(4)}° N, {lng.toFixed(4)}° E
                </span>
              </div>
              <AlgiersMap
                resources={filteredResources}
                onSelectCoords={(newLat, newLng) => {
                  setLat(newLat);
                  setLng(newLng);
                }}
              />
            </div>

            {/* Inventory List */}
            <div>
              <h2 className="text-lg font-semibold text-white mb-4">
                Filtered PostgreSQL Inventory ({filteredResources.length} of{" "}
                {resources.length})
              </h2>

              {loading ? (
                <p className="text-slate-400 text-sm">
                  Loading inventory from port 3000...
                </p>
              ) : filteredResources.length === 0 ? (
                <p className="text-slate-400 text-sm">
                  No resources match the current filter.
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredResources.map((item) => {
                    const isLow = item.quantity < LOW_STOCK_THRESHOLD;
                    return (
                      <div
                        key={item.id}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-950 border transition ${
                          isLow
                            ? "border-red-600/80 bg-red-950/10"
                            : "border-slate-800/80 hover:border-slate-700"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              {item.type}
                            </span>
                            {isLow && (
                              <span className="px-2.5 py-0.5 text-xs font-bold rounded-full bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse">
                                ⚠ CRITICAL LOW STOCK
                              </span>
                            )}
                            <h3 className="font-semibold text-white text-base">
                              {item.name}
                            </h3>
                          </div>
                          <p className="text-xs text-slate-400">
                            Org:{" "}
                            <span className="text-sky-400 font-medium">
                              {item.organization?.name || item.organizationId}
                            </span>{" "}
                            • Coords: {item.lat.toFixed(4)},{" "}
                            {item.lng.toFixed(4)}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono">
                            UUID: {item.id}
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              void handleUpdateQuantity(
                                item.id,
                                item.quantity - 10
                              )
                            }
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs font-semibold"
                          >
                            -10
                          </button>
                          <span
                            className={`min-w-[60px] text-center font-bold text-lg ${
                              isLow ? "text-red-400" : "text-emerald-400"
                            }`}
                          >
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              void handleUpdateQuantity(
                                item.id,
                                item.quantity + 10
                              )
                            }
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 rounded text-xs font-semibold"
                          >
                            +10
                          </button>
                          <button
                            onClick={() => void handleDeleteResource(item.id)}
                            className="ml-2 px-3 py-1 bg-red-950/70 hover:bg-red-900 text-red-300 border border-red-800/60 rounded text-xs font-medium"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}