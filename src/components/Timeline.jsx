export default function Timeline({ timeline }) {
  if (!timeline || timeline.length === 0) {
    return null;
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-full">
      <div className="space-y-2">
        {timeline.map((item, index) => (
          <div
            key={index}
            className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg p-2 pop-in"
          >
            <span className="text-lg flex-shrink-0">{item.icon}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-white">{item.label}</div>
              <div className="text-xs text-gray-400">{formatDate(item.date)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

