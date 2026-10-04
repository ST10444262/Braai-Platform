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
    if (!l || !w || !h || l<= 0 || w <= 0 || h <= 0) return;
    
    //calculating the volume. timesing by 10 to round it and then dividing by 10 to clean up the floating decimals to 1 decimal point
    const calculatedVolume = Math.round((l * w * h) * 10) / 10;

    //ratio for calculation provided by owner: 1 kW per 20 m cubed

    const CUBIC_METERS_PER_KW = 20; 

    //Calculating the raw required kW
    const rawKw = calculatedVolume / CUBIC_METERS_PER_KW;

    // normal fireplace ratings
    const standardSizes = [5, 7, 9, 12, 15, 18, 20];

    // Select the smallest standard unit that meets or exceeds the raw kW required
    const targetKw = standardSizes.find((size) => size >= rawKw) || standardSizes[standardSizes.length - 1];

    // Calculate maximum room volume capacity for the selected unit
    const maxVolume = targetKw * CUBIC_METERS_PER_KW;

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