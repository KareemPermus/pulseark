import React from 'react';
import { FiMessageCircle } from 'react-icons/fi';

export default function SupportFab() {
  return (
    <button
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-lime-500 hover:bg-lime-600 text-white shadow-lg flex items-center justify-center transition-colors"
      title="Support"
    >
      <FiMessageCircle className="w-6 h-6" />
    </button>
  );
}