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
    <div className="border rounded p-5 mb-6" style={{ backgroundColor: '#faf6ee', borderColor: '#9E2016' }}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div>
          <label className="block text-xs uppercase mb-1 font-semibold" style={{ color: '#9E2016' }}>Length (m)</label>
          <input type="number" value={length} onChange={(e) => setLength(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm bg-white" style={{ borderColor: '#9E2016', color: '#9E2016' }} />
        </div>
        <div>
          <label className="block text-xs uppercase mb-1 font-semibold" style={{ color: '#9E2016' }}>Width (m)</label>
          <input type="number" value={width} onChange={(e) => setWidth(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm bg-white" style={{ borderColor: '#9E2016', color: '#9E2016' }} />
        </div>
        <div>
          <label className="block text-xs uppercase mb-1 font-semibold" style={{ color: '#9E2016' }}>Height (m)</label>
          <input type="number" value={height} onChange={(e) => setHeight(e.target.value)}
            className="w-full border rounded px-3 py-2 text-sm bg-white" style={{ borderColor: '#9E2016', color: '#9E2016' }} />
        </div>
      </div>

      <button onClick={handleCalculate}
        className="text-xs font-bold uppercase px-5 py-2 rounded transition-opacity hover:opacity-90"
        style={{ backgroundColor: '#9E2016', color: '#faf6ee' }}>
        Calculate
      </button>

      {result && (
        <div className="mt-5 space-y-3">
          <div className="bg-white border rounded px-4 py-3 text-sm" style={{ borderColor: '#9E2016' }}>
            <p className="mb-1" style={{ color: '#9E2016' }}>
              Room volume: <strong style={{ color: '#9E2016' }}>{result.volume} m³</strong>
            </p>
            <p style={{ color: '#9E2016' }}>
              Best fit for your space: <strong style={{ color: '#9E2016' }}>{result.kw} kW— {result.kw}kW/{result.maxVolume}m³</strong>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}