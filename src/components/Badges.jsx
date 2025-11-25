export default function Badges({ badges }) {
  if (!badges || badges.length === 0) {
    return (
      <div className="text-center text-gray-400 text-sm py-2">
        No special badges yet — keep building 👷‍♂️💙
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((badge, index) => (
        <div
          key={index}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-white backdrop-blur-sm pop-in"
        >
          <span>{badge.icon}</span>
          <span>{badge.label}</span>
        </div>
      ))}
    </div>
  );
}

