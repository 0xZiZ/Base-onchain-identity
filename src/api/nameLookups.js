import { ethers } from 'ethers';

// ENS Registry and Resolver addresses
const ENS_REGISTRY = '0x00000000000C2E074eC69A0dFb2997BA6C7d2e1e';
const ENS_RESOLVER_ABI = [
  'function resolver(bytes32 node) external view returns (address)',
  'function name(bytes32 node) external view returns (string)'
];
const RESOLVER_ABI = [
  'function name(bytes32 node) external view returns (string)'
];

// Ethereum mainnet provider for ENS
const ETH_PROVIDER = new ethers.JsonRpcProvider('https://eth.llamarpc.com');

/**
 * Reverse ENS lookup - get ENS name from address using ethers.js
 * @param {string} address - Ethereum/Base address
 * @returns {Promise<string|null>} ENS name or null
 */
export async function lookupENS(address) {
  try {
    // Normalize address
    const normalizedAddress = ethers.getAddress(address);
    
    // Create reverse node (namehash of addr.reverse)
    const reverseNode = ethers.namehash(`${normalizedAddress.slice(2).toLowerCase()}.addr.reverse`);
    
    // Get resolver for reverse node
    const registry = new ethers.Contract(ENS_REGISTRY, ENS_RESOLVER_ABI, ETH_PROVIDER);
    const resolverAddress = await registry.resolver(reverseNode);
    
    if (!resolverAddress || resolverAddress === ethers.ZeroAddress) {
      return null;
    }
    
    // Get name from resolver
    const resolver = new ethers.Contract(resolverAddress, RESOLVER_ABI, ETH_PROVIDER);
    const name = await resolver.name(reverseNode);
    
    // Validate the name resolves back to the address
    if (name && name !== '') {
      try {
        const resolvedAddress = await ETH_PROVIDER.resolveName(name);
        if (resolvedAddress?.toLowerCase() === normalizedAddress.toLowerCase()) {
          return name;
        }
      } catch (e) {
        // Name doesn't resolve, return null
        return null;
      }
    }
    
    return null;
  } catch (error) {
    console.warn('ENS lookup failed:', error.message);
    return null;
  }
}

/**
 * Base Name lookup - get Base name from address
 * @param {string} address - Base address
 * @returns {Promise<string|null>} Base name or null
 */
export async function lookupBaseName(address) {
  try {
    // Try NameSYS API first
    try {
      const response = await fetch(
        `https://api.namesys.xyz/v1/reverse/${address}`,
        {
          method: 'GET',
          headers: { 'Accept': 'application/json' },
          signal: AbortSignal.timeout(5000)
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.name) {
          return data.name;
        }
      }
    } catch (e) {
      // Continue to next method
    }
    
    // Try BaseScan API (if available)
    try {
      const apiKey = import.meta.env.VITE_ETHERSCAN_API_KEY;
      if (apiKey) {
        const response = await fetch(
          `https://api.basescan.org/api?module=proxy&action=eth_call&to=0x4fF865A4c2F4748FEA927174dBF4A116D8080c55&data=0x691f3431000000000000000000000000${address.slice(2)}&tag=latest&apikey=${apiKey}`,
          {
            signal: AbortSignal.timeout(5000)
          }
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data && data.result && data.result !== '0x') {
            // Decode the result if needed
            // For now, return null as BaseScan API structure may vary
          }
        }
      }
    } catch (e) {
      // Continue
    }
    
    return null;
  } catch (error) {
    console.warn('Base Name lookup failed:', error.message);
    return null;
  }
}

/**
 * Lookup both ENS and Base Name
 * @param {string} address - Address to lookup
 * @returns {Promise<{ens: string|null, baseName: string|null}>}
 */
export async function lookupNames(address) {
  try {
    const [ens, baseName] = await Promise.all([
      lookupENS(address),
      lookupBaseName(address)
    ]);
    
    return { ens, baseName };
  } catch (error) {
    console.warn('Name lookup failed:', error);
    return { ens: null, baseName: null };
  }
}
