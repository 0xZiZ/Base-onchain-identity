import { useState } from 'react';
import AddressInput from './components/AddressInput';
import IdentityCard from './components/IdentityCard';
import { getIdentityData } from "./api/baseIdentityApi";

function App() {
  const [wallet, setWallet] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [identityData, setIdentityData] = useState(null);

  const handleSubmit = async () => {
    // Validate address format
    if (!wallet.startsWith('0x') || wallet.length !== 42) {
      setError('Invalid address format');
      setIdentityData(null);
      return;
    }

    setError(null);
    setLoading(true);
    setIdentityData(null);

    try {
      const response = await getIdentityData(wallet);
      
      if (response.ok) {
        // Extract data from response (remove 'ok' property)
        const { ok, ...data } = response;
        setIdentityData(data);
        setError(null);
      } else {
        // Handle error response
        const errorMessages = {
          'INVALID_ADDRESS': 'Invalid address format',
          'NO_TRANSACTIONS': 'No transactions found for this address',
          'API_KEY_MISSING': 'API key is missing. Please set VITE_ETHERSCAN_API_KEY in your .env file',
          'UNKNOWN_ERROR': 'Failed to fetch identity data',
        };
        setError(errorMessages[response.reason] || response.reason || 'Failed to fetch identity data');
        setIdentityData(null);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch identity data');
      setIdentityData(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-sky-900">
      <div className="container mx-auto px-4 py-8 md:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
            {/* Left side - Input */}
            <div className="space-y-6">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white tracking-wide mb-4">
                  Base Onchain Identity
                </h1>
                <p className="text-lg text-gray-300">
                  Generate a shareable identity card for any Base address.
                </p>
              </div>
              
              <AddressInput
                value={wallet}
                onChange={setWallet}
                onSubmit={handleSubmit}
                loading={loading}
                error={error}
              />
            </div>

            {/* Right side - Card */}
            <div>
              <IdentityCard
                identityStats={identityData?.identityStats || null}
                tokenSummary={identityData?.tokenSummary || null}
                nftSummary={identityData?.nftSummary || null}
                ens={identityData?.ens || null}
                baseName={identityData?.baseName || null}
                tokens={identityData?.tokens || null}
                nfts={identityData?.nfts || null}
                rank={identityData?.rank || null}
                badges={identityData?.badges || null}
                timeline={identityData?.timeline || null}
                xp={identityData?.xp || null}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;

