'use client';

import Image from 'next/image';

interface TypeOption {
  label: string;
  value: string;
  image: string;
}

export default function CustomBuildTypeSelector({
  options,
  selected,
  onSelect,
}: {
  options: TypeOption[];
  selected: string;
  onSelect: (value: string) => void;
}) {
  const colsClass = options.length >= 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3';

  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 ${colsClass} gap-4`}>
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onSelect(option.value)}
          className={`relative h-56 rounded overflow-hidden text-left transition-all ${
            selected === option.value ? 'ring-4 ring-[#9E2016]' : ''
          }`}
        >
          <Image src={option.image} alt={option.label} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
          <span className="absolute bottom-4 left-4 text-white font-serif text-lg font-semibold leading-tight">
            {option.label}
          </span>
        </button>
      ))}
    </div>
  );
}