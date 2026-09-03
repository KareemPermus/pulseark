import React from 'react';
import { motion } from 'framer-motion';
import { IconType } from 'react-icons';

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: IconType;
  color: string;
  bgColor: string;
}

export default function KpiCard({ label, value, icon: Icon, color, bgColor }: KpiCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between"
    >
      <div>
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-2xl font-extrabold mt-1">{value}</p>
      </div>
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center`} style={{ backgroundColor: bgColor }}>
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
    </motion.div>
  );
}