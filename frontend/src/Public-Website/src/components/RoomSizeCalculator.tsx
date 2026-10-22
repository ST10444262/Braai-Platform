'use client';

import { useState } from 'react';

export default function RoomSizeCalculator() {
  const [length, setLength] = useState('');
  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [result, setResult] = useState<{ volume: number; kw: number; maxVolume: number } | null>(null);

  function handleCalculate() {
    //converting the string inputs from the text fields into numbers
    const l = Number(length);
    const w = Number(width);
    const h = Number(height);
    //if any field is left empty then stop
    if (!l || !w || !h ) return;
    
   // Calculate volume in m cubed
  const calculatedVolume = Math.round((l * w * h) * 10) / 10;

  // Calculate raw kW requirement 1 kW for every 30 m cubed. formula provided by owner
  const rawKw = calculatedVolume / 30;

  // Rounding up to the nearest fireplace rating 5, 7, 9, 12, 15 kW
  const targetKw = rawKw <= 5 ? 5 : rawKw <= 7 ? 7 : rawKw <= 9 ? 9 : rawKw <= 12 ? 12 : 15;

  // Calculate maximum volume capacity for the target unit 30 m³ per kW
  const maxVolume = targetKw * 30;

    setResult({ volume: calculatedVolume, kw: targetKw, maxVolume });
  }

  return (
    <div className="border border-brand-red bg-brand-sand rounded p-5 mb-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div>
          <label htmlFor="roomLength" className="block text-xs uppercase mb-1 font-semibold text-brand-red">Length (m)</label>
          <input id = "roomLength" type="number" value={length} onChange={(e) => setLength(e.target.value)}
            className="w-full border border-brand-red text-brand-red rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-brand-red" />
        </div>
        <div>
          <label htmlFor="roomWidth" className="block text-xs uppercase mb-1 font-semibold text-brand-red">Width (m)</label>
          <input id="roomWidth" type="number" value={width} onChange={(e) => setWidth(e.target.value)}
            className="w-full border border-brand-red text-brand-red rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-brand-red" />
        </div>
        <div>
          <label htmlFor="roomHeight" className="block text-xs uppercase mb-1 font-semibold text-brand-red">Height (m)</label>
          <input id="roomHeight" type="number" value={height} onChange={(e) => setHeight(e.target.value)}
            className="w-full border border-brand-red text-brand-red rounded px-3 py-2 text-sm bg-white focus:outline-none focus:ring-1 focus:ring-brand-red" />
        </div>
      </div>

      <button onClick={handleCalculate}
        className="bg-brand-red text-brand-sand text-xs font-bold uppercase px-5 py-2 rounded transition-opacity hover:opacity-90">
        Calculate
      </button>

      {result && (
        <div role="status" aria-live="polite" className="mt-5 space-y-3">
          <div className="bg-white border border-brand-red rounded px-4 py-3 text-sm">
            <p className="mb-1 text-brand-red">
              Room volume: <strong className="text-brand-red">{result.volume} m³</strong>
            </p>
            <p className="text-brand-red">
              Best fit for your space: <strong className="text-brand-red">{result.kw} kW— {result.kw}kW/{result.maxVolume}m³</strong>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}