import { useState } from 'react';

export default function AddressInput({ value, onChange, onSubmit, loading, error }) {
  const [localError, setLocalError] = useState(null);

  const validateAddress = (addr) => {
    if (!addr) {
      return "Address is required";
    }
    if (!addr.startsWith("0x")) {
      return "Address must start with 0x";
    }
    if (addr.length !== 42) {
      return "Address must be 42 characters long";
    }
    return null;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationError = validateAddress(value);
    if (validationError) {
      setLocalError(validationError);
      return;
    }
    setLocalError(null);
    onSubmit();
  };

  const displayError = error || localError;

  return (
    <div className="w-full">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="address" className="block text-sm font-medium text-gray-300 mb-2">
            Enter Base wallet address
          </label>
          <input
            id="address"
            type="text"
            value={value}
            onChange={(e) => {
              onChange(e.target.value);
              setLocalError(null);
            }}
            placeholder="0x..."
            disabled={loading}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          />
          <p className="mt-2 text-xs text-gray-400">
            Paste any Base mainnet address to generate an onchain identity card.
          </p>
        </div>
        
        {displayError && (
          <div className="p-3 bg-red-500/20 border border-red-500/40 rounded-lg text-red-300 text-sm">
            {displayError}
          </div>
        )}
        
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-600/50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          {loading ? "Generating..." : "Generate Identity"}
        </button>
      </form>
    </div>
  );
}

