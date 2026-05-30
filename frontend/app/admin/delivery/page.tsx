"use client";

import React, { useState } from "react";
import { 
  IoAddOutline, 
  IoTrashOutline, 
  IoPencilOutline,
  IoSaveOutline,
  IoCloseOutline
} from "react-icons/io5";

type DeliveryZone = {
  id: number;
  zone_name: string;
  postcode_prefixes: string;
};

type DeliveryRate = {
  id: number;
  zone_id: number;
  pallet_type: string;
  price: number;
};

// Mock Initial Data
const initialZones: DeliveryZone[] = [
  { id: 1, zone_name: "Zone 1 (Local)", postcode_prefixes: "RG, SL, SN" },
  { id: 2, zone_name: "Zone 2 (London)", postcode_prefixes: "E, EC, N, NW, SE, SW, W, WC" },
];

const initialRates: DeliveryRate[] = [
  { id: 1, zone_id: 1, pallet_type: "QUARTER", price: 45.0 },
  { id: 2, zone_id: 1, pallet_type: "HALF", price: 55.0 },
  { id: 3, zone_id: 1, pallet_type: "FULL", price: 65.0 },
  { id: 4, zone_id: 2, pallet_type: "FULL", price: 85.0 },
];

export default function AdminDeliveryPage() {
  const [activeTab, setActiveTab] = useState<"zones" | "rates">("zones");
  
  // Zones State
  const [zones, setZones] = useState<DeliveryZone[]>(initialZones);
  const [editingZoneId, setEditingZoneId] = useState<number | null>(null);
  const [editZoneForm, setEditZoneForm] = useState<Partial<DeliveryZone>>({});
  const [isAddingZone, setIsAddingZone] = useState(false);

  // Rates State
  const [rates, setRates] = useState<DeliveryRate[]>(initialRates);
  const [editingRateId, setEditingRateId] = useState<number | null>(null);
  const [editRateForm, setEditRateForm] = useState<Partial<DeliveryRate>>({});
  const [isAddingRate, setIsAddingRate] = useState(false);

  // --- ZONE HANDLERS ---
  const handleEditZone = (zone: DeliveryZone) => {
    setEditingZoneId(zone.id);
    setEditZoneForm(zone);
    setIsAddingZone(false);
  };

  const handleSaveZone = () => {
    if (isAddingZone) {
      const newZone = {
        id: Date.now(),
        zone_name: editZoneForm.zone_name || "",
        postcode_prefixes: editZoneForm.postcode_prefixes || ""
      };
      setZones([...zones, newZone]);
      setIsAddingZone(false);
    } else {
      setZones(zones.map(z => z.id === editingZoneId ? { ...z, ...editZoneForm } : z));
      setEditingZoneId(null);
    }
    setEditZoneForm({});
  };

  const handleDeleteZone = (id: number) => {
    if (confirm("Are you sure you want to delete this zone? It will delete associated rates too.")) {
      setZones(zones.filter(z => z.id !== id));
      setRates(rates.filter(r => r.zone_id !== id));
    }
  };

  // --- RATE HANDLERS ---
  const handleEditRate = (rate: DeliveryRate) => {
    setEditingRateId(rate.id);
    setEditRateForm(rate);
    setIsAddingRate(false);
  };

  const handleSaveRate = () => {
    if (isAddingRate) {
      const newRate = {
        id: Date.now(),
        zone_id: Number(editRateForm.zone_id),
        pallet_type: editRateForm.pallet_type || "FULL",
        price: Number(editRateForm.price) || 0
      };
      setRates([...rates, newRate]);
      setIsAddingRate(false);
    } else {
      setRates(rates.map(r => r.id === editingRateId ? { ...r, ...editRateForm } : r));
      setEditingRateId(null);
    }
    setEditRateForm({});
  };

  const handleDeleteRate = (id: number) => {
    if (confirm("Are you sure you want to delete this rate?")) {
      setRates(rates.filter(r => r.id !== id));
    }
  };

  const palletTypes = ["PARCEL", "QUARTER", "HALF", "FULL LIGHT", "FULL"];

  return (
    <div className="min-h-screen bg-white p-8 md:p-12">
      {/* Header */}
      <div className="mb-12">
        <h1 className="text-3xl font-serif text-[#4a2c2a] mb-2">Delivery Management</h1>
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-300">
          Configure Zones, Postcodes & Pallet Rates
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-100 mb-8">
        <button
          onClick={() => setActiveTab("zones")}
          className={`pb-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all ${
            activeTab === "zones" 
              ? "text-[#4a2c2a] border-b-2 border-[#4a2c2a]" 
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Delivery Zones
        </button>
        <button
          onClick={() => setActiveTab("rates")}
          className={`pb-4 text-[11px] font-black uppercase tracking-[0.2em] transition-all ${
            activeTab === "rates" 
              ? "text-[#4a2c2a] border-b-2 border-[#4a2c2a]" 
              : "text-gray-400 hover:text-gray-600"
          }`}
        >
          Delivery Rates
        </button>
      </div>

      {/* ZONES TAB */}
      {activeTab === "zones" && (
        <div className="animate-fadeIn">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Geographic Zones</h2>
            <button
              onClick={() => {
                setIsAddingZone(true);
                setEditingZoneId(null);
                setEditZoneForm({});
              }}
              className="flex items-center gap-2 bg-[#4a2c2a] text-white px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.1em] hover:bg-black transition-all shadow-md rounded-sm"
            >
              <IoAddOutline size={16} />
              Add Zone
            </button>
          </div>

          <div className="overflow-x-auto bg-gray-50/30 border border-gray-100 rounded-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">
                  <th className="p-4">Zone Name</th>
                  <th className="p-4">Postcode Prefixes (Comma Separated)</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isAddingZone && (
                  <tr className="bg-white border-b border-gray-100">
                    <td className="p-4">
                      <input
                        type="text"
                        placeholder="e.g. Zone 1"
                        value={editZoneForm.zone_name || ""}
                        onChange={e => setEditZoneForm({...editZoneForm, zone_name: e.target.value})}
                        className="w-full border border-gray-200 p-2 text-xs outline-none focus:border-[#4a2c2a]"
                      />
                    </td>
                    <td className="p-4">
                      <input
                        type="text"
                        placeholder="e.g. RG, SL, SN"
                        value={editZoneForm.postcode_prefixes || ""}
                        onChange={e => setEditZoneForm({...editZoneForm, postcode_prefixes: e.target.value})}
                        className="w-full border border-gray-200 p-2 text-xs outline-none focus:border-[#4a2c2a]"
                      />
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button onClick={handleSaveZone} className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-sm">
                        <IoSaveOutline size={16} />
                      </button>
                      <button onClick={() => setIsAddingZone(false)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-sm">
                        <IoCloseOutline size={16} />
                      </button>
                    </td>
                  </tr>
                )}
                
                {zones.map(zone => (
                  <tr key={zone.id} className="border-b border-gray-100 hover:bg-white transition-all group">
                    <td className="p-4">
                      {editingZoneId === zone.id ? (
                        <input
                          type="text"
                          value={editZoneForm.zone_name || ""}
                          onChange={e => setEditZoneForm({...editZoneForm, zone_name: e.target.value})}
                          className="w-full border border-gray-200 p-2 text-xs outline-none focus:border-[#4a2c2a]"
                        />
                      ) : (
                        <span className="font-bold text-gray-800 text-sm">{zone.zone_name}</span>
                      )}
                    </td>
                    <td className="p-4">
                      {editingZoneId === zone.id ? (
                        <input
                          type="text"
                          value={editZoneForm.postcode_prefixes || ""}
                          onChange={e => setEditZoneForm({...editZoneForm, postcode_prefixes: e.target.value})}
                          className="w-full border border-gray-200 p-2 text-xs outline-none focus:border-[#4a2c2a]"
                        />
                      ) : (
                        <span className="text-xs text-gray-500 font-mono tracking-tight">{zone.postcode_prefixes}</span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      {editingZoneId === zone.id ? (
                        <div className="flex justify-end gap-2">
                          <button onClick={handleSaveZone} className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-sm">
                            <IoSaveOutline size={16} />
                          </button>
                          <button onClick={() => setEditingZoneId(null)} className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-sm">
                            <IoCloseOutline size={16} />
                          </button>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleEditZone(zone)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-sm">
                            <IoPencilOutline size={16} />
                          </button>
                          <button onClick={() => handleDeleteZone(zone.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-sm">
                            <IoTrashOutline size={16} />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
                
                {!isAddingZone && zones.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-gray-400 text-sm italic">
                      No delivery zones configured yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RATES TAB */}
      {activeTab === "rates" && (
        <div className="animate-fadeIn">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Pallet Rates by Zone</h2>
            <button
              onClick={() => {
                if (zones.length === 0) {
                  alert("Please create a Zone first before adding rates.");
                  return;
                }
                setIsAddingRate(true);
                setEditingRateId(null);
                setEditRateForm({ zone_id: zones[0].id, pallet_type: palletTypes[0] });
              }}
              className="flex items-center gap-2 bg-[#4a2c2a] text-white px-6 py-2.5 text-[10px] font-black uppercase tracking-[0.1em] hover:bg-black transition-all shadow-md rounded-sm"
            >
              <IoAddOutline size={16} />
              Add Rate
            </button>
          </div>

          <div className="overflow-x-auto bg-gray-50/30 border border-gray-100 rounded-sm">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 text-[9px] font-black uppercase tracking-[0.2em] text-gray-400">
                  <th className="p-4">Target Zone</th>
                  <th className="p-4">Pallet Size/Type</th>
                  <th className="p-4">Price (£)</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isAddingRate && (
                  <tr className="bg-white border-b border-gray-100">
                    <td className="p-4">
                      <select
                        value={editRateForm.zone_id || zones[0]?.id}
                        onChange={e => setEditRateForm({...editRateForm, zone_id: Number(e.target.value)})}
                        className="w-full border border-gray-200 p-2 text-xs outline-none focus:border-[#4a2c2a]"
                      >
                        {zones.map(z => (
                          <option key={z.id} value={z.id}>{z.zone_name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4">
                      <select
                        value={editRateForm.pallet_type || palletTypes[0]}
                        onChange={e => setEditRateForm({...editRateForm, pallet_type: e.target.value})}
                        className="w-full border border-gray-200 p-2 text-xs outline-none focus:border-[#4a2c2a]"
                      >
                        {palletTypes.map(pt => (
                          <option key={pt} value={pt}>{pt}</option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4">
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">£</span>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={editRateForm.price || ""}
                          onChange={e => setEditRateForm({...editRateForm, price: parseFloat(e.target.value)})}
                          className="w-full pl-7 pr-3 py-2 border border-gray-200 text-xs outline-none focus:border-[#4a2c2a]"
                        />
                      </div>
                    </td>
                    <td className="p-4 text-right flex justify-end gap-2">
                      <button onClick={handleSaveRate} className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-sm">
                        <IoSaveOutline size={16} />
                      </button>
                      <button onClick={() => setIsAddingRate(false)} className="p-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-sm">
                        <IoCloseOutline size={16} />
                      </button>
                    </td>
                  </tr>
                )}
                
                {rates.map(rate => {
                  const zone = zones.find(z => z.id === rate.zone_id);
                  return (
                    <tr key={rate.id} className="border-b border-gray-100 hover:bg-white transition-all group">
                      <td className="p-4">
                        {editingRateId === rate.id ? (
                          <select
                            value={editRateForm.zone_id || rate.zone_id}
                            onChange={e => setEditRateForm({...editRateForm, zone_id: Number(e.target.value)})}
                            className="w-full border border-gray-200 p-2 text-xs outline-none focus:border-[#4a2c2a]"
                          >
                            {zones.map(z => (
                              <option key={z.id} value={z.id}>{z.zone_name}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="font-bold text-gray-800 text-sm">{zone ? zone.zone_name : "Unknown Zone"}</span>
                        )}
                      </td>
                      <td className="p-4">
                        {editingRateId === rate.id ? (
                          <select
                            value={editRateForm.pallet_type || rate.pallet_type}
                            onChange={e => setEditRateForm({...editRateForm, pallet_type: e.target.value})}
                            className="w-full border border-gray-200 p-2 text-xs outline-none focus:border-[#4a2c2a]"
                          >
                            {palletTypes.map(pt => (
                              <option key={pt} value={pt}>{pt}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 bg-blue-50 px-2 py-1 rounded-sm">
                            {rate.pallet_type}
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        {editingRateId === rate.id ? (
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs">£</span>
                            <input
                              type="number"
                              step="0.01"
                              value={editRateForm.price || ""}
                              onChange={e => setEditRateForm({...editRateForm, price: parseFloat(e.target.value)})}
                              className="w-full pl-7 pr-3 py-2 border border-gray-200 text-xs outline-none focus:border-[#4a2c2a]"
                            />
                          </div>
                        ) : (
                          <span className="font-black text-[#4a2c2a]">£ {rate.price.toFixed(2)}</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        {editingRateId === rate.id ? (
                          <div className="flex justify-end gap-2">
                            <button onClick={handleSaveRate} className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-sm">
                              <IoSaveOutline size={16} />
                            </button>
                            <button onClick={() => setEditingRateId(null)} className="p-2 bg-gray-100 text-gray-600 hover:bg-gray-200 rounded-sm">
                              <IoCloseOutline size={16} />
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => handleEditRate(rate)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-sm">
                              <IoPencilOutline size={16} />
                            </button>
                            <button onClick={() => handleDeleteRate(rate.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-sm">
                              <IoTrashOutline size={16} />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
                
                {!isAddingRate && rates.length === 0 && (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-400 text-sm italic">
                      No rates configured yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
