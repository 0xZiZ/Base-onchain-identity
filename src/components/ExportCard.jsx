/**
 * Premium Export Card Component
 * This is a separate component specifically for PNG export
 * It's hidden from view but used for generating the export
 */

export default function ExportCard({ identityStats, ens, baseName, tokenSummary, nftSummary, rank, badges, xp }) {
  if (!identityStats) return null;

  const {
    shortenedAddress,
    firstTxDate,
    txCount,
    totalInEth,
    totalGasEth,
    activeDays,
    builderScore,
    address
  } = identityStats;

  const avatarText = address.slice(2, 4).toUpperCase();
  const baseScanUrl = `https://basescan.org/address/${address}`;

  const formatEth = (value) => {
    if (value === 0) return "0";
    if (value < 0.001) return "<0.001";
    return value.toFixed(3);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const level = xp?.level || 1;

  return (
    <div 
      id="export-card"
      className="w-[900px] h-[600px] flex flex-col items-center justify-center p-12"
      style={{
        background: 'linear-gradient(135deg, #001A3A 0%, #042C54 100%)',
        borderRadius: '28px',
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Header Section */}
      <div className="flex flex-col items-center mb-8">
        {/* Avatar and Level */}
        <div className="flex items-center gap-4 mb-4">
          <div 
            className="w-20 h-20 rounded-full flex items-center justify-center text-white font-bold text-2xl"
            style={{
              background: 'linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)'
            }}
          >
            {avatarText}
          </div>
          <div className="text-center">
            <div className="text-white text-sm font-medium mb-1">Level {level}</div>
            {xp && (
              <div className="text-blue-300 text-xs">{xp.totalXP} XP</div>
            )}
          </div>
        </div>

        {/* ENS Name */}
        {ens && (
          <div className="text-white text-2xl font-bold mb-2">{ens}</div>
        )}

        {/* Base Name */}
        {baseName && (
          <div className="text-blue-400 text-xl font-semibold mb-2">{baseName}</div>
        )}

        {/* Address */}
        <div className="text-white text-lg font-mono">{shortenedAddress}</div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-5 gap-4 mb-6 w-full max-w-[800px]">
        <div className="text-center">
          <div className="text-blue-300 text-xs mb-1">Tx Count</div>
          <div className="text-white text-lg font-bold">{txCount.toLocaleString()}</div>
        </div>
        <div className="text-center">
          <div className="text-blue-300 text-xs mb-1">Since</div>
          <div className="text-white text-sm font-semibold">{formatDate(firstTxDate)}</div>
        </div>
        <div className="text-center">
          <div className="text-blue-300 text-xs mb-1">Total In</div>
          <div className="text-white text-lg font-bold">{formatEth(totalInEth)}</div>
        </div>
        <div className="text-center">
          <div className="text-blue-300 text-xs mb-1">Gas Used</div>
          <div className="text-white text-lg font-bold">{formatEth(totalGasEth)}</div>
        </div>
        <div className="text-center">
          <div className="text-blue-300 text-xs mb-1">Active Days</div>
          <div className="text-white text-lg font-bold">{activeDays}</div>
        </div>
      </div>

      {/* Token/NFT Counts */}
      <div className="flex gap-6 mb-6">
        <div className="text-center">
          <div className="text-blue-300 text-xs mb-1">Tokens</div>
          <div className="text-white text-xl font-bold">{tokenSummary?.tokenCount || 0}</div>
        </div>
        <div className="text-center">
          <div className="text-blue-300 text-xs mb-1">NFTs</div>
          <div className="text-white text-xl font-bold">{nftSummary?.nftCount || 0}</div>
        </div>
      </div>

      {/* Builder Score */}
      <div className="w-full max-w-[600px] mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-blue-300 text-sm font-medium">Builder Score</span>
          <span className="text-white text-xl font-bold">{builderScore}/100</span>
        </div>
        <div 
          className="w-full rounded-full h-3"
          style={{ backgroundColor: 'rgba(255, 255, 255, 0.1)' }}
        >
          <div
            className="h-3 rounded-full transition-all duration-1000"
            style={{
              width: `${builderScore}%`,
              background: 'linear-gradient(90deg, #3b82f6 0%, #06b6d4 100%)'
            }}
          ></div>
        </div>
      </div>

      {/* Rank Badge */}
      {rank && (
        <div className="mb-4">
          <div className="flex items-center gap-2">
            <span className="text-blue-300 text-sm">Rank</span>
            <span
              className="px-4 py-2 rounded-full text-sm font-bold text-black"
              style={{
                backgroundColor:
                  rank.color === "gold" ? "#facc15" :
                  rank.color === "purple" ? "#a855f7" :
                  rank.color === "blue" ? "#3b82f6" :
                  rank.color === "green" ? "#22c55e" :
                  "#6b7280"
              }}
            >
              {rank.label} · {rank.tier}
            </span>
          </div>
        </div>
      )}

      {/* Badges */}
      {badges && badges.length > 0 && (
        <div className="flex flex-wrap gap-2 justify-center max-w-[700px]">
          {badges.map((badge, index) => (
            <div
              key={index}
              className="px-3 py-1 rounded-full text-xs font-medium text-white"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              {badge.icon} {badge.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


