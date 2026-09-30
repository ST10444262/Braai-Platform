export default function InfoBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-stone-200 bg-white rounded p-4">
      <p className="text-xs uppercase text-stone-500 mb-1">{label}</p>
      <p className="font-semibold text-stone-800">{value}</p>
    </div>
  );
}