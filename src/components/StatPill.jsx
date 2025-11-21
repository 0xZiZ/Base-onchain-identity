export default function StatPill({ label, value, subtle = false }) {
  return (
    <div className={`rounded-md bg-white/5 border border-white/10 p-2 ${subtle ? 'opacity-70' : ''}`}>
      <div className="text-xs text-gray-400 mb-0.5 leading-tight">{label}</div>
      <div className={`text-sm font-bold ${subtle ? 'text-gray-300' : 'text-white'} leading-tight`}>
        {value}
      </div>
    </div>
  );
}

