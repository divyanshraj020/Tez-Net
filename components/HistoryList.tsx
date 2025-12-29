
import React from 'react';
import { HistoryItem } from '../types';

interface HistoryListProps {
  history: HistoryItem[];
}

const HistoryList: React.FC<HistoryListProps> = ({ history }) => {
  if (history.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center text-teal-700/50">
        <i className="fas fa-box-open text-4xl mb-4 opacity-20"></i>
        <p className="font-bold uppercase tracking-widest text-xs">No records found</p>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto pr-2">
      <div className="space-y-3">
        {history.map((item) => (
          <div key={item.id} className="bg-teal-900/10 hover:bg-teal-900/30 rounded-2xl p-4 transition-all duration-300 flex items-center justify-between border border-teal-500/10 hover:border-teal-500/30 group">
            <div className="flex flex-col">
              <span className="text-[10px] text-teal-600 font-black uppercase tracking-widest mb-1">
                {new Date(item.timestamp).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
              </span>
              <div className="flex gap-4">
                <div className="flex items-center gap-2">
                  <i className="fas fa-arrow-down text-[10px] text-teal-400"></i>
                  <span className="text-lg font-black text-white italic">{item.download.toFixed(1)} <span className="text-[10px] not-italic text-teal-600">Mbps</span></span>
                </div>
                <div className="flex items-center gap-2">
                  <i className="fas fa-arrow-up text-[10px] text-orange-400"></i>
                  <span className="text-lg font-black text-white italic">{item.upload.toFixed(1)} <span className="text-[10px] not-italic text-teal-600">Mbps</span></span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-6 text-[10px] font-black uppercase tracking-widest">
              <div className="flex flex-col items-end">
                <span className="text-teal-600/60">Ping</span>
                <span className="text-white group-hover:text-orange-400 transition-colors">{Math.round(item.ping)}ms</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-teal-600/60">Jitter</span>
                <span className="text-white group-hover:text-orange-400 transition-colors">{Math.round(item.jitter)}ms</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryList;
