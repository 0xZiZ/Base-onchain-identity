import axios from 'axios';
import { lookupNames } from './nameLookups';

const API_KEY = import.meta.env.VITE_ETHERSCAN_API_KEY;
const BASE_URL = 'https://api.etherscan.io/v2/api';

// Simple wait helper to pause between requests (helps with rate limits)
const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to make API calls with retries and exponential backoff
async function fetchWithRetry(url, retries = 5, baseDelay = 200) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await axios.get(url, {
        timeout: 15000,
        validateStatus: (status) => status === 200
      });
      
      if (response.data && response.data.status === "1" && response.data.result) {
        return response.data;
      }

      // If status is not "1", it might be an error response
      if (response.data && response.data.status === "0") {
        const errorMsg = response.data.message || "API returned error status";
        // Don't retry on certain errors (like invalid API key)
        if (errorMsg.includes("Invalid API Key")) {
          throw new Error(errorMsg);
        }
        // If the API returns NOTOK or a message like "No transactions found",
        // don't throw here — let the caller decide how to handle empty results.
        // Retry on rate limit or temporary errors
        if (i < retries - 1) {
          const delay = baseDelay * Math.pow(2, i) + Math.random() * 100; // Exponential backoff with jitter
          await new Promise(r => setTimeout(r, delay));
          continue;
        }
        // Return the response data so caller can interpret status/message
        return response.data;
      }
    } catch (err) {
      // Handle network errors or timeouts
      if (i === retries - 1) {
        throw new Error(err.message || "API request failed after retries");
      }
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, i) + Math.random() * 100;
      await new Promise(r => setTimeout(r, delay));
    }
  }
  throw new Error("API request failed after retries");
}

// Get transactions for an address
async function getTransactions(address) {
  if (!API_KEY) {
    throw new Error("VITE_ETHERSCAN_API_KEY is not set in environment variables");
  }
  
  const url = `${BASE_URL}?chainId=8453&module=account&action=txlist&address=${address}&page=1&offset=500&sort=asc&apikey=${API_KEY}`;
  const data = await fetchWithRetry(url);
  return Array.isArray(data?.result) ? data.result : [];
}

// Get token transfers for an address (to count tokens)
async function getTokenTransfers(address) {
  if (!API_KEY) {
    return [];
  }
  
  try {
    const url = `${BASE_URL}?chainId=8453&module=account&action=tokentx&address=${address}&page=1&offset=1000&sort=asc&apikey=${API_KEY}`;
    const data = await fetchWithRetry(url);
    return Array.isArray(data?.result) ? data.result : [];
  } catch (err) {
    console.warn("Failed to fetch token transfers:", err.message);
    return [];
  }
}

// Get NFT transfers for an address (to count NFTs)
async function getNFTTransfers(address) {
  if (!API_KEY) {
    return [];
  }
  
  try {
    const url = `${BASE_URL}?chainId=8453&module=account&action=tokennfttx&address=${address}&page=1&offset=1000&sort=asc&apikey=${API_KEY}`;
    const data = await fetchWithRetry(url);
    return Array.isArray(data?.result) ? data.result : [];
  } catch (err) {
    console.warn("Failed to fetch NFT transfers:", err.message);
    return [];
  }
}

// Calculate active days from transactions
function calculateActiveDays(transactions) {
  if (!transactions || transactions.length === 0) return 0;
  
  const dates = new Set();
  transactions.forEach(tx => {
    if (tx.timeStamp) {
      const date = new Date(parseInt(tx.timeStamp) * 1000);
      dates.add(date.toDateString());
    }
  });
  
  return dates.size;
}

// Calculate builder score (0-100) based on various metrics
function calculateBuilderScore(txCount, activeDays, totalOutEth, tokenCount, nftCount) {
  let score = 0;
  
  // Transaction count (max 30 points)
  score += Math.min(30, (txCount / 100) * 30);
  
  // Active days (max 25 points)
  score += Math.min(25, (activeDays / 365) * 25);
  
  // Activity level (max 20 points)
  if (totalOutEth > 10) score += 20;
  else if (totalOutEth > 1) score += 15;
  else if (totalOutEth > 0.1) score += 10;
  else if (totalOutEth > 0) score += 5;
  
  // Token diversity (max 15 points)
  score += Math.min(15, (tokenCount / 20) * 15);
  
  // NFT ownership (max 10 points)
  if (nftCount > 10) score += 10;
  else if (nftCount > 5) score += 7;
  else if (nftCount > 0) score += 5;
  
  return Math.round(Math.min(100, score));
}

// Calculate rank based on builder score
function calculateRank(builderScore) {
  if (builderScore >= 90) {
    return { color: "gold", label: "Legend", tier: "S" };
  } else if (builderScore >= 75) {
    return { color: "purple", label: "Master", tier: "A" };
  } else if (builderScore >= 60) {
    return { color: "blue", label: "Expert", tier: "B" };
  } else if (builderScore >= 40) {
    return { color: "green", label: "Builder", tier: "C" };
  } else {
    return { color: "gray", label: "Explorer", tier: "D" };
  }
}

// Calculate XP based on activity
function calculateXP(txCount, activeDays, totalOutEth) {
  let totalXP = 0;
  
  // Base XP from transactions
  totalXP += txCount * 10;
  
  // Bonus for active days
  totalXP += activeDays * 50;
  
  // Bonus for volume
  totalXP += Math.floor(totalOutEth * 100);
  
  // Calculate level (every 1000 XP = 1 level)
  const level = Math.floor(totalXP / 1000) + 1;
  const currentLevelXP = (level - 1) * 1000;
  const nextLevelXP = level * 1000;
  
  return {
    totalXP,
    level,
    currentLevelXP,
    nextLevelXP
  };
}

// Generate badges based on activity
function generateBadges(txCount, activeDays, totalOutEth, tokenCount, nftCount) {
  const badges = [];
  
  if (txCount > 100) badges.push({ icon: "🔥", label: "Power User" });
  if (activeDays > 180) badges.push({ icon: "⏰", label: "Long-term Builder" });
  if (totalOutEth > 10) badges.push({ icon: "💎", label: "High Volume" });
  if (tokenCount > 10) badges.push({ icon: "🪙", label: "Token Collector" });
  if (nftCount > 5) badges.push({ icon: "🎨", label: "NFT Enthusiast" });
  if (txCount > 50 && activeDays > 30) badges.push({ icon: "⭐", label: "Active Builder" });
  
  return badges;
}

// Generate timeline from transactions
function generateTimeline(transactions) {
  if (!transactions || transactions.length === 0) return [];
  
  const timeline = [];
  const firstTx = transactions[0];
  const lastTx = transactions[transactions.length - 1];
  
  if (firstTx) {
    timeline.push({
      icon: "🚀",
      label: "First Transaction",
      date: new Date(parseInt(firstTx.timeStamp) * 1000).toISOString()
    });
  }
  
  if (lastTx && lastTx !== firstTx) {
    timeline.push({
      icon: "⚡",
      label: "Latest Transaction",
      date: new Date(parseInt(lastTx.timeStamp) * 1000).toISOString()
    });
  }
  
  return timeline;
}

// Format address to shortened version
function shortenAddress(address) {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Main function to get identity data
export async function getIdentityData(address) {
  try {
    // Validate address
    if (!address || !address.startsWith('0x') || address.length !== 42) {
      return { ok: false, reason: "INVALID_ADDRESS" };
    }
    
    // Check API key
    if (!API_KEY) {
      return { ok: false, reason: "API_KEY_MISSING" };
    }
    
    // Fetch sequentially with a small pause to reduce rate-limit errors
    const transactions = await getTransactions(address);
    const tokenTransfers = await getTokenTransfers(address);
    await wait(150);
    const nftTransfers = await getNFTTransfers(address);

    // Always work with an array to avoid `.filter is not a function` when API returns unexpected shapes
    const safeTransactions = Array.isArray(transactions) ? transactions : [];
    
    // If no transactions were returned, return a default identity object
    if (!safeTransactions || safeTransactions.length === 0) {
      const identityStats = {
        txCount: 0,
        firstTxDate: null,
        totalInEth: 0,
        totalOutEth: 0,
        totalGasEth: 0,
        activeDays: 0,
        builderScore: 0,
        noActivity: true,
        address,
        shortenedAddress: shortenAddress(address)
      };

      const tokenCount = (tokenTransfers || []).length ? new Set((tokenTransfers || []).map(t => t.contractAddress?.toLowerCase())).size : 0;
      const nftCount = (nftTransfers || []).length ? new Set((nftTransfers || []).map(t => t.contractAddress?.toLowerCase())).size : 0;

      const tokenSummary = { tokenCount };
      const nftSummary = { nftCount };

      const formattedTokens = [];
      const formattedNFTs = [];

      // Lookup ENS and Base Name (non-blocking)
      let ens = null;
      let baseName = null;
      try {
        const names = await lookupNames(address);
        ens = names.ens;
        baseName = names.baseName;
      } catch (error) {
        console.warn('Name lookup failed:', error);
      }

      return {
        ok: true,
        identityStats,
        tokenSummary,
        nftSummary,
        tokens: formattedTokens,
        nfts: formattedNFTs,
        rank: calculateRank(0),
        badges: [],
        timeline: [],
        xp: calculateXP(0, 0, 0),
        ens,
        baseName,
        message: "Sorry, it seems you don't have any transactions on Base!"
      };
    }
    
    // Calculate transaction stats
    const firstTx = safeTransactions[0];
    const lastTx = safeTransactions[safeTransactions.length - 1];
    const txCount = safeTransactions.length;

    const totalIn = safeTransactions
      .filter(tx => tx.to?.toLowerCase() === address.toLowerCase())
      .reduce((sum, tx) => sum + Number(tx.value || 0) / 1e18, 0);

    const totalOut = safeTransactions
      .filter(tx => tx.from?.toLowerCase() === address.toLowerCase())
      .reduce((sum, tx) => sum + Number(tx.value || 0) / 1e18, 0);

    const totalGas = safeTransactions
      .reduce((sum, tx) => sum + Number(tx.gasUsed || 0) * Number(tx.gasPrice || 0) / 1e18, 0);

    const activeDays = calculateActiveDays(safeTransactions);
    const firstTxDate = firstTx.timeStamp 
      ? new Date(parseInt(firstTx.timeStamp) * 1000).toISOString()
      : null;
    
    // Calculate token and NFT counts from transfers
    const uniqueTokens = new Set();
    const uniqueNFTs = new Set();
    
    (tokenTransfers || []).forEach(tx => {
      if (tx.contractAddress) {
        uniqueTokens.add(tx.contractAddress.toLowerCase());
      }
    });
    
    (nftTransfers || []).forEach(tx => {
      if (tx.contractAddress) {
        uniqueNFTs.add(tx.contractAddress.toLowerCase());
      }
    });
    
    const tokenCount = uniqueTokens.size;
    const nftCount = uniqueNFTs.size;
    
    const builderScore = calculateBuilderScore(txCount, activeDays, totalOut, tokenCount, nftCount);
    const rank = calculateRank(builderScore);
    const xp = calculateXP(txCount, activeDays, totalOut);
    const badges = generateBadges(txCount, activeDays, totalOut, tokenCount, nftCount);
    const timeline = generateTimeline(safeTransactions);
    
    // Format tokens for display (simplified - using transfer data)
    const formattedTokens = Array.from(uniqueTokens).slice(0, 10).map((contractAddress, idx) => {
      // Find a transfer for this token to get symbol/name
      const tokenTx = (tokenTransfers || []).find(tx => tx.contractAddress?.toLowerCase() === contractAddress);
      return {
        name: tokenTx?.tokenName || "Unknown Token",
        symbol: tokenTx?.tokenSymbol || "?",
        balance: 0, // Balance calculation would require additional API calls
        logo: null
      };
    });
    
    // Format NFTs for display (simplified - using transfer data)
    const formattedNFTs = Array.from(uniqueNFTs).slice(0, 9).map((contractAddress, idx) => {
      // Find a transfer for this NFT to get name
      const nftTx = (nftTransfers || []).find(tx => tx.contractAddress?.toLowerCase() === contractAddress);
      return {
        name: nftTx?.tokenName || `NFT #${nftTx?.tokenID || idx}`,
        collection: nftTx?.tokenName || "Unknown Collection",
        image: null // Image would require additional API calls
      };
    });
    
    // Build identity stats
    const identityStats = {
      address,
      shortenedAddress: shortenAddress(address),
      firstTxDate,
      txCount,
      totalInEth: totalIn,
      totalOutEth: totalOut,
      totalGasEth: totalGas,
      activeDays,
      builderScore
    };
    
    // Build summary objects
    const tokenSummary = {
      tokenCount
    };
    
    const nftSummary = {
      nftCount
    };
    
    // Lookup ENS and Base Name (non-blocking, don't fail if lookup fails)
    let ens = null;
    let baseName = null;
    try {
      const names = await lookupNames(address);
      ens = names.ens;
      baseName = names.baseName;
    } catch (error) {
      console.warn('Name lookup failed:', error);
      // Continue without names
    }
    
    // Return success response
    return {
      ok: true,
      identityStats,
      tokenSummary,
      nftSummary,
      tokens: formattedTokens,
      nfts: formattedNFTs,
      rank,
      badges,
      timeline,
      xp,
      ens,
      baseName
    };
    
  } catch (error) {
    console.error("Error fetching identity data:", error);
    
    // Return error response
    if (error.message?.includes("API_KEY")) {
      return { ok: false, reason: "API_KEY_MISSING" };
    }
    // Previously returned NO_TRANSACTIONS for empty results — now handled above
    if (error.message?.includes("INVALID_ADDRESS")) {
      return { ok: false, reason: "INVALID_ADDRESS" };
    }
    
    return { ok: false, reason: error.message || "UNKNOWN_ERROR" };
  }
}
