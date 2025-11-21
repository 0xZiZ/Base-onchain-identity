import * as htmlToImage from 'html-to-image';

/**
 * Exports the identity card as a high-quality PNG
 * Uses a separate export card component rendered off-screen
 * @param {Object} data - Identity data to export
 * @returns {Promise<string>} Data URL of the exported image
 */
export async function exportCard(data) {
  // Create a temporary container off-screen
  const container = document.createElement('div');
  container.id = 'temp-export-container';
  container.style.position = 'fixed';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.style.width = '900px';
  container.style.height = '600px';
  container.style.overflow = 'hidden';
  container.style.backgroundColor = '#001A3A'; // Dark background
  document.body.appendChild(container);

  try {
    // Create the export card HTML structure
    const {
      identityStats,
      ens,
      baseName,
      tokenSummary,
      nftSummary,
      rank,
      badges,
      xp
    } = data;

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
    const level = xp?.level || 1;

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

    // Build the HTML - isolated container with no overflow or borders
    container.innerHTML = `
      <div id="export-card" style="
        width: 900px;
        height: 600px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        padding: 48px;
        background: linear-gradient(135deg, #001A3A 0%, #042C54 100%);
        border-radius: 28px;
        font-family: system-ui, -apple-system, sans-serif;
        color: white;
        overflow: hidden;
        box-sizing: border-box;
        margin: 0;
      ">
        <!-- Header Section -->
        <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 32px;">
          <!-- Avatar and Level -->
          <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px;">
            <div style="
              width: 80px;
              height: 80px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
              background: linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%);
              color: white;
              font-weight: bold;
              font-size: 24px;
            ">${avatarText}</div>
            <div style="text-align: center;">
              <div style="color: white; font-size: 14px; font-weight: 500; margin-bottom: 4px;">Level ${level}</div>
              ${xp ? `<div style="color: #60a5fa; font-size: 12px;">${xp.totalXP} XP</div>` : ''}
            </div>
          </div>

          ${ens ? `<div style="color: white; font-size: 24px; font-weight: bold; margin-bottom: 8px;">${ens}</div>` : ''}
          ${baseName ? `<div style="color: #60a5fa; font-size: 20px; font-weight: 600; margin-bottom: 8px;">${baseName}</div>` : ''}
          <div style="color: white; font-size: 18px; font-family: monospace;">${shortenedAddress}</div>
        </div>

        <!-- Stats Grid -->
        <div style="
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 16px;
          margin-bottom: 24px;
          width: 100%;
          max-width: 800px;
        ">
          <div style="text-align: center;">
            <div style="color: #60a5fa; font-size: 12px; margin-bottom: 4px;">Tx Count</div>
            <div style="color: white; font-size: 18px; font-weight: bold;">${txCount.toLocaleString()}</div>
          </div>
          <div style="text-align: center;">
            <div style="color: #60a5fa; font-size: 12px; margin-bottom: 4px;">Since</div>
            <div style="color: white; font-size: 14px; font-weight: 600;">${formatDate(firstTxDate)}</div>
          </div>
          <div style="text-align: center;">
            <div style="color: #60a5fa; font-size: 12px; margin-bottom: 4px;">Total In</div>
            <div style="color: white; font-size: 18px; font-weight: bold;">${formatEth(totalInEth)}</div>
          </div>
          <div style="text-align: center;">
            <div style="color: #60a5fa; font-size: 12px; margin-bottom: 4px;">Gas Used</div>
            <div style="color: white; font-size: 18px; font-weight: bold;">${formatEth(totalGasEth)}</div>
          </div>
          <div style="text-align: center;">
            <div style="color: #60a5fa; font-size: 12px; margin-bottom: 4px;">Active Days</div>
            <div style="color: white; font-size: 18px; font-weight: bold;">${activeDays}</div>
          </div>
        </div>

        <!-- Token/NFT Counts -->
        <div style="display: flex; gap: 24px; margin-bottom: 24px;">
          <div style="text-align: center;">
            <div style="color: #60a5fa; font-size: 12px; margin-bottom: 4px;">Tokens</div>
            <div style="color: white; font-size: 20px; font-weight: bold;">${tokenSummary?.tokenCount || 0}</div>
          </div>
          <div style="text-align: center;">
            <div style="color: #60a5fa; font-size: 12px; margin-bottom: 4px;">NFTs</div>
            <div style="color: white; font-size: 20px; font-weight: bold;">${nftSummary?.nftCount || 0}</div>
          </div>
        </div>

        <!-- Builder Score -->
        <div style="width: 100%; max-width: 600px; margin-bottom: 24px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
            <span style="color: #60a5fa; font-size: 14px; font-weight: 500;">Builder Score</span>
            <span style="color: white; font-size: 20px; font-weight: bold;">${builderScore}/100</span>
          </div>
          <div style="width: 100%; height: 12px; border-radius: 9999px; background-color: rgba(255, 255, 255, 0.1);">
            <div style="
              height: 12px;
              border-radius: 9999px;
              width: ${builderScore}%;
              background: linear-gradient(90deg, #3b82f6 0%, #06b6d4 100%);
            "></div>
          </div>
        </div>

        ${rank ? `
        <!-- Rank Badge -->
        <div style="margin-bottom: 16px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="color: rgba(255, 255, 255, 0.7); font-size: 14px;">Rank</span>
            <span style="
              padding: 4px 16px;
              border-radius: 9999px;
              font-size: 14px;
              font-weight: bold;
              color: black;
              background-color: ${
                rank.color === "gold" ? "#facc15" :
                rank.color === "purple" ? "#a855f7" :
                rank.color === "blue" ? "#3b82f6" :
                rank.color === "green" ? "#22c55e" :
                "#6b7280"
              };
            ">${rank.label} · ${rank.tier}</span>
          </div>
        </div>
        ` : ''}

        ${badges && badges.length > 0 ? `
        <!-- Badges -->
        <div style="display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; max-width: 700px;">
          ${badges.map(badge => `
            <div style="
              padding: 4px 12px;
              border-radius: 9999px;
              font-size: 12px;
              font-weight: 500;
              color: white;
              background-color: rgba(255, 255, 255, 0.1);
              border: 1px solid rgba(255, 255, 255, 0.2);
            ">${badge.icon} ${badge.label}</div>
          `).join('')}
        </div>
        ` : ''}
      </div>
    `;

    // Wait for rendering
    await new Promise(resolve => setTimeout(resolve, 150));

    // Find the export-card element
    const exportElement = document.getElementById('export-card');
    if (!exportElement) {
      throw new Error('Export card element not found');
    }

    // Export with high quality settings
    const dataUrl = await htmlToImage.toPng(exportElement, {
      pixelRatio: 2, // 2x resolution for crisp quality
      backgroundColor: '#001A3A', // Base gradient start color
      quality: 1.0,
      cacheBust: true,
      style: {
        transform: 'scale(1)',
        transformOrigin: 'top left'
      },
      filter: (node) => {
        // Exclude any unwanted elements
        return !node.classList?.contains('no-export');
      }
    });

    // Cleanup
    document.body.removeChild(container);

    return dataUrl;
  } catch (error) {
    // Cleanup on error
    if (container.parentNode) {
      document.body.removeChild(container);
    }
    
    throw error;
  }
}
