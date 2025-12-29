
import React from 'react';

interface StatCardProps {
  label: string;
  value: number;
  unit: string;
  icon: string;
  accent?: boolean;
  active?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, unit, icon, accent, active }) => {
  return (
    <div className={`glass p-6 rounded-2xl flex flex-col transition-all duration-500 border-2 ${active ? 'border-orange-500/50 scale-[1.02] bg-teal-900/20' : 'border-transparent'}`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${active ? 'orange-bg text-white shadow-[0_0_10px_rgba(249,115,22,0.4)]' : 'bg-teal-900/40 text-teal-400'}`}>
          <i className={`fas ${icon}`}></i>
        </div>
        <span className="text-teal-400/80 text-[10px] font-black tracking-widest uppercase">{label}</span>
      </div>
      
      <div className="flex items-baseline gap-1">
        <span className="text-3xl font-black text-white tracking-tighter italic">
          {value === 0 ? '--' : (unit === 'ms' ? Math.round(value) : value.toFixed(1))}
        </span>
        <span className="text-teal-600 text-[10px] font-black uppercase tracking-wider">{unit}</span>
      </div>
      
      {active && (
        <div className="mt-4 w-full bg-teal-900/50 h-1.5 rounded-full overflow-hidden">
          <div className="orange-bg h-full w-full animate-progress-flow"></div>
        </div>
      )}
      
      <style>{`
        @keyframes progress-flow {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-progress-flow {
          animation: progress-flow 1.2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
};

export default StatCard;
