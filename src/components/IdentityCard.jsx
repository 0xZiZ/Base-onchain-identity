import { useRef, useState } from 'react';
import { exportCard } from '../utils/exportCard';
import StatPill from './StatPill';
import Loader from './Loader';
import Badges from './Badges';
import Timeline from './Timeline';
import LevelDisplay from './LevelDisplay';
import QRCodeModal from './QRCodeModal';

export default function IdentityCard({ identityStats, tokenSummary, nftSummary, ens, baseName, tokens, nfts, rank, badges, timeline, xp, loading }) {
  const cardRef = useRef(null);
  const [expandedSections, setExpandedSections] = useState({
    timeline: false,
    tokens: false,
    nfts: false
  });
  const [showQRModal, setShowQRModal] = useState(false);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (loading) {
    return (
      <div className="rounded-2xl bg-white/5 backdrop-blur border border-white/10 shadow-xl max-h-[650px] flex items-center justify-center p-8 animate-pulse">
        <Loader />
      </div>
    );
  }

  if (!identityStats) {
    return (
      <div className="rounded-2xl bg-white/5 backdrop-blur border border-white/10 shadow-xl max-h-[650px] flex items-center justify-center p-8">
        <div className="text-center text-gray-400">
          Enter an address to generate an onchain identity card.
        </div>
      </div>
    );
  }

  const { 
    shortenedAddress, 
    firstTxDate, 
    txCount, 
    totalInEth, 
    totalOutEth, 
    totalGasEth, 
    activeDays, 
    builderScore,
    address 
  } = identityStats;

  const avatarText = address.slice(2, 4).toUpperCase();
  const baseScanUrl = `https://basescan.org/address/${address}`;

  // Generate tags based on stats
  const tags = [];
  if (txCount > 50) tags.push("Active");
  if (activeDays > 30) tags.push("Consistent");
  if (totalOutEth > 1) tags.push("DeFi User");
  if (tokenSummary?.tokenCount > 5) tags.push("Token Explorer");
  if (nftSummary?.nftCount > 0) tags.push("NFT Enjoyooor");

  const formatEth = (value) => {
    if (value === 0) return "0";
    if (value < 0.001) return "<0.001";
    return value.toFixed(3);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const downloadPng = async () => {
    if (!identityStats) return;

    try {
      const dataUrl = await exportCard({
        identityStats,
        ens,
        baseName,
        tokenSummary,
        nftSummary,
        rank,
        badges,
        xp
      });
      const link = document.createElement("a");
      const filename = `${identityStats.shortenedAddress.replace(/\.\.\./g, '-')}-identity.png`;
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error exporting card:", error);
      alert("Failed to export card. Please try again.");
    }
  };

  return (
    <>
      <div className="space-y-4">
        {/* Main Compact Identity Card */}
        <div 
          id="identity-card" 
          ref={cardRef} 
          className="rounded-2xl bg-white/5 backdrop-blur border border-white/10 shadow-xl transition-transform duration-300 hover:scale-[1.01] neon-border fade-in max-h-[650px] flex flex-col overflow-hidden"
        >
          {/* Scrollable content area */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Compact Header: Avatar, Level, Names, Address */}
            <div className="flex items-start gap-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold text-base flex-shrink-0 relative">
                {avatarText}
                {/* QR Code Icon */}
                <button
                  onClick={() => setShowQRModal(true)}
                  className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 hover:bg-blue-700 rounded-full flex items-center justify-center text-white text-xs transition-colors shadow-lg z-10"
                  title="Show QR Code"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                  </svg>
                </button>
              </div>
              <div className="flex-1 min-w-0">
                {/* Level Display - Compact */}
                {xp && (
                  <div className="mb-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-300">Level {xp.level}</span>
                      <span className="text-xs text-gray-400">·</span>
                      <span className="text-xs font-semibold text-blue-400">{xp.totalXP} XP</span>
                    </div>
                  </div>
                )}
                
                {/* ENS Name */}
                {ens && (
                  <h2 className="text-base font-bold text-white tracking-wide truncate mb-0.5">
                    {ens}
                  </h2>
                )}
                
                {/* Base Name */}
                {baseName && (
                  <h3 className="text-sm font-semibold text-blue-400 tracking-wide truncate mb-0.5">
                    {baseName}
                  </h3>
                )}
                
                {/* Address */}
                <p className="text-xs text-gray-400 truncate font-mono mb-0.5">{shortenedAddress}</p>
                <a
                  href={baseScanUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-blue-400 hover:text-blue-300 underline"
                >
                  View on BaseScan
                </a>
              </div>
            </div>

            {/* Key Stats Grid - Tight 3x2 grid */}
            <div className="grid grid-cols-3 gap-1.5 mb-2">
              <div className="pop-in">
                <StatPill label="Tx Count" value={txCount.toLocaleString()} />
              </div>
              <div className="pop-in">
                <StatPill label="Since" value={formatDate(firstTxDate)} />
              </div>
              <div className="pop-in">
                <StatPill label="Total In" value={formatEth(totalInEth)} />
              </div>
              <div className="pop-in">
                <StatPill label="Total Out" value={formatEth(totalOutEth)} />
              </div>
              <div className="pop-in">
                <StatPill label="Gas Used" value={formatEth(totalGasEth)} />
              </div>
              <div className="pop-in">
                <StatPill label="Active Days" value={activeDays} />
              </div>
            </div>

            {/* Token/NFT Summary - Compact */}
            <div className="grid grid-cols-2 gap-1.5 mb-2">
              <div className="pop-in">
                <StatPill label="Tokens" value={tokenSummary?.tokenCount || 0} subtle />
              </div>
              <div className="pop-in">
                <StatPill label="NFTs" value={nftSummary?.nftCount || 0} subtle />
              </div>
            </div>

            {/* Builder Score with animation */}
            <div className="mb-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-300">Builder Score</span>
                <span className="text-sm font-bold text-white">{builderScore}/100</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-1.5 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${builderScore}%` }}
                ></div>
              </div>
            </div>

            {/* Rank Badge with animation */}
            {rank && (
              <div className="mb-2 animate-fade-in">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-white/70">Rank</span>
                  <span
                    className="px-2 py-0.5 rounded-full text-xs font-semibold text-black transition-all duration-300"
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

            {/* Badges - Horizontal line */}
            {badges && badges.length > 0 && (
              <div className="mb-2">
                <Badges badges={badges} />
              </div>
            )}

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {tags.map((tag, index) => (
                  <span
                    key={index}
                    className="px-2 py-0.5 rounded-full bg-blue-900/60 text-xs text-blue-100 border border-blue-500/40"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Fixed Footer with Action Buttons */}
          <div className="border-t border-white/10 p-3 bg-white/5 flex-shrink-0">
            <div className="flex justify-center">
              <button
                onClick={downloadPng}
                className="px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 hover:shadow-[0_0_8px_#3b82f6] transition text-white text-xs font-medium shadow"
              >
                Download
              </button>
            </div>
          </div>
        </div>

        {/* Expandable Sections - OUTSIDE the main card */}
        <div className="space-y-3">
          {/* Timeline */}
          {timeline && timeline.length > 0 && (
            <div className="rounded-xl bg-white/5 backdrop-blur border border-white/10 p-4">
              <button
                onClick={() => toggleSection('timeline')}
                className="w-full flex items-center justify-between text-left text-sm font-medium text-blue-300 hover:text-blue-200 transition-colors"
              >
                <span>Activity Timeline</span>
                <span 
                  className={`text-lg transition-transform duration-200 ${expandedSections.timeline ? 'rotate-45' : ''}`}
                >
                  +
                </span>
              </button>
              {expandedSections.timeline && (
                <div className="mt-3">
                  <Timeline timeline={timeline} />
                </div>
              )}
            </div>
          )}

          {/* Token Balances */}
          {tokens && tokens.length > 0 && (
            <div className="rounded-xl bg-white/5 backdrop-blur border border-white/10 p-4">
              <button
                onClick={() => toggleSection('tokens')}
                className="w-full flex items-center justify-between text-left text-sm font-medium text-blue-300 hover:text-blue-200 transition-colors"
              >
                <span>Token Balances ({tokens.length})</span>
                <span 
                  className={`text-lg transition-transform duration-200 ${expandedSections.tokens ? 'rotate-45' : ''}`}
                >
                  +
                </span>
              </button>
              {expandedSections.tokens && (
                <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
                  {tokens.map((t, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-white/5 border border-white/10 p-2 rounded-lg text-xs">
                      {t.logo ? (
                        <img src={t.logo} alt={t.name || t.symbol} className="w-6 h-6 rounded-full" />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-blue-700/40 flex items-center justify-center text-white text-xs">
                          {t.symbol ? t.symbol[0] : "?"}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold truncate text-white">{t.name || "Unknown Token"}</div>
                        <div className="text-gray-300 text-xs truncate">{t.symbol}</div>
                      </div>
                      <div className="text-right">
                        <span className="font-semibold text-xs text-white">{t.balance.toFixed(4)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* NFTs */}
          {nfts && nfts.length > 0 && (
            <div className="rounded-xl bg-white/5 backdrop-blur border border-white/10 p-4">
              <button
                onClick={() => toggleSection('nfts')}
                className="w-full flex items-center justify-between text-left text-sm font-medium text-blue-300 hover:text-blue-200 transition-colors"
              >
                <span>NFTs ({nfts.length})</span>
                <span 
                  className={`text-lg transition-transform duration-200 ${expandedSections.nfts ? 'rotate-45' : ''}`}
                >
                  +
                </span>
              </button>
              {expandedSections.nfts && (
                <div className="mt-3">
                  <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                    {nfts.slice(0, 9).map((n, idx) => (
                      <div key={idx} className="bg-white/5 border border-white/10 p-1.5 rounded-lg">
                        {n.image ? (
                          <img 
                            src={n.image} 
                            alt={n.name}
                            className="w-full h-16 object-cover rounded mb-1"
                          />
                        ) : (
                          <div className="w-full h-16 bg-blue-700/40 rounded mb-1 flex items-center justify-center text-white text-xs">
                            NFT
                          </div>
                        )}
                        <p className="text-xs font-semibold truncate text-white">{n.name}</p>
                        <p className="text-xs text-gray-300 truncate">{n.collection}</p>
                      </div>
                    ))}
                  </div>
                  {nfts.length > 9 && (
                    <p className="text-gray-400 text-xs mt-2 text-center">
                      + {nfts.length - 9} more NFTs
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* QR Code Modal */}
      <QRCodeModal
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
        address={address}
        baseScanUrl={baseScanUrl}
      />
    </>
  );
}
