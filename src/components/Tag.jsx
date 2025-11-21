export default function Tag({ label }) {
  return (
    <span className="inline-flex items-center rounded-full px-3 py-1 text-xs bg-blue-500/20 border border-blue-400/40 text-blue-300">
      {label}
    </span>
  );
}

