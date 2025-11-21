import { useEffect, useRef } from 'react';
import QRCode from 'qrcode';

export default function QRCodeModal({ isOpen, onClose, address, baseScanUrl }) {
  const canvasRef = useRef(null);
  const qrData = baseScanUrl || address;

  useEffect(() => {
    if (isOpen && canvasRef.current && qrData) {
      QRCode.toCanvas(canvasRef.current, qrData, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      }).catch(err => {
        console.error('QR code generation failed:', err);
      });
    }
  }, [isOpen, qrData]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="bg-slate-800 rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-white">QR Code</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-200 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-white p-4 rounded-lg">
            <canvas ref={canvasRef} className="w-full h-auto" />
          </div>
          
          <div className="text-center">
            <p className="text-sm text-gray-400 font-mono break-all">
              {qrData}
            </p>
          </div>
          
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

