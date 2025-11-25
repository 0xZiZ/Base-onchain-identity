export default function LevelDisplay({ xp }) {
  if (!xp) return null;

  const { totalXP, level, currentLevelXP, nextLevelXP } = xp;
  
  // Calculate progress percentage for current level
  const levelRange = nextLevelXP - currentLevelXP;
  const progressInLevel = totalXP - currentLevelXP;
  const progressPercent = levelRange > 0 
    ? Math.min(100, (progressInLevel / levelRange) * 100) 
    : 100;

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-300">Level {level}</span>
          <span className="text-xs text-gray-400">·</span>
          <span className="text-sm font-semibold text-blue-400">{totalXP} XP</span>
        </div>
        {nextLevelXP > currentLevelXP && (
          <span className="text-xs text-gray-400">
            {nextLevelXP - totalXP} XP to Level {level + 1}
          </span>
        )}
      </div>
      <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 rounded-full transition-all duration-500"
          style={{ width: `${progressPercent}%` }}
        ></div>
      </div>
    </div>
  );
}

