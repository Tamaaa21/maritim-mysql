"use client";

import { X } from "lucide-react";
import { motion } from "framer-motion";

interface PrakiraanModalProps {
  isOpen: boolean;
  onClose: () => void;
  data?: {
    title: string;
    desc: string;
    image: string;
    details?: {
      label: string;
      value: string;
    }[];
    explanation?: string;
    lastUpdated?: string;
  };
}

export default function PrakiraanModal({ isOpen, onClose, data }: PrakiraanModalProps) {
  if (!isOpen || !data) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[85vh] overflow-hidden flex flex-col lg:flex-row"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/80 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all"
        >
          <X size={20} className="text-gray-700" />
        </button>

        {/* Left Side - Image (50%) */}
        <div className="lg:w-1/2 w-full h-64 lg:h-auto relative overflow-hidden bg-gray-100">
          <img src={data.image} alt={data.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
            <h3 className="text-xl font-bold">{data.title}</h3>
          </div>
        </div>

        {/* Right Side - Details (50%) */}
        <div className="lg:w-1/2 w-full overflow-y-auto flex flex-col">
          <div className="flex-1 p-6 space-y-6">
            {/* Header */}
            <div>
              <h2 className="text-2xl font-bold text-gray-900">{data.title}</h2>
            </div>

            {/* Details Grid */}
            <div className="space-y-4">
              <h3 className="text-base font-bold text-gray-900">Parameter Cuaca</h3>
              <div className="grid grid-cols-2 gap-3">
                {(data.details || []).map((item, i) => (
                  <div key={i} className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3">
                    <p className="text-xs text-gray-600 font-medium mb-1">{item.label}</p>
                    <p className="text-lg font-bold text-[#003399]">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Explanation */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-2 text-sm">Penjelasan Detail</h4>
              <p className="text-gray-700 text-sm leading-relaxed">
                {data.explanation || data.desc || 'Penjelasan belum tersedia.'}
              </p>
            </div>

            {/* Last Updated */}
            <div className="text-xs text-gray-500 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Update terakhir: {data.lastUpdated}
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="border-t bg-gray-50 px-6 py-4 flex gap-3">
            <a
              href="#"
              className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-white transition-colors text-center text-sm"
            >
              Bagikan
            </a>
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-[#003399] hover:bg-[#0044cc] text-white font-semibold rounded-lg transition-colors text-sm"
            >
              Tutup
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
