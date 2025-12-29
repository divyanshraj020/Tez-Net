
import React, { useState, useEffect, useCallback, useRef } from 'react';
import SpiralVisual from './components/SpiralVisual';
import StatCard from './components/StatCard';
import HistoryList from './components/HistoryList';
import { TestStage, TestResults, HistoryItem, IPInfo } from './types';
import { startSpeedTest, getIpInfo } from './services/SpeedTestEngine';

const App: React.FC = () => {
  const [stage, setStage] = useState<TestStage>('idle');
  const [currentValue, setCurrentValue] = useState(0);
  const [results, setResults] = useState<TestResults>({
    ping: 0,
    jitter: 0,
    download: 0,
    upload: 0,
    timestamp: 0,
  });
  
  // Use a ref to keep track of the results as they are built to avoid stale closures
  const currentResultsRef = useRef<TestResults>({
    ping: 0,
    jitter: 0,
    download: 0,
    upload: 0,
    timestamp: 0,
  });

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [ipInfo, setIpInfo] = useState<IPInfo | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Load history from localStorage
    const saved = localStorage.getItem('teznet_history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to load history", e);
      }
    }

    // Fetch network details (ISP, IP)
    const fetchIp = async () => {
      const info = await getIpInfo();
      setIpInfo(info);
    };
    fetchIp();
  }, []);

  const saveToHistory = useCallback((newResult: TestResults) => {
    const item: HistoryItem = {
      ...newResult,
      id: Math.random().toString(36).substr(2, 9),
    };
    setHistory(prev => {
      const updated = [item, ...prev].slice(0, 10);
      localStorage.setItem('teznet_history', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const handleStartTest = async () => {
    if (stage !== 'idle' && stage !== 'completed') return;
    
    // Reset state
    const initialResults = { ping: 0, jitter: 0, download: 0, upload: 0, timestamp: Date.now() };
    setResults(initialResults);
    currentResultsRef.current = initialResults;
    setStage('ping');
    setCurrentValue(0);
    setErrorMessage('');

    try {
      await startSpeedTest({
        onPing: (p, j) => {
          currentResultsRef.current = { ...currentResultsRef.current, ping: p, jitter: j };
          setResults(prev => ({ ...prev, ping: p, jitter: j }));
          setStage('download');
        },
        onDownloadProgress: (speed) => {
          setCurrentValue(speed);
          setResults(prev => ({ ...prev, download: speed }));
        },
        onDownloadComplete: (finalSpeed) => {
          currentResultsRef.current = { ...currentResultsRef.current, download: finalSpeed };
          setResults(prev => ({ ...prev, download: finalSpeed }));
          setStage('upload');
          setCurrentValue(0);
        },
        onUploadProgress: (speed) => {
          setCurrentValue(speed);
          setResults(prev => ({ ...prev, upload: speed }));
        },
        onUploadComplete: (finalSpeed) => {
          const finalData = { ...currentResultsRef.current, upload: finalSpeed, timestamp: Date.now() };
          setResults(finalData);
          saveToHistory(finalData);
          setStage('completed');
          setCurrentValue(0);
        }
      });
    } catch (err: any) {
      setStage('idle');
      setCurrentValue(0);
      setErrorMessage('Speed test failed. Please check your connection.');
    }
  };

  const shareResults = () => {
    const text = `🚀 Tez Net - Internet ki sahi raftaar:\nDownload: ${results.download.toFixed(1)} Mbps\nUpload: ${results.upload.toFixed(1)} Mbps\nPing: ${results.ping} ms`;
    if (navigator.share) {
      navigator.share({ title: 'Tez Net Results', text, url: window.location.href });
    } else {
      navigator.clipboard.writeText(text);
      alert('Results copied to clipboard!');
    }
  };

  return (
    <div className="flex flex-col items-center justify-start min-h-screen px-4 py-8 md:py-12">
      <header className="w-full max-w-5xl flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 orange-bg rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/20">
            <i className="fas fa-gauge-high text-white text-2xl"></i>
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">TEZ NET</h1>
            <p className="text-[10px] text-teal-400 font-bold uppercase tracking-widest -mt-1">Internet ki sahi raftaar</p>
          </div>
        </div>
        <button 
          onClick={() => setShowHistory(!showHistory)}
          className="glass hover:bg-white/10 text-white px-5 py-2.5 rounded-full transition-all flex items-center gap-2 border border-teal-500/30"
        >
          <i className="fas fa-history text-teal-400"></i>
          <span className="hidden sm:inline">Records</span>
        </button>
      </header>

      <main className="w-full max-w-5xl flex flex-col items-center">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 w-full items-center mb-12">
          
          <div className="flex flex-col items-center justify-center relative">
            <SpiralVisual value={currentValue} stage={stage} />
            <div className="mt-8 flex flex-col items-center w-full">
              {stage === 'idle' || stage === 'completed' ? (
                <button
                  onClick={handleStartTest}
                  className="orange-bg hover:brightness-110 text-white font-black px-16 py-5 rounded-2xl text-2xl shadow-2xl shadow-orange-600/40 transform hover:scale-105 active:scale-95 transition-all duration-300 w-full max-w-xs"
                >
                  {stage === 'completed' ? 'RE-TEST' : 'START TEST'}
                </button>
              ) : (
                <div className="flex flex-col items-center">
                  <div className="orange-text font-mono text-xl animate-pulse uppercase tracking-[0.3em] font-black">
                    {stage}...
                  </div>
                </div>
              )}
              
              {errorMessage && (
                <p className="mt-4 text-orange-400 text-sm font-medium animate-pulse">{errorMessage}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 h-fit">
            <StatCard label="Ping" value={results.ping} unit="ms" icon="fa-clock" active={stage === 'ping'} />
            <StatCard label="Jitter" value={results.jitter} unit="ms" icon="fa-bolt-lightning" active={stage === 'ping'} />
            <StatCard label="Download" value={results.download} unit="Mbps" icon="fa-arrow-down" accent active={stage === 'download'} />
            <StatCard label="Upload" value={results.upload} unit="Mbps" icon="fa-arrow-up" accent active={stage === 'upload'} />
            
            {/* IP & ISP Info Section */}
            <div className="col-span-2 glass rounded-2xl p-6 mt-2 border-teal-500/20">
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center border-b border-teal-500/10 pb-3">
                  <div className="flex flex-col">
                    <span className="text-teal-400/60 text-[10px] font-black uppercase tracking-widest">Your IP Address</span>
                    <span className="text-white text-base font-mono font-bold">{ipInfo?.ip || 'Detecting IP...'}</span>
                  </div>
                  <i className="fas fa-network-wired text-teal-500/30 text-xl"></i>
                </div>
                <div className="flex justify-between items-center">
                  <div className="flex flex-col">
                    <span className="text-teal-400/60 text-[10px] font-black uppercase tracking-widest">Service Provider</span>
                    <span className="text-white text-sm font-bold truncate max-w-[200px]">{ipInfo?.org || 'Fetching ISP...'}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-teal-400/60 text-[10px] font-black uppercase tracking-widest">Region</span>
                    <span className="text-white text-sm font-bold">{ipInfo?.city ? `${ipInfo.city}, ${ipInfo.country_name}` : 'Scanning...'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            {stage === 'completed' && (
              <button 
                onClick={shareResults}
                className="col-span-2 mt-2 orange-text hover:text-white transition-colors flex items-center justify-center gap-2 text-xs font-black tracking-widest uppercase py-2 bg-orange-500/5 rounded-xl border border-orange-500/20"
              >
                <i className="fas fa-share-nodes"></i>
                Share My Raftaar
              </button>
            )}
          </div>
        </div>

        {showHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-teal-950/80 backdrop-blur-md">
            <div className="glass w-full max-w-2xl rounded-[2.5rem] p-8 max-h-[80vh] overflow-hidden flex flex-col border-teal-500/40">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black uppercase italic tracking-tighter">Your Records</h2>
                <button onClick={() => setShowHistory(false)} className="text-teal-400 hover:text-white p-2">
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>
              <HistoryList history={history} />
            </div>
          </div>
        )}
      </main>

      <footer className="mt-auto py-8 text-teal-600/60 text-[10px] tracking-[0.4em] uppercase font-black text-center">
        Tez Net v2.0 • Created by Divyansh Raj
      </footer>
    </div>
  );
};

export default App;
