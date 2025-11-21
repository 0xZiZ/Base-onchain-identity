import axios from 'axios';

/**
 * Uploads image to a free image hosting service
 * @param {string} dataUrl - Base64 data URL of the image
 * @returns {Promise<string>} Public URL of the uploaded image
 */
async function uploadImage(dataUrl) {
  try {
    // Convert data URL to blob
    const blob = await fetch(dataUrl).then(r => r.blob());
    
    // Try Pinata first if API key exists
    const pinataKey = import.meta.env.VITE_PINATA_API_KEY;
    const pinataSecret = import.meta.env.VITE_PINATA_SECRET_KEY;
    
    if (pinataKey && pinataSecret) {
      try {
        const formData = new FormData();
        formData.append('file', blob, 'identity-card.png');
        
        const pinataResponse = await axios.post(
          'https://api.pinata.cloud/pinning/pinFileToIPFS',
          formData,
          {
            headers: {
              'pinata_api_key': pinataKey,
              'pinata_secret_api_key': pinataSecret,
            },
            maxContentLength: Infinity,
            maxBodyLength: Infinity,
          }
        );
        
        if (pinataResponse.data && pinataResponse.data.IpfsHash) {
          return `https://gateway.pinata.cloud/ipfs/${pinataResponse.data.IpfsHash}`;
        }
      } catch (e) {
        console.warn('Pinata upload failed, trying imgbb:', e);
      }
    }
    
    // Fallback to imgbb.com (free, no auth required)
    const formData = new FormData();
    formData.append("image", blob);
    
    const response = await fetch(
      "https://api.imgbb.com/1/upload?key=3ff81b10eb4dc7a5d63fb0ccb3fbbf1c",
      {
        method: "POST",
        body: formData
      }
    );
    
    const result = await response.json();
    
    if (result.success && result.data && result.data.url) {
      return result.data.url;
    }
    
    throw new Error("Image upload failed");
  } catch (error) {
    console.error("Image upload error:", error);
    throw new Error("Failed to upload image. Please try again.");
  }
}

/**
 * Shows a toast notification
 */
function showToast(message, type = 'success') {
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `fixed top-20 right-4 z-50 px-4 py-3 rounded-lg shadow-lg transition-all duration-300 ${
    type === 'success' 
      ? 'bg-green-600 text-white' 
      : 'bg-red-600 text-white'
  }`;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  // Remove after 3 seconds
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => {
      if (toast.parentNode) {
        document.body.removeChild(toast);
      }
    }, 300);
  }, 3000);
}

/**
 * Shares card on Farcaster using Neynar API
 * @param {string} imageUrl - URL of the uploaded image
 * @returns {Promise<void>}
 */
export async function shareOnFarcaster(imageUrl) {
  try {
    const neynarKey = import.meta.env.VITE_NEYNAR_API_KEY;
    
    if (!neynarKey) {
      // Fallback to Warpcast compose URL (works without API key)
      const message = "My Base Onchain Identity Card 🔵\n\nGenerated with Base Identity";
      const shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(message)}&embeds[]=${encodeURIComponent(imageUrl)}`;
      window.open(shareUrl, "_blank");
      showToast('Opening Warpcast...', 'success');
      return;
    }

    // If Neynar API key is provided, use it to publish cast
    // Note: Full implementation requires user signer authentication
    // For now, use Warpcast compose URL
    const message = "My Base Onchain Identity Card 🔵\n\nGenerated with Base Identity";
    const shareUrl = `https://warpcast.com/~/compose?text=${encodeURIComponent(message)}&embeds[]=${encodeURIComponent(imageUrl)}`;
    
    window.open(shareUrl, "_blank");
    showToast('Opening Farcaster...', 'success');
  } catch (error) {
    console.error("Error sharing on Farcaster:", error);
    showToast('Failed to share on Farcaster', 'error');
    throw error;
  }
}

/**
 * Shares card on X (Twitter)
 * @param {string} imageUrl - URL of the uploaded image
 * @returns {Promise<void>}
 */
export async function shareOnX(imageUrl) {
  try {
    const tweetText = "My Base Onchain Identity Card 🔵\n\nGenerated with Base Identity";
    // Use x.com instead of twitter.com
    const tweetUrl = `https://x.com/intent/tweet?text=${encodeURIComponent(tweetText)}&url=${encodeURIComponent(imageUrl)}`;
    
    window.open(tweetUrl, "_blank");
    showToast('Opening X...', 'success');
  } catch (error) {
    console.error("Error sharing on X:", error);
    showToast('Failed to share on X', 'error');
    throw error;
  }
}

/**
 * Captures card element and uploads image, then shares
 * @param {HTMLElement} cardElement - The card element to capture
 * @param {Function} shareFunction - Function to call with image URL
 * @returns {Promise<void>}
 */
export async function captureAndShare(cardElement, shareFunction) {
  try {
    // Use html2canvas for better quality
    const html2canvas = (await import('html2canvas')).default;
    
    const canvas = await html2canvas(cardElement, {
      scale: 2,
      backgroundColor: '#0f172a', // Match app background
      logging: false,
      useCORS: true,
      allowTaint: true
    });
    
    const dataUrl = canvas.toDataURL("image/png");
    const imageUrl = await uploadImage(dataUrl);
    
    await shareFunction(imageUrl);
  } catch (error) {
    console.error("Error in capture and share:", error);
    throw error;
  }
}
